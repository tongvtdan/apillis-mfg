import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    Building2,
    Calendar,
    Clock,
    Users,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Timer,
    Target,
    Activity,
    ArrowRight,
    Zap,
    Eye,
    Edit,
    MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays, parseISO } from "date-fns";
import type { Project, WorkflowStage, ProjectPriority } from "@/types/project";
import { useWorkflowSubStages } from "@/hooks/useWorkflowSubStages";
import { useUserDisplayName } from "@/hooks/useUsers";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface EnhancedProjectOverviewCardProps {
    project: Project;
    workflowStages?: WorkflowStage[];
    onEdit?: () => void;
    onViewDetails?: () => void;
    className?: string;
}

interface ProjectAlert {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    actionable: boolean;
    action?: () => void;
    dismissible: boolean;
}

interface ProjectMetrics {
    healthScore: number;
    daysInStage: number;
    totalDuration: number;
    estimatedCompletion: string | null;
    riskLevel: 'low' | 'medium' | 'high';
    progressPercentage: number;
}

export function EnhancedProjectOverviewCard({
    project,
    workflowStages = [],
    onEdit,
    onViewDetails,
    className
}: EnhancedProjectOverviewCardProps) {
    const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
    const [alerts, setAlerts] = useState<ProjectAlert[]>([]);

    // Get sub-stages for current stage
    const { subStages, loading: subStagesLoading } = useWorkflowSubStages({
        stageId: project.current_stage_id || '',
        enabled: !!project.current_stage_id
    });

    // Calculate project metrics
    const metrics = useMemo((): ProjectMetrics => {
        const currentStageIndex = workflowStages.findIndex(stage => stage.id === project.current_stage_id);
        const totalStages = workflowStages.length;
        const progressPercentage = currentStageIndex >= 0 && totalStages > 1
            ? Math.round((currentStageIndex / (totalStages - 1)) * 100)
            : 0;

        // Calculate days in current stage
        const stageEnteredAt = project.stage_entered_at ? parseISO(project.stage_entered_at) : parseISO(project.created_at);
        const daysInStage = differenceInDays(new Date(), stageEnteredAt);

        // Calculate total project duration
        const totalDuration = differenceInDays(new Date(), parseISO(project.created_at));

        // Calculate health score based on various factors
        let healthScore = 100;

        // Deduct points for time in stage
        if (daysInStage > 14) healthScore -= 20;
        else if (daysInStage > 7) healthScore -= 10;

        // Deduct points for overdue projects
        if (project.estimated_delivery_date) {
            const daysToDelivery = differenceInDays(parseISO(project.estimated_delivery_date), new Date());
            if (daysToDelivery < 0) healthScore -= 30; // Overdue
            else if (daysToDelivery < 7) healthScore -= 15; // Due soon
        }

        // Adjust for priority
        if (project.priority_level === 'urgent') healthScore -= 10;
        else if (project.priority_level === 'high') healthScore -= 5;

        healthScore = Math.max(0, Math.min(100, healthScore));

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (healthScore < 50) riskLevel = 'high';
        else if (healthScore < 75) riskLevel = 'medium';

        // Estimate completion
        let estimatedCompletion: string | null = null;
        if (project.estimated_delivery_date) {
            estimatedCompletion = format(parseISO(project.estimated_delivery_date), 'MMM dd, yyyy');
        }

        return {
            healthScore,
            daysInStage,
            totalDuration,
            estimatedCompletion,
            riskLevel,
            progressPercentage
        };
    }, [project, workflowStages]);

    // Generate alerts based on project status
    useEffect(() => {
        const newAlerts: ProjectAlert[] = [];

        // Stage duration alert
        if (metrics.daysInStage > 14) {
            newAlerts.push({
                id: 'stage-duration',
                type: 'warning',
                title: 'Long Stage Duration',
                message: `Project has been in ${project.current_stage?.name || 'current stage'} for ${metrics.daysInStage} days`,
                actionable: true,
                action: () => console.log('Navigate to workflow management'),
                dismissible: true
            });
        }

        // Overdue alert
        if (project.estimated_delivery_date) {
            const daysToDelivery = differenceInDays(parseISO(project.estimated_delivery_date), new Date());
            if (daysToDelivery < 0) {
                newAlerts.push({
                    id: 'overdue',
                    type: 'error',
                    title: 'Project Overdue',
                    message: `Delivery was due ${Math.abs(daysToDelivery)} days ago`,
                    actionable: true,
                    action: () => console.log('Update delivery date'),
                    dismissible: false
                });
            } else if (daysToDelivery <= 7) {
                newAlerts.push({
                    id: 'due-soon',
                    type: 'warning',
                    title: 'Due Soon',
                    message: `Delivery due in ${daysToDelivery} days`,
                    actionable: true,
                    action: () => console.log('Review timeline'),
                    dismissible: true
                });
            }
        }

        // High priority alert
        if (project.priority_level === 'urgent') {
            newAlerts.push({
                id: 'urgent-priority',
                type: 'info',
                title: 'Urgent Priority',
                message: 'This project requires immediate attention',
                actionable: false,
                dismissible: false
            });
        }

        setAlerts(newAlerts);
    }, [project, metrics]);

    // Priority color mapping
    const getPriorityColor = (priority: ProjectPriority): string => {
        const colors = {
            urgent: 'bg-red-100 text-red-800 border-red-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[priority] || colors.medium;
    };

    // Health score color
    const getHealthScoreColor = (score: number): string => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Risk level color
    const getRiskLevelColor = (risk: 'low' | 'medium' | 'high'): string => {
        const colors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-red-100 text-red-800'
        };
        return colors[risk];
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get customer display name
    const getCustomerDisplayName = (): string => {
        if (project.customer?.company_name) return project.customer.company_name;
        if (project.customer?.contact_name) return project.customer.contact_name;
        return 'N/A';
    };

    // Get assignee display name using correct database field name with fallback
    const assigneeId = project.assigned_to || project.assignee_id;
    const assigneeDisplayName = useUserDisplayName(assigneeId);

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-xl font-bold truncate">
                                {project.project_id}
                            </CardTitle>
                            <Badge className={cn("text-xs", getPriorityColor(project.priority_level || 'medium'))}>
                                {(project.priority_level || 'medium').charAt(0).toUpperCase() + (project.priority_level || 'medium').slice(1)}
                            </Badge>
                            {realTimeStatus === 'connected' && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                <Activity className="w-3 h-3 mr-1" />
                                                Live
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Real-time data connection active</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
                            {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description || 'No description available'}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="ml-2">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onViewDetails && (
                                <DropdownMenuItem onClick={onViewDetails}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                            )}
                            {onEdit && (
                                <DropdownMenuItem onClick={onEdit}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Project
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Activity className="w-4 h-4 mr-2" />
                                View Activity
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Alerts Section */}
                {alerts.length > 0 && (
                    <div className="space-y-2 mt-4">
                        {alerts.slice(0, 2).map((alert) => (
                            <div
                                key={alert.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border text-sm",
                                    alert.type === 'error' && "bg-red-50 border-red-200 text-red-800",
                                    alert.type === 'warning' && "bg-yellow-50 border-yellow-200 text-yellow-800",
                                    alert.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800",
                                    alert.type === 'success' && "bg-green-50 border-green-200 text-green-800"
                                )}
                            >
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium">{alert.title}</div>
                                        <div className="text-xs opacity-90">{alert.message}</div>
                                    </div>
                                </div>
                                {alert.actionable && alert.action && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={alert.action}
                                        className="text-xs"
                                    >
                                        <ArrowRight className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3 mr-1" />
                            Customer
                        </div>
                        <div className="font-medium text-sm truncate">
                            {getCustomerDisplayName()}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Users className="w-3 h-3 mr-1" />
                            Owner
                        </div>
                        <div className="font-medium text-sm truncate">
                            {assigneeDisplayName}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Value
                        </div>
                        <div className="font-medium text-sm">
                            {project.estimated_value ? formatCurrency(project.estimated_value) : 'TBD'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due Date
                        </div>
                        <div className="font-medium text-sm">
                            {metrics.estimatedCompletion || 'TBD'}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Project Health & Progress */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Project Health & Progress</h4>
                        <Badge className={getRiskLevelColor(metrics.riskLevel)}>
                            {metrics.riskLevel.charAt(0).toUpperCase() + metrics.riskLevel.slice(1)} Risk
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Health Score */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Health Score</span>
                                <span className={cn("text-sm font-bold", getHealthScoreColor(metrics.healthScore))}>
                                    {metrics.healthScore}%
                                </span>
                            </div>
                            <Progress value={metrics.healthScore} className="h-2" />
                        </div>

                        {/* Stage Progress */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Overall Progress</span>
                                <span className="text-sm font-bold text-blue-600">
                                    {metrics.progressPercentage}%
                                </span>
                            </div>
                            <Progress value={metrics.progressPercentage} className="h-2" />
                        </div>

                        {/* Time Metrics */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Days in Stage</span>
                                <span className={cn(
                                    "text-sm font-bold",
                                    metrics.daysInStage > 14 ? "text-red-600" :
                                        metrics.daysInStage > 7 ? "text-yellow-600" : "text-green-600"
                                )}>
                                    {metrics.daysInStage}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Total Duration</span>
                                <span className="text-sm font-medium">
                                    {metrics.totalDuration} days
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Current Stage & Timeline */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Current Stage</h4>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                                {project.stage_entered_at
                                    ? formatDistanceToNow(parseISO(project.stage_entered_at), { addSuffix: true })
                                    : 'Recently entered'
                                }
                            </span>
                        </div>
                    </div>

                    {/* Current Stage Info */}
                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                <span className="font-medium text-sm">
                                    {project.current_stage?.name || 'Unknown Stage'}
                                </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                Active
                            </Badge>
                        </div>

                        {project.current_stage?.description && (
                            <p className="text-xs text-muted-foreground mb-3">
                                {project.current_stage.description}
                            </p>
                        )}

                        {/* Sub-stages if available */}
                        {subStages && subStages.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">Sub-stages:</div>
                                <div className="grid grid-cols-1 gap-1">
                                    {subStages.slice(0, 3).map((subStage) => (
                                        <div key={subStage.id} className="flex items-center space-x-2 text-xs">
                                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                                            <span className="truncate">{subStage.name}</span>
                                        </div>
                                    ))}
                                    {subStages.length > 3 && (
                                        <div className="text-xs text-muted-foreground">
                                            +{subStages.length - 3} more sub-stages
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mini Timeline */}
                    <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Workflow Progress</div>
                        <div className="flex items-center space-x-1">
                            {workflowStages.slice(0, 6).map((stage, index) => {
                                const currentIndex = workflowStages.findIndex(s => s.id === project.current_stage_id);
                                const isCompleted = index < currentIndex;
                                const isCurrent = index === currentIndex;
                                const isUpcoming = index > currentIndex;

                                return (
                                    <React.Fragment key={stage.id}>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <div
                                                        className={cn(
                                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                                            isCompleted && "bg-green-600 text-white",
                                                            isCurrent && "bg-blue-600 text-white ring-2 ring-blue-200",
                                                            isUpcoming && "bg-muted text-muted-foreground"
                                                        )}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        ) : (
                                                            <span>{index + 1}</span>
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">{stage.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        {index < Math.min(workflowStages.length - 1, 5) && (
                                            <div className={cn(
                                                "flex-1 h-0.5 transition-all",
                                                isCompleted ? "bg-green-600" : "bg-muted"
                                            )} />
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {workflowStages.length > 6 && (
                                <div className="text-xs text-muted-foreground ml-2">
                                    +{workflowStages.length - 6} more
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Timer className="w-3 h-3" />
                        <span>Created {format(parseISO(project.created_at), 'MMM dd, yyyy')}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {project.priority_level === 'urgent' && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Zap className="w-4 h-4 text-red-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Urgent priority project</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {metrics.riskLevel === 'high' && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>High risk project - requires attention</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        <Button variant="ghost" size="sm" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            Track
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}