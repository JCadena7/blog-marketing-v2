import type { Post } from '../types';

export type { Post } from '../types';

export const mockPosts: Post[] = [
  {
    id: 1,
    title: "Guía Completa de SEO para 2024: Estrategias que Funcionan",
    slug: "guia-completa-seo-2024",
    content: "El SEO continúa evolucionando y en 2024 hay nuevas estrategias que están marcando la diferencia...",
    excerpt: "Descubre las estrategias de SEO más efectivas para este año y cómo implementarlas en tu sitio web.",
    status: "published",
    authorId: 3,
    author: {
      id: 3,
      name: "Carlos Martínez",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    categoryId: 1,
    category: {
      id: 1,
      name: "SEO",
      slug: "seo",
      color: "#10B981"
    },
    tags: ["seo", "marketing-digital", "google", "posicionamiento"],
    featuredImage: "https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=800",
    publishedAt: "2024-01-10T10:00:00Z",
    createdAt: "2024-01-08T14:30:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
    readTime: 12,
    views: 1250,
    likes: 89,
    comments: 23,
    shares: 45,
    seo: {
      metaTitle: "Guía Completa de SEO 2024 - Estrategias Probadas",
      metaDescription: "Aprende las mejores estrategias de SEO para 2024. Guía completa con técnicas probadas para mejorar tu posicionamiento.",
      focusKeyword: "SEO 2024",
      readabilityScore: 85
    },
    editorial: {
      reviewerId: 2,
      reviewedAt: "2024-01-09T16:20:00Z",
      reviewNotes: "Excelente contenido, solo ajustar algunos títulos",
      approvedBy: 2
    }
  },
  {
    id: 2,
    title: "Email Marketing: Automatizaciones que Convierten",
    slug: "email-marketing-automatizaciones",
    content: "Las automatizaciones de email marketing son una de las herramientas más poderosas...",
    excerpt: "Cómo crear automatizaciones de email que realmente conviertan visitantes en clientes.",
    status: "pending",
    authorId: 4,
    author: {
      id: 4,
      name: "Ana Rodríguez",
      avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    categoryId: 3,
    category: {
      id: 3,
      name: "Email Marketing",
      slug: "email-marketing",
      color: "#8B5CF6"
    },
    tags: ["email-marketing", "automatizacion", "conversion"],
    featuredImage: "https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800",
    createdAt: "2024-01-12T11:15:00Z",
    updatedAt: "2024-01-12T11:15:00Z",
    readTime: 8,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    seo: {
      metaTitle: "Email Marketing: Automatizaciones que Convierten",
      metaDescription: "Descubre cómo crear automatizaciones de email marketing efectivas que generen resultados reales.",
      focusKeyword: "automatizaciones email marketing"
    },
    editorial: {
      submittedAt: "2024-01-12T11:15:00Z",
      status: "pending_review"
    }
  },
  {
    id: 3,
    title: "Social Media Marketing: Tendencias 2024",
    slug: "social-media-marketing-tendencias-2024",
    content: "Las redes sociales siguen evolucionando y 2024 trae nuevas tendencias...",
    excerpt: "Las últimas tendencias en social media marketing que debes conocer para este año.",
    status: "draft",
    authorId: 3,
    author: {
      id: 3,
      name: "Carlos Martínez",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    categoryId: 2,
    category: {
      id: 2,
      name: "Social Media",
      slug: "social-media",
      color: "#3B82F6"
    },
    tags: ["social-media", "tendencias", "marketing"],
    featuredImage: "https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg?auto=compress&cs=tinysrgb&w=800",
    createdAt: "2024-01-13T09:00:00Z",
    updatedAt: "2024-01-13T09:00:00Z",
    readTime: 10,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    seo: {
      metaTitle: "Social Media Marketing: Tendencias 2024",
      metaDescription: "Descubre las tendencias más importantes en social media marketing para 2024.",
      focusKeyword: "social media marketing 2024"
    }
  },
  {
    id: 4,
    title: "Google Analytics 4: Guía Completa de Configuración",
    slug: "google-analytics-4-configuracion",
    content: "Google Analytics 4 representa un cambio paradigmático en la medición...",
    excerpt: "Todo lo que necesitas saber para configurar correctamente Google Analytics 4.",
    status: "rejected",
    authorId: 4,
    author: {
      id: 4,
      name: "Ana Rodríguez",
      avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    categoryId: 4,
    category: {
      id: 4,
      name: "Analytics",
      slug: "analytics",
      color: "#F59E0B"
    },
    tags: ["google-analytics", "analytics", "configuracion"],
    featuredImage: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800",
    createdAt: "2024-01-11T15:30:00Z",
    updatedAt: "2024-01-11T15:30:00Z",
    readTime: 15,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    seo: {
      metaTitle: "Google Analytics 4: Guía Completa de Configuración",
      metaDescription: "Aprende a configurar Google Analytics 4 paso a paso con esta guía completa.",
      focusKeyword: "google analytics 4 configuracion"
    },
    editorial: {
      reviewerId: 2,
      reviewedAt: "2024-01-11T18:00:00Z",
      reviewNotes: "El contenido necesita más ejemplos prácticos y capturas de pantalla actualizadas.",
      status: "rejected"
    }
  }
];

export const getPostsByStatus = (status: string) => {
  return mockPosts.filter(post => post.status === status);
};

export const getPostsByAuthor = (authorId: number) => {
  return mockPosts.filter(post => post.authorId === authorId);
};

export const getPendingPosts = () => {
  return mockPosts.filter(post => post.status === 'pending');
};