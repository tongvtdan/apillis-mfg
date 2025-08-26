import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { PendingTasks } from "@/components/dashboard/PendingTasks";
import { SearchFilterBar } from "@/components/dashboard/SearchFilterBar";
import { PriorityActionItems } from "@/components/dashboard/PriorityActionItems";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardData } from '@/hooks/useDashboardData';
import { useCustomers } from "@/hooks/useCustomers";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useInventory } from "@/hooks/useInventory";
import { useProductionOrders } from "@/hooks/useProductionOrders";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  Users,
  Bell,
  FolderOpen,
  Truck,
  ShoppingCart,
  Package,
  Factory,
  AlertTriangle
} from "lucide-react";

export default function Dashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  const { customers } = useCustomers();
  const { suppliers } = useSuppliers();
  const { purchaseOrders } = usePurchaseOrders();
  const { inventory } = useInventory();
  const { productionOrders } = useProductionOrders();
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Extract project data from dashboard summary
  const projects = dashboardData?.recent_projects || [];
  const projectsTotal = dashboardData?.projects?.total || 0;
  const projectsByStatus = dashboardData?.projects?.by_status || {};
  const loading = dashboardLoading;

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Filter projects based on search and filters - simplified for dashboard data
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search filter - only search basic fields available in dashboard data
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.project_id?.toLowerCase().includes(query) ||
        project.title?.toLowerCase().includes(query) ||
        project.customer_name?.toLowerCase().includes(query)
      );
    }

    // Priority filter - disabled for now as dashboard data doesn't include priority details
    // Status filter - disabled for now as dashboard data uses simplified status

    return filtered;
  }, [projects, searchQuery]);

  // Calculate detailed stats with attention-grabbing details
  const activeProjects = Object.entries(projectsByStatus)
    .filter(([status]) => !['shipped_closed', 'cancelled'].includes(status))
    .reduce((sum, [, count]) => sum + count, 0);

  const highPriorityProjects = 0; // Will be available when priority data is added
  const overdueProjects = 0; // Will be calculated from stage tracking

  // Purchase Orders analysis
  const pendingPOs = purchaseOrders.filter(po => po.status === 'pending').length;
  const urgentPOs = purchaseOrders.filter(po => po.priority === 'urgent').length;
  const overduePOs = purchaseOrders.filter(po => {
    if (!po.due_date) return false;
    return new Date(po.due_date) < new Date();
  }).length;

  // Inventory analysis
  const lowStockItems = inventory.filter(item =>
    item.current_stock <= (item.min_stock_level || 10)
  ).length;
  const outOfStockItems = inventory.filter(item => item.current_stock === 0).length;
  const criticalItems = inventory.filter(item =>
    item.current_stock < (item.min_stock_level || 10) * 0.5
  ).length;

  // Production analysis
  const activeProduction = productionOrders.filter(po => po.status === 'in_progress').length;
  const onHoldProduction = productionOrders.filter(po => po.status === 'on_hold').length;
  const urgentProduction = productionOrders.filter(po => po.priority === 'urgent').length;

  // Enhanced overview data with real data and important alerts
  const overviewData = [
    {
      title: "Projects",
      count: projectsTotal,
      activeCount: activeProjects,
      description: highPriorityProjects > 0
        ? `⚠️ ${highPriorityProjects} high priority`
        : `${activeProjects} active projects`,
      icon: FolderOpen,
      route: "/projects",
      color: highPriorityProjects > 0 ? "text-destructive" : "text-primary",
      bgColor: highPriorityProjects > 0 ? "bg-destructive/10" : "bg-primary/10",
      borderColor: highPriorityProjects > 0 ? "border-destructive/20" : "border-primary/20",
      alert: overdueProjects > 0 ? `${overdueProjects} overdue` : null
    },
    {
      title: "Purchase Orders",
      count: purchaseOrders.length,
      activeCount: pendingPOs,
      description: urgentPOs > 0
        ? `🚨 ${urgentPOs} urgent orders`
        : `${pendingPOs} pending orders`,
      icon: ShoppingCart,
      route: "/purchase-orders",
      color: urgentPOs > 0 ? "text-destructive" : "text-warning",
      bgColor: urgentPOs > 0 ? "bg-destructive/10" : "bg-warning/10",
      borderColor: urgentPOs > 0 ? "border-destructive/20" : "border-warning/20",
      alert: overduePOs > 0 ? `${overduePOs} overdue` : null
    },
    {
      title: "Production",
      count: productionOrders.length,
      activeCount: activeProduction,
      description: urgentProduction > 0
        ? `🚨 ${urgentProduction} urgent jobs`
        : `${activeProduction} in production`,
      icon: Factory,
      route: "/production",
      color: urgentProduction > 0 ? "text-destructive" : "text-accent",
      bgColor: urgentProduction > 0 ? "bg-destructive/10" : "bg-accent/10",
      borderColor: urgentProduction > 0 ? "border-destructive/20" : "border-accent/20",
      alert: onHoldProduction > 0 ? `${onHoldProduction} on hold` : null
    },
    {
      title: "Inventory",
      count: inventory.length,
      activeCount: lowStockItems,
      description: criticalItems > 0
        ? `🔴 ${criticalItems} critical items`
        : lowStockItems > 0
          ? `⚠️ ${lowStockItems} low stock`
          : `${inventory.length} items tracked`,
      icon: Package,
      route: "/inventory",
      color: criticalItems > 0 ? "text-destructive" : lowStockItems > 0 ? "text-warning" : "text-info",
      bgColor: criticalItems > 0 ? "bg-destructive/10" : lowStockItems > 0 ? "bg-warning/10" : "bg-info/10",
      borderColor: criticalItems > 0 ? "border-destructive/20" : lowStockItems > 0 ? "border-warning/20" : "border-info/20",
      alert: outOfStockItems > 0 ? `${outOfStockItems} out of stock` : null
    },
    {
      title: "Customers",
      count: customers?.length || 0,
      activeCount: customers?.filter(c => c.name).length || 0,
      description: `${customers?.length || 0} total customers`,
      icon: Users,
      route: "/customers",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
      alert: null
    },
    {
      title: "Suppliers",
      count: suppliers?.length || 0,
      activeCount: suppliers?.filter(s => s.is_active).length || 0,
      description: `${suppliers?.filter(s => s.is_active).length || 0} active suppliers`,
      icon: Truck,
      route: "/suppliers",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
      alert: null
    }
  ];

  // Sample notification count - in real app this would come from a notifications service
  const notificationCount = 3;

  return (
    <div className="space-y-6">
      {/* Header with user info and notifications */}
      <div className="bg-background border-b px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Factory Pulse</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span>{notificationCount} Notifications</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{profile?.display_name} ({profile?.role})</span>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
              <span>🌐 Projects</span>
              <span>📂 Documents</span>
              <span>📊 Analytics</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          assigneeFilter={assigneeFilter}
          onAssigneeFilterChange={setAssigneeFilter}
          projectsCount={projects.length}
        />

        {/* Priority Action Items */}
        <PriorityActionItems projects={[]} />

        {/* Overview Cards */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              System Overview
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Quick overview of projects, customers, suppliers, and operations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-8">
            {loading ? (
              // Loading skeleton for overview cards
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-muted rounded"></div>
                          <div className="w-20 h-4 bg-muted rounded"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="w-12 h-8 bg-muted rounded"></div>
                          <div className="w-32 h-3 bg-muted rounded"></div>
                        </div>
                      </div>
                      <div className="w-8 h-6 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              overviewData.map((item) => (
                <OverviewCard
                  key={item.title}
                  title={item.title}
                  count={item.count}
                  activeCount={item.activeCount}
                  description={item.description}
                  icon={item.icon}
                  route={item.route}
                  color={item.color}
                  bgColor={item.bgColor}
                  borderColor={item.borderColor}
                  alert={item.alert}
                  onClick={() => navigate(item.route)}
                />
              ))
            )}
          </div>
        </div>

        {/* Stats & Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <QuickStats
            activeProjects={activeProjects}
            highPriorityProjects={highPriorityProjects}
            overdueProjects={0}
          />

          {/* Pending Tasks */}
          <div className="lg:col-span-1">
            <PendingTasks />
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <RecentActivities />
          </div>
        </div>
      </div>
    </div>
  );
}
