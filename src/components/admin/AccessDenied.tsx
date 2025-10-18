import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';

interface AccessDeniedProps {
  message?: string;
  showBackButton?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  message = "No tienes permisos para acceder a esta sección",
  showBackButton = true
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield size={40} className="text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Acceso Denegado
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {message}
        </p>
        
        {showBackButton && (
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="inline-flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccessDenied;