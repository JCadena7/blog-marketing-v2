import React from 'react';
import AdminProviders from './AdminProviders';
import PostEditPage from './PostEditPage';

const AdminPostEditRoot: React.FC = () => (
  <AdminProviders>
    <PostEditPage />
  </AdminProviders>
);

export default AdminPostEditRoot;
