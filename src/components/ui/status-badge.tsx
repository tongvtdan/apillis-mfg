import React from 'react';

export type StatusType =
    // Priority statuses
    | 'urgent' | 'high' | 'medium' | 'low'
    // Workflow statuses
    | 'inquiry' | 'review' | 'quote' | 'production' | 'completed'
    // General states
    | 'active' | 'pending' | 'overdue' | 'on-hold';

export type StatusSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    size?: StatusSize;
    className?: string;
}

export function StatusBadge({
    status,
    label,
    size = 'sm',
    className = '',
}: StatusBadgeProps) {
    // Get the appropriate text to display
    const displayText = label || status.charAt(0).toUpperCase() + status.slice(1);

    // Build the className based on props (removed animate option)
    const badgeClassName = `status-badge status-badge-${size} status-${status} ${className}`;

    return (
        <div className={badgeClassName}>
            {displayText}
        </div>
    );
}