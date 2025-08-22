import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Review Project responses for Project Alpha",
    priority: "high" as const,
    dueDate: "Today"
  },
  {
    id: 2,
    title: "Approve vendor qualification for Beta Corp",
    priority: "medium" as const,
    dueDate: "Tomorrow"
  },
  {
    id: 3,
    title: "Update inventory levels for Q4",
    priority: "low" as const,
    dueDate: "This week"
  },
  {
    id: 4,
    title: "Generate monthly procurement report",
    priority: "medium" as const,
    dueDate: "Next week"
  }
];

const priorityColors = {
  high: "destructive",
  medium: "secondary",
  low: "outline"
} as const;

export function PendingTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">
                {task.title}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant={priorityColors[task.priority]} className="text-xs">
                  {task.priority}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.dueDate}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}