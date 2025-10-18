import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from 'lucide-react';

interface ReportCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentId: number;
  showNotification: (notification: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

const ReportCommentModal: React.FC<ReportCommentModalProps> = ({ 
  isOpen, 
  onClose, 
  commentId,
  showNotification
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { value: 'spam', label: 'Es spam o publicidad' },
    { value: 'inappropriate', label: 'Contenido inapropiado' },
    { value: 'offensive', label: 'Lenguaje ofensivo' },
    { value: 'misinformation', label: 'Información falsa' },
    { value: 'harassment', label: 'Acoso o intimidación' },
    { value: 'other', label: 'Otro motivo' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      showNotification({
        type: 'error',
        message: 'Por favor selecciona un motivo'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      
      showNotification({
        type: 'success',
        message: 'Reporte enviado exitosamente'
      });
      
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReason('');
        setDescription('');
      }, 2000);
      
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error al enviar el reporte'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSubmitted(false);
      setReason('');
      setDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Flag className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reportar Comentario
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Reporte enviado
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Gracias por ayudarnos a mantener la comunidad segura. 
                  Revisaremos tu reporte lo antes posible.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">
                      <p className="font-medium mb-1">Antes de reportar:</p>
                      <p>Los reportes son revisados por nuestro equipo de moderación. 
                      Solo reporta contenido que viole nuestras normas de comunidad.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Motivo del reporte *
                  </label>
                  <div className="space-y-2">
                    {reasons.map((r) => (
                      <label key={r.value} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción adicional (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Proporciona más detalles sobre el reporte..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {description.length}/500
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!reason || isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Flag className="w-4 h-4 mr-2" />
                        Enviar Reporte
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportCommentModal;