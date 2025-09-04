import { BarChart3, FileText, Home, ShoppingCart, Settings, Users, Package, Factory, UserCheck, Truck, Shield } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/ui/sidebar";
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

  // Convert menu items to sidebar items format
  const sidebarItems = [
    {
      label: "Main Menu",
      children: mainMenuItems.map(item => ({
        label: item.title,
        href: item.url,
        icon: <item.icon className="h-4 w-4" />
      }))
    },
    ...(isAdmin ? [{
      label: "Administration",
      children: adminItems.map(item => ({
        label: item.title,
        href: item.url,
        icon: <item.icon className="h-4 w-4" />
      }))
    }] : []),
    {
      label: "System",
      children: settingsItems.map(item => ({
        label: item.title,
        href: item.url,
        icon: <item.icon className="h-4 w-4" />
      }))
    }
  ];

  return (
    <div className="drawer-side">
      <aside className="min-h-screen w-80 bg-base-200 text-base-content">
        <div className="p-4">
          {/* Header */}
          <div className="border-b border-base-300 pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-content font-bold text-sm">FP</span>
              </div>
              <div>
                <h4 className="font-semibold text-base-content">Apillis Factory Pulse</h4>
                <p className="text-xs text-base-content/70">The Heartbeat of Modern Manufacturing</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <ul className="menu bg-base-200 w-56">
            {sidebarItems.map((group, groupIndex) => (
              <li key={groupIndex}>
                <div className="menu-title">{group.label}</div>
                {group.children && (
                  <ul className="menu menu-compact">
                    {group.children.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <NavLink
                          to={item.href!}
                          className={({ isActive }) =>
                            isActive ? "menu-active" : ""
                          }
                        >
                          {item.icon}
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}