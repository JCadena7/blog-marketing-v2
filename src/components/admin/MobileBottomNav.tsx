import React from 'react';
import { Home, FileText, MessageCircle, Users, BarChart3 } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

interface MobileBottomNavProps {
  currentPath: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath }) => {
  const { hasAnyPermission } = usePermissions();

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
      name: 'Usuarios',
      icon: Users,
      path: '/admin/usuarios',
      permission: ['admin_completo']
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.slice(0, 4).map((item) => {
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
  );
};

export default MobileBottomNav;