import React from 'react';
import ResponsiveAdminLayout from './ResponsiveAdminLayout';
import AnalyticsDashboard from './AnalyticsDashboard';
import ProtectedRoute from './ProtectedRoute';

const AdminAnalyticsPage: React.FC = () => {
  return (
    <ResponsiveAdminLayout>
      <ProtectedRoute requiredPermissions={['admin_completo', 'editar_post_cualquiera']}>
        <AnalyticsDashboard />
      </ProtectedRoute>
    </ResponsiveAdminLayout>
  );
};

export default AdminAnalyticsPage;