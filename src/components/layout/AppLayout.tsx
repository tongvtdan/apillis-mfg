import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-base-100 text-base-content">
        <AppSidebar />
        <div className="flex-1 flex flex-col bg-base-100">
          <AppHeader />
          <main className="flex-1 overflow-auto pt-14 bg-base-100">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}