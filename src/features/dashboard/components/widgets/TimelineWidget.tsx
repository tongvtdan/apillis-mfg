import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { DashboardWidget, ManufacturingMetrics, TimeRange, TimelineWidget as TimelineWidgetType } from '../../types/dashboard.types';

interface TimelineWidgetProps {
    widget: DashboardWidget;
    metrics: ManufacturingMetrics | null;
    timeRange: TimeRange;
    isEditMode: boolean;
    onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function TimelineWidget({ widget, metrics, timeRange, isEditMode, onUpdate }: TimelineWidgetProps) {
    const timelineConfig = widget.config as TimelineWidgetType;

    if (!metrics) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>{widget.title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="animate-pulse">
                            <div className="h-32 bg-muted rounded w-full mb-2"></div>
                            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>{widget.title}</span>
                    {isEditMode && (
                        <Badge variant="outline" className="text-xs">
                            Timeline
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-sm">
                            Timeline Widget
                        </p>
                        <p className="text-xs mt-1">
                            Timeline visualization coming soon
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}