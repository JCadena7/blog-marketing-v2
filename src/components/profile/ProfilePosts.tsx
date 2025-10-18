import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Heart, MessageCircle, Calendar, ListFilter as Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { mockPosts } from '../../data/mockPosts';
import { usePermissions } from '../../hooks/usePermissions';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ProfilePostsProps {
  userId: number;
  userRole: string;
}

const ProfilePosts: React.FC<ProfilePostsProps> = ({ userId, userRole }) => {
  const { hasPermission } = usePermissions();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUserPosts();
  }, [userId, filter]);

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter posts by user
      let userPosts = mockPosts.filter(post => post.authorId === userId);
      
      // Apply status filter
      if (filter !== 'all') {
        userPosts = userPosts.filter(post => post.status === filter);
      }
      
      setPosts(userPosts);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'Publicado' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', text: 'Pendiente' },
      draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', text: 'Borrador' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Rechazado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Posts del Usuario
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {filteredPosts.length} posts encontrados
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="published">Publicados</option>
            <option value="pending">Pendientes</option>
            <option value="draft">Borradores</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay posts
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filter !== 'all' 
                ? 'No se encontraron posts con los filtros aplicados.'
                : 'Este usuario aún no ha creado ningún post.'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                  <div className="space-y-4">
                    {/* Post Image */}
                    {post.featuredImage && (
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(post.status)}
                        </div>
                      </div>
                    )}
                    
                    {/* Post Content */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>
                      
                      {/* Post Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{format(new Date(post.createdAt), "d MMM yyyy", { locale: es })}</span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {post.category.name}
                        </span>
                      </div>
                      
                      {/* Post Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Eye size={14} className="mr-1" />
                            {post.views || 0}
                          </div>
                          <div className="flex items-center">
                            <Heart size={14} className="mr-1" />
                            {post.likes || 0}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle size={14} className="mr-1" />
                            {post.comments || 0}
                          </div>
                        </div>
                        
                        {hasPermission('editar_post_propio') && (
                          <Button
                            variant="outline"
                            size="sm"
                            href={`/admin/posts/${post.id}/edit`}
                          >
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;