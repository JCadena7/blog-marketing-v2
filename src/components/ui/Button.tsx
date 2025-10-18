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

  const isLink = 'href' in props && typeof (props as MotionAnchorProps).href === 'string';
  const isDisabled = ('disabled' in props ? (props as MotionButtonProps).disabled : false) || loading;
  const variantKey = variant as keyof typeof variants;
  const sizeKey = size as keyof typeof sizes;
  const classes = `${baseStyles} ${variants[variantKey]} ${sizes[sizeKey]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  if (isLink) {
    const anchorProps = rest as MotionAnchorProps;
    return (
      <motion.a
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={classes}
        aria-disabled={isDisabled}
        {...anchorProps}
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

  const buttonProps = rest as MotionButtonProps;
  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={classes}
      disabled={isDisabled}
      {...buttonProps}
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