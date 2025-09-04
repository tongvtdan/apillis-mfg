/**
 * Theme initialization script
 * This script initializes the daisyUI theme for Factory Pulse
 * Factory Pulse Theme - Clean daisyUI integration
 */

export function initializeTheme() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const html = document.documentElement;

    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set the daisyUI theme based on system preference
    const theme = prefersDark ? 'factory-pulse-dark' : 'factory-pulse-light';
    html.setAttribute('data-theme', theme);
    html.classList.add('factory-pulse-theme');

    console.log(`Factory Pulse daisyUI Theme initialized: ${theme}`);

    // Set up a listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'factory-pulse-dark' : 'factory-pulse-light';
        html.setAttribute('data-theme', newTheme);
        console.log(`System theme preference changed to: ${newTheme}`);
    };

    // Add listener for theme changes
    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleThemeChange);
    } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleThemeChange);
    }
}

// Run initialization when imported
initializeTheme();