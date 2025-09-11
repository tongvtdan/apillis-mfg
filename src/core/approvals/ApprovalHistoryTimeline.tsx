import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    CheckCircle,
    XCircle,
    Clock,
    UserPlus,
    MessageSquare,
    Calendar,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApprovalHistory } from '@/types/approval';
import { format } from 'date-fns';

interface ApprovalHistoryTimelineProps {
    history: ApprovalHistory[];
    className?: string;
    showComments?: boolean;
    showDelegations?: boolean;
    maxHeight?: string;
}

export function ApprovalHistoryTimeline({
    history,
    className,
    showComments = true,
    showDelegations = true,
    maxHeight = "400px"
}: ApprovalHistoryTimelineProps) {
    if (!history || history.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg">Approval History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        <p>No approval history available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleColor = (role: string) => {
        const roleColors: Record<string, string> = {
            admin: 'bg-red-100 text-red-800',
            management: 'bg-purple-100 text-purple-800',
            engineering: 'bg-blue-100 text-blue-800',
            qa: 'bg-green-100 text-green-800',
            procurement: 'bg-orange-100 text-orange-800',
            production: 'bg-indigo-100 text-indigo-800',
            sales: 'bg-pink-100 text-pink-800'
        };

        return roleColors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Approval History</span>
                    <Badge variant="outline" className="ml-auto">
                        {history.length} entries
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className="space-y-4 overflow-y-auto"
                    style={{ maxHeight }}
                >
                    {history.map((entry, index) => {
                        const statusConfig = getStatusConfig(entry.status);
                        const StatusIcon = statusConfig.icon;
                        const isOverdue = entry.due_date && new Date(entry.due_date) < new Date() && entry.status === 'pending';

                        return (
                            <div key={entry.id} className="flex items-start space-x-3">
                                {/* Timeline line */}
                                {index < history.length - 1 && (
                                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
                                )}

                                {/* Avatar */}
                                <div className="relative">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="" alt={entry.approver_name} />
                                        <AvatarFallback className="text-xs">
                                            {getInitials(entry.approver_name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Status indicator */}
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center",
                                        statusConfig.bgColor,
                                        statusConfig.borderColor
                                    )}>
                                        <StatusIcon className={cn("h-2.5 w-2.5", statusConfig.color)} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-sm">
                                            {entry.approver_name}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={cn("text-xs", getRoleColor(entry.approver_role))}
                                        >
                                            {entry.approver_role}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs",
                                                statusConfig.bgColor,
                                                statusConfig.borderColor,
                                                statusConfig.color
                                            )}
                                        >
                                            {statusConfig.label}
                                        </Badge>
                                        {isOverdue && (
                                            <Badge variant="destructive" className="text-xs">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Overdue
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {entry.completed_at
                                                ? `Completed ${format(new Date(entry.completed_at), 'MMM d, yyyy HH:mm')}`
                                                : `Created ${format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}`
                                            }
                                        </span>
                                    </div>

                                    {/* Comments */}
                                    {showComments && entry.comments && (
                                        <div className="bg-muted/50 rounded-md p-2 mb-2">
                                            <p className="text-sm text-muted-foreground">
                                                {entry.comments}
                                            </p>
                                        </div>
                                    )}

                                    {/* Decision reason */}
                                    {entry.decision_reason && (
                                        <div className="bg-muted/50 rounded-md p-2">
                                            <p className="text-sm">
                                                <span className="font-medium">Reason:</span> {entry.decision_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Compact version of approval history for use in smaller spaces
 */
export function ApprovalHistoryCompact({
    history,
    className,
    maxItems = 5
}: {
    history: ApprovalHistory[];
    className?: string;
    maxItems?: number;
}) {
    if (!history || history.length === 0) {
        return (
            <div className={cn("text-center text-muted-foreground py-4", className)}>
                <Clock className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">No approval history</p>
            </div>
        );
    }

    const displayHistory = history.slice(0, maxItems);
    const hasMore = history.length > maxItems;

    return (
        <div className={cn("space-y-2", className)}>
            {displayHistory.map((entry) => {
                const statusConfig = getStatusConfig(entry.status);
                const StatusIcon = statusConfig.icon;

                return (
                    <div key={entry.id} className="flex items-center space-x-2 text-sm">
                        <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
                        <span className="font-medium">{entry.approver_name}</span>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs",
                                statusConfig.bgColor,
                                statusConfig.borderColor,
                                statusConfig.color
                            )}
                        >
                            {statusConfig.label}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                            {format(new Date(entry.created_at), 'MMM d')}
                        </span>
                    </div>
                );
            })}

            {hasMore && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                    +{history.length - maxItems} more entries
                </div>
            )}
        </div>
    );
}

/**
 * Helper function to get status configuration
 */
function getStatusConfig(status: string) {
    switch (status) {
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
}
