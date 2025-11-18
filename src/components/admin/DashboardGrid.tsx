import React from 'react';
import { motion } from 'framer-motion';
import { useBreakpoint } from '../../hooks/useMediaQuery';
import DashboardWidget from './DashboardWidget';
import { usePermissions } from '../../hooks/usePermissions';
import type { LucideIcon } from 'lucide-react';

interface Widget {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color: string;
  suffix?: string;
  prefix?: string;
  description?: string;
  permission?: string[];
}

interface DashboardGridProps {
  widgets: Widget[];
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ widgets }) => {
  const breakpoint = useBreakpoint();
  const { hasAnyPermission } = usePermissions();

  // Filter widgets based on permissions
  const filteredWidgets = widgets.filter(widget => {
    if (!widget.permission || widget.permission.length === 0) return true;
    return hasAnyPermission(widget.permission as any);
  });

  // Responsive grid configuration
  const getGridConfig = () => {
    switch (breakpoint) {
      case 'mobile':
        return {
          columns: 'grid-cols-1',
          gap: 'gap-4',
          maxWidgets: 4 // Show only most important widgets on mobile
        };
      case 'tablet':
        return {
          columns: 'grid-cols-2',
          gap: 'gap-6',
          maxWidgets: 6
        };
      default:
        return {
          columns: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          gap: 'gap-6',
          maxWidgets: filteredWidgets.length
        };
    }
  };

  const gridConfig = getGridConfig();
  const displayWidgets = filteredWidgets.slice(0, gridConfig.maxWidgets);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid ${gridConfig.columns} ${gridConfig.gap}`}
    >
      {displayWidgets.map((widget) => (
        <motion.div key={widget.title} variants={itemVariants}>
          <DashboardWidget {...widget} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardGrid;