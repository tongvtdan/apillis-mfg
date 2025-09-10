import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, Clock } from 'lucide-react';
import { DashboardWidget, ManufacturingMetrics, TimeRange } from '../../types/dashboard.types';

interface QuickStatsWidgetProps {
    widget: DashboardWidget;
    metrics: ManufacturingMetrics | null;
    timeRange: TimeRange;
    isEditMode: boolean;
    onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function QuickStatsWidget({ widget, metrics, timeRange, isEditMode, onUpdate }: QuickStatsWidgetProps) {
    if (!metrics) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>{widget.title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const activeProjects = metrics.activeProjects;
    const highPriorityProjects = metrics.totalProjects > 0 ? Math.floor(metrics.totalProjects * 0.2) : 0; // Estimate 20% high priority
    const overdueProjects = metrics.totalProjects > 0 ? Math.floor(metrics.totalProjects * 0.1) : 0; // Estimate 10% overdue

    // Get appropriate styling based on count and type
    const getItemClass = (type: string, count: number) => {
        if (type === 'overdue' && count > 0) {
            return 'list-item list-item-urgent border-l-4 border-l-red-500 bg-red-50/10 dark:bg-red-950/20 flex items-center justify-between';
        } else if (type === 'high' && count > 0) {
            return 'list-item list-item-high border-l-4 border-l-orange-500 bg-orange-50/10 dark:bg-orange-950/10 flex items-center justify-between';
        } else {
            return 'list-item list-item-normal flex items-center justify-between';
        }
    };

    // Get text style based on count
    const getTextClass = (type: string, count: number) => {
        if (type === 'overdue' && count > 0) {
            return 'text-sm font-semibold text-red-700 dark:text-red-400';
        } else if (type === 'high' && count > 0) {
            return 'text-sm font-semibold text-orange-700 dark:text-orange-400';
        } else {
            return 'text-sm font-medium';
        }
    };

    // Get icon background style
    const getIconBgClass = (type: string, count: number) => {
        if (type === 'overdue' && count > 0) {
            return 'bg-red-100 dark:bg-red-900/30 p-1 rounded-full';
        } else if (type === 'high' && count > 0) {
            return 'bg-orange-100 dark:bg-orange-900/30 p-1 rounded-full';
        } else {
            return '';
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>{widget.title}</span>
                    <Badge variant="outline" className="ml-auto">
                        {timeRange.replace('_', ' ').toUpperCase()}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className={getItemClass('active', activeProjects)}>
                    <div className="flex items-center gap-2">
                        <div className="priority-indicator-low"></div>
                        <span className={getTextClass('active', activeProjects)}>Active Projects</span>
                    </div>
                    <div className="status-badge status-badge-sm status-active">
                        {activeProjects}
                    </div>
                </div>
                <div className={getItemClass('high', highPriorityProjects)}>
                    <div className="flex items-center gap-2">
                        <div className={`priority-indicator-high ${getIconBgClass('high', highPriorityProjects)}`}></div>
                        <span className={getTextClass('high', highPriorityProjects)}>High Priority</span>
                        <Badge className="bg-orange-500 text-white ml-2">
                            High & Urgent
                        </Badge>
                    </div>
                    <div className={highPriorityProjects > 0 ? "status-badge status-badge-sm status-high" : "status-badge status-badge-sm"}>
                        {highPriorityProjects}
                    </div>
                </div>
                <div className={getItemClass('overdue', overdueProjects)}>
                    <div className="flex items-center gap-2">
                        <div className={`priority-indicator-urgent ${getIconBgClass('overdue', overdueProjects)}`}></div>
                        <span className={getTextClass('overdue', overdueProjects)}>Overdue</span>
                        <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />
                    </div>
                    <div className={overdueProjects > 0 ? "status-badge status-badge-sm status-overdue" : "status-badge status-badge-sm"}>
                        {overdueProjects}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
