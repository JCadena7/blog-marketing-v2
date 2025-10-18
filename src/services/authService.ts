import { mockUsers, type User } from '../data/mockUsers';
import type { LoginFormData, RegisterFormData } from '../schemas/authSchemas';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ==================== MOCK DATA LAYER ====================

// Mock JWT token generation
const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return btoa(JSON.stringify(payload));
};

// Mock token validation
export const validateToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return mockUsers.find(user => user.id === payload.id) || null;
  } catch {
    return null;
  }
};

async function loginMock(credentials: LoginFormData): Promise<{ user: User; token: string }> {
  await delay(800);
  
  const { email, password } = credentials;
  
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  if (password !== 'password123') {
    throw new Error('Contraseña incorrecta');
  }
  
  if (user.status !== 'active') {
    throw new Error('Cuenta desactivada. Contacta al administrador.');
  }
  
  user.lastLogin = new Date().toISOString();
  
  const token = generateToken(user);
  
  return { user, token };
}

async function registerMock(userData: RegisterFormData): Promise<{ user: User; token: string }> {
  await delay(1200);
  
  const { firstName, lastName, email, password } = userData;
  
  const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    throw new Error('Este email ya está registrado');
  }
  
  const newUser: User = {
    id: Math.max(...mockUsers.map(u => u.id)) + 1,
    username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    email,
    firstName,
    lastName,
    role: 'autor',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=3B82F6&color=fff`,
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    permissions: ['comentar', 'crear_post', 'editar_post_propio', 'reaccionar'],
    stats: {
      postsCreated: 0,
      postsPublished: 0,
      totalViews: 0
    }
  };
  
  mockUsers.push(newUser);
  
  const token = generateToken(newUser);
  
  return { user: newUser, token };
}

async function logoutMock(): Promise<void> {
  await delay(300);
}

async function forgotPasswordMock(email: string): Promise<void> {
  await delay(1000);
  
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error('No se encontró una cuenta con este email');
  }
  
  console.log('Password reset email sent to:', email);
}

async function resetPasswordMock(token: string, newPassword: string): Promise<void> {
  await delay(800);
  console.log('Password reset for token:', token);
}

async function checkEmailAvailabilityMock(email: string): Promise<boolean> {
  await delay(300);
  
  const exists = mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
  return !exists;
}

async function refreshTokenMock(token: string): Promise<{ user: User; token: string }> {
  await delay(500);
  
  const user = validateToken(token);
  if (!user) {
    throw new Error('Token inválido');
  }
  
  const newToken = generateToken(user);
  return { user, token: newToken };
}

// ==================== API DATA LAYER ====================

async function loginApi(credentials: LoginFormData): Promise<{ user: User; token: string }> {
  try {
    const response = await apiClient.post<{ user: User; token: string }>(
      API_CONFIG.ENDPOINTS.LOGIN,
      credentials
    );
    return response;
  } catch (error) {
    console.error('Error logging in via API:', error);
    throw error;
  }
}

async function registerApi(userData: RegisterFormData): Promise<{ user: User; token: string }> {
  try {
    const response = await apiClient.post<{ user: User; token: string }>(
      API_CONFIG.ENDPOINTS.REGISTER,
      userData
    );
    return response;
  } catch (error) {
    console.error('Error registering via API:', error);
    throw error;
  }
}

async function logoutApi(): Promise<void> {
  try {
    await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT, {});
  } catch (error) {
    console.error('Error logging out via API:', error);
  }
}

async function forgotPasswordApi(email: string): Promise<void> {
  try {
    await apiClient.post('/auth/forgot-password', { email });
  } catch (error) {
    console.error('Error sending forgot password email via API:', error);
    throw error;
  }
}

async function resetPasswordApi(token: string, newPassword: string): Promise<void> {
  try {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  } catch (error) {
    console.error('Error resetting password via API:', error);
    throw error;
  }
}

async function checkEmailAvailabilityApi(email: string): Promise<boolean> {
  try {
    const response = await apiClient.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
    return response.available;
  } catch (error) {
    console.error('Error checking email availability via API:', error);
    return false;
  }
}

async function refreshTokenApi(token: string): Promise<{ user: User; token: string }> {
  try {
    const response = await apiClient.post<{ user: User; token: string }>(
      '/auth/refresh',
      { token }
    );
    return response;
  } catch (error) {
    console.error('Error refreshing token via API:', error);
    throw error;
  }
}

// ==================== PUBLIC API (Auto-switches between mock and real API) ====================

export const login = async (credentials: LoginFormData): Promise<{ user: User; token: string }> => {
  return useRealApi() ? loginApi(credentials) : loginMock(credentials);
};

export const register = async (userData: RegisterFormData): Promise<{ user: User; token: string }> => {
  return useRealApi() ? registerApi(userData) : registerMock(userData);
};

export const logout = async (): Promise<void> => {
  return useRealApi() ? logoutApi() : logoutMock();
};

export const forgotPassword = async (email: string): Promise<void> => {
  return useRealApi() ? forgotPasswordApi(email) : forgotPasswordMock(email);
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  return useRealApi() ? resetPasswordApi(token, newPassword) : resetPasswordMock(token, newPassword);
};

export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  return useRealApi() ? checkEmailAvailabilityApi(email) : checkEmailAvailabilityMock(email);
};

export const refreshToken = async (token: string): Promise<{ user: User; token: string }> => {
  return useRealApi() ? refreshTokenApi(token) : refreshTokenMock(token);
};