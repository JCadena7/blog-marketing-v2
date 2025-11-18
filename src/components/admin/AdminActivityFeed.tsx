import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  FileText, 
  MessageCircle, 
  Users, 
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

import { usePermissions } from '../../hooks/usePermissions';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ActivityItem {
  id: string;
  type: 'post_created' | 'post_published' | 'comment_added' | 'user_registered' | 'post_edited' | 'comment_moderated';
  title: string;
  description: string;
  user: {
    id: number;
    name: string;
    avatar: string;
    role: string;
  };
  timestamp: string;
  metadata?: {
    postTitle?: string;
    postId?: number;
    commentId?: number;
    userId?: number;
    oldStatus?: string;
    newStatus?: string;
  };
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const AdminActivityFeed: React.FC = () => {
  const { hasPermission, userRole } = usePermissions();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const navigateSafely = (path: string) => {
    if (typeof globalThis !== 'undefined' && 'location' in globalThis && globalThis.location) {
      globalThis.location.assign(path);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [filter, userRole]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Simular carga de actividades
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'post_published',
          title: 'Post publicado',
          description: 'Guía Completa de SEO para 2024',
          user: {
            id: 2,
            name: 'María González',
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
            role: 'editor'
          },
          timestamp: '2024-01-15T10:30:00Z',
          metadata: {
            postTitle: 'Guía Completa de SEO para 2024',
            postId: 1,
            oldStatus: 'pending',
            newStatus: 'published'
          },
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
        },
        {
          id: '2',
          type: 'comment_added',
          title: 'Nuevo comentario',
          description: 'Comentario en "Email Marketing: Automatizaciones"',
          user: {
            id: 5,
            name: 'Laura García',
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
            role: 'comentador'
          },
          timestamp: '2024-01-15T09:45:00Z',
          metadata: {
            postTitle: 'Email Marketing: Automatizaciones',
            postId: 2,
            commentId: 15
          },
          icon: MessageCircle,
          color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
        },
        {
          id: '3',
          type: 'post_created',
          title: 'Post creado',
          description: 'Social Media Marketing: Tendencias 2024',
          user: {
            id: 3,
            name: 'Carlos Martínez',
            avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
            role: 'escritor'
          },
          timestamp: '2024-01-15T08:20:00Z',
          metadata: {
            postTitle: 'Social Media Marketing: Tendencias 2024',
            postId: 3
          },
          icon: FileText,
          color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400'
        },
        {
          id: '4',
          type: 'user_registered',
          title: 'Nuevo usuario registrado',
          description: 'Roberto Silva se unió como comentador',
          user: {
            id: 1,
            name: 'Sistema',
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
            role: 'sistema'
          },
          timestamp: '2024-01-15T07:15:00Z',
          metadata: {
            userId: 6
          },
          icon: Users,
          color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
        },
        {
          id: '5',
          type: 'comment_moderated',
          title: 'Comentario moderado',
          description: 'Comentario marcado como spam',
          user: {
            id: 2,
            name: 'María González',
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
            role: 'editor'
          },
          timestamp: '2024-01-15T06:30:00Z',
          metadata: {
            commentId: 12,
            oldStatus: 'pending',
            newStatus: 'spam'
          },
          icon: XCircle,
          color: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
        }
      ];

      // Filtrar actividades según permisos del usuario
      const filteredActivities = mockActivities.filter(activity => {
        if (hasPermission('admin_completo')) return true;
        
        switch (activity.type) {
          case 'post_created':
          case 'post_published':
          case 'post_edited':
            return hasPermission('crear_post') || hasPermission('editar_post_cualquiera');
          case 'comment_added':
          case 'comment_moderated':
            return hasPermission('comentar');
          case 'user_registered':
            return hasPermission('admin_completo');
          default:
            return false;
        }
      });

      setActivities(filteredActivities);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      post_created: 'Posts Creados',
      post_published: 'Posts Publicados',
      post_edited: 'Posts Editados',
      comment_added: 'Comentarios Nuevos',
      comment_moderated: 'Comentarios Moderados',
      user_registered: 'Usuarios Registrados'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const activityTypes = [...new Set(activities.map(a => a.type))];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividad Reciente
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Todas las actividades</option>
            {activityTypes.map(type => (
              <option key={type} value={type}>
                {getActivityTypeLabel(type)}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadActivities}
            loading={loading}
          >
            <RefreshCw size={16} className="mr-1" />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activities
            .filter(activity => filter === 'all' || activity.type === filter)
            .map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                onClick={() => {
                  // Navigate to relevant section based on activity type
                  if (activity.metadata?.postId) {
                    navigateSafely(`/admin/posts/${activity.metadata.postId}/edit`);
                  } else if (activity.metadata?.commentId) {
                    navigateSafely(`/admin/comentarios?highlight=${activity.metadata.commentId}`);
                  } else if (activity.metadata?.userId) {
                    navigateSafely(`/admin/usuarios/${activity.metadata.userId}`);
                  }
                }}
              >
                {/* Activity Icon */}
                <div className={`p-2 rounded-full ${activity.color}`}>
                  <activity.icon size={16} />
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={activity.user.avatar}
                        alt={activity.user.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.user.name}
                      </span>
                    </div>
                    
                    {activity.metadata?.oldStatus && activity.metadata?.newStatus && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.metadata.oldStatus} → {activity.metadata.newStatus}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Indicator */}
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {activities.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p>No hay actividad reciente</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      )}
    </Card>
  );
};

export default AdminActivityFeed;