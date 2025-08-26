import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Play,
  Circle,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Project, ProjectStatus } from "@/types/project";
import { WorkflowValidator } from "@/lib/workflow-validator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useProjectUpdate } from "@/hooks/useProjectUpdate";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStepperProps {
  project: Project;
}

const stageConfig: Record<ProjectStatus, {
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  inquiry_received: {
    title: "Inquiry Received",
    icon: Circle,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  technical_review: {
    title: "Technical Review",
    icon: Play,
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  supplier_rfq_sent: {
    title: "Supplier RFQ Sent",
    icon: Clock,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  },
  quoted: {
    title: "Quoted",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  order_confirmed: {
    title: "Order Confirmed",
    icon: CheckCircle,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  procurement_planning: {
    title: "Procurement & Planning",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  },
  in_production: {
    title: "In Production",
    icon: Play,
    color: "text-teal-600",
    bgColor: "bg-teal-100"
  },
  shipped_closed: {
    title: "Shipped & Closed",
    icon: CheckCircle2,
    color: "text-gray-600",
    bgColor: "bg-gray-100"
  }
};

const allStages: ProjectStatus[] = [
  'inquiry_received',
  'technical_review',
  'supplier_rfq_sent',
  'quoted',
  'order_confirmed',
  'procurement_planning',
  'in_production',
  'shipped_closed'
];

export function WorkflowStepper({ project }: WorkflowStepperProps) {
  const { toast } = useToast();
  const { updateStatus, isUpdating } = useProjectUpdate(project.id);
  const [hoveredStage, setHoveredStage] = useState<ProjectStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentIndex = allStages.indexOf(project.status);
  const progressPercentage = Math.round((currentIndex / (allStages.length - 1)) * 100);

  const handleStageClick = async (stage: ProjectStatus) => {
    if (stage === project.status) return;

    try {
      // Validate the status change
      const validationResult = await WorkflowValidator.validateStatusChange(project, stage);

      if (!validationResult.isValid) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validationResult.errors.join(", "),
        });
        return;
      }

      setError(null); // Clear any previous errors
      const success = await updateStatus(stage);
      if (success) {
        toast({
          title: "Status Updated",
          description: `Project status changed to ${stageConfig[stage].title}`,
        });
      } else {
        setError("Failed to update project status. Please try again.");
      }
    } catch (err) {
      console.error('Error updating project status:', err);
      setError("An unexpected error occurred while updating the project status.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating the project status.",
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, stage: ProjectStatus) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStageClick(stage);
    }
  };

  const getStageStatus = (stage: ProjectStatus) => {
    const index = allStages.indexOf(stage);
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const getStatusIcon = (stage: ProjectStatus) => {
    const status = getStageStatus(stage);
    const Icon = stageConfig[stage].icon;

    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <Play className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (stage: ProjectStatus) => {
    const status = getStageStatus(stage);
    switch (status) {
      case 'completed':
        return 'text-green-600 border-green-600';
      case 'current':
        return 'text-blue-600 border-blue-600 font-bold';
      default:
        return 'text-gray-400 border-gray-300';
    }
  };

  const getConnectorColor = (stage: ProjectStatus) => {
    const index = allStages.indexOf(stage);
    if (index < currentIndex) return 'bg-green-600';
    return 'bg-gray-200';
  };

  if (error) {
    return (
      <Card className="w-full mb-6 border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center text-red-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Error: {error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-6 relative" role="region" aria-label="Project Workflow Stepper">
      <CardContent className="p-6">
        {isUpdating && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="mt-2 text-sm text-muted-foreground">Updating project status...</span>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Project Workflow</h3>
            <Badge variant="secondary" className="text-sm">
              {progressPercentage}% Complete
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Desktop view - horizontal stepper */}
        <div className="hidden md:flex items-center justify-between relative">
          {allStages.map((stage, index) => {
            const status = getStageStatus(stage);
            const isClickable = status !== 'current' && !isUpdating;
            const stageTitle = stageConfig[stage].title;

            return (
              <React.Fragment key={stage}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${isClickable ? 'hover:scale-105' : 'cursor-default'
                          }`}
                        onClick={() => isClickable && handleStageClick(stage)}
                        onKeyDown={(e) => isClickable && handleKeyDown(e, stage)}
                        onMouseEnter={() => setHoveredStage(stage)}
                        onMouseLeave={() => setHoveredStage(null)}
                        tabIndex={isClickable ? 0 : -1}
                        role={isClickable ? "button" : "status"}
                        aria-label={`${stageTitle} - ${status === 'completed' ? 'Completed' : status === 'current' ? 'Current stage' : 'Pending'}`}
                        aria-disabled={!isClickable}
                      >
                        <div className={`
                          relative flex items-center justify-center w-12 h-12 rounded-full border-2 mb-2
                          ${getStatusColor(stage)}
                          ${stageConfig[stage].bgColor}
                          ${isClickable ? 'hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none' : ''}
                          transition-all duration-200
                        `}>
                          {getStatusIcon(stage)}
                          {hoveredStage === stage && status !== 'current' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <AlertCircle className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <span className={`text-xs text-center max-w-[100px] ${status === 'current' ? 'font-semibold' : 'text-muted-foreground'
                          }`}>
                          {stageTitle}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="text-sm">
                        <div className="font-medium mb-1">{stageTitle}</div>
                        <div className="text-muted-foreground">
                          {status === 'completed' && 'Completed'}
                          {status === 'current' && 'Current stage'}
                          {status === 'pending' && 'Upcoming stage'}
                        </div>
                        {status === 'current' && (
                          <div className="mt-1 text-xs">
                            {WorkflowValidator.getExitCriteriaForStage(stage).length > 0 && (
                              <div>
                                <div className="font-medium">Exit criteria:</div>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                  {WorkflowValidator.getExitCriteriaForStage(stage).map((criteria, idx) => (
                                    <li key={idx} className="text-muted-foreground">{criteria}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {index < allStages.length - 1 && (
                  <div className={`flex-grow h-0.5 mx-2 ${getConnectorColor(stage)}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile view - vertical stepper */}
        <div className="md:hidden space-y-4">
          {allStages.map((stage, index) => {
            const status = getStageStatus(stage);
            const isClickable = status !== 'current' && !isUpdating;
            const stageTitle = stageConfig[stage].title;

            return (
              <div key={stage} className="flex items-center">
                <div
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 mr-4
                    ${getStatusColor(stage)}
                    ${stageConfig[stage].bgColor}
                    ${isClickable ? 'cursor-pointer hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none' : ''}
                    transition-all duration-200
                  `}
                  onClick={() => isClickable && handleStageClick(stage)}
                  onKeyDown={(e) => isClickable && handleKeyDown(e, stage)}
                  tabIndex={isClickable ? 0 : -1}
                  role={isClickable ? "button" : "status"}
                  aria-label={`${stageTitle} - ${status === 'completed' ? 'Completed' : status === 'current' ? 'Current stage' : 'Pending'}`}
                  aria-disabled={!isClickable}
                >
                  {getStatusIcon(stage)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${status === 'current' ? 'text-blue-600' : 'text-muted-foreground'
                      }`}>
                      {stageTitle}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {status === 'completed' && 'Completed'}
                      {status === 'current' && 'Current'}
                      {status === 'pending' && 'Pending'}
                    </Badge>
                  </div>
                  {status === 'current' && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {WorkflowValidator.getExitCriteriaForStage(stage).length > 0 && (
                        <div>
                          <div className="font-medium">Exit criteria:</div>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {WorkflowValidator.getExitCriteriaForStage(stage).slice(0, 2).map((criteria, idx) => (
                              <li key={idx} className="text-muted-foreground">{criteria}</li>
                            ))}
                            {WorkflowValidator.getExitCriteriaForStage(stage).length > 2 && (
                              <li className="text-muted-foreground">+{WorkflowValidator.getExitCriteriaForStage(stage).length - 2} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}