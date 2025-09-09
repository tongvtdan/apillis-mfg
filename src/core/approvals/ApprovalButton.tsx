import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    XCircle,
    Clock,
    UserPlus,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApprovalDecisions, useApprovalRequests } from './useApproval';
import { Approval } from '@/types/approval';

interface ApprovalButtonProps {
    approval: Approval;
    onDecision?: (approvalId: string, decision: 'approved' | 'rejected') => void;
    onDelegate?: (approvalId: string, delegateUserId: string) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showStatus?: boolean;
    disabled?: boolean;
}

export function ApprovalButton({
    approval,
    onDecision,
    onDelegate,
    className,
    size = 'md',
    showStatus = true,
    disabled = false
}: ApprovalButtonProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { submitDecision, loading } = useApprovalDecisions();
    const { delegateApproval } = useApprovalRequests();

    const handleApprove = async () => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        try {
            const success = await submitDecision(approval.id, 'approved');
            if (success && onDecision) {
                onDecision(approval.id, 'approved');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        try {
            const success = await submitDecision(approval.id, 'rejected');
            if (success && onDecision) {
                onDecision(approval.id, 'rejected');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelegate = async (delegateUserId: string) => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        try {
            const success = await delegateApproval(approval.id, delegateUserId, 'Delegated approval');
            if (success && onDelegate) {
                onDelegate(approval.id, delegateUserId);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusConfig = () => {
        switch (approval.status) {
            case 'approved':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    label: 'Approved'
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    label: 'Rejected'
                };
            case 'pending':
            default:
                return {
                    icon: Clock,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    label: 'Pending'
                };
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-2 py-1 text-xs';
            case 'lg':
                return 'px-6 py-3 text-base';
            default:
                return 'px-4 py-2 text-sm';
        }
    };

    const isOverdue = approval.due_date && new Date(approval.due_date) < new Date() && approval.status === 'pending';

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            {showStatus && (
                <Badge
                    variant="outline"
                    className={cn(
                        "flex items-center space-x-1",
                        statusConfig.bgColor,
                        statusConfig.borderColor,
                        statusConfig.color
                    )}
                >
                    <StatusIcon className="h-3 w-3" />
                    <span>{statusConfig.label}</span>
                    {isOverdue && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                </Badge>
            )}

            {approval.status === 'pending' && !disabled && (
                <div className="flex items-center space-x-1">
                    <Button
                        size={size}
                        onClick={handleApprove}
                        disabled={loading || isProcessing}
                        className={cn(
                            "bg-green-600 hover:bg-green-700 text-white",
                            getSizeClasses()
                        )}
                    >
                        {(loading || isProcessing) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle className="h-4 w-4" />
                        )}
                        <span className="ml-1">Approve</span>
                    </Button>

                    <Button
                        size={size}
                        variant="destructive"
                        onClick={handleReject}
                        disabled={loading || isProcessing}
                        className={getSizeClasses()}
                    >
                        {(loading || isProcessing) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        <span className="ml-1">Reject</span>
                    </Button>
                </div>
            )}
        </div>
    );
}

/**
 * Compact approval button for use in lists and tables
 */
export function ApprovalButtonCompact({
    approval,
    onDecision,
    className
}: Omit<ApprovalButtonProps, 'size' | 'showStatus' | 'onDelegate'>) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { submitDecision, loading } = useApprovalDecisions();

    const handleApprove = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            const success = await submitDecision(approval.id, 'approved');
            if (success && onDecision) {
                onDecision(approval.id, 'approved');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            const success = await submitDecision(approval.id, 'rejected');
            if (success && onDecision) {
                onDecision(approval.id, 'rejected');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusColor = () => {
        switch (approval.status) {
            case 'approved':
                return 'text-green-600';
            case 'rejected':
                return 'text-red-600';
            case 'pending':
            default:
                return 'text-yellow-600';
        }
    };

    const isOverdue = approval.due_date && new Date(approval.due_date) < new Date() && approval.status === 'pending';

    return (
        <div className={cn("flex items-center space-x-1", className)}>
            {approval.status === 'pending' ? (
                <div className="flex items-center space-x-1">
                    <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={loading || isProcessing}
                        className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                    >
                        {(loading || isProcessing) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <CheckCircle className="h-3 w-3" />
                        )}
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleReject}
                        disabled={loading || isProcessing}
                        className="h-6 px-2 text-xs"
                    >
                        {(loading || isProcessing) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <XCircle className="h-3 w-3" />
                        )}
                    </Button>
                </div>
            ) : (
                <span className={cn("text-xs font-medium", getStatusColor())}>
                    {approval.status}
                    {isOverdue && ' (Overdue)'}
                </span>
            )}
        </div>
    );
}

/**
 * Approval status indicator without action buttons
 */
export function ApprovalStatusIndicator({
    approval,
    className
}: {
    approval: Approval;
    className?: string;
}) {
    const getStatusConfig = () => {
        switch (approval.status) {
            case 'approved':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    label: 'Approved'
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    label: 'Rejected'
                };
            case 'pending':
            default:
                return {
                    icon: Clock,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    label: 'Pending'
                };
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;
    const isOverdue = approval.due_date && new Date(approval.due_date) < new Date() && approval.status === 'pending';

    return (
        <div className={cn("flex items-center space-x-1", className)}>
            <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
            <span className={cn("text-sm font-medium", statusConfig.color)}>
                {statusConfig.label}
            </span>
            {isOverdue && (
                <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
        </div>
    );
}
