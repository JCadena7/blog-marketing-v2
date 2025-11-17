import React, { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';
import { Search, User, Settings, Moon, Sun, Command } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useBreakpoint } from '../../hooks/useMediaQuery';

import RoleBadge from './RoleBadge';
import { type Role } from '../../data/rolePermissions';
import RoleSwitcher from './RoleSwitcher';
import NotificationCenter from './NotificationCenter';
import AdminSearchGlobal from './AdminSearchGlobal';
import LogoutButton from '../auth/LogoutButton';

const AdminHeader: React.FC = () => {
  const { user, demoMode, setDemoMode } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = theme ? theme === 'dark' : prefersDark;
    setIsDark(shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
  };

  // Global search keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left actions (theme + notifications) */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Notifications */}
            <NotificationCenter isMobile={isMobile} />
          </div>

          {/* Global Search */}
          <div className="flex-1 min-w-0 mx-2 md:max-w-none">
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="w-full flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <Search size={20} className="text-gray-400 mr-3" />
              <span className="text-gray-500 dark:text-gray-400 flex-1">
                Buscar posts, usuarios, comentarios...
              </span>
              <div className="hidden md:flex items-center space-x-1 text-xs text-gray-400">
                <Command size={12} />
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right actions (role/demo desktop-only) + user */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle (desktop only) */}
            <button
              onClick={toggleTheme}
              className="hidden md:inline-flex p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications (desktop only) */}
            <span className="hidden md:inline-flex">
              <NotificationCenter isMobile={false} />
            </span>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <img
                  src={user?.avatar}
                  alt={user?.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px] md:max-w-none">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <RoleBadge role={user?.role as Role} size="sm" />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                  <a
                    href="/admin/perfil"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User size={16} className="mr-3" />
                    Mi Perfil
                  </a>
                  <a
                    href="/admin/configuracion"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings size={16} className="mr-3" />
                    Configuración
                  </a>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <LogoutButton
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-none px-4 py-2 text-sm font-normal text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  />
                </motion.div>
              )}
            </div>

            {/* Dev Role Switcher */}
            {!isMobile && <RoleSwitcher />}

            {/* Demo Mode Toggle (DEV only) */}
            {!isMobile && import.meta.env.DEV && (
              <button
                onClick={() => setDemoMode(!demoMode)}
                title="Modo Demo: permite ver contenido sin validar permisos"
                className={`px-2 py-1 text-xs rounded-full border transition-colors duration-200 ${
                  demoMode
                    ? 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700'
                    : 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                }`}
              >
                Demo {demoMode ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <AdminSearchGlobal 
        isOpen={showGlobalSearch} 
        onClose={() => setShowGlobalSearch(false)} 
      />
    </>
  );
};

export default AdminHeader;