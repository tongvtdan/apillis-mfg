import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Sun,
  Moon,
  Monitor,
  Settings,
  Palette,
  Type,
  Accessibility,
  RotateCcw,
  Check,
  Eye,
  Zap
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeMode, ColorScheme, applyThemeDirectly } from '@/lib/theme';

interface ThemeToggleProps {
  variant?: 'button' | 'icon' | 'dropdown';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'icon', size = 'default', showLabel = false }: ThemeToggleProps) {
  const { config, toggleMode, isDark, isSystem } = useTheme();

  // Enhanced toggle handler that forces immediate theme application
  const handleToggle = () => {
    toggleMode();

    // Force a theme update to ensure changes take effect
    setTimeout(() => {
      // Determine if we should be in dark mode after toggle
      const newIsDark = !isDark;

      // Apply theme directly using our enhanced function
      applyThemeDirectly(newIsDark);

      console.log(`Theme toggled to: ${newIsDark ? 'dark' : 'light'}`);
    }, 0);
  };

  const getIcon = () => {
    if (isSystem) return <Monitor className="h-4 w-4" />;
    return isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (isSystem) return 'System';
    return isDark ? 'Dark' : 'Light';
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleToggle}
        className="gap-2"
      >
        {getIcon()}
        {showLabel && <span>{getLabel()}</span>}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size={size === 'default' ? 'icon' : size}
      onClick={handleToggle}
      className="rounded-full"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {getIcon()}
    </Button>
  );
}

interface ThemeDropdownProps {
  align?: 'start' | 'center' | 'end';
}

export function ThemeDropdown({ align = 'end' }: ThemeDropdownProps) {
  const { config, setMode, isDark, isSystem } = useTheme();

  // Enhanced mode change handler that forces immediate theme application
  const handleModeChange = (value: string) => {
    setMode(value as ThemeMode);

    // Force theme update immediately
    setTimeout(() => {
      const isDarkMode = value === 'dark' ||
        (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      // Apply theme directly using our enhanced function
      applyThemeDirectly(isDarkMode);

      console.log(`Theme applied via dropdown: ${isDarkMode ? 'dark' : 'light'}`);
    }, 0);
  };

  const modeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          {isSystem ? <Monitor className="h-4 w-4" /> :
            isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={config.mode} onValueChange={handleModeChange}>
          {modeOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-2">
              {option.icon}
              <span>{option.label}</span>
              {option.value === 'system' && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Auto
                </Badge>
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ThemeSettingsProps {
  trigger?: React.ReactNode;
}

export function ThemeSettings({ trigger }: ThemeSettingsProps) {
  const [open, setOpen] = useState(false);
  const {
    config,
    setMode,
    setColorScheme,
    setReducedMotion,
    setFontSize,
    resetToDefaults,
    isDark,
    isSystem
  } = useTheme();

  const modeOptions: { value: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="h-4 w-4" />,
      description: 'Light theme for better visibility in bright environments'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="h-4 w-4" />,
      description: 'Dark theme to reduce eye strain in low-light conditions'
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Automatically switch based on your system preference'
    },
  ];

  const colorSchemeOptions: { value: ColorScheme; label: string; description: string }[] = [
    {
      value: 'default',
      label: 'Default',
      description: 'Standard color palette with full contrast'
    },
    {
      value: 'high-contrast',
      label: 'High Contrast',
      description: 'Enhanced contrast for better accessibility'
    },
    {
      value: 'color-blind-friendly',
      label: 'Color Blind Friendly',
      description: 'Optimized colors for color vision deficiencies'
    },
  ];

  const fontSizeOptions = [
    { value: 'small' as const, label: 'Small', description: '14px - Compact view' },
    { value: 'medium' as const, label: 'Medium', description: '16px - Standard size' },
    { value: 'large' as const, label: 'Large', description: '18px - Enhanced readability' },
  ];

  const defaultTrigger = (
    <Button variant="outline" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme & Accessibility Settings
          </DialogTitle>
          <DialogDescription>
            Customize the appearance and accessibility options for Factory Pulse
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Theme Mode
            </Label>
            <div className="grid gap-2">
              {modeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${config.mode === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                    }`}
                  onClick={() => setMode(option.value)}
                >
                  <div className="flex-shrink-0">
                    {option.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{option.label}</p>
                      {config.mode === option.value && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                      {option.value === 'system' && (
                        <Badge variant="secondary" className="text-xs">
                          {isDark ? 'Dark' : 'Light'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Color Scheme */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Color Scheme
            </Label>
            <div className="grid gap-2">
              {colorSchemeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${config.colorScheme === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                    }`}
                  onClick={() => setColorScheme(option.value)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{option.label}</p>
                      {config.colorScheme === option.value && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Size
            </Label>
            <div className="grid gap-2">
              {fontSizeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${config.fontSize === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                    }`}
                  onClick={() => setFontSize(option.value)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{option.label}</p>
                      {config.fontSize === option.value && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Accessibility Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              Accessibility
            </Label>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <p className="text-sm font-medium">Reduced Motion</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimize animations and transitions for better accessibility
                </p>
              </div>
              <Switch
                checked={config.reducedMotion}
                onCheckedChange={setReducedMotion}
              />
            </div>
          </div>

          <Separator />

          {/* Reset Options */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Reset to Defaults</p>
              <p className="text-xs text-muted-foreground">
                Restore all theme settings to their default values
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact theme toggle for headers/toolbars
export function CompactThemeToggle() {
  return (
    <div className="flex items-center gap-1">
      <ThemeToggle variant="icon" size="sm" />
      <ThemeSettings
        trigger={
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-3 w-3" />
          </Button>
        }
      />
    </div>
  );
}

export default ThemeToggle;