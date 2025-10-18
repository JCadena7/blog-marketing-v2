import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  MessageCircle, 
  Eye, 
  Heart, 
  Share2,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';

import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { usePermissions } from '../../hooks/usePermissions';
import { getAnalyticsData } from '../../services/analyticsService';
import type { AnalyticsData } from '../../data/mockAnalytics';

import Card from '../ui/Card';
import Button from '../ui/Button';
import MetricCard from '../dashboard/MetricCard';

const AnalyticsDashboard: React.FC = () => {
  const { userRole, hasPermission } = usePermissions();
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, userRole]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalyticsData(userRole, timeRange);
      setAnalyticsData(data);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: BarChart3, permission: [] },
    { id: 'content', name: 'Contenido', icon: FileText, permission: ['crear_post', 'editar_post_cualquiera'] },
    { id: 'users', name: 'Usuarios', icon: Users, permission: ['admin_completo'] },
    { id: 'performance', name: 'Rendimiento', icon: Activity, permission: ['editar_post_cualquiera'] }
  ].filter(tab => 
    tab.permission.length === 0 || 
    tab.permission.some(permission => hasPermission(permission as any))
  );

  const timeRangeOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '1y', label: 'Último año' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Métricas y análisis detallado del rendimiento
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {hasPermission('admin_completo') && (
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon size={16} />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab analyticsData={analyticsData} loading={loading} />
          )}
          {activeTab === 'content' && (
            <ContentTab analyticsData={analyticsData} loading={loading} />
          )}
          {activeTab === 'users' && (
            <UsersTab analyticsData={analyticsData} loading={loading} />
          )}
          {activeTab === 'performance' && (
            <PerformanceTab analyticsData={analyticsData} loading={loading} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const OverviewTab: React.FC<{ analyticsData: AnalyticsData | null; loading: boolean }> = ({ 
  analyticsData, 
  loading 
}) => {
  if (loading || !analyticsData) {
    return <AnalyticsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Vistas"
          value={analyticsData.overview.totalViews}
          change={analyticsData.overview.viewsGrowth}
          changeType="increase"
          icon={Eye}
          color="bg-blue-500"
        />
        <MetricCard
          title="Posts Publicados"
          value={analyticsData.overview.totalPosts}
          change={analyticsData.overview.postsGrowth}
          changeType="increase"
          icon={FileText}
          color="bg-green-500"
        />
        <MetricCard
          title="Usuarios Activos"
          value={analyticsData.overview.activeUsers}
          change={analyticsData.overview.usersGrowth}
          changeType="increase"
          icon={Users}
          color="bg-purple-500"
        />
        <MetricCard
          title="Engagement Rate"
          value={`${analyticsData.overview.engagementRate}%`}
          change={analyticsData.overview.engagementGrowth}
          changeType="increase"
          icon={Heart}
          color="bg-red-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tráfico del Sitio Web
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.trafficData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  className="text-sm fill-gray-600 dark:fill-gray-400"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-sm fill-gray-600 dark:fill-gray-400"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Content */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contenido Más Popular
          </h3>
          <div className="space-y-4">
            {analyticsData.topPosts.map((post: AnalyticsData['topPosts'][number], index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {post.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Heart size={14} className="mr-1" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle size={14} className="mr-1" />
                      {post.comments}
                    </span>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const ContentTab: React.FC<{ analyticsData: AnalyticsData | null; loading: boolean }> = ({ 
  analyticsData, 
  loading 
}) => {
  if (loading || !analyticsData) {
    return <AnalyticsLoadingSkeleton />;
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Content Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Posts Publicados"
          value={analyticsData.content.publishedPosts}
          change={15.2}
          changeType="increase"
          icon={FileText}
          color="bg-blue-500"
        />
        <MetricCard
          title="Promedio Vistas/Post"
          value={analyticsData.content.avgViewsPerPost}
          change={8.7}
          changeType="increase"
          icon={Eye}
          color="bg-green-500"
        />
        <MetricCard
          title="Engagement Rate"
          value={`${analyticsData.content.engagementRate}%`}
          change={12.3}
          changeType="increase"
          icon={Heart}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts by Category */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Posts por Categoría
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip />
                <RechartsPieChart
                  data={analyticsData.content.postsByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >
                  {analyticsData.content.postsByCategory.map((entry: AnalyticsData['content']['postsByCategory'][number], index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPieChart>
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Content Performance */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Rendimiento de Contenido
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.content.performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#3B82F6" name="Vistas" />
                <Bar dataKey="engagement" fill="#10B981" name="Engagement" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Authors */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Autores Más Activos
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Autor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Posts</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Vistas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.content.topAuthors.map((author: AnalyticsData['content']['topAuthors'][number], index: number) => (
                <motion.tr
                  key={author.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {author.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {author.postsCount}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {author.totalViews.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${author.engagementRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {author.engagementRate}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const UsersTab: React.FC<{ analyticsData: AnalyticsData | null; loading: boolean }> = ({ 
  analyticsData, 
  loading 
}) => {
  if (loading || !analyticsData) {
    return <AnalyticsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Usuarios Totales"
          value={analyticsData.users.totalUsers}
          change={8.3}
          changeType="increase"
          icon={Users}
          color="bg-blue-500"
        />
        <MetricCard
          title="Usuarios Activos"
          value={analyticsData.users.activeUsers}
          change={12.1}
          changeType="increase"
          icon={Activity}
          color="bg-green-500"
        />
        <MetricCard
          title="Nuevos Usuarios"
          value={analyticsData.users.newUsers}
          change={25.4}
          changeType="increase"
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <MetricCard
          title="Retención"
          value={`${analyticsData.users.retentionRate}%`}
          change={5.2}
          changeType="increase"
          icon={Heart}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actividad de Usuarios
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.users.activityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Usuarios Activos"
                />
                <Line 
                  type="monotone" 
                  dataKey="newUsers" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Nuevos Usuarios"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* User Roles Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribución por Roles
          </h3>
          <div className="space-y-4">
            {analyticsData.users.roleDistribution.map((role: AnalyticsData['users']['roleDistribution'][number], index: number) => (
              <div key={role.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{role.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {role.count}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ({role.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const PerformanceTab: React.FC<{ analyticsData: AnalyticsData | null; loading: boolean }> = ({ 
  analyticsData, 
  loading 
}) => {
  if (loading || !analyticsData) {
    return <AnalyticsLoadingSkeleton />;
  }

  // Colors for traffic sources legend
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Tiempo Promedio en Página"
          value="3:24"
          change={15.7}
          changeType="increase"
          icon={Activity}
          color="bg-blue-500"
        />
        <MetricCard
          title="Bounce Rate"
          value="32.1%"
          change={-8.2}
          changeType="decrease"
          icon={TrendingUp}
          color="bg-green-500"
        />
        <MetricCard
          title="Conversión"
          value="4.8%"
          change={22.3}
          changeType="increase"
          icon={Target}
          color="bg-purple-500"
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Métricas de Rendimiento
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.performance.metricsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="pageSpeed" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Velocidad de Página"
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Engagement"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fuentes de Tráfico
          </h3>
          <div className="space-y-4">
            {analyticsData.performance.trafficSources.map((source: AnalyticsData['performance']['trafficSources'][number], index: number) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{source.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {source.percentage}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ({source.visitors.toLocaleString()})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const AnalyticsLoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </Card>
      ))}
    </div>
  </div>
);

export default AnalyticsDashboard;