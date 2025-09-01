import React, { useState, useEffect, useCallback } from 'react';
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
    Square,
    RotateCcw,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus, WorkflowStage } from "@/types/project";
import { projectService } from "@/services/projectService";
import { useToast } from "@/hooks/use-toast";

interface ProjectStatusManagerProps {
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

export function ProjectStatusManager({
    project,
    workflowStages = [],
    onUpdate,
    className
}: ProjectStatusManagerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedTransition, setSelectedTransition] = useState<StatusTransition | null>(null);
    const [reason, setReason] = useState('');
    const [optimisticProject, setOptimisticProject] = useState<Project>(project);
    const [isUpdating, setIsUpdating] = useState(false);
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
            validationRules: (project) => {
                // Can always put active projects on hold
                return null;
            }
        },
        {
            from: 'active',
            to: 'completed',
            label: 'Mark Complete',
            icon: CheckCircle2,
            color: 'text-green-600',
            requiresConfirmation: true,
            validationRules: (project) => {
                // Check if project is in final stage
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
            validationRules: (project) => {
                // Can always cancel active projects
                return null;
            }
        },
        {
            from: 'on_hold',
            to: 'active',
            label: 'Resume Project',
            icon: Play,
            color: 'text-green-600',
            requiresConfirmation: false,
            validationRules: (project) => {
                // Can always resume projects on hold
                return null;
            }
        },
        {
            from: 'cancelled',
            to: 'active',
            label: 'Reactivate Project',
            icon: RotateCcw,
            color: 'text-blue-600',
            requiresConfirmation: true,
            requiresReason: true,
            validationRules: (project) => {
                // Can always reactivate cancelled projects
                return null;
            }
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

    // Handle status change with optimistic updates
    const handleStatusChange = async (transition: StatusTransition) => {
        // Validate the transition
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

        // Execute the status change immediately
        await executeStatusChange(transition, '');
    };

    // Execute the status change
    const executeStatusChange = async (transition: StatusTransition, reason: string) => {
        setIsLoading(true);
        setIsUpdating(true);

        // Optimistic update - immediately update UI
        const optimisticUpdate = { status: transition.to };
        updateOptimisticProject(optimisticUpdate);

        try {
            // Prepare update data
            const updateData: Partial<Project> = {
                status: transition.to
            };

            // Add reason to notes if provided
            if (reason.trim()) {
                const timestamp = new Date().toISOString();
                const statusChangeNote = `[${timestamp}] Status changed from ${transition.from} to ${transition.to}: ${reason}`;
                updateData.notes = optimisticProject.notes
                    ? `${optimisticProject.notes}\n\n${statusChangeNote}`
                    : statusChangeNote;

                // Also update notes optimistically
                updateOptimisticProject({ notes: updateData.notes });
            }

            // Update project
            const updatedProject = await projectService.updateProject(project.id, updateData);

            // Notify parent component
            onUpdate?.(updatedProject);

            // Show success message
            toast({
                title: "Status Updated",
                description: `Project status changed to ${getStatusInfo(transition.to).label}`,
            });

            // Close dialog
            setShowConfirmDialog(false);
            setSelectedTransition(null);
            setReason('');
        } catch (error) {
            console.error('Failed to update project status:', error);

            // Rollback optimistic update on error
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
            setIsUpdating(false);
        }
    };

    const currentStatusInfo = getStatusInfo(optimisticProject.status);

    return (
        <>
            <Card className={cn("transition-all duration-300", className)}>
                <CardHeader>
                    <CardTitle className="text-lg">Project Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current Status Display */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Current Status
                        </Label>
                        <div className={cn(
                            "flex items-center space-x-2 transition-all duration-200",
                            isUpdating && "opacity-75"
                        )}>
                            <Badge className={currentStatusInfo.color}>
                                <currentStatusInfo.icon className="w-3 h-3 mr-1" />
                                {currentStatusInfo.label}
                            </Badge>
                        </div>
                    </div>

                    {/* Available Actions */}
                    {availableTransitions.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                                Available Actions
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
                                                transition.color,
                                                isUpdating && "opacity-75"
                                            )}
                                        >
                                            <IconComponent className="w-4 h-4 mr-1" />
                                            {transition.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No Actions Available */}
                    {availableTransitions.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                            No status changes available for current state.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            {showConfirmDialog && selectedTransition && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-200">
                        <h3 className="text-lg font-semibold mb-4">
                            Confirm Status Change
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Are you sure you want to change the project status from{' '}
                            <span className="font-medium">{getStatusInfo(selectedTransition.from).label}</span> to{' '}
                            <span className="font-medium">{getStatusInfo(selectedTransition.to).label}</span>?
                        </p>

                        {selectedTransition.requiresReason && (
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

                        <div className="flex justify-end space-x-2">
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
                                onClick={() => executeStatusChange(selectedTransition, reason)}
                                disabled={isLoading || (selectedTransition.requiresReason && !reason.trim())}
                                className={cn(
                                    "transition-all duration-200",
                                    selectedTransition.color
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <selectedTransition.icon className="w-4 h-4 mr-2" />
                                )}
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}