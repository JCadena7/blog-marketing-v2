import { mockComments, type Comment } from '../data/mockComments';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';
import type { CommentBackend, CommentsPaginatedResponse } from '../types';

let commentsStore: Comment[] = [...mockComments];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ==================== TRANSFORMERS ====================

/**
 * Transforma un comentario del backend (snake_case) al formato del frontend (camelCase)
 */
function transformCommentFromBackend(backendComment: CommentBackend): Comment {
  // Crear objeto author usando datos del backend si están disponibles
  const author = backendComment.usuario ? {
    id: backendComment.usuario.id,
    name: `${backendComment.usuario.first_name} ${backendComment.usuario.last_name}`.trim() || backendComment.usuario.username,
    email: backendComment.usuario.email,
    avatar: backendComment.usuario.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(backendComment.usuario.username)}&background=3B82F6&color=fff`,
    username: backendComment.usuario.username,
    firstName: backendComment.usuario.first_name,
    lastName: backendComment.usuario.last_name
  } : {
    id: backendComment.usuario_id,
    name: `Usuario ${backendComment.usuario_id}`,
    email: '',
    avatar: `https://ui-avatars.com/api/?name=Usuario+${backendComment.usuario_id}&background=3B82F6&color=fff`
  };

  return {
    id: backendComment.id,
    content: backendComment.contenido,
    postId: backendComment.post_id,
    authorId: backendComment.usuario_id,
    author: author,
    status: backendComment.status,
    parentId: backendComment.parent_id,
    likes: backendComment.likes,
    isEdited: backendComment.is_edited,
    editedAt: backendComment.edited_at,
    moderatedBy: backendComment.moderated_by,
    moderatedAt: backendComment.moderated_at,
    moderationNotes: backendComment.moderation_notes,
    createdAt: backendComment.created_at,
    updatedAt: backendComment.updated_at,
    depth: backendComment.depth,
    path: backendComment.path,
    // Transformar replies recursivamente si existen
    replies: backendComment.replies?.map(transformCommentFromBackend) || []
  };
}

/**
 * Transforma un comentario del frontend (camelCase) al formato del backend (snake_case)
 */
function transformCommentToBackend(comment: Partial<Comment>): Partial<CommentBackend> {
  const backendData: any = {};
  
  if (comment.content !== undefined) backendData.contenido = comment.content;
  if (comment.postId !== undefined) backendData.post_id = comment.postId;
  if (comment.authorId !== undefined) backendData.usuario_id = comment.authorId;
  if (comment.parentId !== undefined) backendData.parent_id = comment.parentId;
  if (comment.status !== undefined) backendData.status = comment.status;
  
  return backendData;
}

// ==================== MOCK DATA LAYER ====================

async function getAllCommentsMock(): Promise<Comment[]> {
  await delay(200);
  return [...commentsStore];
}

async function updateCommentStatusMock(
  commentId: number,
  newStatus: Comment['status'],
  notes?: string
): Promise<Comment | null> {
  await delay(150);
  const idx = commentsStore.findIndex((c) => c.id === commentId);
  if (idx === -1) return null;
  commentsStore[idx] = {
    ...commentsStore[idx],
    status: newStatus,
    moderatedAt: new Date().toISOString(),
    moderationNotes: notes,
  };
  return commentsStore[idx];
}

async function deleteCommentMock(commentId: number): Promise<boolean> {
  await delay(150);
  const before = commentsStore.length;
  commentsStore = commentsStore.filter((c) => c.id !== commentId);
  return commentsStore.length < before;
}

async function createCommentMock(commentData: Partial<Comment>): Promise<Comment> {
  await delay(800);
  
  const newComment: Comment = {
    id: Date.now(),
    postId: commentData.postId || '',
    postTitle: commentData.postTitle || '',
    authorId: commentData.authorId || 0,
    author: commentData.author || {
      id: 0,
      name: 'Usuario Anónimo',
      email: '',
      avatar: ''
    },
    content: commentData.content || '',
    status: 'pending',
    parentId: commentData.parentId,
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  commentsStore.push(newComment);
  return newComment;
}

async function likeCommentMock(commentId: number): Promise<boolean> {
  await delay(200);
  const idx = commentsStore.findIndex((c) => c.id === commentId);
  if (idx === -1) return false;
  
  commentsStore[idx] = { 
    ...commentsStore[idx], 
    likes: commentsStore[idx].likes + 1,
    updatedAt: new Date().toISOString()
  };
  return true;
}

async function reportCommentMock(commentId: number, reportData: { reason: string; description?: string }): Promise<boolean> {
  await delay(500);
  
  // In a real app, this would create a report record
  console.log('Comment reported:', { commentId, ...reportData });
  
  return true;
}

// ==================== API DATA LAYER ====================

async function getAllCommentsApi(): Promise<Comment[]> {
  try {
    const query = new URLSearchParams();
    query.append('withUser', 'true');
    // query.append('withReplies', 'true');
    const response = await apiClient.get<CommentsPaginatedResponse>(
      `${API_CONFIG.ENDPOINTS.COMMENTS as string}?${query.toString()}`
    );
    return response.items.map(transformCommentFromBackend);
  } catch (error) {
    console.error('Error fetching comments from API:', error);
    return [];
  }
}

async function updateCommentStatusApi(
  commentId: number,
  newStatus: Comment['status'],
  notes?: string
): Promise<Comment | null> {
  try {
    const backendComment = await apiClient.patch<CommentBackend>(
      (API_CONFIG.ENDPOINTS.MODERATE_COMMENT as (id: number) => string)(commentId),
      { status: newStatus, moderation_notes: notes }
    );
    return transformCommentFromBackend(backendComment);
  } catch (error) {
    console.error('Error updating comment status via API:', error);
    return null;
  }
}

async function deleteCommentApi(commentId: number): Promise<boolean> {
  try {
    await apiClient.delete((API_CONFIG.ENDPOINTS.COMMENT_BY_ID as (id: number) => string)(commentId));
    return true;
  } catch (error) {
    console.error('Error deleting comment via API:', error);
    return false;
  }
}

async function createCommentApi(commentData: Partial<Comment>): Promise<Comment> {
  try {
    const backendData = transformCommentToBackend(commentData);
    const backendComment = await apiClient.post<CommentBackend>(
      API_CONFIG.ENDPOINTS.COMMENTS as string,
      backendData
    );
    return transformCommentFromBackend(backendComment);
  } catch (error) {
    console.error('Error creating comment via API:', error);
    throw error;
  }
}

async function likeCommentApi(commentId: number): Promise<boolean> {
  try {
    await apiClient.post(`${(API_CONFIG.ENDPOINTS.COMMENT_BY_ID as (id: number) => string)(commentId)}/like`, {});
    return true;
  } catch (error) {
    console.error('Error liking comment via API:', error);
    return false;
  }
}

async function reportCommentApi(commentId: number, reportData: { reason: string; description?: string }): Promise<boolean> {
  try {
    await apiClient.post(`${(API_CONFIG.ENDPOINTS.COMMENT_BY_ID as (id: number) => string)(commentId)}/report`, reportData);
    return true;
  } catch (error) {
    console.error('Error reporting comment via API:', error);
    return false;
  }
}

// ==================== PUBLIC API (Auto-switches between mock and real API) ====================

export async function getAllComments(): Promise<Comment[]> {
  return useRealApi() ? getAllCommentsApi() : getAllCommentsMock();
}

export async function updateCommentStatus(
  commentId: number,
  newStatus: Comment['status'],
  notes?: string
): Promise<Comment | null> {
  return useRealApi() ? updateCommentStatusApi(commentId, newStatus, notes) : updateCommentStatusMock(commentId, newStatus, notes);
}

export async function deleteComment(commentId: number): Promise<boolean> {
  return useRealApi() ? deleteCommentApi(commentId) : deleteCommentMock(commentId);
}

export async function createComment(commentData: Partial<Comment>): Promise<Comment> {
  return useRealApi() ? createCommentApi(commentData) : createCommentMock(commentData);
}

export async function likeComment(commentId: number): Promise<boolean> {
  return useRealApi() ? likeCommentApi(commentId) : likeCommentMock(commentId);
}

export async function reportComment(commentId: number, reportData: { reason: string; description?: string }): Promise<boolean> {
  return useRealApi() ? reportCommentApi(commentId, reportData) : reportCommentMock(commentId, reportData);
}

export function getPendingComments(): Comment[] {
  return commentsStore.filter((c) => c.status === 'pending');
}

export function getCommentsByPost(postId: string | number): Comment[] {
  return commentsStore.filter((c) => c.postId === postId);
}

/**
 * Obtener comentarios de un post específico con opciones de query
 * @param postId - ID del post
 * @param options - Opciones de consulta (withUser, withReplies, page, limit)
 */
export async function getCommentsByPostId(
  postId: number,
  options: {
    withUser?: boolean;
    withReplies?: boolean;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ comments: Comment[]; total: number; page: number; pages: number }> {
  const { withUser = true, withReplies = true, page = 1, limit = 10 } = options;
  
  if (!useRealApi()) {
    const filtered = commentsStore.filter((c) => c.postId === postId);
    return {
      comments: filtered,
      total: filtered.length,
      page: 1,
      pages: 1
    };
  }
  
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('withUser', withUser.toString());
    queryParams.append('withReplies', withReplies.toString());
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    const response = await apiClient.get<CommentsPaginatedResponse>(
      `${(API_CONFIG.ENDPOINTS.COMMENTS_BY_POST as (id: number) => string)(postId)}?${queryParams.toString()}`
    );
    
    return {
      comments: response.items.map(transformCommentFromBackend),
      total: response.total,
      page: response.page,
      pages: response.pages
    };
  } catch (error) {
    console.error('Error fetching comments by post:', error);
    return {
      comments: [],
      total: 0,
      page: 1,
      pages: 0
    };
  }
}

// ==================== ENDPOINTS AVANZADOS DEL BACKEND ====================

/**
 * Obtener estadísticas generales de comentarios
 */
export async function getCommentsStats(): Promise<any> {
  if (!useRealApi()) {
    return {
      total: commentsStore.length,
      approved: commentsStore.filter(c => c.status === 'approved').length,
      pending: commentsStore.filter(c => c.status === 'pending').length,
      spam: commentsStore.filter(c => c.status === 'spam').length
    };
  }
  
  try {
    const stats = await apiClient.get(
      API_CONFIG.ENDPOINTS.COMMENTS_STATS_GENERAL as string
    );
    return stats;
  } catch (error) {
    console.error('Error fetching comments stats:', error);
    return {};
  }
}

/**
 * Obtener posts más comentados
 */
export async function getTopCommentedPosts(limit: number = 10): Promise<any[]> {
  if (!useRealApi()) return [];
  
  try {
    const posts = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.COMMENTS_STATS_TOP_COMMENTED as string}?limit=${limit}`
    );
    return posts as any[];
  } catch (error) {
    console.error('Error fetching top commented posts:', error);
    return [];
  }
}

/**
 * Obtener usuarios más activos en comentarios
 */
export async function getMostActiveCommenters(limit: number = 10): Promise<any[]> {
  if (!useRealApi()) return [];
  
  try {
    const users = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.COMMENTS_STATS_MOST_ACTIVE as string}?limit=${limit}`
    );
    return users as any[];
  } catch (error) {
    console.error('Error fetching most active commenters:', error);
    return [];
  }
}

/**
 * Obtener respuestas de un comentario
 */
export async function getCommentReplies(commentId: number): Promise<Comment[]> {
  if (!useRealApi()) {
    return commentsStore.filter(c => c.parentId === commentId);
  }
  
  try {
    const backendReplies = await apiClient.get<CommentBackend[]>(
      (API_CONFIG.ENDPOINTS.COMMENT_REPLIES as (id: number) => string)(commentId)
    );
    return backendReplies.map(transformCommentFromBackend);
  } catch (error) {
    console.error('Error fetching comment replies:', error);
    return [];
  }
}
