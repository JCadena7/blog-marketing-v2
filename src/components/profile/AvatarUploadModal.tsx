import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera, Crop, Save, RotateCcw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { uploadAvatar } from '../../services/profileService';
import { useNotifications } from '../admin/AdminNotificationSystem';
import Button from '../ui/Button';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  userId: number;
  onUpdate: (newAvatar: string) => void;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  userId,
  onUpdate
}) => {
  const { addNotification } = useNotifications();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'select' | 'preview' | 'crop'>('select');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: 'error',
          title: 'Archivo muy grande',
          message: 'La imagen debe ser menor a 5MB'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'error',
          title: 'Tipo de archivo inválido',
          message: 'Solo se permiten archivos de imagen'
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStep('preview');
    }
  }, [addNotification]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const result = await uploadAvatar(userId, selectedFile);
      
      onUpdate(result.avatarUrl);
      
      addNotification({
        type: 'success',
        title: 'Avatar actualizado',
        message: 'Tu foto de perfil ha sido actualizada exitosamente'
      });
      
      handleClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al subir imagen',
        message: 'No se pudo actualizar tu avatar. Inténtalo de nuevo.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStep('select');
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStep('select');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cambiar Avatar
            </h3>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'select' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Current Avatar */}
                <div className="text-center">
                  <img
                    src={currentAvatar}
                    alt="Avatar actual"
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Avatar actual</p>
                </div>

                {/* Upload Area */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload size={32} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                    {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic para seleccionar'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF hasta 5MB
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'preview' && previewUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Preview */}
                <div className="text-center">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Vista previa</p>
                </div>

                {/* File Info */}
                {selectedFile && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Archivo:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-300">Tamaño:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw size={16} className="mr-2" />
                    Cambiar Imagen
                  </Button>
                  <Button onClick={handleUpload} loading={uploading}>
                    <Save size={16} className="mr-2" />
                    Guardar Avatar
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AvatarUploadModal;