import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Confirmar acción',
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const confirmButtonVariant = variant === 'danger' ? 'secondary' : 'primary';
  const confirmExtraClass = variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !loading && onCancel()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {title}
            </h3>

            {description && (
              <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                {cancelText}
              </Button>
              <Button
                variant={confirmButtonVariant as any}
                onClick={onConfirm}
                loading={loading}
                className={confirmExtraClass}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
