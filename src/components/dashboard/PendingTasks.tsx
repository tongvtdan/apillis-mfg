import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";

export function PendingTasks() {
  const { projects, loading } = useProjects();

  // Generate pending tasks from projects data
  const pendingTasks = projects
    .filter(p => ['inquiry_received', 'technical_review'].includes(p.current_stage))
    .sort((a, b) => {
      // Sort by priority first (high first), then by updated date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    })
    .slice(0, 4)
    .map(project => ({
      id: project.id,
      title: project.current_stage === 'inquiry_received'
        ? `Review new inquiry: ${project.title}`
        : `Complete review for: ${project.title}`,
      priority: project.priority,
      dueDate: formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }),
      status: project.current_stage
    }));

  // Get the appropriate CSS class based on priority with enhanced styling
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'enhanced-list-item-urgent border-l-4 border-l-red-500 bg-red-50/10 dark:bg-red-950/20 shadow-md';
      case 'high':
        return 'enhanced-list-item-high border-l-4 border-l-orange-500 bg-orange-50/10 dark:bg-orange-950/10';
      case 'medium':
        return 'enhanced-list-item-medium border-l-4 border-l-yellow-500 bg-yellow-50/10 dark:bg-yellow-950/10';
      default:
        return 'enhanced-list-item-normal';
    }
  };

  // Get the appropriate status badge class
  const getStatusBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'status-badge status-badge-sm status-urgent';
      case 'high': return 'status-badge status-badge-sm status-high';
      case 'medium': return 'status-badge status-badge-sm status-medium';
      case 'low': return 'status-badge status-badge-sm status-low';
      default: return 'status-badge status-badge-sm';
    }
  };

  // Get status class based on workflow status
  const getWorkflowStatusClass = (status: string) => {
    switch (status) {
      case 'inquiry_received': return 'status-badge status-badge-sm status-inquiry';
      case 'technical_review': return 'status-badge status-badge-sm status-review';
      default: return 'status-badge status-badge-sm';
    }
  };

  // Get text style based on priority
  const getTextClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-sm font-semibold text-red-700 dark:text-red-400';
      case 'high':
        return 'text-sm font-semibold text-orange-700 dark:text-orange-400';
      case 'medium':
        return 'text-sm font-medium text-yellow-700 dark:text-yellow-400';
      default:
        return 'text-sm font-medium text-foreground';
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start justify-between enhanced-list-item enhanced-list-item-normal">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-5 bg-muted animate-pulse rounded w-16"></div>
                    <div className="h-3 bg-muted animate-pulse rounded w-20"></div>
                  </div>
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
          <div key={task.id} className={`enhanced-list-item ${getPriorityClass(task.priority)} flex items-start justify-between`}>
            <div className="flex-1 min-w-0">
              <p className={getTextClass(task.priority)}>
                {task.title}
              </p>
              <div className="flex items-center space-x-2 mt-1.5">
                <div className={getStatusBadgeClass(task.priority)}>
                  {task.priority}
                </div>
                <div className={getWorkflowStatusClass(task.status)}>
                  {task.status === 'inquiry_received' ? 'New Inquiry' : 'Review'}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.dueDate}
                </div>
              </div>
            </div>
          </div>
        ))}
        {pendingTasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No pending tasks</p>
        )}
      </CardContent>
    </Card>
  );
}