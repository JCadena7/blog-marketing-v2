import React from 'react';
import { ROLE_CONFIG, type Role } from '../../data/rolePermissions';

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role = 'administrador', size = 'md' }) => {
  const config = (ROLE_CONFIG as Record<Role, { color: string; icon: string; name: string }>)[role] || {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: '❓',
    name: role
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      <span className="mr-1">{config.icon}</span>
      {config.name}
    </span>
  );
};

export default RoleBadge;