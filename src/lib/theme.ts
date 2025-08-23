// Enhanced Theme System for Factory Pulse
// Supporting both light and dark modes with priority-based color schemes

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'high-contrast' | 'color-blind-friendly';

export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
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

// Default light theme colors
export const LIGHT_THEME: ThemeColors = {
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(222.2 84% 4.9%)',
  card: 'hsl(0 0% 100%)',
  cardForeground: 'hsl(222.2 84% 4.9%)',
  popover: 'hsl(0 0% 100%)',
  popoverForeground: 'hsl(222.2 84% 4.9%)',
  
  primary: 'hsl(221.2 83.2% 53.3%)',
  primaryForeground: 'hsl(210 40% 98%)',
  secondary: 'hsl(210 40% 96%)',
  secondaryForeground: 'hsl(222.2 84% 4.9%)',
  muted: 'hsl(210 40% 96%)',
  mutedForeground: 'hsl(215.4 16.3% 46.9%)',
  accent: 'hsl(210 40% 96%)',
  accentForeground: 'hsl(222.2 84% 4.9%)',
  
  destructive: 'hsl(0 84.2% 60.2%)',
  destructiveForeground: 'hsl(210 40% 98%)',
  success: 'hsl(142.1 76.2% 36.3%)',
  successForeground: 'hsl(210 40% 98%)',
  warning: 'hsl(38.3 92.1% 50%)',
  warningForeground: 'hsl(222.2 84% 4.9%)',
  info: 'hsl(221.2 83.2% 53.3%)',
  infoForeground: 'hsl(210 40% 98%)',
  
  border: 'hsl(214.3 31.8% 91.4%)',
  input: 'hsl(214.3 31.8% 91.4%)',
  ring: 'hsl(221.2 83.2% 53.3%)',
  
  chart: {
    primary: 'hsl(221.2 83.2% 53.3%)',
    secondary: 'hsl(142.1 76.2% 36.3%)',
    tertiary: 'hsl(38.3 92.1% 50%)',
    quaternary: 'hsl(0 84.2% 60.2%)',
    quinary: 'hsl(261.4 83.3% 57.8%)'
  }
};

// Dark theme colors
export const DARK_THEME: ThemeColors = {
  background: 'hsl(222.2 84% 4.9%)',
  foreground: 'hsl(210 40% 98%)',
  card: 'hsl(222.2 84% 4.9%)',
  cardForeground: 'hsl(210 40% 98%)',
  popover: 'hsl(222.2 84% 4.9%)',
  popoverForeground: 'hsl(210 40% 98%)',
  
  primary: 'hsl(217.2 91.2% 59.8%)',
  primaryForeground: 'hsl(222.2 84% 4.9%)',
  secondary: 'hsl(217.2 32.6% 17.5%)',
  secondaryForeground: 'hsl(210 40% 98%)',
  muted: 'hsl(217.2 32.6% 17.5%)',
  mutedForeground: 'hsl(215 20.2% 65.1%)',
  accent: 'hsl(217.2 32.6% 17.5%)',
  accentForeground: 'hsl(210 40% 98%)',
  
  destructive: 'hsl(0 62.8% 30.6%)',
  destructiveForeground: 'hsl(210 40% 98%)',
  success: 'hsl(142.1 70.6% 45.3%)',
  successForeground: 'hsl(210 40% 98%)',
  warning: 'hsl(38.3 92.1% 50%)',
  warningForeground: 'hsl(222.2 84% 4.9%)',
  info: 'hsl(217.2 91.2% 59.8%)',
  infoForeground: 'hsl(222.2 84% 4.9%)',
  
  border: 'hsl(217.2 32.6% 17.5%)',
  input: 'hsl(217.2 32.6% 17.5%)',
  ring: 'hsl(217.2 91.2% 59.8%)',
  
  chart: {
    primary: 'hsl(217.2 91.2% 59.8%)',
    secondary: 'hsl(142.1 70.6% 45.3%)',
    tertiary: 'hsl(38.3 92.1% 50%)',
    quaternary: 'hsl(0 72.2% 50.6%)',
    quinary: 'hsl(261.4 83.3% 57.8%)'
  }
};

// Enhanced priority color schemes
export const ENHANCED_PRIORITY_COLORS: EnhancedPriorityColors = {
  urgent: {
    light: {
      bg: 'hsl(0 85.7% 97.3%)',
      text: 'hsl(0 84.2% 20.2%)',
      border: 'hsl(0 84.2% 60.2%)',
      hover: 'hsl(0 85.7% 92.3%)',
      glow: 'hsl(0 84.2% 60.2%)'
    },
    dark: {
      bg: 'hsl(0 62.8% 15.6%)',
      text: 'hsl(0 85.7% 97.3%)',
      border: 'hsl(0 62.8% 30.6%)',
      hover: 'hsl(0 62.8% 20.6%)',
      glow: 'hsl(0 62.8% 50.6%)'
    }
  },
  high: {
    light: {
      bg: 'hsl(38.3 100% 97%)',
      text: 'hsl(38.3 92.1% 20%)',
      border: 'hsl(38.3 92.1% 50%)',
      hover: 'hsl(38.3 100% 92%)',
      glow: 'hsl(38.3 92.1% 50%)'
    },
    dark: {
      bg: 'hsl(38.3 92.1% 15%)',
      text: 'hsl(38.3 100% 97%)',
      border: 'hsl(38.3 92.1% 30%)',
      hover: 'hsl(38.3 92.1% 20%)',
      glow: 'hsl(38.3 92.1% 50%)'
    }
  },
  medium: {
    light: {
      bg: 'hsl(221.2 83.2% 97.3%)',
      text: 'hsl(221.2 83.2% 20.3%)',
      border: 'hsl(221.2 83.2% 53.3%)',
      hover: 'hsl(221.2 83.2% 92.3%)'
    },
    dark: {
      bg: 'hsl(217.2 32.6% 17.5%)',
      text: 'hsl(217.2 91.2% 79.8%)',
      border: 'hsl(217.2 91.2% 59.8%)',
      hover: 'hsl(217.2 32.6% 22.5%)'
    }
  },
  low: {
    light: {
      bg: 'hsl(142.1 76.2% 97.3%)',
      text: 'hsl(142.1 76.2% 16.3%)',
      border: 'hsl(142.1 76.2% 36.3%)',
      hover: 'hsl(142.1 76.2% 92.3%)'
    },
    dark: {
      bg: 'hsl(142.1 70.6% 15.3%)',
      text: 'hsl(142.1 76.2% 97.3%)',
      border: 'hsl(142.1 70.6% 45.3%)',
      hover: 'hsl(142.1 70.6% 20.3%)'
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
    primary: 'hsl(221.2 83.2% 53.3%)', // Blue
    secondary: 'hsl(38.3 92.1% 50%)',  // Orange
    tertiary: 'hsl(0 0% 45%)',         // Gray
    quaternary: 'hsl(142.1 76.2% 36.3%)', // Green
    quinary: 'hsl(261.4 83.3% 57.8%)'    // Purple
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
  fontSize: 'medium'
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
    fontSize: ['small', 'medium', 'large'].includes(config.fontSize as string) ? config.fontSize as 'small' | 'medium' | 'large' : 'medium'
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