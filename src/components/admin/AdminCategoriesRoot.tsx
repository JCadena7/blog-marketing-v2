import React from 'react';
import AdminProviders from './AdminProviders';
import AdminCategoriesPage from './AdminCategoriesPage';

const AdminCategoriesRoot: React.FC = () => (
  <AdminProviders>
    <AdminCategoriesPage />
  </AdminProviders>
);

export default AdminCategoriesRoot;
