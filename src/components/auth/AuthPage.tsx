import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

import { useBreakpoint } from '../../hooks/useMediaQuery';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import WelcomeOnboarding from './WelcomeOnboarding';

type AuthMode = 'login' | 'register' | 'forgot-password';

const AuthPage: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const breakpoint = useBreakpoint();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user is new and should see onboarding
  useEffect(() => {
    if (user && typeof globalThis !== 'undefined' && 'location' in globalThis && globalThis.location) {
      const isNewUser = new URLSearchParams(globalThis.location.search).get('new') === 'true';
      const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
      
      if (isNewUser && !onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  // Redirect if already authenticated (unless showing onboarding)
  useEffect(() => {
    if (isAuthenticated && !loading && !showOnboarding && typeof globalThis !== 'undefined' && 'location' in globalThis && globalThis.location) {
      globalThis.location.href = '/admin/dashboard';
    }
  }, [isAuthenticated, loading, showOnboarding]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (typeof globalThis !== 'undefined' && 'location' in globalThis && globalThis.location) {
      globalThis.location.href = '/admin/dashboard';
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <AuthLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando...</p>
        </div>
      </AuthLayout>
    );
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <WelcomeOnboarding
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Don't render auth forms if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const isMobile = breakpoint === 'mobile';

  return (
    <AuthLayout>
      
      {mode !== 'forgot-password' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex border-b border-gray-200 dark:border-gray-700 mb-8 -mx-6 md:-mx-8 xl:-mx-12"
        >
          {[
            { key: 'login', label: 'Iniciar Sesión' },
            { key: 'register', label: 'Crear Cuenta' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key as AuthMode)}
              className={`
                flex-1 py-4 px-6 text-sm md:text-base font-medium transition-all duration-200 relative
                ${mode === tab.key
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
                ${isMobile ? 'min-h-[48px]' : ''}
              `}
            >
              {tab.label}
              {mode === tab.key && (
                <motion.div
                  layoutId="activeAuthTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>
      )}

      {/* Form content */}
      <AnimatePresence mode="wait">
        {mode === 'login' && (
          <LoginForm
            key="login"
            onSwitchToRegister={() => setMode('register')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        )}
        
        {mode === 'register' && (
          <RegisterForm
            key="register"
            onSwitchToLogin={() => setMode('login')}
          />
        )}
        
        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            key="forgot-password"
            onBackToLogin={() => setMode('login')}
          />
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default AuthPage;