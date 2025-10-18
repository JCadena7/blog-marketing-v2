import React from 'react';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../../hooks/useMediaQuery';
import AnimatedBackground from '../animations/AnimatedBackground';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className={`
        min-h-screen flex items-center justify-center relative z-10
        ${isMobile ? 'p-0' : 'p-4 md:p-6 lg:p-8'}
      `}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`
            w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/50
            ${isMobile 
              ? 'h-full rounded-none' 
              : isTablet 
              ? 'max-w-md rounded-2xl' 
              : 'max-w-lg xl:max-w-xl rounded-2xl'
            }
            ${isMobile ? 'p-6' : 'p-8 xl:p-12'}
          `}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div className="text-left">
                <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                  Marketing Pro
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Panel de Administración
                </p>
              </div>
            </div>
          </motion.div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;