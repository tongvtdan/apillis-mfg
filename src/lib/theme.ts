// Factory Pulse Theme System with DaisyUI Integration
// Modern, clean, minimalist design for manufacturing environments

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'high-contrast' | 'color-blind-friendly';
export type DaisyTheme = 'factory-pulse-light' | 'factory-pulse-dark';

export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  daisyTheme: DaisyTheme;
}

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;

  // Interactive elements
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;

  // Status colors
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
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

export interface EnhancedPriorityColors {
  urgent: {
    light: {
      bg: string;
      text: string;
      border: string;
      hover: string;
      glow?: string;
    };
    dark: {
      bg: string;
      text: string;
      border: string;
      hover: string;
      glow?: string;
    };
  };
  high: {
    light: {
      bg: string;
      text: string;
      border: string;
      hover: string;
      glow?: string;
    };
    dark: {
      bg: string;
      text: string;
      border: string;
      hover: string;
      glow?: string;
    };
  };
  medium: {
    light: {
      bg: string;
      text: string;
      border: string;
      hover: string;
    };
    dark: {
      bg: string;
      text: string;
      border: string;
      hover: string;
    };
  };
  low: {
    light: {
      bg: string;
      text: string;
      border: string;
      hover: string;
    };
    dark: {
      bg: string;
      text: string;
      border: string;
      hover: string;
    };
  };
}

// Factory Pulse Light Theme - Based on design specification
export const LIGHT_THEME: ThemeColors = {
  background: 'hsl(0 0% 100%)',      // base-100: #FFFFFF
  foreground: 'hsl(220 13% 18%)',    // base-content: #1F2937
  card: 'hsl(0 0% 100%)',            // base-100: #FFFFFF
  cardForeground: 'hsl(220 13% 18%)',
  popover: 'hsl(0 0% 100%)',
  popoverForeground: 'hsl(220 13% 18%)',

  primary: 'hsl(174 100% 44%)',      // primary: #03DAC6 (Teal/Cyan)
  primaryForeground: 'hsl(0 0% 0%)', // primary-content: #000000
  secondary: 'hsl(258 100% 76%)',    // secondary: #BB86FC (Purple)
  secondaryForeground: 'hsl(0 0% 100%)', // secondary-content: #FFFFFF
  muted: 'hsl(210 20% 98%)',         // base-200: #F9FAFB
  mutedForeground: 'hsl(215 16% 47%)', // neutral content
  accent: 'hsl(45 100% 63%)',        // accent: #FFD740 (Amber)
  accentForeground: 'hsl(220 13% 18%)', // accent-content: #1F2937

  destructive: 'hsl(351 83% 61%)',   // error: #CF6679 (Pink-red)
  destructiveForeground: 'hsl(0 0% 100%)',
  success: 'hsl(122 39% 49%)',       // success: #4CAF50 (Green)
  successForeground: 'hsl(0 0% 100%)',
  warning: 'hsl(36 100% 50%)',       // warning: #FB8C00 (Orange)
  warningForeground: 'hsl(0 0% 100%)',
  info: 'hsl(207 90% 54%)',          // info: #2196F3 (Blue)
  infoForeground: 'hsl(0 0% 100%)',

  border: 'hsl(214 32% 91%)',        // base-300: #E5E7EB
  input: 'hsl(210 20% 98%)',         // base-200: #F9FAFB
  ring: 'hsl(174 100% 44%)',         // primary ring

  chart: {
    primary: 'hsl(174 100% 44%)',    // Teal
    secondary: 'hsl(258 100% 76%)',  // Purple
    tertiary: 'hsl(45 100% 63%)',    // Amber
    quaternary: 'hsl(122 39% 49%)',  // Green
    quinary: 'hsl(351 83% 61%)'      // Pink-red
  }
};

// Factory Pulse Dark Theme - Based on design specification
export const DARK_THEME: ThemeColors = {
  background: 'hsl(0 0% 7%)',        // dark base-100: #121212
  foreground: 'hsl(0 0% 88%)',       // dark base-content: #E0E0E0
  card: 'hsl(0 0% 12%)',             // dark base-200: #1E1E1E
  cardForeground: 'hsl(0 0% 88%)',
  popover: 'hsl(0 0% 12%)',
  popoverForeground: 'hsl(0 0% 88%)',

  primary: 'hsl(174 100% 44%)',      // primary: #03DAC6 (same in dark)
  primaryForeground: 'hsl(0 0% 0%)', // primary-content: #000000
  secondary: 'hsl(258 100% 76%)',    // secondary: #BB86FC (same in dark)
  secondaryForeground: 'hsl(0 0% 100%)',
  muted: 'hsl(0 0% 18%)',            // dark neutral: #2D2D2D
  mutedForeground: 'hsl(0 0% 63%)',  // muted content
  accent: 'hsl(45 100% 63%)',        // accent: #FFD740 (same in dark)
  accentForeground: 'hsl(220 13% 18%)',

  destructive: 'hsl(351 83% 61%)',   // error: #CF6679 (same in dark)
  destructiveForeground: 'hsl(0 0% 100%)',
  success: 'hsl(122 39% 49%)',       // success: #4CAF50 (same in dark)
  successForeground: 'hsl(0 0% 100%)',
  warning: 'hsl(36 100% 50%)',       // warning: #FB8C00 (same in dark)
  warningForeground: 'hsl(0 0% 100%)',
  info: 'hsl(207 90% 54%)',          // info: #2196F3 (same in dark)
  infoForeground: 'hsl(0 0% 100%)',

  border: 'hsl(0 0% 18%)',           // dark borders
  input: 'hsl(0 0% 12%)',            // dark input background
  ring: 'hsl(174 100% 44%)',         // primary ring

  chart: {
    primary: 'hsl(174 100% 44%)',    // Teal
    secondary: 'hsl(258 100% 76%)',  // Purple
    tertiary: 'hsl(45 100% 63%)',    // Amber
    quaternary: 'hsl(122 39% 49%)',  // Green
    quinary: 'hsl(351 83% 61%)'      // Pink-red
  }
};

// Enhanced priority color schemes - Factory Pulse themed
export const ENHANCED_PRIORITY_COLORS: EnhancedPriorityColors = {
  urgent: {
    light: {
      bg: 'hsl(351 83% 95%)',        // Light pink-red background
      text: 'hsl(351 83% 25%)',      // Dark pink-red text
      border: 'hsl(351 83% 61%)',    // Error color border
      hover: 'hsl(351 83% 90%)',     // Hover state
      glow: 'hsl(351 83% 61%)'       // Glow effect
    },
    dark: {
      bg: 'hsl(351 83% 10%)',        // Dark pink-red background
      text: 'hsl(351 83% 85%)',      // Light pink-red text
      border: 'hsl(351 83% 61%)',    // Error color border
      hover: 'hsl(351 83% 15%)',     // Hover state
      glow: 'hsl(351 83% 61%)'       // Glow effect
    }
  },
  high: {
    light: {
      bg: 'hsl(36 100% 95%)',        // Light orange background
      text: 'hsl(36 100% 25%)',      // Dark orange text
      border: 'hsl(36 100% 50%)',    // Warning color border
      hover: 'hsl(36 100% 90%)',     // Hover state
      glow: 'hsl(36 100% 50%)'       // Glow effect
    },
    dark: {
      bg: 'hsl(36 100% 10%)',        // Dark orange background
      text: 'hsl(36 100% 85%)',      // Light orange text
      border: 'hsl(36 100% 50%)',    // Warning color border
      hover: 'hsl(36 100% 15%)',     // Hover state
      glow: 'hsl(36 100% 50%)'       // Glow effect
    }
  },
  medium: {
    light: {
      bg: 'hsl(45 100% 95%)',        // Light amber background
      text: 'hsl(45 100% 25%)',      // Dark amber text
      border: 'hsl(45 100% 63%)',    // Accent color border
      hover: 'hsl(45 100% 90%)'      // Hover state
    },
    dark: {
      bg: 'hsl(45 100% 10%)',        // Dark amber background
      text: 'hsl(45 100% 85%)',      // Light amber text
      border: 'hsl(45 100% 63%)',    // Accent color border
      hover: 'hsl(45 100% 15%)'      // Hover state
    }
  },
  low: {
    light: {
      bg: 'hsl(122 39% 95%)',        // Light green background
      text: 'hsl(122 39% 25%)',      // Dark green text
      border: 'hsl(122 39% 49%)',    // Success color border
      hover: 'hsl(122 39% 90%)'      // Hover state
    },
    dark: {
      bg: 'hsl(122 39% 10%)',        // Dark green background
      text: 'hsl(122 39% 85%)',      // Light green text
      border: 'hsl(122 39% 49%)',    // Success color border
      hover: 'hsl(122 39% 15%)'      // Hover state
    }
  }
};

// High contrast theme for accessibility
export const HIGH_CONTRAST_COLORS: Partial<ThemeColors> = {
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(0 0% 0%)',
  primary: 'hsl(0 0% 0%)',
  primaryForeground: 'hsl(0 0% 100%)',
  secondary: 'hsl(0 0% 95%)',
  border: 'hsl(0 0% 0%)',

  destructive: 'hsl(0 100% 25%)',
  success: 'hsl(120 100% 25%)',
  warning: 'hsl(45 100% 35%)',
  info: 'hsl(240 100% 25%)'
};

// Color-blind friendly theme
export const COLOR_BLIND_FRIENDLY_COLORS: Partial<ThemeColors> = {
  chart: {
    primary: 'hsl(210 100% 56%)', // Blue
    secondary: 'hsl(25 100% 58%)',  // Orange
    tertiary: 'hsl(0 0% 45%)',      // Gray
    quaternary: 'hsl(142 69% 58%)', // Green
    quinary: 'hsl(271 81% 56%)'     // Purple
  }
};

// Utility functions for theme management
export const getThemeColors = (mode: ThemeMode, colorScheme: ColorScheme): ThemeColors => {
  const baseTheme = mode === 'dark' ? DARK_THEME : LIGHT_THEME;

  switch (colorScheme) {
    case 'high-contrast':
      return { ...baseTheme, ...HIGH_CONTRAST_COLORS };
    case 'color-blind-friendly':
      return { ...baseTheme, ...COLOR_BLIND_FRIENDLY_COLORS };
    default:
      return baseTheme;
  }
};

export const getPriorityColors = (priority: 'urgent' | 'high' | 'medium' | 'low', mode: ThemeMode) => {
  const themeMode = mode === 'dark' ? 'dark' : 'light';
  return ENHANCED_PRIORITY_COLORS[priority][themeMode];
};

// CSS custom properties for theme application
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

// Theme detection utilities
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getReducedMotionPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Theme persistence utilities
export const THEME_STORAGE_KEY = 'factory-pulse-theme';

export const saveThemeConfig = (config: ThemeConfig): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Failed to save theme config:', error);
  }
};

export const loadThemeConfig = (): ThemeConfig | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load theme config:', error);
  }
  return null;
};

// Default theme configuration
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'system',
  colorScheme: 'default',
  reducedMotion: false,
  fontSize: 'medium',
  daisyTheme: 'factory-pulse-light'
};

// DaisyUI theme mapping
export const getDaisyTheme = (mode: ThemeMode, systemTheme: 'light' | 'dark'): DaisyTheme => {
  const effectiveMode = mode === 'system' ? systemTheme : mode;
  return effectiveMode === 'dark' ? 'factory-pulse-dark' : 'factory-pulse-light';
};

// Enhanced direct theme application - more reliable
export const applyThemeDirectly = (isDarkMode: boolean): void => {
  if (typeof document === 'undefined') return;

  // Get the HTML element
  const html = document.documentElement;

  // Apply the appropriate DaisyUI theme
  const themeName = isDarkMode ? 'factory-pulse-dark' : 'factory-pulse-light';
  html.setAttribute('data-theme', themeName);

  // Modify class list for additional styling
  if (isDarkMode) {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.add('light');
    html.classList.remove('dark');
  }

  // Apply additional class for backward compatibility
  html.classList.add(isDarkMode ? 'theme-dark' : 'theme-light');

  // Force a reflow to ensure styles are applied
  const originalDisplay = document.body.style.display;
  document.body.style.display = 'none';
  void document.body.offsetHeight; // Trigger reflow
  document.body.style.display = originalDisplay;

  console.log(`Enhanced theme directly applied: ${themeName}`, {
    'data-theme': html.getAttribute('data-theme'),
    'classes': html.className,
    'isDark': isDarkMode
  });
};

// Apply DaisyUI theme to document
export const applyDaisyTheme = (theme: DaisyTheme): void => {
  if (typeof document !== 'undefined') {
    const prevTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', theme);

    // For debugging - log theme changes
    if (prevTheme !== theme) {
      console.log(`Theme changed: ${prevTheme || 'none'} → ${theme}`);
    } else {
      console.log(`Theme reapplied: ${theme}`);
    }

    // Force a repaint to ensure theme changes take effect
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
  }
};

// Font size configurations
export const FONT_SIZE_CONFIGS = {
  small: {
    fontSize: '14px',
    scale: 0.875
  },
  medium: {
    fontSize: '16px',
    scale: 1
  },
  large: {
    fontSize: '18px',
    scale: 1.125
  }
} as const;

// Animation configurations based on reduced motion preference
export const getAnimationConfig = (reducedMotion: boolean) => ({
  transition: reducedMotion ? 'none' : 'all 0.2s ease-in-out',
  animationDuration: reducedMotion ? '0ms' : '300ms',
  animationTimingFunction: reducedMotion ? 'linear' : 'ease-in-out'
});

// Theme validation
export const validateThemeConfig = (config: Partial<ThemeConfig>): ThemeConfig => {
  return {
    mode: ['light', 'dark', 'system'].includes(config.mode as string) ? config.mode as ThemeMode : 'system',
    colorScheme: ['default', 'high-contrast', 'color-blind-friendly'].includes(config.colorScheme as string) ? config.colorScheme as ColorScheme : 'default',
    reducedMotion: typeof config.reducedMotion === 'boolean' ? config.reducedMotion : false,
    fontSize: ['small', 'medium', 'large'].includes(config.fontSize as string) ? config.fontSize as 'small' | 'medium' | 'large' : 'medium',
    daisyTheme: ['factory-pulse-light', 'factory-pulse-dark'].includes(config.daisyTheme as string) ? config.daisyTheme as DaisyTheme : 'factory-pulse-light'
  };
};

export default {
  LIGHT_THEME,
  DARK_THEME,
  ENHANCED_PRIORITY_COLORS,
  HIGH_CONTRAST_COLORS,
  COLOR_BLIND_FRIENDLY_COLORS,
  getThemeColors,
  getPriorityColors,
  generateCSSVariables,
  getSystemTheme,
  getReducedMotionPreference,
  saveThemeConfig,
  loadThemeConfig,
  DEFAULT_THEME_CONFIG,
  FONT_SIZE_CONFIGS,
  getAnimationConfig,
  validateThemeConfig
};