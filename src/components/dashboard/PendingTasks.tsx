import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectManagement } from "@/features/project-management/hooks";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, AlertCircle, FileText, Users, CheckCircle, Calendar } from "lucide-react";
import { PRIORITY_COLORS } from "@/types/project";

interface Task {
  id: string;
  title: string;
  priority: string;
  dueDate: string;
  status: string;
  type: 'review' | 'project' | 'rfq';
  projectId?: string;
  estimatedDeliveryDate?: string;
}

export function PendingTasks() {
  const { projects, loading } = useProjectManagement();
  const navigate = useNavigate();

  // Generate pending tasks from projects data
  const pendingTasks = projects
    .filter(p => ['inquiry_received', 'technical_review'].includes(p.current_stage))
    .sort((a, b) => {
      // Sort by priority first (high first), then by updated date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority_level] - priorityOrder[a.priority_level];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 10)
    .map(project => ({
      id: project.id,
      title: project.current_stage === 'inquiry_received'
        ? `Review new inquiry: ${project.title}`
        : `Complete technical review: ${project.title}`,
      priority: project.priority_level,
      dueDate: formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }),
      status: project.current_stage,
      type: 'project' as const,
      projectId: project.id,
      estimatedDeliveryDate: project.estimated_delivery_date
    }));

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-l-red-500';
      case 'high': return 'border-l-4 border-l-orange-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Clock className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'review': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'project': return <FileText className="h-4 w-4 text-green-500" />;
      case 'rfq': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleTaskClick = (task: Task) => {
    if (task.projectId) {
      navigate(`/projects/${task.projectId}`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-muted animate-pulse">
                  <div className="h-4 w-4 bg-muted-foreground/20 rounded"></div>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer ${getPriorityClass(task.priority)}`}
            onClick={() => handleTaskClick(task)}
          >
            <div className="p-2 rounded-full bg-muted">
              {getTaskIcon(task.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {task.title}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  {getPriorityIcon(task.priority)}
                  <span className="ml-1 capitalize">{task.priority}</span>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}>
                  Priority
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.dueDate}
                </div>
                {task.estimatedDeliveryDate && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Est. Delivery: {format(new Date(task.estimatedDeliveryDate), 'MMM d')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {pendingTasks.length === 0 && (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No pending tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}