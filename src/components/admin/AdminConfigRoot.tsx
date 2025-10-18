import React from 'react';
import AdminProviders from './AdminProviders';
import AdminConfigPage from './AdminConfigPage';

const AdminConfigRoot: React.FC = () => (
  <AdminProviders>
    <AdminConfigPage />
  </AdminProviders>
);

export default AdminConfigRoot;
