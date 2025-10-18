import React from 'react';
import ResponsiveAdminLayout from './ResponsiveAdminLayout';
import CategoriesManagement from './CategoriesManagement';
import ProtectedRoute from './ProtectedRoute';

const AdminCategoriesPage: React.FC = () => {
  return (
    <ResponsiveAdminLayout>
      <ProtectedRoute requiredPermissions={['crear_categoria', 'editar_categoria']}>
        <CategoriesManagement />
      </ProtectedRoute>
    </ResponsiveAdminLayout>
  );
};

export default AdminCategoriesPage;