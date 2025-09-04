/**
 * Theme initialization script
 * This script initializes the daisyUI theme for Factory Pulse
 * Factory Pulse Theme - Clean daisyUI integration
 */

export function initializeTheme() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const html = document.documentElement;

    // Set the daisyUI theme
    html.setAttribute('data-theme', 'factory-pulse');
    html.classList.add('factory-pulse-theme');

    console.log('Factory Pulse daisyUI Theme initialized');

    // Set up a listener for system theme changes (for future dark mode support)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = (e: MediaQueryListEvent) => {
        // For now, we keep the same theme but log the change
        // Future: implement dark mode variant
        console.log(`System theme preference changed to: ${e.matches ? 'dark' : 'light'}`);
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