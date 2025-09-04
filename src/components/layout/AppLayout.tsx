import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useEffect, useState } from "react";

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
      const html = document.documentElement;
      const isDarkTheme =
        html.getAttribute('data-theme') === 'factory-pulse-dark' ||
        html.classList.contains('dark');
      setIsDark(isDarkTheme);
    };

    // Initial check
    checkTheme();

    // Set up an observer to watch for attribute changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    return () => observer.disconnect();
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