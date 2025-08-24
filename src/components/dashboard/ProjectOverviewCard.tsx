import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectOverviewCardProps {
  project: Project;
}

const workflowSteps = [
  { id: 'inquiry', label: 'Intake' },
  { id: 'review', label: 'Review' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'won', label: 'Production' }
];

const priorityColors = {
  high: "destructive",
  medium: "secondary",
  low: "outline"
} as const;

export function ProjectOverviewCard({ project }: ProjectOverviewCardProps) {
  const currentStepIndex = workflowSteps.findIndex(step => step.id === project.status);
  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1);

  return (
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate">{project.title}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {project.project_id}
              </p>
            </div>
          </div>
          <Badge
            variant={priorityColors[project.priority]}
            className="text-xs ml-2 flex-shrink-0"
          >
            {project.priority}
          </Badge>
        </div>

        {/* Vertical Progress Steps */}
        <div className="space-y-2">
          {workflowSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div key={step.id} className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                    ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                    ${isCurrent ? 'bg-primary text-primary-foreground' : ''}
                    ${isUpcoming ? 'bg-muted text-muted-foreground' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </div>
                </div>
                {isCurrent && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t flex justify-between text-xs text-muted-foreground">
          <span>
            {project.due_date
              ? `Lead Time: ${Math.ceil((new Date(project.due_date).getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))} days`
              : 'Due Date: TBD'
            }
          </span>
          {project.estimated_value && (
            <span>${project.estimated_value.toLocaleString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}