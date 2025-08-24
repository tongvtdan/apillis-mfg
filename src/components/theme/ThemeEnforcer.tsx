import { useEffect } from 'react';

/**
 * ThemeEnforcer - A component that ensures theme is consistently applied across the application
 * This component runs on mount and whenever necessary to fix inconsistencies in theme application
 */
export function ThemeEnforcer() {
    // Run on mount
    useEffect(() => {
        // Initial application
        applyThemeConsistently();

        // Set up a mutation observer to watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class') {
                    applyThemeConsistently();
                }
            });
        });

        // Watch for changes to html element
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });

        // Clean up
        return () => observer.disconnect();
    }, []);

    // Function to enforce theme consistency
    const applyThemeConsistently = () => {
        const html = document.documentElement;
        const body = document.body;

        // Get current theme
        const isDarkTheme =
            html.getAttribute('data-theme') === 'factory-pulse-dark' ||
            html.classList.contains('dark');

        // Apply theme classes to body to ensure proper inheritance
        if (isDarkTheme) {
            body.classList.add('dark');
            body.classList.remove('light');
            body.setAttribute('data-theme', 'factory-pulse-dark');

            // Fix any light-specific elements that might be causing issues
            document.querySelectorAll('.bg-white').forEach(el => {
                el.classList.remove('bg-white');
                el.classList.add('bg-theme-background');
            });

            document.querySelectorAll('.text-black').forEach(el => {
                el.classList.remove('text-black');
                el.classList.add('text-theme-foreground');
            });
        } else {
            body.classList.add('light');
            body.classList.remove('dark');
            body.setAttribute('data-theme', 'factory-pulse-light');

            // Fix any dark-specific elements that might be causing issues
            document.querySelectorAll('.bg-black, .bg-gray-900').forEach(el => {
                el.classList.remove('bg-black', 'bg-gray-900');
                el.classList.add('bg-theme-background');
            });

            document.querySelectorAll('.text-white').forEach(el => {
                el.classList.remove('text-white');
                el.classList.add('text-theme-foreground');
            });
        }

        // Apply theme to all cards
        document.querySelectorAll('.card').forEach(el => {
            el.classList.add('bg-theme-card', 'text-theme-card-foreground', 'border-theme');
        });

        // Apply specific styling to gradient buttons
        document.querySelectorAll('.gradient-primary').forEach(el => {
            if (!el.classList.contains('text-primary-foreground')) {
                el.classList.add('text-primary-foreground');
            }
        });

        // Apply specific landing page fixes
        document.querySelectorAll('.priority-badge').forEach(el => {
            // Get the text content to determine priority
            const priority = el.textContent?.toLowerCase().trim();
            if (priority === 'high') {
                el.classList.add('high');
            } else if (priority === 'medium') {
                el.classList.add('medium');
            } else if (priority === 'low') {
                el.classList.add('low');
            }
        });

        // Fix any hardcoded backgrounds
        document.querySelectorAll('[class*="bg-base-"]').forEach(el => {
            if (el.classList.contains('bg-base-100')) {
                el.classList.add('bg-theme-background');
            } else if (el.classList.contains('bg-base-200')) {
                el.classList.add('bg-theme-muted');
            }
        });

        // Fix any hardcoded text colors
        document.querySelectorAll('[class*="text-base-"]').forEach(el => {
            if (el.classList.contains('text-base-content')) {
                el.classList.add('text-theme-foreground');
            }
        });

        console.log(`Theme consistency enforced: ${isDarkTheme ? 'dark' : 'light'}`);
    };

    // This component doesn't render anything
    return null;
}

export default ThemeEnforcer;