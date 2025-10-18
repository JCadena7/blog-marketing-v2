import React from 'react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';

interface InputProps extends HTMLMotionProps<'input'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  success?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  success = false,
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <motion.label 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <motion.input
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`
            w-full px-3 py-2 border rounded-lg transition-all duration-200
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : success 
              ? 'border-green-500 focus:ring-green-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;