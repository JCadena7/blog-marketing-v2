import React from 'react';
import ResponsiveAdminLayout from './ResponsiveAdminLayout';
import RolesPermissionsManager from './RolesPermissionsManager';
import ProtectedRoute from './ProtectedRoute';

const AdminRolesPage: React.FC = () => {
  return (
    <ResponsiveAdminLayout>
      <ProtectedRoute requiredPermission="admin_completo">
        <RolesPermissionsManager />
      </ProtectedRoute>
    </ResponsiveAdminLayout>
  );
};

export default AdminRolesPage;