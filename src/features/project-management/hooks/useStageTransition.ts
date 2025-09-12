import { useState, useCallback } from 'react';
import { Project, WorkflowStage } from '@/types/project';
import { workflowStageService } from '@/services/workflowStageService';
import { prerequisiteChecker, PrerequisiteResult } from '@/services/prerequisiteChecker';
import { stageHistoryService } from '@/services/stageHistoryService';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

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
    estimatedDuration?: number;
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

                if (!validationResult?.isValid) {
                    const errors = validationResult?.errors || ['Unknown validation error'];
                    toast({
                        variant: "destructive",
                        title: "Cannot Transition Stage",
                        description: errors.join(', ')
                    });
                    return false;
                }

                // Show warnings if any
                if (validationResult.warnings && validationResult.warnings.length > 0) {
                    console.warn('Stage transition warnings:', validationResult.warnings);
                }
            }

            // Execute the transition
            await updateProjectStage(targetStage.id);

            // Record the transition in history
            await stageHistoryService.recordStageTransition(
                project.id,
                project.current_stage_id || '',
                targetStage.id,
                user.id,
                options.reason || 'Stage transition executed',
                options.bypassReason
            );

            // Reset state
            setState(prev => ({
                ...prev,
                validationResult: null,
                error: null
            }));

            toast({
                title: "Stage Transition Complete",
                description: `Project moved to ${targetStage.name}`
            });

            return true;

        } catch (error) {
            console.error('Error executing stage transition:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to execute stage transition';

            setState(prev => ({ ...prev, error: errorMessage }));

            toast({
                variant: "destructive",
                title: "Transition Failed",
                description: errorMessage
            });

            return false;
        } finally {
            setState(prev => ({ ...prev, isTransitioning: false }));
        }
    }, [user, validateTransition, toast]);

    /**
     * Get available transition options for a project
     */
    const getAvailableTransitions = useCallback(async (project: Project): Promise<WorkflowStage[]> => {
        try {
            if (!project.current_stage_id) {
                // If no current stage, get initial stages
                return await workflowStageService.getInitialStages();
            }

            // Get stages that can be transitioned to from current stage
            return await workflowStageService.getAvailableTransitions(project.current_stage_id);
        } catch (error) {
            console.error('Error getting available transitions:', error);
            return [];
        }
    }, []);

    /**
     * Check if a transition is allowed
     */
    const canTransitionTo = useCallback(async (
        project: Project,
        targetStage: WorkflowStage
    ): Promise<boolean> => {
        try {
            const availableStages = await getAvailableTransitions(project);
            return availableStages.some(stage => stage.id === targetStage.id);
        } catch (error) {
            console.error('Error checking transition availability:', error);
            return false;
        }
    }, [getAvailableTransitions]);

    return {
        state,
        validateTransition,
        executeTransition,
        getAvailableTransitions,
        canTransitionTo,
        clearError: () => setState(prev => ({ ...prev, error: null }))
    };
}
