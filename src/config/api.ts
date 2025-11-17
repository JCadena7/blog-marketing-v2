/**
 * API Configuration
 * Toggle between mock data and real API
 */

// Verificar que la variable de entorno se está leyendo correctamente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Log de verificación (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:');
  console.log('  - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('  - BASE_URL (resolved):', API_BASE_URL);
  console.log('  - USE_REAL_API:', true);
}

// Type definition for API configuration
interface ApiConfig {
  USE_REAL_API: boolean;
  BASE_URL: string;
  ENDPOINTS: {
    [key: string]: 
      | string 
      | ((arg: string) => string)
      | ((arg: number) => string)
      | ((arg: string | number) => string)
      | ((arg1: number, arg2: number) => string);
  };
  TIMEOUT: number;
  RETRY: {
    MAX_RETRIES: number;
    RETRY_DELAY: number;
  };
}

export const API_CONFIG: ApiConfig = {
  // Set to false to use mock data, true to use real API
  USE_REAL_API: true, // Cambia a true cuando quieras usar el backend real
  
  // Base URL for the API (when USE_REAL_API is true)
  BASE_URL: API_BASE_URL,
  
  // API endpoints
  ENDPOINTS: {
    // ==================== AUTH ====================
    LOGIN: '/auths/sign-in',
    REGISTER: '/auths/sign-up',
    LOGOUT: '/auths/sign-out',
    REFRESH_TOKEN: '/auths/refresh',
    CREATE_USUARIO: '/auths/usuarios', // Crear usuario con Supabase
    VALIDATE_EMAIL: '/auths/validate-email',
    
    // ==================== USERS ====================
    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,
    USER_BY_USERNAME: (username: string) => `/users/username/${username}`,
    USER_BY_CLERK_ID: (clerkId: string) => `/users/clerk/${clerkId}`,
    // Nota: Para cambiar rol o status, usar PATCH /users/:id con el campo correspondiente
    CHANGE_USER_ROLE: (id: number) => `/users/${id}`, // Enviar { rolId: number }
    UPDATE_USER_STATUS: (id: number) => `/users/${id}`, // Enviar { status: string }
    
    // ==================== POSTS ====================
    POSTS: '/posts',
    POST_BY_ID: (id: string | number) => `/posts/${id}`,
    // ⚠️ No existe en backend - considerar implementar o buscar por ID
    POST_BY_SLUG: (slug: string) => `/posts/slug/${slug}`,
    // Usar PATCH /posts/:id con { estado_id: number }
    UPDATE_POST_STATUS: (id: string | number) => `/posts/${id}`,
    // Endpoints avanzados del backend
    POSTS_COMPLETOS: '/posts/completos',
    POSTS_POPULARES: '/posts/populares',
    POSTS_TRENDING: '/posts/trending',
    POSTS_ENGAGEMENT: '/posts/engagement',
    POSTS_SIN_COMENTARIOS: '/posts/sin-comentarios',
    POSTS_MAS_COMPARTIDOS: '/posts/mas-compartidos',
    POSTS_BORRADORES_ANTIGUOS: '/posts/borradores-antiguos',
    POSTS_STATS_POR_MES: '/posts/stats/por-mes',
    POSTS_STATS_MEJOR_RENDIMIENTO: (autorId: number) => `/posts/stats/mejor-rendimiento/${autorId}`,
    POSTS_STATS_DASHBOARD: '/posts/stats/dashboard',
    POST_INCREMENT_VISTA: (postId: number) => `/posts/vista/${postId}`,
    POST_LIKE: (postId: number) => `/posts/like/${postId}`,
    POST_ADD_CATEGORIAS: (id: number) => `/posts/${id}/add-categorias`,
    POST_KEYWORDS: (postId: number) => `/posts/${postId}/keywords`,
    POST_KEYWORDS_CREATE: (postId: number) => `/posts/${postId}/keywords/create`,
    KEYWORDS_FIND_OR_CREATE: '/posts/keywords/find-or-create',
    KEYWORDS_MAS_USADAS: '/posts/keywords/mas-usadas',
    
    // ==================== COMENTARIOS ====================
    // ⚠️ Backend usa 'comentarios' (español), no 'comments'
    COMMENTS: '/comentarios',
    COMMENT_BY_ID: (id: number) => `/comentarios/${id}`,
    COMMENTS_BY_POST: (postId: string | number) => `/comentarios/post/${postId}`,
    COMMENT_REPLIES: (id: number) => `/comentarios/${id}/replies`,
    MODERATE_COMMENT: (id: number) => `/comentarios/${id}/moderate`,
    // ⚠️ No existen en backend - considerar implementar
    COMMENT_LIKE: (id: number) => `/comentarios/${id}/like`,
    COMMENT_REPORT: (id: number) => `/comentarios/${id}/report`,
    // Estadísticas
    COMMENTS_STATS_GENERAL: '/comentarios/stats/general',
    COMMENTS_STATS_TOP_COMMENTED: '/comentarios/stats/top-commented',
    COMMENTS_STATS_MOST_ACTIVE: '/comentarios/stats/most-active',
    
    // ==================== CATEGORIAS ====================
    // ⚠️ Backend usa 'categorias' (español), no 'categories'
    CATEGORIES: '/categorias',
    CATEGORY_BY_ID: (id: number) => `/categorias/${id}`,
    // Usar PATCH /categorias/:id con { is_active: boolean }
    CATEGORY_TOGGLE_STATUS: (id: number) => `/categorias/${id}`,
    // Estadísticas
    CATEGORIES_STATS_GENERAL: '/categorias/stats/general',
    CATEGORIES_STATS_ENGAGEMENT: '/categorias/stats/engagement',
    CATEGORIES_STATS_MEJOR_RENDIMIENTO: '/categorias/stats/mejor-rendimiento',
    CATEGORIES_STATS_JERARQUICAS: '/categorias/stats/jerarquicas',
    
    // ==================== ESTADOS ====================
    ESTADOS: '/estados',
    ESTADO_BY_ID: (id: number) => `/estados/${id}`,
    ESTADOS_STATS: '/estados/stats/estadisticas',
    ESTADOS_POSTS_BY_NAME: (estadoNombre: string) => `/estados/stats/posts/${estadoNombre}`,
    
    // ==================== RBAC (Roles y Permisos) ====================
    RBAC_ROLES: '/rbac/roles',
    RBAC_ROLE_BY_ID: (id: number) => `/rbac/roles/${id}`,
    RBAC_PERMISOS: '/rbac/permisos',
    RBAC_PERMISO_BY_ID: (id: number) => `/rbac/permisos/${id}`,
    RBAC_PERMISOS_BY_ROLE: '/rbac/permisosByRole',
    RBAC_ASSIGN_PERMISO: (rolId: number) => `/rbac/asignar/roles/${rolId}/permisos`,
    RBAC_REVOKE_PERMISO: (roleId: number, permisoId: number) => `/rbac/roles/${roleId}/permisos/${permisoId}`,
    RBAC_REVOKE_MANY_PERMISOS: (rolId: number) => `/rbac/roles/${rolId}/permisos`,
    
    // ==================== USER ACTIVITIES ====================
    USER_ACTIVITIES: '/user-activities',
    USER_ACTIVITY_BY_ID: (id: string) => `/user-activities/${id}`,
    USER_ACTIVITIES_BY_USER: (userId: number) => `/user-activities/user/${userId}`,
    
    // ==================== PROFILES (⚠️ No existe en backend) ====================
    // Considerar usar /users en su lugar o implementar en backend
    PROFILES: '/profiles',
    PROFILE_BY_ID: (id: number) => `/profiles/${id}`,
    UPLOAD_AVATAR: (id: number) => `/profiles/${id}/avatar`,
    UPLOAD_COVER: (id: number) => `/profiles/${id}/cover`,
    
    // ==================== ANALYTICS (⚠️ No existe centralizado en backend) ====================
    // El backend tiene stats distribuidas en cada módulo
    ANALYTICS: '/analytics',
    ANALYTICS_EXPORT: '/analytics/export',
    
    // ==================== LEGACY (Mantener por compatibilidad) ====================
    PERMISSIONS: '/rbac/permisos',
    ROLE_PERMISSIONS: (role: string) => `/rbac/permisosByRole?role=${role}`,
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
