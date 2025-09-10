import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    Kanban,
    Plus,
    MoreHorizontal,
    Calendar,
    User,
    AlertCircle,
    CheckCircle,
    Clock,
    Filter
} from 'lucide-react';
import { DashboardWidget, ManufacturingMetrics, TimeRange, KanbanCard } from '../../types/dashboard.types';
import { DashboardService } from '../../services/dashboardService';

interface KanbanWidgetProps {
    widget: DashboardWidget;
    metrics: ManufacturingMetrics | null;
    timeRange: TimeRange;
    isEditMode: boolean;
    onUpdate: (updates: Partial<DashboardWidget>) => void;
}

interface KanbanColumn {
    id: string;
    title: string;
    color: string;
    cards: KanbanCard[];
    limit?: number;
}

export function KanbanWidget({ widget, metrics, timeRange, isEditMode, onUpdate }: KanbanWidgetProps) {
    const [kanbanData, setKanbanData] = useState<KanbanCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);

    // Default kanban columns
    const columns: KanbanColumn[] = [
        {
            id: 'draft',
            title: 'Draft',
            color: 'bg-gray-100 border-gray-200',
            cards: kanbanData.filter(card => card.status === 'draft'),
            limit: 10
        },
        {
            id: 'in_progress',
            title: 'In Progress',
            color: 'bg-blue-100 border-blue-200',
            cards: kanbanData.filter(card => card.status === 'in_progress'),
            limit: 15
        },
        {
            id: 'review',
            title: 'Under Review',
            color: 'bg-yellow-100 border-yellow-200',
            cards: kanbanData.filter(card => card.status === 'review'),
            limit: 8
        },
        {
            id: 'completed',
            title: 'Completed',
            color: 'bg-green-100 border-green-200',
            cards: kanbanData.filter(card => card.status === 'completed')
        }
    ];

    useEffect(() => {
        loadKanbanData();
    }, []);

    const loadKanbanData = async () => {
        setIsLoading(true);
        try {
            // In a real app, this would come from the user's organization
            const data = await DashboardService.getKanbanData('org-id');
            setKanbanData(data);
        } catch (error) {
            console.error('Failed to load kanban data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragStart = (card: KanbanCard) => {
        setDraggedCard(card);
    };

    const handleDragEnd = () => {
        setDraggedCard(null);
    };

    const handleDrop = (columnId: string) => {
        if (!draggedCard) return;

        // Update card status
        const updatedCard = { ...draggedCard, status: columnId };
        setKanbanData(prev =>
            prev.map(card =>
                card.id === draggedCard.id ? updatedCard : card
            )
        );

        setDraggedCard(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return <AlertCircle className="h-3 w-3" />;
            case 'high': return <Clock className="h-3 w-3" />;
            case 'normal': return <CheckCircle className="h-3 w-3" />;
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Kanban className="h-5 w-5" />
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
                    <Kanban className="h-5 w-5" />
                    <span>{widget.title}</span>
                    <Badge variant="outline" className="ml-auto">
                        {kanbanData.length} items
                    </Badge>
                </CardTitle>
                {widget.description && (
                    <p className="text-sm text-muted-foreground">{widget.description}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-96">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className={`flex flex-col ${column.color} rounded-lg p-3 border`}
                            onDrop={() => handleDrop(column.id)}
                            onDragOver={handleDragOver}
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-sm">{column.title}</h3>
                                <div className="flex items-center space-x-1">
                                    <Badge variant="secondary" className="text-xs">
                                        {column.cards.length}
                                        {column.limit && `/${column.limit}`}
                                    </Badge>
                                    {column.limit && column.cards.length > column.limit && (
                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                    )}
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="flex-1 space-y-2 overflow-y-auto">
                                {column.cards.map((card) => (
                                    <Card
                                        key={card.id}
                                        className="p-3 cursor-move hover:shadow-md transition-shadow"
                                        draggable={!isEditMode}
                                        onDragStart={() => handleDragStart(card)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-medium text-sm line-clamp-2">
                                                    {card.title}
                                                </h4>
                                                <Badge
                                                    className={`text-xs ${getPriorityColor(card.priority)}`}
                                                >
                                                    {getPriorityIcon(card.priority)}
                                                    {card.priority}
                                                </Badge>
                                            </div>

                                            {card.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {card.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{card.assignee || 'Unassigned'}</span>
                                                </div>

                                                {card.dueDate && (
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {new Date(card.dueDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {card.tags && card.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {card.tags.slice(0, 2).map((tag, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {card.tags.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{card.tags.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}

                                {/* Add Card Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    disabled={isEditMode}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Card
                                </Button>
                            </div>

                            {/* Column Limit Indicator */}
                            {column.limit && (
                                <div className="mt-2">
                                    <Progress
                                        value={(column.cards.length / column.limit) * 100}
                                        className="h-1"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        {columns.map((column) => (
                            <div key={column.id} className="text-center">
                                <div className="font-medium">{column.cards.length}</div>
                                <div className="text-muted-foreground">{column.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
