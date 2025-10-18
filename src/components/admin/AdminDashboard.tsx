import React, { useState } from 'react';
import { FileText, Users, MessageCircle, TrendingUp, Eye, Heart, Share2, Clock, Activity, Zap } from 'lucide-react';
import ResponsiveAdminLayout from './ResponsiveAdminLayout';
import AdminStatsGrid from './AdminStatsCards';
import AdminQuickActions from './AdminQuickActions';
import AdminActivityFeed from './AdminActivityFeed';
import CreatePostWizard from './CreatePostWizard';
import { usePermissions } from '../../hooks/usePermissions';
import { useNotifications } from './AdminNotificationSystem';
import { useBreakpoint } from '../../hooks/useMediaQuery';
import ProtectedRoute from './ProtectedRoute';
import { mockPosts, getPendingPosts } from '../../data/mockPosts';
import { mockComments, getPendingComments } from '../../data/mockComments';
import { mockUsers } from '../../data/mockUsers';
import Card from '../ui/Card';
import Button from '../ui/Button';

const AdminDashboard: React.FC = () => {
  const { userRole, hasPermission } = usePermissions();
  const breakpoint = useBreakpoint();
  const { addNotification } = useNotifications();
  const isMobile = breakpoint === 'mobile';
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  return (
    <ResponsiveAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Resumen de actividad y métricas principales
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasPermission('crear_post') && (
              <Button onClick={() => setShowCreateWizard(true)}>
                <FileText size={16} className="mr-2" />
                Crear Post
              </Button>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Última actualización: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <AdminStatsGrid userRole={userRole} userId={3} />

        {/* Quick Actions */}
        <AdminQuickActions />

        {/* Main Content Grid */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Activity Feed */}
          <AdminActivityFeed />

          {/* Recent Posts */}
          <ProtectedRoute requiredPermissions={['crear_post', 'editar_post_propio', 'editar_post_cualquiera']}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Posts Recientes
                </h2>
                <Button variant="outline" size="sm" href="/admin/posts">
                  Ver Todos
                </Button>
              </div>
              
              <div className="space-y-3">
                {mockPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-1 text-xs rounded-full ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : post.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : post.status === 'draft'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </ProtectedRoute>
        </div>

        {/* Analytics Overview - Only for higher roles */}
        <ProtectedRoute requiredPermissions={['admin_completo', 'editar_post_cualquiera']}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resumen de Analytics
              </h2>
              <Button variant="outline" size="sm" href="/admin/analytics">
                Ver Detalles
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  125K
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Vistas Totales
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  1.2K
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Likes Totales
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  156
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Posts Publicados
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  68%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Engagement Rate
                </div>
              </div>
            </div>
          </Card>
        </ProtectedRoute>
      </div>

      {/* Create Post Wizard */}
      <CreatePostWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onSubmit={async (postData) => {
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            addNotification({
              type: 'success',
              title: 'Post creado',
              message: 'El post ha sido creado exitosamente desde el dashboard'
            });
            setShowCreateWizard(false);
          } catch (error) {
            addNotification({
              type: 'error',
              title: 'Error',
              message: 'No se pudo crear el post.'
            });
          }
        }}
      />
    </ResponsiveAdminLayout>
  );
};

export default AdminDashboard;