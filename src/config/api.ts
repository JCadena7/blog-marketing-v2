/**
 * API Configuration
 * Toggle between mock data and real API
 */

export const API_CONFIG = {
  // Set to false to use mock data, true to use real API
  USE_REAL_API: false,
  
  // Base URL for the API (when USE_REAL_API is true)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // API endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    
    // Users
    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,
    CHANGE_USER_ROLE: (id: number) => `/users/${id}/role`,
    UPDATE_USER_STATUS: (id: number) => `/users/${id}/status`,
    
    // Posts
    POSTS: '/posts',
    POST_BY_ID: (id: string | number) => `/posts/${id}`,
    POST_BY_SLUG: (slug: string) => `/posts/slug/${slug}`,
    UPDATE_POST_STATUS: (id: string | number) => `/posts/${id}/status`,
    
    // Comments
    COMMENTS: '/comments',
    COMMENT_BY_ID: (id: number) => `/comments/${id}`,
    COMMENTS_BY_POST: (postId: string | number) => `/comments/post/${postId}`,
    MODERATE_COMMENT: (id: number) => `/comments/${id}/moderate`,
    
    // Categories
    CATEGORIES: '/categories',
    CATEGORY_BY_ID: (id: number) => `/categories/${id}`,
    
    // Profiles
    PROFILES: '/profiles',
    PROFILE_BY_ID: (id: number) => `/profiles/${id}`,
    UPLOAD_AVATAR: (id: number) => `/profiles/${id}/avatar`,
    UPLOAD_COVER: (id: number) => `/profiles/${id}/cover`,
    
    // Analytics
    ANALYTICS: '/analytics',
    ANALYTICS_EXPORT: '/analytics/export',
    
    // Permissions
    PERMISSIONS: '/permissions',
    ROLE_PERMISSIONS: (role: string) => `/permissions/role/${role}`,
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  }
};

/**
 * Helper function to build full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Helper to check if we should use real API
 */
export function useRealApi(): boolean {
  return API_CONFIG.USE_REAL_API;
}
