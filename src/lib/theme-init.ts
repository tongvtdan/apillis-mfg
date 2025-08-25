/**
 * Theme initialization script
 * This script initializes the adaptive theme based on system preference
 * Factory Pulse Adaptive Theme (FP-AT) - Single theme that adapts to environment
 */

export function initializeTheme() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const html = document.documentElement;

    // For adaptive theme, we always use the same theme name
    html.setAttribute('data-theme', 'factory-pulse-adaptive');
    html.classList.add('adaptive-theme');

    // The theme will automatically adapt based on system preference
    // via CSS media queries in our theme-adaptive.css file

    console.log('Factory Pulse Adaptive Theme initialized');

    // Set up a listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = (e: MediaQueryListEvent) => {
        // The CSS media queries in theme-adaptive.css will handle the actual theme switching
        // We just log the change for debugging purposes
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