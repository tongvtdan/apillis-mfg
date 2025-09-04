import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'info';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = "",
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'destructive':
        return 'btn-error';
      case 'outline':
        return 'btn-outline';
      case 'secondary':
        return 'btn-secondary';
      case 'ghost':
        return 'btn-ghost';
      case 'link':
        return 'btn-link';
      case 'success':
        return 'btn-success';
      case 'warning':
        return 'btn-warning';
      case 'info':
        return 'btn-info';
      default:
        return 'btn-primary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm';
      case 'lg':
        return 'btn-lg';
      case 'icon':
        return 'btn-square btn-sm';
      default:
        return '';
    }
  };

  const buttonClasses = `btn ${getVariantClasses()} ${getSizeClasses()} ${className}`.trim();

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};
