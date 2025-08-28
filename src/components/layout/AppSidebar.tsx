import { BarChart3, FileText, Home, ShoppingCart, Settings, Users, Package, Factory, UserCheck, Truck, Shield } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const mainMenuItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: Home
}, {
  title: "Projects",
  url: "/projects",
  icon: FileText
}, {
  title: "Customers",
  url: "/customers",
  icon: UserCheck
}, {
  title: "Suppliers",
  url: "/suppliers",
  icon: Truck
}, {
  title: "Purchase Orders",
  url: "/purchase-orders",
  icon: ShoppingCart
}, {
  title: "Inventory",
  url: "/inventory",
  icon: Package
}, {
  title: "Production",
  url: "/production",
  icon: Factory
}, {
  title: "Reports",
  url: "/reports",
  icon: BarChart3
}];

const settingsItems = [{
  title: "Settings",
  url: "/settings",
  icon: Settings
}];

const adminItems = [{
  title: "Admin",
  url: "/users",
  icon: Shield
}];

export function AppSidebar() {
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;

  // Check if user has admin access
  const isAdmin = profile?.role === 'management' || profile?.role === 'admin';

  // Debug logging to help troubleshoot role issues
  console.log('🔍 AppSidebar Debug:', {
    profile: profile,
    userRole: profile?.role,
    isAdmin: isAdmin,
    email: profile?.email
  });

  const isActive = (path: string) => {
    // Exact match
    if (currentPath === path) return true;

    // Project detail pages should highlight Projects menu item
    if (path === '/projects' && currentPath.startsWith('/project/')) return true;

    // RFQ detail pages should highlight Projects menu item too
    if (path === '/projects' && currentPath.startsWith('/rfq/')) return true;

    return false;
  };

  const getNavCls = ({
    isActive
  }: {
    isActive: boolean;
  }) => isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  return <Sidebar>
    <SidebarHeader className="border-b border-sidebar-border p-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">FP</span>
        </div>
        <div>
          <h4 className="font-semibold text-sidebar-foreground">Apillis
            Factory Pulse</h4>
          <p className="text-xs text-sidebar-foreground/70">The Heartbeat of Modern Manufacturing</p>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainMenuItems.map(item => <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Admin Menu - Only show for admin users */}
      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map(item => <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      <SidebarGroup>
        <SidebarGroupLabel>System</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {settingsItems.map(item => <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>;
}