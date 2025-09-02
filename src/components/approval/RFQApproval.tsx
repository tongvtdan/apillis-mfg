import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Users,
    Shield,
    UserPlus,
    UserCheck
} from 'lucide-react';
import { useCentralizedApprovals } from '@/hooks/useCentralizedApprovals';
import { ApprovalStatusWidget } from './ApprovalStatusWidget';
import { ApproverAssignmentModal } from './ApproverAssignmentModal';
import { ApprovalHistoryList } from './ApprovalHistoryList';
import type { RFQ } from '@/types/rfq';

interface RFQApprovalProps {
    rfq: RFQ;
    projectId: string;
    organizationId: string;
    onApprovalUpdate?: () => void;
}

export function RFQApproval({
    rfq,
    projectId,
    organizationId,
    onApprovalUpdate
}: RFQApprovalProps) {
    const { createApproval, submitApprovalDecision, getEntityApprovalHistory } = useCentralizedApprovals();
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [decisionComments, setDecisionComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [approvalHistory, setApprovalHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Load approval history when component mounts
    useEffect(() => {
        const loadApprovalHistory = async () => {
            setLoadingHistory(true);
            try {
                const history = await getEntityApprovalHistory('rfq', rfq.id);
                setApprovalHistory(history);
            } catch (error) {
                console.error('Error loading approval history:', error);
            } finally {
                setLoadingHistory(false);
            }
        };

        loadApprovalHistory();
    }, [rfq.id, getEntityApprovalHistory]);

    // Request RFQ approval
    const handleRequestApproval = async () => {
        try {
            const approval = await createApproval({
                approval_type: 'purchase_order',
                title: `RFQ Approval: ${rfq.rfq_number}`,
                description: `Approval required for RFQ: ${rfq.project_name}`,
                entity_type: 'rfq',
                entity_id: rfq.id,
                current_approver_id: '', // Will be assigned based on roles
                priority: 'normal',
                request_reason: 'RFQ requires approval before sending to suppliers'
            });

            if (approval) {
                onApprovalUpdate?.();
            }
        } catch (error) {
            console.error('Error requesting RFQ approval:', error);
        }
    };

    // Submit approval decision
    const handleSubmitDecision = async (decision: 'approved' | 'rejected') => {
        // In a real implementation, we would find the existing approval for this RFQ
        // For now, we'll just show a message
        setIsSubmitting(true);
        try {
            // This is a placeholder - in a real implementation, we would:
            // 1. Find the existing approval for this RFQ
            // 2. Submit the decision using submitApprovalDecision
            // 3. Update the UI accordingly

            // For demo purposes, we'll just show a success message
            alert(`RFQ ${decision} successfully! In a real implementation, this would update the RFQ status.`);

            setDecisionComments('');
            onApprovalUpdate?.();
        } catch (error) {
            console.error('Error submitting decision:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // For now, we'll show a simplified approval status
    // In a real implementation, this would connect to the actual approval system
    const approvalStatus = {
        status: 'pending' as const,
        required: ['Procurement Manager', 'Finance'],
        approved: [],
        pending: [{ approver_role: 'Procurement Manager' }],
        rejected: [],
        isComplete: false
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        RFQ Approval
                    </div>
                    <Badge variant="outline">RFQ Approval</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{rfq.rfq_number}</span>
                    </div>
                    <Badge variant="secondary">Pending Review</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Project</Label>
                        <p className="text-sm">{rfq.project_name}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                        <p className="text-sm">{rfq.company_name}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Estimated Value</Label>
                        <p className="text-sm">${rfq.estimated_value?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <p className="text-sm capitalize">{rfq.status}</p>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Approval Decision</h4>
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="comments" className="text-sm">
                                Comments
                            </Label>
                            <Textarea
                                id="comments"
                                placeholder="Add comments about your decision..."
                                value={decisionComments}
                                onChange={(e) => setDecisionComments(e.target.value)}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleSubmitDecision('rejected')}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                onClick={() => handleSubmitDecision('approved')}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Actions</h4>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAssignmentModal(true)}
                            >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Assign Reviewers
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => alert('Delegation functionality coming soon...')}
                            >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Delegate
                            </Button>
                        </div>
                    </div>
                </div>

                {showAssignmentModal && (
                    <ApproverAssignmentModal
                        isOpen={showAssignmentModal}
                        onClose={() => setShowAssignmentModal(false)}
                        projectId={projectId}
                        stageId="" // Not applicable for RFQs
                        organizationId={organizationId}
                        approvalRoles={['Procurement Manager', 'Finance']}
                        onAssign={() => {
                            setShowAssignmentModal(false);
                            onApprovalUpdate?.();
                        }}
                    />
                )}

                {/* Approval History */}
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Approval History</h4>
                    {loadingHistory ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Loading approval history...</p>
                        </div>
                    ) : approvalHistory.length > 0 ? (
                        <ApprovalHistoryList history={approvalHistory} />
                    ) : (
                        <p className="text-sm text-muted-foreground">No approval history available for this RFQ.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}