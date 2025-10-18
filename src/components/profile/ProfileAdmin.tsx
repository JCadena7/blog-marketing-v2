import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserX, UserCheck, CreditCard as Edit, Trash2, TriangleAlert as AlertTriangle, Clock, Activity, Settings, Key, Mail } from 'lucide-react';
import { type UserProfile } from '../../data/mockUserProfiles';
import { changeUserRole, updateUserStatus } from '../../services/usersService';
import { useNotifications } from '../admin/AdminNotificationSystem';
import { type Role } from '../../data/rolePermissions';
import RoleBadge from '../admin/RoleBadge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ConfirmDialog from '../ui/ConfirmDialog';

interface ProfileAdminProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

const ProfileAdmin: React.FC<ProfileAdminProps> = ({ user, onUpdateUser }) => {
  const { addNotification } = useNotifications();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleRoleChange = async (newRole: Role) => {
    try {
      setActionLoading('role');
      await changeUserRole(user.id, newRole);
      
      onUpdateUser({ role: newRole });
      
      addNotification({
        type: 'success',
        title: 'Rol actualizado',
        message: `El rol de ${user.firstName} ha sido cambiado a ${newRole}`
      });
      
      setShowRoleModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al cambiar rol',
        message: 'No se pudo actualizar el rol del usuario'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (newStatus: UserProfile['status']) => {
    try {
      setActionLoading('status');
      await updateUserStatus(user.id, newStatus);
      
      onUpdateUser({ status: newStatus });
      
      const statusMessages = {
        active: 'Usuario activado exitosamente',
        inactive: 'Usuario desactivado',
        suspended: 'Usuario suspendido'
      };
      
      addNotification({
        type: newStatus === 'active' ? 'success' : 'warning',
        title: 'Estado actualizado',
        message: statusMessages[newStatus]
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el estado del usuario'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading('delete');
      // In a real app, this would call the delete API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        title: 'Usuario eliminado',
        message: 'El usuario ha sido eliminado del sistema'
      });
      
      // Redirect to users list
      window.location.href = '/admin/usuarios';
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el usuario'
      });
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
        icon: UserCheck,
        description: 'El usuario puede acceder normalmente al sistema'
      },
      inactive: { 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', 
        icon: UserX,
        description: 'El usuario no puede iniciar sesión'
      },
      suspended: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
        icon: UserX,
        description: 'El usuario está temporalmente suspendido'
      }
    };
    return configs[status as keyof typeof configs];
  };

  const statusConfig = getStatusConfig(user.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Admin Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                Panel de Administración
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                Estas acciones afectan directamente al usuario y pueden impactar su acceso al sistema. 
                Úsalas con precaución y solo cuando sea necesario.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* User Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Shield size={20} className="mr-2 text-primary-500" />
            Gestión de Usuario
          </h3>
          
          <div className="space-y-6">
            {/* Current Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${statusConfig.color}`}>
                  <StatusIcon size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Estado: {user.status === 'active' ? 'Activo' : user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {statusConfig.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {user.status === 'active' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('inactive')}
                      loading={actionLoading === 'status'}
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <UserX size={16} className="mr-1" />
                      Desactivar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('suspended')}
                      loading={actionLoading === 'status'}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <UserX size={16} className="mr-1" />
                      Suspender
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('active')}
                    loading={actionLoading === 'status'}
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    <UserCheck size={16} className="mr-1" />
                    Activar
                  </Button>
                )}
              </div>
            </div>

            {/* Role Management */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Rol actual
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <RoleBadge role={user.role as any} />
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRoleModal(true)}
                loading={actionLoading === 'role'}
              >
                <Edit size={16} className="mr-1" />
                Cambiar Rol
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Settings size={20} className="mr-2 text-primary-500" />
            Acciones de Cuenta
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Key size={20} className="text-gray-600 dark:text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Restablecer contraseña
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Envía un email para restablecer la contraseña
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Mail size={16} className="mr-1" />
                Enviar Email
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity size={20} className="text-gray-600 dark:text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Ver logs de actividad
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Revisar el historial completo de acciones
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Activity size={16} className="mr-1" />
                Ver Logs
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center space-x-3">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-300">
                    Eliminar usuario
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Elimina permanentemente este usuario y todos sus datos
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* User Statistics for Admin */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Estadísticas Administrativas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {user.stats.postsCreated}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Posts Creados</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {user.stats.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vistas Totales</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {user.stats.profileViews}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vistas de Perfil</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round(((user.stats.totalLikes + user.stats.totalComments) / user.stats.totalViews) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Cambiar Rol de Usuario
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Cambiar rol de {user.firstName} {user.lastName}
            </p>
            
            <div className="space-y-2 mb-6">
              {(['creador', 'administrador', 'editor', 'escritor', 'autor', 'comentador'] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={actionLoading === 'role'}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    user.role === role
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${actionLoading === 'role' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <RoleBadge role={role} />
                  {user.role === role && (
                    <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                      (Actual)
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRoleModal(false)}
                disabled={actionLoading === 'role'}
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Eliminar usuario"
        description={`¿Estás seguro de que quieres eliminar a ${user.firstName} ${user.lastName}? Esta acción eliminará permanentemente todos sus datos, posts y comentarios. Esta acción NO se puede deshacer.`}
        confirmText="Eliminar Usuario"
        cancelText="Cancelar"
        variant="danger"
        loading={actionLoading === 'delete'}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};

export default ProfileAdmin;