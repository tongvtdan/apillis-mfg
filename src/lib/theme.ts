// Factory Pulse Theme System - DaisyUI Native Implementation
// Uses DaisyUI's built-in theme management with proper data-theme switching

export type ThemeMode = 'light' | 'dark' | 'system';

// Theme storage key
const THEME_STORAGE_KEY = 'factory-pulse-theme';

// DaisyUI theme names
const DAISYUI_THEMES = {
  light: 'factory-pulse-light',
  dark: 'factory-pulse-dark'
} as const;

// Get stored theme preference
export const getStoredTheme = (): ThemeMode => {
  if (typeof localStorage === 'undefined') return 'system';
  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'system';
};

// Store theme preference
export const setStoredTheme = (theme: ThemeMode): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

// Get system theme preference
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get effective theme (resolves 'system' to actual theme)
export const getEffectiveTheme = (): 'light' | 'dark' => {
  const storedTheme = getStoredTheme();
  if (storedTheme === 'system') {
    return getSystemTheme();
  }
  return storedTheme;
};

// Get current DaisyUI theme name
export const getCurrentDaisyUITheme = (): string => {
  const effectiveTheme = getEffectiveTheme();
  return DAISYUI_THEMES[effectiveTheme];
};

// Apply theme using DaisyUI's native method
export const applyTheme = (theme: ThemeMode): void => {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
  const daisyUITheme = DAISYUI_THEMES[effectiveTheme];

  // Apply DaisyUI theme using data-theme attribute
  html.setAttribute('data-theme', daisyUITheme);

  // Set color scheme for browser optimization
  html.style.colorScheme = effectiveTheme;

  // Store preference
  setStoredTheme(theme);

  console.log(`Factory Pulse Theme applied: ${theme} (effective: ${effectiveTheme}, daisyUI: ${daisyUITheme})`);
};

// Initialize theme system
export const initializeTheme = (): void => {
  if (typeof document === 'undefined') return;

  // Get stored preference or default to system
  const theme = getStoredTheme();
  applyTheme(theme);

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const currentTheme = getStoredTheme();
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }
};

// Theme toggle function
export const toggleTheme = (): void => {
  const currentTheme = getStoredTheme();
  let newTheme: ThemeMode;

  switch (currentTheme) {
    case 'light':
      newTheme = 'dark';
      break;
    case 'dark':
      newTheme = 'system';
      break;
    case 'system':
      newTheme = 'light';
      break;
    default:
      newTheme = 'system';
  }

  applyTheme(newTheme);
};

// Get theme display name
export const getThemeDisplayName = (theme: ThemeMode): string => {
  switch (theme) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'system':
      return 'System';
    default:
      return 'System';
  }
};

// Get theme icon
export const getThemeIcon = (theme: ThemeMode): string => {
  switch (theme) {
    case 'light':
      return '☀️';
    case 'dark':
      return '🌙';
    case 'system':
      return '💻';
    default:
      return '💻';
  }
};

// Check if current theme is dark
export const isDarkTheme = (): boolean => {
  return getEffectiveTheme() === 'dark';
};

// Get all available themes
export const getAvailableThemes = (): ThemeMode[] => {
  return ['light', 'dark', 'system'];
};

// Force refresh theme (useful for debugging)
export const refreshTheme = (): void => {
  const currentTheme = getStoredTheme();
  applyTheme(currentTheme);
};

// Export DaisyUI theme names for external use
export { DAISYUI_THEMES };