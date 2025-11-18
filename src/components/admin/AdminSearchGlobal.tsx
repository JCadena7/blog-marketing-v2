import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, FileText, Users, MessageCircle, Folder, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePermissions } from '../../hooks/usePermissions';
import { type Post } from '../../types';
import { getAllPosts } from '../../services/postsService';
import { getAllUsers } from '../../services/usersService';
import { getAllComments } from '../../services/commentsService';
import { getAllCategories } from '../../services/categoriesService';

interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'comment' | 'category';
  title: string;
  subtitle?: string;
  url: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  meta?: string;
}

interface AdminSearchGlobalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSearchGlobal: React.FC<AdminSearchGlobalProps> = ({ isOpen, onClose }) => {
  const { hasPermission } = usePermissions();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigateSafely = (path: string) => {
    if (typeof globalThis !== 'undefined' && 'location' in globalThis && globalThis.location) {
      globalThis.location.assign(path);
    }
  };

  const canSearchPosts = useMemo(
    () => hasPermission('crear_post') || hasPermission('editar_post_cualquiera'),
    [hasPermission]
  );
  const canSearchUsers = useMemo(() => hasPermission('admin_completo'), [hasPermission]);
  const canSearchComments = useMemo(
    () => hasPermission('comentar') || hasPermission('admin_completo'),
    [hasPermission]
  );
  const canSearchCategories = useMemo(
    () => hasPermission('crear_categoria') || hasPermission('editar_categoria'),
    [hasPermission]
  );

  const searchPosts = useCallback(
    async (normalizedQuery: string): Promise<SearchResult[]> => {
      if (!canSearchPosts) return [];
      try {
        const posts = await getAllPosts();
        return posts
          .filter(post =>
            post.title.toLowerCase().includes(normalizedQuery) ||
            post.content.toLowerCase().includes(normalizedQuery) ||
            post.author?.name.toLowerCase().includes(normalizedQuery)
          )
          .slice(0, 5)
          .map((post: Post) => ({
            id: `post-${post.id}`,
            type: 'post' as const,
            title: post.title,
            subtitle: `Por ${post.author?.name || 'Autor desconocido'}`,
            url: `/admin/posts/${post.id}/edit`,
            icon: FileText,
            meta: `${post.status} • ${post.category?.name || 'Sin categoría'}`
          }));
      } catch (error) {
        console.error('Error buscando posts:', error);
        return [];
      }
    },
    [canSearchPosts]
  );

  const searchUsers = useCallback(
    async (normalizedQuery: string): Promise<SearchResult[]> => {
      if (!canSearchUsers) return [];
      try {
        const users = await getAllUsers();
        return users
          .filter(user =>
            user.firstName.toLowerCase().includes(normalizedQuery) ||
            user.lastName.toLowerCase().includes(normalizedQuery) ||
            user.email.toLowerCase().includes(normalizedQuery)
          )
          .slice(0, 3)
          .map(user => ({
            id: `user-${user.id}`,
            type: 'user' as const,
            title: `${user.firstName} ${user.lastName}`,
            subtitle: user.email,
            url: `/admin/usuarios/${user.id}`,
            icon: Users,
            meta: user.role
          }));
      } catch (error) {
        console.error('Error buscando usuarios:', error);
        return [];
      }
    },
    [canSearchUsers]
  );

  const searchComments = useCallback(
    async (normalizedQuery: string): Promise<SearchResult[]> => {
      if (!canSearchComments) return [];
      try {
        const comments = await getAllComments();
        return comments
          .filter(comment =>
            comment.content.toLowerCase().includes(normalizedQuery) ||
            comment.author.name.toLowerCase().includes(normalizedQuery)
          )
          .slice(0, 3)
          .map(comment => ({
            id: `comment-${comment.id}`,
            type: 'comment' as const,
            title: `${comment.content.substring(0, 60)}...`,
            subtitle: `Por ${comment.author.name}`,
            url: `/admin/comentarios?highlight=${comment.id}`,
            icon: MessageCircle,
            meta: `${comment.status} • en "${comment.postTitle}"`
          }));
      } catch (error) {
        console.error('Error buscando comentarios:', error);
        return [];
      }
    },
    [canSearchComments]
  );

  const searchCategories = useCallback(
    async (normalizedQuery: string): Promise<SearchResult[]> => {
      if (!canSearchCategories) return [];
      try {
        const categories = await getAllCategories();
        return categories
          .filter(category =>
            category.name.toLowerCase().includes(normalizedQuery) ||
            category.description.toLowerCase().includes(normalizedQuery)
          )
          .slice(0, 3)
          .map(category => ({
            id: `category-${category.id}`,
            type: 'category' as const,
            title: category.name,
            subtitle: category.description,
            url: `/admin/categorias?edit=${category.id}`,
            icon: Folder,
            meta: `${category.postsCount || 0} posts`
          }));
      } catch (error) {
        console.error('Error buscando categorías:', error);
        return [];
      }
    },
    [canSearchCategories]
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      // Avoid redundant state updates to prevent loops
      if (results.length !== 0) setResults([]);
      if (selectedIndex !== 0) setSelectedIndex(0);
      return;
    }

    // Búsqueda asíncrona
    const performSearch = async () => {
      const normalizedQuery = query.toLowerCase();
      const resultsGroups = await Promise.all([
        searchPosts(normalizedQuery),
        searchUsers(normalizedQuery),
        searchComments(normalizedQuery),
        searchCategories(normalizedQuery)
      ]);
      const searchResults = resultsGroups.flat();

      const resultsChanged =
        searchResults.length !== results.length ||
        searchResults.some((r, i) => r.id !== results[i]?.id);

      if (resultsChanged) {
        setResults(searchResults);
        if (selectedIndex !== 0) setSelectedIndex(0);
      } else if (selectedIndex > Math.max(searchResults.length - 1, 0)) {
        setSelectedIndex(0);
      }
    };

    // Ejecutar búsqueda
    performSearch();
  }, [
    query,
    results,
    selectedIndex,
    searchPosts,
    searchUsers,
    searchComments,
    searchCategories
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          navigateSafely(results[selectedIndex].url);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      post: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
      user: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
      comment: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
      category: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return colors[type as keyof typeof colors] || colors.post;
  };

  if (!isOpen) return null;

  const renderResultsContent = () => {
    const canSearch = query.length >= 2;

    if (!canSearch) {
      return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p>Escribe al menos 2 caracteres para buscar</p>
          <div className="mt-4 text-sm">
            <p className="mb-2">Puedes buscar:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {hasPermission('crear_post') && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Posts</span>
              )}
              {hasPermission('admin_completo') && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Usuarios</span>
              )}
              {hasPermission('comentar') && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Comentarios</span>
              )}
              {hasPermission('crear_categoria') && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Categorías</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p>No se encontraron resultados para "{query}"</p>
        </div>
      );
    }

    return (
      <div className="py-2">
        {results.map((result, index) => (
          <motion.a
            key={result.id}
            href={result.url}
            onClick={onClose}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center space-x-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
              index === selectedIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''
            }`}
          >
            <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
              <result.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {result.title}
              </h3>
              {result.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {result.subtitle}
                </p>
              )}
              {result.meta && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {result.meta}
                </p>
              )}
            </div>
            <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
          </motion.a>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar posts, usuarios, comentarios..."
              className="w-full pl-10 pr-10 py-3 border-none outline-none text-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {renderResultsContent()}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navegar</span>
              <span>↵ Seleccionar</span>
              <span>Esc Cerrar</span>
            </div>
            <span>{results.length} resultados</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSearchGlobal;