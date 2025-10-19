import { mockPosts, type Post } from '../data/mockPosts';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

// In-memory store for mockup purposes
let postsStore: Post[] = [...mockPosts];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ==================== MOCK DATA LAYER ====================

async function getAllPostsMock(): Promise<Post[]> {
  await delay(250);
  return [...postsStore];
}

async function updatePostStatusMock(
  postId: number,
  newStatus: Post['status']
): Promise<Post | null> {
  await delay(200);
  const idx = postsStore.findIndex((p) => p.id === postId);
  if (idx === -1) return null;
  postsStore[idx] = { ...postsStore[idx], status: newStatus, updatedAt: new Date().toISOString() };
  return postsStore[idx];
}

async function deletePostMock(postId: number): Promise<boolean> {
  await delay(150);
  const before = postsStore.length;
  postsStore = postsStore.filter((p) => p.id !== postId);
  return postsStore.length < before;
}

async function bulkActionMock(
  ids: number[],
  action: 'publish' | 'draft' | 'delete'
): Promise<void> {
  await delay(250);
  if (action === 'delete') {
    postsStore = postsStore.filter((p) => !ids.includes(p.id));
    return;
  }
  const status: Post['status'] = action === 'publish' ? 'published' : 'draft';
  postsStore = postsStore.map((p) => (ids.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p));
}

// ==================== API DATA LAYER ====================

async function getAllPostsApi(): Promise<Post[]> {
  try {
    const posts = await apiClient.get<Post[]>(API_CONFIG.ENDPOINTS.POSTS);
    return posts;
  } catch (error) {
    console.error('Error fetching posts from API:', error);
    return [];
  }
}

async function updatePostStatusApi(
  postId: number,
  newStatus: Post['status']
): Promise<Post | null> {
  try {
    const post = await apiClient.patch<Post>(
      API_CONFIG.ENDPOINTS.UPDATE_POST_STATUS(postId),
      { status: newStatus }
    );
    return post;
  } catch (error) {
    console.error('Error updating post status via API:', error);
    return null;
  }
}

async function deletePostApi(postId: number): Promise<boolean> {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.POST_BY_ID(postId));
    return true;
  } catch (error) {
    console.error('Error deleting post via API:', error);
    return false;
  }
}

async function bulkActionApi(
  ids: number[],
  action: 'publish' | 'draft' | 'delete'
): Promise<void> {
  try {
    await apiClient.post(`${API_CONFIG.ENDPOINTS.POSTS}/bulk`, {
      ids,
      action
    });
  } catch (error) {
    console.error('Error performing bulk action via API:', error);
    throw error;
  }
}

// ==================== PUBLIC API (Auto-switches between mock and real API) ====================

export async function getAllPosts(): Promise<Post[]> {
  return useRealApi() ? getAllPostsApi() : getAllPostsMock();
}

export async function updatePostStatus(
  postId: number,
  newStatus: Post['status']
): Promise<Post | null> {
  return useRealApi() ? updatePostStatusApi(postId, newStatus) : updatePostStatusMock(postId, newStatus);
}

export async function deletePost(postId: number): Promise<boolean> {
  return useRealApi() ? deletePostApi(postId) : deletePostMock(postId);
}

export async function bulkAction(
  ids: number[],
  action: 'publish' | 'draft' | 'delete'
): Promise<void> {
  return useRealApi() ? bulkActionApi(ids, action) : bulkActionMock(ids, action);
}

// Helper used by sidebar badges, etc.
export function getPendingPosts(): Post[] {
  return postsStore.filter((p) => p.status === 'pending');
}

// ==================== ENDPOINTS AVANZADOS DEL BACKEND ====================

/**
 * Obtener posts completos con todas las relaciones
 */
export async function getPostsCompletos(limit: number = 20): Promise<Post[]> {
  if (!useRealApi()) return getAllPostsMock();
  
  try {
    const posts = await apiClient.get<Post[]>(
      `${API_CONFIG.ENDPOINTS.POSTS_COMPLETOS}?limit=${limit}`
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts completos:', error);
    return [];
  }
}

/**
 * Obtener posts populares (más vistas)
 */
export async function getPostsPopulares(limit: number = 10): Promise<Post[]> {
  if (!useRealApi()) {
    // Mock: ordenar por vistas
    return [...postsStore]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }
  
  try {
    const posts = await apiClient.get<Post[]>(
      `${API_CONFIG.ENDPOINTS.POSTS_POPULARES}?limit=${limit}`
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts populares:', error);
    return [];
  }
}

/**
 * Obtener posts en tendencia
 */
export async function getPostsTrending(limit: number = 10): Promise<Post[]> {
  if (!useRealApi()) return getPostsPopulares(limit);
  
  try {
    const posts = await apiClient.get<Post[]>(
      `${API_CONFIG.ENDPOINTS.POSTS_TRENDING}?limit=${limit}`
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts trending:', error);
    return [];
  }
}

/**
 * Obtener posts con engagement
 */
export async function getPostsConEngagement(limit: number = 20): Promise<Post[]> {
  if (!useRealApi()) return getAllPostsMock();
  
  try {
    const posts = await apiClient.get<Post[]>(
      `${API_CONFIG.ENDPOINTS.POSTS_ENGAGEMENT}?limit=${limit}`
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts con engagement:', error);
    return [];
  }
}

/**
 * Obtener posts sin comentarios
 */
export async function getPostsSinComentarios(): Promise<Post[]> {
  if (!useRealApi()) {
    return postsStore.filter(p => (p.comments || 0) === 0);
  }
  
  try {
    const posts = await apiClient.get<Post[]>(
      API_CONFIG.ENDPOINTS.POSTS_SIN_COMENTARIOS
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts sin comentarios:', error);
    return [];
  }
}

/**
 * Obtener posts más compartidos
 */
export async function getPostsMasCompartidos(limit: number = 10): Promise<Post[]> {
  if (!useRealApi()) return getPostsPopulares(limit);
  
  try {
    const posts = await apiClient.get<Post[]>(
      `${API_CONFIG.ENDPOINTS.POSTS_MAS_COMPARTIDOS}?limit=${limit}`
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts más compartidos:', error);
    return [];
  }
}

/**
 * Obtener borradores antiguos
 */
export async function getBorradoresAntiguos(): Promise<Post[]> {
  if (!useRealApi()) {
    return postsStore.filter(p => p.status === 'draft');
  }
  
  try {
    const posts = await apiClient.get<Post[]>(
      API_CONFIG.ENDPOINTS.POSTS_BORRADORES_ANTIGUOS
    );
    return posts;
  } catch (error) {
    console.error('Error fetching borradores antiguos:', error);
    return [];
  }
}

/**
 * Obtener estadísticas por mes
 */
export async function getEstadisticasPorMes(meses: number = 12): Promise<any> {
  if (!useRealApi()) return { data: [] };
  
  try {
    const stats = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.POSTS_STATS_POR_MES}?meses=${meses}`
    );
    return stats;
  } catch (error) {
    console.error('Error fetching estadísticas por mes:', error);
    return { data: [] };
  }
}

/**
 * Obtener mejor rendimiento por autor
 */
export async function getMejorRendimientoPorAutor(
  autorId: number,
  limit: number = 5
): Promise<Post[]> {
  if (!useRealApi()) {
    return postsStore.filter(p => p.authorId === autorId).slice(0, limit);
  }
  
  try {
    const posts = await apiClient.get<Post[]>(
      `${API_CONFIG.ENDPOINTS.POSTS_STATS_MEJOR_RENDIMIENTO(autorId)}?limit=${limit}`
    );
    return posts;
  } catch (error) {
    console.error('Error fetching mejor rendimiento por autor:', error);
    return [];
  }
}

/**
 * Obtener overview del dashboard
 */
export async function getDashboardOverview(): Promise<any> {
  if (!useRealApi()) {
    return {
      totalPosts: postsStore.length,
      published: postsStore.filter(p => p.status === 'published').length,
      draft: postsStore.filter(p => p.status === 'draft').length,
      pending: postsStore.filter(p => p.status === 'pending').length
    };
  }
  
  try {
    const overview = await apiClient.get(
      API_CONFIG.ENDPOINTS.POSTS_STATS_DASHBOARD
    );
    return overview;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return {};
  }
}

/**
 * Incrementar vista de un post
 */
export async function incrementarVista(
  postId: number,
  userId?: number,
  ipAddress?: string
): Promise<boolean> {
  if (!useRealApi()) {
    const idx = postsStore.findIndex(p => p.id === postId);
    if (idx !== -1) {
      postsStore[idx] = {
        ...postsStore[idx],
        views: (postsStore[idx].views || 0) + 1
      };
      return true;
    }
    return false;
  }
  
  try {
    await apiClient.post(
      API_CONFIG.ENDPOINTS.POST_INCREMENT_VISTA(postId),
      { userId, ipAddress }
    );
    return true;
  } catch (error) {
    console.error('Error incrementando vista:', error);
    return false;
  }
}

/**
 * Dar like a un post
 */
export async function darLike(postId: number, userId: number): Promise<boolean> {
  if (!useRealApi()) {
    const idx = postsStore.findIndex(p => p.id === postId);
    if (idx !== -1) {
      postsStore[idx] = {
        ...postsStore[idx],
        likes: (postsStore[idx].likes || 0) + 1
      };
      return true;
    }
    return false;
  }
  
  try {
    await apiClient.post(
      API_CONFIG.ENDPOINTS.POST_LIKE(postId),
      { userId }
    );
    return true;
  } catch (error) {
    console.error('Error dando like:', error);
    return false;
  }
}

/**
 * Quitar like de un post
 */
export async function quitarLike(postId: number, userId: number): Promise<boolean> {
  if (!useRealApi()) {
    const idx = postsStore.findIndex(p => p.id === postId);
    if (idx !== -1) {
      postsStore[idx] = {
        ...postsStore[idx],
        likes: Math.max(0, (postsStore[idx].likes || 0) - 1)
      };
      return true;
    }
    return false;
  }
  
  try {
    await apiClient.delete(
      API_CONFIG.ENDPOINTS.POST_LIKE(postId),
      { body: JSON.stringify({ userId }) } as any
    );
    return true;
  } catch (error) {
    console.error('Error quitando like:', error);
    return false;
  }
}

/**
 * Agregar categorías a un post
 */
export async function addCategoriasToPost(
  postId: number,
  categoriaIds: number[]
): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.post(
      API_CONFIG.ENDPOINTS.POST_ADD_CATEGORIAS(postId),
      { categoria_ids: categoriaIds }
    );
    return true;
  } catch (error) {
    console.error('Error agregando categorías:', error);
    return false;
  }
}

/**
 * Agregar keywords existentes a un post
 */
export async function addKeywordsToPost(
  postId: number,
  keywordIds: number[]
): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.post(
      API_CONFIG.ENDPOINTS.POST_KEYWORDS(postId),
      { keywordIds }
    );
    return true;
  } catch (error) {
    console.error('Error agregando keywords:', error);
    return false;
  }
}

/**
 * Crear y agregar nuevas keywords a un post
 */
export async function createAndAddKeywords(
  postId: number,
  keywords: string[]
): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.post(
      API_CONFIG.ENDPOINTS.POST_KEYWORDS_CREATE(postId),
      { keywords }
    );
    return true;
  } catch (error) {
    console.error('Error creando keywords:', error);
    return false;
  }
}

/**
 * Obtener keywords de un post
 */
export async function getPostKeywords(postId: number): Promise<any[]> {
  if (!useRealApi()) return [];
  
  try {
    const keywords = await apiClient.get(
      API_CONFIG.ENDPOINTS.POST_KEYWORDS(postId)
    );
    return keywords as any[];
  } catch (error) {
    console.error('Error obteniendo keywords:', error);
    return [];
  }
}

/**
 * Eliminar keywords de un post
 */
export async function removeKeywordsFromPost(
  postId: number,
  keywordIds?: number[]
): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete(
      API_CONFIG.ENDPOINTS.POST_KEYWORDS(postId),
      { body: JSON.stringify({ keywordIds }) } as any
    );
    return true;
  } catch (error) {
    console.error('Error eliminando keywords:', error);
    return false;
  }
}

/**
 * Buscar o crear keyword por nombre
 */
export async function findOrCreateKeyword(keyword: string): Promise<any> {
  if (!useRealApi()) return { id: 1, keyword };
  
  try {
    const result = await apiClient.post(
      API_CONFIG.ENDPOINTS.KEYWORDS_FIND_OR_CREATE,
      { keyword }
    );
    return result;
  } catch (error) {
    console.error('Error buscando/creando keyword:', error);
    return null;
  }
}

/**
 * Obtener keywords más usadas
 */
export async function getKeywordsMasUsadas(limit: number = 50): Promise<any[]> {
  if (!useRealApi()) return [];
  
  try {
    const keywords = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.KEYWORDS_MAS_USADAS}?limit=${limit}`
    );
    return keywords as any[];
  } catch (error) {
    console.error('Error obteniendo keywords más usadas:', error);
    return [];
  }
}
