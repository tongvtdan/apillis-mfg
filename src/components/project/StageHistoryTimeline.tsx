import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Clock,
    User,
    ArrowRight,
    Shield,
    CheckCircle,
    AlertTriangle,
    Calendar,
    Timer
} from "lucide-react";
import { ProjectStageHistory } from "@/types/project";
import { stageHistoryService } from "@/services/stageHistoryService";
import { formatDistanceToNow, format } from "date-fns";

interface StageHistoryTimelineProps {
    projectId: string;
    className?: string;
}

interface EnhancedStageHistory extends ProjectStageHistory {
    stage_name?: string;
    user_name?: string;
    user_email?: string;
    bypass_required?: boolean;
    bypass_reason?: string;
}

export function StageHistoryTimeline({ projectId, className }: StageHistoryTimelineProps) {
    const [history, setHistory] = useState<EnhancedStageHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStageHistory();
    }, [projectId]);

    const loadStageHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const stageHistory = await stageHistoryService.getProjectStageHistory(projectId);
            setHistory(stageHistory as EnhancedStageHistory[]);
        } catch (err) {
            console.error('Error loading stage history:', err);
            setError('Failed to load stage history');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'Ongoing';

        if (minutes < 60) {
            return `${minutes}m`;
        } else if (minutes < 1440) { // Less than 24 hours
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        } else {
            const days = Math.floor(minutes / 1440);
            const remainingHours = Math.floor((minutes % 1440) / 60);
            return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
        }
    };

    const getStageIcon = (entry: EnhancedStageHistory, isLast: boolean) => {
        if (entry.bypass_required) {
            return <Shield className="w-5 h-5 text-yellow-600" />;
        }
        if (isLast) {
            return <CheckCircle className="w-5 h-5 text-green-600" />;
        }
        return <ArrowRight className="w-5 h-5 text-blue-600" />;
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Stage History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Clock className="w-6 h-6 animate-spin mr-2" />
                        <span>Loading stage history...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Stage History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button
                        variant="outline"
                        onClick={loadStageHistory}
                        className="mt-4"
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (history.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Stage History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No stage history available</p>
                        <p className="text-sm">Stage transitions will appear here</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Stage History
                    <Badge variant="secondary" className="ml-auto">
                        {history.length} transitions
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {history.map((entry, index) => {
                        const isLast = index === history.length - 1;
                        const isFirst = index === 0;

                        return (
                            <div key={entry.id} className="relative">
                                {/* Timeline line */}
                                {!isLast && (
                                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                                )}

                                <div className="flex items-start gap-4">
                                    {/* Stage icon */}
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-border bg-background flex items-center justify-center">
                                        {getStageIcon(entry, isLast)}
                                    </div>

                                    {/* Stage details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-sm">
                                                    {entry.stage_name || 'Unknown Stage'}
                                                </h4>
                                                {entry.bypass_required && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Manager Bypass
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Timer className="w-3 h-3" />
                                                {formatDuration(entry.duration_minutes)}
                                            </div>
                                        </div>

                                        {/* User and timestamp */}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {entry.user_name || 'Unknown User'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(entry.entered_at), 'MMM d, yyyy HH:mm')}
                                            </div>
                                            <div className="text-muted-foreground/70">
                                                {formatDistanceToNow(new Date(entry.entered_at), { addSuffix: true })}
                                            </div>
                                        </div>

                                        {/* Notes and bypass reason */}
                                        {(entry.notes || entry.bypass_reason) && (
                                            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-2">
                                                {entry.bypass_reason && (
                                                    <div className="mb-1">
                                                        <span className="font-medium">Bypass Reason:</span> {entry.bypass_reason}
                                                    </div>
                                                )}
                                                {entry.notes && entry.notes !== entry.bypass_reason && (
                                                    <div>
                                                        <span className="font-medium">Notes:</span> {entry.notes}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Exit information */}
                                        {entry.exited_at && (
                                            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                                                Exited: {format(new Date(entry.exited_at), 'MMM d, yyyy HH:mm')}
                                                {entry.exit_reason && (
                                                    <span className="ml-2">({entry.exit_reason})</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary statistics */}
                <div className="mt-6 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Total Transitions:</span>
                            <span className="ml-2 font-medium">{history.length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Bypasses:</span>
                            <span className="ml-2 font-medium">
                                {history.filter(h => h.bypass_required).length}
                            </span>
                        </div>
                    </div>

                    {history.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                            Project started: {format(new Date(history[0].entered_at), 'MMM d, yyyy HH:mm')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}