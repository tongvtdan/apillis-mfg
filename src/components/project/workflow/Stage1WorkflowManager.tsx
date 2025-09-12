import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    Users,
    FileText,
    UserPlus,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Circle,
    AlertCircle
} from "lucide-react";

import { Project, WorkflowStage, WorkflowSubStage, ProjectSubStageProgress } from '@/types/project';
import { projectWorkflowService } from '@/services/projectWorkflowService';
import { WorkflowSubStageService } from '@/services/workflowSubStageService';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { SubStageAssignmentDialog } from './SubStageAssignmentDialog';
import { DocumentValidationPanel } from './DocumentValidationPanel';
import { ActionsNeededList } from './ActionsNeededList';

interface Stage1WorkflowManagerProps {
    project: Project;
    onProjectUpdate?: (project: Project) => void;
    className?: string;
}

interface SubStageWithProgress extends WorkflowSubStage {
    progress?: ProjectSubStageProgress;
    assignedUser?: {
        id: string;
        name: string;
        email: string;
    };
}

export function Stage1WorkflowManager({
    project,
    onProjectUpdate,
    className = ""
}: Stage1WorkflowManagerProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [workflowState, setWorkflowState] = useState<any>(null);
    const [subStages, setSubStages] = useState<SubStageWithProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [assignmentDialog, setAssignmentDialog] = useState<{
        isOpen: boolean;
        subStage: SubStageWithProgress | null;
    }>({
        isOpen: false,
        subStage: null
    });

    // Load workflow state and sub-stages
    useEffect(() => {
        const loadWorkflowData = async () => {
            try {
                setIsLoading(true);

                // Get complete workflow state
                const state = await projectWorkflowService.getProjectWorkflowState(project.id);
                setWorkflowState(state);

                if (state?.currentStage) {
                    // Get sub-stages for current stage
                    const stageSubStages = await WorkflowSubStageService.getSubStagesByStageId(state.currentStage.id);

                    // Get progress for each sub-stage
                    const subStagesWithProgress: SubStageWithProgress[] = await Promise.all(
                        stageSubStages.map(async (subStage) => {
                            const progress = state.subStageProgress.find(p => p.sub_stage_id === subStage.id);

                            // Get assigned user info if assigned
                            let assignedUser = null;
                            if (progress?.assigned_to) {
                                // This would typically fetch user details from a user service
                                // For now, we'll use a placeholder
                                assignedUser = {
                                    id: progress.assigned_to,
                                    name: 'User Name', // Would be fetched from user service
                                    email: 'user@example.com'
                                };
                            }

                            return {
                                ...subStage,
                                progress,
                                assignedUser
                            };
                        })
                    );

                    setSubStages(subStagesWithProgress);
                }
            } catch (error) {
                console.error('Error loading workflow data:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load workflow data. Please try again.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadWorkflowData();
    }, [project.id, toast]);

    // Calculate stage completion
    const stageCompletion = useCallback(() => {
        if (!subStages.length) return { completed: 0, total: 0, percentage: 0 };

        const requiredSubStages = subStages.filter(s => s.is_required);
        const completedRequired = requiredSubStages.filter(s =>
            s.progress?.status === 'completed'
        );

        const completed = completedRequired.length;
        const total = requiredSubStages.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    }, [subStages]);

    // Check if stage can transition to next
    const canTransitionToNext = useCallback(() => {
        const { completed, total } = stageCompletion();
        return completed === total && total > 0;
    }, [stageCompletion]);

    // Get next stage
    const getNextStage = useCallback(() => {
        if (!workflowState?.nextPossibleStages) return null;
        return workflowState.nextPossibleStages.find(stage =>
            stage.stage_order === (workflowState.currentStage?.stage_order || 0) + 1
        );
    }, [workflowState]);

    // Handle sub-stage assignment
    const handleAssignSubStage = useCallback((subStage: SubStageWithProgress) => {
        setAssignmentDialog({
            isOpen: true,
            subStage
        });
    }, []);

    // Handle assignment completion
    const handleAssignmentComplete = useCallback(async (subStageId: string, userId: string) => {
        try {
            // Update sub-stage assignment
            const { error } = await projectWorkflowService.updateSubStageAssignment(
                project.id,
                subStageId,
                userId
            );

            if (error) {
                throw new Error(error);
            }

            // Refresh data
            const state = await projectWorkflowService.getProjectWorkflowState(project.id);
            setWorkflowState(state);

            toast({
                title: "Assignment Updated",
                description: "Sub-stage has been assigned successfully.",
            });

            setAssignmentDialog({
                isOpen: false,
                subStage: null
            });
        } catch (error) {
            console.error('Error assigning sub-stage:', error);
            toast({
                variant: "destructive",
                title: "Assignment Failed",
                description: "Failed to assign sub-stage. Please try again.",
            });
        }
    }, [project.id, toast]);

    // Handle stage transition
    const handleStageTransition = useCallback(async () => {
        const nextStage = getNextStage();
        if (!nextStage) return;

        try {
            setIsTransitioning(true);

            const result = await projectWorkflowService.advanceProjectStage(
                project.id,
                nextStage.id,
                user?.id || '',
                {
                    reason: 'All Stage 1 sub-stages completed'
                }
            );

            if (result.success && result.project) {
                toast({
                    title: "Stage Advanced",
                    description: `Project moved to ${nextStage.name}`,
                });

                if (onProjectUpdate) {
                    onProjectUpdate(result.project);
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error advancing stage:', error);
            toast({
                variant: "destructive",
                title: "Transition Failed",
                description: error instanceof Error ? error.message : "Failed to advance stage.",
            });
        } finally {
            setIsTransitioning(false);
        }
    }, [project.id, getNextStage, user?.id, toast, onProjectUpdate]);

    // Get sub-stage status icon
    const getSubStageStatusIcon = useCallback((subStage: SubStageWithProgress) => {
        const status = subStage.progress?.status || 'pending';

        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'in_progress':
                return <Clock className="w-4 h-4 text-blue-600" />;
            case 'blocked':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default:
                return <Circle className="w-4 h-4 text-gray-400" />;
        }
    }, []);

    // Get sub-stage status color
    const getSubStageStatusColor = useCallback((subStage: SubStageWithProgress) => {
        const status = subStage.progress?.status || 'pending';

        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'in_progress':
                return 'text-blue-600';
            case 'blocked':
                return 'text-red-600';
            default:
                return 'text-gray-500';
        }
    }, []);

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Loading workflow data...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { completed, total, percentage } = stageCompletion();
    const nextStage = getNextStage();

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Stage Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Stage 1: Inquiry Received
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Progress Overview */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Stage Progress</span>
                            <Badge variant="outline">
                                {completed}/{total} completed
                            </Badge>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                            {percentage}% complete - {total - completed} sub-stages remaining
                        </p>
                    </div>

                    {/* Stage Description */}
                    <div className="text-sm text-muted-foreground">
                        <p>
                            Customer RFQ submitted and initial review completed. This stage involves
                            reviewing customer requirements, assessing feasibility, and clarifying
                            any missing information.
                        </p>
                    </div>

                    {/* Exit Criteria */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Exit Criteria</h4>
                        <p className="text-xs text-blue-800">
                            RFQ reviewed, customer requirements understood, initial feasibility assessment completed
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Sub-Stages List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Sub-Stages Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {subStages.map((subStage) => (
                            <div key={subStage.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getSubStageStatusIcon(subStage)}
                                            <h4 className="font-medium">{subStage.name}</h4>
                                            {subStage.is_required && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Required
                                                </Badge>
                                            )}
                                            {subStage.can_skip && (
                                                <Badge variant="outline" className="text-xs">
                                                    Can Skip
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-3">
                                            {subStage.description}
                                        </p>

                                        {/* Assignment Status */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">
                                                {subStage.assignedUser ? (
                                                    <span className="text-green-600">
                                                        Assigned to: {subStage.assignedUser.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-orange-600">
                                                        Not assigned
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        {/* Duration */}
                                        {subStage.estimated_duration_hours && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-muted-foreground">
                                                    Estimated: {subStage.estimated_duration_hours} hours
                                                </span>
                                            </div>
                                        )}

                                        {/* Responsible Roles */}
                                        {subStage.responsible_roles && subStage.responsible_roles.length > 0 && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm text-muted-foreground">
                                                    Responsible: {subStage.responsible_roles.join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assignment Button */}
                                    {!subStage.assignedUser && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAssignSubStage(subStage)}
                                            className="ml-4"
                                        >
                                            <UserPlus className="w-4 h-4 mr-1" />
                                            Assign
                                        </Button>
                                    )}
                                </div>

                                {/* Progress Notes */}
                                {subStage.progress?.notes && (
                                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                                        <strong>Notes:</strong> {subStage.progress.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Document Validation */}
            <DocumentValidationPanel
                project={project}
                currentStage={workflowState?.currentStage}
                requiredDocuments={workflowState?.requiredDocuments || []}
            />

            {/* Actions Needed */}
            <ActionsNeededList
                project={project}
                workflowValidation={workflowState?.workflowValidation}
                subStages={subStages}
            />

            {/* Stage Transition */}
            {canTransitionToNext() && nextStage && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <div>
                                    <h3 className="font-medium text-green-900">
                                        Ready to Advance
                                    </h3>
                                    <p className="text-sm text-green-700">
                                        All required sub-stages completed. Ready to move to {nextStage.name}.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleStageTransition}
                                disabled={isTransitioning}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isTransitioning ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Advancing...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="w-4 h-4 mr-2" />
                                        Advance to {nextStage.name}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Assignment Dialog */}
            <SubStageAssignmentDialog
                isOpen={assignmentDialog.isOpen}
                onClose={() => setAssignmentDialog({ isOpen: false, subStage: null })}
                onAssign={handleAssignmentComplete}
                subStage={assignmentDialog.subStage}
            />
        </div>
    );
}
