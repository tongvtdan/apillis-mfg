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
import { useAuth } from "@/contexts/AuthContext";
import { DashboardDebugger } from "@/components/dashboard/DashboardDebugger";
import { ApprovalDashboard } from "@/components/approval/ApprovalDashboard";
import {
  TrendingUp,
  FolderOpen,
  AlertTriangle,
  Bug,
  BarChart3,
  Workflow
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const [debugMode, setDebugMode] = useState(false);
  const [directProjects, setDirectProjects] = useState([]);
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

  useEffect(() => {
    // Debug logging
    console.log("Dashboard Data:", dashboardData);
    console.log("Auth Context User:", user);
    console.log("Auth Context Profile:", profile);

    // Attempt to directly query projects for debugging
    const fetchProjects = async () => {
      if (profile?.organization_id) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .limit(10);

          if (error) {
            console.error("Direct projects query error:", error);
          } else {
            console.log("Direct projects query result:", data);
            setDirectProjects(data || []);
          }
        } catch (err) {
          console.error("Failed to fetch projects directly:", err);
        }
      }
    };

    fetchProjects();
  }, [dashboardData, profile, user]);

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
    <div className="space-y-6">
      {/* Header with title and debug toggle */}
      <div className="bg-background border-b px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Factory Pulse</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Bug className="h-4 w-4" />
              <span>{debugMode ? 'Hide Debug' : 'Debug'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        {/* Debugging Info */}
        {debugMode && (
          <div className="mb-6">
            <DashboardDebugger />
          </div>
        )}

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
              <Bell className="h-6 w-6 text-primary" />
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

        {/* Debug Section - Direct Projects Query Result */}
        {debugMode && directProjects.length > 0 && (
          <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Direct Projects Query Result ({directProjects.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-yellow-700">ID</th>
                    <th className="px-4 py-2 text-left text-yellow-700">Project ID</th>
                    <th className="px-4 py-2 text-left text-yellow-700">Title</th>
                    <th className="px-4 py-2 text-left text-yellow-700">Organization ID</th>
                  </tr>
                </thead>
                <tbody>
                  {directProjects.map((project: any) => (
                    <tr key={project.id} className="border-t border-yellow-100">
                      <td className="px-4 py-2 text-yellow-800">{project.id}</td>
                      <td className="px-4 py-2 text-yellow-800">{project.project_id}</td>
                      <td className="px-4 py-2 text-yellow-800">{project.title}</td>
                      <td className="px-4 py-2 text-yellow-800">{project.organization_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Debug Info for Dashboard Data */}
        {debugMode && dashboardData?.debug && (
          <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Dashboard Function Debug Info</h3>
            <pre className="text-xs overflow-auto max-h-96 bg-blue-100 p-2 rounded">
              {JSON.stringify(dashboardData.debug, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}