import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

// ==================== TYPES ====================

export interface Estado {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EstadoStats {
  total: number;
  porEstado: Record<string, number>;
}

// ==================== API LAYER ====================

/**
 * Obtener todos los estados
 */
export async function getAllEstados(): Promise<Estado[]> {
  if (!useRealApi()) {
    return [
      { id: 1, nombre: 'Borrador', descripcion: 'Post en borrador' },
      { id: 2, nombre: 'Publicado', descripcion: 'Post publicado' },
      { id: 3, nombre: 'Pendiente', descripcion: 'Pendiente de revisión' },
      { id: 4, nombre: 'Archivado', descripcion: 'Post archivado' }
    ];
  }
  
  try {
    const estados = await apiClient.get<Estado[]>(API_CONFIG.ENDPOINTS.ESTADOS);
    return estados;
  } catch (error) {
    console.error('Error fetching estados:', error);
    return [];
  }
}

/**
 * Obtener estado por ID
 */
export async function getEstadoById(id: number): Promise<Estado | null> {
  if (!useRealApi()) {
    const estados = await getAllEstados();
    return estados.find(e => e.id === id) || null;
  }
  
  try {
    const estado = await apiClient.get<Estado>(
      API_CONFIG.ENDPOINTS.ESTADO_BY_ID(id)
    );
    return estado;
  } catch (error) {
    console.error('Error fetching estado:', error);
    return null;
  }
}

/**
 * Crear nuevo estado
 */
export async function createEstado(data: {
  nombre: string;
  descripcion?: string;
}): Promise<Estado | null> {
  if (!useRealApi()) {
    return {
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  try {
    const estado = await apiClient.post<Estado>(
      API_CONFIG.ENDPOINTS.ESTADOS,
      data
    );
    return estado;
  } catch (error) {
    console.error('Error creating estado:', error);
    return null;
  }
}

/**
 * Actualizar estado
 */
export async function updateEstado(
  id: number,
  data: Partial<Estado>
): Promise<Estado | null> {
  if (!useRealApi()) {
    return { id, ...data } as Estado;
  }
  
  try {
    const estado = await apiClient.patch<Estado>(
      API_CONFIG.ENDPOINTS.ESTADO_BY_ID(id),
      data
    );
    return estado;
  } catch (error) {
    console.error('Error updating estado:', error);
    return null;
  }
}

/**
 * Eliminar estado
 */
export async function deleteEstado(id: number): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.ESTADO_BY_ID(id));
    return true;
  } catch (error) {
    console.error('Error deleting estado:', error);
    return false;
  }
}

/**
 * Obtener estadísticas de estados
 */
export async function getEstadosStats(): Promise<EstadoStats> {
  if (!useRealApi()) {
    return {
      total: 100,
      porEstado: {
        'Borrador': 25,
        'Publicado': 50,
        'Pendiente': 15,
        'Archivado': 10
      }
    };
  }
  
  try {
    const stats = await apiClient.get<EstadoStats>(
      API_CONFIG.ENDPOINTS.ESTADOS_STATS
    );
    return stats;
  } catch (error) {
    console.error('Error fetching estados stats:', error);
    return { total: 0, porEstado: {} };
  }
}

/**
 * Obtener posts por estado
 */
export async function getPostsByEstado(estadoNombre: string): Promise<any[]> {
  if (!useRealApi()) return [];
  
  try {
    const posts = await apiClient.get<any[]>(
      API_CONFIG.ENDPOINTS.ESTADOS_POSTS_BY_NAME(estadoNombre)
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts by estado:', error);
    return [];
  }
}
