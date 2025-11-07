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
  content?: string | null;
  metadata?: Record<string, any> | null;
  createdAt?: string; // Backend usa createdAt, no created_at
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
 * Obtener todas las actividades (sin filtros - todas las actividades de todos los usuarios)
 */
export async function getAllActivities(): Promise<UserActivity[]> {
  if (!useRealApi()) {
    return [];
  }
  
  try {
    console.log('🔄 Obteniendo todas las actividades del backend...');
    const url = API_CONFIG.ENDPOINTS.USER_ACTIVITIES as string;
    const activities = await apiClient.get<UserActivity[]>(url);
    console.log(`✅ ${activities.length} actividades obtenidas`);
    return activities;
  } catch (error) {
    console.error('❌ Error fetching user activities:', error);
    return [];
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
  limit?: number
): Promise<UserActivity[]> {
  if (!useRealApi()) {
    return [];
  }
  
  try {
    console.log(`🔄 Obteniendo actividades del usuario ${userId}...`);
    // Obtener todas las actividades y filtrar por userId
    const allActivities = await getAllActivities();
    console.log(`📊 Total de actividades en el sistema: ${allActivities.length}`);
    console.log(`🔍 Filtrando por userId: ${userId}`);
    
    const userActivities = allActivities
      .filter(activity => {
        const matches = activity.userId === userId;
        if (!matches && allActivities.length < 5) {
          console.log(`❌ Actividad ${activity.id} no coincide: userId=${activity.userId} vs ${userId}`);
        }
        return matches;
      })
      .slice(0, limit || 10); // Limitar a 10 por defecto
    
    console.log(`✅ ${userActivities.length} actividades del usuario ${userId}`);
    
    if (userActivities.length === 0 && allActivities.length > 0) {
      console.warn(`⚠️ No se encontraron actividades para el usuario ${userId}`);
      console.log(`📋 UserIds disponibles:`, [...new Set(allActivities.map(a => a.userId))]);
    }
    
    return userActivities;
  } catch (error) {
    console.error('❌ Error fetching user activities:', error);
    return [];
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
      createdAt: new Date().toISOString()
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
  return await getActivitiesByUser(userId, 10);
}

/**
 * Obtener actividades por tipo
 */
export async function getActivitiesByType(
  type: ActivityType,
  limit: number = 20
): Promise<UserActivity[]> {
  const allActivities = await getAllActivities();
  return allActivities
    .filter(activity => activity.type === type)
    .slice(0, limit);
}

/**
 * Obtener actividades en un rango de fechas
 */
export async function getActivitiesByDateRange(
  startDate: string,
  endDate: string,
  userId?: number
): Promise<UserActivity[]> {
  const allActivities = await getAllActivities();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return allActivities.filter(activity => {
    if (userId && activity.userId !== userId) return false;
    if (!activity.createdAt) return false;
    
    const activityDate = new Date(activity.createdAt);
    return activityDate >= start && activityDate <= end;
  });
}
