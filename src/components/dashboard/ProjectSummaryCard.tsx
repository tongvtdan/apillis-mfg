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

  const cardClassName = showUrgencyIndicators ? (
    urgency.level === 'critical' ? 'border-destructive shadow-md shadow-destructive/10 bg-destructive/5 ring-1 ring-destructive/20' :
      urgency.level === 'high' ? 'border-warning shadow-md shadow-warning/10 bg-warning/5 ring-1 ring-warning/20' :
        'border-primary/20 bg-primary/5'
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
          className={`text-xs font-bold ${project.priority === 'medium' ? 'bg-warning/10 text-warning' : project.priority === 'low' ? 'bg-success/10 text-success' : ''}`}
        >
          {project.priority} priority
        </Badge>

        {/* Urgency indicators */}
        {showUrgencyIndicators && urgency.reasons.length > 0 && (
          <div className="flex items-center gap-2">
            {urgency.level === 'critical' && (
              <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                URGENT
              </Badge>
            )}
            {urgency.level === 'high' && (
              <Badge variant="secondary" className="text-xs font-bold">
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
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${project.days_in_stage > 7 ? 'bg-destructive/10 text-destructive font-bold' : project.days_in_stage > 3 ? 'bg-warning/10 text-warning font-bold' : 'bg-muted text-muted-foreground'}`}>
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