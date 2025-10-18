import React from 'react';
import AdminProviders from './AdminProviders';
import AdminCommentsPage from './AdminCommentsPage';

const AdminCommentsRoot: React.FC = () => (
  <AdminProviders>
    <AdminCommentsPage />
  </AdminProviders>
);

export default AdminCommentsRoot;
