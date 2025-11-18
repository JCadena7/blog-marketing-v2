import React, { useState, useEffect, useContext } from 'react';
import ResponsiveAdminLayout from './ResponsiveAdminLayout';
import PostEditor from './PostEditor';
import PostStatusWorkflow from './PostStatusWorkflow';
import ProtectedRoute from './ProtectedRoute';
import { useNotifications } from './AdminNotificationSystem';
import { type Post } from '../../data/mockPosts';
import { type PostStatus } from '../../types';
import { getAllPosts, updatePostStatus, updatePost } from '../../services/postsService';
import { usePermissions } from '../../hooks/usePermissions';
import { AuthContext } from '../../contexts/AuthContext';

const getSafeLocation = () => {
  if (typeof globalThis === 'undefined') return null;
  if (!('location' in globalThis) || !globalThis.location) return null;
  return globalThis.location;
};

const PostEditPage: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();
  const { canEditPost } = usePermissions();

  const { loading: authLoading } = useContext(AuthContext);

  // Wait for auth to be ready before attempting permission checks
  useEffect(() => {
    if (authLoading) return;
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const loadPost = async () => {
    try {
      const location = getSafeLocation();
      if (!location) {
        throw new Error('No se pudo acceder a location');
      }

      const urlParts = location.pathname.split('/');
      const postIdRaw = urlParts[urlParts.indexOf('posts') + 1];
      const postId = Number.parseInt(postIdRaw ?? '', 10);

      const posts = await getAllPosts();
      const foundPost = posts.find(p => p.id === postId);
      
      if (!foundPost) {
        addNotification({
          type: 'error',
          title: 'Post no encontrado',
          message: 'El post que intentas editar no existe.'
        });
        location.assign('/admin/posts');
        return;
      }

      if (!canEditPost(foundPost.authorId)) {
        addNotification({
          type: 'error',
          title: 'Sin permisos',
          message: 'No tienes permisos para editar este post.'
        });
        location.assign('/admin/posts');
        return;
      }

      setPost(foundPost);
    } catch (error) {
      console.error('Error al cargar post:', error);
      addNotification({
        type: 'error',
        title: 'Error al cargar',
        message: 'No se pudo cargar el post.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (postData: Partial<Post>) => {
    if (!post) return;

    try {
      console.log(' Guardando cambios del post:', postData);
      
      // Actualizar el post usando el servicio
      const updatedPost = await updatePost(post.id, {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        categoryId: postData.categoryId ? Number(postData.categoryId) : post.categoryId,
        tags: postData.tags,
        featuredImage: postData.featuredImage,
        status: postData.status as 'draft' | 'pending' | 'published',
        seo: postData.seo || post.seo
      });

      if (updatedPost) {
        setPost(updatedPost);
        console.log(' Post actualizado exitosamente:', updatedPost);
        
        addNotification({
          type: 'success',
          title: 'Post guardado',
          message: `"${updatedPost.title}" ha sido actualizado exitosamente.`
        });
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }

    } catch (error) {
      console.error(' Error al guardar post:', error);
      addNotification({
        type: 'error',
        title: 'Error al guardar',
        message: 'No se pudieron guardar los cambios. Intenta nuevamente.'
      });
    }
  };

  const handleStatusChange = async (newStatus: Post['status'], notes?: string) => {
    if (!post) return;

    try {
      await updatePostStatus(post.id, newStatus);
      
      const updatedPost = { 
        ...post, 
        status: newStatus,
        editorial: {
          ...post.editorial,
          reviewedAt: new Date().toISOString(),
          reviewNotes: notes
        }
      };
      setPost(updatedPost);

      const statusMessages: Record<PostStatus, string> = {
        published: 'Post publicado exitosamente',
        rejected: 'Post rechazado',
        pending: 'Post enviado para aprobación',
        draft: 'Post guardado como borrador'
      };

      addNotification({
        type: newStatus === 'published' ? 'success' : 'info',
        title: 'Estado actualizado',
        message: statusMessages[newStatus] || 'Estado del post actualizado'
      });

    } catch (error) {
      console.error('Error al actualizar estado del post:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el estado del post.'
      });
    }
  };

  const handleCancel = () => {
    const location = getSafeLocation();
    if (location) {
      location.assign('/admin/posts');
    }
  };

  if (loading) {
    return (
      <ResponsiveAdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </ResponsiveAdminLayout>
    );
  }

  if (!post) {
    return (
      <ResponsiveAdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Post no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            El post que intentas editar no existe o no tienes permisos para acceder a él.
          </p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Volver a Posts
          </button>
        </div>
      </ResponsiveAdminLayout>
    );
  }

  return (
    <ResponsiveAdminLayout>
      <ProtectedRoute requiredPermissions={['editar_post_propio', 'editar_post_cualquiera']}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <PostEditor
              post={post ?? undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PostStatusWorkflow
              post={post}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </ProtectedRoute>
    </ResponsiveAdminLayout>
  );
};

export default PostEditPage;