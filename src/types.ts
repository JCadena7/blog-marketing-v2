// ============================================================================
// TYPES.TS - Definiciones de tipos centralizadas para el proyecto
// ============================================================================

// ============================================================================
// ROLES Y PERMISOS
// ============================================================================

export type Role = 'creador' | 'administrador' | 'editor' | 'escritor' | 'autor' | 'comentador';

export type Permission = 
  | 'admin_completo'
  | 'asignar_roles'
  | 'comentar'
  | 'crear_categoria'
  | 'crear_post'
  | 'editar_categoria'
  | 'editar_post_cualquiera'
  | 'editar_post_propio'
  | 'eliminar_categoria'
  | 'publicar_post'
  | 'reaccionar'
  | 'rechazar_post';

export interface RoleConfig {
  color: string;
  icon: string;
  name: string;
}

// ============================================================================
// USUARIOS
// ============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  permissions: Permission[];
  stats: {
    postsCreated?: number;
    commentsApproved?: number;
    usersManaged?: number;
    postsEdited?: number;
    postsPublished?: number;
    commentsModerated?: number;
    totalViews?: number;
  };
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  website?: string;
  location?: string;
  phone?: string;
  birthDate?: string;
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  onlineStatus: 'online' | 'offline' | 'away';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  preferences: UserPreferences;
  stats: UserStats;
  activity: UserActivity[];
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  defaultEditor: 'markdown' | 'wysiwyg' | 'hybrid';
  autoSave: boolean;
  showSocialLinks: boolean;
  showEmail: boolean;
  profileVisibility: 'public' | 'users' | 'followers' | 'private';
  allowDirectMessages: 'everyone' | 'followers' | 'none';
  showOnlineStatus: boolean;
  allowAnalytics: boolean;
  indexPosts: boolean;
  allowComments: boolean;
  moderateComments: boolean;
}

export interface UserStats {
  postsCreated: number;
  postsPublished: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followers: number;
  following: number;
  likesReceived: number;
  commentsReceived: number;
  profileViews: number;
  postsGrowth?: number;
  viewsGrowth?: number;
  likesGrowth?: number;
  followersGrowth?: number;
}

export interface UserActivity {
  id: string;
  type: 'post_created' | 'post_published' | 'comment_added' | 'profile_updated' | 'follow' | 'like_given';
  description: string;
  target?: string;
  content?: string;
  createdAt: string;
  metadata?: any;
}

// ============================================================================
// POSTS
// ============================================================================

export type PostStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: PostStatus;
  authorId: number;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
  tags: string[];
  featuredImage: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  seo: PostSEO;
  editorial?: PostEditorial;
}

export interface PostSEO {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  readabilityScore?: number;
}

export interface PostEditorial {
  reviewerId?: number;
  reviewedAt?: string;
  reviewNotes?: string;
  approvedBy?: number;
  submittedAt?: string;
  status?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  publishedAt: string;
  readTime: number;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  category: {
    name: string;
    color: string;
    slug: string;
  };
  image: string;
  tags: string[];
  featured: boolean;
  views: number;
  likes: number;
}

// ============================================================================
// CATEGORÍAS
// ============================================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  postsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

// ============================================================================
// COMENTARIOS
// ============================================================================

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface Comment {
  id: number;
  postId: string | number;
  postTitle: string;
  authorId: number;
  author: {
    id: number;
    name: string;
    email: string;
    avatar: string;
  };
  content: string;
  status: CommentStatus;
  parentId?: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  moderatedBy?: number;
  moderatedAt?: string;
  moderationNotes?: string;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trafficData: TrafficDataPoint[];
  topPosts: TopPost[];
  content: ContentAnalytics;
  users: UsersAnalytics;
  performance: PerformanceAnalytics;
}

export interface AnalyticsOverview {
  totalViews: number;
  totalPosts: number;
  activeUsers: number;
  engagementRate: number;
  viewsGrowth: number;
  postsGrowth: number;
  usersGrowth: number;
  engagementGrowth: number;
}

export interface TrafficDataPoint {
  date: string;
  views: number;
  users: number;
  sessions: number;
}

export interface TopPost {
  id: number;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface ContentAnalytics {
  publishedPosts: number;
  avgViewsPerPost: number;
  engagementRate: number;
  postsByCategory: CategoryData[];
  performanceData: CategoryPerformance[];
  topAuthors: TopAuthor[];
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface CategoryPerformance {
  category: string;
  views: number;
  engagement: number;
}

export interface TopAuthor {
  id: number;
  name: string;
  avatar: string;
  postsCount: number;
  totalViews: number;
  engagementRate: number;
}

export interface UsersAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  activityData: UserActivityData[];
  roleDistribution: RoleDistributionData[];
}

export interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
}

export interface RoleDistributionData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PerformanceAnalytics {
  metricsData: PerformanceMetric[];
  trafficSources: TrafficSource[];
}

export interface PerformanceMetric {
  date: string;
  pageSpeed: number;
  engagement: number;
  bounceRate: number;
}

export interface TrafficSource {
  name: string;
  visitors: number;
  percentage: number;
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export interface SEOConfig {
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  googleSearchConsoleId: string;
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
}

// ============================================================================
// FILTROS Y BÚSQUEDA
// ============================================================================

export interface FilterOptions {
  status?: PostStatus[];
  categories?: number[];
  authors?: number[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// FORMULARIOS
// ============================================================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date';
  placeholder?: string;
  required?: boolean;
  validation?: any;
  options?: { label: string; value: any }[];
  defaultValue?: any;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'table' | 'list';
  data: any;
  size: 'sm' | 'md' | 'lg' | 'xl';
  refreshInterval?: number;
}

export interface StatCard {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
  color?: string;
}

// ============================================================================
// EDITOR
// ============================================================================

export interface EditorConfig {
  mode: 'markdown' | 'wysiwyg' | 'hybrid';
  autoSave: boolean;
  autoSaveInterval: number;
  spellCheck: boolean;
  wordCount: boolean;
  readabilityScore: boolean;
}

export interface EditorContent {
  title: string;
  content: string;
  excerpt: string;
  lastSaved?: string;
  wordCount?: number;
  readabilityScore?: number;
}

// ============================================================================
// MEDIA
// ============================================================================

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  mimeType: string;
  uploadedBy: number;
  uploadedAt: string;
  alt?: string;
  caption?: string;
}

export interface ImageUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// ============================================================================
// HERRAMIENTAS
// ============================================================================

export interface ROICalculatorData {
  investment: number;
  revenue: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  costs?: number;
}

export interface ROIResult {
  roi: number;
  profit: number;
  profitMargin: number;
  breakEvenPoint?: number;
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
