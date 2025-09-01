import React, { useState } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
    const { toast } = useToast();

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
                // Can always cancel active projects, but warn if in progress
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
                // Can always resume on-hold projects
                return null;
            }
        },
        {
            from: 'on_hold',
            to: 'cancelled',
            label: 'Cancel Project',
            icon: XCircle,
            color: 'text-red-600',
            requiresConfirmation: true,
            requiresReason: true,
            validationRules: (project) => {
                // Can always cancel on-hold projects
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
                // Can reactivate cancelled projects with reason
                return null;
            }
        },
        {
            from: 'completed',
            to: 'active',
            label: 'Reopen Project',
            icon: RotateCcw,
            color: 'text-blue-600',
            requiresConfirmation: true,
            requiresReason: true,
            validationRules: (project) => {
                // Can reopen completed projects with reason
                return null;
            }
        }
    ];

    // Get available transitions for current status
    const availableTransitions = statusTransitions.filter(
        transition => transition.from === project.status
    );

    // Get status display info
    const getStatusInfo = (status: ProjectStatus) => {
        const statusConfig = {
            active: {
                label: 'Active',
                icon: Play,
                color: 'bg-green-100 text-green-800 border-green-200',
                description: 'Project is actively being worked on'
            },
            on_hold: {
                label: 'On Hold',
                icon: Pause,
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                description: 'Project is temporarily paused'
            },
            cancelled: {
                label: 'Cancelled',
                icon: XCircle,
                color: 'bg-red-100 text-red-800 border-red-200',
                description: 'Project has been cancelled'
            },
            completed: {
                label: 'Completed',
                icon: CheckCircle2,
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                description: 'Project has been successfully completed'
            }
        };

        return statusConfig[status];
    };

    // Handle status transition
    const handleStatusTransition = (transition: StatusTransition) => {
        // Validate transition
        if (transition.validationRules) {
            const validationError = transition.validationRules(project);
            if (validationError) {
                toast({
                    title: "Cannot Change Status",
                    description: validationError,
                    variant: "destructive",
                });
                return;
            }
        }

        if (transition.requiresConfirmation) {
            setSelectedTransition(transition);
            setReason('');
            setShowConfirmDialog(true);
        } else {
            executeStatusChange(transition, '');
        }
    };

    // Execute the status change
    const executeStatusChange = async (transition: StatusTransition, reason: string) => {
        setIsLoading(true);

        try {
            // Prepare update data
            const updateData: Partial<Project> = {
                status: transition.to
            };

            // Add reason to notes if provided
            if (reason.trim()) {
                const timestamp = new Date().toISOString();
                const statusChangeNote = `[${timestamp}] Status changed from ${transition.from} to ${transition.to}: ${reason}`;
                updateData.notes = project.notes
                    ? `${project.notes}\n\n${statusChangeNote}`
                    : statusChangeNote;
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
            toast({
                title: "Update Failed",
                description: error instanceof Error ? error.message : "Failed to update status",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const currentStatusInfo = getStatusInfo(project.status);

    return (
        <>
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                        <currentStatusInfo.icon className="w-5 h-5" />
                        <span>Project Status</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current Status Display */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Badge className={cn("text-sm", currentStatusInfo.color)}>
                                {currentStatusInfo.label}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                {currentStatusInfo.description}
                            </p>
                        </div>
                    </div>

                    {/* Status Transition Actions */}
                    {availableTransitions.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Available Actions</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {availableTransitions.map((transition) => (
                                    <Button
                                        key={`${transition.from}-${transition.to}`}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusTransition(transition)}
                                        disabled={isLoading}
                                        className="justify-start"
                                    >
                                        <transition.icon className={cn("w-4 h-4 mr-2", transition.color)} />
                                        {transition.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status History Preview */}
                    <div className="pt-3 border-t">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Last Updated
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {project.updated_at
                                ? new Date(project.updated_at).toLocaleString()
                                : 'Unknown'
                            }
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            {selectedTransition && (
                                <>
                                    <selectedTransition.icon className={cn("w-5 h-5", selectedTransition.color)} />
                                    <span>Confirm Status Change</span>
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTransition && (
                                <>
                                    Are you sure you want to change the project status from{' '}
                                    <strong>{getStatusInfo(selectedTransition.from).label}</strong> to{' '}
                                    <strong>{getStatusInfo(selectedTransition.to).label}</strong>?
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTransition?.requiresReason && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                Reason for status change {selectedTransition.requiresReason && '*'}
                            </Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please provide a reason for this status change..."
                                className="min-h-[80px]"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => selectedTransition && executeStatusChange(selectedTransition, reason)}
                            disabled={
                                isLoading ||
                                (selectedTransition?.requiresReason && !reason.trim())
                            }
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                selectedTransition && <selectedTransition.icon className="w-4 h-4 mr-2" />
                            )}
                            Confirm Change
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}