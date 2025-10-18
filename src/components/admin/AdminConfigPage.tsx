import React from 'react';
import ResponsiveAdminLayout from './ResponsiveAdminLayout';
import ConfigurationManager from './ConfigurationManager';
import ProtectedRoute from './ProtectedRoute';

const AdminConfigPage: React.FC = () => {
  return (
    <ResponsiveAdminLayout>
      <ProtectedRoute requiredPermission="admin_completo">
        <ConfigurationManager />
      </ProtectedRoute>
    </ResponsiveAdminLayout>
  );
};

export default AdminConfigPage;