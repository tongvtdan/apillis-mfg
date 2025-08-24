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