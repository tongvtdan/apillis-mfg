import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

/**
 * A simplified theme toggle that directly manipulates the DOM
 * for more reliable theme switching
 */
export function DirectThemeToggle() {
    // Initialize with the current theme
    const [isDark, setIsDark] = useState(() => {
        // Check if we're in the browser
        if (typeof window !== 'undefined') {
            // Get current theme from data-theme attribute or class
            const htmlElement = document.documentElement;
            const currentTheme = htmlElement.getAttribute('data-theme');
            return currentTheme === 'factory-pulse-dark' || htmlElement.classList.contains('dark');
        }
        return false;
    });

    // Apply the theme when isDark changes
    useEffect(() => {
        applyTheme(isDark);
    }, [isDark]);

    // Function to apply theme directly to HTML element
    const applyTheme = (dark: boolean) => {
        const html = document.documentElement;
        const body = document.body;

        // Apply data-theme attribute
        html.setAttribute(
            'data-theme',
            dark ? 'factory-pulse-dark' : 'factory-pulse-light'
        );

        // Apply class for additional styling to both html and body
        if (dark) {
            html.classList.add('dark');
            html.classList.remove('light');
            body.classList.add('dark');
            body.classList.remove('light');
        } else {
            html.classList.add('light');
            html.classList.remove('dark');
            body.classList.add('light');
            body.classList.remove('dark');
        }

        // Force a reflow to ensure styles are applied
        document.body.style.display = 'none';
        void document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';

        console.log(`Theme directly set to: ${dark ? 'dark' : 'light'}`);

        // Save preference to localStorage
        localStorage.setItem('theme-preference', dark ? 'dark' : 'light');
    };

    // Toggle theme
    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}