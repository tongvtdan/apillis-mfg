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
            if (priority === 'high' || priority === 'urgent') {
                el.classList.add('high');
            } else if (priority === 'medium') {
                el.classList.add('medium');
            } else if (priority === 'low') {
                el.classList.add('low');
            }
        });

        // Ensure proper badge styling for dashboard elements
        document.querySelectorAll('.badge').forEach(badge => {
            const variant = badge.getAttribute('data-variant');
            if (variant) {
                badge.classList.add(`badge-${variant}`);
            }

            // Add better contrast to badges with priority-related text
            const badgeText = badge.textContent?.toLowerCase().trim();
            if (badgeText) {
                if (badgeText.includes('urgent') || badgeText.includes('high')) {
                    badge.setAttribute('data-variant', 'destructive');
                } else if (badgeText.includes('medium')) {
                    badge.setAttribute('data-variant', 'warning');
                } else if (badgeText.includes('low')) {
                    badge.setAttribute('data-variant', 'success');
                } else if (badgeText === 'action needed') {
                    badge.classList.add('bg-warning/10');
                    badge.classList.add('text-warning');
                }
            }
        });

        // Fix any hardcoded backgrounds
        document.querySelectorAll('[class*="bg-base-"]').forEach(el => {
            const classList = Array.from(el.classList);
            if (classList.find(c => c === 'bg-base-100')) {
                el.classList.add('bg-theme-background');
            } else if (classList.find(c => c === 'bg-base-200')) {
                el.classList.add('bg-theme-muted');
            }
        });

        // Fix any hardcoded text colors
        document.querySelectorAll('[class*="text-base-"]').forEach(el => {
            const classList = Array.from(el.classList);
            if (classList.find(c => c === 'text-base-content')) {
                el.classList.add('text-theme-foreground');
            }
        });

        // Apply theme to warning backgrounds with opacity modifiers
        document.querySelectorAll('[class*="bg-warning"]').forEach(el => {
            const classList = Array.from(el.classList);
            const hasOpacity = classList.some(cls => cls.includes('/10') || cls.includes('/20') || cls.includes('/30'));

            if (hasOpacity && !isDarkTheme) {
                (el as HTMLElement).style.backgroundColor = 'rgba(251, 140, 0, 0.15)';
                (el as HTMLElement).style.color = '#a85c00';
            }
        });

        // Apply styling to status chips in dashboard
        document.querySelectorAll('.urgent-chip, .high-chip').forEach(el => {
            if (!isDarkTheme) {
                if (el.classList.contains('urgent-chip')) {
                    (el as HTMLElement).style.backgroundColor = 'rgba(207, 102, 121, 0.15)';
                    (el as HTMLElement).style.color = '#9c2b41';
                    (el as HTMLElement).style.borderColor = '#cf6679';
                } else if (el.classList.contains('high-chip')) {
                    (el as HTMLElement).style.backgroundColor = 'rgba(251, 140, 0, 0.15)';
                    (el as HTMLElement).style.color = '#a85c00';
                    (el as HTMLElement).style.borderColor = '#fb8c00';
                }
                (el as HTMLElement).style.fontWeight = '600';
                (el as HTMLElement).style.borderRadius = '9999px';
                (el as HTMLElement).style.padding = '0.25rem 0.5rem';
                (el as HTMLElement).style.fontSize = '0.75rem';
                (el as HTMLElement).style.display = 'inline-flex';
                (el as HTMLElement).style.alignItems = 'center';
            }
        });

        // Enhance status indicators in dashboard
        document.querySelectorAll('[class*="text-"][class*="-500"], [class*="text-"][class*="-700"]').forEach(el => {
            if (!isDarkTheme) {
                const classList = Array.from(el.classList);

                // Apply better contrast to color status indicators
                if (classList.some(cls => cls.includes('text-red'))) {
                    (el as HTMLElement).style.color = '#9c2b41';
                    (el as HTMLElement).style.fontWeight = '600';
                } else if (classList.some(cls => cls.includes('text-yellow'))) {
                    (el as HTMLElement).style.color = '#a85c00';
                    (el as HTMLElement).style.fontWeight = '600';
                } else if (classList.some(cls => cls.includes('text-blue'))) {
                    (el as HTMLElement).style.color = '#0c63e4';
                    (el as HTMLElement).style.fontWeight = '600';
                } else if (classList.some(cls => cls.includes('text-green'))) {
                    (el as HTMLElement).style.color = '#2e8432';
                    (el as HTMLElement).style.fontWeight = '600';
                } else if (classList.some(cls => cls.includes('text-purple'))) {
                    (el as HTMLElement).style.color = '#7e3af2';
                    (el as HTMLElement).style.fontWeight = '600';
                }
            }
        });

        // Ensure proper status badge styling for better light mode contrast
        document.querySelectorAll('[class*="bg-"][class*="-100"]').forEach(el => {
            // For status badges with bg-color-100 classes (often used for status indicators)
            const classList = Array.from(el.classList);
            const bgColorClass = classList.find(c => c.startsWith('bg-') && c.endsWith('-100'));

            if (bgColorClass) {
                const color = bgColorClass.replace('bg-', '').replace('-100', '');
                if (!isDarkTheme) {
                    // Apply better contrast in light mode
                    (el as HTMLElement).style.backgroundColor = `var(--${color}-opacity, rgba(0, 0, 0, 0.1))`;
                    (el as HTMLElement).style.fontWeight = '600';
                }
            }
        });

        // Improve dashboard card highlights
        document.querySelectorAll('[class*="bg-muted"]').forEach(el => {
            if (el.classList.contains('bg-muted/30') && !isDarkTheme) {
                (el as HTMLElement).style.borderColor = 'var(--border)';
                (el as HTMLElement).style.borderWidth = '1px';
                (el as HTMLElement).style.borderStyle = 'solid';
            }
        });

        // Ensure urgent and action needed labels have proper styling
        document.querySelectorAll('[class*="animate-pulse"]').forEach(el => {
            if (el.hasAttribute('data-variant') && el.getAttribute('data-variant') === 'destructive' && !isDarkTheme) {
                (el as HTMLElement).style.fontWeight = '700';
            }
        });

        // Enhance styling for overdue badges in quick stats
        document.querySelectorAll('.badge[data-variant="destructive"]').forEach(el => {
            if (!isDarkTheme) {
                (el as HTMLElement).style.fontWeight = '800';
                (el as HTMLElement).style.boxShadow = '0 2px 4px rgba(192, 57, 43, 0.4)';
            }
        });

        // Add special highlighting for overdue badges in quick stats
        document.querySelectorAll('.overdue-badge').forEach(el => {
            if (!isDarkTheme) {
                (el as HTMLElement).style.transform = 'scale(1.05)';
                (el as HTMLElement).style.transition = 'all 0.2s ease-in-out';
            }
        });

        // Enhance styling for status alerts in System Overview cards
        document.querySelectorAll('.status-alert').forEach(el => {
            // Base styling for all status alerts
            (el as HTMLElement).style.fontWeight = '700';
            (el as HTMLElement).style.letterSpacing = '0.02em';
            
            if (!isDarkTheme) {
                // Light mode styling
                (el as HTMLElement).style.transform = 'translateY(-1px)';
            } else {
                // Dark mode styling - enhanced glow and visibility
                (el as HTMLElement).style.transform = 'translateY(-1px) scale(1.05)';
                (el as HTMLElement).style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.5)';
                
                // Apply specific dark mode styling based on alert type
                if (el.classList.contains('overdue-alert')) {
                    (el as HTMLElement).style.boxShadow = '0 2px 12px rgba(255, 82, 82, 0.6)';
                } else if (el.classList.contains('onhold-alert')) {
                    (el as HTMLElement).style.boxShadow = '0 2px 12px rgba(185, 103, 255, 0.6)';
                } else if (el.classList.contains('urgent-alert')) {
                    (el as HTMLElement).style.boxShadow = '0 2px 12px rgba(255, 152, 0, 0.6)';
                } else if (el.classList.contains('critical-alert')) {
                    (el as HTMLElement).style.boxShadow = '0 2px 12px rgba(244, 67, 54, 0.6)';
                }
            }
        });

        console.log(`Theme consistency enforced: ${isDarkTheme ? 'dark' : 'light'}`);
    };

    // This component doesn't render anything
    return null;
}

export default ThemeEnforcer;