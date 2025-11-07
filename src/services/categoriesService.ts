import { mockCategories, type Category } from '../data/mockCategories';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';
import type { CategoryBackend } from '../types';

let categoriesStore: Category[] = [...mockCategories];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ==================== TRANSFORMERS ====================

/**
 * Transforma una categoría del backend (snake_case) al formato del frontend (camelCase)
 */
function transformCategoryFromBackend(backendCategory: CategoryBackend): Category {
  return {
    id: backendCategory.id,
    name: backendCategory.nombre,
    slug: backendCategory.slug,
    description: backendCategory.descripcion,
    color: backendCategory.color,
    icon: backendCategory.icono,
    postsCount: backendCategory.posts_count,
    isActive: backendCategory.is_active,
    createdAt: backendCategory.created_at,
    updatedAt: backendCategory.updated_at,
    createdBy: backendCategory.created_by,
    parentId: backendCategory.parent_id,
    displayOrder: backendCategory.display_order
  };
}

/**
 * Transforma una categoría del frontend (camelCase) al formato del backend (snake_case)
 */
function transformCategoryToBackend(category: Partial<Category>): Partial<CategoryBackend> {
  const backendData: Partial<CategoryBackend> = {};
  
  if (category.name !== undefined) backendData.nombre = category.name;
  if (category.slug !== undefined) backendData.slug = category.slug;
  if (category.description !== undefined) backendData.descripcion = category.description;
  if (category.color !== undefined) backendData.color = category.color;
  if (category.icon !== undefined) backendData.icono = category.icon;
  if (category.isActive !== undefined) backendData.is_active = category.isActive;
  if (category.parentId !== undefined) backendData.parent_id = category.parentId;
  if (category.displayOrder !== undefined) backendData.display_order = category.displayOrder;
  
  return backendData;
}

// ==================== MOCK DATA LAYER ====================

async function getAllCategoriesMock(): Promise<Category[]> {
  await delay(200);
  return [...categoriesStore];
}

async function createCategoryMock(categoryData: Partial<Category>): Promise<Category> {
  await delay(300);
  
  const newCategory: Category = {
    id: Math.max(...categoriesStore.map(c => c.id)) + 1,
    name: categoryData.name || '',
    slug: categoryData.name?.toLowerCase().replace(/\s+/g, '-') || '',
    description: categoryData.description || '',
    color: categoryData.color || '#3B82F6',
    icon: 'FileText',
    postsCount: 0,
    isActive: categoryData.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1
  };

  categoriesStore.push(newCategory);
  return newCategory;
}

async function updateCategoryMock(
  categoryId: number, 
  categoryData: Partial<Category>
): Promise<Category | null> {
  await delay(250);
  
  const index = categoriesStore.findIndex(c => c.id === categoryId);
  if (index === -1) return null;

  categoriesStore[index] = {
    ...categoriesStore[index],
    ...categoryData,
    slug: categoryData.name?.toLowerCase().replace(/\s+/g, '-') || categoriesStore[index].slug,
    updatedAt: new Date().toISOString()
  };

  return categoriesStore[index];
}

async function deleteCategoryMock(categoryId: number): Promise<boolean> {
  await delay(200);
  
  const category = categoriesStore.find(c => c.id === categoryId);
  if (!category || category.postsCount > 0) {
    return false;
  }

  const before = categoriesStore.length;
  categoriesStore = categoriesStore.filter(c => c.id !== categoryId);
  return categoriesStore.length < before;
}

async function toggleCategoryStatusMock(categoryId: number): Promise<boolean> {
  await delay(150);
  
  const index = categoriesStore.findIndex(c => c.id === categoryId);
  if (index === -1) return false;

  categoriesStore[index] = {
    ...categoriesStore[index],
    isActive: !categoriesStore[index].isActive,
    updatedAt: new Date().toISOString()
  };

  return true;
}

// ==================== API DATA LAYER ====================

async function getAllCategoriesApi(): Promise<Category[]> {
  try {
    const backendCategories = await apiClient.get<CategoryBackend[]>(API_CONFIG.ENDPOINTS.CATEGORIES as string);
    return backendCategories.map(transformCategoryFromBackend);
  } catch (error) {
    console.error('Error fetching categories from API:', error);
    return [];
  }
}

async function createCategoryApi(categoryData: Partial<Category>): Promise<Category> {
  try {
    const backendData = transformCategoryToBackend(categoryData);
    const backendCategory = await apiClient.post<CategoryBackend>(
      API_CONFIG.ENDPOINTS.CATEGORIES as string,
      backendData
    );
    return transformCategoryFromBackend(backendCategory);
  } catch (error) {
    console.error('Error creating category via API:', error);
    throw error;
  }
}

async function updateCategoryApi(
  categoryId: number, 
  categoryData: Partial<Category>
): Promise<Category | null> {
  try {
    const backendData = transformCategoryToBackend(categoryData);
    const backendCategory = await apiClient.patch<CategoryBackend>(
      (API_CONFIG.ENDPOINTS.CATEGORY_BY_ID as (id: number) => string)(categoryId),
      backendData
    );
    return transformCategoryFromBackend(backendCategory);
  } catch (error) {
    console.error('Error updating category via API:', error);
    return null;
  }
}

async function deleteCategoryApi(categoryId: number): Promise<boolean> {
  try {
    await apiClient.delete((API_CONFIG.ENDPOINTS.CATEGORY_BY_ID as (id: number) => string)(categoryId));
    return true;
  } catch (error) {
    console.error('Error deleting category via API:', error);
    return false;
  }
}

async function toggleCategoryStatusApi(categoryId: number): Promise<boolean> {
  try {
    await apiClient.patch(`${(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID as (id: number) => string)(categoryId)}/toggle`, {});
    return true;
  } catch (error) {
    console.error('Error toggling category status via API:', error);
    return false;
  }
}

// ==================== PUBLIC API (Auto-switches between mock and real API) ====================

export async function getAllCategories(): Promise<Category[]> {
  return useRealApi() ? getAllCategoriesApi() : getAllCategoriesMock();
}

export async function createCategory(categoryData: Partial<Category>): Promise<Category> {
  return useRealApi() ? createCategoryApi(categoryData) : createCategoryMock(categoryData);
}

export async function updateCategory(
  categoryId: number, 
  categoryData: Partial<Category>
): Promise<Category | null> {
  return useRealApi() ? updateCategoryApi(categoryId, categoryData) : updateCategoryMock(categoryId, categoryData);
}

export async function deleteCategory(categoryId: number): Promise<boolean> {
  return useRealApi() ? deleteCategoryApi(categoryId) : deleteCategoryMock(categoryId);
}

export async function toggleCategoryStatus(categoryId: number): Promise<boolean> {
  return useRealApi() ? toggleCategoryStatusApi(categoryId) : toggleCategoryStatusMock(categoryId);
}

export function getActiveCategories(): Category[] {
  return categoriesStore.filter(c => c.isActive);
}

// ==================== ENDPOINTS AVANZADOS DEL BACKEND ====================

/**
 * Obtener estadísticas generales de categorías
 */
export async function getCategoriesStats(): Promise<any> {
  if (!useRealApi()) {
    return {
      total: categoriesStore.length,
      active: categoriesStore.filter(c => c.isActive).length,
      inactive: categoriesStore.filter(c => !c.isActive).length,
      totalPosts: categoriesStore.reduce((sum, c) => sum + c.postsCount, 0)
    };
  }
  
  try {
    const stats = await apiClient.get(
      API_CONFIG.ENDPOINTS.CATEGORIES_STATS_GENERAL as string
    );
    return stats;
  } catch (error) {
    console.error('Error fetching categories stats:', error);
    return {};
  }
}

/**
 * Obtener engagement por categoría
 */
export async function getCategoriesEngagement(): Promise<any[]> {
  if (!useRealApi()) return [];
  
  try {
    const engagement = await apiClient.get(
      API_CONFIG.ENDPOINTS.CATEGORIES_STATS_ENGAGEMENT as string
    );
    return engagement as any[];
  } catch (error) {
    console.error('Error fetching categories engagement:', error);
    return [];
  }
}

/**
 * Obtener categorías con mejor rendimiento
 */
export async function getCategoriesMejorRendimiento(): Promise<any[]> {
  if (!useRealApi()) {
    return [...categoriesStore]
      .sort((a, b) => b.postsCount - a.postsCount)
      .slice(0, 10);
  }
  
  try {
    const categories = await apiClient.get(
      API_CONFIG.ENDPOINTS.CATEGORIES_STATS_MEJOR_RENDIMIENTO as string
    );
    return categories as any[];
  } catch (error) {
    console.error('Error fetching best performing categories:', error);
    return [];
  }
}

/**
 * Obtener estructura jerárquica de categorías
 */
export async function getCategoriesJerarquicas(): Promise<any[]> {
  if (!useRealApi()) return categoriesStore;
  
  try {
    const categories = await apiClient.get(
      API_CONFIG.ENDPOINTS.CATEGORIES_STATS_JERARQUICAS as string
    );
    return categories as any[];
  } catch (error) {
    console.error('Error fetching hierarchical categories:', error);
    return [];
  }
}