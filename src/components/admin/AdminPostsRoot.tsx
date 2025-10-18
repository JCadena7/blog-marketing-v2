import React from 'react';
import AdminProviders from './AdminProviders';
import AdminPostsPage from './AdminPostsPage';

const AdminPostsRoot: React.FC = () => (
  <AdminProviders>
    <AdminPostsPage />
  </AdminProviders>
);

export default AdminPostsRoot;
