import React, { useState, useEffect } from 'react';
import { FileText, Folder, MessageCircle, Users, Shield, ChartBar as BarChart3, Hop as Home, Settings, Menu, X, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface ResponsiveSidebarProps {
  isMobile?: boolean;
  isTablet?: boolean;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ isMobile = false, isTablet = false }) => {
  const { hasAnyPermission } = usePermissions();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [currentPath, setCurrentPath] = useState('/');
  
  const pendingPostsCount = getPendingPosts().length;
  const pendingCommentsCount = getPendingComments().length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

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
      icon: User,
      path: "/admin/perfil",
      permission: []
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission || item.permission.length === 0) return true;
    return hasAnyPermission(item.permission as any);
  });

  // Mobile Bottom Navigation
  if (isMobile) {
    const mainItems = filteredMenuItems.filter(item => 
      ['Dashboard', 'Posts', 'Comentarios', 'Usuarios'].includes(item.name)
    ).slice(0, 4);

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around items-center py-2">
          {mainItems.map((item) => {
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
                <div className="relative">
                  <item.icon size={20} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </a>
            );
          })}
        </div>
      </nav>
    );
  }

  // Tablet/Desktop Sidebar
  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {(isMobile || isTablet) && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Hamburger Menu Button for Mobile/Tablet */}
      {(isMobile || isTablet) && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile || isTablet ? { x: -280 } : { x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`
              ${isMobile || isTablet ? 'fixed' : 'sticky'} 
              top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50
              ${isMobile || isTablet ? 'shadow-xl' : ''}
            `}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
                      Admin Panel
                    </span>
                  </div>
                  {(isMobile || isTablet) && (
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 overflow-y-auto">
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
                          onClick={() => {
                            if (isMobile || isTablet) {
                              setIsOpen(false);
                            }
                          }}
                          className={`
                            group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                            ${isActive 
                              ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }
                          `}
                        >
                          <div className="flex items-center">
                            <item.icon 
                              size={20} 
                              className={`mr-3 flex-shrink-0 ${
                                isActive 
                                  ? 'text-primary-600 dark:text-primary-400' 
                                  : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                              }`} 
                            />
                            <span>{item.name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {item.badge && item.badge > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            {(isMobile || isTablet) && (
                              <ChevronRight size={16} className="text-gray-400" />
                            )}
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Marketing Pro Admin
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResponsiveSidebar;