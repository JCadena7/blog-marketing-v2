import type { Category } from '../types';

export type { Category } from '../types';

export const mockCategories: Category[] = [
  {
    id: 1,
    name: "SEO",
    slug: "seo",
    description: "Optimización para motores de búsqueda y posicionamiento orgánico",
    color: "#10B981",
    icon: "Search",
    postsCount: 24,
    isActive: true,
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: 1
  },
  {
    id: 2,
    name: "SEM",
    slug: "sem",
    description: "Marketing en motores de búsqueda y publicidad pagada",
    color: "#3B82F6",
    icon: "Target",
    postsCount: 18,
    isActive: true,
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2024-01-10T15:20:00Z",
    createdBy: 1
  },
  {
    id: 3,
    name: "Email Marketing",
    slug: "email-marketing",
    description: "Estrategias de email marketing y automatización",
    color: "#8B5CF6",
    icon: "Mail",
    postsCount: 15,
    isActive: true,
    createdAt: "2023-07-01T00:00:00Z",
    updatedAt: "2024-01-08T12:45:00Z",
    createdBy: 2
  },
  {
    id: 4,
    name: "Social Media",
    slug: "social-media",
    description: "Marketing en redes sociales y community management",
    color: "#F59E0B",
    icon: "Share2",
    postsCount: 21,
    isActive: true,
    createdAt: "2023-07-15T00:00:00Z",
    updatedAt: "2024-01-12T09:15:00Z",
    createdBy: 2
  },
  {
    id: 5,
    name: "Content Marketing",
    slug: "content-marketing",
    description: "Estrategias de marketing de contenidos y storytelling",
    color: "#EF4444",
    icon: "PenTool",
    postsCount: 19,
    isActive: true,
    createdAt: "2023-08-01T00:00:00Z",
    updatedAt: "2024-01-14T16:30:00Z",
    createdBy: 1
  },
  {
    id: 6,
    name: "Analytics",
    slug: "analytics",
    description: "Análisis de datos y métricas de marketing digital",
    color: "#06B6D4",
    icon: "BarChart3",
    postsCount: 12,
    isActive: true,
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2024-01-11T11:20:00Z",
    createdBy: 1
  },
  {
    id: 7,
    name: "E-commerce",
    slug: "ecommerce",
    description: "Marketing para tiendas online y comercio electrónico",
    color: "#84CC16",
    icon: "ShoppingCart",
    postsCount: 8,
    isActive: false,
    createdAt: "2023-10-01T00:00:00Z",
    updatedAt: "2023-12-15T14:45:00Z",
    createdBy: 2
  },
  {
    id: 8,
    name: "Herramientas",
    slug: "herramientas",
    description: "Reseñas y tutoriales de herramientas de marketing",
    color: "#F97316",
    icon: "Tool",
    postsCount: 6,
    isActive: true,
    createdAt: "2023-11-01T00:00:00Z",
    updatedAt: "2024-01-05T13:10:00Z",
    createdBy: 3
  }
];

export const getCategoryById = (id: number) => {
  return mockCategories.find(category => category.id === id);
};

export const getCategoryBySlug = (slug: string) => {
  return mockCategories.find(category => category.slug === slug);
};

export const getActiveCategories = () => {
  return mockCategories.filter(category => category.isActive);
};