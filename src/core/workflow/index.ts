// Core Workflow Module Exports
// This module provides workflow management, stage transitions, and validation functionality

export { WorkflowProvider, useWorkflow } from './WorkflowProvider';
export type {
    WorkflowEvent,
    WorkflowValidation,
    ProjectWorkflowState,
    WorkflowContextType
} from './WorkflowProvider';

export {
    useWorkflow as useWorkflowCore,
    useCurrentWorkflow,
    useStageTransition,
    useSubStageProgress,
    useProjectStatus,
    useWorkflowValidation,
    useWorkflowEvents,
    useWorkflowCache,
    useCanAdvanceToStage,
    useNextPossibleStages
} from './useWorkflow';

export { StageGateBanner, StageGateBannerCompact } from './StageGateBanner';

export {
    ExitCriteriaValidator,
    DocumentRequirementsValidator,
    SubStageCompletionValidator,
    ApprovalRequirementsValidator,
    ProjectStatusValidator,
    CompositeExitCriteriaValidator
} from './exit-criteria/ExitCriteriaValidators';
export type { ExitCriteriaResult } from './exit-criteria/ExitCriteriaValidators';
