import React, { useState } from 'react';

import { Hop as Home, FileText, MessageCircle, Users, ChartBar as BarChart3, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../../hooks/usePermissions';
import { useNotifications } from './AdminNotificationSystem';
import CreatePostWizard from './CreatePostWizard';

interface AdminMobileNavProps {
  currentPath: string;
}

const AdminMobileNav: React.FC<AdminMobileNavProps> = ({ currentPath }) => {
  const { hasAnyPermission } = usePermissions();
  const { addNotification } = useNotifications();
  const [showFAB, setShowFAB] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const navigateSafely = (path: string) => {
    if (typeof globalThis !== 'undefined' && 'location' in globalThis && globalThis.location) {
      globalThis.location.assign(path);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard',
      permission: []
    },
    {
      name: 'Posts',
      icon: FileText,
      path: '/admin/posts',
      permission: ['crear_post', 'editar_post_propio', 'editar_post_cualquiera']
    },
    {
      name: 'Comentarios',
      icon: MessageCircle,
      path: '/admin/comentarios',
      permission: ['comentar', 'admin_completo']
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      permission: ['admin_completo', 'editar_post_cualquiera']
    }
  ].filter(item => 
    item.permission.length === 0 || 
    hasAnyPermission(item.permission as any)
  );

  const fabActions = [
    {
      label: 'Nuevo Post',
      icon: FileText,
      action: () => setShowCreateWizard(true),
      permission: ['crear_post'],
      color: 'bg-blue-500'
    },
    {
      label: 'Nuevo Usuario',
      icon: Users,
      action: () => navigateSafely('/admin/usuarios/nuevo'),
      permission: ['admin_completo'],
      color: 'bg-green-500'
    }
  ].filter(action => hasAnyPermission(action.permission as any));

  return (
    <div>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button */}
      {fabActions.length > 0 && (
        <div className="fixed bottom-20 right-4 z-40 md:hidden">
          <AnimatePresence>
            {showFAB && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-16 right-0 space-y-3"
              >
                {fabActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      action.action();
                      setShowFAB(false);
                    }}
                    className={`flex items-center space-x-3 ${action.color} text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <action.icon size={20} />
                    <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFAB(!showFAB)}
            className="w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: showFAB ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {showFAB ? <X size={24} /> : <Plus size={24} />}
            </motion.div>
          </motion.button>
        </div>
      )}

      {/* Create Post Wizard */}
      <CreatePostWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onSubmit={async (postData) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          addNotification({
            type: 'success',
            title: 'Post creado',
            message: 'El post ha sido creado exitosamente'
          });
          
          setShowCreateWizard(false);
        }}
      />
    </div>
  );
};

export default AdminMobileNav;