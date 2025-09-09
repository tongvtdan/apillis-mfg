import { useContext } from 'react';
import { WorkflowContext, WorkflowContextType } from './WorkflowProvider';

/**
 * Custom hook to access workflow context
 * Provides type-safe access to workflow state and methods
 */
export function useWorkflow(): WorkflowContextType {
    const context = useContext(WorkflowContext);

    if (context === undefined) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }

    return context;
}

/**
 * Hook to get current project workflow state
 * Returns workflow state, loading, and error status
 */
export function useCurrentWorkflow() {
    const { workflowState, loading, error, currentProjectId } = useWorkflow();

    return {
        workflowState,
        loading,
        error,
        currentProjectId,
        project: workflowState?.project,
        currentStage: workflowState?.currentStage,
        subStageProgress: workflowState?.subStageProgress || [],
        pendingApprovals: workflowState?.pendingApprovals || [],
        requiredDocuments: workflowState?.requiredDocuments || [],
        nextPossibleStages: workflowState?.nextPossibleStages || [],
        workflowValidation: workflowState?.workflowValidation
    };
}

/**
 * Hook to manage project stage transitions
 * Provides methods for advancing stages and checking capabilities
 */
export function useStageTransition() {
    const {
        advanceStage,
        canAdvanceToStage,
        getNextPossibleStages,
        getProjectStage,
        loading
    } = useWorkflow();

    return {
        advanceStage,
        canAdvanceToStage,
        getNextPossibleStages,
        getProjectStage,
        loading
    };
}

/**
 * Hook to manage sub-stage progress
 * Provides methods for updating sub-stage status
 */
export function useSubStageProgress() {
    const {
        getSubStageProgress,
        updateSubStageProgress,
        loading
    } = useWorkflow();

    return {
        getSubStageProgress,
        updateSubStageProgress,
        loading
    };
}

/**
 * Hook to manage project status
 * Provides methods for updating project status
 */
export function useProjectStatus() {
    const {
        updateProjectStatus,
        loading
    } = useWorkflow();

    return {
        updateProjectStatus,
        loading
    };
}

/**
 * Hook to manage workflow validation
 * Provides methods for validating workflow state
 */
export function useWorkflowValidation() {
    const {
        validateWorkflow,
        workflowState
    } = useWorkflow();

    return {
        validateWorkflow,
        validation: workflowState?.workflowValidation,
        isValid: workflowState?.workflowValidation?.isValid || false,
        errors: workflowState?.workflowValidation?.errors || [],
        warnings: workflowState?.workflowValidation?.warnings || [],
        requiredActions: workflowState?.workflowValidation?.requiredActions || []
    };
}

/**
 * Hook to manage workflow events and history
 * Provides methods for logging events and retrieving history
 */
export function useWorkflowEvents() {
    const {
        logWorkflowEvent,
        getWorkflowHistory,
        loading
    } = useWorkflow();

    return {
        logWorkflowEvent,
        getWorkflowHistory,
        loading
    };
}

/**
 * Hook to manage workflow cache
 * Provides methods for clearing cache and refreshing state
 */
export function useWorkflowCache() {
    const {
        clearCache,
        refreshWorkflowState,
        loadWorkflowState
    } = useWorkflow();

    return {
        clearCache,
        refreshWorkflowState,
        loadWorkflowState
    };
}

/**
 * Hook to check if project can advance to a specific stage
 * Returns boolean indicating if advancement is possible
 */
export function useCanAdvanceToStage(projectId: string, targetStageId: string) {
    const { canAdvanceToStage, loading } = useWorkflow();

    return {
        canAdvance: canAdvanceToStage,
        loading
    };
}

/**
 * Hook to get next possible stages for a project
 * Returns array of stages that can be advanced to
 */
export function useNextPossibleStages(projectId: string) {
    const { getNextPossibleStages, loading } = useWorkflow();

    return {
        getNextPossibleStages,
        loading
    };
}
