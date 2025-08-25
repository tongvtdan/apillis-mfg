import React from 'react';

export type ListItemPriority = 'urgent' | 'high' | 'medium' | 'normal' | 'active';

interface EnhancedListItemProps {
    priority?: ListItemPriority;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function EnhancedListItem({
    priority = 'normal',
    children,
    onClick,
    className = '',
}: EnhancedListItemProps) {
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