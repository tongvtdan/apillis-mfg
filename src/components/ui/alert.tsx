import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  className = "",
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'destructive':
        return 'alert-error';
      default:
        return 'alert-info';
    }
  };

  const alertClasses = `alert ${getVariantClasses()} ${className}`.trim();

  return (
    <div className={alertClasses} {...props}>
      {children}
    </div>
  );
};

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  className = "",
  children
}) => {
  return (
    <div className={`alert-description ${className}`}>
      {children}
    </div>
  );
};

export const AlertTitle: React.FC<AlertTitleProps> = ({
  className = "",
  children
}) => {
  return (
    <h5 className={`alert-title ${className}`}>
      {children}
    </h5>
  );
};
