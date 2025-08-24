import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";

const priorityColors = {
  high: "destructive",
  medium: "secondary",
  low: "outline"
} as const;

export function PendingTasks() {
  const { projects, loading } = useProjects();

  // Generate pending tasks from projects data
  const pendingTasks = projects
    .filter(p => ['inquiry_received', 'technical_review'].includes(p.status))
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
      title: project.status === 'inquiry_received'
        ? `Review new inquiry: ${project.title}`
        : `Complete review for: ${project.title}`,
      priority: project.priority,
      dueDate: formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }),
      statusClass: project.priority === 'high' ? 'high-chip' : project.priority === 'urgent' ? 'urgent-chip' : ''
    }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
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
          <div key={task.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">
                {task.title}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant={priorityColors[task.priority]} className="text-xs font-medium">
                  {task.priority}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.dueDate}
                </div>
              </div>
            </div>
            {/* Status chips */}
            {task.priority === 'high' || task.priority === 'urgent' ? (
              <span className={task.statusClass}>{task.priority}</span>
            ) : null}
          </div>
        ))}
        {pendingTasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No pending tasks</p>
        )}
      </CardContent>
    </Card>
  );
}