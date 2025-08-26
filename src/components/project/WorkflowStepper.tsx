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
import { WorkflowBypassDialog } from './WorkflowBypassDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { WorkflowBypassRequest } from '@/lib/workflow-validator';
import { useWorkflowAutoAdvance } from '@/hooks/useWorkflowAutoAdvance';

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
  const { checkPermission } = usePermissions();
  const { autoAdvanceAvailable, nextStage, autoAdvanceReason, executeAutoAdvance } = useWorkflowAutoAdvance(project);
  const [hoveredStage, setHoveredStage] = useState<ProjectStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bypassDialog, setBypassDialog] = useState<{
    isOpen: boolean;
    targetStage: ProjectStatus | null;
    warnings: string[];
  }>({
    isOpen: false,
    targetStage: null,
    warnings: []
  });

  const currentIndex = allStages.indexOf(project.status);
  const progressPercentage = Math.round((currentIndex / (allStages.length - 1)) * 100);

  const handleStageClick = async (stage: ProjectStatus) => {
    if (stage === project.status) return;

    try {
      // Check if user can bypass workflow
      const canBypass = checkPermission('workflow', 'bypass').allowed;

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

      // Check if auto-advance is possible
      if (validationResult.canAutoAdvance) {
        toast({
          title: "Auto-Advance Available",
          description: validationResult.autoAdvanceReason,
        });
      }

      // Check if manager approval is required
      if (validationResult.requiresManagerApproval) {
        if (canBypass) {
          // Show bypass dialog
          setBypassDialog({
            isOpen: true,
            targetStage: stage,
            warnings: validationResult.warnings
          });
          return;
        } else {
          toast({
            variant: "destructive",
            title: "Manager Approval Required",
            description: "This stage change requires manager approval. Please contact your manager.",
          });
          return;
        }
      }

      // Proceed with normal status update
      await updateProjectStatus(stage);

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

  const handleBypassConfirm = async (reason: string, comment: string) => {
    if (!bypassDialog.targetStage) return;

    try {
      const bypassRequest: WorkflowBypassRequest = {
        reason,
        comment,
        requestedBy: 'Current User', // Get from auth context
        requestedAt: new Date()
      };

      // Validate with bypass
      const validationResult = await WorkflowValidator.validateStatusChange(
        project,
        bypassDialog.targetStage
      );

      if (validationResult.isValid) {
        await updateProjectStatus(bypassDialog.targetStage);
        toast({
          title: "Status Updated",
          description: `Project status changed to ${stageConfig[bypassDialog.targetStage].title} (bypassed)`,
        });
      }
    } catch (err) {
      console.error('Error processing bypass:', err);
      toast({
        variant: "destructive",
        title: "Bypass Failed",
        description: "Failed to process workflow bypass. Please try again.",
      });
    }
  };

  const updateProjectStatus = async (stage: ProjectStatus) => {
    setError(null);
    const success = await updateStatus(stage);
    if (success) {
      toast({
        title: "Status Updated",
        description: `Project status changed to ${stageConfig[stage].title}`,
      });
    } else {
      setError("Failed to update project status. Please try again.");
    }
  };

  const handleAutoAdvance = async () => {
    if (autoAdvanceAvailable && nextStage) {
      await executeAutoAdvance();
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

  const getStageTooltipContent = (stage: ProjectStatus, status: 'completed' | 'current' | 'pending') => {
    const stageTitle = stageConfig[stage].title;

    const stageDescriptions: Record<ProjectStatus, {
      description: string;
      keyActions: string[];
      exitCriteria: string[];
    }> = {
      inquiry_received: {
        description: "Initial customer inquiry and project setup",
        keyActions: ["Customer information collected", "Project requirements documented", "Initial assessment completed"],
        exitCriteria: ["Customer details verified", "Project scope defined", "Technical requirements gathered"]
      },
      technical_review: {
        description: "Engineering, QA, and Production review process",
        keyActions: ["Engineering feasibility assessment", "QA requirements definition", "Production capability evaluation"],
        exitCriteria: ["All department reviews completed", "Technical risks identified", "Manufacturing process defined"]
      },
      supplier_rfq_sent: {
        description: "Supplier selection and quote collection",
        keyActions: ["BOM breakdown completed", "Suppliers selected and contacted", "RFQ documents sent", "Quote deadlines set"],
        exitCriteria: ["All critical supplier quotes received", "Quote comparison completed", "Supplier selection finalized"]
      },
      quoted: {
        description: "Final quote preparation and customer submission",
        keyActions: ["Internal costing finalized", "Quote document generated", "Customer quote submitted"],
        exitCriteria: ["Quote sent to customer", "Follow-up schedule set", "Customer response tracked"]
      },
      order_confirmed: {
        description: "Customer order acceptance and processing",
        keyActions: ["Customer PO received", "Internal sales order created", "Order details verified"],
        exitCriteria: ["Purchase order validated", "Payment terms confirmed", "Delivery schedule agreed"]
      },
      procurement_planning: {
        description: "Material procurement and production planning",
        keyActions: ["Purchase orders finalized", "Production schedule created", "Material availability confirmed"],
        exitCriteria: ["All materials ordered", "Production slots reserved", "Delivery timeline confirmed"]
      },
      in_production: {
        description: "Manufacturing and quality control process",
        keyActions: ["Work orders released", "Manufacturing in progress", "Quality inspections performed"],
        exitCriteria: ["Production completed", "Quality tests passed", "Packaging and shipping prepared"]
      },
      shipped_closed: {
        description: "Final delivery and project closure",
        keyActions: ["Product shipped", "Delivery confirmed", "Customer feedback collected"],
        exitCriteria: ["Proof of delivery received", "Customer satisfaction confirmed", "Project documentation complete"]
      }
    };

    const stageInfo = stageDescriptions[stage];

    return (
      <div className="text-sm space-y-2 modal-dialog p-2 rounded-lg">
        <div className="font-medium">{stageTitle}</div>
        <div className="text-muted-foreground text-xs">{stageInfo.description}</div>

        {status === 'current' && (
          <div className="space-y-2">
            <div>
              <div className="font-medium text-xs text-blue-600">Key Actions:</div>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                {stageInfo.keyActions.map((action, idx) => (
                  <li key={idx} className="text-muted-foreground">{action}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-medium text-xs text-green-600">Exit Criteria:</div>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                {stageInfo.exitCriteria.map((criteria, idx) => (
                  <li key={idx} className="text-muted-foreground">{criteria}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div>
            <div className="font-medium text-xs text-orange-600">What happens next:</div>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
              {stageInfo.keyActions.slice(0, 2).map((action, idx) => (
                <li key={idx} className="text-muted-foreground">{action}</li>
              ))}
            </ul>
          </div>
        )}

        {status === 'completed' && (
          <div className="text-xs text-green-600 font-medium">
            ✓ Stage completed successfully
          </div>
        )}
      </div>
    );
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
    <>
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
                      <TooltipContent side="bottom" className="max-w-sm bg-background border border-muted-foreground/20 shadow-lg">
                        {getStageTooltipContent(stage, status)}
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
                    ${isClickable ? 'cursor-pointer hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none' : ''}
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

          {/* Auto-advance button */}
          {autoAdvanceAvailable && nextStage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-800 font-medium">
                    Auto-Advance Available
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={handleAutoAdvance}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Auto-Advance to {stageConfig[nextStage].title}
                </Button>
              </div>
              <p className="text-xs text-green-600 mt-1">{autoAdvanceReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bypass Dialog */}
      <WorkflowBypassDialog
        isOpen={bypassDialog.isOpen}
        onClose={() => setBypassDialog({ isOpen: false, targetStage: null, warnings: [] })}
        onConfirm={handleBypassConfirm}
        currentStage={stageConfig[project.status].title}
        nextStage={bypassDialog.targetStage ? stageConfig[bypassDialog.targetStage].title : ''}
        validationWarnings={bypassDialog.warnings}
      />
    </>
  );
}