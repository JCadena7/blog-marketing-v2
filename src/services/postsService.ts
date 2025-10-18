import { mockPosts, type Post } from '../data/mockPosts';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

// In-memory store for mockup purposes
let postsStore: Post[] = [...mockPosts];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ==================== MOCK DATA LAYER ====================

async function getAllPostsMock(): Promise<Post[]> {
  await delay(250);
  return [...postsStore];
}

async function updatePostStatusMock(
  postId: number,
  newStatus: Post['status']
): Promise<Post | null> {
  await delay(200);
  const idx = postsStore.findIndex((p) => p.id === postId);
  if (idx === -1) return null;
  postsStore[idx] = { ...postsStore[idx], status: newStatus, updatedAt: new Date().toISOString() };
  return postsStore[idx];
}

async function deletePostMock(postId: number): Promise<boolean> {
  await delay(150);
  const before = postsStore.length;
  postsStore = postsStore.filter((p) => p.id !== postId);
  return postsStore.length < before;
}

async function bulkActionMock(
  ids: number[],
  action: 'publish' | 'draft' | 'delete'
): Promise<void> {
  await delay(250);
  if (action === 'delete') {
    postsStore = postsStore.filter((p) => !ids.includes(p.id));
    return;
  }
  const status: Post['status'] = action === 'publish' ? 'published' : 'draft';
  postsStore = postsStore.map((p) => (ids.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p));
}

// ==================== API DATA LAYER ====================

async function getAllPostsApi(): Promise<Post[]> {
  try {
    const posts = await apiClient.get<Post[]>(API_CONFIG.ENDPOINTS.POSTS);
    return posts;
  } catch (error) {
    console.error('Error fetching posts from API:', error);
    return [];
  }
}

async function updatePostStatusApi(
  postId: number,
  newStatus: Post['status']
): Promise<Post | null> {
  try {
    const post = await apiClient.patch<Post>(
      API_CONFIG.ENDPOINTS.UPDATE_POST_STATUS(postId),
      { status: newStatus }
    );
    return post;
  } catch (error) {
    console.error('Error updating post status via API:', error);
    return null;
  }
}

async function deletePostApi(postId: number): Promise<boolean> {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.POST_BY_ID(postId));
    return true;
  } catch (error) {
    console.error('Error deleting post via API:', error);
    return false;
  }
}

async function bulkActionApi(
  ids: number[],
  action: 'publish' | 'draft' | 'delete'
): Promise<void> {
  try {
    await apiClient.post(`${API_CONFIG.ENDPOINTS.POSTS}/bulk`, {
      ids,
      action
    });
  } catch (error) {
    console.error('Error performing bulk action via API:', error);
    throw error;
  }
}

// ==================== PUBLIC API (Auto-switches between mock and real API) ====================

export async function getAllPosts(): Promise<Post[]> {
  return useRealApi() ? getAllPostsApi() : getAllPostsMock();
}

export async function updatePostStatus(
  postId: number,
  newStatus: Post['status']
): Promise<Post | null> {
  return useRealApi() ? updatePostStatusApi(postId, newStatus) : updatePostStatusMock(postId, newStatus);
}

export async function deletePost(postId: number): Promise<boolean> {
  return useRealApi() ? deletePostApi(postId) : deletePostMock(postId);
}

export async function bulkAction(
  ids: number[],
  action: 'publish' | 'draft' | 'delete'
): Promise<void> {
  return useRealApi() ? bulkActionApi(ids, action) : bulkActionMock(ids, action);
}

// Helper used by sidebar badges, etc.
export function getPendingPosts(): Post[] {
  return postsStore.filter((p) => p.status === 'pending');
}
