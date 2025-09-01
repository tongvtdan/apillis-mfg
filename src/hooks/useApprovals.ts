import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { approvalService, ApprovalRequest, ApprovalHistory } from '@/services/approvalService';

export function useApprovals(projectId?: string) {
    const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
    const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch pending approvals for current user
    const fetchPendingApprovals = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const approvals = await approvalService.getPendingApprovalsForUser(user.id);
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

    // Fetch approval history for a project
    const fetchApprovalHistory = async (projectId: string) => {
        try {
            setLoading(true);
            const history = await approvalService.getApprovalHistory(projectId);
            setApprovalHistory(history);
        } catch (error) {
            console.error('Error fetching approval history:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load approval history.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Submit an approval decision
    const submitApproval = async (
        approvalId: string,
        decision: 'approved' | 'rejected',
        comments?: string,
        decisionReason?: string
    ): Promise<boolean> => {
        try {
            const success = await approvalService.submitApproval(
                approvalId,
                decision,
                comments,
                decisionReason
            );

            if (success) {
                toast({
                    title: 'Success',
                    description: `Approval ${decision} successfully.`
                });

                // Refresh data
                await fetchPendingApprovals();
                if (projectId) {
                    await fetchApprovalHistory(projectId);
                }
            }

            return success;
        } catch (error) {
            console.error('Error submitting approval:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to submit approval decision.'
            });
            return false;
        }
    };

    // Get approval status for a project stage
    const getApprovalStatus = async (projectId: string, stageId: string) => {
        try {
            return await approvalService.getApprovalStatus(projectId, stageId);
        } catch (error) {
            console.error('Error getting approval status:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to get approval status.'
            });
            return null;
        }
    };

    // Auto-assign approvers for a stage
    const autoAssignApprovers = async (
        projectId: string,
        stageId: string,
        organizationId: string
    ) => {
        try {
            const result = await approvalService.autoAssignApprovers(
                projectId,
                stageId,
                organizationId
            );

            if (result.success) {
                toast({
                    title: 'Success',
                    description: result.message
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.message
                });
            }

            return result;
        } catch (error) {
            console.error('Error auto-assigning approvers:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to assign approvers.'
            });
            return { success: false, message: 'Failed to assign approvers' };
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchPendingApprovals();
    }, [user]);

    useEffect(() => {
        if (projectId) {
            fetchApprovalHistory(projectId);
        }
    }, [projectId]);

    return {
        pendingApprovals,
        approvalHistory,
        loading,
        submitApproval,
        getApprovalStatus,
        autoAssignApprovers,
        refetchPendingApprovals: fetchPendingApprovals,
        refetchApprovalHistory: () => projectId ? fetchApprovalHistory(projectId) : Promise.resolve()
    };
}

export function useProjectApprovalStatus(projectId: string, stageId: string) {
    const [approvalStatus, setApprovalStatus] = useState<{
        required: string[];
        pending: ApprovalRequest[];
        approved: ApprovalRequest[];
        rejected: ApprovalRequest[];
        isComplete: boolean;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchApprovalStatus = async () => {
        if (!projectId || !stageId) return;

        try {
            setLoading(true);
            const status = await approvalService.getApprovalStatus(projectId, stageId);
            setApprovalStatus(status);
        } catch (error) {
            console.error('Error fetching approval status:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load approval status.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovalStatus();
    }, [projectId, stageId]);

    return {
        approvalStatus,
        loading,
        refetch: fetchApprovalStatus
    };
}