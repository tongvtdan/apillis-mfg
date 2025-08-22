import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Project } from "@/types/project";

interface ProjectProgressCardProps {
  project: Project;
}

const workflowSteps = [
  { id: 'inquiry', label: 'Intake', description: 'Initial inquiry received' },
  { id: 'review', label: 'Internal Review', description: 'Engineering & QA review' },
  { id: 'quoted', label: 'Quoted', description: 'Quote generated' },
  { id: 'won', label: 'Production', description: 'In production' },
  { id: 'delivered', label: 'Delivered', description: 'Completed delivery' }
];

const statusColors = {
  inquiry: "bg-blue-500",
  review: "bg-yellow-500", 
  quoted: "bg-purple-500",
  won: "bg-green-500",
  lost: "bg-red-500"
} as const;

const priorityColors = {
  high: "destructive",
  medium: "secondary",
  low: "outline"
} as const;

export function ProjectProgressCard({ project }: ProjectProgressCardProps) {
  const currentStepIndex = workflowSteps.findIndex(step => step.id === project.status);
  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{project.title}</h3>
              <Badge 
                variant={priorityColors[project.priority]}
                className="mt-1"
              >
                {statusLabel}
              </Badge>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
        
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
          {project.description || "Manufacturing project for precision components"}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div>
          <h4 className="font-medium mb-4">Progress</h4>
          <div className="flex items-center justify-between mb-2">
            {workflowSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isUpcoming = index > currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isCompleted ? 'bg-blue-500 text-white' : ''}
                        ${isCurrent ? 'bg-blue-500 text-white' : ''}
                        ${isUpcoming ? 'bg-gray-300 text-gray-600' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            {workflowSteps.map((step) => (
              <div key={step.id} className="text-center max-w-16">
                <div className="font-medium">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">BOM Items</div>
            <div className="text-xl font-bold">
              {Math.floor(Math.random() * 10) + 1}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Documents</div>
            <div className="text-xl font-bold">
              {Math.floor(Math.random() * 5) + 1}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Vendors Matched</div>
            <div className="text-xl font-bold">
              {Math.floor(Math.random() * 8) + 1}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Quotes Received</div>
            <div className="text-xl font-bold">
              {Math.floor(Math.random() * 3) + 1}/{Math.floor(Math.random() * 5) + 2}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex justify-between text-sm text-muted-foreground pt-4 border-t">
          <div>
            Created: {new Date(project.created_at).toLocaleDateString()}
          </div>
          {project.due_date && (
            <div className="flex items-center text-orange-600">
              <Clock className="w-4 h-4 mr-1" />
              Due: {new Date(project.due_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}