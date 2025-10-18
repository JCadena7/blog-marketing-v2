import React, { useEffect, useState } from 'react';
import AdminProviders from '../admin/AdminProviders';
import ResponsiveAdminLayout from '../admin/ResponsiveAdminLayout';
import UserProfile from './UserProfile';

const UserProfileViewRoot: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Extract user ID from URL
    const pathParts = window.location.pathname.split('/');
    const idIndex = pathParts.indexOf('usuarios') + 1;
    const id = parseInt(pathParts[idIndex]);
    
    if (!isNaN(id)) {
      setUserId(id);
    }
  }, []);

  if (!userId) {
    return (
      <AdminProviders>
        <ResponsiveAdminLayout>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              ID de usuario inválido.
            </p>
          </div>
        </ResponsiveAdminLayout>
      </AdminProviders>
    );
  }

  return (
    <AdminProviders>
      <ResponsiveAdminLayout>
        <UserProfile userId={userId} />
      </ResponsiveAdminLayout>
    </AdminProviders>
  );
};

export default UserProfileViewRoot;