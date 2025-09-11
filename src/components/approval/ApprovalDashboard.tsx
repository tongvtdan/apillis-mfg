import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrentApprovals } from '@/core/approvals/useApproval';
import { useApproval } from '@/core/approvals/useApproval';
import { ApprovalModal } from './ApprovalModal';
import { ApprovalHistoryList } from './ApprovalHistoryList';
import { BulkApprovalModal } from './BulkApprovalModal';
import { ApprovalDelegationModal } from './ApprovalDelegationModal';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    User,
    FileText,
    CheckSquare,
    Square,
    UserCheck,
    File,
    Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ApprovalDashboard() {
    const { pendingApprovals, loading } = useCurrentApprovals();
    const approvalHistory: any[] = []; // TODO: Implement approval history fetching
    const { pendingApprovals: centralizedPendingApprovals, loading: centralizedLoading } = useApproval();
    const [activeEntityType, setActiveEntityType] = useState('all'); // 'all', 'project', 'document', 'rfq'

    // Filter approvals by entity type
    const filteredApprovals = pendingApprovals.filter(approval => {
        if (activeEntityType === 'all') return true;
        // For legacy approvals, we need to check the metadata or context
        // For centralized approvals, we can check the entity_type field
        return approval.metadata?.entity_type === activeEntityType ||
            approval.metadata?.type === activeEntityType;
    });
    const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
    const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
    const [showDelegationModal, setShowDelegationModal] = useState(false);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-orange-500" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleSelectApproval = (approvalId: string, checked: boolean) => {
        if (checked) {
            setSelectedApprovals(prev => [...prev, approvalId]);
        } else {
            setSelectedApprovals(prev => prev.filter(id => id !== approvalId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedApprovals(pendingApprovals.map(a => a.id));
        } else {
            setSelectedApprovals([]);
        }
    };

    const handleBulkApproval = () => {
        if (selectedApprovals.length > 0) {
            setShowBulkModal(true);
        }
    };

    const handleBulkApprovalComplete = () => {
        setSelectedApprovals([]);
        setBulkSelectionMode(false);
        setShowBulkModal(false);
    };

    const handleDelegateApprovals = () => {
        if (selectedApprovals.length > 0) {
            setShowDelegationModal(true);
        }
    };

    const handleDelegationComplete = () => {
        setSelectedApprovals([]);
        setBulkSelectionMode(false);
        setShowDelegationModal(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading approvals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {pendingApprovals.filter(a =>
                                        a.due_date && new Date(a.due_date) < new Date()
                                    ).length}
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {approvalHistory.filter(a =>
                                        a.completed_at &&
                                        new Date(a.completed_at).toDateString() === new Date().toDateString()
                                    ).length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter by entity type */}
            <div className="flex gap-2 mb-4">
                <Button
                    variant={activeEntityType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveEntityType('all')}
                >
                    All Types
                </Button>
                <Button
                    variant={activeEntityType === 'project' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveEntityType('project')}
                >
                    <FileText className="w-4 h-4 mr-1" />
                    Projects
                </Button>
                <Button
                    variant={activeEntityType === 'document' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveEntityType('document')}
                >
                    <File className="w-4 h-4 mr-1" />
                    Documents
                </Button>
                <Button
                    variant={activeEntityType === 'rfq' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveEntityType('rfq')}
                >
                    <Users className="w-4 h-4 mr-1" />
                    RFQs
                </Button>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">
                        Pending Approvals ({filteredApprovals.length})
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        Approval History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {filteredApprovals.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                                <p className="text-muted-foreground">
                                    You have no pending approvals at the moment.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {/* Bulk Actions Header */}
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedApprovals.length === filteredApprovals.length}
                                            onCheckedChange={handleSelectAll}
                                            disabled={!bulkSelectionMode}
                                        />
                                        <span className="text-sm font-medium">
                                            {bulkSelectionMode ? 'Select All' : 'Bulk Actions'}
                                        </span>
                                    </div>
                                    {selectedApprovals.length > 0 && (
                                        <Badge variant="secondary">
                                            {selectedApprovals.length} selected
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedApprovals.length > 0 && (
                                        <>
                                            <Button
                                                onClick={handleBulkApproval}
                                                size="sm"
                                                variant="default"
                                            >
                                                Bulk Review ({selectedApprovals.length})
                                            </Button>
                                            <Button
                                                onClick={handleDelegateApprovals}
                                                size="sm"
                                                variant="outline"
                                            >
                                                <UserCheck className="w-4 h-4 mr-1" />
                                                Delegate ({selectedApprovals.length})
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        onClick={() => setBulkSelectionMode(!bulkSelectionMode)}
                                        size="sm"
                                        variant="outline"
                                    >
                                        {bulkSelectionMode ? 'Cancel' : 'Select Multiple'}
                                    </Button>
                                    {!bulkSelectionMode && (
                                        <Button
                                            onClick={() => setShowDelegationModal(true)}
                                            size="sm"
                                            variant="outline"
                                        >
                                            <UserCheck className="w-4 h-4 mr-1" />
                                            Delegate All
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Approval Cards */}
                            <div className="grid gap-4">
                                {filteredApprovals.map((approval) => (
                                    <Card key={approval.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    {bulkSelectionMode && (
                                                        <Checkbox
                                                            checked={selectedApprovals.includes(approval.id)}
                                                            onCheckedChange={(checked) =>
                                                                handleSelectApproval(approval.id, checked as boolean)
                                                            }
                                                            className="mt-1"
                                                        />
                                                    )}
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            {getStatusIcon(approval.status)}
                                                            <div>
                                                                <h3 className="font-semibold">
                                                                    {approval.project?.title || 'Stage Approval Required'}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Stage: {approval.metadata?.stage_name || 'Unknown Stage'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Role: {approval.approver_role} | Due: {approval.due_date ? formatDistanceToNow(new Date(approval.due_date), { addSuffix: true }) : 'No due date'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <User className="w-4 h-4" />
                                                                Role: {approval.approver_role}
                                                            </div>
                                                            {approval.due_date && (
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Due: {formatDistanceToNow(new Date(approval.due_date), { addSuffix: true })}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {approval.comments && (
                                                            <div className="flex items-start gap-2">
                                                                <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                                <p className="text-sm text-muted-foreground">
                                                                    {approval.comments}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {approval.due_date && new Date(approval.due_date) < new Date() && (
                                                        <Badge variant="destructive">Overdue</Badge>
                                                    )}
                                                    {!bulkSelectionMode && (
                                                        <Button
                                                            onClick={() => setSelectedApproval(approval.id)}
                                                            size="sm"
                                                        >
                                                            Review
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <ApprovalHistoryList history={approvalHistory} />
                </TabsContent>
            </Tabs>

            {/* Approval Modal */}
            {selectedApproval && (
                <ApprovalModal
                    approvalId={selectedApproval}
                    isOpen={!!selectedApproval}
                    onClose={() => setSelectedApproval(null)}
                />
            )}

            {/* Bulk Approval Modal */}
            {showBulkModal && (
                <BulkApprovalModal
                    approvalIds={selectedApprovals}
                    isOpen={showBulkModal}
                    onClose={() => setShowBulkModal(false)}
                    onComplete={handleBulkApprovalComplete}
                />
            )}

            {/* Delegation Modal */}
            {showDelegationModal && (
                <ApprovalDelegationModal
                    isOpen={showDelegationModal}
                    onClose={() => setShowDelegationModal(false)}
                    onComplete={handleDelegationComplete}
                    approvalIds={selectedApprovals.length > 0 ? selectedApprovals : undefined}
                />
            )}
        </div>
    );
}