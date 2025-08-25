import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Paperclip,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Project } from "@/types/project";

interface ProjectSummaryCardProps {
  project: Project;
  showUrgencyIndicators?: boolean;
}

export function ProjectSummaryCard({ project, showUrgencyIndicators = false }: ProjectSummaryCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-destructive';
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
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

  // Enhanced list item classes based on urgency level
  const getListItemClasses = () => {
    if (!showUrgencyIndicators) return 'enhanced-list-item enhanced-list-item-normal';

    switch (urgency.level) {
      case 'critical': return 'enhanced-list-item enhanced-list-item-urgent border-l-4 border-l-red-500 bg-red-50/10 dark:bg-red-950/20 shadow-md';
      case 'high': return 'enhanced-list-item enhanced-list-item-high border-l-4 border-l-orange-500 bg-orange-50/10 dark:bg-orange-950/10';
      default: return 'enhanced-list-item enhanced-list-item-normal';
    }
  };

  // Get status badge class based on priority
  const getStatusBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'status-badge status-badge-sm status-urgent';
      case 'high': return 'status-badge status-badge-sm status-high';
      case 'medium': return 'status-badge status-badge-sm status-medium';
      case 'low': return 'status-badge status-badge-sm status-low';
      default: return 'status-badge status-badge-sm';
    }
  };

  // Get priority indicator class
  const getPriorityIndicatorClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'priority-indicator priority-indicator-urgent';
      case 'high': return 'priority-indicator priority-indicator-high';
      case 'medium': return 'priority-indicator priority-indicator-medium';
      case 'low': return 'priority-indicator priority-indicator-low';
      default: return 'priority-indicator';
    }
  };

  return (
    <div
      className={`flex items-center gap-4 ${getListItemClasses()} cursor-pointer hover:shadow-md`}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-2 flex-1">
        <div className={getPriorityIndicatorClass(project.priority)}></div>
        <span className="font-medium">{project.project_id}</span>
        <span className="text-muted-foreground">–</span>
        <span className="font-medium">{project.title}</span>

        <div className={getStatusBadgeClass(project.priority)}>
          {project.priority} priority
        </div>

        {/* Urgency indicators */}
        {showUrgencyIndicators && urgency.reasons.length > 0 && (
          <div className="flex items-center gap-2">
            {urgency.level === 'critical' && (
              <div className="status-badge status-badge-sm status-urgent">
                URGENT
              </div>
            )}
            {urgency.level === 'high' && (
              <div className="status-badge status-badge-sm status-high">
                ACTION NEEDED
              </div>
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
          <div className={`flex items-center gap-1 rounded-full text-xs ${project.days_in_stage > 7
            ? 'status-badge status-badge-sm status-overdue'
            : project.days_in_stage > 3
              ? 'status-badge status-badge-sm status-medium'
              : 'status-badge status-badge-sm'
            }`}>
            <Clock className="h-3 w-3" />
            <span>{project.days_in_stage}d</span>
          </div>
        )}

        {hasRisks && (
          <div className="flex items-center gap-1 text-warning">
            <AlertTriangle className="h-3 w-3" />
            <span>2 risks logged</span>
          </div>
        )}
        {hasApprovals && (
          <div className="flex items-center gap-1 text-success">
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