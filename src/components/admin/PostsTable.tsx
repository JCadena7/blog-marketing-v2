import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard as Edit, Trash2, Eye, FileText, CircleCheck as CheckCircle, Circle as XCircle, Clock, Plus } from 'lucide-react';
import { useBreakpoint } from '../../hooks/useMediaQuery';
import { type Post } from '../../data/mockPosts';
import { getAllPosts, updatePostStatus, deletePost as deletePostApi, bulkAction as bulkPostsAction, createPost, uploadPostFeaturedImage } from '../../services/postsService';
import { useNotifications } from './AdminNotificationSystem';
import RoleBadge from './RoleBadge';
import Button from '../ui/Button';
import ResponsiveTable from './ResponsiveTable';
import BulkActions from './BulkActions';
import ConfirmDialog from '../ui/ConfirmDialog';
import { usePermissions } from '../../hooks/usePermissions';
import CreatePostWizard from './CreatePostWizard';

const PostsTable: React.FC = () => {
  const { hasPermission, canEditPost, canDeletePost, userRole } = usePermissions();
  const breakpoint = useBreakpoint();
  const { addNotification } = useNotifications();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  
  // Leer filtro de la URL
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Obtener filtro de la URL
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter');
    if (filter) {
      setStatusFilter(filter);
      console.log('🔍 Filtro de URL detectado:', filter);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllPosts();
        if (mounted) setPosts(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Filter posts based on role and permissions
  const accessiblePosts = useMemo(() => {
    let filtered = posts;

    // Filter by user permissions
    if (hasPermission('editar_post_cualquiera')) {
      // Can see all posts
    } else if (hasPermission('editar_post_propio')) {
      // Only own posts (assuming userId = 3 for example)
      filtered = filtered.filter(post => post.authorId === 3);
    } else {
      filtered = [];
    }

    // Aplicar filtro de estado desde la URL
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
      console.log(`📊 Filtrando por estado "${statusFilter}":`, filtered.length, 'posts');
    }

    return filtered;
  }, [posts, hasPermission, statusFilter]);

  const handleStatusChange = async (postId: number, newStatus: string) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus as Post['status'] }
          : post
      ));
      
      await updatePostStatus(postId, newStatus as Post['status']);
      
      const statusMessages = {
        published: 'Post publicado exitosamente',
        rejected: 'Post rechazado',
        pending: 'Post enviado para aprobación',
        draft: 'Post guardado como borrador'
      };

      addNotification({
        type: newStatus === 'published' ? 'success' : 'info',
        title: 'Estado actualizado',
        message: statusMessages[newStatus as keyof typeof statusMessages] || 'Estado del post actualizado'
      });
      
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el estado del post.'
      });
      const fresh = await getAllPosts();
      setPosts(fresh);
    }
  };

  const handleDelete = (postId: number) => {
    setConfirmDelete({ open: true, id: postId });
  };

  const confirmDeletePost = async () => {
    if (confirmDelete.id == null) return;
    try {
      setDeleteLoading(true);
      const ok = await deletePostApi(confirmDelete.id);
      if (ok) {
        setPosts(prev => prev.filter(post => post.id !== confirmDelete.id));
        addNotification({
          type: 'success',
          title: 'Post eliminado',
          message: 'El post ha sido eliminado exitosamente.'
        });
      }
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ open: false, id: null });
    }
  };

  const handleBulkAction = async (actionId: string, items: any[]) => {
    try {
      const postIds = items.map(item => item.id);
      await bulkPostsAction(postIds, actionId as 'publish' | 'draft' | 'delete');
      
      const fresh = await getAllPosts();
      setPosts(fresh);
      
      const actionMessages = {
        publish: `${items.length} posts publicados`,
        draft: `${items.length} posts guardados como borrador`,
        delete: `${items.length} posts eliminados`
      };

      addNotification({
        type: 'success',
        title: 'Acción completada',
        message: actionMessages[actionId as keyof typeof actionMessages] || 'Acción realizada exitosamente'
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en acción masiva',
        message: 'No se pudo completar la acción en todos los posts seleccionados.'
      });
    }
  };

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

  // Table columns configuration
  const columns = [
    {
      key: 'title',
      label: 'Post',
      render: (value: string, row: Post) => (
        <div className="flex items-center">
          <img
            src={row.featuredImage}
            alt={row.title}
            className="w-12 h-12 rounded-lg object-cover mr-4"
          />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {row.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.category?.name || 'Sin categoría'}
            </div>
          </div>
        </div>
      ),
      mobileRender: (value: string, row: Post) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.title}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.category?.name || 'Sin categoría'}</div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Autor',
      hideOnMobile: true,
      render: (value: any, row: Post) => (
        <div className="flex items-center">
          <img
            src={row.author?.avatar || 'https://ui-avatars.com/api/?name=Usuario&background=3B82F6&color=fff'}
            alt={row.author?.name || 'Usuario'}
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="text-sm text-gray-900 dark:text-white">
            {row.author?.name || 'Autor desconocido'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      hideOnMobile: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'metrics',
      label: 'Métricas',
      hideOnMobile: true,
      render: (value: any, row: Post) => (
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Eye size={16} className="mr-1" />
            {row.views}
          </div>
          <div className="flex items-center">
            <CheckCircle size={16} className="mr-1" />
            {row.likes}
          </div>
        </div>
      )
    }
  ];

  // Table actions configuration
  const actions = [
    {
      label: 'Ver',
      icon: Eye,
      onClick: (row: Post) => window.open(`/blog/${row.slug}`, '_blank'),
      variant: 'secondary' as const
    },
    ...(canEditPost(3) ? [{
      label: 'Editar',
      icon: Edit,
      onClick: (row: Post) => {
        window.location.href = `/admin/posts/${row.id}/edit`;
      },
      variant: 'primary' as const
    }] : []),
    ...(hasPermission('publicar_post') ? [{
      label: 'Publicar',
      icon: CheckCircle,
      onClick: (row: Post) => handleStatusChange(row.id, 'published'),
      variant: 'primary' as const
    }] : []),
    ...(canDeletePost(3) ? [{
      label: 'Eliminar',
      icon: Trash2,
      onClick: (row: Post) => handleDelete(row.id),
      variant: 'danger' as const
    }] : [])
  ];

  // Bulk actions configuration
  const bulkActions = [
    ...(hasPermission('publicar_post') ? [{
      id: 'publish',
      label: 'Publicar',
      icon: CheckCircle,
      variant: 'success' as const,
      permission: 'publicar_post',
      confirmMessage: '¿Publicar los posts seleccionados?'
    }] : []),
    {
      id: 'draft',
      label: 'Borrador',
      icon: FileText,
      variant: 'secondary' as const
    },
    ...(hasPermission('admin_completo') ? [{
      id: 'delete',
      label: 'Eliminar',
      icon: Trash2,
      variant: 'danger' as const,
      permission: 'admin_completo',
      confirmMessage: '¿Eliminar permanentemente los posts seleccionados?'
    }] : [])
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestión de Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {accessiblePosts.length} posts encontrados
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {hasPermission('crear_post') && (
            <Button onClick={() => setShowCreateWizard(true)}>
              Nuevo Post
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={accessiblePosts.filter(post => selectedPosts.includes(post.id))}
        onAction={handleBulkAction}
        onClearSelection={() => setSelectedPosts([])}
        actions={bulkActions}
        loading={loading}
      />

      {/* Responsive Table */}
      <ResponsiveTable
        data={accessiblePosts}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="No hay posts disponibles"
        isMobile={breakpoint === 'mobile'}
        isTablet={breakpoint === 'tablet'}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        title="Eliminar post"
        description="¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={confirmDeletePost}
      />

      {/* Create Post Wizard - controlado localmente */}
      <CreatePostWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onSubmit={async (postData) => {
          try {
            console.log('📝 Datos del post a crear:', postData);
            
            // Crear el post con los datos del wizard
            let newPost = await createPost({
              title: postData.title,
              content: postData.content,
              excerpt: postData.excerpt,
              categoryId: postData.categoryId ? Number(postData.categoryId) : undefined,
              tags: postData.tags,
              featuredImage: postData.featuredImage,
              status: postData.status === 'scheduled' ? 'pending' : postData.status as 'draft' | 'pending' | 'published',
              featured: postData.featured,
              allowComments: postData.allowComments,
              seo: {
                metaTitle: postData.metaTitle || postData.title,
                metaDescription: postData.metaDescription || postData.excerpt,
                focusKeyword: postData.focusKeyword
              }
            });
            
            if (postData.featuredImageFile && newPost?.id) {
              try {
                const { featuredImageUrl } = await uploadPostFeaturedImage(newPost.id, postData.featuredImageFile);
                newPost = { ...newPost, featuredImage: featuredImageUrl } as typeof newPost;
              } catch (uploadError) {
                console.error('❌ Error subiendo imagen destacada:', uploadError);
                addNotification({
                  type: 'warning',
                  title: 'Post sin imagen',
                  message: 'El post se creó pero la imagen no se pudo subir. Intenta editarlo y subirla nuevamente.'
                });
              }
            }
            
            console.log('✅ Post creado exitosamente:', newPost);
            
            addNotification({
              type: 'success',
              title: 'Post creado',
              message: `El post "${newPost.title}" ha sido creado exitosamente.`
            });
            
            // Refresh posts list
            const fresh = await getAllPosts();
            setPosts(fresh);
            
          } catch (error) {
            console.error('❌ Error al crear post:', error);
            addNotification({
              type: 'error',
              title: 'Error al crear post',
              message: 'No se pudo crear el post. Verifica los datos e intenta nuevamente.'
            });
          }
          setShowCreateWizard(false);
        }}
      />
    </div>
  );
};

export default PostsTable;