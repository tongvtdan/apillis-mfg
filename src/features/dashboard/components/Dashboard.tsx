import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/core/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    BarChart3,
    TrendingUp,
    Users,
    Package,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Settings,
    Plus,
    Filter,
    Calendar,
    Download,
    RefreshCw,
    Grid,
    List,
    PieChart
} from 'lucide-react';
import {
    DashboardLayout,
    DashboardWidget,
    ManufacturingMetrics,
    TimeRange,
    DASHBOARD_THEMES
} from '../types/dashboard.types';
import { DashboardService } from '../services/dashboardService';

// Import widget components
import {
    MetricsWidget,
    ChartWidget,
    KanbanWidget,
    TimelineWidget,
    ProjectOverviewWidget,
    QuickStatsWidget,
    RecentActivitiesWidget
} from './widgets';

interface DashboardProps {
    layout?: DashboardLayout;
    onLayoutChange?: (layout: DashboardLayout) => void;
    className?: string;
}

export function Dashboard({ layout: initialLayout, onLayoutChange, className }: DashboardProps) {
    const { user, profile } = useAuth();
    const [layout, setLayout] = useState<DashboardLayout | null>(initialLayout || null);
    const [metrics, setMetrics] = useState<ManufacturingMetrics | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('last_30_days');
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    // Load dashboard data
    useEffect(() => {
        if (profile?.organization_id && user?.id) {
            loadDashboard();
        }
    }, [profile?.organization_id, user?.id, timeRange]);

    const loadDashboard = useCallback(async () => {
        if (!profile?.organization_id || !user?.id) return;

        setIsLoading(true);
        try {
            // Load layout
            const dashboardLayout = await DashboardService.getDashboardLayout(
                profile.organization_id,
                user.id
            );

            if (dashboardLayout) {
                setLayout(dashboardLayout);
            }

            // Load metrics
            const dashboardMetrics = await DashboardService.getManufacturingMetrics(
                profile.organization_id,
                { timeRange }
            );

            setMetrics(dashboardMetrics);

        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    }, [profile?.organization_id, user?.id, timeRange]);

    const handleTimeRangeChange = (newTimeRange: TimeRange) => {
        setTimeRange(newTimeRange);
    };

    const handleLayoutSave = async () => {
        if (!layout || !user?.id) return;

        try {
            await DashboardService.saveDashboardLayout(layout, user.id);
            onLayoutChange?.(layout);
            setEditMode(false);
            // Note: Layout changes are in-memory only and will reset on page refresh
        } catch (error) {
            console.error('Failed to save layout:', error);
        }
    };

    const handleExportLayout = () => {
        if (!layout) return;

        const exportData = DashboardService.exportDashboardConfig(layout);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${layout.name}-dashboard-config.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const renderWidget = (widget: DashboardWidget) => {
        const widgetProps = {
            key: widget.id,
            widget,
            metrics,
            timeRange,
            isEditMode: editMode,
            onUpdate: (updates: Partial<DashboardWidget>) => {
                // Handle widget updates
                console.log('Widget update:', widget.id, updates);
            }
        };

        switch (widget.type) {
            case 'metrics':
                return <MetricsWidget {...widgetProps} />;
            case 'chart':
                return <ChartWidget {...widgetProps} />;
            case 'kanban':
                return <KanbanWidget {...widgetProps} />;
            case 'timeline':
                return <TimelineWidget {...widgetProps} />;
            case 'project-overview':
                return <ProjectOverviewWidget {...widgetProps} />;
            case 'quick-stats':
                return <QuickStatsWidget {...widgetProps} />;
            case 'recent-activities':
                return <RecentActivitiesWidget {...widgetProps} />;
            default:
                return (
                    <Card className="h-full">
                        <CardContent className="p-4">
                            <div className="text-center text-muted-foreground">
                                Widget type "{widget.type}" not implemented
                            </div>
                        </CardContent>
                    </Card>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!layout) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Dashboard Not Available</h3>
                <p className="text-muted-foreground">
                    Unable to load dashboard configuration. Please try again later.
                </p>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center space-x-2">
                        <BarChart3 className="h-8 w-8" />
                        <span>{layout.name}</span>
                    </h1>
                    {layout.description && (
                        <p className="text-muted-foreground mt-1">{layout.description}</p>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {/* Time Range Selector */}
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="time-range">Time Range:</Label>
                        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                            <SelectTrigger id="time-range" className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                                <SelectItem value="last_year">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadDashboard}
                            disabled={isLoading}
                        >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refresh
                        </Button>

                        {editMode ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditMode(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleLayoutSave}
                                >
                                    Save Layout
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditMode(true)}
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportLayout}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            {/* Key Metrics Overview */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-blue-500" />
                                <div>
                                    <div className="text-2xl font-bold">{metrics.totalProjects}</div>
                                    <div className="text-xs text-muted-foreground">Total Projects</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                <div>
                                    <div className="text-2xl font-bold">{metrics.activeProjects}</div>
                                    <div className="text-xs text-muted-foreground">Active Projects</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        ${(metrics.totalRevenue / 1000).toFixed(0)}K
                                    </div>
                                    <div className="text-xs text-muted-foreground">Revenue</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-purple-500" />
                                <div>
                                    <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
                                    <div className="text-xs text-muted-foreground">Customers</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <div className="text-2xl font-bold">{metrics.onTimeDelivery.toFixed(1)}%</div>
                                    <div className="text-xs text-muted-foreground">On-Time</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                <div>
                                    <div className="text-2xl font-bold">{metrics.leadTime}</div>
                                    <div className="text-xs text-muted-foreground">Lead Time</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Dashboard Widgets Grid */}
            <div className="grid grid-cols-12 gap-6">
                {layout.widgets
                    .filter(widget => widget.isVisible !== false)
                    .sort((a, b) => {
                        // Sort by position (top-left to bottom-right)
                        if (a.position.y !== b.position.y) {
                            return a.position.y - b.position.y;
                        }
                        return a.position.x - b.position.x;
                    })
                    .map(widget => (
                        <div
                            key={widget.id}
                            className={`
                                ${widget.size === 'small' ? 'col-span-12 md:col-span-3' : ''}
                                ${widget.size === 'medium' ? 'col-span-12 md:col-span-6' : ''}
                                ${widget.size === 'large' ? 'col-span-12 md:col-span-9' : ''}
                                ${widget.size === 'xlarge' ? 'col-span-12' : ''}
                            `}
                            style={{
                                gridRowStart: widget.position.y + 1,
                                gridColumnStart: widget.position.x + 1,
                                gridColumnEnd: widget.position.x + widget.position.w + 1
                            }}
                        >
                            {renderWidget(widget)}
                        </div>
                    ))}
            </div>

            {/* Edit Mode Overlay */}
            {editMode && (
                <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Settings className="h-4 w-4" />
                        <span>Edit mode active - changes are temporary</span>
                    </div>
                </div>
            )}
        </div>
    );
}
