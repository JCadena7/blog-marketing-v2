import { mockCategories, type Category } from '../data/mockCategories';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

let categoriesStore: Category[] = [...mockCategories];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
    const categories = await apiClient.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES);
    return categories;
  } catch (error) {
    console.error('Error fetching categories from API:', error);
    return [];
  }
}

async function createCategoryApi(categoryData: Partial<Category>): Promise<Category> {
  try {
    const category = await apiClient.post<Category>(
      API_CONFIG.ENDPOINTS.CATEGORIES,
      categoryData
    );
    return category;
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
    const category = await apiClient.patch<Category>(
      API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(categoryId),
      categoryData
    );
    return category;
  } catch (error) {
    console.error('Error updating category via API:', error);
    return null;
  }
}

async function deleteCategoryApi(categoryId: number): Promise<boolean> {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(categoryId));
    return true;
  } catch (error) {
    console.error('Error deleting category via API:', error);
    return false;
  }
}

async function toggleCategoryStatusApi(categoryId: number): Promise<boolean> {
  try {
    await apiClient.patch(`${API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(categoryId)}/toggle`, {});
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