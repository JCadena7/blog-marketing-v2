import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, CreditCard as Edit2, Save, RotateCcw, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info, Crown, Lock } from 'lucide-react';
import { 
  ROLE_PERMISSIONS, 
  PERMISSION_DESCRIPTIONS, 
  ROLE_CONFIG,
  type Role, 
  type Permission 
} from '../../data/rolePermissions';
import { usePermissions } from '../../hooks/usePermissions';
import { useNotifications } from './AdminNotificationSystem';
import Button from '../ui/Button';
import Card from '../ui/Card';
import RoleBadge from './RoleBadge';

const RolesPermissionsManager: React.FC = () => {
  const { userRole } = usePermissions();
  const { addNotification } = useNotifications();
  const [selectedRole, setSelectedRole] = useState<Role>('administrador');
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const permissions = ROLE_PERMISSIONS as Record<Role, Permission[]>;
    setEditingPermissions([...permissions[selectedRole]]);
    setIsEditing(false);
    setHasChanges(false);
  }, [selectedRole]);

  useEffect(() => {
    const permissions = ROLE_PERMISSIONS as Record<Role, Permission[]>;
    const originalPermissions = permissions[selectedRole];
    const hasChangesNow = JSON.stringify(editingPermissions.sort()) !== JSON.stringify(originalPermissions.sort());
    setHasChanges(hasChangesNow);
  }, [editingPermissions, selectedRole]);

  const handlePermissionToggle = (permission: Permission) => {
    if (selectedRole === 'creador') return; // Creador no se puede editar
    
    setEditingPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSaveChanges = async () => {
    try {
      // En una app real, aquí harías la petición al backend
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar permisos localmente (en una app real esto vendría del backend)
      (ROLE_PERMISSIONS as any)[selectedRole] = [...editingPermissions];
      
      addNotification({
        type: 'success',
        title: 'Permisos actualizados',
        message: `Los permisos del rol ${selectedRole} han sido actualizados exitosamente.`
      });
      
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al guardar',
        message: 'No se pudieron actualizar los permisos.'
      });
    }
  };

  const handleResetChanges = () => {
    const permissions = ROLE_PERMISSIONS as Record<Role, Permission[]>;
    setEditingPermissions([...permissions[selectedRole]]);
    setIsEditing(false);
    setHasChanges(false);
    
    addNotification({
      type: 'info',
      title: 'Cambios descartados',
      message: 'Se han restaurado los permisos originales.'
    });
  };

  const roles: Role[] = ['creador', 'administrador', 'editor', 'escritor', 'autor', 'comentador'];
  const allPermissions: Permission[] = Object.keys(PERMISSION_DESCRIPTIONS) as Permission[];

  // Solo el creador puede gestionar roles y permisos
  if (userRole !== 'administrador' && userRole !== 'creador') {
    return (
      <div className="text-center py-12">
        <Shield size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Acceso Restringido
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Solo el creador puede gestionar roles y permisos del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Roles y Permisos
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestiona los roles del sistema y sus permisos asociados
          </p>
        </div>

        {hasChanges && (
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleResetChanges}>
              <RotateCcw size={16} className="mr-2" />
              Descartar
            </Button>
            <Button onClick={handleSaveChanges}>
              <Save size={16} className="mr-2" />
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
      >
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Advertencia:</strong> Los cambios en permisos afectan inmediatamente a todos los usuarios con ese rol.
            Asegúrate de revisar cuidadosamente antes de guardar.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Roles del Sistema
          </h2>
          
          <div className="space-y-2">
            {roles.map((role) => (
              <motion.button
                key={role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  selectedRole === role
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{(ROLE_CONFIG as Record<Role, { color: string; icon: string; name: string }>)[role].icon}</div>
                    <div>
                      <RoleBadge role={role} />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(ROLE_PERMISSIONS as Record<Role, Permission[]>)[role].length} permisos
                      </p>
                    </div>
                  </div>
                  {role === 'creador' && (
                    <Crown size={16} className="text-purple-500" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Permissions Editor */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Permisos para {(ROLE_CONFIG as Record<Role, { color: string; icon: string; name: string }>)[selectedRole].name}
                </h2>
                <RoleBadge role={selectedRole} />
              </div>
              
              {selectedRole !== 'creador' && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
                >
                  <Edit2 size={16} className="mr-2" />
                  {isEditing ? 'Cancelar Edición' : 'Editar Permisos'}
                </Button>
              )}
            </div>

            {selectedRole === 'creador' && (
              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    <strong>Rol Creador:</strong> Tiene acceso completo automático a todas las funciones. 
                    No se puede modificar por seguridad.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {allPermissions.map((permission) => {
                const isActive = editingPermissions.includes(permission);
                const isOriginallyActive = (ROLE_PERMISSIONS as Record<Role, Permission[]>)[selectedRole].includes(permission);
                const hasChanged = isActive !== isOriginallyActive;
                const isCreatorRole = selectedRole === 'creador';
                const isAdminCompleto = permission === 'admin_completo';

                return (
                  <motion.div
                    key={permission}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      hasChanged 
                        ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                        : 'border-gray-200 dark:border-gray-700'
                    } ${
                      isCreatorRole 
                        ? 'opacity-75' 
                        : isEditing 
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' 
                        : ''
                    }`}
                    onClick={() => {
                      if (!isCreatorRole && isEditing) {
                        handlePermissionToggle(permission);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center mt-1">
                          {isCreatorRole ? (
                            <Lock size={16} className="text-purple-500" />
                          ) : (
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              isActive 
                                ? 'bg-primary-500 border-primary-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isActive && (
                                <CheckCircle size={12} className="text-white" />
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {permission.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </h3>
                            {isAdminCompleto && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                <Crown size={10} className="mr-1" />
                                Super Admin
                              </span>
                            )}
                            {hasChanged && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                Modificado
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {PERMISSION_DESCRIPTIONS[permission]}
                          </p>
                        </div>
                      </div>

                      {isActive && (
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Total de permisos activos:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {editingPermissions.length} de {allPermissions.length}
                </span>
              </div>
              
              {selectedRole === 'creador' && (
                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                  El rol Creador tiene acceso automático a todas las funciones del sistema
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Role Hierarchy Info */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Jerarquía de Roles
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role, index) => (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{(ROLE_CONFIG as Record<Role, { color: string; icon: string; name: string }>)[role].icon}</div>
                  <div>
                    <RoleBadge role={role} />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nivel {roles.length - index}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="font-medium mb-1">Capacidades principales:</div>
                  <ul className="text-xs space-y-1">
                    {getRoleCapabilities(role).map((capability, capIndex) => (
                      <li key={capIndex} className="flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Nota importante:</strong> Los roles están organizados jerárquicamente. 
                Los roles superiores incluyen automáticamente las capacidades de los roles inferiores, 
                excepto por restricciones específicas de seguridad.
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Permission Categories */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Categorías de Permisos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getPermissionCategories().map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-2 mb-3">
                <category.icon size={20} className={`text-${category.color}-500`} />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {category.name}
                </h3>
              </div>
              
              <div className="space-y-2">
                {category.permissions.map((permission) => (
                  <div key={permission} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {permission.replace(/_/g, ' ')}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      editingPermissions.includes(permission as Permission)
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Helper functions
const getRoleCapabilities = (role: Role): string[] => {
  const capabilities = {
    creador: [
      'Acceso completo al sistema',
      'Gestión de roles y permisos',
      'Configuración avanzada',
      'Backup y restauración'
    ],
    administrador: [
      'Gestión completa de usuarios',
      'Moderación de todo el contenido',
      'Configuración del sistema',
      'Analytics completos'
    ],
    editor: [
      'Edición de cualquier post',
      'Moderación de comentarios',
      'Gestión de categorías',
      'Publicación directa'
    ],
    escritor: [
      'Creación de posts',
      'Edición de posts propios',
      'Comentarios y reacciones',
      'Analytics básicos'
    ],
    autor: [
      'Creación de posts (con aprobación)',
      'Edición de borradores propios',
      'Comentarios y reacciones'
    ],
    comentador: [
      'Comentarios en posts',
      'Reacciones (likes/dislikes)',
      'Perfil básico'
    ]
  };

  return capabilities[role] || [];
};

const getPermissionCategories = () => [
  {
    name: 'Administración',
    icon: Shield,
    color: 'red',
    permissions: ['admin_completo', 'asignar_roles']
  },
  {
    name: 'Contenido',
    icon: Edit2,
    color: 'blue',
    permissions: ['crear_post', 'editar_post_cualquiera', 'editar_post_propio', 'publicar_post', 'rechazar_post']
  },
  {
    name: 'Categorías',
    icon: Users,
    color: 'green',
    permissions: ['crear_categoria', 'editar_categoria', 'eliminar_categoria']
  },
  {
    name: 'Interacción',
    icon: Users,
    color: 'purple',
    permissions: ['comentar', 'reaccionar']
  }
];

export default RolesPermissionsManager;