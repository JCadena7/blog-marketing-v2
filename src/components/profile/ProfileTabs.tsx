import React from 'react';
import { motion } from 'framer-motion';
import { User, FileText, Activity, ChartBar as BarChart3, Shield, Settings } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableSections: string[];
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange, availableSections }) => {
  const tabs = [
    { id: 'overview', name: 'Información', icon: User },
    { id: 'posts', name: 'Posts', icon: FileText },
    { id: 'activity', name: 'Actividad', icon: Activity },
    { id: 'stats', name: 'Estadísticas', icon: BarChart3 },
    { id: 'admin', name: 'Administración', icon: Shield }
  ].filter(tab => availableSections.includes(tab.id));

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative py-4 px-1 font-medium text-sm transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <tab.icon size={16} />
              <span>{tab.name}</span>
            </div>
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;