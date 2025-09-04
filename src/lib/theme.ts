// Factory Pulse Theme System - Enhanced for DaisyUI Light/Dark Mode
// Comprehensive theme management with system preference detection

export type ThemeMode = 'light' | 'dark' | 'system';

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

// Theme storage key
const THEME_STORAGE_KEY = 'factory-pulse-theme';

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

// Apply theme to document
export const applyTheme = (theme: ThemeMode): void => {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;

  // Apply DaisyUI theme
  html.setAttribute('data-theme', `factory-pulse-${effectiveTheme}`);

  // Set color scheme for browser optimization
  html.style.colorScheme = effectiveTheme;

  // Store preference
  setStoredTheme(theme);

  console.log(`Factory Pulse Theme applied: ${theme} (effective: ${effectiveTheme})`);
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
    mediaQuery.addEventListener('change', (e) => {
      const currentTheme = getStoredTheme();
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    });
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

export default {
  getStoredTheme,
  setStoredTheme,
  getSystemTheme,
  getEffectiveTheme,
  applyTheme,
  initializeTheme,
  toggleTheme,
  getThemeDisplayName,
  getThemeIcon,
};