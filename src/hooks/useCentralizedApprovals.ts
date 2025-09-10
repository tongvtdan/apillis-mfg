import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth';
import { useToast } from '@/hooks/use-toast';
import { centralizedApprovalService } from '@/services/centralizedApprovalService';
import {
    Approval,
    ApprovalCreateData,
    ApprovalFilter,
    ApprovalStats,
    ApprovalHistory
} from '@/types/approval';

export function useCentralizedApprovals() {
    const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
    const [approvalStats, setApprovalStats] = useState<ApprovalStats | null>(null);
    const [loading, setLoading] = useState(false);
    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Fetch pending approvals for current user
    const fetchPendingApprovals = async () => {
        if (!user || !profile?.organization_id) return;

        try {
            setLoading(true);
            const approvals = await centralizedApprovalService.getPendingApprovalsForUser(user.id);
            setPendingApprovals(approvals);
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load pending approvals.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch approval stats for organization
    const fetchApprovalStats = async () => {
        if (!profile?.organization_id) return;

        try {
            const stats = await centralizedApprovalService.getApprovalStats(profile.organization_id);
            setApprovalStats(stats);
        } catch (error) {
            console.error('Error fetching approval stats:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load approval statistics.'
            });
        }
    };

    // Submit an approval decision
    const submitApprovalDecision = async (
        approvalId: string,
        decision: 'approved' | 'rejected',
        comments?: string,
        reason?: string
    ) => {
        try {
            const result = await centralizedApprovalService.submitApprovalDecision(
                approvalId,
                {
                    decision,
                    comments,
                    reason
                }
            );

            if (result) {
                toast({
                    title: 'Success',
                    description: `Approval ${decision} successfully.`
                });

                // Refresh data
                await fetchPendingApprovals();
                await fetchApprovalStats();
            }

            return result;
        } catch (error) {
            console.error('Error submitting approval decision:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to submit approval decision.'
            });
            return false;
        }
    };

    // Create a new approval request
    const createApproval = async (
        data: ApprovalCreateData
    ): Promise<Approval | null> => {
        if (!profile?.organization_id) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Organization not found.'
            });
            return null;
        }

        try {
            const approval = await centralizedApprovalService.createApproval(
                data,
                profile.organization_id
            );

            toast({
                title: 'Success',
                description: 'Approval request created successfully.'
            });

            // Refresh data
            await fetchPendingApprovals();
            await fetchApprovalStats();

            return approval;
        } catch (error) {
            console.error('Error creating approval:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to create approval request.'
            });
            return null;
        }
    };

    // Get approvals with filtering
    const getApprovals = async (
        filter: ApprovalFilter = {},
        page: number = 1,
        limit: number = 20
    ) => {
        if (!profile?.organization_id) return { approvals: [], total: 0 };

        try {
            const result = await centralizedApprovalService.getApprovals(
                filter,
                page,
                limit,
                profile.organization_id
            );
            return result;
        } catch (error) {
            console.error('Error fetching approvals:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load approvals.'
            });
            return { approvals: [], total: 0 };
        }
    };

    // Delegate an approval to another user
    const delegateApproval = async (
        approvalId: string,
        delegateUserId: string,
        reason: string,
        endDate?: string
    ) => {
        try {
            const approval = await centralizedApprovalService.delegateApproval(
                approvalId,
                delegateUserId,
                reason,
                endDate
            );

            toast({
                title: 'Success',
                description: 'Approval delegated successfully.'
            });

            // Refresh data
            await fetchPendingApprovals();
            return approval;
        } catch (error) {
            console.error('Error delegating approval:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delegate approval.'
            });
            return null;
        }
    };

    // Get approval history for an entity
    const getEntityApprovalHistory = async (
        entityType: string,
        entityId: string
    ) => {
        try {
            const history = await centralizedApprovalService.getEntityApprovalHistory(entityType, entityId);
            return history;
        } catch (error) {
            console.error('Error fetching entity approval history:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load approval history.'
            });
            return [];
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchPendingApprovals();
        fetchApprovalStats();
    }, [user, profile?.organization_id]);

    return {
        pendingApprovals,
        approvalStats,
        loading,
        submitApprovalDecision,
        createApproval,
        getApprovals,
        delegateApproval,
        getEntityApprovalHistory,
        refetchPendingApprovals: fetchPendingApprovals,
        refetchApprovalStats: fetchApprovalStats
    };
}