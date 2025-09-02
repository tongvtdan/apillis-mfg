import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Play, Eye, ChevronRight, CheckCircle, Clock, XCircle, Calendar, DollarSign, Clock as ClockIcon, User, Building2, ExternalLink } from "lucide-react";
import { Project, ProjectStatus } from "@/types/project";
import { useUserDisplayName } from "@/hooks/useUsers";
import { useNavigate } from "react-router-dom";
import { WorkflowValidator } from "@/lib/workflow-validator";
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

    // Get stage progress and requirements with status
    const getStageRequirementsWithStatus = (project: Project) => {
        const stageProgress = WorkflowValidator.getStageProgress(project);
        const exitCriteria = stageProgress.exitCriteria;

        // For MVP, we'll determine status based on project data
        const requirementsWithStatus = exitCriteria.map(criteria => {
            let status: 'completed' | 'in_progress' | 'pending' = 'pending';
            let icon = XCircle;
            let iconColor = 'text-red-600';

            if (criteria.includes('Customer PO') && project.estimated_value) {
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

    // Handle customer navigation
    const handleCustomerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project.customer?.id) {
            navigate(`/customers/${project.customer.id}`);
        }
    };

    // Handle due date click (for calendar view)
    const handleDueDateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Navigate to calendar view with the specific date
        navigate(`/projects?tab=calendar&date=${project.due_date}`);
    };

    return (
        <TooltipProvider>
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
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${timeIndicator.bg} cursor-help hover:bg-accent hover:text-accent-foreground transition-all duration-200`}>
                                                <timeIndicator.icon className={`h-3 w-3 ${timeIndicator.color}`} />
                                                <span className={timeIndicator.color}>{project.days_in_stage}d</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <div className="text-xs">
                                                <div className="font-medium mb-1">Time in Current Stage</div>
                                                <div>This project has been in the current stage for {project.days_in_stage} days</div>
                                                {isOverdue && (
                                                    <div className="mt-1 text-amber-600 font-medium">
                                                        ⚠️ Overdue: Consider reviewing or escalating
                                                    </div>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0 space-y-3">
                            <div>
                                <p className="font-medium text-sm">{project.title}</p>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                                    <Building2 className="h-3 w-3 flex-shrink-0" />
                                    {project.customer?.id ? (
                                        <button
                                            onClick={handleCustomerClick}
                                            className="hover:bg-accent hover:text-accent-foreground px-1 py-0.5 rounded transition-all duration-200 flex items-center space-x-1 group"
                                        >
                                            <span>{project.customer.company_name || 'Unknown'}</span>
                                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </button>
                                    ) : (
                                        <span>{project.customer?.company_name || project.contact_name || 'Unknown'}</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1 text-muted-foreground">
                                        <User className="h-3 w-3 flex-shrink-0" />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-help hover:bg-accent hover:text-accent-foreground px-1 py-0.5 rounded transition-all duration-200">
                                                    <ProjectContactDisplay project={project} />
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                                <div className="text-xs">
                                                    <div className="font-medium mb-1">Project Contact</div>
                                                    <div>Primary contact person for this project</div>
                                                    {project.contact_email && (
                                                        <div className="mt-1 text-primary">
                                                            📧 {project.contact_email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    {project.estimated_value && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center space-x-1 font-medium cursor-help hover:bg-accent hover:text-accent-foreground px-1 py-0.5 rounded transition-all duration-200">
                                                    <DollarSign className="h-3 w-3 flex-shrink-0 text-green-600" />
                                                    <span>{formatCurrency(project.estimated_value)}</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                                <div className="text-xs">
                                                    <div className="font-medium mb-1">Estimated Project Value</div>
                                                    <div>Total estimated cost for this project</div>
                                                    <div className="mt-1 text-green-600">
                                                        💰 Budget: {formatCurrency(project.estimated_value)}
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    {project.due_date && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={handleDueDateClick}
                                                    className="flex items-center space-x-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground px-1 py-0.5 rounded transition-all duration-200 group cursor-pointer"
                                                >
                                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                                    <span>{formatDate(project.due_date)}</span>
                                                    <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                                <div className="text-xs">
                                                    <div className="font-medium mb-1">Project Due Date</div>
                                                    <div>Target completion date for this project</div>
                                                    <div className="mt-1 text-blue-600">
                                                        📅 Click to view in calendar
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center space-x-1 text-muted-foreground cursor-help hover:bg-accent hover:text-accent-foreground px-1 py-0.5 rounded transition-all duration-200">
                                                <ClockIcon className="h-3 w-3 flex-shrink-0" />
                                                <span>{project.days_in_stage} days</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <div className="text-xs">
                                                <div className="font-medium mb-1">Days in Current Stage</div>
                                                <div>Time spent in the current workflow stage</div>
                                                <div className="mt-1 text-blue-600">
                                                    ⏱️ Stage: {project.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
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
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </TooltipProvider>
    );
}

// Helper component to display project contact
function ProjectContactDisplay({ project }: { project: Project }) {
    // Use the current assigned_to field with fallback to legacy assignee_id
    const assigneeId = project.assigned_to || project.assignee_id;
    const assigneeDisplayName = useUserDisplayName(assigneeId);

    if (project.contact_name) {
        return <span>{project.contact_name}</span>;
    }

    if (assigneeId) {
        return <span>{assigneeDisplayName}</span>;
    }

    return <span>Unassigned</span>;
}
