import React from 'react';
import { motion } from 'framer-motion';

type MotionAnchorProps = React.ComponentProps<typeof motion.a> & { href: string };
type MotionButtonProps = React.ComponentProps<typeof motion.button> & { href?: never };

type CommonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'outlineWhite' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
};

export type ButtonProps = CommonProps & (MotionAnchorProps | MotionButtonProps);

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-lg hover:shadow-xl',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 shadow-lg hover:shadow-xl',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500',
  outlineWhite: 'border-2 border-white text-white hover:bg-white hover:text-primary-500 focus:ring-white',
  ghost: 'text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
} as const;

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

const Button: React.FC<ButtonProps> = (props) => {
  const { variant = 'primary', size = 'md', loading = false, className = '', children, ...rest } = props;

  const isLink = 'href' in rest;
  const buttonDisabled = !isLink && 'disabled' in rest ? Boolean((rest as MotionButtonProps).disabled) : false;

  const isDisabled = buttonDisabled || loading;

  const variantClasses = variants[variant] ?? variants.primary;
  const sizeClasses = sizes[size] ?? sizes.md;

  const disabledClasses = isDisabled ? 'opacity-50 cursor-not-allowed' : '';
  const classes = `${baseStyles} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`;

  if (isLink) {
    return (
      <motion.a
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        className={classes}
        aria-disabled={isDisabled}
        {...(rest as MotionAnchorProps)}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      className={classes}
      disabled={isDisabled}
      {...(rest as MotionButtonProps)}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default Button;