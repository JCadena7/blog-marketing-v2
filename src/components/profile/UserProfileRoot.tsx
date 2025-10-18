import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import AdminProviders from '../admin/AdminProviders';
import ResponsiveAdminLayout from '../admin/ResponsiveAdminLayout';
import UserProfile from './UserProfile';

// Consume AuthContext inside the provider to avoid reading the default (null) value
const UserProfileContent: React.FC = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Debes iniciar sesión para ver tu perfil.
        </p>
      </div>
    );
  }

  return <UserProfile userId={user.id} />;
};

const UserProfileRoot: React.FC = () => {
  return (
    <AdminProviders>
      <ResponsiveAdminLayout>
        <UserProfileContent />
      </ResponsiveAdminLayout>
    </AdminProviders>
  );
};

export default UserProfileRoot;