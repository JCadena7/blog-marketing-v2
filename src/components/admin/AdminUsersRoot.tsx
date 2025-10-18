import React from 'react';
import AdminProviders from './AdminProviders';
import AdminUsersPage from './AdminUsersPage';

const AdminUsersRoot: React.FC = () => (
  <AdminProviders>
    <AdminUsersPage />
  </AdminProviders>
);

export default AdminUsersRoot;
