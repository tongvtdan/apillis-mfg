import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useEffect, useState } from "react";
import { isDarkTheme } from "@/lib/theme";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Track the current theme
  const [isDark, setIsDark] = useState(false);

  // Listen for theme changes
  useEffect(() => {
    // Check current theme
    const checkTheme = () => {
      setIsDark(isDarkTheme());
    };

    // Initial check
    checkTheme();

    // Listen for custom theme change events
    const handleThemeChange = () => {
      checkTheme();
    };

    document.addEventListener('themeChanged', handleThemeChange);

    return () => {
      document.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-base-100">
          {children}
        </main>
      </div>
      <AppSidebar />
    </div>
  );
}