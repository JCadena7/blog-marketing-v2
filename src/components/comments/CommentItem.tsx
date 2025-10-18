import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Flag, Reply, MessageCircle, MoveHorizontal as MoreHorizontal, Calendar } from 'lucide-react';
import { type Comment } from '../../data/mockComments';
import CommentForm from './CommentForm';
import ReportCommentModal from './ReportCommentModal';

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

interface CommentItemProps {
  comment: CommentWithReplies;
  onReply: (commentData: any) => Promise<void>;
  user?: any;
  depth?: number;
  index?: number;
  showNotification: (notification: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply, 
  user, 
  depth = 0, 
  index = 0,
  showNotification
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const maxDepth = 5; // Maximum nesting level
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleLike = async () => {
    const newLiked = !liked;
    const newLikes = newLiked ? localLikes + 1 : localLikes - 1;
    
    // Optimistic update
    setLiked(newLiked);
    setLocalLikes(newLikes);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      showNotification({
        type: 'success',
        message: newLiked ? 'Te gusta este comentario' : 'Ya no te gusta este comentario'
      });
    } catch (error) {
      // Revert on error
      setLiked(!newLiked);
      setLocalLikes(localLikes);
      showNotification({
        type: 'error',
        message: 'Error al procesar tu reacción'
      });
    }
  };

  const handleReply = async (replyData: any) => {
    await onReply({ ...replyData, parentId: comment.id });
    setShowReplyForm(false);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${depth > 0 ? 'ml-8 md:ml-12 pt-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 hover:shadow-sm transition-shadow">
        {/* Header */}
        <div className="flex items-start space-x-3">
          <img
            src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}`}
            alt={comment.author.name}
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">{comment.author.name}</span>
                {comment.status === 'pending' && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs font-medium rounded">
                    Pendiente
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={14} />
                <span>{formatRelativeTime(comment.createdAt)}</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  liked 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span>{localLikes}</span>
              </button>

              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>Responder</span>
                </button>
              )}

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>Reportar</span>
              </button>

              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {showReplies ? 'Ocultar' : 'Ver'} {comment.replies?.length || 0} respuesta
                    {(comment.replies?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <CommentForm
                onSubmit={handleReply}
                isAuthenticated={!!user}
                user={user}
                parentId={comment.id}
                onCancel={() => setShowReplyForm(false)}
                showNotification={showNotification}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="mt-4 space-y-4">
          {comment.replies?.map((reply, replyIndex) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              user={user}
              depth={depth + 1}
              index={replyIndex}
              showNotification={showNotification}
            />
          ))}
        </div>
      )}

      {/* Report Modal */}
      <ReportCommentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        commentId={comment.id}
        showNotification={showNotification}
      />
    </motion.div>
  );
};

export default CommentItem;