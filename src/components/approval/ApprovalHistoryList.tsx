import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ApprovalHistory } from '@/services/approvalService';
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ApprovalHistoryListProps {
    history: ApprovalHistory[];
}

export function ApprovalHistoryList({ history }: ApprovalHistoryListProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-orange-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (history.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No approval history</h3>
                    <p className="text-muted-foreground">
                        Approval history will appear here once approvals are processed.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Approval History</h3>
                <Badge variant="secondary">{history.length} total</Badge>
            </div>

            <div className="space-y-3">
                {history.map((approval) => (
                    <Card key={approval.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="text-sm">
                                        {getInitials(approval.approver_name)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(approval.status)}
                                            <span className="font-medium">{approval.approver_name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {approval.approver_role}
                                            </Badge>
                                        </div>
                                        <Badge className={getStatusColor(approval.status)}>
                                            {approval.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>
                                                {approval.completed_at
                                                    ? `Completed ${formatDistanceToNow(new Date(approval.completed_at), { addSuffix: true })}`
                                                    : `Created ${formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}`
                                                }
                                            </span>
                                        </div>
                                        {approval.completed_at && (
                                            <span className="text-xs">
                                                {format(new Date(approval.completed_at), 'MMM dd, yyyy HH:mm')}
                                            </span>
                                        )}
                                    </div>

                                    {approval.comments && (
                                        <div className="bg-muted p-3 rounded-md">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="text-sm">{approval.comments}</p>
                                                    {approval.decision_reason && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            <strong>Rationale:</strong> {approval.decision_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}