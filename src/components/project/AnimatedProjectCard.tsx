import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Play, Eye, Users, ChevronRight, Info, CheckCircle, Clock, XCircle } from "lucide-react";
import { Project, ProjectStatus } from "@/types/project";
import { useNavigate } from "react-router-dom";
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

interface AnimatedProjectCardProps {
    project: Project;
    onStatusChange: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
    getAvailableStages: (project: Project) => Array<{
        id: ProjectStatus;
        name: string;
        color: string;
        count: number;
        canMoveTo: boolean;
        isNextStage: boolean;
        isCurrentStage: boolean;
    }>;
    getPriorityColor: (priority: string) => string;
    formatCurrency: (value: number | null) => string | null;
    formatDate: (date: string) => string;
}

export function AnimatedProjectCard({
    project,
    onStatusChange,
    getAvailableStages,
    getPriorityColor,
    formatCurrency,
    formatDate
}: AnimatedProjectCardProps) {
    const navigate = useNavigate();
    const isOverdue = project.days_in_stage > 7;
    const timeIndicator = isOverdue ?
        { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' } :
        { icon: Play, color: 'text-success', bg: 'bg-success/10' };

    const handleUpdateStatus = async (project: Project, newStatus: ProjectStatus) => {
        await onStatusChange(project.id, newStatus);
    };

    // Get stage progress and requirements with status
    const getStageRequirementsWithStatus = (project: Project) => {
        const stageProgress = WorkflowValidator.getStageProgress(project);
        const exitCriteria = stageProgress.exitCriteria;

        // For MVP, we'll determine status based on project data
        const requirementsWithStatus = exitCriteria.map(criteria => {
            let status: 'completed' | 'in_progress' | 'pending' = 'pending';
            let icon = Clock;
            let iconColor = 'text-muted-foreground';

            // Determine status based on criteria and project data
            if (criteria.includes('Engineering review') && project.engineering_reviewer_id) {
                status = 'completed';
                icon = CheckCircle;
                iconColor = 'text-green-600';
            } else if (criteria.includes('QA inspection') && project.qa_reviewer_id) {
                status = 'completed';
                icon = CheckCircle;
                iconColor = 'text-green-600';
            } else if (criteria.includes('Production process') && project.production_reviewer_id) {
                status = 'completed';
                icon = CheckCircle;
                iconColor = 'text-green-600';
            } else if (criteria.includes('BOM breakdown') && project.description) {
                status = 'in_progress';
                icon = Clock;
                iconColor = 'text-amber-600';
            } else if (criteria.includes('Customer PO') && project.estimated_value) {
                status = 'in_progress';
                icon = Clock;
                iconColor = 'text-amber-600';
            }

            return {
                criteria,
                status,
                icon,
                iconColor
            };
        });

        return requirementsWithStatus;
    };

    const getStatusLabel = (status: 'completed' | 'in_progress' | 'pending') => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in_progress': return 'In Progress';
            case 'pending': return 'Pending';
            default: return 'Pending';
        }
    };

    const getStatusBadgeVariant = (status: 'completed' | 'in_progress' | 'pending') => {
        switch (status) {
            case 'completed': return 'default';
            case 'in_progress': return 'secondary';
            case 'pending': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`${project.id}-${project.status}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1],
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.3 },
                    y: { duration: 0.3 }
                }}
                layout
                className="relative"
            >
                <Card className="card-elevated hover:shadow-md transition-all duration-200 hover:scale-[1.02]">

                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                                {project.project_id}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => navigate(`/project/${project.id}`)}
                            >
                                <span className="sr-only">View project</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${getPriorityColor(project.priority)}`}
                                >
                                    {project.priority.toUpperCase()}
                                </Badge>
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${timeIndicator.bg}`}>
                                    <timeIndicator.icon className={`h-3 w-3 ${timeIndicator.color}`} />
                                    <span className={timeIndicator.color}>{project.days_in_stage}d</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                        <div>
                            <p className="font-medium text-sm">{project.title}</p>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                                <span>{project.customer?.company || project.customer?.name || project.contact_name || 'Unknown'}</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 text-muted-foreground">
                                    <span>{project.contact_name || project.assignee_id || 'Unassigned'}</span>
                                </div>
                                {project.estimated_value && (
                                    <span className="font-medium">{formatCurrency(project.estimated_value)}</span>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                {project.due_date && (
                                    <div className="flex items-center space-x-1 text-muted-foreground">
                                        <span>{formatDate(project.due_date)}</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-1 text-muted-foreground">
                                    <span>{project.days_in_stage} days</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                            <div className="flex flex-col gap-2">
                                {/* Enhanced Stage Requirements with Status */}
                                {(() => {
                                    const stageProgress = WorkflowValidator.getStageProgress(project);
                                    const requirementsWithStatus = getStageRequirementsWithStatus(project);

                                    if (requirementsWithStatus.length === 0) return null;

                                    return (
                                        <div className="mb-2 p-3 bg-muted/30 rounded-lg border border-muted-foreground/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Stage Requirements
                                                </span>
                                                <Badge
                                                    variant={stageProgress.canAdvance ? "default" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {stageProgress.canAdvance ? "Ready to Advance" : "Requirements Pending"}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2">
                                                {requirementsWithStatus.map((req, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                                        <req.icon className={`h-3 w-3 flex-shrink-0 ${req.iconColor}`} />
                                                        <span className="text-muted-foreground leading-tight flex-1">
                                                            {req.criteria}
                                                        </span>
                                                        <Badge
                                                            variant={getStatusBadgeVariant(req.status)}
                                                            className="text-xs ml-auto"
                                                        >
                                                            {getStatusLabel(req.status)}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>

                                            {!stageProgress.canAdvance && (
                                                <div className="mt-2 text-xs text-muted-foreground/70 italic">
                                                    Complete all requirements to advance to next stage
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <Button
                                    variant="accent"
                                    size="sm"
                                    className="w-full justify-center h-7 action-button hover:scale-[1.02] transition-all duration-200"
                                    onClick={() => navigate(`/project/${project.id}`)}
                                >
                                    <Eye className="mr-2 h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">View Details</span>
                                </Button>

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
                                                                        {/* Separate clickable info button that's not affected by disabled state */}
                                                                        <div
                                                                            className="inline-flex items-center justify-center"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                            }}
                                                                        >
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
                                                                                    <TooltipContent side="left" className="max-w-xs">
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
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
