import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApprovals } from '@/hooks/useApprovals';
import { ApprovalModal } from './ApprovalModal';
import { ApprovalHistoryList } from './ApprovalHistoryList';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    User,
    FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ApprovalDashboard() {
    const { pendingApprovals, approvalHistory, loading } = useApprovals();
    const [selectedApproval, setSelectedApproval] = useState<string | null>(null);

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

            {/* Main Content */}
            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">
                        Pending Approvals ({pendingApprovals.length})
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        Approval History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingApprovals.length === 0 ? (
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
                        <div className="grid gap-4">
                            {pendingApprovals.map((approval) => (
                                <Card key={approval.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(approval.status)}
                                                    <div>
                                                        <h3 className="font-semibold">
                                                            Stage Approval Required
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Project: {approval.project_id}
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

                                            <div className="flex items-center gap-2">
                                                {approval.due_date && new Date(approval.due_date) < new Date() && (
                                                    <Badge variant="destructive">Overdue</Badge>
                                                )}
                                                <Button
                                                    onClick={() => setSelectedApproval(approval.id)}
                                                    size="sm"
                                                >
                                                    Review
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
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
        </div>
    );
}