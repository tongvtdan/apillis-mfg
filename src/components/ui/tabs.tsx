import React from 'react';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  className = "",
  children
}) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={`tabs ${className}`} data-active-tab={activeTab}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange: handleTabChange
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({
  className = "",
  children
}) => {
  return (
    <div className={`tabs-list ${className}`} role="tablist">
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className = "",
  disabled = false,
  children,
  ...props
}) => {
  const { activeTab, onTabChange } = props as any;
  const isActive = activeTab === value;

  return (
    <button
      className={`tab ${isActive ? 'tab-active' : ''} ${className}`}
      onClick={() => !disabled && onTabChange?.(value)}
      disabled={disabled}
      data-value={value}
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className = "",
  children,
  ...props
}) => {
  const { activeTab } = props as any;
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      className={`tab-content ${className}`}
      data-value={value}
      role="tabpanel"
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
};
