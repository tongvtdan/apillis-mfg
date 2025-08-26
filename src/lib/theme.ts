// Factory Pulse Theme System with DaisyUI Integration
// Modern, clean, minimalist design for manufacturing environments
// Adaptive Neutral Design (AND) - Single theme that adapts to environment

export interface ThemeColors {
  // Base colors - neutral grayscale that adapts to environment
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;

  // Interactive elements - industry-standard colors
  primary: string;        // Vibrant Teal/Cyan Blue: #0EA5E9 (from image reference)
  primaryForeground: string;
  secondary: string;      // Light Teal: #38BDF8 (complementary to primary)
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;         // Teal accent: #7DD3FC (lighter teal variant)
  accentForeground: string;

  // Status colors - industry-standard colors for clarity
  destructive: string;    // Error: #DC2626 (Red)
  destructiveForeground: string;
  success: string;        // Success: #059669 (Green)
  successForeground: string;
  warning: string;        // Warning: #D97706 (Orange)
  warningForeground: string;
  info: string;           // Info: #0EA5E9 (Teal - matches primary)
  infoForeground: string;

  // Borders and inputs
  border: string;
  input: string;
  ring: string;

  // Chart colors
  chart: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    quinary: string;
  };
}

// Factory Pulse Adaptive Theme - Single theme that adapts to environment
// Based on industrial design standards with vibrant teal/cyan blue from image reference
export const ADAPTIVE_THEME: ThemeColors = {
  // Neutral base that works in all lighting conditions
  background: 'hsl(210 13% 96%)',    // #F8F9FA - Light neutral background
  foreground: 'hsl(220 13% 18%)',    // #212529 - High contrast text
  card: 'hsl(0 0% 100%)',            // #FFFFFF - Pure white cards for clarity
  cardForeground: 'hsl(220 13% 18%)', // #212529 - Dark text on cards
  popover: 'hsl(0 0% 100%)',         // #FFFFFF - Pure white popovers
  popoverForeground: 'hsl(220 13% 18%)', // #212529 - Dark text in popovers

  // Vibrant teal/cyan blue-based accent colors from image reference
  primary: 'hsl(199 89% 48%)',       // #0EA5E9 - Vibrant Teal/Cyan Blue (from image buttons)
  primaryForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on primary
  secondary: 'hsl(199 89% 58%)',     // #38BDF8 - Light Teal (complementary to primary)
  secondaryForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on secondary
  muted: 'hsl(210 15% 92%)',         // #EBEEF1 - Light muted background
  mutedForeground: 'hsl(215 16% 47%)', // #6C757D - Muted text
  accent: 'hsl(199 89% 68%)',        // #7DD3FC - Light Teal (accent variant)
  accentForeground: 'hsl(220 13% 18%)', // #1F2937 - Dark text on accent

  // Industry-standard status colors
  destructive: 'hsl(0 84% 60%)',     // #DC2626 - Error Red
  destructiveForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on error
  success: 'hsl(160 84% 39%)',        // #059669 - Success Green
  successForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on success
  warning: 'hsl(32 95% 44%)',         // #D97706 - Warning Orange
  warningForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on warning
  info: 'hsl(199 89% 48%)',           // #0EA5E9 - Info Teal (matches primary)
  infoForeground: 'hsl(0 0% 100%)',  // #FFFFFF - White text on info

  // Borders and inputs with appropriate contrast
  border: 'hsl(214 15% 85%)',        // #D8DFE6 - Subtle borders
  input: 'hsl(210 15% 95%)',         // #F2F4F7 - Light input backgrounds
  ring: 'hsl(199 89% 48%)',          // #0EA5E9 - Teal ring (matches primary)

  // Chart colors using our teal-based semantic palette
  chart: {
    primary: 'hsl(199 89% 48%)',     // Vibrant Teal (primary)
    secondary: 'hsl(199 89% 58%)',   // Light Teal (secondary)
    tertiary: 'hsl(199 89% 68%)',    // Light Teal (accent)
    quaternary: 'hsl(160 84% 39%)',  // Success Green
    quinary: 'hsl(0 84% 60%)'        // Error Red
  }
};

// CSS custom properties for theme application
// These will be used with CSS media queries for adaptive behavior
export const generateCSSVariables = (colors: ThemeColors): Record<string, string> => {
  return {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--card': colors.card,
    '--card-foreground': colors.cardForeground,
    '--popover': colors.popover,
    '--popover-foreground': colors.popoverForeground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--destructive': colors.destructive,
    '--destructive-foreground': colors.destructiveForeground,
    '--success': colors.success,
    '--success-foreground': colors.successForeground,
    '--warning': colors.warning,
    '--warning-foreground': colors.warningForeground,
    '--info': colors.info,
    '--info-foreground': colors.infoForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
    '--chart-primary': colors.chart.primary,
    '--chart-secondary': colors.chart.secondary,
    '--chart-tertiary': colors.chart.tertiary,
    '--chart-quaternary': colors.chart.quaternary,
    '--chart-quinary': colors.chart.quinary
  };
};

// Simplified theme application that sets up adaptive behavior
export const applyAdaptiveTheme = (): void => {
  if (typeof document === 'undefined') return;

  // Apply the theme to the HTML element
  const html = document.documentElement;
  html.setAttribute('data-theme', 'factory-pulse-adaptive');

  // Add adaptive class for styling
  html.classList.add('adaptive-theme');

  // Apply CSS custom properties for light mode (default)
  const cssVariables = generateCSSVariables(ADAPTIVE_THEME);
  Object.entries(cssVariables).forEach(([property, value]) => {
    html.style.setProperty(property, value);
  });

  // Set color scheme for browser optimization
  html.style.colorScheme = 'light dark';
};

// Theme detection utilities (simplified)
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default {
  ADAPTIVE_THEME,
  generateCSSVariables,
  applyAdaptiveTheme,
  getSystemTheme
};