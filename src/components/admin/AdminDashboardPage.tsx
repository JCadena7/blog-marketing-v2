import React from 'react';
import AdminProviders from './AdminProviders';
import AdminDashboard from './AdminDashboard';

const AdminDashboardPage: React.FC = () => {
  return (
    <AdminProviders>
      <AdminDashboard />
    </AdminProviders>
  );
};

export default AdminDashboardPage;
