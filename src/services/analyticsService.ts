import { mockAnalyticsData, type AnalyticsData } from '../data/mockAnalytics';
import type { Role } from '../data/rolePermissions';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ==================== MOCK DATA LAYER ====================

async function getAnalyticsDataMock(userRole: Role, timeRange: string = '30d'): Promise<AnalyticsData> {
  await delay(500);
  
  // Filter data based on user role
  const filteredData = filterAnalyticsByRole(mockAnalyticsData, userRole);
  
  // Apply time range filtering (simplified for demo)
  return applyTimeRangeFilter(filteredData, timeRange);
}

async function exportAnalyticsDataMock(userRole: Role, timeRange: string, format: 'csv' | 'pdf' = 'csv'): Promise<string> {
  await delay(1000);
  
  // Simulate export generation
  const data = await getAnalyticsDataMock(userRole, timeRange);
  
  if (format === 'csv') {
    return generateCSVExport(data);
  } else {
    return generatePDFExport(data);
  }
}

// ==================== API DATA LAYER ====================

async function getAnalyticsDataApi(userRole: Role, timeRange: string = '30d'): Promise<AnalyticsData> {
  try {
    const analytics = await apiClient.get<AnalyticsData>(
      `${API_CONFIG.ENDPOINTS.ANALYTICS}?role=${userRole}&timeRange=${timeRange}`
    );
    return analytics;
  } catch (error) {
    console.error('Error fetching analytics from API:', error);
    // Fallback to mock data on error
    return getAnalyticsDataMock(userRole, timeRange);
  }
}

async function exportAnalyticsDataApi(userRole: Role, timeRange: string, format: 'csv' | 'pdf' = 'csv'): Promise<string> {
  try {
    const response = await apiClient.post<{ downloadUrl: string }>(
      API_CONFIG.ENDPOINTS.ANALYTICS_EXPORT as string,
      { role: userRole, timeRange, format }
    );
    return response.downloadUrl;
  } catch (error) {
    console.error('Error exporting analytics via API:', error);
    throw error;
  }
}

// ==================== PUBLIC API (Auto-switches between mock and real API) ====================

export async function getAnalyticsData(userRole: Role, timeRange: string = '30d'): Promise<AnalyticsData> {
  return useRealApi() ? getAnalyticsDataApi(userRole, timeRange) : getAnalyticsDataMock(userRole, timeRange);
}

export async function exportAnalyticsData(userRole: Role, timeRange: string, format: 'csv' | 'pdf' = 'csv'): Promise<string> {
  return useRealApi() ? exportAnalyticsDataApi(userRole, timeRange, format) : exportAnalyticsDataMock(userRole, timeRange, format);
}

// ==================== HELPER FUNCTIONS ====================

function filterAnalyticsByRole(data: AnalyticsData, userRole: Role): AnalyticsData {
  switch (userRole) {
    case 'creador':
    case 'administrador':
      // Full access to all analytics
      return data;
      
    case 'editor':
      // Access to content and moderation analytics
      return {
        ...data,
        users: {
          ...data.users,
          // Hide sensitive user data
          totalUsers: data.users.totalUsers,
          activeUsers: data.users.activeUsers,
          newUsers: 0, // Hide new user details
          retentionRate: 0,
          activityData: [],
          roleDistribution: []
        }
      };
      
    case 'escritor':
      // Only own content analytics
      return {
        overview: {
          ...data.overview,
          totalViews: Math.floor(data.overview.totalViews * 0.3), // Approximate own content
          totalPosts: Math.floor(data.overview.totalPosts * 0.2),
          activeUsers: 0,
          engagementRate: data.overview.engagementRate
        },
        trafficData: data.trafficData.map((item: any) => ({
          ...item,
          views: Math.floor(item.views * 0.3),
          users: Math.floor(item.users * 0.3)
        })),
        topPosts: data.topPosts.filter((_: any, index: number) => index < 3), // Only top 3
        content: {
          ...data.content,
          publishedPosts: Math.floor(data.content.publishedPosts * 0.2),
          topAuthors: data.content.topAuthors.filter((author: any) => author.id === 3) // Only own data
        },
        users: {
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0,
          retentionRate: 0,
          activityData: [],
          roleDistribution: []
        },
        performance: data.performance
      };
      
    case 'autor':
      // Very limited analytics
      return {
        overview: {
          totalViews: Math.floor(data.overview.totalViews * 0.1),
          totalPosts: Math.floor(data.overview.totalPosts * 0.05),
          activeUsers: 0,
          engagementRate: data.overview.engagementRate,
          viewsGrowth: data.overview.viewsGrowth,
          postsGrowth: 0,
          usersGrowth: 0,
          engagementGrowth: data.overview.engagementGrowth
        },
        trafficData: [],
        topPosts: [],
        content: {
          publishedPosts: 8,
          avgViewsPerPost: 245,
          engagementRate: 45.2,
          postsByCategory: [],
          performanceData: [],
          topAuthors: []
        },
        users: {
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0,
          retentionRate: 0,
          activityData: [],
          roleDistribution: []
        },
        performance: {
          metricsData: [],
          trafficSources: []
        }
      };
      
    default:
      // Minimal analytics for comentador
      return {
        overview: {
          totalViews: 0,
          totalPosts: 0,
          activeUsers: 0,
          engagementRate: 0,
          viewsGrowth: 0,
          postsGrowth: 0,
          usersGrowth: 0,
          engagementGrowth: 0
        },
        trafficData: [],
        topPosts: [],
        content: {
          publishedPosts: 0,
          avgViewsPerPost: 0,
          engagementRate: 0,
          postsByCategory: [],
          performanceData: [],
          topAuthors: []
        },
        users: {
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0,
          retentionRate: 0,
          activityData: [],
          roleDistribution: []
        },
        performance: {
          metricsData: [],
          trafficSources: []
        }
      };
  }
}

function applyTimeRangeFilter(data: AnalyticsData, timeRange: string): AnalyticsData {
  // Simplified time range filtering
  const multipliers = {
    '7d': 0.25,
    '30d': 1,
    '90d': 3,
    '1y': 12
  };
  
  const multiplier = multipliers[timeRange as keyof typeof multipliers] || 1;
  
  return {
    ...data,
    overview: {
      ...data.overview,
      totalViews: Math.floor(data.overview.totalViews * multiplier),
      totalPosts: Math.floor(data.overview.totalPosts * multiplier)
    },
    trafficData: data.trafficData.slice(-Math.floor(15 * multiplier))
  };
}

function generateCSVExport(data: AnalyticsData): string {
  // Simplified CSV generation
  const headers = ['Date', 'Views', 'Users', 'Sessions'];
  const rows = data.trafficData.map(item => [
    item.date,
    item.views.toString(),
    item.users.toString(),
    item.sessions.toString()
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generatePDFExport(data: AnalyticsData): string {
  // Return a mock PDF URL
  return '/exports/analytics-report.pdf';
}