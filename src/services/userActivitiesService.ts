import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

// ==================== TYPES ====================

export type ActivityType = 
  | 'post_created'
  | 'post_published'
  | 'comment_added'
  | 'profile_updated'
  | 'follow'
  | 'like_given';

export interface UserActivity {
  id: string;
  userId: number;
  type: ActivityType;
  description: string;
  target?: string;
  content?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface ActivityFilters {
  userId?: number;
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ActivitiesResponse {
  data: UserActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== API LAYER ====================

/**
 * Obtener todas las actividades (con filtros opcionales)
 */
export async function getAllActivities(
  filters?: ActivityFilters
): Promise<ActivitiesResponse> {
  if (!useRealApi()) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    };
  }
  
  try {
    const queryParams = new URLSearchParams();
    if (filters?.userId) queryParams.append('userId', filters.userId.toString());
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const url = `${API_CONFIG.ENDPOINTS.USER_ACTIVITIES}?${queryParams.toString()}`;
    const response = await apiClient.get<ActivitiesResponse>(url);
    return response;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    };
  }
}

/**
 * Obtener actividad por ID
 */
export async function getActivityById(id: string): Promise<UserActivity | null> {
  if (!useRealApi()) return null;
  
  try {
    const activity = await apiClient.get<UserActivity>(
      (API_CONFIG.ENDPOINTS.USER_ACTIVITY_BY_ID as (id: string) => string)(id)
    );
    return activity;
  } catch (error) {
    console.error('Error fetching activity:', error);
    return null;
  }
}

/**
 * Obtener actividades de un usuario específico
 */
export async function getActivitiesByUser(
  userId: number,
  filters?: Omit<ActivityFilters, 'userId'>
): Promise<ActivitiesResponse> {
  if (!useRealApi()) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    };
  }
  
  try {
    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const url = `${(API_CONFIG.ENDPOINTS.USER_ACTIVITIES_BY_USER as (id: number) => string)(userId)}?${queryParams.toString()}`;
    const response = await apiClient.get<ActivitiesResponse>(url);
    return response;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    };
  }
}

/**
 * Crear nueva actividad
 */
export async function createActivity(data: {
  userId: number;
  type: ActivityType;
  description: string;
  target?: string;
  content?: string;
  metadata?: Record<string, any>;
}): Promise<UserActivity | null> {
  if (!useRealApi()) {
    return {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString()
    };
  }
  
  try {
    const activity = await apiClient.post<UserActivity>(
      API_CONFIG.ENDPOINTS.USER_ACTIVITIES as string,
      data
    );
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
}

/**
 * Eliminar actividad por ID
 */
export async function deleteActivity(id: string): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete((API_CONFIG.ENDPOINTS.USER_ACTIVITY_BY_ID as (id: string) => string)(id));
    return true;
  } catch (error) {
    console.error('Error deleting activity:', error);
    return false;
  }
}

/**
 * Eliminar todas las actividades de un usuario
 */
export async function deleteActivitiesByUser(userId: number): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete(
      (API_CONFIG.ENDPOINTS.USER_ACTIVITIES_BY_USER as (id: number) => string)(userId)
    );
    return true;
  } catch (error) {
    console.error('Error deleting user activities:', error);
    return false;
  }
}

// ==================== HELPERS ====================

/**
 * Registrar actividad de creación de post
 */
export async function logPostCreated(
  userId: number,
  postId: number,
  postTitle: string
): Promise<boolean> {
  const activity = await createActivity({
    userId,
    type: 'post_created',
    description: `Creó el post "${postTitle}"`,
    target: `post:${postId}`,
    metadata: { postId, postTitle }
  });
  return activity !== null;
}

/**
 * Registrar actividad de publicación de post
 */
export async function logPostPublished(
  userId: number,
  postId: number,
  postTitle: string
): Promise<boolean> {
  const activity = await createActivity({
    userId,
    type: 'post_published',
    description: `Publicó el post "${postTitle}"`,
    target: `post:${postId}`,
    metadata: { postId, postTitle }
  });
  return activity !== null;
}

/**
 * Registrar actividad de comentario
 */
export async function logCommentAdded(
  userId: number,
  postId: number,
  commentId: number,
  commentPreview: string
): Promise<boolean> {
  const activity = await createActivity({
    userId,
    type: 'comment_added',
    description: 'Agregó un comentario',
    target: `post:${postId}`,
    content: commentPreview,
    metadata: { postId, commentId }
  });
  return activity !== null;
}

/**
 * Registrar actividad de actualización de perfil
 */
export async function logProfileUpdated(
  userId: number,
  changes: string[]
): Promise<boolean> {
  const activity = await createActivity({
    userId,
    type: 'profile_updated',
    description: `Actualizó su perfil: ${changes.join(', ')}`,
    metadata: { changes }
  });
  return activity !== null;
}

/**
 * Registrar actividad de seguir usuario
 */
export async function logUserFollowed(
  userId: number,
  targetUserId: number,
  targetUsername: string
): Promise<boolean> {
  const activity = await createActivity({
    userId,
    type: 'follow',
    description: `Siguió a @${targetUsername}`,
    target: `user:${targetUserId}`,
    metadata: { targetUserId, targetUsername }
  });
  return activity !== null;
}

/**
 * Registrar actividad de like
 */
export async function logLikeGiven(
  userId: number,
  targetType: 'post' | 'comment',
  targetId: number
): Promise<boolean> {
  const activity = await createActivity({
    userId,
    type: 'like_given',
    description: `Le gustó un ${targetType === 'post' ? 'post' : 'comentario'}`,
    target: `${targetType}:${targetId}`,
    metadata: { targetType, targetId }
  });
  return activity !== null;
}

/**
 * Obtener actividades recientes de un usuario (últimas 10)
 */
export async function getRecentActivities(userId: number): Promise<UserActivity[]> {
  const response = await getActivitiesByUser(userId, { limit: 10, page: 1 });
  return response.data;
}

/**
 * Obtener actividades por tipo
 */
export async function getActivitiesByType(
  type: ActivityType,
  limit: number = 20
): Promise<UserActivity[]> {
  const response = await getAllActivities({ type, limit, page: 1 });
  return response.data;
}

/**
 * Obtener actividades en un rango de fechas
 */
export async function getActivitiesByDateRange(
  startDate: string,
  endDate: string,
  userId?: number
): Promise<UserActivity[]> {
  const response = await getAllActivities({
    userId,
    startDate,
    endDate,
    limit: 100,
    page: 1
  });
  return response.data;
}
