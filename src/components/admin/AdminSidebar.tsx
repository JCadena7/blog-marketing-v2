import React, { useEffect, useState } from 'react';
import { FileText, Folder, MessageCircle, Users, Shield, ChartBar as BarChart3, Hop as Home, Settings } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { getPendingPosts } from '../../services/postsService';
import { getPendingComments } from '../../services/commentsService';

interface MenuItem {
  section?: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  permission?: string[];
  badge?: number;
}

const AdminSidebar: React.FC = () => {
  const { hasAnyPermission } = usePermissions();
  
  const pendingPostsCount = getPendingPosts().length;
  const pendingCommentsCount = getPendingComments().length;

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/admin/dashboard",
      permission: []
    },
    {
      section: "Contenido",
      name: "Posts",
      icon: FileText,
      path: "/admin/posts",
      permission: ["crear_post", "editar_post_propio", "editar_post_cualquiera"],
      badge: pendingPostsCount
    },
    {
      name: "Categorías",
      icon: Folder,
      path: "/admin/categorias",
      permission: ["crear_categoria", "editar_categoria"]
    },
    {
      name: "Comentarios",
      icon: MessageCircle,
      path: "/admin/comentarios",
      permission: ["comentar", "admin_completo"],
      badge: pendingCommentsCount
    },
    {
      section: "Usuarios",
      name: "Gestión Usuarios",
      icon: Users,
      path: "/admin/usuarios",
      permission: ["admin_completo", "asignar_roles"]
    },
    {
      name: "Roles y Permisos",
      icon: Shield,
      path: "/admin/roles",
      permission: ["admin_completo"]
    },
    {
      section: "Analytics",
      name: "Estadísticas",
      icon: BarChart3,
      path: "/admin/analytics",
      permission: ["admin_completo", "editar_post_cualquiera"]
    },
    {
      section: "Sistema",
      name: "Configuración",
      icon: Settings,
      path: "/admin/configuracion",
      permission: ["admin_completo"]
    },
    {
      name: "Mi Perfil",
      icon: Users,
      path: "/admin/perfil",
      permission: []
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission || item.permission.length === 0) return true;
    return hasAnyPermission(item.permission as any);
  });

  // Avoid accessing window during SSR
  const [currentPath, setCurrentPath] = useState<string>('/');
  useEffect(() => {
    if (typeof globalThis !== 'undefined' && 'location' in globalThis && globalThis.location) {
      setCurrentPath(globalThis.location.pathname);
    }
  }, []);

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {filteredMenuItems.map((item, index) => {
            const isActive = currentPath === item.path;
            const showSection = item.section && (index === 0 || filteredMenuItems[index - 1].section !== item.section);
            
            return (
              <li key={item.path}>
                {showSection && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {item.section}
                  </div>
                )}
                
                <a
                  href={item.path}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <item.icon 
                    size={20} 
                    className={`mr-3 flex-shrink-0 ${
                      isActive 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    }`} 
                  />
                  <span className="flex-1">{item.name}</span>
                  
                  {item.badge && item.badge > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;