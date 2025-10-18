import React, { useState } from 'react';
import { Check, X, Trash2, Edit, Archive, Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../../hooks/usePermissions';
import ConfirmDialog from '../ui/ConfirmDialog';

interface BulkAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  permission?: string;
  confirmMessage?: string;
}

interface BulkActionsProps {
  selectedItems: any[];
  onAction: (actionId: string, items: any[]) => Promise<void>;
  onClearSelection: () => void;
  actions?: BulkAction[];
  loading?: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  onAction,
  onClearSelection,
  actions = [],
  loading = false
}) => {
  const { hasPermission } = usePermissions();
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const defaultActions: BulkAction[] = [
    {
      id: 'approve',
      label: 'Aprobar',
      icon: Check,
      variant: 'success',
      permission: 'publicar_post',
      confirmMessage: '¿Aprobar los elementos seleccionados?'
    },
    {
      id: 'reject',
      label: 'Rechazar',
      icon: X,
      variant: 'secondary',
      permission: 'rechazar_post',
      confirmMessage: '¿Rechazar los elementos seleccionados?'
    },
    {
      id: 'archive',
      label: 'Archivar',
      icon: Archive,
      variant: 'secondary',
      permission: 'editar_post_cualquiera'
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: Trash2,
      variant: 'danger',
      permission: 'admin_completo',
      confirmMessage: '¿Eliminar permanentemente los elementos seleccionados? Esta acción no se puede deshacer.'
    }
  ];

  const availableActions = (actions.length > 0 ? actions : defaultActions).filter(action =>
    !action.permission || hasPermission(action.permission as any)
  );

  const handleAction = async (actionId: string) => {
    const action = availableActions.find(a => a.id === actionId);
    
    if (action?.confirmMessage) {
      setConfirmAction(actionId);
      return;
    }

    await executeAction(actionId);
  };

  const executeAction = async (actionId: string) => {
    try {
      setActionLoading(actionId);
      await onAction(actionId, selectedItems);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const getButtonVariant = (variant: string) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {selectedItems.length} elemento{selectedItems.length !== 1 ? 's' : ''} seleccionado{selectedItems.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={onClearSelection}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
              >
                Limpiar selección
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {availableActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  disabled={loading || actionLoading === action.id}
                  className={`
                    inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200
                    ${getButtonVariant(action.variant)}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {actionLoading === action.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <action.icon size={16} className="mr-2" />
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmAction}
        title="Confirmar Acción"
        description={availableActions.find(a => a.id === confirmAction)?.confirmMessage}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant={availableActions.find(a => a.id === confirmAction)?.variant || 'primary'}
        loading={actionLoading === confirmAction}
        onCancel={() => setConfirmAction(null)}
        onConfirm={async () => { if (confirmAction) { await executeAction(confirmAction); } }}
      />
    </>
  );
};

export default BulkActions;