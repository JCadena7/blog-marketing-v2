import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, CircleAlert as AlertCircle, User, Mail } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (commentData: any) => Promise<void>;
  isAuthenticated: boolean;
  user?: any;
  parentId?: number;
  onCancel?: () => void;
  showNotification: (notification: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  onSubmit, 
  isAuthenticated, 
  user, 
  parentId = null, 
  onCancel = null,
  showNotification
}) => {
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!content.trim()) {
      newErrors.content = 'El comentario no puede estar vacío';
    } else if (content.length < 10) {
      newErrors.content = 'El comentario debe tener al menos 10 caracteres';
    } else if (content.length > 1000) {
      newErrors.content = 'El comentario no puede exceder 1000 caracteres';
    }

    if (!isAuthenticated) {
      if (!guestName.trim()) {
        newErrors.guestName = 'Por favor ingresa tu nombre';
      }
      if (!guestEmail.trim()) {
        newErrors.guestEmail = 'Por favor ingresa tu email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        newErrors.guestEmail = 'Email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        content: content.trim(),
        parentId,
        ...(isAuthenticated 
          ? { authorId: user.id }
          : { authorName: guestName.trim(), authorEmail: guestEmail.trim() }
        )
      });
      
      // Reset form
      setContent('');
      setGuestName('');
      setGuestEmail('');
      setErrors({});
      
    } catch (error: any) {
      setErrors({ submit: error.message });
      showNotification({
        type: 'error',
        message: 'Error al enviar el comentario'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4"
    >
      {/* User info or guest fields */}
      {isAuthenticated ? (
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Usuario')}`}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Tu nombre"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.guestName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.guestName && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.guestName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="tu@email.com"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.guestEmail ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.guestEmail && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.guestEmail}</p>
            )}
          </div>
        </div>
      )}

      {/* Comment textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {parentId ? 'Tu respuesta' : 'Tu comentario'} *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? 'Escribe tu respuesta...' : 'Comparte tu opinión sobre este artículo...'}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.content ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.content ? (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.content}</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mínimo 10 caracteres, máximo 1000
            </p>
          )}
          <span className={`text-sm ${
            content.length > 1000 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {content.length}/1000
          </span>
        </div>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>{errors.submit}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isAuthenticated 
            ? 'Tu comentario será moderado antes de publicarse'
            : 'Los comentarios de invitados requieren moderación'
          }
        </p>
        
        <div className="flex space-x-3">
          {parentId && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {parentId ? 'Responder' : 'Comentar'}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
};

export default CommentForm;