import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    ArrowRight,
    Users,
    FileText,
    MessageSquare,
    Calendar,
    Settings,
    Play,
    Pause,
    X,
    Check,
    AlertCircle
} from "lucide-react";

import { Project, WorkflowStage, ProjectWorkflowState } from '@/types/project';
import { projectWorkflowService } from '@/services/projectWorkflowService';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { useStageTransition } from '@/hooks/useStageTransition';
import { StageTransitionDialog } from './workflow/StageTransitionDialog';

interface ProjectWorkflowOrchestratorProps {
    projectId: string;
    onProjectUpdate?: (project: Project) => void;
    className?: string;
}

export function ProjectWorkflowOrchestrator({
    projectId,
    onProjectUpdate,
    className = ""
}: ProjectWorkflowOrchestratorProps) {
    const [workflowState, setWorkflowState] = useState<ProjectWorkflowState | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [transitioning, setTransitioning] = useState(false);
    const [transitionDialog, setTransitionDialog] = useState<{
        isOpen: boolean;
        targetStage: WorkflowStage | null;
    }>({ isOpen: false, targetStage: null });

    const { user } = useAuth();
    const { toast } = useToast();
    const { executeTransition } = useStageTransition();

    // Load workflow state
    const loadWorkflowState = useCallback(async () => {
        try {
            setLoading(true);
            const state = await projectWorkflowService.getProjectWorkflowState(projectId);
            setWorkflowState(state);
        } catch (error) {
            console.error('Error loading workflow state:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load project workflow state"
            });
        } finally {
            setLoading(false);
        }
    }, [projectId, toast]);

    useEffect(() => {
        loadWorkflowState();
    }, [loadWorkflowState]);

    // Handle stage transition
    const handleStageTransition = async (targetStageId: string, reason?: string, estimatedDuration?: number) => {
        if (!workflowState || !user) return;

        setTransitioning(true);
        try {
            const result = await projectWorkflowService.advanceProjectStage(
                projectId,
                targetStageId,
                user.id,
                { reason, estimatedDuration }
            );

            if (result.success) {
                toast({
                    title: "Stage Updated",
                    description: result.message
                });

                // Reload workflow state
                await loadWorkflowState();

                // Notify parent component
                if (result.project && onProjectUpdate) {
                    onProjectUpdate(result.project);
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Transition Failed",
                    description: result.message
                });
            }
        } catch (error) {
            console.error('Error transitioning stage:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to transition project stage"
            });
        } finally {
            setTransitioning(false);
        }
    };

    // Handle stage transition dialog
    const openStageTransitionDialog = (targetStage: WorkflowStage) => {
        setTransitionDialog({ isOpen: true, targetStage });
    };

    const closeStageTransitionDialog = () => {
        setTransitionDialog({ isOpen: false, targetStage: null });
    };

    const confirmStageTransition = async (bypassRequired: boolean, reason?: string, estimatedDuration?: number) => {
        if (!transitionDialog.targetStage) return;

        await handleStageTransition(
            transitionDialog.targetStage.id,
            reason || `Manual transition to ${transitionDialog.targetStage.name}`,
            estimatedDuration
        );

        closeStageTransitionDialog();
    };

    // Handle status update
    const handleStatusUpdate = async (newStatus: Project['status'], reason?: string) => {
        if (!user) return;

        try {
            const success = await projectWorkflowService.updateProjectStatus(
                projectId,
                newStatus,
                user.id,
                reason
            );

            if (success) {
                toast({
                    title: "Status Updated",
                    description: `Project status changed to ${newStatus}`
                });
                await loadWorkflowState();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to update project status"
                });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update project status"
            });
        }
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!workflowState) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Failed to load project workflow</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { project, currentStage, subStageProgress, pendingApprovals, requiredDocuments, nextPossibleStages, workflowValidation } = workflowState;

    // Calculate overall progress
    const totalSubStages = subStageProgress.length;
    const completedSubStages = subStageProgress.filter(s => s.status === 'completed').length;
    const progressPercentage = totalSubStages > 0 ? (completedSubStages / totalSubStages) * 100 : 0;

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Project Workflow
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Current Stage: {currentStage?.name || 'Not Set'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={workflowValidation.isValid ? "default" : "destructive"}>
                            {workflowValidation.isValid ? "Valid" : "Issues"}
                        </Badge>
                        <Badge variant="outline">
                            {project.status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="progress">Progress</TabsTrigger>
                        <TabsTrigger value="actions">Actions</TabsTrigger>
                        <TabsTrigger value="issues">Issues</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* Workflow Progress */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Overall Progress</span>
                                <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                        </div>

                        {/* Current Stage Info */}
                        {currentStage && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium">Current Stage</h4>
                                    <div className="flex items-center gap-2">
                                        <Badge>{currentStage.name}</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            Order: {currentStage.stage_order}
                                        </span>
                                    </div>
                                    {currentStage.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {currentStage.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium">Stage Details</h4>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{currentStage.estimated_duration_days || 0} days</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>{completedSubStages}/{totalSubStages} tasks</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{pendingApprovals.length}</div>
                                <div className="text-sm text-muted-foreground">Pending Approvals</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{requiredDocuments.length}</div>
                                <div className="text-sm text-muted-foreground">Required Docs</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{nextPossibleStages.length}</div>
                                <div className="text-sm text-muted-foreground">Next Stages</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{workflowValidation.errors.length}</div>
                                <div className="text-sm text-muted-foreground">Issues</div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="progress" className="space-y-4">
                        {/* Sub-stage Progress */}
                        <div className="space-y-3">
                            <h4 className="font-medium">Sub-stage Progress</h4>
                            {subStageProgress.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No sub-stages defined for current stage</p>
                            ) : (
                                subStageProgress.map((progress) => (
                                    <div key={progress.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{progress.sub_stage?.name}</span>
                                                <Badge
                                                    variant={
                                                        progress.status === 'completed' ? 'default' :
                                                            progress.status === 'in_progress' ? 'secondary' :
                                                                'outline'
                                                    }
                                                >
                                                    {progress.status}
                                                </Badge>
                                            </div>
                                            {progress.sub_stage?.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {progress.sub_stage.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {progress.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                            {progress.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-500" />}
                                            {progress.status === 'pending' && <AlertCircle className="h-4 w-4 text-gray-400" />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-4">
                        {/* Stage Transitions */}
                        <div className="space-y-3">
                            <h4 className="font-medium">Stage Transitions</h4>
                            {nextPossibleStages.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No available stage transitions</p>
                            ) : (
                                <div className="grid gap-2">
                                    {nextPossibleStages.map((stage) => (
                                        <Button
                                            key={stage.id}
                                            variant={stage.id === currentStage?.id ? "default" : "outline"}
                                            onClick={() => openStageTransitionDialog(stage)}
                                            disabled={transitioning || stage.id === currentStage?.id}
                                            className="justify-start"
                                        >
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            {stage.name}
                                            {stage.id === currentStage?.id && <CheckCircle className="h-4 w-4 ml-auto" />}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Status Actions */}
                        <div className="space-y-3">
                            <h4 className="font-medium">Status Actions</h4>
                            <div className="flex gap-2">
                                {project.status !== 'completed' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('completed', 'Manual completion')}
                                        disabled={transitioning}
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Mark Complete
                                    </Button>
                                )}
                                {project.status !== 'on_hold' && project.status !== 'completed' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('on_hold', 'Manual hold')}
                                        disabled={transitioning}
                                    >
                                        <Pause className="h-4 w-4 mr-2" />
                                        Put On Hold
                                    </Button>
                                )}
                                {project.status !== 'cancelled' && project.status !== 'completed' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('cancelled', 'Manual cancellation')}
                                        disabled={transitioning}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel Project
                                    </Button>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="issues" className="space-y-4">
                        {/* Validation Issues */}
                        <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Validation Issues
                            </h4>

                            {workflowValidation.errors.length === 0 && workflowValidation.warnings.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-muted-foreground">No issues found</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {workflowValidation.errors.map((error, index) => (
                                        <div key={index} className="flex items-center gap-2 p-3 border border-red-200 rounded-lg bg-red-50">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-700">{error}</span>
                                        </div>
                                    ))}

                                    {workflowValidation.warnings.map((warning, index) => (
                                        <div key={index} className="flex items-center gap-2 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            <span className="text-sm text-yellow-700">{warning}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {workflowValidation.requiredActions.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Required Actions</h4>
                                        {workflowValidation.requiredActions.map((action, index) => (
                                            <div key={index} className="flex items-center gap-2 p-3 border border-blue-200 rounded-lg bg-blue-50">
                                                <ArrowRight className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm text-blue-700">{action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>

        {/* Stage Transition Dialog */ }
    {
        transitionDialog.targetStage && (
            <StageTransitionDialog
                project={workflowState.project}
                targetStage={transitionDialog.targetStage}
                isOpen={transitionDialog.isOpen}
                onClose={closeStageTransitionDialog}
                onConfirm={confirmStageTransition}
            />
        )
    }
    );
}
