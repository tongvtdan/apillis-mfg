import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Clock,
    User,
    FileText,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Package,
    Users,
    DollarSign,
    Calendar
} from 'lucide-react';
import { DashboardWidget, ManufacturingMetrics, TimeRange } from '../../types/dashboard.types';

interface TimelineWidgetProps {
    widget: DashboardWidget;
    metrics: ManufacturingMetrics | null;
    timeRange: TimeRange;
    isEditMode: boolean;
    onUpdate: (updates: Partial<DashboardWidget>) => void;
}

interface TimelineItem {
    id: string;
    type: 'project' | 'customer' | 'order' | 'activity' | 'milestone';
    title: string;
    description: string;
    timestamp: string;
    user?: string;
    status?: string;
    priority?: string;
    metadata?: Record<string, any>;
}

export function TimelineWidget({ widget, metrics, timeRange, isEditMode, onUpdate }: TimelineWidgetProps) {
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTimelineData();
    }, [timeRange]);

    const loadTimelineData = async () => {
        setIsLoading(true);

        // Mock timeline data - in a real app, this would come from your backend
        const mockData: TimelineItem[] = [
            {
                id: '1',
                type: 'project',
                title: 'Custom Electronics Assembly',
                description: 'Project moved to engineering review',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                user: 'John Smith',
                status: 'in_review',
                priority: 'high'
            },
            {
                id: '2',
                type: 'customer',
                title: 'New Customer Onboarded',
                description: 'ABC Manufacturing joined as customer',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
                user: 'Sarah Johnson',
                status: 'active'
            },
            {
                id: '3',
                type: 'order',
                title: 'Large Order Received',
                description: 'Order #1234 for 500 units approved',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
                user: 'Mike Wilson',
                priority: 'urgent'
            },
            {
                id: '4',
                type: 'milestone',
                title: 'Monthly Target Achieved',
                description: 'Revenue target exceeded by 15%',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
                status: 'completed'
            },
            {
                id: '5',
                type: 'activity',
                title: 'Supplier Performance Review',
                description: 'Completed quarterly supplier evaluation',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                user: 'Lisa Chen'
            }
        ];

        // Simulate loading delay
        setTimeout(() => {
            setTimelineItems(mockData);
            setIsLoading(false);
        }, 500);
    };

    const getTimelineIcon = (type: TimelineItem['type']) => {
        switch (type) {
            case 'project':
                return <Package className="h-4 w-4" />;
            case 'customer':
                return <Users className="h-4 w-4" />;
            case 'order':
                return <DollarSign className="h-4 w-4" />;
            case 'milestone':
                return <CheckCircle className="h-4 w-4" />;
            case 'activity':
                return <Clock className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: TimelineItem['type']) => {
        switch (type) {
            case 'project':
                return 'text-blue-600 bg-blue-100';
            case 'customer':
                return 'text-green-600 bg-green-100';
            case 'order':
                return 'text-purple-600 bg-purple-100';
            case 'milestone':
                return 'text-yellow-600 bg-yellow-100';
            case 'activity':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'normal':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) {
            return 'Just now';
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>{widget.title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                            <div className="h-32 bg-muted rounded w-full"></div>
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
                    <Badge variant="outline" className="ml-auto">
                        {timelineItems.length} items
                    </Badge>
                </CardTitle>
                {widget.description && (
                    <p className="text-sm text-muted-foreground">{widget.description}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                    {timelineItems.map((item, index) => (
                        <div key={item.id} className="flex space-x-4">
                            {/* Timeline line */}
                            <div className="flex flex-col items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getTypeColor(item.type)}`}>
                                    {getTimelineIcon(item.type)}
                                </div>
                                {index < timelineItems.length - 1 && (
                                    <div className="w-px h-8 bg-border mt-2"></div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-medium text-sm">{item.title}</h4>
                                            <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                                                {item.type}
                                            </Badge>
                                            {item.priority && (
                                                <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                                                    {item.priority}
                                                </Badge>
                                            )}
                                            {item.status && (
                                                <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 mt-2">
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatTimestamp(item.timestamp)}</span>
                                    </div>

                                    {item.user && (
                                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                            <User className="h-3 w-3" />
                                            <span>{item.user}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                        Load More Activity
                    </Button>
                </div>

                {/* Summary */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-medium">
                            {timelineItems.filter(item => item.type === 'project').length}
                        </div>
                        <div className="text-muted-foreground">Projects</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium">
                            {timelineItems.filter(item => item.type === 'customer').length}
                        </div>
                        <div className="text-muted-foreground">Customers</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium">
                            {timelineItems.filter(item => item.type === 'order').length}
                        </div>
                        <div className="text-muted-foreground">Orders</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
