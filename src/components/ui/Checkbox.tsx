import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  description, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      <label className="flex items-start space-x-3 cursor-pointer">
        <div className="relative flex-shrink-0 mt-1">
          <input
            type="checkbox"
            className="sr-only"
            {...props}
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-200
              ${props.checked 
                ? 'bg-primary-500 border-primary-500' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              }
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
          >
            <AnimatePresence>
              {props.checked && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        <div className="flex-1">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </label>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Checkbox;