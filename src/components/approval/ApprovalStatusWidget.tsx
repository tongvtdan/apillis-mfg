import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProjectApprovalStatus } from '@/hooks/useApprovals';
import { ApproverAssignmentModal } from './ApproverAssignmentModal';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Users,
    Shield,
    UserPlus
} from 'lucide-react';

interface ApprovalStatusWidgetProps {
    projectId: string;
    stageId: string;
    onRequestApprovals?: () => void;
    showRequestButton?: boolean;
}

export function ApprovalStatusWidget({
    projectId,
    stageId,
    onRequestApprovals,
    showRequestButton = false
}: ApprovalStatusWidgetProps) {
    const { approvalStatus, loading, refetch } = useProjectApprovalStatus(projectId, stageId);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    // Fetch organization ID
    React.useEffect(() => {
        const fetchOrganizationId = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: user, error } = await supabase
                        .from('users')
                        .select('organization_id')
                        .eq('id', session.user.id)
                        .single();
                    
                    if (!error && user) {
                        setOrganizationId(user.organization_id);
                    }
                }
            } catch (error) {
                console.error('Error fetching organization ID:', error);
            }
        };

        fetchOrganizationId();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">Loading approval status...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!approvalStatus) {
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Unable to load approval status</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { required, pending, approved, rejected, isComplete } = approvalStatus;

    // If no approvals are required
    if (required.length === 0) {
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">No approvals required</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        This stage can proceed without approvals.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const totalRequired = required.length;
    const approvedCount = approved.length;
    const rejectedCount = rejected.length;
    const pendingCount = pending.length;
    const progressPercentage = totalRequired > 0 ? (approvedCount / totalRequired) * 100 : 0;

    const getOverallStatus = () => {
        if (rejectedCount > 0) return { status: 'rejected', color: 'text-red-600', icon: XCircle };
        if (isComplete) return { status: 'approved', color: 'text-green-600', icon: CheckCircle };
        if (pendingCount > 0) return { status: 'pending', color: 'text-orange-600', icon: Clock };
        return { status: 'waiting', color: 'text-gray-600', icon: AlertCircle };
    };

    const overallStatus = getOverallStatus();
    const StatusIcon = overallStatus.icon;

    const handleAssignApprovers = () => {
        setShowAssignmentModal(true);
    };

    const handleAssignmentComplete = () => {
        refetch();
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Approval Status
                    </div>
                    <div className="flex gap-2">
                        {showRequestButton && pendingCount === 0 && approvedCount === 0 && (
                            <Button size="sm" variant="outline" onClick={onRequestApprovals}>
                                Request Approvals
                            </Button>
                        )}
                        {pendingCount === 0 && approvedCount === 0 && (
                            <Button size="sm" variant="outline" onClick={handleAssignApprovers}>
                                <UserPlus className="w-4 h-4 mr-1" />
                                Assign Approvers
                            </Button>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overall Status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${overallStatus.color}`} />
                        <span className={`font-medium ${overallStatus.color}`}>
                            {overallStatus.status.charAt(0).toUpperCase() + overallStatus.status.slice(1)}
                        </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {approvedCount}/{totalRequired} approved
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{approvedCount} approved</span>
                        <span>{pendingCount} pending</span>
                        {rejectedCount > 0 && <span className="text-red-600">{rejectedCount} rejected</span>}
                    </div>
                </div>

                {/* Approval Details */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Required Approvals:</h4>
                    {required.map((role) => {
                        const approvedApproval = approved.find(a => a.approver_role === role);
                        const pendingApproval = pending.find(a => a.approver_role === role);
                        const rejectedApproval = rejected.find(a => a.approver_role === role);

                        let status = 'waiting';
                        let statusColor = 'bg-gray-100 text-gray-800';
                        let statusIcon = AlertCircle;

                        if (approvedApproval) {
                            status = 'approved';
                            statusColor = 'bg-green-100 text-green-800';
                            statusIcon = CheckCircle;
                        } else if (rejectedApproval) {
                            status = 'rejected';
                            statusColor = 'bg-red-100 text-red-800';
                            statusIcon = XCircle;
                        } else if (pendingApproval) {
                            status = 'pending';
                            statusColor = 'bg-orange-100 text-orange-800';
                            statusIcon = Clock;
                        }

                        const StatusIcon = statusIcon;

                        return (
                            <div key={role} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{role}</span>
                                </div>
                                <Badge className={statusColor}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {status}
                                </Badge>
                            </div>
                        );
                    })}
                </div>

                {/* Action Messages */}
                {rejectedCount > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2 text-red-800">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {rejectedCount} approval{rejectedCount > 1 ? 's' : ''} rejected
                            </span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">
                            Address the rejected approvals before proceeding.
                        </p>
                    </div>
                )}

                {isComplete && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">All approvals complete</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                            Stage transition can proceed.
                        </p>
                    </div>
                )}

                {pendingCount > 0 && rejectedCount === 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <div className="flex items-center gap-2 text-orange-800">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {pendingCount} approval{pendingCount > 1 ? 's' : ''} pending
                            </span>
                        </div>
                        <p className="text-xs text-orange-700 mt-1">
                            Notify approvers to review and decide.
                        </p>
                    </div>
                )}

                {/* Approver Assignment Modal */}
                {showAssignmentModal && organizationId && (
                    <ApproverAssignmentModal
                        isOpen={showAssignmentModal}
                        onClose={() => setShowAssignmentModal(false)}
                        projectId={projectId}
                        stageId={stageId}
                        organizationId={organizationId}
                        approvalRoles={required}
                        onAssign={handleAssignmentComplete}
                    />
                )}
            </CardContent>
        </Card>
    );
}