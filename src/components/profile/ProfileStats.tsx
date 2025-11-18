import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, FileText } from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getProfileStats } from '../../services/profileService';
import Card from '../ui/Card';

interface ProfileStatsProps {
  userId: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ userId }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadStats();
  }, [userId, timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getProfileStats(userId, timeRange);
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 3 meses' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const skeletonMetricKeys = ['posts', 'views', 'likes', 'comments'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skeletonMetricKeys.map((metricKey) => (
            <Card key={`metric-skeleton-${metricKey}`} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Estadísticas del Perfil
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Métricas de rendimiento y engagement
          </p>
        </div>
        
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Posts Creados"
          value={stats?.postsCreated || 0}
          change={stats?.postsGrowth}
          icon={FileText}
          color="bg-blue-500"
        />
        <MetricCard
          title="Total Vistas"
          value={stats?.totalViews || 0}
          change={stats?.viewsGrowth}
          icon={Eye}
          color="bg-green-500"
        />
        <MetricCard
          title="Likes Recibidos"
          value={stats?.likesReceived || 0}
          change={stats?.likesGrowth}
          icon={Heart}
          color="bg-red-500"
        />
        <MetricCard
          title="Comentarios"
          value={stats?.commentsReceived || 0}
          icon={MessageCircle}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Views Chart */}
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Vistas Diarias
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyViews || []}>
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
                  name="Vistas"
                />
                <Area 
                  type="monotone" 
                  dataKey="likes" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="Likes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Posts by Category */}
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Posts por Categoría
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.postsByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const name = entry?.name ?? '';
                    const rawPercent = entry?.percent;
                    const percentNum =
                      typeof rawPercent === 'number' ? rawPercent : Number(rawPercent) || 0;

                    return `${name} ${Math.round(percentNum * 100)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(stats?.postsByCategory || []).map((entry: any) => {
                    const entryKey = entry?.name ?? entry?.category ?? JSON.stringify(entry);
                    return (
                      <Cell
                        key={`category-${entryKey}`}
                        fill={COLORS[(entryKey.length || 0) % COLORS.length]}
                      />
                    );
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Métricas Detalladas
        </h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Métrica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tendencia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <StatsRow
                metric="Vistas de posts"
                total={stats?.totalViews || 0}
                average={Math.round((stats?.totalViews || 0) / (stats?.postsCreated || 1))}
                trend={stats?.viewsGrowth}
              />
              <StatsRow
                metric="Likes en posts"
                total={stats?.likesReceived || 0}
                average={Math.round((stats?.likesReceived || 0) / (stats?.postsCreated || 1))}
                trend={stats?.likesGrowth}
              />
              <StatsRow
                metric="Comentarios recibidos"
                total={stats?.commentsReceived || 0}
                average={Math.round((stats?.commentsReceived || 0) / (stats?.postsCreated || 1))}
                trend={12.5}
              />
              <StatsRow
                metric="Vistas de perfil"
                total={stats?.profileViews || 0}
                average={Math.round((stats?.profileViews || 0) / 30)}
                trend={8.7}
              />
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </p>
          
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {change >= 0 ? (
                <TrendingUp size={16} className="mr-1" />
              ) : (
                <TrendingDown size={16} className="mr-1" />
              )}
              <span className="font-medium">
                {Math.abs(change).toFixed(1)}% vs período anterior
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

interface StatsRowProps {
  metric: string;
  total: number;
  average: number;
  trend?: number;
}

const StatsRow: React.FC<StatsRowProps> = ({ metric, total, average, trend }) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {metric}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
        {total.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
        {average.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {trend !== undefined && (
          <div className={`flex items-center ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? (
              <TrendingUp size={16} className="mr-1" />
            ) : (
              <TrendingDown size={16} className="mr-1" />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </td>
    </tr>
  );
};

export default ProfileStats;