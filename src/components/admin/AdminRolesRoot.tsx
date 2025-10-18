import React from 'react';
import AdminProviders from './AdminProviders';
import AdminRolesPage from './AdminRolesPage';

const AdminRolesRoot: React.FC = () => (
  <AdminProviders>
    <AdminRolesPage />
  </AdminProviders>
);

export default AdminRolesRoot;
