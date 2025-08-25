import React from 'react';

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low' | 'normal';

interface PriorityIndicatorProps {
    priority: PriorityLevel;
    className?: string;
}

export function PriorityIndicator({
    priority,
    className = '',
}: PriorityIndicatorProps) {
    // Build the className based on priority
    const indicatorClassName = `priority-indicator priority-indicator-${priority} ${className}`;

    return <div className={indicatorClassName}></div>;
}