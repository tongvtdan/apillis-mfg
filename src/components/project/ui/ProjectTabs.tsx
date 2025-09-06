import React from 'react';
import { Tabs as BaseTabs, TabsList as BaseTabsList, TabsTrigger as BaseTabsTrigger, TabsContent } from '@/components/ui/tabs';
import styles from './ProjectTabs.module.css';

interface ProjectTabsProps {
    defaultValue: string;
    className?: string;
    children: React.ReactNode;
}

export function ProjectTabs({ defaultValue, className, children }: ProjectTabsProps) {
    return (
        <BaseTabs defaultValue={defaultValue} className={className}>
            {children}
        </BaseTabs>
    );
}

interface ProjectTabsListProps {
    className?: string;
    children: React.ReactNode;
}

export function ProjectTabsList({ className, children }: ProjectTabsListProps) {
    return (
        <BaseTabsList className={`${styles.tabsList} ${className || ''}`}>
            {children}
        </BaseTabsList>
    );
}

interface ProjectTabsTriggerProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}

export function ProjectTabsTrigger({ value, className, children }: ProjectTabsTriggerProps) {
    return (
        <BaseTabsTrigger value={value} className={`${styles.tabsTrigger} ${className || ''}`}>
            {children}
        </BaseTabsTrigger>
    );
}

// Re-export TabsContent for completeness
export { TabsContent };