import type { Comment } from '../types';

export type { Comment } from '../types';

export const mockComments: Comment[] = [
  {
    id: 1,
    postId: 'guia-completa-seo-2024-estrategias',
    postTitle: "Guía Completa de SEO para 2024",
    authorId: 5,
    author: {
      id: 5,
      name: "Laura García",
      email: "laura@email.com",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    content: "Excelente artículo, muy completo y actualizado. Me ha ayudado mucho con mi estrategia de SEO.",
    status: "approved",
    likes: 12,
    createdAt: "2024-01-11T14:20:00Z",
    updatedAt: "2024-01-11T14:20:00Z",
    moderatedBy: 2,
    moderatedAt: "2024-01-11T15:00:00Z"
  },
  {
    id: 2,
    postId: 'guia-completa-seo-2024-estrategias',
    postTitle: "Guía Completa de SEO para 2024",
    authorId: 6,
    author: {
      id: 6,
      name: "Roberto Silva",
      email: "roberto@email.com",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    content: "¿Podrías profundizar más en el tema de Core Web Vitals? Me parece muy interesante.",
    status: "pending",
    likes: 3,
    createdAt: "2024-01-12T09:30:00Z",
    updatedAt: "2024-01-12T09:30:00Z"
  },
  {
    id: 3,
    postId: 'guia-completa-seo-2024-estrategias',
    postTitle: "Guía Completa de SEO para 2024",
    authorId: 7,
    author: {
      id: 7,
      name: "Miguel Torres",
      email: "miguel@email.com",
      avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    content: "¡Increíble post! Justo lo que necesitaba para mi proyecto.",
    status: "approved",
    parentId: 1,
    likes: 8,
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    moderatedBy: 2,
    moderatedAt: "2024-01-12T17:00:00Z"
  },
  {
    id: 4,
    postId: 'email-marketing-automatizaciones-ingresos',
    postTitle: "Email Marketing: Automatizaciones que Convierten",
    authorId: 8,
    author: {
      id: 8,
      name: "Patricia Ruiz",
      email: "patricia@email.com",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    content: "Spam content here - buy cheap products now!!!",
    status: "spam",
    likes: 0,
    createdAt: "2024-01-13T10:15:00Z",
    updatedAt: "2024-01-13T10:15:00Z",
    moderatedBy: 1,
    moderatedAt: "2024-01-13T10:30:00Z",
    moderationNotes: "Contenido spam detectado automáticamente"
  },
  {
    id: 5,
    postId: 'guia-completa-seo-2024-estrategias',
    postTitle: "Guía Completa de SEO para 2024",
    authorId: 9,
    author: {
      id: 9,
      name: "Carmen López",
      email: "carmen@email.com",
      avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    content: "No estoy de acuerdo con algunos puntos del artículo. Creo que falta mencionar la importancia de...",
    status: "rejected",
    likes: 1,
    createdAt: "2024-01-13T14:20:00Z",
    updatedAt: "2024-01-13T14:20:00Z",
    moderatedBy: 2,
    moderatedAt: "2024-01-13T15:00:00Z",
    moderationNotes: "Comentario demasiado negativo sin aportar valor constructivo"
  },
  {
    id: 6,
    postId: 'guia-completa-seo-2024-estrategias',
    postTitle: "Guía Completa de SEO para 2024",
    authorId: 10,
    author: {
      id: 10,
      name: "Ana Martín",
      email: "ana@email.com",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    content: "Muy útil la información sobre Core Web Vitals. ¿Tienes alguna herramienta recomendada para medirlos?",
    status: "approved",
    likes: 15,
    createdAt: "2024-01-14T11:30:00Z",
    updatedAt: "2024-01-14T11:30:00Z",
    moderatedBy: 2,
    moderatedAt: "2024-01-14T12:00:00Z"
  },
  {
    id: 7,
    postId: 'guia-completa-seo-2024-estrategias',
    postTitle: "Guía Completa de SEO para 2024",
    authorId: 3,
    author: {
      id: 3,
      name: "Carlos Martínez",
      email: "carlos@email.com",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    content: "¡Gracias por la pregunta! Te recomiendo Google PageSpeed Insights y GTmetrix para medir Core Web Vitals. También Lighthouse es excelente.",
    status: "approved",
    parentId: 6,
    likes: 8,
    createdAt: "2024-01-14T14:15:00Z",
    updatedAt: "2024-01-14T14:15:00Z",
    moderatedBy: 2,
    moderatedAt: "2024-01-14T14:30:00Z"
  },
  {
    id: 8,
    postId: 'content-marketing-que-vende',
    postTitle: "Content Marketing: Cómo Crear Contenido que Vende",
    authorId: 11,
    author: {
      id: 11,
      name: "David Ruiz",
      email: "david@email.com",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    content: "Excelente framework para content marketing. ¿Podrías compartir algunos ejemplos de CTAs que funcionen bien?",
    status: "approved",
    likes: 7,
    createdAt: "2024-01-15T09:20:00Z",
    updatedAt: "2024-01-15T09:20:00Z",
    moderatedBy: 2,
    moderatedAt: "2024-01-15T09:45:00Z"
  }
];

export const getCommentsByStatus = (status: string) => {
  return mockComments.filter(comment => comment.status === status);
};

export const getPendingComments = () => {
  return mockComments.filter(comment => comment.status === 'pending');
};

export const getCommentsByPost = (postId: string | number) => {
  return mockComments.filter(comment => comment.postId === postId);
};