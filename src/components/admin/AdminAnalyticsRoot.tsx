import React from 'react';
import AdminProviders from './AdminProviders';
import AdminAnalyticsPage from './AdminAnalyticsPage';

const AdminAnalyticsRoot: React.FC = () => (
  <AdminProviders>
    <AdminAnalyticsPage />
  </AdminProviders>
);

export default AdminAnalyticsRoot;
