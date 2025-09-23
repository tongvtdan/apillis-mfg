import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
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
import { Dashboard } from "@/features/dashboard/components/Dashboard";

// This component displays the main dashboard with overview statistics and user-specific data
// It uses the authenticated user's profile data from the AuthContext
// The profile data is fetched from the public.users table and connected to the auth.users table
// through the user ID which is consistent between both tables after the migration
export default function DashboardPage() {
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
            {/* Use the new feature-based dashboard */}
            <Dashboard />
          </div>
        </div>
      </ActivityLogProvider>
    </ApprovalProvider>
  );
}