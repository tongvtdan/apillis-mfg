import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TabTransitionProps {
    activeTab: string;
    isLoading?: boolean;
    children: React.ReactNode;
    className?: string;
    direction?: 'horizontal' | 'vertical';
}

export const TabTransition: React.FC<TabTransitionProps> = ({
    activeTab,
    isLoading = false,
    children,
    className,
    direction = 'horizontal'
}) => {
    const [previousTab, setPreviousTab] = useState<string>(activeTab);

    useEffect(() => {
        if (activeTab !== previousTab) {
            setPreviousTab(activeTab);
        }
    }, [activeTab, previousTab]);

    const getVariants = () => {
        if (direction === 'vertical') {
            return {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -20 }
            };
        }

        return {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -20 }
        };
    };

    const variants = getVariants();

    // Only show loading when explicitly requested, not on tab transitions
    if (isLoading) {
        return (
            <div className={cn("flex items-center justify-center p-8", className)}>
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <div>
                        <h3 className="text-sm font-medium">Loading content...</h3>
                        <p className="text-xs text-muted-foreground">Please wait while we fetch the latest data</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                        duration: 0.2, // Reduced duration for snappier transitions
                        ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="w-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Enhanced tab content wrapper with fade and slide effects
interface TabContentWrapperProps {
    tabId: string;
    activeTab: string;
    children: React.ReactNode;
    className?: string;
    loadingComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
    isLoading?: boolean;
    hasError?: boolean;
}

export const TabContentWrapper: React.FC<TabContentWrapperProps> = ({
    tabId,
    activeTab,
    children,
    className,
    loadingComponent,
    errorComponent,
    isLoading = false,
    hasError = false
}) => {
    const isActive = activeTab === tabId;

    if (!isActive) {
        return null;
    }

    if (hasError && errorComponent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={className}
            >
                {errorComponent}
            </motion.div>
        );
    }

    if (isLoading && loadingComponent) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={className}
            >
                {loadingComponent}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Staggered animation for lists and grids
interface StaggeredAnimationProps {
    children: React.ReactNode[];
    className?: string;
    staggerDelay?: number;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
    children,
    className,
    staggerDelay = 0.1
}) => {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
        >
            {children.map((child, index) => (
                <motion.div
                    key={index}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                >
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
};