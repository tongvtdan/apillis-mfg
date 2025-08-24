import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

  // Get top 3 priority projects that need immediate action
  const getTopPriorityProjects = useMemo(() => {
    const urgentProjects = filteredProjects
      .filter(p =>
        // Filter for active projects that need action
        ['inquiry_received', 'technical_review', 'supplier_rfq_sent', 'quoted'].includes(p.status) &&
        // Include projects with high priority, overdue, or urgent status  
        (p.priority === 'high' || p.priority === 'urgent' || p.days_in_stage > 7)
      )
      .sort((a, b) => {
        // Priority scoring for sorting (higher score = more urgent)
        const getPriorityScore = (project: Project) => {
          let score = 0;
          // Priority weight
          if (project.priority === 'urgent') score += 100;
          else if (project.priority === 'high') score += 80;
          else if (project.priority === 'medium') score += 40;
          else score += 20;

          // Days in stage weight (more days = higher urgency)
          if (project.days_in_stage > 14) score += 50;
          else if (project.days_in_stage > 7) score += 30;
          else if (project.days_in_stage > 3) score += 10;

          // Status urgency weight
          if (project.status === 'quoted') score += 25; // Needs decision
          else if (project.status === 'technical_review') score += 20; // Blocking workflow
          else if (project.status === 'inquiry_received') score += 15; // Needs initial action

          return score;
        };

        return getPriorityScore(b) - getPriorityScore(a);
      })
      .slice(0, 3);

    // If we don't have enough urgent projects, fill with recent active projects
    if (urgentProjects.length < 3) {
      const remainingSlots = 3 - urgentProjects.length;
      const urgentIds = new Set(urgentProjects.map(p => p.id));
      const recentActiveProjects = filteredProjects
        .filter(p =>
          ['inquiry_received', 'technical_review', 'supplier_rfq_sent', 'quoted'].includes(p.status) &&
          !urgentIds.has(p.id)
        )
        .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
        .slice(0, remainingSlots);

      return [...urgentProjects, ...recentActiveProjects];
    }

    return urgentProjects;
  }, [filteredProjects]);

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

        {/* Priority Action Items */}
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Priority Action Items
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Projects requiring immediate attention based on priority, urgency, and time in stage
            </p>
          </div>
          <div className="space-y-3">
            {getTopPriorityProjects.length > 0 ? (
              getTopPriorityProjects.map((project) => (
                <ProjectSummaryCard key={project.id} project={project} showUrgencyIndicators={true} />
              ))
            ) : (
              <Card className="p-6 text-center border-dashed">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-8 w-8" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs">No urgent projects requiring immediate action.</p>
                </div>
              </Card>
            )}
          </div>
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

            {/* Pending Tasks */}
            <PendingTasks />

            {/* Recent Activities */}
            <RecentActivities />
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Summary Card Component
interface ProjectSummaryCardProps {
  project: Project;
  showUrgencyIndicators?: boolean;
}

function ProjectSummaryCard({ project, showUrgencyIndicators = false }: ProjectSummaryCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getUrgencyLevel = () => {
    let level = 'normal';
    let reasons = [];

    if (project.priority === 'urgent') {
      level = 'critical';
      reasons.push('Urgent priority');
    } else if (project.priority === 'high') {
      level = 'high';
      reasons.push('High priority');
    }

    if (project.days_in_stage > 14) {
      level = 'critical';
      reasons.push(`${project.days_in_stage} days in stage`);
    } else if (project.days_in_stage > 7) {
      if (level !== 'critical') level = 'high';
      reasons.push(`${project.days_in_stage} days overdue`);
    }

    if (project.status === 'quoted') {
      reasons.push('Awaiting customer decision');
    } else if (project.status === 'technical_review') {
      reasons.push('Review pending');
    }

    return { level, reasons };
  };

  const urgency = getUrgencyLevel();

  // Mock file count - in real app this would come from documents/attachments
  const fileCount = Math.floor(Math.random() * 6) + 1;
  const hasRisks = project.priority === 'high' && Math.random() > 0.5;
  const hasApprovals = project.status !== 'inquiry_received' && Math.random() > 0.3;

  const cardClassName = showUrgencyIndicators ? (
    urgency.level === 'critical' ? 'border-red-200 bg-red-50/50 ring-1 ring-red-200' :
      urgency.level === 'high' ? 'border-orange-200 bg-orange-50/50 ring-1 ring-orange-200' :
        'border-blue-200 bg-blue-50/50'
  ) : '';

  return (
    <div 
      className={`flex items-center gap-4 p-4 bg-muted/30 rounded-lg border ${cardClassName} transition-all duration-200 hover:shadow-md hover:bg-muted/50 cursor-pointer`}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-2 flex-1">
        <span className={getPriorityColor(project.priority)}>
          {getPriorityIcon(project.priority)}
        </span>
        <span className="font-medium">{project.project_id}</span>
        <span className="text-muted-foreground">–</span>
        <span className="font-medium">{project.title}</span>
        <Badge
          variant={project.priority === 'urgent' ? 'destructive' : project.priority === 'high' ? 'secondary' : 'outline'}
          className="text-xs"
        >
          {project.priority} priority
        </Badge>

        {/* Urgency indicators */}
        {showUrgencyIndicators && urgency.reasons.length > 0 && (
          <div className="flex items-center gap-2">
            {urgency.level === 'critical' && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                URGENT
              </Badge>
            )}
            {urgency.level === 'high' && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                ACTION NEEDED
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

        {/* Time in stage indicator */}
        {showUrgencyIndicators && (
          <div className={`flex items-center gap-1 ${project.days_in_stage > 7 ? 'text-red-600' : project.days_in_stage > 3 ? 'text-orange-600' : 'text-muted-foreground'}`}>
            <Clock className="h-3 w-3" />
            <span>{project.days_in_stage}d</span>
          </div>
        )}

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

      {/* Action reasons tooltip for urgency */}
      {showUrgencyIndicators && urgency.reasons.length > 0 && (
        <div className="text-xs text-muted-foreground ml-2">
          <span title={urgency.reasons.join(' • ')}>
            ℹ️
          </span>
        </div>
      )}
    </div>
  );
}