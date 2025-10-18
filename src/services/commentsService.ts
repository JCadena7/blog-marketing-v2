import { mockComments, type Comment } from '../data/mockComments';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

let commentsStore: Comment[] = [...mockComments];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
    const comments = await apiClient.get<Comment[]>(API_CONFIG.ENDPOINTS.COMMENTS);
    return comments;
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
    const comment = await apiClient.patch<Comment>(
      API_CONFIG.ENDPOINTS.MODERATE_COMMENT(commentId),
      { status: newStatus, notes }
    );
    return comment;
  } catch (error) {
    console.error('Error updating comment status via API:', error);
    return null;
  }
}

async function deleteCommentApi(commentId: number): Promise<boolean> {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.COMMENT_BY_ID(commentId));
    return true;
  } catch (error) {
    console.error('Error deleting comment via API:', error);
    return false;
  }
}

async function createCommentApi(commentData: Partial<Comment>): Promise<Comment> {
  try {
    const comment = await apiClient.post<Comment>(
      API_CONFIG.ENDPOINTS.COMMENTS,
      commentData
    );
    return comment;
  } catch (error) {
    console.error('Error creating comment via API:', error);
    throw error;
  }
}

async function likeCommentApi(commentId: number): Promise<boolean> {
  try {
    await apiClient.post(`${API_CONFIG.ENDPOINTS.COMMENT_BY_ID(commentId)}/like`, {});
    return true;
  } catch (error) {
    console.error('Error liking comment via API:', error);
    return false;
  }
}

async function reportCommentApi(commentId: number, reportData: { reason: string; description?: string }): Promise<boolean> {
  try {
    await apiClient.post(`${API_CONFIG.ENDPOINTS.COMMENT_BY_ID(commentId)}/report`, reportData);
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
