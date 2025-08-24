import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { PendingTasks } from "@/components/dashboard/PendingTasks";
import { SearchFilterBar } from "@/components/dashboard/SearchFilterBar";
import { PriorityActionItems } from "@/components/dashboard/PriorityActionItems";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { Card, CardContent } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjects";
import { useCustomers } from "@/hooks/useCustomers";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  Users,
  Bell,
  FolderOpen,
  Truck,
  ShoppingCart,
  Package,
  Factory
} from "lucide-react";

export default function Dashboard() {
  const { projects, loading } = useProjects();
  const { customers } = useCustomers();
  const { suppliers } = useSuppliers();
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.project_id?.toLowerCase().includes(query) ||
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.customer?.name?.toLowerCase().includes(query) ||
        project.customer?.company?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Assignee filter
    if (assigneeFilter === "mine") {
      filtered = filtered.filter(project => project.assignee_id === profile?.user_id);
    } else if (assigneeFilter === "overdue") {
      filtered = filtered.filter(project => project.days_in_stage > 7);
    }

    return filtered;
  }, [projects, searchQuery, priorityFilter, statusFilter, assigneeFilter, profile?.user_id]);

  // Calculate stats from filtered projects
  const activeProjects = filteredProjects.filter(p =>
    ['inquiry_received', 'technical_review', 'supplier_rfq_sent', 'quoted'].includes(p.status)
  ).length;

  const highPriorityProjects = filteredProjects.filter(p => p.priority === 'high').length;
  const overdueProjects = filteredProjects.filter(p => p.days_in_stage > 7).length;

  // Overview data calculations
  const overviewData = [
    {
      title: "Projects",
      count: projects.length,
      activeCount: activeProjects,
      description: `${activeProjects} active projects`,
      icon: FolderOpen,
      route: "/projects",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Customers",
      count: customers?.length || 0,
      activeCount: customers?.filter(c => c.name).length || 0,
      description: `${customers?.length || 0} total customers`,
      icon: Users,
      route: "/customers",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Suppliers",
      count: suppliers?.length || 0,
      activeCount: suppliers?.filter(s => s.is_active).length || 0,
      description: `${suppliers?.filter(s => s.is_active).length || 0} active suppliers`,
      icon: Truck,
      route: "/suppliers",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Purchase Orders",
      count: 24, // Mock data - in real app would come from PO service
      activeCount: 8,
      description: "8 pending orders",
      icon: ShoppingCart,
      route: "/purchase-orders",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      title: "Inventory",
      count: 156, // Mock data - in real app would come from inventory service
      activeCount: 12,
      description: "12 low stock items",
      icon: Package,
      route: "/inventory",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    },
    {
      title: "Production",
      count: 8, // Mock data - in real app would come from production service
      activeCount: 3,
      description: "3 in production",
      icon: Factory,
      route: "/production",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200"
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
          projectsCount={filteredProjects.length}
        />

        {/* Priority Action Items */}
        <PriorityActionItems projects={filteredProjects} />

        {/* Overview Cards */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
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
            overdueProjects={overdueProjects}
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
