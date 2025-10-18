import React from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../admin/AdminNotificationSystem';
import AuthPage from './AuthPage';

const AuthRoot: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AuthPage />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AuthRoot;