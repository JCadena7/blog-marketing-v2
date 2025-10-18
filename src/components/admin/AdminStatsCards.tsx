import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  Heart,
  MessageCircle,
  Users,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color: string;
  suffix?: string;
  prefix?: string;
  description?: string;
  trend?: Array<{ date: string; value: number }>;
}

const AdminStatsCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  suffix = '',
  prefix = '',
  description,
  trend = []
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return TrendingUp;
      case 'decrease':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const ChangeIcon = getChangeIcon();

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor()}`}>
              <ChangeIcon size={16} className="mr-1" />
              <span className="font-medium">
                {Math.abs(change)}% vs mes anterior
              </span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>

      {/* Mini trend chart */}
      {trend.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-end space-x-1 h-8">
            {trend.slice(-7).map((point, index) => {
              const maxValue = Math.max(...trend.map(p => p.value));
              const height = (point.value / maxValue) * 100;
              
              return (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex-1 rounded-sm ${
                    changeType === 'increase' 
                      ? 'bg-green-200 dark:bg-green-800' 
                      : changeType === 'decrease'
                      ? 'bg-red-200 dark:bg-red-800'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ minHeight: '4px' }}
                />
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface StatsGridProps {
  userRole: string;
  userId?: number;
}

const AdminStatsGrid: React.FC<StatsGridProps> = ({ userRole, userId }) => {
  // Mock data - en una app real vendría de la API
  const getStatsForRole = () => {
    const baseStats = {
      totalViews: { value: 125430, change: 22.4, trend: generateTrendData() },
      totalPosts: { value: 156, change: 12.5, trend: generateTrendData() },
      totalUsers: { value: 2340, change: 8.3, trend: generateTrendData() },
      totalComments: { value: 1247, change: 15.7, trend: generateTrendData() },
      pendingPosts: { value: 8, change: -12.3, trend: generateTrendData() },
      pendingComments: { value: 23, change: 5.2, trend: generateTrendData() }
    };

    switch (userRole) {
      case 'creador':
      case 'administrador':
        return [
          {
            title: 'Total Vistas',
            value: baseStats.totalViews.value,
            change: baseStats.totalViews.change,
            changeType: 'increase' as const,
            icon: Eye,
            color: 'bg-blue-500',
            description: 'Vistas totales del sitio',
            trend: baseStats.totalViews.trend
          },
          {
            title: 'Total Posts',
            value: baseStats.totalPosts.value,
            change: baseStats.totalPosts.change,
            changeType: 'increase' as const,
            icon: FileText,
            color: 'bg-green-500',
            description: 'Posts publicados y borradores',
            trend: baseStats.totalPosts.trend
          },
          {
            title: 'Usuarios Activos',
            value: baseStats.totalUsers.value,
            change: baseStats.totalUsers.change,
            changeType: 'increase' as const,
            icon: Users,
            color: 'bg-purple-500',
            description: 'Usuarios registrados',
            trend: baseStats.totalUsers.trend
          },
          {
            title: 'Posts Pendientes',
            value: baseStats.pendingPosts.value,
            change: baseStats.pendingPosts.change,
            changeType: 'decrease' as const,
            icon: Clock,
            color: 'bg-orange-500',
            description: 'Esperando aprobación',
            trend: baseStats.pendingPosts.trend
          }
        ];

      case 'editor':
        return [
          {
            title: 'Posts para Revisar',
            value: baseStats.pendingPosts.value,
            icon: Clock,
            color: 'bg-orange-500',
            description: 'Posts pendientes de aprobación'
          },
          {
            title: 'Comentarios Moderación',
            value: baseStats.pendingComments.value,
            icon: MessageCircle,
            color: 'bg-purple-500',
            description: 'Comentarios por moderar'
          },
          {
            title: 'Posts Publicados Hoy',
            value: 3,
            change: 15.2,
            changeType: 'increase' as const,
            icon: CheckCircle,
            color: 'bg-green-500',
            description: 'Posts aprobados hoy'
          }
        ];

      case 'escritor':
        const userPosts = 34; // En una app real, filtrarías por userId
        const userViews = 15420;
        const userDrafts = 5;

        return [
          {
            title: 'Mis Posts',
            value: userPosts,
            icon: FileText,
            color: 'bg-blue-500',
            description: 'Posts creados por ti'
          },
          {
            title: 'Vistas Totales',
            value: userViews,
            change: 22.4,
            changeType: 'increase' as const,
            icon: Eye,
            color: 'bg-green-500',
            description: 'Vistas en tus posts'
          },
          {
            title: 'Posts en Borrador',
            value: userDrafts,
            icon: Clock,
            color: 'bg-orange-500',
            description: 'Borradores sin publicar'
          }
        ];

      case 'autor':
        return [
          {
            title: 'Posts Pendientes',
            value: 2,
            icon: Clock,
            color: 'bg-orange-500',
            description: 'Esperando aprobación'
          },
          {
            title: 'Posts Aprobados',
            value: 8,
            change: 33.3,
            changeType: 'increase' as const,
            icon: CheckCircle,
            color: 'bg-green-500',
            description: 'Posts publicados'
          },
          {
            title: 'Comentarios Recibidos',
            value: 45,
            icon: MessageCircle,
            color: 'bg-purple-500',
            description: 'En tus posts'
          }
        ];

      case 'comentador':
        return [
          {
            title: 'Mis Comentarios',
            value: 23,
            icon: MessageCircle,
            color: 'bg-blue-500',
            description: 'Comentarios realizados'
          },
          {
            title: 'Posts Comentados',
            value: 12,
            icon: FileText,
            color: 'bg-green-500',
            description: 'Posts donde has comentado'
          },
          {
            title: 'Likes Recibidos',
            value: 89,
            change: 18.7,
            changeType: 'increase' as const,
            icon: Heart,
            color: 'bg-red-500',
            description: 'En tus comentarios'
          }
        ];

      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AdminStatsCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
};

// Helper function to generate mock trend data
const generateTrendData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
    value: Math.floor(Math.random() * 100) + 50
  }));
};

export default AdminStatsGrid;