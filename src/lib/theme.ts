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
  primary: string;        // Dark Blue: #1E40AF (from image reference)
  primaryForeground: string;
  secondary: string;      // Light Blue: #3B82F6 (complementary to primary)
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;         // Blue accent: #60A5FA (lighter blue variant)
  accentForeground: string;

  // Status colors - industry-standard colors for clarity
  destructive: string;    // Error: #DC2626 (Red)
  destructiveForeground: string;
  success: string;        // Success: #059669 (Green)
  successForeground: string;
  warning: string;        // Warning: #D97706 (Orange)
  warningForeground: string;
  info: string;           // Info: #2563EB (Blue - keeping for brand continuity)
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
// Based on industrial design standards with blue primary color from image reference
export const ADAPTIVE_THEME: ThemeColors = {
  // Neutral base that works in all lighting conditions
  background: 'hsl(210 13% 96%)',    // #F8F9FA - Light neutral background
  foreground: 'hsl(220 13% 18%)',    // #212529 - High contrast text
  card: 'hsl(0 0% 100%)',            // #FFFFFF - Pure white cards for clarity
  cardForeground: 'hsl(220 13% 18%)', // #212529 - Dark text on cards
  popover: 'hsl(0 0% 100%)',         // #FFFFFF - Pure white popovers
  popoverForeground: 'hsl(220 13% 18%)', // #212529 - Dark text in popovers

  // Blue-based accent colors from image reference
  primary: 'hsl(217 91% 33%)',       // #1E40AF - Dark Blue (from image primary buttons/headings)
  primaryForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on primary
  secondary: 'hsl(217 91% 60%)',     // #3B82F6 - Medium Blue (complementary to primary)
  secondaryForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on secondary
  muted: 'hsl(210 15% 92%)',         // #EBEEF1 - Light muted background
  mutedForeground: 'hsl(215 16% 47%)', // #6C757D - Muted text
  accent: 'hsl(217 91% 70%)',        // #60A5FA - Light Blue (accent variant)
  accentForeground: 'hsl(220 13% 18%)', // #1F2937 - Dark text on accent

  // Industry-standard status colors
  destructive: 'hsl(0 84% 60%)',     // #DC2626 - Error Red
  destructiveForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on error
  success: 'hsl(160 84% 39%)',       // #059669 - Success Green
  successForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on success
  warning: 'hsl(32 95% 44%)',        // #D97706 - Warning Orange
  warningForeground: 'hsl(0 0% 100%)', // #FFFFFF - White text on warning
  info: 'hsl(217 91% 60%)',          // #2563EB - Info Blue (brand continuity)
  infoForeground: 'hsl(0 0% 100%)',  // #FFFFFF - White text on info

  // Borders and inputs with appropriate contrast
  border: 'hsl(214 15% 85%)',        // #D8DFE6 - Subtle borders
  input: 'hsl(210 15% 95%)',         // #F2F4F7 - Light input backgrounds
  ring: 'hsl(217 91% 33%)',          // #1E40AF - Dark Blue ring (matches primary)

  // Chart colors using our blue-based semantic palette
  chart: {
    primary: 'hsl(217 91% 33%)',     // Dark Blue (primary)
    secondary: 'hsl(217 91% 60%)',   // Medium Blue (secondary)
    tertiary: 'hsl(217 91% 70%)',    // Light Blue (accent)
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