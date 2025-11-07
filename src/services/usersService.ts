import { mockUsers, type User } from '../data/mockUsers';
import type { Role } from '../data/rolePermissions';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

let usersStore: User[] = [...mockUsers];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function transformUserFromBackend(u: any): User {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: (u.rol?.nombre || 'autor') as any,
    avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username)}&background=3B82F6&color=fff`,
    status: u.status,
    lastLogin: u.lastLogin || '',
    createdAt: u.createdAt,
    permissions: [],
    stats: {
      postsCreated: u.stats?.postsCreated || 0,
      commentsApproved: u.stats?.commentsApproved || 0,
      usersManaged: u.stats?.usersManaged || 0,
      postsEdited: u.stats?.postsEdited || 0,
      postsPublished: u.stats?.postsPublished || 0,
      commentsModerated: u.stats?.commentsModerated || 0,
      totalViews: u.stats?.totalViews || 0,
    },
  };
}

// ==================== MOCK DATA LAYER ====================

async function getAllUsersMock(): Promise<User[]> {
  await delay(200);
  return [...usersStore];
}

async function changeUserRoleMock(userId: number, newRole: Role): Promise<User | null> {
  await delay(150);
  const idx = usersStore.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  usersStore[idx] = { ...usersStore[idx], role: newRole };
  return usersStore[idx];
}

async function updateUserStatusMock(
  userId: number,
  newStatus: User['status']
): Promise<User | null> {
  await delay(150);
  const idx = usersStore.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  usersStore[idx] = { ...usersStore[idx], status: newStatus };
  return usersStore[idx];
}

async function deleteUserMock(userId: number): Promise<boolean> {
  await delay(150);
  const before = usersStore.length;
  usersStore = usersStore.filter((u) => u.id !== userId);
  return usersStore.length < before;
}

// ==================== API DATA LAYER ====================

async function getAllUsersApi(): Promise<User[]> {
  try {
    const users = await apiClient.get<any[]>(API_CONFIG.ENDPOINTS.USERS as string);
    return users.map(transformUserFromBackend);
  } catch (error) {
    console.error('Error fetching users from API:', error);
    return [];
  }
}

async function changeUserRoleApi(userId: number, newRole: Role): Promise<User | null> {
  try {
    // El backend espera rolId (número), no role (string)
    // Mapeo según los IDs reales de roles en el backend (GET /rbac/roles)
    const roleIdMap: Record<Role, number> = {
      'administrador': 1,
      'editor': 2,
      'autor': 3,
      'comentador': 4,
      // Roles que no existen en el backend, mapear a autor por defecto
      'creador': 3,      // → autor
      'escritor': 3      // → autor
    };
    
    const payload = { 
      id: userId,  // Requerido por UpdateUserDto del backend
      rolId: roleIdMap[newRole] || 3 
    };
    console.log('🔄 Cambiando rol de usuario:', { userId, newRole, payload });
    
    const user = await apiClient.patch<any>(
      (API_CONFIG.ENDPOINTS.CHANGE_USER_ROLE as (id: number) => string)(userId),
      payload
    );
    return transformUserFromBackend(user);
  } catch (error) {
    console.error('Error changing user role via API:', error);
    return null;
  }
}

async function updateUserStatusApi(
  userId: number,
  newStatus: User['status']
): Promise<User | null> {
  try {
    const user = await apiClient.patch<any>(
      (API_CONFIG.ENDPOINTS.UPDATE_USER_STATUS as (id: number) => string)(userId),
      { 
        id: userId,  // Requerido por UpdateUserDto del backend
        status: newStatus 
      }
    );
    return transformUserFromBackend(user);
  } catch (error) {
    console.error('Error updating user status via API:', error);
    return null;
  }
}

async function deleteUserApi(userId: number): Promise<boolean> {
  try {
    await apiClient.delete((API_CONFIG.ENDPOINTS.USER_BY_ID as (id: number) => string)(userId));
    return true;
  } catch (error) {
    console.error('Error deleting user via API:', error);
    return false;
  }
}

// ==================== PUBLIC API (Auto-switches between mock and real API) ====================

export async function getAllUsers(): Promise<User[]> {
  return useRealApi() ? getAllUsersApi() : getAllUsersMock();
}

export async function changeUserRole(userId: number, newRole: Role): Promise<User | null> {
  return useRealApi() ? changeUserRoleApi(userId, newRole) : changeUserRoleMock(userId, newRole);
}

export async function updateUserStatus(
  userId: number,
  newStatus: User['status']
): Promise<User | null> {
  return useRealApi() ? updateUserStatusApi(userId, newStatus) : updateUserStatusMock(userId, newStatus);
}

export async function deleteUser(userId: number): Promise<boolean> {
  return useRealApi() ? deleteUserApi(userId) : deleteUserMock(userId);
}

/**
 * Obtener todos los roles disponibles del backend
 * Útil para verificar el mapeo correcto de IDs
 */
export async function getRoles(): Promise<any[]> {
  if (!useRealApi()) return [];
  
  try {
    const roles = await apiClient.get<any[]>(API_CONFIG.ENDPOINTS.RBAC_ROLES as string);
    console.log('📋 Roles disponibles en el backend:', roles);
    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}
