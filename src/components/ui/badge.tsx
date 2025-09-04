import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = "",
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'badge-secondary';
      case 'destructive':
        return 'badge-error';
      case 'outline':
        return 'badge-outline';
      default:
        return 'badge-primary';
    }
  };

  const badgeClasses = `badge ${getVariantClasses()} ${className}`.trim();

  return (
    <div className={badgeClasses} {...props}>
      {children}
    </div>
  );
};
