import { useState, useCallback } from 'react';
import { Project, WorkflowStage } from '@/types/project';
import { workflowStageService } from '@/services/workflowStageService';
import { prerequisiteChecker, PrerequisiteResult } from '@/services/prerequisiteChecker';
import { stageHistoryService } from '@/services/stageHistoryService';
import { useAuth } from '@/core/auth';
import { useToast } from '@/hooks/use-toast';

export interface StageTransitionState {
    isValidating: boolean;
    isTransitioning: boolean;
    validationResult: PrerequisiteResult | null;
    error: string | null;
}

export interface StageTransitionOptions {
    bypassValidation?: boolean;
    bypassReason?: string;
    reason?: string;
}

export function useStageTransition() {
    const [state, setState] = useState<StageTransitionState>({
        isValidating: false,
        isTransitioning: false,
        validationResult: null,
        error: null
    });

    const { user } = useAuth();
    const { toast } = useToast();

    /**
     * Validate a stage transition
     */
    const validateTransition = useCallback(async (
        project: Project,
        targetStage: WorkflowStage,
        currentStage?: WorkflowStage
    ): Promise<PrerequisiteResult | null> => {
        setState(prev => ({ ...prev, isValidating: true, error: null }));

        try {
            // Perform comprehensive prerequisite checks
            const result = await prerequisiteChecker.checkPrerequisites(
                project,
                targetStage,
                currentStage
            );

            setState(prev => ({ ...prev, validationResult: result }));
            return result;

        } catch (error) {
            console.error('Error validating stage transition:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to validate stage transition';

            setState(prev => ({ ...prev, error: errorMessage }));

            toast({
                variant: "destructive",
                title: "Validation Error",
                description: errorMessage
            });

            return null;
        } finally {
            setState(prev => ({ ...prev, isValidating: false }));
        }
    }, [toast]);

    /**
     * Execute a stage transition
     */
    const executeTransition = useCallback(async (
        project: Project,
        targetStage: WorkflowStage,
        updateProjectStage: (stageId: string) => Promise<void>,
        options: StageTransitionOptions = {}
    ): Promise<boolean> => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to perform stage transitions"
            });
            return false;
        }

        setState(prev => ({ ...prev, isTransitioning: true, error: null }));

        try {
            // Validate the transition first (unless bypassing)
            if (!options.bypassValidation) {
                const currentStageData = project.current_stage_id
                    ? await workflowStageService.getWorkflowStageById(project.current_stage_id)
                    : null;

                const validationResult = await validateTransition(project, targetStage, currentStageData || undefined);

                if (!validationResult?.requiredPassed) {
                    toast({
                        variant: "destructive",
                        title: "Validation Failed",
                        description: "Required prerequisites are not met. Use manager bypass if necessary."
                    });
                    return false;
                }
            }

            // Record the stage transition in history
            try {
                await stageHistoryService.recordStageTransition({
                    projectId: project.id,
                    fromStageId: project.current_stage_id || undefined,
                    toStageId: targetStage.id,
                    userId: user.id,
                    reason: options.reason || (options.bypassValidation ? 'Manager bypass' : 'Normal transition'),
                    bypassRequired: options.bypassValidation || false,
                    bypassReason: options.bypassReason
                });
            } catch (error) {
                console.warn('Failed to record stage transition in activity log:', error);
                // Continue with transition even if logging fails
            }

            // Execute the actual stage update
            await updateProjectStage(targetStage.id);

            toast({
                title: "Stage Updated",
                description: `Project stage changed to ${targetStage.name}`,
            });

            return true;

        } catch (error) {
            console.error('Error executing stage transition:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to execute stage transition';

            setState(prev => ({ ...prev, error: errorMessage }));

            toast({
                variant: "destructive",
                title: "Transition Error",
                description: errorMessage
            });

            return false;
        } finally {
            setState(prev => ({ ...prev, isTransitioning: false }));
        }
    }, [user, toast, validateTransition]);

    /**
     * Check if a stage transition is valid
     */
    const canTransitionToStage = useCallback(async (
        project: Project,
        targetStage: WorkflowStage
    ): Promise<boolean> => {
        try {
            // Basic workflow validation
            const serviceResult = await workflowStageService.validateStageTransition(
                project.current_stage_id || '',
                targetStage.id
            );

            if (!serviceResult.isValid) {
                return false;
            }

            // Prerequisite validation
            const currentStageData = project.current_stage_id
                ? await workflowStageService.getWorkflowStageById(project.current_stage_id)
                : null;

            const prerequisiteResult = await prerequisiteChecker.checkPrerequisites(
                project,
                targetStage,
                currentStageData || undefined
            );

            return prerequisiteResult.requiredPassed;

        } catch (error) {
            console.error('Error checking stage transition validity:', error);
            return false;
        }
    }, []);

    /**
     * Get stage transition recommendations
     */
    const getTransitionRecommendations = useCallback(async (
        project: Project,
        targetStage: WorkflowStage
    ): Promise<{
        canProceed: boolean;
        recommendations: string[];
        blockers: string[];
        warnings: string[];
    }> => {
        try {
            const currentStageData = project.current_stage_id
                ? await workflowStageService.getWorkflowStageById(project.current_stage_id)
                : null;

            const prerequisiteResult = await prerequisiteChecker.checkPrerequisites(
                project,
                targetStage,
                currentStageData || undefined
            );

            const recommendations: string[] = [];
            const blockers: string[] = [];
            const warnings: string[] = [];

            prerequisiteResult.checks.forEach(check => {
                if (check.status === 'failed' && check.required) {
                    blockers.push(`Complete ${check.name}: ${check.details || check.description}`);
                } else if (check.status === 'failed' && !check.required) {
                    recommendations.push(`Consider completing ${check.name}: ${check.details || check.description}`);
                } else if (check.status === 'warning') {
                    warnings.push(`${check.name}: ${check.details || check.description}`);
                }
            });

            return {
                canProceed: prerequisiteResult.requiredPassed,
                recommendations,
                blockers,
                warnings
            };

        } catch (error) {
            console.error('Error getting transition recommendations:', error);
            return {
                canProceed: false,
                recommendations: [],
                blockers: ['Error checking transition requirements'],
                warnings: []
            };
        }
    }, []);

    /**
     * Reset the validation state
     */
    const resetValidation = useCallback(() => {
        setState({
            isValidating: false,
            isTransitioning: false,
            validationResult: null,
            error: null
        });
    }, []);

    return {
        ...state,
        validateTransition,
        executeTransition,
        canTransitionToStage,
        getTransitionRecommendations,
        resetValidation
    };
}