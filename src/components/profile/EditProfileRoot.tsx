import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import AdminProviders from '../admin/AdminProviders';
import ResponsiveAdminLayout from '../admin/ResponsiveAdminLayout';
import EditProfile from './EditProfile';

// Consume AuthContext inside the provider
const EditProfileContent: React.FC = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Cargando Perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Debes iniciar sesión para editar tu Perfil.
        </p>
      </div>
    );
  }

  return <EditProfile userId={user.id} />;
};

const EditProfileRoot: React.FC = () => {
  return (
    <AdminProviders>
      <ResponsiveAdminLayout>
        <EditProfileContent />
      </ResponsiveAdminLayout>
    </AdminProviders>
  );
};

export default EditProfileRoot;