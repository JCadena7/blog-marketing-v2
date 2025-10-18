import type { AnalyticsData } from '../types';

export type { AnalyticsData } from '../types';

export const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalViews: 125430,
    totalPosts: 156,
    activeUsers: 2340,
    engagementRate: 68.5,
    viewsGrowth: 22.4,
    postsGrowth: 12.5,
    usersGrowth: 8.3,
    engagementGrowth: 15.7
  },
  trafficData: [
    { date: '2024-01-01', views: 3200, users: 1200, sessions: 1800 },
    { date: '2024-01-02', views: 3450, users: 1350, sessions: 1950 },
    { date: '2024-01-03', views: 3100, users: 1100, sessions: 1650 },
    { date: '2024-01-04', views: 3800, users: 1450, sessions: 2100 },
    { date: '2024-01-05', views: 4200, users: 1600, sessions: 2300 },
    { date: '2024-01-06', views: 3900, users: 1500, sessions: 2150 },
    { date: '2024-01-07', views: 4100, users: 1550, sessions: 2250 },
    { date: '2024-01-08', views: 4500, users: 1700, sessions: 2400 },
    { date: '2024-01-09', views: 4300, users: 1650, sessions: 2350 },
    { date: '2024-01-10', views: 4600, users: 1750, sessions: 2500 },
    { date: '2024-01-11', views: 4800, users: 1800, sessions: 2600 },
    { date: '2024-01-12', views: 5100, users: 1900, sessions: 2750 },
    { date: '2024-01-13', views: 4900, users: 1850, sessions: 2650 },
    { date: '2024-01-14', views: 5200, users: 1950, sessions: 2800 },
    { date: '2024-01-15', views: 5400, users: 2000, sessions: 2900 }
  ],
  topPosts: [
    {
      id: 1,
      title: "Guía Completa de SEO para 2024",
      views: 15420,
      likes: 342,
      comments: 89,
      shares: 156
    },
    {
      id: 2,
      title: "Email Marketing: Automatizaciones que Convierten",
      views: 12150,
      likes: 278,
      comments: 67,
      shares: 134
    },
    {
      id: 3,
      title: "Social Media Marketing: Tendencias 2024",
      views: 9470,
      likes: 203,
      comments: 45,
      shares: 98
    },
    {
      id: 4,
      title: "Google Analytics 4: Configuración Avanzada",
      views: 11200,
      likes: 289,
      comments: 72,
      shares: 167
    },
    {
      id: 5,
      title: "Content Marketing que Vende",
      views: 7820,
      likes: 167,
      comments: 38,
      shares: 89
    }
  ],
  content: {
    publishedPosts: 156,
    avgViewsPerPost: 804,
    engagementRate: 68.5,
    postsByCategory: [
      { name: 'SEO', value: 24, color: '#10B981' },
      { name: 'SEM', value: 18, color: '#3B82F6' },
      { name: 'Social Media', value: 21, color: '#F59E0B' },
      { name: 'Email Marketing', value: 15, color: '#8B5CF6' },
      { name: 'Content Marketing', value: 19, color: '#EF4444' },
      { name: 'Analytics', value: 12, color: '#06B6D4' }
    ],
    performanceData: [
      { category: 'SEO', views: 45200, engagement: 72 },
      { category: 'SEM', views: 38900, engagement: 65 },
      { category: 'Social Media', views: 42100, engagement: 78 },
      { category: 'Email Marketing', views: 31500, engagement: 69 },
      { category: 'Content Marketing', views: 39800, engagement: 74 },
      { category: 'Analytics', views: 28400, engagement: 61 }
    ],
    topAuthors: [
      {
        id: 3,
        name: 'Carlos Martínez',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
        postsCount: 34,
        totalViews: 45200,
        engagementRate: 72
      },
      {
        id: 4,
        name: 'Ana Rodríguez',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
        postsCount: 28,
        totalViews: 38900,
        engagementRate: 65
      },
      {
        id: 2,
        name: 'María González',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        postsCount: 22,
        totalViews: 31500,
        engagementRate: 69
      }
    ]
  },
  users: {
    totalUsers: 2340,
    activeUsers: 1850,
    newUsers: 245,
    retentionRate: 78.5,
    activityData: [
      { date: '2024-01-01', activeUsers: 1200, newUsers: 45 },
      { date: '2024-01-02', activeUsers: 1350, newUsers: 52 },
      { date: '2024-01-03', activeUsers: 1100, newUsers: 38 },
      { date: '2024-01-04', activeUsers: 1450, newUsers: 67 },
      { date: '2024-01-05', activeUsers: 1600, newUsers: 73 },
      { date: '2024-01-06', activeUsers: 1500, newUsers: 61 },
      { date: '2024-01-07', activeUsers: 1550, newUsers: 58 },
      { date: '2024-01-08', activeUsers: 1700, newUsers: 82 },
      { date: '2024-01-09', activeUsers: 1650, newUsers: 76 },
      { date: '2024-01-10', activeUsers: 1750, newUsers: 89 },
      { date: '2024-01-11', activeUsers: 1800, newUsers: 94 },
      { date: '2024-01-12', activeUsers: 1900, newUsers: 103 },
      { date: '2024-01-13', activeUsers: 1850, newUsers: 87 },
      { date: '2024-01-14', activeUsers: 1950, newUsers: 112 },
      { date: '2024-01-15', activeUsers: 2000, newUsers: 125 }
    ],
    roleDistribution: [
      { name: 'Comentadores', count: 1890, percentage: 80.8, color: '#6B7280' },
      { name: 'Autores', count: 234, percentage: 10.0, color: '#F59E0B' },
      { name: 'Escritores', count: 156, percentage: 6.7, color: '#10B981' },
      { name: 'Editores', count: 45, percentage: 1.9, color: '#3B82F6' },
      { name: 'Administradores', count: 12, percentage: 0.5, color: '#EF4444' },
      { name: 'Creadores', count: 3, percentage: 0.1, color: '#8B5CF6' }
    ]
  },
  performance: {
    metricsData: [
      { date: '2024-01-01', pageSpeed: 2.1, engagement: 65, bounceRate: 35 },
      { date: '2024-01-02', pageSpeed: 2.3, engagement: 68, bounceRate: 32 },
      { date: '2024-01-03', pageSpeed: 2.0, engagement: 62, bounceRate: 38 },
      { date: '2024-01-04', pageSpeed: 1.9, engagement: 71, bounceRate: 29 },
      { date: '2024-01-05', pageSpeed: 2.2, engagement: 69, bounceRate: 31 },
      { date: '2024-01-06', pageSpeed: 2.1, engagement: 67, bounceRate: 33 },
      { date: '2024-01-07', pageSpeed: 1.8, engagement: 73, bounceRate: 27 }
    ],
    trafficSources: [
      { name: 'Búsqueda Orgánica', visitors: 45230, percentage: 45.2 },
      { name: 'Directo', visitors: 28150, percentage: 28.1 },
      { name: 'Redes Sociales', visitors: 15670, percentage: 15.7 },
      { name: 'Referencias', visitors: 7890, percentage: 7.9 },
      { name: 'Email', visitors: 3060, percentage: 3.1 }
    ]
  }
};