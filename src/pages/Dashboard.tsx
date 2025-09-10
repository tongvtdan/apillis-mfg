import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { PendingTasks } from "@/components/dashboard/PendingTasks";
import { SearchFilterBar } from "@/components/dashboard/SearchFilterBar";
import { PriorityActionItems } from "@/components/dashboard/PriorityActionItems";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { ProjectTypeChart } from "@/components/dashboard/ProjectTypeChart";
import { ProjectStageChart } from "@/components/dashboard/ProjectStageChart";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from "@/core/auth";
import { ApprovalProvider } from "@/core/approvals/ApprovalProvider";
import { ActivityLogProvider } from "@/core/activity-log/ActivityLogProvider";
import { ApprovalDashboard } from "@/components/approval/ApprovalDashboard";
import {
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Workflow
} from "lucide-react";
import { workflowStageService } from "@/services/workflowStageService";
import { Button } from "@/components/ui/button";

// This component displays the main dashboard with overview statistics and user-specific data
// It uses the authenticated user's profile data from the AuthContext
// The profile data is fetched from the public.users table and connected to the auth.users table
// through the user ID which is consistent between both tables after the migration
export default function Dashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [workflowStages, setWorkflowStages] = useState([]);
  const [chartView, setChartView] = useState<'type' | 'stage'>('stage'); // New state for chart view toggle

  // Extract project data from dashboard summary
  const projects = dashboardData?.recent_projects || [];
  const projectsTotal = dashboardData?.projects?.total || 0;
  const projectsByStatus = dashboardData?.projects?.by_status || {};
  const projectsByType = dashboardData?.projects?.by_type || {};
  const projectsByPriority = dashboardData?.projects?.by_priority || {};
  const projectsByStage = dashboardData?.projects?.by_stage || {};
  const loading = dashboardLoading;


  // Fetch workflow stages
  useEffect(() => {
    const fetchWorkflowStages = async () => {
      try {
        const stages = await workflowStageService.getWorkflowStages();
        setWorkflowStages(stages);
      } catch (error) {
        console.error("Error fetching workflow stages:", error);
      }
    };

    fetchWorkflowStages();
  }, []);

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
    .reduce((sum, [, count]) => sum + (count as number), 0);

  const highPriorityProjects = Object.entries(projectsByPriority)
    .filter(([priority]) => ['high', 'urgent'].includes(priority))
    .reduce((sum, [, count]) => sum + (count as number), 0);

  const overdueProjects = projects.filter(p =>
    p.days_in_stage && p.days_in_stage > 7
  ).length;

  // Prepare stage distribution data for the chart
  const stageDistributionData = Object.entries(projectsByStage)
    .map(([stageId, count]) => {
      const stage = workflowStages.find(s => s.id === stageId);
      return stage ? { stage, count } : null;
    })
    .filter(Boolean) as { stage: any; count: number }[];

  // Enhanced overview data with real data and important alerts - only Projects section
  const overviewData = [];

  return (
    <ApprovalProvider>
      <ActivityLogProvider>
        <div className="space-y-6">
          {/* Header with title */}
          <div className="bg-background border-b px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Factory Pulse</h1>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6">

            {/* Search and Filter Bar - focused on projects */}
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
            <PriorityActionItems projects={projects} />

            {/* Projects Overview Section */}
            <div className="mt-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Projects Overview
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Quick overview of your projects and their status. Other sections can be accessed through the sidebar menu.
                </p>
              </div>

              {/* Chart View Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={chartView === 'type' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartView('type')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  By Type
                </Button>
                <Button
                  variant={chartView === 'stage' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartView('stage')}
                  className="flex items-center gap-2"
                >
                  <Workflow className="h-4 w-4" />
                  By Stage
                </Button>
              </div>

              {/* Project Distribution Visualization */}
              {!loading && (
                <>
                  {chartView === 'type' && Object.keys(projectsByType).length > 0 && (
                    <div className="mb-8">
                      <ProjectTypeChart data={projectsByType} />
                    </div>
                  )}

                  {chartView === 'stage' && stageDistributionData.length > 0 && (
                    <div className="mb-8">
                      <ProjectStageChart data={stageDistributionData} />
                    </div>
                  )}
                </>
              )}

              {/* Approvals Dashboard */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                  Approvals
                </h2>
                <ApprovalDashboard />
              </div>
            </div>

            {/* Projects Stats and Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats for Projects */}
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
      </ActivityLogProvider>
    </ApprovalProvider>
  );
}