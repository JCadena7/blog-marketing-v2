import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ROLE_PERMISSIONS, type Permission } from '../data/rolePermissions';


export const usePermissions = () => {
  const { user, demoMode, previewStrict } = useContext(AuthContext);
  const effectiveDemo = demoMode && !previewStrict; // if strict preview is ON, ignore demo bypass

  const hasPermission = (requiredPermission: Permission): boolean => {
    if (effectiveDemo) return true;
    if (!user?.role) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role];
    
    // Creador tiene todos los permisos
    if (user.role === 'creador') return true;
    
    // Verificar si tiene admin_completo
    if (rolePermissions.includes('admin_completo')) return true;
    
    // Verificar permiso específico
    return rolePermissions.includes(requiredPermission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (effectiveDemo) return true;
    return permissions.some(permission => hasPermission(permission));
  };

  const canAccessSection = (sectionPermissions: Permission[]): boolean => {
    if (effectiveDemo) return true;
    return hasAnyPermission(sectionPermissions);
  };

  const canEditPost = (postAuthorId: number): boolean => {
    if (effectiveDemo) return true;
    if (!user) return false;

    // Puede editar cualquier post
    if (hasPermission('editar_post_cualquiera')) return true;
    
    // Puede editar solo sus propios posts
    if (hasPermission('editar_post_propio') && postAuthorId === user.id) return true;
    
    return false;
  };

  const canDeletePost = (postAuthorId: number): boolean => {
    if (!user) return false;

    // Solo admin completo o creador pueden eliminar
    return hasPermission('admin_completo') || user.role === 'creador';
  };

  const canModerateComment = (commentAuthorId: number): boolean => {
    if (effectiveDemo) return true;
    if (!user) return false;
    // Admin completo puede moderar cualquier comentario
    if (hasPermission('admin_completo')) return true;
    // Editores pueden moderar comentarios
    if (user.role === 'editor') return true;
    return false;
  };

  const canChangeUserRole = (): boolean => {
    if (effectiveDemo) return true;
    return hasPermission('asignar_roles');
  };

  return {
    hasPermission,
    hasAnyPermission,
    canAccessSection,
    canEditPost,
    canDeletePost,
    canModerateComment,
    canChangeUserRole,
    userRole: user?.role,
    previewStrict,
    effectiveDemo
  };
};