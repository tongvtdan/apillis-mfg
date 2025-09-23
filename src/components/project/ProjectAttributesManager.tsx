import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle,
    Play,
    Pause,
    RotateCcw,
    Loader2,
    ArrowRight,
    Star,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus, ProjectPriority, WorkflowStage } from "@/types/project";
import { projectService } from "@/services/projectService";
import { useToast } from "@/shared/hooks/use-toast";

interface ProjectAttributesManagerProps {
    project: Project;
    workflowStages?: WorkflowStage[];
    onUpdate?: (updatedProject: Project) => void;
    className?: string;
}

interface StatusTransition {
    from: ProjectStatus;
    to: ProjectStatus;
    label: string;
    icon: React.ElementType;
    color: string;
    requiresConfirmation: boolean;
    requiresReason?: boolean;
    validationRules?: (project: Project) => string | null;
}

export function ProjectAttributesManager({
    project,
    workflowStages = [],
    onUpdate,
    className
}: ProjectAttributesManagerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedTransition, setSelectedTransition] = useState<StatusTransition | null>(null);
    const [reason, setReason] = useState('');
    const [optimisticProject, setOptimisticProject] = useState<Project>(project);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const { toast } = useToast();

    // Update optimistic project when prop changes
    useEffect(() => {
        setOptimisticProject(project);
    }, [project]);

    // Optimistic update function
    const updateOptimisticProject = useCallback((updates: Partial<Project>) => {
        setOptimisticProject(prev => ({
            ...prev,
            ...updates,
            updated_at: new Date().toISOString()
        }));
    }, []);

    // Priority options - matching database enum values
    const priorityOptions = [
        { value: 'low', label: 'Low', icon: TrendingUp, color: 'text-green-600' },
        { value: 'normal', label: 'Normal', icon: Star, color: 'text-yellow-600' },
        { value: 'high', label: 'High', icon: AlertTriangle, color: 'text-orange-600' },
        { value: 'urgent', label: 'Urgent', icon: AlertCircle, color: 'text-red-600' }
    ];

    // Define status transitions with validation rules
    const statusTransitions: StatusTransition[] = [
        {
            from: 'active',
            to: 'on_hold',
            label: 'Put On Hold',
            icon: Pause,
            color: 'text-yellow-600',
            requiresConfirmation: true,
            requiresReason: true,
            validationRules: (project) => null
        },
        {
            from: 'active',
            to: 'completed',
            label: 'Mark Complete',
            icon: CheckCircle2,
            color: 'text-green-600',
            requiresConfirmation: true,
            validationRules: (project) => {
                const currentStage = workflowStages.find(s => s.id === project.current_stage_id);
                const finalStage = workflowStages[workflowStages.length - 1];
                if (currentStage?.id !== finalStage?.id) {
                    return 'Project must be in the final workflow stage to be marked as complete';
                }
                return null;
            }
        },
        {
            from: 'active',
            to: 'cancelled',
            label: 'Cancel Project',
            icon: XCircle,
            color: 'text-red-600',
            requiresConfirmation: true,
            requiresReason: true,
            validationRules: (project) => null
        },
        {
            from: 'on_hold',
            to: 'active',
            label: 'Resume Project',
            icon: Play,
            color: 'text-green-600',
            requiresConfirmation: false,
            validationRules: (project) => null
        },
        {
            from: 'cancelled',
            to: 'active',
            label: 'Reactivate Project',
            icon: RotateCcw,
            color: 'text-blue-600',
            requiresConfirmation: true,
            requiresReason: true,
            validationRules: (project) => null
        }
    ];

    // Get available transitions for current status
    const availableTransitions = statusTransitions.filter(transition =>
        transition.from === optimisticProject.status
    );

    // Get status info for display
    const getStatusInfo = (status: ProjectStatus) => {
        const statusMap = {
            active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: Play },
            on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800', icon: Pause },
            completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
            cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
        };
        return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
    };

    // Handle priority change
    const handlePriorityChange = async (newPriority: string) => {
        setIsLoading(true);
        setIsUpdating('priority_level');

        // Optimistic update - immediately update UI
        updateOptimisticProject({ priority_level: newPriority as ProjectPriority });

        try {
            const updateData: Partial<Project> = {
                priority_level: newPriority as ProjectPriority
            };

            const updatedProject = await projectService.updateProject(project.id, updateData);
            onUpdate?.(updatedProject);

            toast({
                title: "Priority Updated",
                description: `Project priority has been updated to ${newPriority}.`,
            });
        } catch (error) {
            console.error('Failed to update priority:', error);

            // Rollback optimistic update on error
            updateOptimisticProject({ priority_level: project.priority_level });

            toast({
                title: "Update Failed",
                description: error instanceof Error ? error.message : "Failed to update priority",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsUpdating(null);
        }
    };

    // Handle status change
    const handleStatusChange = async (transition: StatusTransition) => {
        if (transition.validationRules) {
            const validationError = transition.validationRules(optimisticProject);
            if (validationError) {
                toast({
                    title: "Validation Error",
                    description: validationError,
                    variant: "destructive",
                });
                return;
            }
        }

        if (transition.requiresConfirmation) {
            setSelectedTransition(transition);
            setShowConfirmDialog(true);
            return;
        }

        await executeStatusChange(transition, '');
    };

    // Execute the status change
    const executeStatusChange = async (transition: StatusTransition, reason: string) => {
        setIsLoading(true);
        setIsUpdating('status');

        // Optimistic update - immediately update UI
        updateOptimisticProject({ status: transition.to });

        try {
            const updateData: Partial<Project> = {
                status: transition.to
            };

            if (reason.trim()) {
                const timestamp = new Date().toISOString();
                const statusChangeNote = `[${timestamp}] Status changed from ${transition.from} to ${transition.to}: ${reason}`;
                updateData.notes = optimisticProject.notes
                    ? `${optimisticProject.notes}\n\n${statusChangeNote}`
                    : statusChangeNote;

                updateOptimisticProject({ notes: updateData.notes });
            }

            const updatedProject = await projectService.updateProject(project.id, updateData);
            onUpdate?.(updatedProject);

            toast({
                title: "Status Updated",
                description: `Project status changed to ${getStatusInfo(transition.to).label}`,
            });

            setShowConfirmDialog(false);
            setSelectedTransition(null);
            setReason('');
        } catch (error) {
            console.error('Failed to update project status:', error);

            updateOptimisticProject({
                status: project.status,
                notes: project.notes
            });

            toast({
                title: "Update Failed",
                description: error instanceof Error ? error.message : "Failed to update status",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsUpdating(null);
        }
    };

    const currentStatusInfo = getStatusInfo(optimisticProject.status);
    const currentPriority = priorityOptions.find(p => p.value === optimisticProject.priority_level) || priorityOptions[1];

    return (
        <>
            <Card className={cn("transition-all duration-300", className)}>
                <CardHeader>
                    <CardTitle className="text-lg">Project Attributes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Priority Management */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Priority Level
                        </Label>
                        <div className={cn(
                            "transition-all duration-200",
                            isUpdating === 'priority_level' && "opacity-75"
                        )}>
                            <Select
                                value={optimisticProject.priority_level || 'normal'}
                                onValueChange={handlePriorityChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map((option) => {
                                        const IconComponent = option.icon;
                                        return (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center space-x-2">
                                                    <IconComponent className={cn("w-4 h-4", option.color)} />
                                                    <span>{option.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Status Management */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Current Status
                        </Label>
                        <div className={cn(
                            "flex items-center space-x-2 transition-all duration-200",
                            isUpdating === 'status' && "opacity-75"
                        )}>
                            <Badge className={currentStatusInfo.color}>
                                <currentStatusInfo.icon className="w-3 h-3 mr-1" />
                                {currentStatusInfo.label}
                            </Badge>
                        </div>

                        {/* Status Actions */}
                        {availableTransitions.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Status Actions
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {availableTransitions.map((transition) => {
                                        const IconComponent = transition.icon;
                                        return (
                                            <Button
                                                key={transition.to}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusChange(transition)}
                                                disabled={isLoading}
                                                className={cn(
                                                    "transition-all duration-200",
                                                    transition.color
                                                )}
                                            >
                                                <IconComponent className="w-4 h-4 mr-1" />
                                                {transition.label}
                                                <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {availableTransitions.length === 0 && (
                            <div className="text-sm text-muted-foreground">
                                No status changes available for current state.
                            </div>
                        )}
                    </div>

                    {/* Last Updated */}
                    <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground">
                            Last updated: {optimisticProject.updated_at ?
                                new Date(optimisticProject.updated_at).toLocaleString() :
                                'Unknown'
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Modal
                isOpen={showConfirmDialog}
                onClose={() => {
                    setShowConfirmDialog(false);
                    setSelectedTransition(null);
                    setReason('');
                }}
                title={
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        Confirm Status Change
                    </div>
                }
                description={`Are you sure you want to change the project status from ${selectedTransition ? getStatusInfo(selectedTransition.from).label : ''} to ${selectedTransition ? getStatusInfo(selectedTransition.to).label : ''}?`}
                showDescription={true}
                maxWidth="max-w-md"
            >
                {selectedTransition?.requiresReason && (
                    <div className="space-y-2 mb-4">
                        <Label className="text-sm font-medium">
                            Reason for Change
                        </Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please provide a reason for this status change..."
                            className="min-h-[80px] transition-all duration-200"
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowConfirmDialog(false);
                            setSelectedTransition(null);
                            setReason('');
                        }}
                        disabled={isLoading}
                        className="transition-all duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => executeStatusChange(selectedTransition!, reason)}
                        disabled={isLoading || (selectedTransition?.requiresReason && !reason.trim())}
                        className={cn(
                            "transition-all duration-200",
                            selectedTransition?.color
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : selectedTransition && (
                            <selectedTransition.icon className="w-4 h-4 mr-2" />
                        )}
                        Confirm
                    </Button>
                </div>
            </Modal>
        </>
    );
}
