// Factory Pulse Theme System - Simplified and Clean
// Single theme that adapts to environment using CSS custom properties

export interface ThemeColors {
  // Teal/Cyan Blue Primary System
  primary: string;        // #0EA5E9 - Vibrant Teal/Cyan Blue
  primaryForeground: string;
  secondary: string;      // #38BDF8 - Light Teal
  secondaryForeground: string;
  accent: string;         // #7DD3FC - Light Teal accent
  accentForeground: string;

  // Neutral Base Colors
  background: string;     // #F8F9FA - Light neutral background
  foreground: string;     // #212529 - High contrast text
  card: string;          // #FFFFFF - Pure white cards
  cardForeground: string;
  popover: string;       // #FFFFFF - Pure white popovers
  popoverForeground: string;
  muted: string;         // #EBEEF1 - Light muted background
  mutedForeground: string;

  // Status Colors
  destructive: string;   // #DC2626 - Error Red
  destructiveForeground: string;
  success: string;       // #059669 - Success Green
  successForeground: string;
  warning: string;      // #D97706 - Warning Orange
  warningForeground: string;
  info: string;         // #0EA5E9 - Info Teal (matches primary)
  infoForeground: string;

  // Interface Elements
  border: string;       // #D8DFE6 - Subtle borders
  input: string;        // #F2F4F7 - Light input backgrounds
  ring: string;         // #0EA5E9 - Teal ring (matches primary)
}

// Factory Pulse Adaptive Theme - Single theme that adapts to environment
export const ADAPTIVE_THEME: ThemeColors = {
  // Teal/Cyan Blue Primary System
  primary: 'hsl(199 89% 48%)',       // #0EA5E9 - Vibrant Teal/Cyan Blue
  primaryForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on primary
  secondary: 'hsl(199 89% 58%)',     // #38BDF8 - Light Teal
  secondaryForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on secondary
  accent: 'hsl(199 89% 68%)',        // #7DD3FC - Light Teal accent
  accentForeground: 'hsl(220 13% 18%)', // #1F2937 - Dark text on accent

  // Neutral Base Colors
  background: 'hsl(210 13% 96%)',    // #F8F9FA - Light neutral background
  foreground: 'hsl(220 13% 18%)',   // #212529 - High contrast text
  card: 'hsl(0 0% 100%)',           // #FFFFFF - Pure white cards
  cardForeground: 'hsl(220 13% 18%)', // #212529 - Dark text on cards
  popover: 'hsl(0 0% 100%)',        // #FFFFFF - Pure white popovers
  popoverForeground: 'hsl(220 13% 18%)', // #212529 - Dark text in popovers
  muted: 'hsl(210 15% 92%)',        // #EBEEF1 - Light muted background
  mutedForeground: 'hsl(215 16% 47%)', // #6C757D - Muted text

  // Status Colors
  destructive: 'hsl(0 84% 60%)',    // #DC2626 - Error Red
  destructiveForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on error
  success: 'hsl(160 84% 39%)',       // #059669 - Success Green
  successForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on success
  warning: 'hsl(32 95% 44%)',        // #D97706 - Warning Orange
  warningForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on warning
  info: 'hsl(199 89% 48%)',          // #0EA5E9 - Info Teal (matches primary)
  infoForeground: 'hsl(0 0% 100%)',  // #FFFFFF - White text on info

  // Interface Elements
  border: 'hsl(214 15% 85%)',       // #D8DFE6 - Subtle borders
  input: 'hsl(210 15% 95%)',        // #F2F4F7 - Light input backgrounds
  ring: 'hsl(199 89% 48%)',         // #0EA5E9 - Teal ring (matches primary)
};

// Simplified theme application
export const applyAdaptiveTheme = (): void => {
  if (typeof document === 'undefined') return;

  // Apply the theme to the HTML element
  const html = document.documentElement;
  html.setAttribute('data-theme', 'factory-pulse-adaptive');
  html.classList.add('adaptive-theme');

  // Set color scheme for browser optimization
  html.style.colorScheme = 'light dark';

  console.log('Factory Pulse Adaptive Theme initialized');
};

// Theme detection utilities
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default {
  ADAPTIVE_THEME,
  applyAdaptiveTheme,
  getSystemTheme
};