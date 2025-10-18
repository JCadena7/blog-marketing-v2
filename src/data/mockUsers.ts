import type { User } from '../types';

export type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    username: "admin_master",
    email: "admin@marketingblog.com",
    firstName: "Juan",
    lastName: "Pérez",
    role: "administrador",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2023-06-01T00:00:00Z",
    permissions: [
      "admin_completo",
      "asignar_roles",
      "comentar",
      "crear_categoria",
      "crear_post",
      "editar_categoria",
      "editar_post_cualquiera",
      "editar_post_propio",
      "eliminar_categoria",
      "publicar_post",
      "reaccionar",
      "rechazar_post"
    ],
    stats: {
      postsCreated: 45,
      commentsApproved: 234,
      usersManaged: 12
    }
  },
  {
    id: 2,
    username: "editor_pro",
    email: "editor@marketingblog.com",
    firstName: "María",
    lastName: "González",
    role: "editor",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    status: "active",
    lastLogin: "2024-01-15T09:15:00Z",
    createdAt: "2023-08-15T00:00:00Z",
    permissions: [
      "comentar",
      "crear_categoria",
      "crear_post",
      "editar_categoria",
      "editar_post_cualquiera",
      "editar_post_propio",
      "publicar_post",
      "reaccionar",
      "rechazar_post"
    ],
    stats: {
      postsEdited: 128,
      postsPublished: 89,
      commentsModerated: 456
    }
  },
  {
    id: 3,
    username: "writer_seo",
    email: "writer@marketingblog.com",
    firstName: "Carlos",
    lastName: "Martínez",
    role: "escritor",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    status: "active",
    lastLogin: "2024-01-15T08:45:00Z",
    createdAt: "2023-09-20T00:00:00Z",
    permissions: [
      "comentar",
      "crear_post",
      "editar_post_propio",
      "reaccionar"
    ],
    stats: {
      postsCreated: 34,
      postsPublished: 28,
      totalViews: 15420
    }
  },
  {
    id: 4,
    username: "author_content",
    email: "author@marketingblog.com",
    firstName: "Ana",
    lastName: "Rodríguez",
    role: "autor",
    avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400",
    status: "active",
    lastLogin: "2024-01-14T16:20:00Z",
    createdAt: "2023-11-10T00:00:00Z",
    permissions: [
      "comentar",
      "crear_post",
      "editar_post_propio",
      "reaccionar"
    ],
    stats: {
      postsCreated: 12,
      postsPublished: 8,
      totalViews: 3240
    }
  },
  {
    id: 5,
    username: "commenter_active",
    email: "commenter@marketingblog.com",
    firstName: "Laura",
    lastName: "García",
    role: "comentador",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
    status: "active",
    lastLogin: "2024-01-15T12:00:00Z",
    createdAt: "2023-12-01T00:00:00Z",
    permissions: [
      "comentar",
      "reaccionar"
    ],
    stats: {
      postsCreated: 0,
      postsPublished: 0,
      totalViews: 0
    }
  }
];

export const getCurrentUser = (): User => {
  // En una aplicación real, esto vendría del contexto de autenticación
  return mockUsers[0]; // Por defecto, devolvemos el administrador
};