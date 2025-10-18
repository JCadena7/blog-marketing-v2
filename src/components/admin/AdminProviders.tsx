import React from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from './AdminNotificationSystem';
import ProtectedRoute from '../auth/ProtectedRoute';

const AdminProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default AdminProviders;
