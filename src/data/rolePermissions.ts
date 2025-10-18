import type { Role, Permission, RoleConfig } from '../types';

export type { Role, Permission, RoleConfig } from '../types';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  creador: ['admin_completo'],
  administrador: [
    'admin_completo',
    'asignar_roles',
    'comentar',
    'crear_categoria',
    'crear_post',
    'editar_categoria',
    'editar_post_cualquiera',
    'editar_post_propio',
    'eliminar_categoria',
    'publicar_post',
    'reaccionar',
    'rechazar_post'
  ],
  editor: [
    'comentar',
    'crear_categoria',
    'crear_post',
    'editar_categoria',
    'editar_post_cualquiera',
    'editar_post_propio',
    'publicar_post',
    'reaccionar',
    'rechazar_post'
  ],
  escritor: [
    'comentar',
    'crear_post',
    'editar_post_propio',
    'reaccionar'
  ],
  autor: [
    'comentar',
    'crear_post',
    'editar_post_propio',
    'reaccionar'
  ],
  comentador: [
    'comentar',
    'reaccionar'
  ]
};

export const ROLE_CONFIG = {
  creador: { 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', 
    icon: '👑',
    name: 'Creador'
  },
  administrador: { 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
    icon: '🛡️',
    name: 'Admin'
  },
  editor: { 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
    icon: '✏️',
    name: 'Editor'
  },
  escritor: { 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
    icon: '🖋️',
    name: 'Escritor'
  },
  autor: { 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', 
    icon: '⏳',
    name: 'Autor'
  },
  comentador: { 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', 
    icon: '💬',
    name: 'Comentador'
  }
};

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  admin_completo: 'Acceso completo a todas las funciones del sistema',
  asignar_roles: 'Puede cambiar roles de otros usuarios',
  comentar: 'Puede comentar en posts publicados',
  crear_categoria: 'Puede crear nuevas categorías',
  crear_post: 'Puede crear nuevos posts',
  editar_categoria: 'Puede editar categorías existentes',
  editar_post_cualquiera: 'Puede editar cualquier post',
  editar_post_propio: 'Puede editar solo sus propios posts',
  eliminar_categoria: 'Puede eliminar categorías',
  publicar_post: 'Puede publicar posts',
  reaccionar: 'Puede dar like/dislike a posts y comentarios',
  rechazar_post: 'Puede rechazar posts en revisión'
};