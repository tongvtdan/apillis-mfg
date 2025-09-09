// Core Approvals Module Exports
// This module provides approval workflows, decision management, and audit trail functionality

export { ApprovalProvider, useApproval } from './ApprovalProvider';
export type { ApprovalContextType } from './ApprovalProvider';

export {
    useApproval as useApprovalCore,
    useCurrentApprovals,
    useApprovalDecisions,
    useApprovalRequests,
    useEntityApprovals,
    useApprovalStats,
    useApprovalData,
    useDocumentApprovals,
    useRFQApprovals,
    useProjectApprovals,
    useHasPendingApprovals,
    useApprovalSummary
} from './useApproval';

export {
    ApprovalButton,
    ApprovalButtonCompact,
    ApprovalStatusIndicator
} from './ApprovalButton';

export {
    ApprovalHistoryTimeline,
    ApprovalHistoryCompact
} from './ApprovalHistoryTimeline';
