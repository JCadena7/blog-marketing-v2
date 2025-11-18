import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, type User, mockUsers } from '../data/mockUsers';
import type { Role } from '../data/rolePermissions';
import { validateToken, logout as logoutService } from '../services/authService';

const getStorage = (): Storage | null =>
  typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage
    ? globalThis.localStorage
    : null;

const getLocation = (): Location | null =>
  typeof globalThis !== 'undefined' && 'location' in globalThis && globalThis.location
    ? globalThis.location
    : null;

const navigateSafely = (path: string) => {
  const location = getLocation();
  if (location) {
    location.href = path;
  }
};

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string, isNewUser?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
  authToken: string | null;
  isAuthenticated: boolean;
  // Dev helpers to preview roles/permissions in the mockup
  setMockUserByRole: (role: Role) => void;
  setMockUserById: (id: number) => void;
  // Demo mode to bypass permission checks in UI
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  // Strict preview: when enabled, ignore demoMode for permission checks (preview real role capabilities)
  previewStrict: boolean;
  setPreviewStrict: (enabled: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  loading: true,
  authToken: null,
  isAuthenticated: false,
  setMockUserByRole: () => {},
  setMockUserById: () => {},
  demoMode: false,
  setDemoMode: () => {},
  previewStrict: false,
  setPreviewStrict: () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoMode, setDemoModeState] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [previewStrict, setPreviewStrictState] = useState<boolean>(false);

  const writeStorage = useCallback((key: string, value: string) => {
    const storage = getStorage();
    if (storage) {
      storage.setItem(key, value);
    }
  }, []);

  const removeStorage = useCallback((key: string) => {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(key);
    }
  }, []);

  const readStorage = useCallback((key: string) => {
    const storage = getStorage();
    return storage ? storage.getItem(key) : null;
  }, []);

  const setPreviewStrict = useCallback((enabled: boolean) => {
    setPreviewStrictState(enabled);
    if (enabled) {
      writeStorage('preview_strict', 'true');
    } else {
      removeStorage('preview_strict');
    }
  }, [removeStorage, writeStorage]);

  const clearAuthStorage = useCallback(() => {
    removeStorage('auth_token');
    removeStorage('refresh_token');
    removeStorage('user_data');
  }, [removeStorage]);

  const loadMockUserFromStorage = useCallback(() => {
    const storedId = readStorage('mock_user_id');
    if (storedId) {
      const found = mockUsers.find(u => u.id === Number(storedId));
      if (found) {
        return found;
      }
    }
    return null;
  }, [readStorage]);

  const applyDemoModeFromStorage = useCallback((strictFlag: string | null) => {
    setDemoModeState(true);
    if (strictFlag === 'true') {
      setPreviewStrictState(true);
    }
    const mockUser = loadMockUserFromStorage() || getCurrentUser();
    setUser(mockUser);
    setAuthToken(null);
    setLoading(false);
  }, [loadMockUserFromStorage]);

  useEffect(() => {
    // Load user from localStorage or validate existing token
    const initAuth = async () => {
      try {
        const storedToken = readStorage('auth_token');
        const storedUser = readStorage('user_data');
        const demo = readStorage('demo_mode');
        const strict = readStorage('preview_strict');

        // If demo mode is enabled in storage, prioritize mock user and skip token validation
        if (demo === 'true') {
          applyDemoModeFromStorage(strict);
          return;
        }

        if (storedToken && storedUser) {
          // Real authentication: validate token
          const validatedUser = validateToken(storedToken);
          if (validatedUser) {
            setUser(validatedUser);
            setAuthToken(storedToken);
          } else {
            // Token invalid, clear storage
            clearAuthStorage();
            // No user if token is invalid
            setUser(null);
            setAuthToken(null);
          }
        } else {
          // No stored token/user - check if we should load mock user for development
          // Only load mock user if explicitly set via mock_user_id (for testing/preview)
          const mockUser = loadMockUserFromStorage();
          if (mockUser) {
            setUser(mockUser);
          }
          // Otherwise, leave user as null (not authenticated)
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [applyDemoModeFromStorage, clearAuthStorage, loadMockUserFromStorage, readStorage]);

  const login = useCallback(async (userData: User, token: string, isNewUser: boolean = false) => {
    try {
      writeStorage('auth_token', token);
      writeStorage('user_data', JSON.stringify(userData));
      removeStorage('demo_mode');
      removeStorage('mock_user_id');

      setUser(userData);
      setAuthToken(token);
      setDemoModeState(false);

      const redirectTo = isNewUser ? '/admin/dashboard?new=true' : '/admin/dashboard';

      setTimeout(() => {
        navigateSafely(redirectTo);
      }, 300);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [removeStorage, writeStorage]);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      const token = readStorage('auth_token');
      await logoutService(token);
    } catch (error) {
      console.warn('Error calling logout API:', error);
    }

    setUser(null);
    setAuthToken(null);

    clearAuthStorage();
    removeStorage('mock_user_id');
    removeStorage('demo_mode');
    removeStorage('onboarding_completed');

    setTimeout(() => {
      navigateSafely('/auth');
      setLoading(false);
    }, 300);
  }, [clearAuthStorage, readStorage, removeStorage]);

  // Dev helpers: allow switching between mock users/roles
  const setMockUserByRole = useCallback((role: Role) => {
    const found = mockUsers.find(u => u.role === role);
    if (found) {
      setUser(found);
      writeStorage('mock_user_id', String(found.id));
    }
  }, [writeStorage]);

  const setMockUserById = useCallback((id: number) => {
    const found = mockUsers.find(u => u.id === id);
    if (found) {
      setUser(found);
      writeStorage('mock_user_id', String(found.id));
    }
  }, [writeStorage]);

  const enableDemoMode = useCallback(() => {
    setDemoModeState(true);
    writeStorage('demo_mode', 'true');
    const mockUser = loadMockUserFromStorage() || getCurrentUser();
    setUser(mockUser);
    setAuthToken(null);
  }, [loadMockUserFromStorage, writeStorage]);

  const disableDemoMode = useCallback(() => {
    setDemoModeState(false);
    removeStorage('demo_mode');

    const storedToken = readStorage('auth_token');
    if (storedToken) {
      const validatedUser = validateToken(storedToken);
      if (validatedUser) {
        setUser(validatedUser);
        setAuthToken(storedToken);
        return;
      }
      clearAuthStorage();
    }

    setUser(null);
    setAuthToken(null);
  }, [clearAuthStorage, readStorage, removeStorage]);

  const setDemoMode = useCallback((enabled: boolean) => {
    if (enabled) {
      enableDemoMode();
      return;
    }
    disableDemoMode();
  }, [disableDemoMode, enableDemoMode]);

  const isAuthenticated = !!user && (!!authToken || demoMode);

  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    authToken,
    isAuthenticated,
    setMockUserByRole,
    setMockUserById,
    demoMode,
    setDemoMode,
    previewStrict,
    setPreviewStrict
  }), [authToken, demoMode, isAuthenticated, loading, login, logout, previewStrict, setDemoMode, setMockUserById, setMockUserByRole, setPreviewStrict, user]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};