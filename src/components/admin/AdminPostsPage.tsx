import React from 'react';
import ResponsiveAdminLayout from './ResponsiveAdminLayout';
import PostsTable from './PostsTable';
import ProtectedRoute from './ProtectedRoute';

const AdminPostsPage: React.FC = () => {
  return (
    <ResponsiveAdminLayout>
      <ProtectedRoute requiredPermissions={['crear_post', 'editar_post_propio', 'editar_post_cualquiera']}>
        <PostsTable />
      </ProtectedRoute>
    </ResponsiveAdminLayout>
  );
};

export default AdminPostsPage;