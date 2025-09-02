import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCentralizedApprovals } from '@/hooks/useCentralizedApprovals';
import { Approval, ApprovalFilter } from '@/types/approval';

interface ApprovalContextType {
    // State
    approvals: Approval[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchApprovals: (filter?: ApprovalFilter) => Promise<void>;
    submitDecision: (approvalId: string, decision: 'approved' | 'rejected', comments?: string, reason?: string) => Promise<boolean>;
    requestApproval: (data: any) => Promise<Approval | null>;
    delegateApproval: (approvalId: string, delegateUserId: string, reason: string, endDate?: string) => Promise<Approval | null>;

    // Entity-specific helpers
    getDocumentApprovals: (documentId: string) => Approval[];
    getRFQApprovals: (rfqId: string) => Approval[];
    getProjectApprovals: (projectId: string) => Approval[];
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export const ApprovalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        getApprovals,
        submitApprovalDecision,
        createApproval,
        delegateApproval,
        loading
    } = useCentralizedApprovals();

    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchApprovals = async (filter?: ApprovalFilter) => {
        try {
            setError(null);
            const result = await getApprovals(filter);
            setApprovals(result.approvals);
        } catch (err) {
            setError('Failed to fetch approvals');
            console.error('Error fetching approvals:', err);
        }
    };

    const submitDecision = async (
        approvalId: string,
        decision: 'approved' | 'rejected',
        comments?: string,
        reason?: string
    ): Promise<boolean> => {
        try {
            const result = await submitApprovalDecision(approvalId, decision, comments, reason);
            if (result) {
                // Refresh approvals after successful decision
                await fetchApprovals();
            }
            return result;
        } catch (err) {
            setError('Failed to submit approval decision');
            console.error('Error submitting decision:', err);
            return false;
        }
    };

    const requestApproval = async (data: any): Promise<Approval | null> => {
        try {
            const approval = await createApproval(data);
            if (approval) {
                // Refresh approvals after successful creation
                await fetchApprovals();
            }
            return approval;
        } catch (err) {
            setError('Failed to request approval');
            console.error('Error requesting approval:', err);
            return null;
        }
    };

    const delegateApprovalHandler = async (
        approvalId: string,
        delegateUserId: string,
        reason: string,
        endDate?: string
    ): Promise<Approval | null> => {
        try {
            const approval = await delegateApproval(approvalId, delegateUserId, reason, endDate);
            if (approval) {
                // Refresh approvals after successful delegation
                await fetchApprovals();
            }
            return approval;
        } catch (err) {
            setError('Failed to delegate approval');
            console.error('Error delegating approval:', err);
            return null;
        }
    };

    // Entity-specific helpers
    const getDocumentApprovals = (documentId: string) => {
        return approvals.filter(approval =>
            approval.entity_type === 'document' && approval.entity_id === documentId
        );
    };

    const getRFQApprovals = (rfqId: string) => {
        return approvals.filter(approval =>
            approval.entity_type === 'rfq' && approval.entity_id === rfqId
        );
    };

    const getProjectApprovals = (projectId: string) => {
        return approvals.filter(approval =>
            approval.entity_type === 'project' && approval.entity_id === projectId
        );
    };

    // Initial load
    useEffect(() => {
        fetchApprovals();
    }, []);

    return (
        <ApprovalContext.Provider
            value={{
                approvals,
                loading,
                error,
                fetchApprovals,
                submitDecision,
                requestApproval,
                delegateApproval: delegateApprovalHandler,
                getDocumentApprovals,
                getRFQApprovals,
                getProjectApprovals
            }}
        >
            {children}
        </ApprovalContext.Provider>
    );
};

export const useApprovalContext = () => {
    const context = useContext(ApprovalContext);
    if (context === undefined) {
        throw new Error('useApprovalContext must be used within an ApprovalProvider');
    }
    return context;
};