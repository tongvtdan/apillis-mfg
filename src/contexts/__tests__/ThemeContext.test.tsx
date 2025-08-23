import React from 'react';
import { renderHook, render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme, usePriorityColors, useChartColors } from '../ThemeContext';
import { ThemeConfig, DEFAULT_THEME_CONFIG } from '@/lib/theme';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Test component to use theme context
function TestComponent() {
  const { 
    config, 
    colors, 
    setMode, 
    setColorScheme, 
    setReducedMotion, 
    setFontSize,
    toggleMode, 
    resetToDefaults,
    isDark,
    isSystem 
  } = useTheme();

  return (
    <div>
      <div data-testid="theme-mode">{config.mode}</div>
      <div data-testid="color-scheme">{config.colorScheme}</div>
      <div data-testid="font-size">{config.fontSize}</div>
      <div data-testid="reduced-motion">{config.reducedMotion ? 'true' : 'false'}</div>
      <div data-testid="is-dark">{isDark ? 'true' : 'false'}</div>
      <div data-testid="is-system">{isSystem ? 'true' : 'false'}</div>
      <div data-testid="background-color">{colors.background}</div>
      
      <button onClick={() => setMode('light')}>Set Light</button>
      <button onClick={() => setMode('dark')}>Set Dark</button>
      <button onClick={() => setMode('system')}>Set System</button>
      <button onClick={() => setColorScheme('high-contrast')}>High Contrast</button>
      <button onClick={() => setFontSize('large')}>Large Font</button>
      <button onClick={() => setReducedMotion(true)}>Reduce Motion</button>
      <button onClick={toggleMode}>Toggle Mode</button>
      <button onClick={resetToDefaults}>Reset</button>
    </div>
  );
}

describe('ThemeContext', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default matchMedia mock
    mockMatchMedia.mockImplementation((query) => ({
      matches: query.includes('dark') ? false : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // Clear localStorage
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('ThemeProvider', () => {
    it('should initialize with default configuration', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');
      expect(screen.getByTestId('color-scheme')).toHaveTextContent('default');
      expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
    });

    it('should load configuration from localStorage', () => {
      const savedConfig: ThemeConfig = {
        mode: 'dark',
        colorScheme: 'high-contrast',
        fontSize: 'large',
        reducedMotion: true
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedConfig));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('color-scheme')).toHaveTextContent('high-contrast');
      expect(screen.getByTestId('font-size')).toHaveTextContent('large');
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    });

    it('should handle invalid localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should fall back to defaults
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');
      expect(screen.getByTestId('color-scheme')).toHaveTextContent('default');
    });

    it('should apply default configuration from props', () => {
      const defaultConfig = {
        mode: 'dark' as const,
        fontSize: 'large' as const
      };

      render(
        <ThemeProvider defaultConfig={defaultConfig}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('font-size')).toHaveTextContent('large');
    });

    it('should detect system theme preference', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query.includes('dark') ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
      expect(screen.getByTestId('is-system')).toHaveTextContent('true');
    });

    it('should detect reduced motion preference', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query.includes('reduce') ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    });
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide theme configuration and colors', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.config).toEqual(expect.objectContaining({
        mode: 'system',
        colorScheme: 'default',
        fontSize: 'medium',
        reducedMotion: false
      }));

      expect(result.current.colors).toEqual(expect.objectContaining({
        background: expect.any(String),
        foreground: expect.any(String),
        primary: expect.any(String)
      }));

      expect(typeof result.current.setMode).toBe('function');
      expect(typeof result.current.toggleMode).toBe('function');
    });
  });

  describe('Theme Actions', () => {
    it('should change theme mode', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const lightButton = screen.getByText('Set Light');
      await user.click(lightButton);

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    it('should toggle between light and dark modes', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Start with system mode (light by default in test)
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');

      const toggleButton = screen.getByText('Toggle Mode');
      await user.click(toggleButton);

      // Should switch to explicit dark mode
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');

      await user.click(toggleButton);

      // Should switch to light mode
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    it('should change color scheme', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const highContrastButton = screen.getByText('High Contrast');
      await user.click(highContrastButton);

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('high-contrast');
    });

    it('should change font size', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const largeFontButton = screen.getByText('Large Font');
      await user.click(largeFontButton);

      expect(screen.getByTestId('font-size')).toHaveTextContent('large');
    });

    it('should toggle reduced motion', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const reduceMotionButton = screen.getByText('Reduce Motion');
      await user.click(reduceMotionButton);

      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    });

    it('should reset to defaults', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Change some settings
      await user.click(screen.getByText('Set Dark'));
      await user.click(screen.getByText('High Contrast'));
      await user.click(screen.getByText('Large Font'));

      // Reset
      await user.click(screen.getByText('Reset'));

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');
      expect(screen.getByTestId('color-scheme')).toHaveTextContent('default');
      expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
    });
  });

  describe('DOM Manipulation', () => {
    it('should apply CSS custom properties to document root', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--background')).toBeTruthy();
      expect(root.style.getPropertyValue('--foreground')).toBeTruthy();
      expect(root.style.getPropertyValue('--primary')).toBeTruthy();
    });

    it('should apply theme class to document root', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const root = document.documentElement;
      
      // Should start with light class (system default in test)
      expect(root.classList.contains('light')).toBe(true);

      // Switch to dark mode
      await user.click(screen.getByText('Set Dark'));
      expect(root.classList.contains('dark')).toBe(true);
      expect(root.classList.contains('light')).toBe(false);
    });

    it('should apply color scheme class to document root', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const root = document.documentElement;
      expect(root.classList.contains('default')).toBe(true);

      await user.click(screen.getByText('High Contrast'));
      expect(root.classList.contains('high-contrast')).toBe(true);
      expect(root.classList.contains('default')).toBe(false);
    });

    it('should apply reduced motion class when enabled', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const root = document.documentElement;
      expect(root.classList.contains('reduced-motion')).toBe(false);

      await user.click(screen.getByText('Reduce Motion'));
      expect(root.classList.contains('reduced-motion')).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should save configuration to localStorage', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByText('Set Dark'));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'factory-pulse-theme',
        expect.stringContaining('"mode":"dark"')
      );
    });

    it('should handle localStorage save errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByText('Set Dark'));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save theme config:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('System Theme Changes', () => {
    it('should respond to system theme changes', () => {
      let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | undefined;

      mockMatchMedia.mockImplementation((query) => ({
        matches: query.includes('dark') ? false : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            mediaQueryCallback = callback;
          }
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');

      // Simulate system theme change to dark
      act(() => {
        mediaQueryCallback?.({ matches: true } as MediaQueryListEvent);
      });

      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });
  });
});

describe('usePriorityColors', () => {
  it('should return priority colors based on theme mode', () => {
    const TestPriorityComponent = () => {
      const getPriorityColors = usePriorityColors();
      const urgentColors = getPriorityColors('urgent');
      
      return <div data-testid="urgent-bg">{urgentColors.bg}</div>;
    };

    render(
      <ThemeProvider>
        <TestPriorityComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('urgent-bg')).toHaveTextContent(/hsl\(/);
  });
});

describe('useChartColors', () => {
  it('should return chart colors from theme', () => {
    const TestChartComponent = () => {
      const chartColors = useChartColors();
      
      return <div data-testid="chart-primary">{chartColors.primary}</div>;
    };

    render(
      <ThemeProvider>
        <TestChartComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('chart-primary')).toHaveTextContent(/hsl\(/);
  });
});