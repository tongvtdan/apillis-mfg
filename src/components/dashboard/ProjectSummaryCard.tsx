import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Paperclip,
  Clock,
  AlertTriangle,
  CheckCircle,
  Truck
} from "lucide-react";
import { Project } from "@/types/project";
import { useUserDisplayName } from "@/hooks/useUsers";
import { format, isBefore, parseISO } from "date-fns";
import { PRIORITY_COLORS } from "@/types/project";

interface ProjectSummaryCardProps {
  project: Project;
  showUrgencyIndicators?: boolean;
}

export function ProjectSummaryCard({ project, showUrgencyIndicators = false }: ProjectSummaryCardProps) {
  const navigate = useNavigate();

  // Get assignee display name - use new field names with fallback
  const assigneeId = project.assigned_to || project.assignee_id;
  const assigneeDisplayName = useUserDisplayName(assigneeId);

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
    let reasons: string[] = [];

    // If we already have urgency reasons from PriorityActionItems, use those
    if ('urgency_reasons' in project && Array.isArray(project.urgency_reasons)) {
      // For projects scored by PriorityActionItems
      const urgencyScore = (project as any).urgency_score || 0;

      if (urgencyScore >= 90) {
        level = 'critical';
      } else if (urgencyScore >= 70) {
        level = 'high';
      } else if (urgencyScore >= 40) {
        level = 'medium';
      }

      return { level, reasons: (project as any).urgency_reasons || [] };
    }

    // Use priority_level with fallback to priority
    const priority = project.priority_level || project.priority;

    if (priority === 'urgent') {
      level = 'critical';
      reasons.push('Urgent priority');
    } else if (priority === 'high') {
      level = 'high';
      reasons.push('High priority');
    }

    if (project.days_in_stage && project.days_in_stage > 14) {
      level = 'critical';
      reasons.push(`${project.days_in_stage} days in stage`);
    } else if (project.days_in_stage && project.days_in_stage > 7) {
      if (level !== 'critical') level = 'high';
      reasons.push(`${project.days_in_stage} days overdue`);
    }

    // Check if delivery date is approaching or past due
    if (project.estimated_delivery_date) {
      const deliveryDate = parseISO(project.estimated_delivery_date);
      const today = new Date();
      const daysUntilDelivery = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDelivery < 0) {
        level = 'critical';
        reasons.push(`Delivery overdue by ${Math.abs(daysUntilDelivery)} days`);
      } else if (daysUntilDelivery <= 3) {
        if (level !== 'critical') level = 'high';
        reasons.push(`Delivery due in ${daysUntilDelivery} days`);
      } else if (daysUntilDelivery <= 7) {
        if (level !== 'critical' && level !== 'high') level = 'medium';
        reasons.push(`Delivery due in ${daysUntilDelivery} days`);
      }
    }

    // Check current stage status for urgency indicators
    if (project.current_stage === 'quoted') {
      reasons.push('Awaiting customer decision');
    } else if (project.current_stage === 'technical_review') {
      reasons.push('Review pending');
    }

    return { level, reasons };
  };

  const urgency = getUrgencyLevel();

  // Mock file count - in real app this would come from documents/attachments
  const fileCount = Math.floor(Math.random() * 6) + 1;
  const hasRisks = project.priority === 'high' && Math.random() > 0.5;
  const hasApprovals = project.current_stage !== 'inquiry_received' && Math.random() > 0.3;

  // Enhanced list item classes based on urgency level
  const getListItemClasses = () => {
    if (!showUrgencyIndicators) return 'list-item list-item-normal';

    switch (urgency.level) {
      case 'critical': return 'list-item list-item-urgent border-l-4 border-l-red-500 bg-red-50/10 dark:bg-red-950/20 shadow-md';
      case 'high': return 'list-item list-item-high border-l-4 border-l-orange-500 bg-orange-50/10 dark:bg-orange-950/10';
      case 'medium': return 'list-item list-item-medium border-l-4 border-l-yellow-500 bg-yellow-50/10 dark:bg-yellow-950/10';
      default: return 'list-item list-item-normal';
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
      case 'normal': return 'priority-indicator priority-indicator-normal';
      case 'low': return 'priority-indicator priority-indicator-low';
      default: return 'priority-indicator';
    }
  };

  // Check if delivery date is overdue
  const isDeliveryOverdue = project.estimated_delivery_date &&
    isBefore(parseISO(project.estimated_delivery_date), new Date());

  return (
    <div
      className={`flex items-center gap-4 ${getListItemClasses()} cursor-pointer hover:shadow-md`}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-2 flex-1">
        <div className={getPriorityIndicatorClass(project.priority_level || project.priority)}></div>
        <span className="font-medium">{project.project_id}</span>
        <span className="text-muted-foreground">–</span>
        <span className="font-medium">{project.title}</span>

        <div className={getStatusBadgeClass(project.priority_level || project.priority)}>
          {project.priority_level || project.priority} priority
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
            {urgency.level === 'medium' && (
              <div className="status-badge status-badge-sm status-medium">
                ATTENTION
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <AssigneeDisplay assigneeId={assigneeId} displayName={assigneeDisplayName} />
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
        {showUrgencyIndicators && project.days_in_stage && (
          <div className={`flex items-center gap-1 rounded-full text-xs ${project.days_in_stage > 7
            ? 'status-badge status-badge-sm status-overdue'
            : project.days_in_stage > 3
              ? 'status-badge status-badge-sm status-medium'
              : 'status-badge status-badge-sm'
            }`}>
            <Clock className="h-3 w-3" />
            <span>{project.days_in_stage}d in stage</span>
          </div>
        )}

        {/* Estimated delivery date */}
        {project.estimated_delivery_date && (
          <div className={`flex items-center gap-1 rounded-full text-xs px-2 py-0.5 ${isDeliveryOverdue
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
            <Truck className="h-3 w-3" />
            <span>
              {isDeliveryOverdue ? 'Due: ' : 'Est: '}
              {format(parseISO(project.estimated_delivery_date), 'MMM d')}
            </span>
          </div>
        )}

        {/* Additional urgency information as tooltip */}
        {showUrgencyIndicators && urgency.reasons.length > 0 && (
          <div
            className="text-xs text-muted-foreground ml-2 cursor-help"
            title={urgency.reasons.join(' • ')}
          >
            <div className="flex items-center gap-1">
              <AlertTriangle className={`h-4 w-4 ${urgency.level === 'critical' ? 'text-red-500' :
                urgency.level === 'high' ? 'text-orange-500' :
                  'text-yellow-500'
                }`} />
              <span className="sr-only">Urgency information</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component to display assignee
function AssigneeDisplay({ assigneeId, displayName }: { assigneeId?: string; displayName: string }) {
  if (!assigneeId) {
    return <span>Unassigned</span>;
  }

  return <span>{displayName}</span>;
}