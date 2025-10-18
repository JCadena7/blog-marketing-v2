import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard as Edit2, Trash2, Search, Palette, Eye, EyeOff, FileText, Calendar, User } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { type Category } from '../../data/mockCategories';
import { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory as deleteCategoryApi,
  toggleCategoryStatus 
} from '../../services/categoriesService';
import { useNotifications } from './AdminNotificationSystem';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import ConfirmDialog from '../ui/ConfirmDialog';

const CategoriesManagement: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { addNotification } = useNotifications();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: number) => {
    setConfirmDelete({ open: true, id: categoryId });
  };

  const confirmDeleteCategory = async () => {
    if (confirmDelete.id == null) return;
    try {
      setDeleteLoading(true);
      const success = await deleteCategoryApi(confirmDelete.id);
      if (success) {
        setCategories(prev => prev.filter(cat => cat.id !== confirmDelete.id));
        addNotification({
          type: 'success',
          title: 'Categoría eliminada',
          message: 'La categoría ha sido eliminada exitosamente.'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'No se puede eliminar',
          message: 'No se puede eliminar una categoría que tiene posts asociados.'
        });
      }
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ open: false, id: null });
    }
  };

  const handleToggleStatus = async (categoryId: number) => {
    try {
      const success = await toggleCategoryStatus(categoryId);
      if (success) {
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, isActive: !cat.isActive }
            : cat
        ));
        
        const category = categories.find(cat => cat.id === categoryId);
        addNotification({
          type: 'success',
          title: 'Estado actualizado',
          message: `Categoría ${category?.isActive ? 'desactivada' : 'activada'} exitosamente.`
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cambiar el estado de la categoría.'
      });
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (selectedCategory) {
        const updated = await updateCategory(selectedCategory.id, categoryData);
        setCategories(prev => prev.map(cat => 
          cat.id === selectedCategory.id ? (updated ?? cat) : cat
        ));
        addNotification({
          type: 'success',
          title: 'Categoría actualizada',
          message: 'Los cambios han sido guardados exitosamente.'
        });
      } else {
        const newCategory = await createCategory(categoryData);
        setCategories(prev => [newCategory, ...prev]);
        addNotification({
          type: 'success',
          title: 'Categoría creada',
          message: 'La nueva categoría ha sido creada exitosamente.'
        });
      }
      setIsModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al guardar',
        message: 'No se pudo guardar la categoría.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Categorías
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {filteredCategories.length} categorías encontradas
          </p>
        </div>

        {hasPermission('crear_categoria') && (
          <Button onClick={handleCreateCategory}>
            <Plus size={16} className="mr-2" />
            Nueva Categoría
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <CategoryCard
                  category={category}
                  onEdit={() => handleEditCategory(category)}
                  onDelete={() => handleDeleteCategory(category.id)}
                  onToggleStatus={() => handleToggleStatus(category.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        title="Eliminar categoría"
        description="¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={confirmDeleteCategory}
      />
    </div>
  );
};

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  const { hasPermission } = usePermissions();

  return (
    <Card className="relative overflow-hidden group">
      {/* Color indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: category.color }}
      />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <FileText 
                size={20} 
                style={{ color: category.color }} 
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {category.postsCount} posts
              </p>
            </div>
          </div>
          
          {hasPermission('editar_categoria') && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {category.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              category.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {category.isActive ? (
                <>
                  <Eye size={12} className="mr-1" />
                  Activa
                </>
              ) : (
                <>
                  <EyeOff size={12} className="mr-1" />
                  Inactiva
                </>
              )}
            </span>
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Calendar size={12} className="mr-1" />
            {new Date(category.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        {hasPermission('editar_categoria') && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onToggleStatus}
              className={`text-sm font-medium transition-colors ${
                category.isActive
                  ? 'text-orange-600 hover:text-orange-700'
                  : 'text-green-600 hover:text-green-700'
              }`}
            >
              {category.isActive ? 'Desactivar' : 'Activar'}
            </button>
            
            {hasPermission('admin_completo') && category.postsCount === 0 && (
              <button
                onClick={onDelete}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 size={14} className="mr-1 inline" />
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (categoryData: Partial<Category>) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  category, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isActive: true
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
        isActive: category.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        isActive: true
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          {category ? 'Editar Categoría' : 'Nueva Categoría'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nombre de la categoría"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Descripción de la categoría"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color 
                        ? 'border-gray-400 scale-110' 
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Categoría activa
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {category ? 'Actualizar' : 'Crear'} Categoría
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CategoriesManagement;