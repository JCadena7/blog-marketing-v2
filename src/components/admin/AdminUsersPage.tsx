import React from 'react';
import ResponsiveAdminLayout from './ResponsiveAdminLayout';
import UsersTable from './UsersTable';
import ProtectedRoute from './ProtectedRoute';

const AdminUsersPage: React.FC = () => {
  return (
    <ResponsiveAdminLayout>
      <ProtectedRoute requiredPermission="admin_completo">
        <UsersTable />
      </ProtectedRoute>
    </ResponsiveAdminLayout>
  );
};

export default AdminUsersPage;