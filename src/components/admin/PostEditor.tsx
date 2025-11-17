import React, { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, ArrowLeft, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, FileText, Tag } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions';
import { type Post } from '../../data/mockPosts';
import { getAllCategories } from '../../services/categoriesService';
import {type Category } from '../../data/mockCategories';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { uploadPostFeaturedImage } from '../../services/postsService';
import { useNotifications } from './AdminNotificationSystem';

interface PostEditorProps {
  post?: Post;
  onSave: (postData: Partial<Post>) => void;
  onCancel: () => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, onSave, onCancel }) => {
  const { hasPermission, userRole } = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categoryId: '',
    tags: [] as string[],
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    status: 'draft' as Post['status']
  });
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  const featuredImageInputRef = useRef<HTMLInputElement | null>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadCategories();
    if (post) {
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        categoryId: post.categoryId?.toString() || '',
        tags: post.tags || [],
        featuredImage: post.featuredImage,
        metaTitle: post.seo?.metaTitle || '',
        metaDescription: post.seo?.metaDescription || '',
        focusKeyword: post.seo?.focusKeyword || '',
        status: post.status
      });
    }
  }, [post]);

  // Auto-save functionality
  useEffect(() => {
    if (!post) return; // Only auto-save for existing posts

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [formData, post]);

  const loadCategories = async () => {
    const data = await getAllCategories();
    setCategories(data.filter(cat => cat.isActive));
  };

  const handleFeaturedImageUploadClick = () => {
    featuredImageInputRef.current?.click();
  };

  const handleFeaturedImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!post?.id) {
      addNotification({
        type: 'warning',
        title: 'Guarda el post primero',
        message: 'Necesitas guardar el post para obtener un ID antes de subir una imagen.'
      });
      event.target.value = '';
      return;
    }

    try {
      setUploadingFeaturedImage(true);
      const { featuredImageUrl } = await uploadPostFeaturedImage(post.id, file);
      setFormData((prev) => ({ ...prev, featuredImage: featuredImageUrl }));
      addNotification({
        type: 'success',
        title: 'Imagen subida',
        message: 'La imagen destacada se actualizó correctamente.'
      });
    } catch (error) {
      console.error(error);
      addNotification({
        type: 'error',
        title: 'Error al subir',
        message: 'No se pudo subir la imagen destacada. Intenta nuevamente.'
      });
    } finally {
      setUploadingFeaturedImage(false);
      event.target.value = '';
    }
  };

  const handleAutoSave = async () => {
    if (!post || saving) return;
    
    try {
      setAutoSaveStatus('saving');
      const { categoryId, ...rest } = formData;
      await onSave({ 
        ...rest, 
        status: 'draft',
        ...(categoryId ? { categoryId: Number(categoryId) } : {})
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 3000);
    } catch (error) {
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(null), 5000);
    }
  };

  const handleSave = async (newStatus?: Post['status']) => {
    try {
      setSaving(true);
      const { categoryId, ...rest } = formData;
      await onSave({ 
        ...rest, 
        status: newStatus || formData.status,
        ...(categoryId ? { categoryId: Number(categoryId) } : {})
      });
    } finally {
      setSaving(false);
    }
  };

  const canPublish = hasPermission('publicar_post');
  const canSaveDraft = hasPermission('crear_post') || hasPermission('editar_post_propio');
  const canReject = hasPermission('publicar_post'); // Solo editores/admins pueden rechazar
  
  // Determinar qué estados puede seleccionar el usuario
  const getAvailableStatuses = () => {
    const statuses = [
      { value: 'draft', label: 'Borrador' }
    ];
    
    // Autores pueden enviar a revisión
    statuses.push({ value: 'pending', label: 'Pendiente Aprobación' });
    
    // Solo editores/admins pueden publicar
    if (canPublish) {
      statuses.push({ value: 'published', label: 'Publicado' });
    }
    
    // Solo editores/admins pueden rechazar
    if (canReject) {
      statuses.push({ value: 'rejected', label: 'Rechazado' });
    }
    
    return statuses;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {post ? 'Editar Post' : 'Nuevo Post'}
            </h1>
            {autoSaveStatus && (
              <div className="flex items-center mt-1 text-sm">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Clock size={14} className="mr-1 text-yellow-500" />
                    <span className="text-yellow-600">Guardando...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircle size={14} className="mr-1 text-green-500" />
                    <span className="text-green-600">Guardado automáticamente</span>
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <AlertTriangle size={14} className="mr-1 text-red-500" />
                    <span className="text-red-600">Error al guardar</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {post && (
            <Button variant="outline" href={`/blog/${post.slug}`} target="_blank">
              <Eye size={16} className="mr-2" />
              Vista Previa
            </Button>
          )}
          
          {/* Guardar con el estado seleccionado */}
          <Button 
            onClick={() => handleSave()}
            loading={saving}
            variant="primary"
          >
            💾 Guardar
          </Button>
          
          {/* Botones rápidos adicionales */}
          {canPublish && formData.status !== 'published' && (
            <Button 
              onClick={() => handleSave('published')}
              loading={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              ✅ Publicar Ahora
            </Button>
          )}
          
          {!canPublish && formData.status !== 'pending' && (
            <Button 
              onClick={() => handleSave('pending')}
              loading={saving}
              variant="outline"
            >
              📤 Enviar a Revisión
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="space-y-4">
              <Input
                label="Título"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título del post..."
                className="text-lg font-medium"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="Escribe el contenido de tu post aquí..."
                />
                <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Palabras: {formData.content.split(' ').filter(word => word.length > 0).length}</span>
                  <span>Tiempo de lectura: {Math.ceil(formData.content.split(' ').length / 200)} min</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Settings */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Configuración
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Post['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {getAvailableStatuses().map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {!canPublish && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    💡 Envía tu post a "Pendiente Aprobación" para que un editor lo revise
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Imagen Destacada"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                placeholder="URL de la imagen..."
              />
              <div className="flex items-center gap-3 mt-2">
                <input
                  ref={featuredImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFeaturedImageFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFeaturedImageUploadClick}
                  disabled={!post?.id || uploadingFeaturedImage}
                >
                  {uploadingFeaturedImage ? 'Subiendo...' : 'Subir archivo'}
                </Button>
                {!post?.id && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Guarda el post para habilitar la subida.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* SEO Settings */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              SEO
            </h3>
            <div className="space-y-4">
              <Input
                label="Meta Title"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Título para SEO..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Descripción para motores de búsqueda..."
                />
              </div>

              <Input
                label="Palabra Clave Principal"
                value={formData.focusKeyword}
                onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                placeholder="Palabra clave objetivo..."
              />
            </div>
          </Card>

          {/* Tags */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tags
            </h3>
            <TagsEditor
              tags={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

const TagsEditor: React.FC<{
  tags: string[];
  onChange: (tags: string[]) => void;
}> = ({ tags, onChange }) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-2 text-primary-600 hover:text-primary-800"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Agregar tag..."
        />
        <Button onClick={addTag} variant="outline" size="sm">
          Agregar
        </Button>
      </div>
    </div>
  );
};

export default PostEditor;