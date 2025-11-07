import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

// ==================== TYPES ====================

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RolConPermisos extends Rol {
  permisos: Permiso[];
}

// ==================== ROLES ====================

/**
 * Obtener todos los roles
 */
export async function getAllRoles(): Promise<Rol[]> {
  if (!useRealApi()) {
    return [
      { id: 1, nombre: 'Creador', descripcion: 'Acceso completo' },
      { id: 2, nombre: 'Administrador', descripcion: 'Gestión del sistema' },
      { id: 3, nombre: 'Editor', descripcion: 'Edición de contenido' },
      { id: 4, nombre: 'Escritor', descripcion: 'Creación de contenido' },
      { id: 5, nombre: 'Autor', descripcion: 'Publicación de posts' },
      { id: 6, nombre: 'Comentador', descripcion: 'Solo comentarios' }
    ];
  }
  
  try {
    const roles = await apiClient.get<Rol[]>(API_CONFIG.ENDPOINTS.RBAC_ROLES as string);
    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

/**
 * Crear nuevo rol
 */
export async function createRol(data: {
  nombre: string;
  descripcion?: string;
}): Promise<Rol | null> {
  if (!useRealApi()) {
    return {
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  try {
    const rol = await apiClient.post<Rol>(
      API_CONFIG.ENDPOINTS.RBAC_ROLES as string,
      data
    );
    return rol;
  } catch (error) {
    console.error('Error creating rol:', error);
    return null;
  }
}

/**
 * Eliminar rol por ID
 */
export async function deleteRol(id: number): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete((API_CONFIG.ENDPOINTS.RBAC_ROLE_BY_ID as (id: number) => string)(id));
    return true;
  } catch (error) {
    console.error('Error deleting rol:', error);
    return false;
  }
}

/**
 * Eliminar múltiples roles
 */
export async function deleteRoles(ids: number[]): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.RBAC_ROLES as string, {
      body: JSON.stringify({ ids })
    } as any);
    return true;
  } catch (error) {
    console.error('Error deleting roles:', error);
    return false;
  }
}

// ==================== PERMISOS ====================

/**
 * Obtener todos los permisos
 */
export async function getAllPermisos(): Promise<Permiso[]> {
  if (!useRealApi()) {
    return [
      { id: 1, nombre: 'crear_post', descripcion: 'Crear posts' },
      { id: 2, nombre: 'editar_post', descripcion: 'Editar posts' },
      { id: 3, nombre: 'eliminar_post', descripcion: 'Eliminar posts' },
      { id: 4, nombre: 'publicar_post', descripcion: 'Publicar posts' },
      { id: 5, nombre: 'moderar_comentarios', descripcion: 'Moderar comentarios' },
      { id: 6, nombre: 'gestionar_usuarios', descripcion: 'Gestionar usuarios' },
      { id: 7, nombre: 'gestionar_roles', descripcion: 'Gestionar roles y permisos' }
    ];
  }
  
  try {
    const permisos = await apiClient.get<Permiso[]>(
      API_CONFIG.ENDPOINTS.RBAC_PERMISOS as string
    );
    return permisos;
  } catch (error) {
    console.error('Error fetching permisos:', error);
    return [];
  }
}

/**
 * Crear nuevo permiso
 */
export async function createPermiso(data: {
  nombre: string;
  descripcion?: string;
}): Promise<Permiso | null> {
  if (!useRealApi()) {
    return {
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  try {
    const permiso = await apiClient.post<Permiso>(
      API_CONFIG.ENDPOINTS.RBAC_PERMISOS as string,
      data
    );
    return permiso;
  } catch (error) {
    console.error('Error creating permiso:', error);
    return null;
  }
}

/**
 * Eliminar permiso por ID
 */
export async function deletePermiso(id: number): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete((API_CONFIG.ENDPOINTS.RBAC_PERMISO_BY_ID as (id: number) => string)(id));
    return true;
  } catch (error) {
    console.error('Error deleting permiso:', error);
    return false;
  }
}

/**
 * Eliminar múltiples permisos
 */
export async function deletePermisos(ids: number[]): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.RBAC_PERMISOS as string, {
      body: JSON.stringify({ ids })
    } as any);
    return true;
  } catch (error) {
    console.error('Error deleting permisos:', error);
    return false;
  }
}

// ==================== ASIGNACIÓN DE PERMISOS ====================

/**
 * Listar permisos por rol
 */
export async function getPermisosByRole(): Promise<any> {
  if (!useRealApi()) return {};
  
  try {
    const data = await apiClient.get(
      API_CONFIG.ENDPOINTS.RBAC_PERMISOS_BY_ROLE as string
    );
    return data;
  } catch (error) {
    console.error('Error fetching permisos by role:', error);
    return {};
  }
}

/**
 * Asignar permiso a un rol
 */
export async function assignPermisoToRole(
  rolId: number,
  permisoId: number
): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.post(
      (API_CONFIG.ENDPOINTS.RBAC_ASSIGN_PERMISO as (id: number) => string)(rolId),
      { permisoId }
    );
    return true;
  } catch (error) {
    console.error('Error assigning permiso to role:', error);
    return false;
  }
}

/**
 * Revocar permiso de un rol
 */
export async function revokePermisoFromRole(
  roleId: number,
  permisoId: number
): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete(
      (API_CONFIG.ENDPOINTS.RBAC_REVOKE_PERMISO as (roleId: number, permisoId: number) => string)(roleId, permisoId)
    );
    return true;
  } catch (error) {
    console.error('Error revoking permiso from role:', error);
    return false;
  }
}

/**
 * Revocar múltiples permisos de un rol
 */
export async function revokeManyPermisosFromRole(
  rolId: number,
  permisoIds: number[]
): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    await apiClient.delete(
      (API_CONFIG.ENDPOINTS.RBAC_REVOKE_MANY_PERMISOS as (id: number) => string)(rolId),
      { body: JSON.stringify({ permisoIds }) } as any
    );
    return true;
  } catch (error) {
    console.error('Error revoking multiple permisos from role:', error);
    return false;
  }
}

// ==================== HELPERS ====================

/**
 * Verificar si un rol tiene un permiso específico
 */
export async function roleHasPermiso(
  rolId: number,
  permisoNombre: string
): Promise<boolean> {
  if (!useRealApi()) return true;
  
  try {
    const permisosByRole = await getPermisosByRole();
    const rol = permisosByRole[rolId];
    if (!rol || !rol.permisos) return false;
    
    return rol.permisos.some((p: Permiso) => p.nombre === permisoNombre);
  } catch (error) {
    console.error('Error checking role permission:', error);
    return false;
  }
}

/**
 * Obtener todos los permisos de un rol
 */
export async function getPermisosDeRol(rolId: number): Promise<Permiso[]> {
  if (!useRealApi()) return [];
  
  try {
    const permisosByRole = await getPermisosByRole();
    const rol = permisosByRole[rolId];
    return rol?.permisos || [];
  } catch (error) {
    console.error('Error fetching permisos de rol:', error);
    return [];
  }
}
