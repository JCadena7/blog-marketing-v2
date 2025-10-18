import React, { type ReactNode } from 'react';
import { useBreakpoint } from '../../hooks/useMediaQuery';
import ResponsiveSidebar from './ResponsiveSidebar';
import AdminHeader from './AdminHeader';
import FloatingActionButton from './FloatingActionButton';

interface ResponsiveAdminLayoutProps {
  children: ReactNode;
}

const ResponsiveAdminLayout: React.FC<ResponsiveAdminLayoutProps> = ({ children }) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div className={`flex ${isMobile ? 'flex-col' : ''}`}>
        {/* Sidebar */}
        <ResponsiveSidebar isMobile={isMobile} isTablet={isTablet} />
        
        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${isMobile ? '' : 'min-h-screen'}`}>
          {/* Header - Now responsive, also shown on mobile with compact layout */}
          <AdminHeader />
          
          {/* Page Content */}
          <main className={`flex-1 ${isMobile ? 'pb-20' : 'p-6'} ${isMobile ? 'p-4' : ''}`}>
            <div className={`${isDesktop ? 'max-w-7xl mx-auto' : ''}`}>
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Action Button - Mobile only */}
      <FloatingActionButton isMobile={isMobile} />

      {/* Mobile-specific styles */}
      {isMobile && (
        <style>{`
          body {
            padding-bottom: env(safe-area-inset-bottom);
            overflow-x: hidden;
          }
        `}</style>
      )}
    </div>
  );
};

export default ResponsiveAdminLayout;