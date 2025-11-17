import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, type User, mockUsers } from '../data/mockUsers';
import type { Role } from '../data/rolePermissions';
import { validateToken, logout as logoutService } from '../services/authService';

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
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoModeState] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [previewStrict, setPreviewStrictState] = useState(false);

  // Define setPreviewStrict before useEffect so it's available in the provider
  const setPreviewStrict = (enabled: boolean) => {
    setPreviewStrictState(enabled);
    if (typeof window !== 'undefined') {
      if (enabled) {
        localStorage.setItem('preview_strict', 'true');
      } else {
        localStorage.removeItem('preview_strict');
      }
    }
  };

  useEffect(() => {
    // Load user from localStorage or validate existing token
    const initAuth = async () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
        // console.log('Stored token:', storedToken);
        // console.log('Stored user:', storedUser);
        const demo = typeof window !== 'undefined' ? localStorage.getItem('demo_mode') : null;
        const strict = typeof window !== 'undefined' ? localStorage.getItem('preview_strict') : null;

        // If demo mode is enabled in storage, prioritize mock user and skip token validation
        if (demo === 'true') {
          setDemoModeState(true);
          if (strict === 'true') setPreviewStrictState(true);

          const storedId = typeof window !== 'undefined' ? localStorage.getItem('mock_user_id') : null;
          const found = storedId ? mockUsers.find(u => u.id === Number(storedId)) : getCurrentUser();

          setUser(found || getCurrentUser());
          setAuthToken(null); // demo mode does not use a real token
          setLoading(false);
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
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_data');
            }
            // No user if token is invalid
            setUser(null);
            setAuthToken(null);
          }
        } else {
          // No stored token/user - check if we should load mock user for development
          // Only load mock user if explicitly set via mock_user_id (for testing/preview)
          const storedId = typeof window !== 'undefined' ? localStorage.getItem('mock_user_id') : null;
          if (storedId) {
            const found = mockUsers.find(u => u.id === Number(storedId));
            if (found) {
              setUser(found);
            }
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
  }, []);

  const login = async (userData: User, token: string, isNewUser: boolean = false) => {
    try {
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        console.log('User logged in:', userData);
        // Clear demo mode when doing real login
        localStorage.removeItem('demo_mode');
        localStorage.removeItem('mock_user_id');
      }

      // Update state
      setUser(userData);
      setAuthToken(token);
      setDemoModeState(false);

      // Redirect based on user type
      const redirectTo = isNewUser 
        ? '/admin/dashboard?new=true' 
        : '/admin/dashboard';

      // Small delay for animations to complete
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 300);

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      await logoutService(token);
    } catch (error) {
      console.warn('Error calling logout API:', error);
    }

    // Clear state
    setUser(null);
    setAuthToken(null);

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('mock_user_id');
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('onboarding_completed');
    }

    // Redirect to auth page
    setTimeout(() => {
      window.location.href = '/auth';
      setLoading(false);
    }, 300);
  };

  // Dev helpers: allow switching between mock users/roles
  const setMockUserByRole = (role: Role) => {
    const found = mockUsers.find(u => u.role === role);
    if (found) {
      setUser(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user_id', String(found.id));
      }
    }
  };

  const setMockUserById = (id: number) => {
    const found = mockUsers.find(u => u.id === id);
    if (found) {
      setUser(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user_id', String(found.id));
      }
    }
  };

  /**
   * Toggle demo mode.
   * - When enabling: persist demo flag, load mock user (from mock_user_id if available, otherwise getCurrentUser()) and clear real auth token.
   * - When disabling: remove demo flag and try to rehydrate from a stored auth token (validate it). If none, clear user.
   */
  const setDemoMode = (enabled: boolean) => {
    if (enabled) {
      setDemoModeState(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_mode', 'true');
      }

      const storedId = typeof window !== 'undefined' ? localStorage.getItem('mock_user_id') : null;
      const found = storedId ? mockUsers.find(u => u.id === Number(storedId)) : getCurrentUser();

      setUser(found || getCurrentUser());
      setAuthToken(null); // demo mode doesn't rely on a real token
    } else {
      setDemoModeState(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('demo_mode');
      }

      // Try to rehydrate from a stored token if the user had previously logged in
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          const validatedUser = validateToken(storedToken);
          if (validatedUser) {
            setUser(validatedUser);
            setAuthToken(storedToken);
            return;
          }
          // invalid token -> cleanup
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }

      // No token found -> clear user
      setUser(null);
      setAuthToken(null);
    }
  };

  const isAuthenticated = !!user && (!!authToken || demoMode);
  
  return (
    <AuthContext.Provider value={{ 
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};