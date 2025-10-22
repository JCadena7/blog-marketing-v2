import { mockPosts } from '../data/mockPosts';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';
import { type Post, type PostBackend, type PostStatus } from '../types';
import { getAllEstados, type Estado } from './estadosService';

// In-memory store for mockup purposes
let postsStore: Post[] = [...mockPosts];

// Cache de estados para evitar llamadas repetidas
let estadosCache: Estado[] | null = null;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ==================== TRANSFORMERS ====================

/**
 * Obtiene y cachea los estados del backend
 */
async function getEstadosMap(): Promise<Record<string, number>> {
  if (!estadosCache) {
    estadosCache = await getAllEstados();
    console.log('📋 Estados obtenidos del backend:', estadosCache);
  }
  
  const map: Record<string, number> = {};
  estadosCache.forEach(estado => {
    const nombre = estado.nombre.toLowerCase();
    // Mapeo exacto según los estados del backend:
    // 1: borrador
    // 2: en_revision (pending)
    // 3: publicado
    // 4: rechazado
    // 5: archivado
    if (nombre === 'borrador' || nombre.includes('draft')) {
      map['draft'] = estado.id;
    } else if (nombre === 'publicado' || nombre.includes('published')) {
      map['published'] = estado.id;
    } else if (nombre === 'en_revision' || nombre.includes('revision') || nombre.includes('pending')) {
      map['pending'] = estado.id;
    } else if (nombre === 'rechazado' || nombre.includes('rejected')) {
      map['rejected'] = estado.id;
    }
  });
  
  console.log('🗺️ Mapeo de estados creado:', map);
  return map;
}

/**
 * Mapea estado_id del backend a status del frontend
 */
function mapEstadoIdToStatus(estadoId: number): Post['status'] {
  // Mapeo según los estados reales del backend:
  // 1: borrador → draft
  // 2: en_revision → pending
  // 3: publicado → published
  // 4: rechazado → rejected
  // 5: archivado → rejected (tratamos archivado como rejected)
  const statusMap: Record<number, Post['status']> = {
    1: 'draft',      // borrador
    2: 'pending',    // en_revision
    3: 'published',  // publicado
    4: 'rejected',   // rechazado
    5: 'rejected'    // archivado (tratado como rejected)
  };
  return statusMap[estadoId] || 'draft';
}

/**
 * Mapea status del frontend a estado_id del backend
 * Usa el mapeo dinámico si está disponible, sino usa el hardcodeado
 */
async function mapStatusToEstadoIdAsync(status: Post['status']): Promise<number> {
  try {
    const map = await getEstadosMap();
    return map[status] || 1;
  } catch (error) {
    console.error('Error obteniendo mapeo de estados, usando fallback:', error);
    // Fallback al mapeo hardcodeado
    const estadoMap: Record<Post['status'], number> = {
      'draft': 1,
      'published': 2,
      'pending': 3,
      'rejected': 4
    };
    return estadoMap[status] || 1;
  }
}

/**
 * Mapea status del frontend a estado_id del backend (versión síncrona)
 */
function mapStatusToEstadoId(status: Post['status']): number {
  // Mapeo según los estados reales del backend
  const estadoMap: Record<Post['status'], number> = {
    'draft': 1,      // borrador
    'pending': 2,    // en_revision
    'published': 3,  // publicado
    'rejected': 4    // rechazado
  };
  return estadoMap[status] || 1;
}

/**
 * Transforma un post del backend (snake_case) al formato del frontend (camelCase)
 */
function transformPostFromBackend(backendPost: PostBackend): Post {
  // Crear objeto author usando datos del backend si están disponibles, o valores por defecto
  const author = backendPost.author ? {
    id: backendPost.author.id,
    name: backendPost.author.name,
    avatar: backendPost.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(backendPost.author.name)}&background=3B82F6&color=fff`
  } : {
    id: backendPost.usuario_id,
    name: `Usuario ${backendPost.usuario_id}`,
    avatar: `https://ui-avatars.com/api/?name=Usuario+${backendPost.usuario_id}&background=3B82F6&color=fff`
  };

  return {
    id: backendPost.id,
    title: backendPost.titulo,
    slug: backendPost.slug,
    content: backendPost.contenido,
    excerpt: backendPost.extracto,
    status: mapEstadoIdToStatus(backendPost.estado_id),
    authorId: backendPost.usuario_id,
    author: author, // Siempre incluir el objeto author
    estadoId: backendPost.estado_id,
    featuredImage: backendPost.imagen_destacada,
    publishedAt: backendPost.fecha_publicacion,
    createdAt: backendPost.created_at,
    updatedAt: backendPost.updated_at,
    readTime: backendPost.tiempo_lectura,
    views: backendPost.views,
    likes: backendPost.likes,
    comments: backendPost.comments_count,
    shares: backendPost.shares,
    featured: backendPost.featured,
    allowComments: backendPost.allow_comments,
    isPinned: backendPost.is_pinned,
    categories: backendPost.categorias,
    keywords: backendPost.keywords,
    // Transformar categorías al formato legacy si existe la primera
    categoryId: backendPost.categorias?.[0]?.id,
    category: backendPost.categorias?.[0] ? {
      id: backendPost.categorias[0].id,
      name: backendPost.categorias[0].nombre,
      slug: backendPost.categorias[0].slug,
      color: backendPost.categorias[0].color
    } : undefined,
    // Transformar keywords a tags
    tags: backendPost.keywords?.map(k => k.keyword) || [],
    // Transformar SEO
    seo: backendPost.seo ? {
      metaTitle: backendPost.seo.meta_title,
      metaDescription: backendPost.seo.meta_description,
      focusKeyword: backendPost.seo.focus_keyword,
      readabilityScore: backendPost.seo.readabilityScore
    } : undefined,
    // Transformar Editorial
    editorial: backendPost.editorial ? {
      reviewedAt: backendPost.editorial.review_date,
      reviewerId: backendPost.editorial.reviewer_id,
      reviewNotes: backendPost.editorial.review_notes
    } : undefined
  };
}

/**
 * Obtiene el ID del usuario actual desde localStorage
 */
function getCurrentUserId(): number {
  if (typeof window === 'undefined') return 3; // Valor por defecto en SSR
  
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || 3;
    }
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
  }
  
  return 3; // Valor por defecto si no hay usuario
}

/**
 * Genera un slug a partir del título
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Eliminar guiones duplicados
    .substring(0, 255); // Limitar a 255 caracteres
}

/**
 * Transforma un post del frontend (camelCase) al formato del backend (snake_case)
 */
function transformPostToBackend(post: Partial<Post>): Partial<PostBackend> {
  const backendData: any = {};
  
  // Campos requeridos
  if (post.title !== undefined) backendData.titulo = post.title;
  
  // Generar slug automáticamente si no existe
  if (post.slug !== undefined) {
    backendData.slug = post.slug;
  } else if (post.title !== undefined) {
    backendData.slug = generateSlug(post.title);
  }
  
  // usuario_id es requerido - obtener del usuario actual
  if (post.authorId !== undefined) {
    backendData.usuario_id = post.authorId;
  } else {
    backendData.usuario_id = getCurrentUserId(); // Obtener del localStorage
  }
  
  // estado_id es requerido
  if (post.status !== undefined) {
    backendData.estado_id = mapStatusToEstadoId(post.status);
  } else if (post.estadoId !== undefined) {
    backendData.estado_id = post.estadoId;
  } else {
    backendData.estado_id = 1; // Draft por defecto
  }
  
  // Campos opcionales
  if (post.content !== undefined) backendData.contenido = post.content;
  if (post.excerpt !== undefined) backendData.extracto = post.excerpt;
  if (post.featuredImage !== undefined) backendData.imagen_destacada = post.featuredImage;
  if (post.publishedAt !== undefined) backendData.fecha_publicacion = post.publishedAt;
  if (post.readTime !== undefined) backendData.tiempo_lectura = post.readTime;
  
  // Categorías - el backend espera categoria_ids (array)
  if (post.categoryId !== undefined) {
    backendData.categoria_ids = [post.categoryId];
  }
  
  // Tags - el backend espera new_keywords (array de strings)
  if (post.tags !== undefined && post.tags.length > 0) {
    backendData.new_keywords = post.tags;
  }
  
  // Campos SEO - van directamente en el DTO, no anidados
  if (post.seo) {
    if (post.seo.metaTitle !== undefined) backendData.meta_title = post.seo.metaTitle;
    if (post.seo.metaDescription !== undefined) backendData.meta_description = post.seo.metaDescription;
    if (post.seo.focusKeyword !== undefined) backendData.focus_keyword = post.seo.focusKeyword;
    if (post.seo.readabilityScore !== undefined) backendData.readabilityScore = post.seo.readabilityScore;
  }
  
  // NO enviar featured, allowComments, isPinned - no existen en el backend DTO
  
  return backendData;
}

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

async function updatePostMock(postId: number, postData: Partial<Post>): Promise<Post | null> {
  await delay(300);
  const idx = postsStore.findIndex((p) => p.id === postId);
  if (idx === -1) return null;
  
  postsStore[idx] = {
    ...postsStore[idx],
    ...postData,
    id: postId, // Asegurar que el ID no cambie
    updatedAt: new Date().toISOString()
  };
  
  return postsStore[idx];
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
    const backendPosts = await apiClient.get<PostBackend[]>(API_CONFIG.ENDPOINTS.POSTS as string);
    return backendPosts.map(transformPostFromBackend);
  } catch (error) {
    console.error('Error fetching posts from API:', error);
    return [];
  }
}

async function updatePostApi(postId: number, postData: Partial<Post>): Promise<Post | null> {
  try {
    const backendData = transformPostToBackend(postData);
    // Agregar el ID al payload según el DTO del backend
    const updatePayload = {
      ...backendData,
      id: postId
    };
    
    console.log('🔄 Actualizando post ID:', postId);
    console.log('📝 Datos a actualizar:', updatePayload);
    
    const backendPost = await apiClient.patch<PostBackend>(
      `${API_CONFIG.ENDPOINTS.POSTS as string}/${postId}`,
      updatePayload
    );
    
    return transformPostFromBackend(backendPost);
  } catch (error) {
    console.error('Error updating post via API:', error);
    return null;
  }
}

async function updatePostStatusApi(
  postId: number,
  newStatus: Post['status']
): Promise<Post | null> {
  try {
    // Obtener el estado_id dinámicamente desde el backend
    const estadoId = await mapStatusToEstadoIdAsync(newStatus);
    const payload = {
      id: postId,
      estado_id: estadoId
    };
    
    console.log('🔄 Actualizando estado del post:');
    console.log('  - Post ID:', postId);
    console.log('  - Nuevo status:', newStatus);
    console.log('  - Estado ID:', estadoId);
    console.log('  - Payload:', payload);
    
    const backendPost = await apiClient.patch<PostBackend>(
      (API_CONFIG.ENDPOINTS.UPDATE_POST_STATUS as (id: string | number) => string)(postId),
      payload
    );
    
    console.log('✅ Estado actualizado exitosamente');
    return transformPostFromBackend(backendPost);
  } catch (error) {
    console.error('❌ Error updating post status via API:', error);
    return null;
  }
}

async function deletePostApi(postId: number): Promise<boolean> {
  try {
    console.log('🔄 Eliminando post ID:', postId);
    await apiClient.delete((API_CONFIG.ENDPOINTS.POST_BY_ID as (id: string | number) => string)(postId));
    console.log('✅ Post eliminado exitosamente');
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
    await apiClient.post(`${API_CONFIG.ENDPOINTS.POSTS as string}/bulk`, {
      ids,
      action
    });
  } catch (error) {
    console.error('Error performing bulk action via API:', error);
    throw error;
  }
}

async function createPostMock(postData: Partial<Post>): Promise<Post> {
  await delay(500);
  const newPost: Post = {
    id: Date.now(),
    title: postData.title || '',
    slug: postData.slug || postData.title?.toLowerCase().replace(/\s+/g, '-') || '',
    content: postData.content || '',
    excerpt: postData.excerpt || '',
    status: postData.status || 'draft',
    authorId: postData.authorId || 3,
    author: postData.author || {
      id: 3,
      name: 'Usuario Actual',
      avatar: 'https://ui-avatars.com/api/?name=Usuario&background=3B82F6&color=fff'
    },
    categoryId: postData.categoryId,
    category: postData.category,
    tags: postData.tags || [],
    featuredImage: postData.featuredImage || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readTime: postData.readTime || Math.ceil((postData.content?.split(' ').length || 0) / 200),
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    featured: postData.featured || false,
    allowComments: postData.allowComments !== false,
    isPinned: postData.isPinned || false,
    seo: postData.seo
  };
  postsStore.push(newPost);
  return newPost;
}

async function createPostApi(postData: Partial<Post>): Promise<Post> {
  try {
    const backendData = transformPostToBackend(postData);
    console.log('🔄 Datos transformados para el backend:', backendData);
    console.log('👤 Usuario ID:', backendData.usuario_id);
    
    const backendPost = await apiClient.post<PostBackend>(
      API_CONFIG.ENDPOINTS.POSTS as string,
      backendData
    );
    return transformPostFromBackend(backendPost);
  } catch (error) {
    console.error('Error creating post via API:', error);
    throw error;
  }
}

// ==================== PUBLIC API (Auto-switches between mock and real API) ====================

export async function getAllPosts(): Promise<Post[]> {
  return useRealApi() ? getAllPostsApi() : getAllPostsMock();
}

export async function updatePost(postId: number, postData: Partial<Post>): Promise<Post | null> {
  return useRealApi() ? updatePostApi(postId, postData) : updatePostMock(postId, postData);
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

export async function createPost(postData: Partial<Post>): Promise<Post> {
  return useRealApi() ? createPostApi(postData) : createPostMock(postData);
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
      `${API_CONFIG.ENDPOINTS.POSTS_COMPLETOS as string}?limit=${limit}`
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
      `${API_CONFIG.ENDPOINTS.POSTS_POPULARES as string}?limit=${limit}`
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
      `${API_CONFIG.ENDPOINTS.POSTS_TRENDING as string}?limit=${limit}`
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
      `${API_CONFIG.ENDPOINTS.POSTS_ENGAGEMENT as string}?limit=${limit}`
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
      API_CONFIG.ENDPOINTS.POSTS_SIN_COMENTARIOS as string
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
      `${API_CONFIG.ENDPOINTS.POSTS_MAS_COMPARTIDOS as string}?limit=${limit}`
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
      API_CONFIG.ENDPOINTS.POSTS_BORRADORES_ANTIGUOS as string
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
      `${API_CONFIG.ENDPOINTS.POSTS_STATS_POR_MES as string}?meses=${meses}`
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
      `${(API_CONFIG.ENDPOINTS.POSTS_STATS_MEJOR_RENDIMIENTO as (id: number) => string)(autorId)}?limit=${limit}`
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
      API_CONFIG.ENDPOINTS.POSTS_STATS_DASHBOARD as string
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
      (API_CONFIG.ENDPOINTS.POST_INCREMENT_VISTA as (id: number) => string)(postId),
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
      (API_CONFIG.ENDPOINTS.POST_LIKE as (id: number) => string)(postId),
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
    // Enviar userId como query parameter para DELETE
    const endpoint = (API_CONFIG.ENDPOINTS.POST_LIKE as (id: number) => string)(postId);
    await apiClient.delete(`${endpoint}?userId=${userId}`);
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
      (API_CONFIG.ENDPOINTS.POST_ADD_CATEGORIAS as (id: number) => string)(postId),
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
      (API_CONFIG.ENDPOINTS.POST_KEYWORDS as (id: number) => string)(postId),
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
      (API_CONFIG.ENDPOINTS.POST_KEYWORDS_CREATE as (id: number) => string)(postId),
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
      (API_CONFIG.ENDPOINTS.POST_KEYWORDS as (id: number) => string)(postId)
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
      (API_CONFIG.ENDPOINTS.POST_KEYWORDS as (id: number) => string)(postId),
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
      API_CONFIG.ENDPOINTS.KEYWORDS_FIND_OR_CREATE as string,
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
      `${API_CONFIG.ENDPOINTS.KEYWORDS_MAS_USADAS as string}?limit=${limit}`
    );
    return keywords as any[];
  } catch (error) {
    console.error('Error obteniendo keywords más usadas:', error);
    return [];
  }
}
