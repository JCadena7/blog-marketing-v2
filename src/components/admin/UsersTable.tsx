import React, { useState, useEffect } from 'react';

import { CreditCard as Edit, Trash2, Shield, UserX, UserCheck, Search, MoveHorizontal as MoreHorizontal, Mail, Calendar, Users } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { type User } from '../../data/mockUsers';
import { getAllUsers, changeUserRole, updateUserStatus, deleteUser as deleteUserApi } from '../../services/usersService';
import { useNotifications } from './AdminNotificationSystem';
import RoleBadge from './RoleBadge';
import Button from '../ui/Button';
import { type Role } from '../../data/rolePermissions';
import ConfirmDialog from '../ui/ConfirmDialog';

const UsersTable: React.FC = () => {
  const { hasPermission, canChangeUserRole } = usePermissions();
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllUsers();
        if (mounted) setUsers(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      
      await changeUserRole(userId, newRole);
      
      addNotification({
        type: 'success',
        title: 'Rol actualizado',
        message: `El rol del usuario ha sido cambiado a ${newRole}.`
      });
      
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Error al cambiar rol',
        message: 'No se pudo actualizar el rol del usuario.'
      });
      const fresh = await getAllUsers();
      setUsers(fresh);
    } finally {
      setShowRoleModal(false);
      setSelectedUser(null);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: User['status']) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      ));
      
      await updateUserStatus(userId, newStatus);
      
      const statusMessages: Record<'active' | 'inactive' | 'suspended', string> = {
        active: 'Usuario activado',
        inactive: 'Usuario desactivado',
        suspended: 'Usuario suspendido'
      };

      addNotification({
        type: newStatus === 'active' ? 'success' : 'warning',
        title: 'Estado actualizado',
        message: statusMessages[newStatus] || 'Estado del usuario actualizado'
      });
      
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el estado del usuario.'
      });
      const fresh = await getAllUsers();
      setUsers(fresh);
    }
  };

  const handleDeleteUser = (userId: number) => {
    setConfirmDelete({ open: true, id: userId });
  };

  const confirmDeleteUser = async () => {
    if (confirmDelete.id == null) return;
    try {
      setDeleteLoading(true);
      const ok = await deleteUserApi(confirmDelete.id);
      if (ok) {
        setUsers(prev => prev.filter(user => user.id !== confirmDelete.id));
        addNotification({
          type: 'success',
          title: 'Usuario eliminado',
          message: 'El usuario ha sido eliminado del sistema.'
        });
      }
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ open: false, id: null });
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const statusConfig: Record<'active' | 'inactive' | 'suspended', { color: string; text: string }> = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'Activo' },
      inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', text: 'Inactivo' },
      suspended: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Suspendido' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!hasPermission('admin_completo')) {
    return (
      <div className="text-center py-12">
        <Shield size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Acceso Restringido
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No tienes permisos para gestionar usuarios.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-8">
          <span className="text-gray-500 dark:text-gray-400">Cargando usuarios...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {filteredUsers.length} usuarios encontrados
          </p>
        </div>

        <Button>
          Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Todos los roles</option>
          <option value="creador">Creador</option>
          <option value="administrador">Administrador</option>
          <option value="editor">Editor</option>
          <option value="escritor">Escritor</option>
          <option value="autor">Autor</option>
          <option value="comentador">Comentador</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estadísticas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Mail size={14} className="mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.stats.postsCreated && (
                        <div>Posts: {user.stats.postsCreated}</div>
                      )}
                      {user.stats.commentsApproved && (
                        <div>Comentarios: {user.stats.commentsApproved}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <Edit size={16} />
                      </button>
                      
                      {canChangeUserRole() && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          <Shield size={16} />
                        </button>
                      )}
                      
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(user.id, 'suspended')}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <UserX size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <a
                        href={`/admin/usuarios/${user.id}/perfil`}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Ver perfil"
                      >
                        <Users size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para cambiar rol */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Cambiar Rol de Usuario
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cambiar rol de {selectedUser.firstName} {selectedUser.lastName}
            </p>
            
            <div className="space-y-2 mb-6">
              {(['creador', 'administrador', 'editor', 'escritor', 'autor', 'comentador'] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(selectedUser.id, role)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedUser.role === role
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <RoleBadge role={role} />
                </button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmDialog
        open={confirmDelete.open}
        title="Eliminar usuario"
        description="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={confirmDeleteUser}
      />
    </div>
  );
};

export default UsersTable;