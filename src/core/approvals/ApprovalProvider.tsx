import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Approval, ApprovalFilter, ApprovalCreateData, ApprovalStats, ApprovalHistory } from '@/types/approval';
import { centralizedApprovalService } from '@/services/centralizedApprovalService';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

export interface ApprovalContextType {
    // State
    approvals: Approval[];
    pendingApprovals: Approval[];
    approvalStats: ApprovalStats | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchApprovals: (filter?: ApprovalFilter) => Promise<void>;
    submitDecision: (approvalId: string, decision: 'approved' | 'rejected', comments?: string, reason?: string) => Promise<boolean>;
    requestApproval: (data: ApprovalCreateData) => Promise<Approval | null>;
    delegateApproval: (approvalId: string, delegateUserId: string, reason: string, endDate?: string) => Promise<Approval | null>;

    // Entity-specific helpers
    getDocumentApprovals: (documentId: string) => Approval[];
    getRFQApprovals: (rfqId: string) => Approval[];
    getProjectApprovals: (projectId: string) => Approval[];
    getEntityApprovalHistory: (entityType: string, entityId: string) => Promise<ApprovalHistory[]>;

    // Statistics and analytics
    getApprovalStats: () => Promise<ApprovalStats | null>;
    refreshApprovals: () => Promise<void>;

    // Bulk operations
    bulkApprove: (approvalIds: string[], comments?: string) => Promise<boolean>;
    bulkReject: (approvalIds: string[], reason: string, comments?: string) => Promise<boolean>;
}

export const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
    const [approvalStats, setApprovalStats] = useState<ApprovalStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Fetch approvals with optional filtering
    const fetchApprovals = useCallback(async (filter: ApprovalFilter = {}) => {
        if (!profile?.organization_id) return;

        try {
            setLoading(true);
            setError(null);

            const result = await centralizedApprovalService.getApprovals(
                filter,
                1,
                100, // Get more approvals for better UX
                profile.organization_id
            );

            setApprovals(result.approvals);

            // Update pending approvals
            const pending = result.approvals.filter(approval => approval.status === 'pending');
            setPendingApprovals(pending);

        } catch (err) {
            console.error('Error fetching approvals:', err);
            setError('Failed to fetch approvals');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load approvals"
            });
        } finally {
            setLoading(false);
        }
    }, [profile?.organization_id, toast]);

    // Submit approval decision
    const submitDecision = useCallback(async (
        approvalId: string,
        decision: 'approved' | 'rejected',
        comments?: string,
        reason?: string
    ): Promise<boolean> => {
        try {
            setLoading(true);

            const result = await centralizedApprovalService.submitApprovalDecision(
                approvalId,
                {
                    decision,
                    comments,
                    reason
                }
            );

            if (result) {
                // Refresh approvals after successful decision
                await fetchApprovals();
                await getApprovalStats();

                toast({
                    title: "Decision Submitted",
                    description: `Approval ${decision} successfully`
                });

                return true;
            } else {
                toast({
                    variant: "destructive",
                    title: "Submission Failed",
                    description: "Failed to submit approval decision"
                });
                return false;
            }
        } catch (err) {
            console.error('Error submitting decision:', err);
            setError('Failed to submit approval decision');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to submit approval decision"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchApprovals, toast]);

    // Request new approval
    const requestApproval = useCallback(async (data: ApprovalCreateData): Promise<Approval | null> => {
        if (!profile?.organization_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Organization not found"
            });
            return null;
        }

        try {
            setLoading(true);

            const approval = await centralizedApprovalService.createApproval(
                data,
                profile.organization_id
            );

            if (approval) {
                // Refresh approvals after successful creation
                await fetchApprovals();
                await getApprovalStats();

                toast({
                    title: "Approval Requested",
                    description: "Approval request created successfully"
                });
            }

            return approval;
        } catch (err) {
            console.error('Error requesting approval:', err);
            setError('Failed to request approval');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create approval request"
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [profile?.organization_id, fetchApprovals, toast]);

    // Delegate approval
    const delegateApproval = useCallback(async (
        approvalId: string,
        delegateUserId: string,
        reason: string,
        endDate?: string
    ): Promise<Approval | null> => {
        try {
            setLoading(true);

            const approval = await centralizedApprovalService.delegateApproval(
                approvalId,
                delegateUserId,
                reason,
                endDate
            );

            if (approval) {
                // Refresh approvals after successful delegation
                await fetchApprovals();

                toast({
                    title: "Approval Delegated",
                    description: "Approval delegated successfully"
                });
            }

            return approval;
        } catch (err) {
            console.error('Error delegating approval:', err);
            setError('Failed to delegate approval');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delegate approval"
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchApprovals, toast]);

    // Get entity-specific approvals
    const getDocumentApprovals = useCallback((documentId: string) => {
        return approvals.filter(approval =>
            approval.entity_type === 'document' && approval.entity_id === documentId
        );
    }, [approvals]);

    const getRFQApprovals = useCallback((rfqId: string) => {
        return approvals.filter(approval =>
            approval.entity_type === 'rfq' && approval.entity_id === rfqId
        );
    }, [approvals]);

    const getProjectApprovals = useCallback((projectId: string) => {
        return approvals.filter(approval =>
            approval.entity_type === 'project' && approval.entity_id === projectId
        );
    }, [approvals]);

    // Get approval history for entity
    const getEntityApprovalHistory = useCallback(async (
        entityType: string,
        entityId: string
    ): Promise<ApprovalHistory[]> => {
        try {
            return await centralizedApprovalService.getEntityApprovalHistory(entityType, entityId);
        } catch (err) {
            console.error('Error fetching entity approval history:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load approval history"
            });
            return [];
        }
    }, [toast]);

    // Get approval statistics
    const getApprovalStats = useCallback(async (): Promise<ApprovalStats | null> => {
        if (!profile?.organization_id) return null;

        try {
            const stats = await centralizedApprovalService.getApprovalStats(profile.organization_id);
            setApprovalStats(stats);
            return stats;
        } catch (err) {
            console.error('Error fetching approval stats:', err);
            return null;
        }
    }, [profile?.organization_id]);

    // Refresh all approval data
    const refreshApprovals = useCallback(async () => {
        await Promise.all([
            fetchApprovals(),
            getApprovalStats()
        ]);
    }, [fetchApprovals, getApprovalStats]);

    // Bulk approve
    const bulkApprove = useCallback(async (
        approvalIds: string[],
        comments?: string
    ): Promise<boolean> => {
        try {
            setLoading(true);

            const results = await Promise.all(
                approvalIds.map(id =>
                    centralizedApprovalService.submitApprovalDecision(id, {
                        decision: 'approved',
                        comments
                    })
                )
            );

            const successCount = results.filter(Boolean).length;

            if (successCount > 0) {
                await refreshApprovals();

                toast({
                    title: "Bulk Approval Complete",
                    description: `${successCount} of ${approvalIds.length} approvals processed`
                });
            }

            return successCount === approvalIds.length;
        } catch (err) {
            console.error('Error bulk approving:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to process bulk approval"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [refreshApprovals, toast]);

    // Bulk reject
    const bulkReject = useCallback(async (
        approvalIds: string[],
        reason: string,
        comments?: string
    ): Promise<boolean> => {
        try {
            setLoading(true);

            const results = await Promise.all(
                approvalIds.map(id =>
                    centralizedApprovalService.submitApprovalDecision(id, {
                        decision: 'rejected',
                        reason,
                        comments
                    })
                )
            );

            const successCount = results.filter(Boolean).length;

            if (successCount > 0) {
                await refreshApprovals();

                toast({
                    title: "Bulk Rejection Complete",
                    description: `${successCount} of ${approvalIds.length} approvals processed`
                });
            }

            return successCount === approvalIds.length;
        } catch (err) {
            console.error('Error bulk rejecting:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to process bulk rejection"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [refreshApprovals, toast]);

    // Initial load
    useEffect(() => {
        if (user && profile?.organization_id) {
            fetchApprovals();
            getApprovalStats();
        }
    }, [user, profile?.organization_id, fetchApprovals, getApprovalStats]);

    const value: ApprovalContextType = {
        approvals,
        pendingApprovals,
        approvalStats,
        loading,
        error,
        fetchApprovals,
        submitDecision,
        requestApproval,
        delegateApproval,
        getDocumentApprovals,
        getRFQApprovals,
        getProjectApprovals,
        getEntityApprovalHistory,
        getApprovalStats,
        refreshApprovals,
        bulkApprove,
        bulkReject
    };

    return (
        <ApprovalContext.Provider value={value}>
            {children}
        </ApprovalContext.Provider>
    );
}

export function useApproval() {
    const context = useContext(ApprovalContext);
    if (context === undefined) {
        throw new Error('useApproval must be used within an ApprovalProvider');
    }
    return context;
}
