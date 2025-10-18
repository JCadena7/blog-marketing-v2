import type { UserProfile } from '../types';

export type { UserProfile } from '../types';

export const mockUserProfiles: UserProfile[] = [
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    username: 'admin_master',
    email: 'admin@marketingblog.com',
    role: 'administrador',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverImage: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200',
    bio: 'Administrador principal del blog. Especialista en marketing digital con más de 10 años de experiencia ayudando a empresas a crecer online.',
    website: 'https://juanperez.com',
    location: 'Madrid, España',
    phone: '+34 123 456 789',
    birthDate: '1985-03-15',
    status: 'active',
    isVerified: true,
    onlineStatus: 'online',
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    socialLinks: {
      twitter: '@juanperez_mkt',
      linkedin: 'https://linkedin.com/in/juanperez',
      github: 'juanperez-dev',
      instagram: '@juanperez.marketing'
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      theme: 'system',
      language: 'es',
      timezone: 'Europe/Madrid',
      defaultEditor: 'hybrid',
      autoSave: true,
      showSocialLinks: true,
      showEmail: false,
      profileVisibility: 'public',
      allowDirectMessages: 'followers',
      showOnlineStatus: true,
      allowAnalytics: true,
      indexPosts: true,
      allowComments: true,
      moderateComments: false
    },
    stats: {
      postsCreated: 45,
      postsPublished: 42,
      totalViews: 125430,
      totalLikes: 2340,
      totalComments: 567,
      followers: 1250,
      following: 89,
      likesReceived: 3420,
      commentsReceived: 890,
      profileViews: 5670,
      postsGrowth: 22.4,
      viewsGrowth: 18.7,
      likesGrowth: 15.3,
      followersGrowth: 12.8
    },
    activity: [
      {
        id: '1',
        type: 'post_published',
        description: 'Publicó un nuevo post',
        target: 'Guía Completa de SEO 2024',
        createdAt: '2024-01-15T09:30:00Z'
      },
      {
        id: '2',
        type: 'comment_added',
        description: 'Comentó en',
        target: 'Email Marketing: Automatizaciones',
        content: 'Excelente artículo, muy completo.',
        createdAt: '2024-01-14T16:20:00Z'
      },
      {
        id: '3',
        type: 'profile_updated',
        description: 'Actualizó su perfil',
        createdAt: '2024-01-14T12:15:00Z'
      }
    ]
  },
  {
    id: 2,
    firstName: 'María',
    lastName: 'González',
    username: 'editor_pro',
    email: 'editor@marketingblog.com',
    role: 'editor',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    bio: 'Editora senior especializada en content marketing y SEO. Me apasiona crear contenido que realmente conecte con la audiencia.',
    website: 'https://mariagonzalez.blog',
    location: 'Barcelona, España',
    status: 'active',
    isVerified: true,
    onlineStatus: 'away',
    lastLogin: '2024-01-15T09:15:00Z',
    createdAt: '2023-08-15T00:00:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    socialLinks: {
      twitter: '@maria_editor',
      linkedin: 'https://linkedin.com/in/mariagonzalez',
      instagram: '@maria.content'
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: true,
      theme: 'light',
      language: 'es',
      timezone: 'Europe/Madrid',
      defaultEditor: 'wysiwyg',
      autoSave: true,
      showSocialLinks: true,
      showEmail: true,
      profileVisibility: 'public',
      allowDirectMessages: 'everyone',
      showOnlineStatus: true,
      allowAnalytics: true,
      indexPosts: true,
      allowComments: true,
      moderateComments: true
    },
    stats: {
      postsCreated: 128,
      postsPublished: 89,
      totalViews: 89340,
      totalLikes: 1890,
      totalComments: 456,
      followers: 890,
      following: 234,
      likesReceived: 2340,
      commentsReceived: 567,
      profileViews: 3450,
      postsGrowth: 15.2,
      viewsGrowth: 12.3,
      likesGrowth: 8.7,
      followersGrowth: 18.9
    },
    activity: [
      {
        id: '1',
        type: 'post_published',
        description: 'Aprobó y publicó',
        target: 'Social Media Trends 2024',
        createdAt: '2024-01-15T08:45:00Z'
      },
      {
        id: '2',
        type: 'comment_added',
        description: 'Moderó comentarios en',
        target: 'Guía de Content Marketing',
        createdAt: '2024-01-14T17:30:00Z'
      }
    ]
  },
  {
    id: 3,
    firstName: 'Carlos',
    lastName: 'Martínez',
    username: 'writer_seo',
    email: 'writer@marketingblog.com',
    role: 'escritor',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Especialista en SEO y content marketing. Ayudo a empresas a mejorar su visibilidad online a través de contenido de calidad.',
    location: 'Valencia, España',
    status: 'active',
    isVerified: false,
    onlineStatus: 'offline',
    lastLogin: '2024-01-15T08:45:00Z',
    createdAt: '2023-09-20T00:00:00Z',
    updatedAt: '2024-01-15T08:45:00Z',
    socialLinks: {
      twitter: '@carlos_seo',
      linkedin: 'https://linkedin.com/in/carlosmartinez'
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: true,
      theme: 'dark',
      language: 'es',
      timezone: 'Europe/Madrid',
      defaultEditor: 'markdown',
      autoSave: true,
      showSocialLinks: true,
      showEmail: false,
      profileVisibility: 'users',
      allowDirectMessages: 'followers',
      showOnlineStatus: false,
      allowAnalytics: true,
      indexPosts: true,
      allowComments: true,
      moderateComments: false
    },
    stats: {
      postsCreated: 34,
      postsPublished: 28,
      totalViews: 15420,
      totalLikes: 567,
      totalComments: 123,
      followers: 234,
      following: 156,
      likesReceived: 890,
      commentsReceived: 234,
      profileViews: 1230,
      postsGrowth: 28.5,
      viewsGrowth: 22.1,
      likesGrowth: 19.4,
      followersGrowth: 25.6
    },
    activity: [
      {
        id: '1',
        type: 'post_created',
        description: 'Creó un nuevo post',
        target: 'Técnicas Avanzadas de Link Building',
        createdAt: '2024-01-15T07:20:00Z'
      },
      {
        id: '2',
        type: 'like_given',
        description: 'Le gustó',
        target: 'Guía de Google Analytics 4',
        createdAt: '2024-01-14T19:45:00Z'
      }
    ]
  }
];

export const getUserProfile = (userId: number): UserProfile | undefined => {
  return mockUserProfiles.find(profile => profile.id === userId);
};

export const updateUserProfile = (userId: number, updates: Partial<UserProfile>): UserProfile | null => {
  const index = mockUserProfiles.findIndex(profile => profile.id === userId);
  if (index === -1) return null;
  
  mockUserProfiles[index] = {
    ...mockUserProfiles[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return mockUserProfiles[index];
};

export const searchUserProfiles = (query: string): UserProfile[] => {
  const searchTerm = query.toLowerCase();
  return mockUserProfiles.filter(profile =>
    profile.firstName.toLowerCase().includes(searchTerm) ||
    profile.lastName.toLowerCase().includes(searchTerm) ||
    profile.username.toLowerCase().includes(searchTerm) ||
    profile.email.toLowerCase().includes(searchTerm)
  );
};