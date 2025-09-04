
import React from 'react';

interface DaisyUITabsProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    variant?: 'lift' | 'boxed' | 'bordered';
    children: React.ReactNode;
}

interface DaisyUITabsListProps {
    className?: string;
    children: React.ReactNode;
}

interface DaisyUITabsTriggerProps {
    value: string;
    className?: string;
    disabled?: boolean;
    activeColor?: string;
    activeBgColor?: string;
    activeBorderColor?: string;
    children: React.ReactNode;
}

interface DaisyUITabsContentProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}

export const DaisyUITabs: React.FC<DaisyUITabsProps> = ({
    defaultValue,
    value,
    onValueChange,
    className = "",
    variant = 'lift',
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
        <div className={`tabs tabs-${variant} ${className}`} data-active-tab={activeTab}>
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

export const DaisyUITabsList: React.FC<DaisyUITabsListProps> = ({
    className = "",
    children
}) => {
    return (
        <div className={`tabs-list ${className}`} role="tablist">
            {children}
        </div>
    );
};

export const DaisyUITabsTrigger: React.FC<DaisyUITabsTriggerProps> = ({
    value,
    className = "",
    disabled = false,
    activeColor = 'hsl(var(--p))',
    activeBgColor = 'hsl(var(--p))',
    activeBorderColor = 'hsl(var(--p))',
    children,
    ...props
}) => {
    const { activeTab, onTabChange } = props as any;
    const isActive = activeTab === value;

    const activeStyles = isActive ? {
        '--tab-color': activeColor,
        '--tab-bg': activeBgColor,
        '--tab-border-color': activeBorderColor,
    } : {};

    return (
        <a
            role="tab"
            className={`tab ${isActive ? 'tab-active' : ''} ${className}`}
            onClick={() => !disabled && onTabChange?.(value)}
            style={activeStyles as React.CSSProperties}
            aria-selected={isActive}
            aria-disabled={disabled}
            data-value={value}
        >
            {children}
        </a>
    );
};

export const DaisyUITabsContent: React.FC<DaisyUITabsContentProps> = ({
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
