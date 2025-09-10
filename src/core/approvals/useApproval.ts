import { ApprovalContextType } from './ApprovalProvider';
import { useApproval as useApprovalProvider } from './ApprovalProvider';

/**
 * Custom hook to access approval context
 * Provides type-safe access to approval state and methods
 * Re-exports the useApproval hook from ApprovalProvider for consistency
 */
export const useApproval = useApprovalProvider;

/**
 * Hook to get current approval state
 * Returns approvals, loading, and error status
 */
export function useCurrentApprovals() {
    const {
        approvals,
        pendingApprovals,
        approvalStats,
        loading,
        error
    } = useApproval();

    return {
        approvals,
        pendingApprovals,
        approvalStats,
        loading,
        error,
        hasPendingApprovals: pendingApprovals.length > 0,
        totalApprovals: approvals.length
    };
}

/**
 * Hook to manage approval decisions
 * Provides methods for approving/rejecting approvals
 */
export function useApprovalDecisions() {
    const {
        submitDecision,
        bulkApprove,
        bulkReject,
        loading
    } = useApproval();

    return {
        submitDecision,
        bulkApprove,
        bulkReject,
        loading
    };
}

/**
 * Hook to manage approval requests
 * Provides methods for creating and delegating approvals
 */
export function useApprovalRequests() {
    const {
        requestApproval,
        delegateApproval,
        loading
    } = useApproval();

    return {
        requestApproval,
        delegateApproval,
        loading
    };
}

/**
 * Hook to get entity-specific approvals
 * Provides methods for filtering approvals by entity type
 */
export function useEntityApprovals() {
    const {
        getDocumentApprovals,
        getRFQApprovals,
        getProjectApprovals,
        getEntityApprovalHistory
    } = useApproval();

    return {
        getDocumentApprovals,
        getRFQApprovals,
        getProjectApprovals,
        getEntityApprovalHistory
    };
}

/**
 * Hook to manage approval statistics
 * Provides methods for fetching and refreshing approval stats
 */
export function useApprovalStats() {
    const {
        approvalStats,
        getApprovalStats,
        refreshApprovals,
        loading
    } = useApproval();

    return {
        approvalStats,
        getApprovalStats,
        refreshApprovals,
        loading
    };
}

/**
 * Hook to manage approval data fetching
 * Provides methods for fetching and refreshing approval data
 */
export function useApprovalData() {
    const {
        fetchApprovals,
        refreshApprovals,
        loading
    } = useApproval();

    return {
        fetchApprovals,
        refreshApprovals,
        loading
    };
}

/**
 * Hook to get approvals for a specific document
 * Returns filtered approvals for the document
 */
export function useDocumentApprovals(documentId: string) {
    const { getDocumentApprovals } = useApproval();

    return {
        approvals: getDocumentApprovals(documentId),
        pendingApprovals: getDocumentApprovals(documentId).filter(a => a.status === 'pending'),
        approvedApprovals: getDocumentApprovals(documentId).filter(a => a.status === 'approved'),
        rejectedApprovals: getDocumentApprovals(documentId).filter(a => a.status === 'rejected')
    };
}

/**
 * Hook to get approvals for a specific RFQ
 * Returns filtered approvals for the RFQ
 */
export function useRFQApprovals(rfqId: string) {
    const { getRFQApprovals } = useApproval();

    return {
        approvals: getRFQApprovals(rfqId),
        pendingApprovals: getRFQApprovals(rfqId).filter(a => a.status === 'pending'),
        approvedApprovals: getRFQApprovals(rfqId).filter(a => a.status === 'approved'),
        rejectedApprovals: getRFQApprovals(rfqId).filter(a => a.status === 'rejected')
    };
}

/**
 * Hook to get approvals for a specific project
 * Returns filtered approvals for the project
 */
export function useProjectApprovals(projectId: string) {
    const { getProjectApprovals } = useApproval();

    return {
        approvals: getProjectApprovals(projectId),
        pendingApprovals: getProjectApprovals(projectId).filter(a => a.status === 'pending'),
        approvedApprovals: getProjectApprovals(projectId).filter(a => a.status === 'approved'),
        rejectedApprovals: getProjectApprovals(projectId).filter(a => a.status === 'rejected')
    };
}

/**
 * Hook to check if user has pending approvals
 * Returns boolean indicating if user has pending approvals
 */
export function useHasPendingApprovals() {
    const { pendingApprovals } = useApproval();

    return {
        hasPendingApprovals: pendingApprovals.length > 0,
        pendingCount: pendingApprovals.length,
        pendingApprovals
    };
}

/**
 * Hook to get approval statistics summary
 * Returns summary statistics for approvals
 */
export function useApprovalSummary() {
    const { approvalStats, approvals } = useApproval();

    const summary = {
        total: approvals.length,
        pending: approvals.filter(a => a.status === 'pending').length,
        approved: approvals.filter(a => a.status === 'approved').length,
        rejected: approvals.filter(a => a.status === 'rejected').length,
        overdue: approvals.filter(a => {
            if (a.status !== 'pending' || !a.due_date) return false;
            return new Date(a.due_date) < new Date();
        }).length
    };

    return {
        ...summary,
        approvalRate: summary.total > 0 ? (summary.approved / summary.total) * 100 : 0,
        rejectionRate: summary.total > 0 ? (summary.rejected / summary.total) * 100 : 0,
        stats: approvalStats
    };
}
