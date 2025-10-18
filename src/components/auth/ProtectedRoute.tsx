import React, { useEffect, type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../animations/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth',
  requireAuth = true 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [loading, isAuthenticated, requireAuth, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated and auth is required
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;