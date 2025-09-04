import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    toggleTheme,
    getStoredTheme,
    getThemeDisplayName,
    getThemeIcon,
    type ThemeMode
} from '@/lib/theme';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
    variant?: 'icon' | 'button' | 'dropdown';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
    className = '',
    showLabel = false,
    variant = 'icon'
}) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');

    useEffect(() => {
        setCurrentTheme(getStoredTheme());
    }, []);

    const handleToggle = () => {
        toggleTheme();
        setCurrentTheme(getStoredTheme());
    };

    const getIcon = () => {
        switch (currentTheme) {
            case 'light':
                return <Sun className="h-4 w-4" />;
            case 'dark':
                return <Moon className="h-4 w-4" />;
            case 'system':
                return <Monitor className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    if (variant === 'icon') {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className={`btn btn-ghost btn-sm ${className}`}
                title={`Current theme: ${getThemeDisplayName(currentTheme)}`}
            >
                {getIcon()}
            </Button>
        );
    }

    if (variant === 'button') {
        return (
            <Button
                variant="outline"
                onClick={handleToggle}
                className={`btn btn-outline btn-sm ${className}`}
            >
                {getIcon()}
                {showLabel && (
                    <span className="ml-2">{getThemeDisplayName(currentTheme)}</span>
                )}
            </Button>
        );
    }

    // Dropdown variant (for future implementation)
    return (
        <Button
            variant="outline"
            onClick={handleToggle}
            className={`btn btn-outline btn-sm ${className}`}
        >
            {getIcon()}
            {showLabel && (
                <span className="ml-2">{getThemeDisplayName(currentTheme)}</span>
            )}
        </Button>
    );
};

export default ThemeToggle;
