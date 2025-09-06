import React from 'react';

export type ListItemPriority = 'urgent' | 'high' | 'medium' | 'normal' | 'active';

interface ListItemProps {
    priority?: ListItemPriority;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function ListItem({
    priority = 'normal',
    children,
    onClick,
    className = '',
}: ListItemProps) {
    // Build the className based on priority
    const listItemClassName = `enhanced-list-item enhanced-list-item-${priority} ${className}`;

    return (
        <div
            className={listItemClassName}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {children}
        </div>
    );
}