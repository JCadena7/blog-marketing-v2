import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ThumbsUp, Flag, Reply, Send, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Loader, Import as SortAsc, Dessert as SortDesc } from 'lucide-react';
import { getCommentsByPostId, createComment } from '../../services/commentsService';
import { type Comment } from '../../data/mockComments';

import CommentForm from './CommentForm';
import CommentsList from './CommentsList';
import CommentsLoader from './CommentsLoader';
import EmptyComments from './EmptyComments';

interface PostCommentsProps {
  postId: string | number;
  postSlug: string;
  allowComments?: boolean;
}

const PostComments: React.FC<PostCommentsProps> = ({ 
  postId, 
  postSlug, 
  allowComments = true 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Mock user - in a real app this would come from auth context
  const user = {
    id: 1,
    name: 'Usuario Demo',
    email: 'demo@example.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  const isAuthenticated = true; // Mock authentication

  useEffect(() => {
    fetchComments();
  }, [postId, sortBy]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { comments: postComments } = await getCommentsByPostId(Number(postId), {
        withUser: true,
        withReplies: true,
        page: 1,
        limit: 50
      });

      // Only approved comments unless we want to show pending ones as moderator view
      let filteredComments = postComments.filter(comment => comment.status === 'approved');

      // Sort comments
      switch (sortBy) {
        case 'oldest':
          filteredComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'popular':
          filteredComments.sort((a, b) => b.likes - a.likes);
          break;
        case 'newest':
        default:
          filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      setComments(filteredComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los comentarios'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (commentData: any) => {
    try {
      const newComment = await createComment({
        postId: Number(postId),
        authorId: isAuthenticated ? user.id : undefined,
        content: commentData.content,
        parentId: commentData.parentId,
        status: 'pending'
      });

      // Add to comments list to give immediate feedback
      setComments(prev => [newComment, ...prev]);
      
      setNotification({
        type: 'info',
        message: 'Tu comentario está pendiente de moderación y será visible una vez aprobado'
      });

      // Reset form feedback will happen in CommentForm component
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Error al publicar comentario'
      });
    }
  };

  const showNotification = (notif: { type: 'success' | 'error' | 'info'; message: string }) => {
    setNotification(notif);
  };

  if (!allowComments) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">Los comentarios están deshabilitados para este post</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg border ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle size={16} />}
              {notification.type === 'error' && <AlertCircle size={16} />}
              {notification.type === 'info' && <AlertCircle size={16} />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-primary-500" />
          Comentarios ({comments.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="popular">Más populares</option>
          </select>
        </div>
      </div>

      {/* Comment Form */}
      <CommentForm 
        onSubmit={handleCommentSubmit}
        isAuthenticated={isAuthenticated}
        user={user}
        showNotification={showNotification}
      />

      {/* Comments List */}
      {loading ? (
        <CommentsLoader />
      ) : comments.length === 0 ? (
        <EmptyComments />
      ) : (
        <CommentsList 
          comments={comments}
          onReply={handleCommentSubmit}
          user={user}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

export default PostComments;