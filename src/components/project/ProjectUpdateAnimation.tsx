import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface ProjectUpdateAnimationProps {
    isVisible: boolean;
    message?: string;
    variant?: 'fixed' | 'inline';
}

export function ProjectUpdateAnimation({
    isVisible,
    message = "Updating projects...",
    variant = 'fixed'
}: ProjectUpdateAnimationProps) {
    const getPositionClasses = () => {
        if (variant === 'inline') {
            return 'relative'; // Inline positioning for header use
        }
        return 'fixed top-4 right-4 z-50'; // Fixed overlay positioning
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={getPositionClasses()}
                >
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center space-x-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </motion.div>
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}