import { getUserProfile, updateUserProfile, searchUserProfiles, mockUserProfiles, type UserProfile } from '../data/mockUserProfiles';
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ==================== MOCK DATA LAYER ====================

async function getProfileMock(userId: number): Promise<UserProfile | null> {
  await delay(300);
  return getUserProfile(userId) || null;
}

async function updateProfileMock(userId: number, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  await delay(500);
  return updateUserProfile(userId, updates);
}

// ==================== API DATA LAYER ====================
// Nota: El backend no tiene módulo /profiles, usamos /users en su lugar

async function getProfileApi(userId: number): Promise<UserProfile | null> {
  try {
    // Usar endpoint de users ya que profiles no existe en el backend
    const user = await apiClient.get<any>(
      (API_CONFIG.ENDPOINTS.USER_BY_ID as (id: number) => string)(userId)
    );
    
    // Transformar respuesta del backend al formato UserProfile del frontend
    const profile: UserProfile = {
      id: user.id,
      username: user.username || `user${user.id}`,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName || 'User')}&background=3B82F6&color=fff`,
      coverImage: user.coverImage || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      socialLinks: user.socialLinks || {
        twitter: '',
        linkedin: '',
        github: '',
        instagram: ''
      },
      role: user.rol?.nombre || 'autor',
      status: user.status || 'active',
      isVerified: user.isVerified || false,
      onlineStatus: user.onlineStatus || 'offline',
      lastLogin: user.lastLogin || new Date().toISOString(),
      createdAt: user.created_at || new Date().toISOString(),
      updatedAt: user.updated_at || new Date().toISOString(),
      stats: {
        postsCreated: 0,
        postsPublished: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        followers: 0,
        following: 0,
        likesReceived: 0,
        commentsReceived: 0,
        profileViews: 0
      },
      activity: [],
      preferences: {
        emailNotifications: true,
        pushNotifications: false,
        marketingEmails: false,
        theme: 'light',
        language: 'es',
        timezone: 'America/Bogota',
        defaultEditor: 'hybrid',
        autoSave: true,
        showSocialLinks: true,
        showEmail: false,
        profileVisibility: 'public',
        allowDirectMessages: 'everyone',
        showOnlineStatus: true,
        allowAnalytics: true,
        indexPosts: true,
        allowComments: true,
        moderateComments: false
      }
    };
    
    return profile;
  } catch (error) {
    console.error('Error fetching profile from API:', error);
    return null;
  }
}

async function updateProfileApi(userId: number, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Transformar datos del frontend al formato del backend
    const backendUpdates: any = {};
    
    if (updates.firstName || updates.lastName) {
      backendUpdates.nombre = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
    }
    if (updates.email) backendUpdates.email = updates.email;
    if (updates.avatar) backendUpdates.avatar = updates.avatar;
    if (updates.bio) backendUpdates.bio = updates.bio;
    if (updates.location) backendUpdates.location = updates.location;
    if (updates.website) backendUpdates.website = updates.website;
    if (updates.socialLinks) backendUpdates.socialLinks = updates.socialLinks;
    
    const user = await apiClient.patch<any>(
      (API_CONFIG.ENDPOINTS.USER_BY_ID as (id: number) => string)(userId),
      backendUpdates
    );
    
    // Obtener el perfil actualizado
    return getProfileApi(userId);
  } catch (error) {
    console.error('Error updating profile via API:', error);
    return null;
  }
}

// ==================== PUBLIC API (Auto-switches between mock and real API) ====================

export async function getProfile(userId: number): Promise<UserProfile | null> {
  return useRealApi() ? getProfileApi(userId) : getProfileMock(userId);
}

export async function updateProfile(userId: number, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  return useRealApi() ? updateProfileApi(userId, updates) : updateProfileMock(userId, updates);
}

// ==================== UPLOAD METHODS ====================

async function uploadAvatarMock(userId: number, imageFile: File): Promise<{ avatarUrl: string }> {
  await delay(1000);
  
  // Simulate image upload and return new URL
  const timestamp = Date.now();
  const avatarUrl = `https://images.pexels.com/photos/${2000000 + userId}/pexels-photo-${2000000 + userId}.jpeg?auto=compress&cs=tinysrgb&w=400&t=${timestamp}`;
  
  // Update user profile with new avatar
  updateUserProfile(userId, { avatar: avatarUrl });
  
  return { avatarUrl };
}

async function uploadAvatarApi(userId: number, imageFile: File): Promise<{ avatarUrl: string }> {
  try {
    // El backend no tiene endpoint específico para upload de avatar
    // Opción 1: Usar un servicio de upload externo (Cloudinary, S3, etc.)
    // Opción 2: Implementar endpoint en el backend
    // Por ahora, simulamos el upload y actualizamos con URL
    
    // TODO: Implementar upload real a servicio de almacenamiento
    const avatarUrl = URL.createObjectURL(imageFile);
    
    // Actualizar el usuario con la nueva URL del avatar
    await apiClient.patch(
      (API_CONFIG.ENDPOINTS.USER_BY_ID as (id: number) => string)(userId),
      { avatar: avatarUrl }
    );
    
    return { avatarUrl };
  } catch (error) {
    console.error('Error uploading avatar via API:', error);
    throw error;
  }
}

async function uploadCoverMock(userId: number, imageFile: File): Promise<{ coverUrl: string }> {
  await delay(1000);
  
  const timestamp = Date.now();
  const coverUrl = `https://images.pexels.com/photos/${3000000 + userId}/pexels-photo-${3000000 + userId}.jpeg?auto=compress&cs=tinysrgb&w=1200&t=${timestamp}`;
  
  updateUserProfile(userId, { coverImage: coverUrl });
  
  return { coverUrl };
}

async function uploadCoverApi(userId: number, imageFile: File): Promise<{ coverUrl: string }> {
  try {
    // El backend no tiene endpoint específico para upload de cover
    // TODO: Implementar upload real a servicio de almacenamiento
    const coverUrl = URL.createObjectURL(imageFile);
    
    // Actualizar el usuario con la nueva URL del cover
    await apiClient.patch(
      (API_CONFIG.ENDPOINTS.USER_BY_ID as (id: number) => string)(userId),
      { coverImage: coverUrl }
    );
    
    return { coverUrl };
  } catch (error) {
    console.error('Error uploading cover via API:', error);
    throw error;
  }
}

export async function uploadAvatar(userId: number, imageFile: File): Promise<{ avatarUrl: string }> {
  return useRealApi() ? uploadAvatarApi(userId, imageFile) : uploadAvatarMock(userId, imageFile);
}

export async function uploadCover(userId: number, imageFile: File): Promise<{ coverUrl: string }> {
  return useRealApi() ? uploadCoverApi(userId, imageFile) : uploadCoverMock(userId, imageFile);
}

export async function getProfileStats(userId: number, timeRange: string = '30d'): Promise<any> {
  await delay(400);
  
  const profile = getUserProfile(userId);
  if (!profile) return null;
  
  // Generate mock analytics data based on timeRange
  const multiplier = timeRange === '7d' ? 0.25 : timeRange === '90d' ? 3 : 1;
  
  return {
    ...profile.stats,
    dailyViews: generateDailyData(timeRange),
    postsByCategory: [
      { name: 'SEO', value: 12, color: '#3B82F6' },
      { name: 'SEM', value: 8, color: '#10B981' },
      { name: 'Social Media', value: 10, color: '#F59E0B' },
      { name: 'Content Marketing', value: 6, color: '#EF4444' }
    ]
  };
}

export async function getProfileActivity(userId: number, params: { page?: number; limit?: number; type?: string } = {}): Promise<any> {
  await delay(300);
  
  const profile = getUserProfile(userId);
  if (!profile) return { activities: [], total: 0 };
  
  let activities = [...profile.activity];
  
  if (params.type && params.type !== 'all') {
    activities = activities.filter(activity => activity.type === params.type);
  }
  
  const page = params.page || 1;
  const limit = params.limit || 20;
  const startIndex = (page - 1) * limit;
  const paginatedActivities = activities.slice(startIndex, startIndex + limit);
  
  return {
    activities: paginatedActivities,
    total: activities.length,
    page,
    totalPages: Math.ceil(activities.length / limit)
  };
}

export async function searchUsers(query: string, params: { page?: number; limit?: number } = {}): Promise<any> {
  await delay(250);
  
  const results = searchUserProfiles(query);
  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);
  
  return {
    users: paginatedResults,
    total: results.length,
    page,
    totalPages: Math.ceil(results.length / limit)
  };
}

export async function checkUsernameAvailability(username: string, currentUsername?: string): Promise<{ available: boolean }> {
  await delay(200);
  
  if (username === currentUsername) {
    return { available: true };
  }
  
  const exists = mockUserProfiles.some(profile => 
    profile.username.toLowerCase() === username.toLowerCase()
  );
  
  return { available: !exists };
}

export async function checkEmailAvailability(email: string, currentEmail?: string): Promise<{ available: boolean }> {
  await delay(200);
  
  if (email === currentEmail) {
    return { available: true };
  }
  
  const exists = mockUserProfiles.some(profile => 
    profile.email.toLowerCase() === email.toLowerCase()
  );
  
  return { available: !exists };
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
  await delay(800);
  
  // Simulate password validation
  if (currentPassword !== 'current123') {
    throw new Error('Contraseña actual incorrecta');
  }
  
  // In a real app, this would hash and store the new password
  console.log('Password changed successfully for user:', userId);
}

export async function exportUserData(userId: number): Promise<{ downloadUrl: string }> {
  await delay(2000);
  
  // Simulate data export generation
  return {
    downloadUrl: `/exports/user-data-${userId}-${Date.now()}.json`
  };
}

export async function requestAccountDeletion(userId: number, reason: string): Promise<void> {
  await delay(1000);
  
  // In a real app, this would initiate the account deletion process
  console.log('Account deletion requested for user:', userId, 'Reason:', reason);
}

function generateDailyData(timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 100) + 50,
      likes: Math.floor(Math.random() * 20) + 5,
      comments: Math.floor(Math.random() * 10) + 1
    });
  }
  
  return data;
}