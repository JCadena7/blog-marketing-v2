import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color?: string;
  prefix?: string;
  suffix?: string;
}

interface QuickStatsProps {
  stats: Stat[];
  loading?: boolean;
}

const QuickStats: React.FC<QuickStatsProps> = ({ stats, loading = false }) => {
  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'decrease':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
            {stat.change !== undefined && getChangeIcon(stat.changeType)}
          </div>
          
          <p className={`text-2xl font-bold mb-1 ${stat.color || 'text-gray-900 dark:text-white'}`}>
            {stat.prefix}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{stat.suffix}
          </p>
          
          {stat.change !== undefined && (
            <div className={`flex items-center text-sm ${getChangeColor(stat.changeType)}`}>
              <span className="font-medium">
                {stat.changeType === 'increase' ? '+' : stat.changeType === 'decrease' ? '-' : ''}
                {Math.abs(stat.change)}%
              </span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">vs mes anterior</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;