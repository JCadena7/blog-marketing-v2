import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, CircleAlert as AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../admin/AdminNotificationSystem';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showConfirm?: boolean;
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'outline', 
  size = 'md',
  showConfirm = true,
  className = ''
}) => {
  const { logout } = useAuth();
  const { addNotification } = useNotifications();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (showConfirm) {
      setShowConfirmDialog(true);
      return;
    }
    
    await performLogout();
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
      
      addNotification({
        type: 'success',
        title: 'Sesión cerrada',
        message: 'Has cerrado sesión exitosamente. ¡Hasta pronto!'
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cerrar la sesión correctamente.'
      });
    } finally {
      setIsLoggingOut(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant={variant}
          size={size}
          onClick={handleLogout}
          loading={isLoggingOut}
          className={`text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20 ${className}`}
        >
          <LogOut size={16} className="mr-2" />
          Cerrar Sesión
        </Button>
      </motion.div>

      <ConfirmDialog
        open={showConfirmDialog}
        title="Cerrar Sesión"
        description="¿Estás seguro de que quieres cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder al panel."
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        variant="secondary"
        loading={isLoggingOut}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={performLogout}
      />
    </>
  );
};

export default LogoutButton;