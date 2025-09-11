import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { DashboardWidget, ManufacturingMetrics, TimeRange, ChartWidget as ChartWidgetType } from '../../types/dashboard.types';

interface ChartWidgetProps {
    widget: DashboardWidget;
    metrics: ManufacturingMetrics | null;
    timeRange: TimeRange;
    isEditMode: boolean;
    onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function ChartWidget({ widget, metrics, timeRange, isEditMode, onUpdate }: ChartWidgetProps) {
    const chartConfig = widget.config as ChartWidgetType;

    const getChartIcon = (chartType: string) => {
        switch (chartType) {
            case 'line':
            case 'area':
                return <LineChart className="h-5 w-5" />;
            case 'pie':
            case 'doughnut':
                return <PieChart className="h-5 w-5" />;
            default:
                return <BarChart className="h-5 w-5" />;
        }
    };

    if (!metrics) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        {getChartIcon(chartConfig?.chartType || 'bar')}
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
                    {getChartIcon(chartConfig?.chartType || 'bar')}
                    <span>{widget.title}</span>
                    {isEditMode && (
                        <Badge variant="outline" className="text-xs">
                            {chartConfig?.chartType || 'bar'}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-sm">
                            {chartConfig?.chartType || 'Chart'} Widget
                        </p>
                        <p className="text-xs mt-1">
                            Chart visualization coming soon
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
