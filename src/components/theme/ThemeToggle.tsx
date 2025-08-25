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

interface ThemeToggleProps {
  variant?: 'button' | 'icon' | 'dropdown';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'icon', size = 'default', showLabel = false }: ThemeToggleProps) {
  // For the adaptive theme, we don't need to toggle between light/dark
  // The theme adapts automatically based on system preference
  const getIcon = () => {
    return <Monitor className="h-4 w-4" />;
  };

  const getLabel = () => {
    return 'Adaptive';
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size}
        className="gap-2"
        disabled
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
      className="rounded-full"
      disabled
      aria-label="Adaptive theme (automatically adjusts to system preference)"
    >
      {getIcon()}
    </Button>
  );
}

interface ThemeDropdownProps {
  align?: 'start' | 'center' | 'end';
}

export function ThemeDropdown({ align = 'end' }: ThemeDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" disabled>
          <Monitor className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" disabled>
          <Monitor className="h-4 w-4" />
          <span>Adaptive</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            Auto
          </Badge>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ThemeSettingsProps {
  trigger?: React.ReactNode;
}

export function ThemeSettings({ trigger }: ThemeSettingsProps) {
  const [open, setOpen] = React.useState(false);

  const defaultTrigger = (
    <Button variant="outline" size="icon" disabled>
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
            Theme Settings
          </DialogTitle>
          <DialogDescription>
            Factory Pulse uses an adaptive theme that automatically adjusts to your system preference.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              The adaptive theme automatically switches between light and dark modes based on your system settings.
              No manual configuration is needed.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">System Preference</p>
              <p className="text-xs text-muted-foreground">
                Theme adapts to your operating system's light/dark mode setting
              </p>
            </div>
            <Monitor className="h-5 w-5 text-muted-foreground" />
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
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <Settings className="h-3 w-3" />
          </Button>
        }
      />
    </div>
  );
}

export default ThemeToggle;