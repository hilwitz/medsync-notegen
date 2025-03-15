
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ 
    className, 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    icon,
    iconPosition = 'left',
    disabled,
    ...props 
  }, ref) => {
    
    const variantStyles = {
      primary: 'bg-medsync-600 hover:bg-medsync-700 text-white shadow-sm',
      secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 shadow-sm',
      outline: 'bg-transparent border border-medsync-600 text-medsync-600 hover:bg-medsync-50',
      ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-900',
      destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
    };
    
    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5 rounded-md',
      md: 'text-base px-4 py-2 rounded-lg',
      lg: 'text-lg px-6 py-3 rounded-lg'
    };
    
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-medsync-500/50 focus:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          isLoading && 'opacity-70 cursor-not-allowed',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {icon && iconPosition === 'left' && <span>{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span>{icon}</span>}
          </div>
        )}
      </button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

export { CustomButton };
