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

// Token validation - works with real JWT tokens
export const validateToken = (token: string): User | null => {
  try {
    if (!token) return null;

    const isMockToken = !token.includes('.');
    let payload: Record<string, any> | null = null;

    if (isMockToken) {
      payload = JSON.parse(atob(token));

      if (payload?.exp && payload.exp < Date.now()) {
        console.log('⚠️ Mock token expirado');
        return null;
      }
    } else {
      // Decode JWT token (format: header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Decode payload (base64url)
      payload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      );

      // Check if token is expired
      if (payload?.exp && payload.exp * 1000 < Date.now()) {
        console.log('⚠️ Token expirado');
        return null;
      }
    }

    // Get user data from localStorage (saved during login)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        const user = JSON.parse(storedUser);

        // Asegurar que el usuario tenga el formato correcto
        // Si tiene 'rol' en lugar de 'role', mapearlo
        if (user.rol && !user.role) {
          user.role = user.rol;
        }

        return user;
      }
    }

    if (isMockToken && payload?.id) {
      const found = mockUsers.find(u => u.id === payload?.id);
      if (found) {
        return found;
      }
    }

    return null;
  } catch (error) {
    console.error('Error validating token:', error);
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
    // El backend solo acepta email y password, no rememberMe
    const { email, password } = credentials;
    const response = await apiClient.post<any>(
      API_CONFIG.ENDPOINTS.LOGIN as string,
      { email, password }
    );
    
    // Debug: Ver qué devuelve el backend
    console.log('🔍 Respuesta del backend:', response);
    
    // El backend devuelve accessToken, no token
    // También devuelve refreshToken que podemos guardar para después
    const token = response.accessToken || response.token;
    const refreshToken = response.refreshToken;
    
    console.log('✅ Token mapeado:', token);
    console.log('✅ Refresh token:', refreshToken);
    console.log('✅ Usuario recibido:', response.user);
    
    // Guardar refresh token en localStorage para uso futuro
    if (typeof window !== 'undefined' && refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    
    // Mapear usuario del backend al formato del frontend
    const mappedUser: User = {
      id: response.user.id,
      username: response.user.username,
      email: response.user.email,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      role: response.user.rol || response.user.role, // Backend usa 'rol', frontend usa 'role'
      avatar: response.user.avatar || `https://ui-avatars.com/api/?name=${response.user.firstName}+${response.user.lastName}`,
      status: response.user.status || 'active',
      lastLogin: response.user.lastLogin || new Date().toISOString(),
      createdAt: response.user.createdAt || new Date().toISOString(),
      permissions: response.user.permissions || [],
      stats: response.user.stats || {}
    };
    
    console.log('✅ Usuario mapeado:', mappedUser);
    
    return {
      user: mappedUser,
      token: token
    };
  } catch (error) {
    console.error('Error logging in via API:', error);
    throw error;
  }
}

async function registerApi(userData: RegisterFormData): Promise<{ user: User; token: string }> {
  try {
    // Transformar datos del frontend (camelCase) al formato del backend (snake_case)
    const backendData = {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      // username es opcional en el backend
      username: `${userData.firstName.toLowerCase()}_${userData.lastName.toLowerCase()}`
    };
    
    const response = await apiClient.post<{ user: User; token: string }>(
      API_CONFIG.ENDPOINTS.REGISTER as string,
      backendData
    );
    return response;
  } catch (error) {
    console.error('Error registering via API:', error);
    throw error;
  }
}

async function logoutApi(): Promise<void> {
  try {
    await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT as string, {});
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
    const response = await apiClient.post<{ exists: boolean; message?: string }>(
      API_CONFIG.ENDPOINTS.VALIDATE_EMAIL as string,
      { email }
    );

    return !response.exists;
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