import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    DollarSign,
    Package,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { DashboardWidget, ManufacturingMetrics, TimeRange } from '../../types/dashboard.types';

interface MetricsWidgetProps {
    widget: DashboardWidget;
    metrics: ManufacturingMetrics | null;
    timeRange: TimeRange;
    isEditMode: boolean;
    onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function MetricsWidget({ widget, metrics, timeRange, isEditMode, onUpdate }: MetricsWidgetProps) {

    if (!metrics) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5" />
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

    const getTrendIcon = (current: number, previous?: number) => {
        if (!previous) return <Minus className="h-4 w-4 text-muted-foreground" />;

        const change = ((current - previous) / previous) * 100;
        if (change > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (change < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    const getTrendColor = (current: number, previous?: number) => {
        if (!previous) return 'text-muted-foreground';

        const change = ((current - previous) / previous) * 100;
        if (change > 5) return 'text-green-600';
        if (change < -5) return 'text-red-600';
        return 'text-muted-foreground';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>{widget.title}</span>
                    <Badge variant="outline" className="ml-auto">
                        {timeRange.replace('_', ' ').toUpperCase()}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Revenue */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Revenue</span>
                            </div>
                            {getTrendIcon(metrics.totalRevenue, metrics.previousPeriodMetrics?.totalRevenue)}
                        </div>
                        <div className="text-2xl font-bold">
                            {formatCurrency(metrics.totalRevenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Avg: {formatCurrency(metrics.averageOrderValue)}
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Projects</span>
                            </div>
                            {getTrendIcon(metrics.totalProjects, metrics.previousPeriodMetrics?.totalProjects)}
                        </div>
                        <div className="text-2xl font-bold">
                            {formatNumber(metrics.totalProjects)}
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>{metrics.activeProjects} active</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>{metrics.completedProjects} done</span>
                            </div>
                        </div>
                    </div>

                    {/* Customers */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium">Customers</span>
                            </div>
                            {getTrendIcon(metrics.totalCustomers, metrics.previousPeriodMetrics?.totalCustomers)}
                        </div>
                        <div className="text-2xl font-bold">
                            {formatNumber(metrics.totalCustomers)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {metrics.newCustomersThisMonth} new this month
                        </div>
                    </div>

                    {/* On-Time Delivery */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">On-Time</span>
                            </div>
                            {getTrendIcon(metrics.onTimeDelivery, metrics.previousPeriodMetrics?.onTimeDelivery)}
                        </div>
                        <div className="text-2xl font-bold">
                            {formatPercentage(metrics.onTimeDelivery)}
                        </div>
                        <Progress
                            value={metrics.onTimeDelivery}
                            className="h-2"
                        />
                    </div>

                    {/* Lead Time */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">Lead Time</span>
                            </div>
                            {getTrendIcon(metrics.leadTime, metrics.previousPeriodMetrics?.leadTime)}
                        </div>
                        <div className="text-2xl font-bold">
                            {formatNumber(metrics.leadTime)}d
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Average delivery time
                        </div>
                    </div>

                    {/* Utilization */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-indigo-500" />
                                <span className="text-sm font-medium">Utilization</span>
                            </div>
                            {getTrendIcon(metrics.utilizationRate, metrics.previousPeriodMetrics?.utilizationRate)}
                        </div>
                        <div className="text-2xl font-bold">
                            {formatPercentage(metrics.utilizationRate)}
                        </div>
                        <Progress
                            value={metrics.utilizationRate}
                            className="h-2"
                        />
                    </div>

                    {/* Customer Satisfaction */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-pink-500" />
                                <span className="text-sm font-medium">Satisfaction</span>
                            </div>
                        </div>
                        <div className="text-2xl font-bold">
                            {metrics.customerSatisfaction.toFixed(1)}/5
                        </div>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                    key={star}
                                    className={`w-2 h-2 rounded-full ${star <= Math.round(metrics.customerSatisfaction)
                                            ? 'bg-yellow-400'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Profit Margin */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                                <span className="text-sm font-medium">Margin</span>
                            </div>
                            {getTrendIcon(metrics.profitMargin, metrics.previousPeriodMetrics?.profitMargin)}
                        </div>
                        <div className="text-2xl font-bold">
                            {formatPercentage(metrics.profitMargin)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Profit margin
                        </div>
                    </div>

                    {/* Quality Incidents */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium">Quality</span>
                            </div>
                        </div>
                        <div className="text-2xl font-bold">
                            {formatNumber(metrics.qualityIncidents)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Incidents reported
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Period: {new Date(metrics.periodStart).toLocaleDateString()} - {new Date(metrics.periodEnd).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                            Auto-updated
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
