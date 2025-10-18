import React, { type ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { type Permission } from '../../data/rolePermissions';
import AccessDenied from './AccessDenied';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  fallback?: ReactNode;
  requireAll?: boolean; // Si true, requiere TODOS los permisos, si false requiere AL MENOS UNO
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredPermissions = [],
  fallback,
  requireAll = false
}) => {
  const { hasPermission, hasAnyPermission } = usePermissions();

  // Si se proporciona un permiso individual
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || <AccessDenied />;
  }

  // Si se proporcionan múltiples permisos
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll 
      ? requiredPermissions.every(permission => hasPermission(permission))
      : hasAnyPermission(requiredPermissions);
    
    if (!hasAccess) {
      return fallback || <AccessDenied />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;