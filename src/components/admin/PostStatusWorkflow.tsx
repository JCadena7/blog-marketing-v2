import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Send,
  ArrowRight,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { type Post } from '../../data/mockPosts';
import { type PostStatus } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface PostStatusWorkflowProps {
  post: Post;
  onStatusChange: (newStatus: Post['status'], notes?: string) => void;
}

const PostStatusWorkflow: React.FC<PostStatusWorkflowProps> = ({ post, onStatusChange }) => {
  const { hasPermission, userRole } = usePermissions();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const getStatusConfig = (status: PostStatus) => {
    const configs: Record<PostStatus, { color: string; icon: any; label: string; description: string }> = {
      draft: {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        icon: Edit,
        label: 'Borrador',
        description: 'El post está en desarrollo'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: Clock,
        label: 'Pendiente',
        description: 'Esperando aprobación de un editor'
      },
      published: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle,
        label: 'Publicado',
        description: 'El post está visible públicamente'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        icon: XCircle,
        label: 'Rechazado',
        description: 'El post necesita revisión antes de publicar'
      }
    };

    return configs[status];
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (post.status) {
      case 'draft':
        if (hasPermission('publicar_post')) {
          actions.push({
            id: 'publish',
            label: 'Publicar Directamente',
            icon: CheckCircle,
            variant: 'primary' as const,
            action: () => onStatusChange('published')
          });
        } else {
          actions.push({
            id: 'submit',
            label: 'Enviar para Aprobación',
            icon: Send,
            variant: 'primary' as const,
            action: () => onStatusChange('pending')
          });
        }
        break;

      case 'pending':
        if (hasPermission('publicar_post')) {
          actions.push(
            {
              id: 'approve',
              label: 'Aprobar y Publicar',
              icon: CheckCircle,
              variant: 'primary' as const,
              action: () => onStatusChange('published')
            },
            {
              id: 'reject',
              label: 'Rechazar',
              icon: XCircle,
              variant: 'secondary' as const,
              action: () => setShowReviewModal(true)
            }
          );
        }
        break;

      case 'published':
        if (hasPermission('editar_post_cualquiera')) {
          actions.push({
            id: 'unpublish',
            label: 'Despublicar',
            icon: XCircle,
            variant: 'secondary' as const,
            action: () => onStatusChange('draft')
          });
        }
        break;

      case 'rejected':
        if (hasPermission('editar_post_propio') && post.authorId === 3) { // Assuming current user ID is 3
          actions.push({
            id: 'resubmit',
            label: 'Reenviar para Aprobación',
            icon: Send,
            variant: 'primary' as const,
            action: () => onStatusChange('pending')
          });
        }
        break;
    }

    return actions;
  };

  const currentConfig = getStatusConfig(post.status);
  const availableActions = getAvailableActions();

  return (
    <>
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Estado del Post
        </h3>

        {/* Current Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className={`p-3 rounded-full ${currentConfig.color}`}>
              <currentConfig.icon size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {currentConfig.label}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Timeline */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Historial del Post
          </h4>
          
          <div className="space-y-4">
            <WorkflowStep
              icon={Edit}
              title="Post Creado"
              description={`Por ${post.author?.name || 'Autor desconocido'}`}
              timestamp={post.createdAt}
              completed={true}
            />
            
            {post.editorial?.submittedAt && (
              <WorkflowStep
                icon={Send}
                title="Enviado para Aprobación"
                description="Post enviado para revisión editorial"
                timestamp={post.editorial.submittedAt}
                completed={true}
              />
            )}
            
            {post.editorial?.reviewedAt && (
              <WorkflowStep
                icon={post.status === 'published' ? CheckCircle : XCircle}
                title={post.status === 'published' ? 'Aprobado y Publicado' : 'Rechazado'}
                description={post.editorial.reviewNotes || 'Sin notas de revisión'}
                timestamp={post.editorial.reviewedAt}
                completed={true}
              />
            )}
            
            {post.publishedAt && (
              <WorkflowStep
                icon={CheckCircle}
                title="Publicado"
                description="Post visible públicamente"
                timestamp={post.publishedAt}
                completed={true}
              />
            )}
          </div>
        </div>

        {/* Available Actions */}
        {availableActions.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Acciones Disponibles
            </h4>
            
            <div className="flex flex-wrap gap-3">
              {availableActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  onClick={action.action}
                  className="inline-flex items-center"
                >
                  <action.icon size={16} className="mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Editorial Notes */}
        {post.editorial?.reviewNotes && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Notas del Editor
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  {post.editorial.reviewNotes}
                </p>
                {post.editorial.reviewedAt && (
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                    Revisado el {new Date(post.editorial.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Rechazar Post
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas de Revisión
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Explica por qué se rechaza el post y qué cambios son necesarios..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewNotes('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onStatusChange('rejected', reviewNotes);
                      setShowReviewModal(false);
                      setReviewNotes('');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Rechazar Post
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

interface WorkflowStepProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  timestamp, 
  completed 
}) => {
  return (
    <div className="flex items-start space-x-4">
      <div className={`p-2 rounded-full ${
        completed 
          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
      }`}>
        <Icon size={16} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </h5>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(timestamp).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PostStatusWorkflow;