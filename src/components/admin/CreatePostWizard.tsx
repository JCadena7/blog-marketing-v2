import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CreditCard as Edit, Search, Send, CircleCheck as CheckCircle, Clock, Calendar, Tag, Image as ImageIcon, TriangleAlert as AlertTriangle, ArrowLeft, ArrowRight, Save, X, Crown, Target } from 'lucide-react';

import { usePermissions } from '../../hooks/usePermissions';

import { getAllCategories } from '../../services/categoriesService';
import { type Category } from '../../data/mockCategories';
import { useNotifications } from './AdminNotificationSystem';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import OptimizedMdxEditor from '../editor/mdx/OptimizedMdxEditor';

interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  featuredImage: string;
  featuredImageFile: File | null;
  featuredImagePreview: string | null;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;

  status: 'draft' | 'pending' | 'published' | 'scheduled';
  publishDate?: string;
  allowComments: boolean;
  featured: boolean;
  notifySubscribers: boolean;
}

interface CreatePostWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => Promise<void> | void;
}

const CreatePostWizard: React.FC<CreatePostWizardProps> = ({ isOpen, onClose, onSubmit }) => {
  const { hasPermission } = usePermissions();

  const { addNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    excerpt: '',
    content: '',
    categoryId: '',
    tags: [],
    featuredImage: '',
    featuredImageFile: null,
    featuredImagePreview: null,
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',

    status: hasPermission('publicar_post') ? 'published' : 'pending',
    allowComments: true,
    featured: false,
    notifySubscribers: true
  });
  const [saving, setSaving] = useState(false);

  const steps = [
    { id: 1, name: 'Información Básica', icon: FileText, description: 'Título, categoría y resumen' },
    { id: 2, name: 'Contenido', icon: Edit, description: 'Redacta tu artículo' },
    { id: 3, name: 'SEO', icon: Search, description: 'Optimización para buscadores' },
    { id: 4, name: 'Publicación', icon: Send, description: 'Configuración final' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    const data = await getAllCategories();
    setCategories(data.filter(cat => cat.isActive));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.title || !formData.content || !formData.categoryId) {
        addNotification({
          type: 'error',
          title: 'Campos requeridos',
          message: 'Por favor completa el título, contenido y categoría.'
        });
        return;
      }
      
      await Promise.resolve(onSubmit(formData));
      resetForm();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      tags: [],
      featuredImage: '',
      featuredImageFile: null,
      featuredImagePreview: null,
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',

      status: hasPermission('publicar_post') ? 'published' : 'pending',
      allowComments: true,
      featured: false,
      notifySubscribers: true
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.categoryId;
      case 2:
        return formData.content && formData.content.length > 50;
      case 3:
        return true; // SEO es opcional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const canPublishDirectly = hasPermission('publicar_post');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                Crear Nuevo Post
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  animate={{
                    backgroundColor: currentStep >= step.id ? '#3B82F6' : '#E5E7EB',
                    color: currentStep >= step.id ? '#FFFFFF' : '#6B7280',
                    scale: currentStep === step.id ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center w-12 h-12 rounded-full shadow-sm"
                >
                  <step.icon size={20} />
                </motion.div>
                <div className="ml-3 hidden sm:block">
                  <span className={`text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <motion.div 
                    className="w-8 sm:w-16 h-0.5 bg-gray-200 dark:bg-gray-600 ml-3 sm:ml-6"
                    animate={{
                      backgroundColor: currentStep > step.id ? '#3B82F6' : '#E5E7EB'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <BasicInfoStep 
                  formData={formData} 
                  onChange={setFormData} 
                  categories={categories}
                />
              )}
              {currentStep === 2 && (
                <ContentStep 
                  formData={formData} 
                  onChange={setFormData} 
                />
              )}
              {currentStep === 3 && (
                <SEOStep 
                  formData={formData} 
                  onChange={setFormData} 
                />
              )}
              {currentStep === 4 && (
                <PublishStep 
                  formData={formData} 
                  onChange={setFormData} 
                  canPublishDirectly={canPublishDirectly}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className="inline-flex items-center"
            >
              {currentStep === 1 ? (
                <>
                  <X size={16} className="mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <ArrowLeft size={16} className="mr-2" />
                  Anterior
                </>
              )}
            </Button>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Paso {currentStep} de {steps.length}
              </span>
              
              <Button
                onClick={currentStep === steps.length ? handleSubmit : handleNext}
                disabled={!canProceed()}
                loading={saving}
                className="inline-flex items-center"
              >
                {currentStep === steps.length ? (
                  <>
                    <Save size={16} className="mr-2" />
                    Crear Post
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BasicInfoStep: React.FC<{
  formData: PostFormData;
  onChange: (data: PostFormData) => void;
  categories: Category[];
}> = ({ formData, onChange, categories }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (formData.featuredImagePreview) {
        URL.revokeObjectURL(formData.featuredImagePreview);
      }
    };
  }, [formData.featuredImagePreview]);

  const handleFeaturedImageUrlChange = (value: string) => {
    if (formData.featuredImageFile && formData.featuredImagePreview) {
      URL.revokeObjectURL(formData.featuredImagePreview);
    }
    onChange({
      ...formData,
      featuredImage: value,
      featuredImageFile: null,
      featuredImagePreview: null,
    });
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (formData.featuredImagePreview) {
      URL.revokeObjectURL(formData.featuredImagePreview);
    }

    const preview = URL.createObjectURL(file);
    onChange({
      ...formData,
      featuredImageFile: file,
      featuredImagePreview: preview,
      featuredImage: '',
    });

    event.target.value = '';
  };

  const handleClearFile = () => {
    if (formData.featuredImagePreview) {
      URL.revokeObjectURL(formData.featuredImagePreview);
    }
    onChange({
      ...formData,
      featuredImageFile: null,
      featuredImagePreview: null,
      featuredImage: '',
    });
  };

  const previewSrc = formData.featuredImageFile
    ? formData.featuredImagePreview
    : formData.featuredImage;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Input
          label="Título del Post"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, title: e.target.value })}
          placeholder="Ingresa un título atractivo para tu post..."
          className="text-lg font-medium"
          icon={<FileText size={20} className="text-gray-400" />}
        />
        <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Recomendado: 50-70 caracteres para SEO</span>
          <span className={formData.title.length > 70 ? 'text-amber-500' : ''}>
            {formData.title.length}/70
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categoría
        </label>
        <select
          id="category-select"
          value={formData.categoryId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...formData, categoryId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.postsCount} posts)
            </option>
          ))}
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Resumen / Excerpt
        </label>
        <textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...formData, excerpt: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Breve descripción que aparecerá en las tarjetas del blog..."
        />
        <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Recomendado: 150-160 caracteres</span>
          <span className={formData.excerpt.length > 160 ? 'text-amber-500' : ''}>
            {formData.excerpt.length}/160
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Input
          label="Imagen Destacada (URL)"
          value={formData.featuredImage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFeaturedImageUrlChange(e.target.value)}
          placeholder="https://images.pexels.com/..."
          icon={<ImageIcon size={20} className="text-gray-400" />}
          disabled={Boolean(formData.featuredImageFile)}
        />
        <div className="flex items-center gap-3 mt-3">
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button type="button" variant="outline" onClick={handleUploadClick}>
            {formData.featuredImageFile ? 'Cambiar archivo' : 'Subir imagen'}
          </Button>
          {formData.featuredImageFile && (
            <Button type="button" variant="ghost" onClick={handleClearFile}>
              Usar URL
            </Button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {formData.featuredImageFile
            ? 'La imagen se subirá automáticamente cuando crees el post.'
            : '💡 Tip: Usa imágenes de alta calidad de Pexels para mejor engagement'}
        </p>
        {formData.featuredImageFile && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Archivo seleccionado: {formData.featuredImageFile.name}
          </p>
        )}
      </motion.div>

      {/* Preview de la imagen */}
      {previewSrc && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
          <img
            src={previewSrc}
            alt="Vista previa"
            className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

const ContentStep: React.FC<{
  formData: PostFormData;
  onChange: (data: PostFormData) => void;
}> = ({ formData, onChange }) => {
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);

  const handleContentChange = (content: string) => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(words / 200) || 1;
    
    setWordCount(words);
    setReadTime(minutes);
    onChange({ ...formData, content });
  };

  useEffect(() => {
    if (formData.content) {
      handleContentChange(formData.content);
    }
  }, []);
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-200 dark:border-gray-700 pb-4"
      >
        <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
          Contenido del Post
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Escribe el contenido principal de tu post. Puedes usar markdown, HTML o texto plano.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <OptimizedMdxEditor
          initialContent={formData.content}
          onChange={handleContentChange}
          placeholder="Escribe el contenido de tu post aquí. Puedes usar Markdown para formatear el texto..."
          minHeight="400px"
          maxHeight="min(55vh, 600px)"
          showPreview={true}
          showToolbar={true}
        />
      </motion.div>

      {/* Estadísticas del contenido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-500">{wordCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Palabras</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary-500">{formData.content.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Caracteres</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">{readTime}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Min lectura</div>
        </div>
      </motion.div>

      {/* Tags Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TagsEditor
          tags={formData.tags}
          onChange={(tags) => onChange({ ...formData, tags })}
        />
      </motion.div>

      {/* Content Validation */}
      <ContentValidation content={formData.content} />
    </div>
  );
};

const SEOStep: React.FC<{
  formData: PostFormData;
  onChange: (data: PostFormData) => void;
}> = ({ formData, onChange }) => {
  const [seoScore, setSeoScore] = useState(0);

  useEffect(() => {
    const score = calculateSEOScore(formData);
    setSeoScore(score);
  }, [formData]);

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
            Puntuación SEO
          </h3>
          <div className="flex items-center space-x-3">
            <CircularProgress value={seoScore} />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{seoScore}/100</span>
          </div>
        </div>
        <SEORecommendations formData={formData} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Input
            label="Meta Title"
            value={formData.metaTitle || formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, metaTitle: e.target.value })}
            placeholder="Título optimizado para SEO..."
            icon={<Target size={20} className="text-gray-400" />}
          />
          <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Recomendado: 50-60 caracteres</span>
            <span className={(formData.metaTitle || formData.title).length > 60 ? 'text-amber-500' : ''}>
              {(formData.metaTitle || formData.title).length}/60
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Input
            label="Palabra Clave Principal"
            value={formData.focusKeyword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, focusKeyword: e.target.value })}
            placeholder="ej. marketing digital 2024"
            icon={<Search size={20} className="text-gray-400" />}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label htmlFor="meta-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Meta Description
        </label>
        <textarea
          id="meta-description"
          value={formData.metaDescription || formData.excerpt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...formData, metaDescription: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Descripción para motores de búsqueda..."
        />
        <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Recomendado: 150-160 caracteres</span>
          <span className={(formData.metaDescription || formData.excerpt).length > 160 ? 'text-amber-500' : ''}>
            {(formData.metaDescription || formData.excerpt).length}/160
          </span>
        </div>
      </motion.div>

      {/* Google Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Vista Previa en Google
        </h3>
        <GooglePreview
          title={formData.metaTitle || formData.title || 'Título del post'}
          description={formData.metaDescription || formData.excerpt || 'Descripción del post...'}
          url={`https://marketing-digital-pro.com/blog/${formData.title.toLowerCase().replaceAll(/\s+/g, '-')}`}
        />
      </motion.div>
    </div>
  );
};

const PublishStep: React.FC<{
  formData: PostFormData;
  onChange: (data: PostFormData) => void;
  canPublishDirectly: boolean;
}> = ({ formData, onChange, canPublishDirectly }) => (
  <div className="space-y-6">
    {/* Post Summary */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Resumen del Post
      </h3>
      <PostSummary formData={formData} />
    </motion.div>

    {/* Publish Options */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Opciones de Publicación
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...formData, status: e.target.value as PostFormData['status'] })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="draft">Borrador</option>
            {canPublishDirectly ? (
              <option value="published">Publicar ahora</option>
            ) : (
              <option value="pending">Enviar para aprobación</option>
            )}
            <option value="scheduled">Programar publicación</option>
          </select>
        </div>

        {formData.status === 'scheduled' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Input
              label="Fecha y Hora de Publicación"
              type="datetime-local"
              value={formData.publishDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, publishDate: e.target.value })}
              icon={<Calendar size={20} className="text-gray-400" />}
            />
          </motion.div>
        )}

        <div className="space-y-3">
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <input
              type="checkbox"
              checked={formData.allowComments}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, allowComments: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Permitir comentarios</span>
          </motion.label>

          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Marcar como destacado</span>
              <Crown size={16} className="text-yellow-500" />
            </div>
          </motion.label>

          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <input
              type="checkbox"
              checked={formData.notifySubscribers}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, notifySubscribers: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Notificar suscriptores por email</span>
          </motion.label>
        </div>
      </div>
    </motion.div>

    {/* Info Message */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`p-4 rounded-xl border ${
        canPublishDirectly 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
          : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      }`}
    >
      <div className="flex items-center space-x-3">
        {canPublishDirectly ? (
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        ) : (
          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        )}
        <div>
          <p className={`text-sm font-medium ${
            canPublishDirectly 
              ? 'text-green-800 dark:text-green-300' 
              : 'text-yellow-800 dark:text-yellow-300'
          }`}>
            {canPublishDirectly 
              ? '✅ Tu post será publicado inmediatamente'
              : '⏳ Tu post será enviado para aprobación'
            }
          </p>
          <p className={`text-xs mt-1 ${
            canPublishDirectly 
              ? 'text-green-700 dark:text-green-400' 
              : 'text-yellow-700 dark:text-yellow-400'
          }`}>
            {canPublishDirectly 
              ? 'Tienes permisos para publicar directamente. El post estará visible inmediatamente.'
              : 'Un editor revisará tu post antes de publicarlo. Te notificaremos cuando esté aprobado.'
            }
          </p>
        </div>
      </div>
    </motion.div>
  </div>
);

// Helper Components
const TagsEditor: React.FC<{
  tags: string[];
  onChange: (tags: string[]) => void;
}> = ({ tags, onChange }) => {
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularTags = [
    'seo', 'marketing-digital', 'google-ads', 'social-media',
    'content-marketing', 'email-marketing', 'analytics', 'conversion',
    'facebook-ads', 'instagram-marketing', 'linkedin', 'youtube-marketing'
  ];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setNewTag('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const filteredSuggestions = popularTags.filter(
    suggestion => 
      suggestion.toLowerCase().includes(newTag.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  return (
    <div className="space-y-3">
      <label htmlFor="tags-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tags del Post
      </label>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <AnimatePresence>
          {tags.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-200 dark:border-primary-700"
            >
              <Tag size={12} className="mr-1" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="relative">
        <div className="flex space-x-2">
          <input
            id="tags-input"
            type="text"
            value={newTag}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewTag(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(newTag);
              }
            }}
            onFocus={() => setShowSuggestions(newTag.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Agregar tag..."
          />
          <Button onClick={() => addTag(newTag)} variant="outline" size="sm">
            Agregar
          </Button>
        </div>

        {/* Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            {filteredSuggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-800 dark:hover:text-primary-300 first:rounded-t-lg last:rounded-b-lg transition-colors"
              >
                #{suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Agrega tags relevantes para ayudar a categorizar tu contenido. Presiona Enter o coma para agregar.
      </p>
    </div>
  );
};

const PostSummary: React.FC<{ formData: PostFormData }> = ({ formData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Información General</h4>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Título:</dt>
          <dd className="text-gray-900 dark:text-white font-medium truncate ml-2 max-w-48">
            {formData.title || 'Sin título'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Categoría:</dt>
          <dd className="text-gray-900 dark:text-white">
            {formData.categoryId || 'Sin categoría'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Tags:</dt>
          <dd className="text-gray-900 dark:text-white">{formData.tags.length} tags</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Palabras:</dt>
          <dd className="text-gray-900 dark:text-white">
            {formData.content.trim().split(/\s+/).filter(word => word.length > 0).length}
          </dd>
        </div>
      </dl>
    </div>
    
    <div>
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">SEO</h4>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Meta Title:</dt>
          <dd className="text-gray-900 dark:text-white">
            {formData.metaTitle ? '✅ Configurado' : '⚠️ Pendiente'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Meta Description:</dt>
          <dd className="text-gray-900 dark:text-white">
            {formData.metaDescription ? '✅ Configurado' : '⚠️ Pendiente'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Palabra Clave:</dt>
          <dd className="text-gray-900 dark:text-white">
            {formData.focusKeyword || 'Sin definir'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Puntuación SEO:</dt>
          <dd className="text-gray-900 dark:text-white font-medium">
            {calculateSEOScore(formData)}/100
          </dd>
        </div>
      </dl>
    </div>
  </div>
);

const GooglePreview: React.FC<{ title: string; description: string; url: string }> = ({ 
  title, 
  description, 
  url 
}) => (
  <Card className="max-w-lg border border-gray-300 dark:border-gray-600">
    <div className="p-4">
      <div className="text-sm text-green-600 dark:text-green-400 mb-1 truncate">{url}</div>
      <h3 className="text-xl text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1 font-medium">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
        {description}
      </p>
    </div>
  </Card>
);

const CircularProgress: React.FC<{ value: number }> = ({ value }) => {
  const getColor = (score: number) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Mejorable';
  };

  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="#E5E7EB"
          strokeWidth="4"
          fill="transparent"
        />
        <motion.circle
          cx="28"
          cy="28"
          r="24"
          stroke={getColor(value)}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={`${2 * Math.PI * 24}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - value / 100) }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{getLabel(value)}</span>
      </div>
    </div>
  );
};

const SEORecommendations: React.FC<{ formData: PostFormData }> = ({ formData }) => {
  const recommendations = [];

  if (!formData.metaTitle) {
    recommendations.push('Agrega un meta title optimizado');
  }
  if (!formData.metaDescription) {
    recommendations.push('Agrega una meta description');
  }
  if (!formData.focusKeyword) {
    recommendations.push('Define una palabra clave principal');
  }
  if (formData.content.length < 300) {
    recommendations.push('El contenido debería tener al menos 300 palabras');
  }
  if (formData.tags.length < 3) {
    recommendations.push('Agrega al menos 3 tags relevantes');
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex items-center text-green-600 dark:text-green-400">
        <CheckCircle size={16} className="mr-2" />
        <span className="text-sm font-medium">¡Optimización SEO completa! 🎉</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center text-orange-600 dark:text-orange-400">
        <AlertTriangle size={16} className="mr-2" />
        <span className="text-sm font-medium">Recomendaciones SEO:</span>
      </div>
      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
        {recommendations.map((rec) => (
          <motion.li
            key={rec}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3"></span>
            {rec}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

const ContentValidation: React.FC<{ content: string }> = ({ content }) => {
  const issues = [];
  const warnings = [];

  if (!content || content.length < 100) {
    issues.push('El contenido debe tener al menos 100 caracteres');
  }

  if (content && content.length < 300) {
    warnings.push('Posts cortos pueden tener menor engagement');
  }

  if (content && content.length > 10000) {
    warnings.push('Post muy largo - considera dividirlo en partes');
  }

  if (issues.length === 0 && warnings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2"
      >
        <CheckCircle size={16} />
        <span>Contenido validado correctamente</span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Errores críticos */}
      {issues.map((issue) => (
        <motion.div
          key={issue}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2"
        >
          <AlertTriangle size={16} />
          <span>{issue}</span>
        </motion.div>
      ))}

      {/* Warnings */}
      {warnings.map((warning) => (
        <motion.div
          key={warning}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2"
        >
          <AlertTriangle size={16} />
          <span>{warning}</span>
        </motion.div>
      ))}
    </div>
  );
};

function calculateSEOScore(formData: PostFormData): number {
  let score = 0;
  
  // Title (20 points)
  if (formData.title && formData.title.length >= 10) score += 20;
  
  // Meta title (15 points)
  if (formData.metaTitle && formData.metaTitle.length >= 30 && formData.metaTitle.length <= 60) score += 15;
  
  // Meta description (15 points)
  if (formData.metaDescription && formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160) score += 15;
  
  // Focus keyword (10 points)
  if (formData.focusKeyword) score += 10;
  
  // Content length (20 points)
  if (formData.content.length >= 300) score += 10;
  if (formData.content.length >= 800) score += 10;
  
  // Featured image (10 points)
  if (formData.featuredImage) score += 10;
  
  // Tags (10 points)
  if (formData.tags.length >= 3) score += 10;
  
  return Math.min(score, 100);
}

export default CreatePostWizard;