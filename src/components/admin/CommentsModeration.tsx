import React, { useState, useMemo, useEffect } from 'react';
import { CircleCheck as CheckCircle, Circle as XCircle, TriangleAlert as AlertTriangle, Trash2, Search, ListFilter as Filter, MessageCircle, User, Calendar } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { type Comment } from '../../data/mockComments';
import { getAllComments, updateCommentStatus as updateCommentStatusApi, deleteComment as deleteCommentApi } from '../../services/commentsService';
import { useNotifications } from './AdminNotificationSystem';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';

const CommentsModeration: React.FC = () => {
  const { hasPermission, canModerateComment, userRole } = usePermissions();
  const { addNotification } = useNotifications();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllComments();
        if (mounted) setComments(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Filtrar comentarios según rol y permisos
  const filteredComments = useMemo(() => {
    let filtered = comments;

    // Filtrar por permisos de usuario
    if (hasPermission('admin_completo')) {
      // Ver todos los comentarios
    } else if (userRole === 'editor') {
      // Comentarios en posts que puede editar
      filtered = filtered; // En una app real, filtrarías por posts editables
    } else if (hasPermission('editar_post_propio')) {
      // Solo comentarios en sus propios posts (asumiendo userId = 3)
      filtered = filtered.filter(comment => {
        // En una app real, verificarías si el post pertenece al usuario
        return true; // Simplificado para el ejemplo
      });
    } else {
      // Solo sus propios comentarios
      filtered = filtered.filter(comment => comment.authorId === 3); // Ejemplo
    }

    // Filtrar por estado
    if (filter !== 'all') {
      filtered = filtered.filter(comment => comment.status === filter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(comment => 
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.postTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [comments, filter, searchTerm, hasPermission, userRole]);

  const handleModeration = async (commentId: number, newStatus: Comment['status'], notes?: string) => {
    try {
      // Optimistic update
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              status: newStatus,
              moderatedAt: new Date().toISOString(),
              moderatedBy: 1, // ID del usuario actual
              moderationNotes: notes
            }
          : comment
      ));
      
      await updateCommentStatusApi(commentId, newStatus, notes);
      
      const statusMessages = {
        approved: 'Comentario aprobado',
        pending: 'Comentario en revisión',
        rejected: 'Comentario rechazado',
        spam: 'Comentario marcado como spam'
      } as const;

      addNotification({
        type: newStatus === 'approved' ? 'success' : 'info',
        title: 'Comentario moderado',
        message: statusMessages[newStatus] || 'Estado del comentario actualizado'
      });
      
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Error de moderación',
        message: 'No se pudo moderar el comentario.'
      });
      const fresh = await getAllComments();
      setComments(fresh);
    }
  };

  const handleDelete = (commentId: number) => {
    setConfirmDelete({ open: true, id: commentId });
  };

  const confirmDeleteComment = async () => {
    if (confirmDelete.id == null) return;
    try {
      setDeleteLoading(true);
      const ok = await deleteCommentApi(confirmDelete.id);
      if (ok) {
        setComments(prev => prev.filter(comment => comment.id !== confirmDelete.id));
        addNotification({
          type: 'success',
          title: 'Comentario eliminado',
          message: 'El comentario ha sido eliminado exitosamente.'
        });
      }
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ open: false, id: null });
    }
  };

  const getStatusBadge = (status: Comment['status']) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'Aprobado', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', text: 'Pendiente', icon: MessageCircle },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Rechazado', icon: XCircle },
      spam: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', text: 'Spam', icon: AlertTriangle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const pendingCount = comments.filter(c => c.status === 'pending').length;
  const spamCount = comments.filter(c => c.status === 'spam').length;

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-8">
          <span className="text-gray-500 dark:text-gray-400">Cargando comentarios...</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Moderación de Comentarios
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {filteredComments.length} comentarios encontrados
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
            <MessageCircle size={16} className="mr-1" />
            {pendingCount} pendientes
          </div>
          <div className="flex items-center text-orange-600 dark:text-orange-400">
            <AlertTriangle size={16} className="mr-1" />
            {spamCount} spam
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar comentarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="rejected">Rechazados</option>
          <option value="spam">Spam</option>
        </select>
      </div>

      {/* Lista de Comentarios */}
      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=3B82F6&color=fff`}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.author.name}
                    </span>
                    {getStatusBadge(comment.status)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar size={14} className="mr-1" />
                    {new Date(comment.createdAt).toLocaleDateString()}
                    <span className="mx-2">•</span>
                    <span>en "{comment.postTitle || 'Post desconocido'}"</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {comment.likes} likes
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {comment.content}
              </p>
            </div>

            {comment.moderationNotes && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Nota de moderación:</strong> {comment.moderationNotes}
                </p>
              </div>
            )}

            {/* Acciones de Moderación */}
            {canModerateComment(comment.authorId) && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  {comment.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleModeration(comment.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModeration(comment.id, 'rejected', 'Contenido inapropiado')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle size={16} className="mr-1" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModeration(comment.id, 'spam', 'Detectado como spam')}
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        <AlertTriangle size={16} className="mr-1" />
                        Marcar Spam
                      </Button>
                    </>
                  )}

                  {comment.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModeration(comment.id, 'rejected', 'Revisión posterior')}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle size={16} className="mr-1" />
                      Rechazar
                    </Button>
                  )}

                  {(comment.status === 'rejected' || comment.status === 'spam') && (
                    <Button
                      size="sm"
                      onClick={() => handleModeration(comment.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Aprobar
                    </Button>
                  )}
                </div>

                {hasPermission('admin_completo') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(comment.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Eliminar comentario"
        description="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={confirmDeleteComment}
      />

      {filteredComments.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay comentarios
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filter !== 'all' 
              ? 'No se encontraron comentarios con los filtros aplicados.'
              : 'No hay comentarios para moderar en este momento.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsModeration;