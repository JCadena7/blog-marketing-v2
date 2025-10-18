import { mockUsers, type User } from '../data/mockUsers';
import type { Role } from '../data/rolePermissions';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

let usersStore: User[] = [...mockUsers];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
    const users = await apiClient.get<User[]>(API_CONFIG.ENDPOINTS.USERS);
    return users;
  } catch (error) {
    console.error('Error fetching users from API:', error);
    return [];
  }
}

async function changeUserRoleApi(userId: number, newRole: Role): Promise<User | null> {
  try {
    const user = await apiClient.patch<User>(
      API_CONFIG.ENDPOINTS.CHANGE_USER_ROLE(userId),
      { role: newRole }
    );
    return user;
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
    const user = await apiClient.patch<User>(
      API_CONFIG.ENDPOINTS.UPDATE_USER_STATUS(userId),
      { status: newStatus }
    );
    return user;
  } catch (error) {
    console.error('Error updating user status via API:', error);
    return null;
  }
}

async function deleteUserApi(userId: number): Promise<boolean> {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.USER_BY_ID(userId));
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
