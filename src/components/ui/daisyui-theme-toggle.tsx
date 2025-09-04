import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    toggleTheme,
    getStoredTheme,
    getThemeDisplayName,
    isDarkTheme,
    type ThemeMode
} from '@/lib/theme';
import { Sun, Moon, Monitor } from 'lucide-react';

interface DaisyUIThemeToggleProps {
    className?: string;
    showLabel?: boolean;
    variant?: 'icon' | 'button' | 'dropdown';
    size?: 'sm' | 'md' | 'lg';
}

export const DaisyUIThemeToggle: React.FC<DaisyUIThemeToggleProps> = ({
    className = '',
    showLabel = false,
    variant = 'icon',
    size = 'md'
}) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const updateTheme = () => {
            const theme = getStoredTheme();
            setCurrentTheme(theme);
            setIsDark(isDarkTheme());
        };

        updateTheme();

        // Listen for theme changes
        const handleStorageChange = () => {
            updateTheme();
        };

        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom theme change events
        const handleThemeChange = () => {
            updateTheme();
        };

        document.addEventListener('themeChanged', handleThemeChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('themeChanged', handleThemeChange);
        };
    }, []);

    const handleToggle = () => {
        toggleTheme();

        // Update local state
        const newTheme = getStoredTheme();
        setCurrentTheme(newTheme);
        setIsDark(isDarkTheme());

        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('themeChanged'));
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

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'btn-sm';
            case 'lg':
                return 'btn-lg';
            default:
                return '';
        }
    };

    if (variant === 'icon') {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className={`btn btn-ghost h-8 w-8 rounded-full hover:bg-sky-100 ${getSizeClasses()} ${className}`}
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
                className={`btn btn-outline ${getSizeClasses()} ${className}`}
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
            className={`btn btn-outline ${getSizeClasses()} ${className}`}
        >
            {getIcon()}
            {showLabel && (
                <span className="ml-2">{getThemeDisplayName(currentTheme)}</span>
            )}
        </Button>
    );
};

export default DaisyUIThemeToggle;
