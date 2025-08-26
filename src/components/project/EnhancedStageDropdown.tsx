import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Info, XCircle } from "lucide-react";
import { Project, ProjectStatus } from "@/types/project";
import { WorkflowValidator } from "@/lib/workflow-validator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedStageDropdownProps {
    project: Project;
    onStatusChange: (project: Project, newStatus: ProjectStatus) => Promise<void>;
    getAvailableStages: (project: Project) => Array<{
        id: ProjectStatus;
        name: string;
        color: string;
        count: number;
        canMoveTo: boolean;
        isNextStage: boolean;
        isCurrentStage: boolean;
    }>;
}

export function EnhancedStageDropdown({
    project,
    onStatusChange,
    getAvailableStages
}: EnhancedStageDropdownProps) {

    const handleUpdateStatus = async (project: Project, newStatus: ProjectStatus) => {
        await onStatusChange(project, newStatus);
    };

    // Get stage progress and requirements with status (same logic as AnimatedProjectCard)
    const getStageRequirementsWithStatus = (project: Project) => {
        const stageProgress = WorkflowValidator.getStageProgress(project);
        const exitCriteria = stageProgress.exitCriteria;

        // For MVP, we'll determine status based on project data
        const requirementsWithStatus = exitCriteria.map(criteria => {
            let status: 'completed' | 'in_progress' | 'pending' = 'pending';

            // Determine status based on criteria and project data
            if (criteria.includes('Engineering review') && project.engineering_reviewer_id) {
                status = 'completed';
            } else if (criteria.includes('QA inspection') && project.qa_reviewer_id) {
                status = 'completed';
            } else if (criteria.includes('Production process') && project.production_reviewer_id) {
                status = 'completed';
            } else if (criteria.includes('BOM breakdown') && project.description) {
                status = 'in_progress';
            } else if (criteria.includes('Customer PO') && project.estimated_value) {
                status = 'in_progress';
            }

            return {
                criteria,
                status
            };
        });

        return requirementsWithStatus;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="w-full justify-center h-7 bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] transition-all duration-200 shadow-sm"
                >
                    <Users className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Change Stage</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-background backdrop-blur-lg border border-muted-foreground/20 w-64"
            >
                {getAvailableStages(project).map((stage) => {
                    const isCurrentStage = stage.isCurrentStage;
                    const canMoveToStage = stage.canMoveTo;
                    const isNextStage = stage.isNextStage;

                    return (
                        <DropdownMenuItem
                            key={stage.id}
                            onClick={() => handleUpdateStatus(project, stage.id)}
                            disabled={isCurrentStage || !canMoveToStage}
                            className={`
                                ${isCurrentStage || !canMoveToStage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                transition-all duration-200 ease-in-out
                                hover:bg-accent hover:text-accent-foreground
                                focus:bg-accent focus:text-accent-foreground
                                data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground
                                hover:pl-3 hover:scale-[1.02] transform
                                rounded-sm my-0.5
                                p-3
                            `}
                        >
                            <div className="flex flex-col w-full space-y-2">
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{stage.name}</span>
                                    <div className="flex items-center gap-2">
                                        {isCurrentStage && (
                                            <Badge variant="secondary" className="text-xs">
                                                Current
                                            </Badge>
                                        )}
                                        {!canMoveToStage && !isCurrentStage && (
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                                    Blocked
                                                </Badge>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground cursor-help transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <Info className="h-3 w-3" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left" className="max-w-xs bg-background border border-muted-foreground/20 shadow-lg">
                                                            <div className="text-xs">
                                                                <div className="font-medium mb-1">Stage is blocked because:</div>
                                                                <div className="space-y-1">
                                                                    {(() => {
                                                                        const stageProgress = WorkflowValidator.getStageProgress(project);
                                                                        const requirementsWithStatus = getStageRequirementsWithStatus(project);
                                                                        const pendingRequirements = requirementsWithStatus.filter(req => req.status !== 'completed');

                                                                        if (pendingRequirements.length === 0) {
                                                                            return <span>Current stage requirements not met</span>;
                                                                        }

                                                                        return pendingRequirements.map((req, idx) => (
                                                                            <div key={idx} className="flex items-center gap-1">
                                                                                <XCircle className="h-2.5 w-2.5 text-red-500" />
                                                                                <span>{req.criteria}</span>
                                                                            </div>
                                                                        ));
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        )}
                                        {isNextStage && canMoveToStage && (
                                            <Badge variant="default" className="text-xs bg-green-600">
                                                Ready
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
