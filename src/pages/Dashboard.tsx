import { useState, useMemo } from "react";
import { WorkflowKanban } from "@/components/dashboard/WorkflowKanban";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { PendingTasks } from "@/components/dashboard/PendingTasks";
import { SearchFilterBar } from "@/components/dashboard/SearchFilterBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Users,
  Bell,
  Calendar,
  Building2,
  Paperclip
} from "lucide-react";
import { Project } from "@/types/project";

export default function Dashboard() {
  const { projects, loading } = useProjects();
  const { profile } = useAuth();

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

  // Sample notification count - in real app this would come from a notifications service
  const notificationCount = 3;

  return (
    <div className="space-y-6">
      {/* Header with user info and notifications */}
      <div className="bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Factory Pulse</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span>{notificationCount} Notifications</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{profile?.display_name} ({profile?.role})</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>🌐 Projects</span>
              <span>📂 Documents</span>
              <span>📊 Analytics</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
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

        {/* Featured Projects Summary */}
        <div className="mt-6 space-y-3">
          {filteredProjects.slice(0, 3).map((project) => (
            <ProjectSummaryCard key={project.id} project={project} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Kanban Board - Takes up 3 columns */}
          <div className="lg:col-span-3">
            <WorkflowKanban filteredProjects={filteredProjects} />
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Projects</span>
                  <Badge variant="outline">{activeProjects}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">High Priority</span>
                  <Badge variant={highPriorityProjects > 0 ? "destructive" : "outline"}>
                    {highPriorityProjects}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overdue</span>
                  <Badge variant={overdueProjects > 0 ? "destructive" : "outline"}>
                    {overdueProjects}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <RecentActivities />

            {/* Pending Tasks */}
            <PendingTasks />
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Summary Card Component
interface ProjectSummaryCardProps {
  project: Project;
}

function ProjectSummaryCard({ project }: ProjectSummaryCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  // Mock file count - in real app this would come from documents/attachments
  const fileCount = Math.floor(Math.random() * 6) + 1;
  const hasRisks = project.priority === 'high' && Math.random() > 0.5;
  const hasApprovals = project.status !== 'inquiry_received' && Math.random() > 0.3;

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className={getPriorityColor(project.priority)}>
          {getPriorityIcon(project.priority)}
        </span>
        <span className="font-medium">{project.project_id}</span>
        <span className="text-muted-foreground">–</span>
        <span>{project.title}</span>
        <Badge variant="outline" className="text-xs">
          {project.priority} priority
        </Badge>
      </div>

      <div className="flex items-center gap-4 ml-auto text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{project.assignee_id || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(project.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Paperclip className="h-3 w-3" />
          <span>{fileCount} files</span>
        </div>
        {hasRisks && (
          <div className="flex items-center gap-1 text-orange-600">
            <AlertTriangle className="h-3 w-3" />
            <span>2 risks logged</span>
          </div>
        )}
        {hasApprovals && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Eng: Approved</span>
          </div>
        )}
      </div>
    </div>
  );
}