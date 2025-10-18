import React, { useState } from 'react';
import { Plus, FileText, Users, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../../hooks/usePermissions';
import { useNotifications } from './AdminNotificationSystem';
import CreatePostWizard from './CreatePostWizard';

interface FABAction {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
  permission?: string;
  color?: string;
  component?: 'wizard' | 'redirect';
}

interface FloatingActionButtonProps {
  isMobile?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermission } = usePermissions();
  const { addNotification } = useNotifications();
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  if (!isMobile) return null;

  const actions: FABAction[] = [
    {
      icon: FileText,
      label: 'Nuevo Post',
      onClick: () => setShowCreateWizard(true),
      permission: 'crear_post',
      color: 'bg-blue-500',
      component: 'wizard'
    },
    {
      icon: Users,
      label: 'Nuevo Usuario',
      onClick: () => {
        window.location.href = '/admin/usuarios/nuevo';
      },
      permission: 'admin_completo',
      color: 'bg-green-500',
      component: 'redirect'
    },
    {
      icon: MessageCircle,
      label: 'Moderar Comentarios',
      onClick: () => {
        window.location.href = '/admin/comentarios';
      },
      permission: 'comentar',
      color: 'bg-purple-500',
      component: 'redirect'
    }
  ];

  const filteredActions = actions.filter(action => 
    !action.permission || hasPermission(action.permission as any)
  );

  if (filteredActions.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {filteredActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    if (action.onClick) action.onClick();
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-3 ${action.color || 'bg-primary-500'} text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200`}
                >
                  <action.icon size={20} />
                  <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X size={24} /> : <Plus size={24} />}
          </motion.div>
        </motion.button>
      </div>

      {/* Create Post Wizard */}
      <CreatePostWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onSubmit={async (postData) => {
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          addNotification({
            type: 'success',
            title: 'Post creado',
            message: 'El post ha sido creado exitosamente desde el FAB'
          });
          
          setShowCreateWizard(false);
        }}
      />
    </>
  );
};

export default FloatingActionButton;