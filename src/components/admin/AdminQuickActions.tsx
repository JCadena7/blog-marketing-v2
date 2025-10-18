import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Users, MessageCircle, Folder, Zap, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, ChartBar as BarChart3 } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useNotifications } from './AdminNotificationSystem';
import CreatePostWizard from './CreatePostWizard';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  permission?: string[];
  action: () => void;
  badge?: number;
}

const AdminQuickActions: React.FC = () => {
  const { hasAnyPermission, userRole } = usePermissions();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<string | null>(null);
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'create-post',
      label: 'Crear Post',
      description: 'Escribir un nuevo artículo',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600',
      permission: ['crear_post'],
      action: () => setShowCreateWizard(true)
    },
    {
      id: 'moderate-comments',
      label: 'Moderar Comentarios',
      description: 'Revisar comentarios pendientes',
      icon: MessageCircle,
      color: 'bg-purple-500 hover:bg-purple-600',
      permission: ['comentar', 'admin_completo'],
      action: () => {
        window.location.href = '/admin/comentarios?filter=pending';
      },
      badge: 5
    },
    {
      id: 'review-posts',
      label: 'Revisar Posts',
      description: 'Aprobar posts pendientes',
      icon: Clock,
      color: 'bg-orange-500 hover:bg-orange-600',
      permission: ['publicar_post'],
      action: () => {
        window.location.href = '/admin/posts?filter=pending';
      },
      badge: 3
    },
    {
      id: 'create-category',
      label: 'Nueva Categoría',
      description: 'Organizar el contenido',
      icon: Folder,
      color: 'bg-green-500 hover:bg-green-600',
      permission: ['crear_categoria'],
      action: () => {
        window.location.href = '/admin/categorias?action=create';
      }
    },
    {
      id: 'create-user',
      label: 'Nuevo Usuario',
      description: 'Agregar miembro al equipo',
      icon: Users,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      permission: ['admin_completo'],
      action: () => {
        window.location.href = '/admin/usuarios/nuevo';
      }
    },
    {
      id: 'view-analytics',
      label: 'Ver Analytics',
      description: 'Revisar métricas y estadísticas',
      icon: BarChart3,
      color: 'bg-teal-500 hover:bg-teal-600',
      permission: ['admin_completo', 'editar_post_cualquiera'],
      action: () => {
        window.location.href = '/admin/analytics';
      }
    }
  ];
  const availableActions = quickActions.filter(action => 
    !action.permission || hasAnyPermission(action.permission as any)
  );

  const handleQuickAction = async (actionId: string, actionFn: () => void) => {
    setLoading(actionId);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay
      actionFn();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo completar la acción'
      });
    } finally {
      setLoading(null);
    }
  };

  // Mostrar diferentes layouts según el rol
  const getLayoutForRole = () => {
    switch (userRole) {
      case 'creador':
      case 'administrador':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
      case 'editor':
        return 'grid-cols-2 md:grid-cols-4';
      case 'escritor':
      case 'autor':
        return 'grid-cols-2 md:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Acciones Rápidas
            </h2>
          </div>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {availableActions.length} disponibles
          </span>
        </div>

        <div className={`grid ${getLayoutForRole()} gap-4`}>
          {availableActions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction(action.id, action.action)}
              disabled={loading === action.id}
              className={`relative p-4 rounded-lg text-white transition-all duration-200 ${action.color} ${
                loading === action.id ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {/* Badge */}
              {action.badge && action.badge > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {action.badge > 9 ? '9+' : action.badge}
                </span>
              )}

              {/* Loading Spinner */}
              <AnimatePresence>
                {loading === action.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg"
                  >
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col items-center text-center space-y-2">
                <action.icon size={24} />
                <div>
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {getQuickStatForRole('posts', userRole)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {getQuickStatForRole('comments', userRole)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Comentarios</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {getQuickStatForRole('views', userRole)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Vistas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {getQuickStatForRole('engagement', userRole)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Engagement</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Create Post Wizard */}
      <CreatePostWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onSubmit={async (postData) => {
          // Mock implementation - en una app real sería una llamada a la API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          addNotification({
            type: 'success',
            title: 'Post creado',
            message: 'El post ha sido creado exitosamente desde acciones rápidas'
          });
          
          setShowCreateWizard(false);
        }}
      />
    </>
  );
};

// Helper functions
const generateTrendData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
    value: Math.floor(Math.random() * 100) + 50
  }));
};

const getQuickStatForRole = (metric: string, userRole: string): string | number => {
  const stats = {
    creador: { posts: 156, comments: 1247, views: '125K', engagement: 68 },
    administrador: { posts: 156, comments: 1247, views: '125K', engagement: 68 },
    editor: { posts: 89, comments: 456, views: '78K', engagement: 72 },
    escritor: { posts: 34, comments: 89, views: '15K', engagement: 65 },
    autor: { posts: 8, comments: 23, views: '3.2K', engagement: 58 },
    comentador: { posts: 0, comments: 23, views: '0', engagement: 45 }
  };

  return stats[userRole as keyof typeof stats]?.[metric as keyof typeof stats.creador] || 0;
};

export default AdminQuickActions;