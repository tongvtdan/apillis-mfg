import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { Project, ProjectStatus, ProjectStage, WorkflowStage } from "@/types/project";
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
import { StageTransitionValidator } from './StageTransitionValidator';
import { usePermissions } from '@/hooks/usePermissions';
import { WorkflowBypassRequest } from '@/lib/workflow-validator';
import { useWorkflowAutoAdvance } from '@/hooks/useWorkflowAutoAdvance';
import { useStageTransition } from '@/hooks/useStageTransition';
import { projectService } from '@/services/projectService';
import { workflowStageService } from '@/services/workflowStageService';

interface WorkflowStepperProps {
  project: Project;
}

interface StageConfig {
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

// Legacy stage config for backward compatibility
const legacyStageConfig: Record<ProjectStage, StageConfig> = {
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

// Dynamic stage config based on database workflow_stages
const getStageConfig = (stage: WorkflowStage): StageConfig => {
  // Map stage names to appropriate icons and colors
  const iconMap: Record<string, React.ElementType> = {
    'Inquiry Received': Circle,
    'Technical Review': Play,
    'Supplier RFQ': Clock,
    'Quoted': CheckCircle,
    'Order Confirmed': CheckCircle,
    'Procurement Planning': Clock,
    'In Production': Play,
    'Shipped & Closed': CheckCircle2
  };

  // Use the stage's own color if available, otherwise fallback to legacy colors
  let bgColorClass = "bg-gray-100";
  if (stage.color) {
    // For hex colors, we'll use a light version of the color
    // For named colors, we'll use the corresponding Tailwind class
    if (stage.color.startsWith('#')) {
      // For hex colors, we'll handle this with inline styles, so return empty class
      bgColorClass = "";
    } else {
      // For named colors like "blue", "red", etc., use Tailwind classes
      bgColorClass = `bg-${stage.color}-100`;
    }
  } else {
    // Fallback to legacy color mapping
    const colorMap: Record<string, { color: string; bgColor: string }> = {
      'Inquiry Received': { color: "text-blue-600", bgColor: "bg-blue-100" },
      'Technical Review': { color: "text-orange-600", bgColor: "bg-orange-100" },
      'Supplier RFQ': { color: "text-indigo-600", bgColor: "bg-indigo-100" },
      'Quoted': { color: "text-green-600", bgColor: "bg-green-100" },
      'Order Confirmed': { color: "text-purple-600", bgColor: "bg-purple-100" },
      'Procurement Planning': { color: "text-yellow-600", bgColor: "bg-yellow-100" },
      'In Production': { color: "text-teal-600", bgColor: "bg-teal-100" },
      'Shipped & Closed': { color: "text-gray-600", bgColor: "bg-gray-100" }
    };

    const colors = colorMap[stage.name] || { color: "text-gray-600", bgColor: "bg-gray-100" };
    bgColorClass = colors.bgColor;
  }

  const colorMap: Record<string, { color: string; bgColor: string }> = {
    'Inquiry Received': { color: "text-blue-600", bgColor: "bg-blue-100" },
    'Technical Review': { color: "text-orange-600", bgColor: "bg-orange-100" },
    'Supplier RFQ': { color: "text-indigo-600", bgColor: "bg-indigo-100" },
    'Quoted': { color: "text-green-600", bgColor: "bg-green-100" },
    'Order Confirmed': { color: "text-purple-600", bgColor: "bg-purple-100" },
    'Procurement Planning': { color: "text-yellow-600", bgColor: "bg-yellow-100" },
    'In Production': { color: "text-teal-600", bgColor: "bg-teal-100" },
    'Shipped & Closed': { color: "text-gray-600", bgColor: "bg-gray-100" }
  };

  const colors = colorMap[stage.name] || { color: "text-gray-600", bgColor: "bg-gray-100" };

  return {
    title: stage.name,
    icon: iconMap[stage.name] || Circle,
    color: colors.color,
    bgColor: bgColorClass
  };
};

export const WorkflowStepper = React.memo(({ project }: WorkflowStepperProps) => {
  const { toast } = useToast();
  const { updateStatus, isUpdating } = useProjectUpdate(project.id);
  const { checkPermission } = usePermissions();
  const { autoAdvanceAvailable, nextStage, autoAdvanceReason, executeAutoAdvance } = useWorkflowAutoAdvance(project);
  const { executeTransition, isTransitioning } = useStageTransition();
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bypassDialog, setBypassDialog] = useState<{
    isOpen: boolean;
    targetStage: string | null;
    warnings: string[];
  }>({
    isOpen: false,
    targetStage: null,
    warnings: []
  });
  const [validationDialog, setValidationDialog] = useState<{
    isOpen: boolean;
    targetStage: WorkflowStage | null;
  }>({
    isOpen: false,
    targetStage: null
  });
  const [isLocalUpdating, setIsLocalUpdating] = useState(false);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);

  // Refs for tracking logged values to prevent duplicate logging
  const lastStatusLogged = useRef<string>('');
  const lastUpdatedAtLogged = useRef<string>('');
  const lastStageCalculationsLogged = useRef<string>('');

  // Load workflow stages from database
  useEffect(() => {
    const loadWorkflowStages = async () => {
      try {
        const stages = await workflowStageService.getWorkflowStages();
        // Sort stages by stage_order and add computed order_index for compatibility
        const sortedStages = stages
          .sort((a, b) => a.stage_order - b.stage_order)
          .map((stage, index) => ({
            ...stage,
            order_index: index // Add computed field for compatibility
          }));
        setWorkflowStages(sortedStages);
      } catch (error) {
        console.error('Error loading workflow stages:', error);
        // Fallback to empty array - components will handle gracefully
        setWorkflowStages([]);
      }
    };

    loadWorkflowStages();
  }, []);

  // Memoize stage calculations to prevent unnecessary recalculations
  const stageCalculations = useMemo(() => {
    if (workflowStages.length === 0) {
      return {
        currentIndex: -1,
        progressPercentage: 0,
        totalStages: 0,
        currentStage: null,
        currentStageData: null
      };
    }

    const sortedStages = [...workflowStages].sort((a, b) => a.stage_order - b.stage_order);

    // Find current stage by ID (preferred) or by current_stage object
    let currentStageData: WorkflowStage | null = null;
    let currentIndex = -1;

    if (project.current_stage_id) {
      // Use current_stage_id (UUID) to find the stage
      currentStageData = sortedStages.find(stage => stage.id === project.current_stage_id) || null;
      currentIndex = currentStageData ? sortedStages.indexOf(currentStageData) : -1;
    } else if (project.current_stage) {
      // Handle current_stage as WorkflowStage object (new behavior)
      if (typeof project.current_stage === 'object' && 'name' in project.current_stage) {
        const stageName = project.current_stage.name;
        currentStageData = sortedStages.find(stage => stage.name === stageName) || null;
        currentIndex = currentStageData ? sortedStages.indexOf(currentStageData) : -1;
      }
      // Handle current_stage as string (legacy behavior) - for backward compatibility
      else if (typeof project.current_stage === 'string') {
        const stageName = project.current_stage;
        currentStageData = sortedStages.find(stage =>
          stage.slug === stageName ||
          stage.name.toLowerCase().replace(/\s+/g, '_') === stageName ||
          stage.name === stageName
        ) || null;
        currentIndex = currentStageData ? sortedStages.indexOf(currentStageData) : -1;
      }
    }

    const progressPercentage = currentIndex >= 0 && sortedStages.length > 1
      ? Math.round((currentIndex / (sortedStages.length - 1)) * 100)
      : 0;

    return {
      currentIndex,
      progressPercentage,
      totalStages: sortedStages.length,
      currentStage: currentStageData?.id || null,
      currentStageData
    };
  }, [project.current_stage_id, project.current_stage, workflowStages]);

  // Memoize stage status functions to prevent recreation on every render
  const getStageStatus = useCallback((stage: WorkflowStage) => {
    const index = workflowStages.findIndex(s => s.id === stage.id);
    if (index < 0) return 'pending';
    if (index < stageCalculations.currentIndex) return 'completed';
    if (index === stageCalculations.currentIndex) return 'current';
    return 'pending';
  }, [stageCalculations.currentIndex, workflowStages]);

  const getStatusIcon = useCallback((stage: WorkflowStage) => {
    const status = getStageStatus(stage);
    const stageConfigItem = getStageConfig(stage);

    const Icon = stageConfigItem.icon;

    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <Play className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  }, [getStageStatus]);

  const getStatusColor = useCallback((stage: WorkflowStage) => {
    const status = getStageStatus(stage);
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'current':
        return 'text-blue-600 font-bold';
      default:
        return 'text-gray-400';
    }
  }, [getStageStatus]);

  const getConnectorColor = useCallback((stage: WorkflowStage) => {
    const index = workflowStages.findIndex(s => s.id === stage.id);
    if (index < 0) return 'bg-gray-200';
    if (index < stageCalculations.currentIndex) return 'bg-green-600';
    return 'bg-gray-200';
  }, [stageCalculations.currentIndex, workflowStages]);

  // Debug logging for project changes - only log when status actually changes
  useEffect(() => {
    const currentStatus = project.current_stage || project.status;
    const currentUpdatedAt = project.updated_at;

    if (lastStatusLogged.current !== currentStatus || lastUpdatedAtLogged.current !== currentUpdatedAt) {
      console.log('🔄 WorkflowStepper: Project status changed:', {
        id: project.id,
        current_stage: project.current_stage,
        status: project.status,
        updated_at: currentUpdatedAt
      });
      lastStatusLogged.current = currentStatus;
      lastUpdatedAtLogged.current = currentUpdatedAt;
    }
  }, [project.id, project.current_stage, project.status, project.updated_at]);

  // Debug logging for stage calculations - only log when calculations change
  useEffect(() => {
    const currentStatus = project.current_stage;

    if (lastStageCalculationsLogged.current !== currentStatus) {
      console.log('🔄 WorkflowStepper: Stage calculations updated:', {
        currentStage: stageCalculations.currentStage,
        currentIndex: stageCalculations.currentIndex,
        progressPercentage: stageCalculations.progressPercentage,
        totalStages: stageCalculations.totalStages
      });
      lastStageCalculationsLogged.current = currentStatus;
    }
  }, [project.current_stage, stageCalculations]);

  // Debug logging to help identify status mapping issues - only log once per status
  useEffect(() => {
    if (workflowStages.length === 0) return;

    const currentStageId = project?.current_stage_id;
    const currentStage = project?.current_stage;

    if (currentStageId && !workflowStages.find(s => s.id === currentStageId)) {
      console.warn(`🚨 WorkflowStepper: Unknown project stage ID "${currentStageId}" not found in workflow_stages`);
      console.warn(`🚨 Available stage IDs:`, workflowStages.map(s => s.id));
    }

    // Handle current_stage as WorkflowStage object (new behavior)
    if (currentStage && typeof currentStage === 'object' && 'name' in currentStage) {
      const stageName = currentStage.name;
      if (!workflowStages.find(s => s.name === stageName)) {
        console.warn(`🚨 WorkflowStepper: Current stage "${stageName}" not found in workflow_stages`);
        console.warn(`🚨 Available stage names:`, workflowStages.map(s => s.name));
      }
    }
    // Handle current_stage as string (legacy behavior) - for backward compatibility
    else if (currentStage && typeof currentStage === 'string') {
      if (!workflowStages.find(s =>
        s.name.toLowerCase().replace(/\s+/g, '_') === currentStage ||
        s.name === currentStage
      )) {
        console.warn(`🚨 WorkflowStepper: Legacy stage "${currentStage}" could not be mapped to workflow_stages`);
        console.warn(`🚨 Available stage names:`, workflowStages.map(s => s.name));
      }
    }
  }, [project?.current_stage_id, project?.current_stage, workflowStages]);

  const updateProjectStage = useCallback(async (stageId: string) => {
    setError(null);

    try {
      // Use the project service to update the stage
      const updatedProject = await projectService.updateProject(project.id, {
        current_stage_id: stageId,
        stage_entered_at: new Date().toISOString()
      });

      const targetStage = workflowStages.find(s => s.id === stageId);
      toast({
        title: "Stage Updated",
        description: `Project stage changed to ${targetStage?.name || 'Unknown Stage'}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating project stage:', error);
      setError("Failed to update project stage. Please try again.");
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update project stage. Please try again.",
      });
      return false;
    }
  }, [project.id, workflowStages, toast]);

  const handleStageClick = useCallback(async (stage: WorkflowStage) => {
    if (stage.id === project.current_stage_id) return;

    // Show validation dialog for stage transition
    setValidationDialog({
      isOpen: true,
      targetStage: stage
    });
  }, [project]);

  const handleValidationConfirm = useCallback(async (bypassRequired: boolean, reason?: string) => {
    if (!validationDialog.targetStage) return;

    try {
      if (bypassRequired) {
        // Show bypass dialog for additional confirmation
        setBypassDialog({
          isOpen: true,
          targetStage: validationDialog.targetStage.id,
          warnings: [reason || "This transition requires manager approval"]
        });
      } else {
        // Use the new stage transition service for normal transitions
        const success = await executeTransition(
          project,
          validationDialog.targetStage,
          updateProjectStage,
          {
            reason: reason || 'Normal stage transition'
          }
        );

        if (!success) {
          // Error handling is done in the executeTransition function
          return;
        }
      }

      // Close validation dialog
      setValidationDialog({
        isOpen: false,
        targetStage: null
      });
    } catch (err) {
      console.error('Error processing stage transition:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project stage. Please try again.",
      });
    }
  }, [validationDialog.targetStage, executeTransition, project, toast]);

  const handleValidationClose = useCallback(() => {
    setValidationDialog({
      isOpen: false,
      targetStage: null
    });
  }, []);

  const handleBypassConfirm = useCallback(async (reason: string, comment: string) => {
    if (!bypassDialog.targetStage) return;

    try {
      const targetStage = workflowStages.find(s => s.id === bypassDialog.targetStage);
      if (!targetStage) return;

      // Use the new stage transition service for bypass transitions
      const success = await executeTransition(
        project,
        targetStage,
        updateProjectStage,
        {
          bypassValidation: true,
          bypassReason: reason,
          reason: comment || 'Manager bypass'
        }
      );

      if (success) {
        // Close the bypass dialog
        setBypassDialog({
          isOpen: false,
          targetStage: null,
          warnings: []
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
  }, [bypassDialog.targetStage, project, workflowStages, executeTransition, updateProjectStage, toast]);

  const handleAutoAdvance = useCallback(async () => {
    if (autoAdvanceAvailable && nextStage) {
      await executeAutoAdvance();
    }
  }, [autoAdvanceAvailable, nextStage, executeAutoAdvance]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, stage: WorkflowStage) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStageClick(stage);
    }
  }, [handleStageClick]);

  // Memoize stage tooltip content to prevent recreation
  const getStageTooltipContent = useCallback((stage: WorkflowStage, status: 'completed' | 'current' | 'pending') => {
    const stageTitle = stage.name;

    const stageDescriptions: Record<string, {
      description: string;
      keyActions: string[];
      exitCriteria: string[];
    }> = {
      'Inquiry Received': {
        description: "Initial customer inquiry and project setup",
        keyActions: ["Customer information collected", "Project requirements documented", "Initial assessment completed"],
        exitCriteria: ["Customer details verified", "Project scope defined", "Technical requirements gathered"]
      },
      'Technical Review': {
        description: "Engineering, QA, and Production review process",
        keyActions: ["Engineering feasibility assessment", "QA requirements definition", "Production capability evaluation"],
        exitCriteria: ["All department reviews completed", "Technical risks identified", "Manufacturing process defined"]
      },
      'Supplier RFQ': {
        description: "Supplier selection and quote collection",
        keyActions: ["BOM breakdown completed", "Suppliers selected and contacted", "RFQ documents sent", "Quote deadlines set"],
        exitCriteria: ["All critical supplier quotes received", "Quote comparison completed", "Supplier selection finalized"]
      },
      'Quoted': {
        description: "Final quote preparation and customer submission",
        keyActions: ["Internal costing finalized", "Quote document generated", "Customer quote submitted"],
        exitCriteria: ["Quote sent to customer", "Follow-up schedule set", "Customer response tracked"]
      },
      'Order Confirmed': {
        description: "Customer order acceptance and processing",
        keyActions: ["Customer PO received", "Internal sales order created", "Order details verified"],
        exitCriteria: ["Purchase order validated", "Payment terms confirmed", "Delivery schedule agreed"]
      },
      'Procurement Planning': {
        description: "Material procurement and production planning",
        keyActions: ["Purchase orders finalized", "Production schedule created", "Material availability confirmed"],
        exitCriteria: ["All materials ordered", "Production slots reserved", "Delivery timeline confirmed"]
      },
      'In Production': {
        description: "Manufacturing and quality control process",
        keyActions: ["Work orders released", "Manufacturing in progress", "Quality inspections performed"],
        exitCriteria: ["Production completed", "Quality tests passed", "Packaging and shipping prepared"]
      },
      'Shipped & Closed': {
        description: "Final delivery and project closure",
        keyActions: ["Product shipped", "Delivery confirmed", "Customer feedback collected"],
        exitCriteria: ["Proof of delivery received", "Customer satisfaction confirmed", "Project documentation complete"]
      }
    };

    const stageInfo = stageDescriptions[stage.name] || {
      description: stage.description || "Stage description not available",
      keyActions: ["Stage actions not defined"],
      exitCriteria: ["Stage criteria not defined"]
    };

    return (
      <div className="text-sm space-y-2 rounded-lg">
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
  }, []);

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
          {(isUpdating || isTransitioning) && (
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
                {stageCalculations.progressPercentage}% Complete
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={stageCalculations.progressPercentage} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stageCalculations.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Desktop view - horizontal stepper */}
          <div className="hidden md:flex items-center justify-between relative">
            {workflowStages.map((stage, index) => {
              const status = getStageStatus(stage);
              const isClickable = status !== 'current' && !isUpdating && !isTransitioning;
              const stageTitle = stage.name;

              return (
                <React.Fragment key={stage.id}>
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
                          ${getStageConfig(stage).bgColor || ''}
                          ${isClickable ? 'hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none' : ''}
                          transition-all duration-200
                        `}
                            style={{
                              borderColor: stage.color || undefined,
                              backgroundColor: stage.color && stage.color.startsWith('#') ? `${stage.color}20` : undefined
                            }}
                          >
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
                      <TooltipContent side="bottom" className="max-w-sm">
                        {getStageTooltipContent(stage, status)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {index < workflowStages.length - 1 && (
                    <div className={`flex-grow h-0.5 mx-2 ${getConnectorColor(stage)}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile view - vertical stepper */}
          <div className="md:hidden space-y-4">
            {workflowStages.map((stage, index) => {
              const status = getStageStatus(stage);
              const isClickable = status !== 'current' && !isUpdating && !isTransitioning;
              const stageTitle = stage.name;

              return (
                <div key={stage.id} className="flex items-center">
                  <div
                    className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 mr-4
                    ${getStatusColor(stage)}
                    ${getStageConfig(stage).bgColor || ''}
                    ${isClickable ? 'cursor-pointer hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none' : ''}
                    transition-all duration-200
                  `}
                    style={{
                      borderColor: stage.color || undefined,
                      backgroundColor: stage.color && stage.color.startsWith('#') ? `${stage.color}20` : undefined
                    }}
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
                        <div className="font-medium">Current Stage</div>
                        <div>{stage.description || 'Stage in progress'}</div>
                        {stage.estimated_duration_days && (
                          <div className="mt-1">
                            Estimated duration: {stage.estimated_duration_days} days
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
                  Auto-Advance to {nextStage || 'Next Stage'}
                </Button>
              </div>
              <p className="text-xs text-green-600 mt-1">{autoAdvanceReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Transition Validator */}
      {validationDialog.targetStage && (
        <StageTransitionValidator
          project={project}
          targetStage={validationDialog.targetStage}
          isOpen={validationDialog.isOpen}
          onClose={handleValidationClose}
          onConfirm={handleValidationConfirm}
        />
      )}

      {/* Bypass Dialog */}
      <WorkflowBypassDialog
        isOpen={bypassDialog.isOpen}
        onClose={() => setBypassDialog({ isOpen: false, targetStage: null, warnings: [] })}
        onConfirm={handleBypassConfirm}
        currentStage={stageCalculations.currentStageData?.name || 'Unknown Stage'}
        nextStage={bypassDialog.targetStage ? workflowStages.find(s => s.id === bypassDialog.targetStage)?.name || 'Unknown Stage' : ''}
        validationWarnings={bypassDialog.warnings}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the project current_stage or updated_at changes
  // This prevents unnecessary re-renders when other project properties change
  return prevProps.project.current_stage === nextProps.project.current_stage &&
    prevProps.project.updated_at === nextProps.project.updated_at;
});