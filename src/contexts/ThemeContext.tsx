import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  ThemeConfig,
  ThemeMode,
  ColorScheme,
  DaisyTheme,
  ThemeColors,
  DEFAULT_THEME_CONFIG,
  getThemeColors,
  getSystemTheme,
  getReducedMotionPreference,
  saveThemeConfig,
  loadThemeConfig,
  validateThemeConfig,
  generateCSSVariables,
  getAnimationConfig,
  FONT_SIZE_CONFIGS,
  getDaisyTheme,
  applyDaisyTheme
} from '@/lib/theme';

interface ThemeContextType {
  // Current theme configuration
  config: ThemeConfig;

  // Current theme colors
  colors: ThemeColors;

  // Theme actions
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setReducedMotion: (reduced: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleMode: () => void;
  resetToDefaults: () => void;

  // Computed values
  isDark: boolean;
  isSystem: boolean;
  animationConfig: ReturnType<typeof getAnimationConfig>;
  fontConfig: typeof FONT_SIZE_CONFIGS[keyof typeof FONT_SIZE_CONFIGS];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultConfig?: Partial<ThemeConfig>;
}

export function ThemeProvider({ children, defaultConfig }: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    // Load from localStorage or use defaults
    const saved = loadThemeConfig();
    const systemPreferences = {
      reducedMotion: getReducedMotionPreference()
    };

    if (saved) {
      return validateThemeConfig({ ...saved, ...systemPreferences });
    }

    return validateThemeConfig({
      ...DEFAULT_THEME_CONFIG,
      ...defaultConfig,
      ...systemPreferences
    });
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme());

  // Determine effective theme mode
  const effectiveMode = config.mode === 'system' ? systemTheme : config.mode;
  const isDark = effectiveMode === 'dark';
  const isSystem = config.mode === 'system';

  // Get current DaisyUI theme
  const daisyTheme = getDaisyTheme(config.mode, systemTheme);

  // Get current theme colors
  const colors = getThemeColors(effectiveMode, config.colorScheme);

  // Get animation and font configurations
  const animationConfig = getAnimationConfig(config.reducedMotion);
  const fontConfig = FONT_SIZE_CONFIGS[config.fontSize];

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const cssVariables = generateCSSVariables(colors);

    // Apply DaisyUI theme
    applyDaisyTheme(daisyTheme);

    // Apply CSS custom properties
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Apply theme class
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveMode);

    // Apply color scheme class
    root.classList.remove('default', 'high-contrast', 'color-blind-friendly');
    root.classList.add(config.colorScheme);

    // Apply font size
    root.style.fontSize = fontConfig.fontSize;

    // Apply reduced motion
    if (config.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Save configuration
    saveThemeConfig(config);

  }, [colors, effectiveMode, config, fontConfig, daisyTheme]);

  // Theme actions
  const setMode = (mode: ThemeMode) => {
    setConfig(prev => ({ ...prev, mode }));
  };

  const setColorScheme = (colorScheme: ColorScheme) => {
    setConfig(prev => ({ ...prev, colorScheme }));
  };

  const setReducedMotion = (reducedMotion: boolean) => {
    setConfig(prev => ({ ...prev, reducedMotion }));
  };

  const setFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    setConfig(prev => ({ ...prev, fontSize }));
  };

  const toggleMode = () => {
    if (config.mode === 'system') {
      setMode(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setMode(config.mode === 'dark' ? 'light' : 'dark');
    }
  };

  const resetToDefaults = () => {
    setConfig({
      ...DEFAULT_THEME_CONFIG,
      reducedMotion: getReducedMotionPreference()
    });
  };

  const value: ThemeContextType = {
    config,
    colors,
    setMode,
    setColorScheme,
    setReducedMotion,
    setFontSize,
    toggleMode,
    resetToDefaults,
    isDark,
    isSystem,
    animationConfig,
    fontConfig
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Custom hook for priority colors
export function usePriorityColors() {
  const { isDark } = useTheme();

  return (priority: 'urgent' | 'high' | 'medium' | 'low') => {
    const { getPriorityColors } = require('@/lib/theme');
    return getPriorityColors(priority, isDark ? 'dark' : 'light');
  };
}

// Custom hook for chart colors
export function useChartColors() {
  const { colors } = useTheme();
  return colors.chart;
}

// Custom hook for responsive theme values
export function useResponsiveTheme<T>(
  lightValue: T,
  darkValue: T
): T {
  const { isDark } = useTheme();
  return isDark ? darkValue : lightValue;
}

export default ThemeProvider;