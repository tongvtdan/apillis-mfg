/**
 * Theme initialization script
 * This script initializes the theme based on localStorage preference
 * or system preference when the application starts
 */

export function initializeTheme() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const html = document.documentElement;
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme-preference');

    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine which theme to use
    const shouldUseDark = savedTheme
        ? savedTheme === 'dark'
        : prefersDark;

    // Apply the theme
    if (shouldUseDark) {
        html.setAttribute('data-theme', 'factory-pulse-dark');
        html.classList.add('dark');
        html.classList.remove('light');
        body.classList.add('dark');
        body.classList.remove('light');
    } else {
        html.setAttribute('data-theme', 'factory-pulse-light');
        html.classList.add('light');
        html.classList.remove('dark');
        body.classList.add('light');
        body.classList.remove('dark');
    }

    console.log(`Theme initialized to: ${shouldUseDark ? 'dark' : 'light'}`);

    // Set up a listener for theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class') {
                const isDark = html.getAttribute('data-theme') === 'factory-pulse-dark' ||
                    html.classList.contains('dark');

                // Ensure body class matches
                if (isDark) {
                    body.classList.add('dark');
                    body.classList.remove('light');
                } else {
                    body.classList.add('light');
                    body.classList.remove('dark');
                }
            }
        });
    });

    observer.observe(html, {
        attributes: true,
        attributeFilter: ['data-theme', 'class']
    });
}

// Run initialization when imported
initializeTheme();