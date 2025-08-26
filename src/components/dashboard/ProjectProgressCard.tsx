import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, Users, Calendar, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import type { Project } from "@/types/project";

interface ProjectProgressCardProps {
  project: Project;
}

const workflowSteps = [
  { id: 'inquiry_received', label: 'Intake', description: 'Initial inquiry received' },
  { id: 'technical_review', label: 'Internal Review', description: 'Engineering & QA review' },
  { id: 'supplier_rfq_sent', label: 'Supplier RFQ', description: 'RFQ sent to suppliers' },
  { id: 'quoted', label: 'Quoted', description: 'Quote generated' },
  { id: 'order_confirmed', label: 'Order Confirmed', description: 'Order confirmed' },
  { id: 'procurement_planning', label: 'Procurement', description: 'Procurement planning' },
  { id: 'in_production', label: 'Production', description: 'In production' },
  { id: 'shipped_closed', label: 'Delivered', description: 'Completed delivery' }
];

const priorityColors = {
  high: "destructive",
  medium: "secondary",
  low: "outline"
} as const;

const statusBadgeColors = {
  inquiry_received: "bg-orange-100 text-orange-800",
  technical_review: "bg-yellow-100 text-yellow-800",
  supplier_rfq_sent: "bg-indigo-100 text-indigo-800",
  quoted: "bg-blue-100 text-blue-800",
  order_confirmed: "bg-green-100 text-green-800",
  procurement_planning: "bg-yellow-100 text-yellow-800",
  in_production: "bg-teal-100 text-teal-800",
  shipped_closed: "bg-gray-100 text-gray-800"
} as const;

export function ProjectProgressCard({ project }: ProjectProgressCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/project/${project.id}`);
  };
  const currentStepIndex = workflowSteps.findIndex(step => step.id === project.status);

  // Get 3 relevant steps: completed, current, next
  const getRelevantSteps = () => {
    if (currentStepIndex === -1) return workflowSteps.slice(0, 3);

    const steps = [];

    // Add previous step if exists (completed)
    if (currentStepIndex > 0) {
      steps.push({ ...workflowSteps[currentStepIndex - 1], stepType: 'completed' });
    }

    // Add current step
    steps.push({ ...workflowSteps[currentStepIndex], stepType: 'current' });

    // Add next step if exists
    if (currentStepIndex < workflowSteps.length - 1) {
      steps.push({ ...workflowSteps[currentStepIndex + 1], stepType: 'next' });
    }

    // If we don't have 3 steps, fill from the beginning
    while (steps.length < 3 && steps.length < workflowSteps.length) {
      const missingIndex = steps.length === 1 ? currentStepIndex + 1 :
        steps.length === 2 ? currentStepIndex + 2 : currentStepIndex - 1;
      if (missingIndex >= 0 && missingIndex < workflowSteps.length) {
        const stepType = missingIndex < currentStepIndex ? 'completed' :
          missingIndex === currentStepIndex ? 'current' : 'next';
        steps.push({ ...workflowSteps[missingIndex], stepType });
      } else {
        break;
      }
    }

    return steps.slice(0, 3);
  };

  const relevantSteps = getRelevantSteps();

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{project.project_id}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description || "Manufacturing project for precision components"}
              </p>
            </div>
          </div>
          <Badge
            variant={priorityColors[project.priority]}
            className="ml-3 flex-shrink-0"
          >
            {project.priority}
          </Badge>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeColors[project.status] || statusBadgeColors.inquiry}`}>
            <Clock className="w-3 h-3 mr-1" />
            {project.status.replace('_', ' ')}
          </div>
        </div>

        {/* Progress Steps - Simplified to 3 steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {relevantSteps.map((step, index) => {
              const isCompleted = step.stepType === 'completed';
              const isCurrent = step.stepType === 'current';
              const isNext = step.stepType === 'next';

              return (
                <div key={`${step.id}-${index}`} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isCompleted ? 'bg-success text-success-foreground' : ''}
                        ${isCurrent ? 'bg-primary text-primary-foreground' : ''}
                        ${isNext ? 'bg-muted text-muted-foreground' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  </div>
                  {index < relevantSteps.length - 1 && (
                    <div
                      className={`w-20 h-0.5 mx-2 ${isCompleted ? 'bg-success' : 'bg-muted'
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            {relevantSteps.map((step, index) => (
              <div key={`${step.id}-label-${index}`} className="text-center flex-1">
                <div className={`font-medium ${step.stepType === 'current' ? 'text-primary' : ''}`}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Supplier Matches</div>
            <div className="text-lg font-semibold">
              {Math.floor(Math.random() * 8) + 1}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Attachments</div>
            <div className="text-lg font-semibold">
              {Math.floor(Math.random() * 5) + 1}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">BOM Items</div>
            <div className="text-lg font-semibold">
              {Math.floor(Math.random() * 10) + 1}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              {project.due_date ? 'Lead Time' : 'Due Date'}
            </div>
            <div className="text-lg font-semibold">
              {project.due_date
                ? `${Math.ceil((new Date(project.due_date).getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))} days`
                : 'TBD'
              }
            </div>
          </div>
        </div>

        {/* Technical Requirements (if available) */}
        {project.notes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Technical Requirements</h4>
            <div className="text-sm text-muted-foreground">
              <p className="line-clamp-2">{project.notes}</p>
              {project.notes.length > 100 && (
                <button className="text-primary text-xs hover:underline mt-1">
                  +1 more requirements
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Info */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {project.due_date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Due: {new Date(project.due_date).toLocaleDateString()}
              </div>
            )}
            {project.estimated_value && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                ${project.estimated_value.toLocaleString()}
              </div>
            )}
          </div>
          <button
            onClick={handleViewDetails}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View Details
          </button>
        </div>
      </CardContent>
    </Card>
  );
}