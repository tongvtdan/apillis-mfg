import React from 'react';
import { cn } from '@/lib/utils';

export interface DaisyUIMenuItem {
    label: string;
    href?: string;
    onClick?: () => void;
    isActive?: boolean;
    icon?: React.ReactNode;
    children?: DaisyUIMenuItem[];
}

export interface DaisyUIMenuProps {
    items: DaisyUIMenuItem[];
    className?: string;
    variant?: 'default' | 'compact' | 'lg';
}

export const DaisyUIMenu: React.FC<DaisyUIMenuProps> = ({
    items,
    className = "",
    variant = 'default'
}) => {
    const menuClasses = cn(
        "menu bg-base-200 w-56",
        variant === 'compact' && "menu-compact",
        variant === 'lg' && "menu-lg",
        className
    );

    const renderMenuItem = (item: DaisyUIMenuItem, index: number) => (
        <li key={index}>
            {item.href ? (
                <a
                    href={item.href}
                    className={cn(item.isActive && "menu-active")}
                >
                    {item.icon}
                    {item.label}
                </a>
            ) : (
                <button
                    onClick={item.onClick}
                    className={cn("w-full text-left", item.isActive && "menu-active")}
                >
                    {item.icon}
                    {item.label}
                </button>
            )}
            {item.children && (
                <ul className="menu menu-compact">
                    {item.children.map((child, childIndex) => renderMenuItem(child, childIndex))}
                </ul>
            )}
        </li>
    );

    return (
        <ul className={menuClasses}>
            {items.map((item, index) => renderMenuItem(item, index))}
        </ul>
    );
};

// Example usage component
export const DaisyUIMenuExample: React.FC = () => {
    const menuItems: DaisyUIMenuItem[] = [
        {
            label: "Item 1",
            href: "#item1"
        },
        {
            label: "Item 2",
            href: "#item2",
            isActive: true // This will show as active
        },
        {
            label: "Item 3",
            href: "#item3"
        }
    ];

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">DaisyUI Menu with Active Item</h3>
            <DaisyUIMenu items={menuItems} />
        </div>
    );
};
