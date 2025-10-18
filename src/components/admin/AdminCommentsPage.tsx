import React from 'react';
import ResponsiveAdminLayout from './ResponsiveAdminLayout';
import CommentsModeration from './CommentsModeration';
import ProtectedRoute from './ProtectedRoute';

const AdminCommentsPage: React.FC = () => {
  return (
    <ResponsiveAdminLayout>
      <ProtectedRoute requiredPermissions={['comentar', 'admin_completo']}>
        <CommentsModeration />
      </ProtectedRoute>
    </ResponsiveAdminLayout>
  );
};

export default AdminCommentsPage;