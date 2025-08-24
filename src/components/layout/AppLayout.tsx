import { SidebarProvider } from "@/components/ui/sidebar";
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-theme-background text-theme-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col bg-theme-background overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto bg-theme-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}