import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowLeft,
    Building2,
    Calendar,
    Users,
    DollarSign,
    Clock,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Edit,
    Share,
    Star,
    MoreHorizontal,
    Zap,
    Target,
    TrendingUp,
    Timer,
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays, parseISO } from "date-fns";
import type { Project, WorkflowStage, ProjectPriority } from "@/types/project";
import { ProjectOverviewCard } from "./ProjectOverviewCard";
import { WorkflowStepper } from "./workflow";
import { useUserDisplayName, useOwnerDisplayName } from "@/features/customer-management/hooks";
import { useToast } from "@/shared/hooks/use-toast";
import { EditProjectModal } from "./EditProjectModal";
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

interface ProjectDetailHeaderProps {
    project: Project;
    workflowStages?: WorkflowStage[];
    onBack?: () => void;
    onEdit?: () => void;
    onShare?: () => void;
    className?: string;
}

interface QuickAction {
    id: string;
    label: string;
    icon: React.ElementType;
    action: () => void;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
    disabled?: boolean;
    tooltip?: string;
}

export function ProjectDetailHeader({
    project,
    workflowStages = [],
    onBack,
    onEdit,
    onShare,
    className
}: ProjectDetailHeaderProps) {
    const [isStarred, setIsStarred] = useState(false);
    const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { toast } = useToast();

    // Calculate key metrics for display
    const metrics = React.useMemo(() => {
        const currentStageIndex = workflowStages.findIndex(stage => stage.id === project.current_stage_id);
        const progressPercentage = currentStageIndex >= 0 && workflowStages.length > 1
            ? Math.round((currentStageIndex / (workflowStages.length - 1)) * 100)
            : 0;

        const stageEnteredAt = project.stage_entered_at
            ? parseISO(project.stage_entered_at)
            : project.created_at
                ? parseISO(project.created_at)
                : new Date(); // Fallback to current date if both are undefined

        const daysInStage = differenceInDays(new Date(), stageEnteredAt);

        const totalDuration = project.created_at
            ? differenceInDays(new Date(), parseISO(project.created_at))
            : 0; // If no created_at, duration is 0

        // Calculate health score
        let healthScore = 100;
        if (daysInStage > 14) healthScore -= 20;
        else if (daysInStage > 7) healthScore -= 10;

        if (project.estimated_delivery_date) {
            const daysToDelivery = differenceInDays(parseISO(project.estimated_delivery_date), new Date());
            if (daysToDelivery < 0) healthScore -= 30;
            else if (daysToDelivery < 7) healthScore -= 15;
        }

        if (project.priority_level === 'urgent') healthScore -= 10;
        else if (project.priority_level === 'high') healthScore -= 5;

        healthScore = Math.max(0, Math.min(100, healthScore));

        return {
            progressPercentage,
            daysInStage,
            totalDuration,
            healthScore,
            isOverdue: project.estimated_delivery_date ?
                differenceInDays(parseISO(project.estimated_delivery_date), new Date()) < 0 : false,
            isDueSoon: project.estimated_delivery_date ?
                differenceInDays(parseISO(project.estimated_delivery_date), new Date()) <= 7 : false
        };
    }, [project, workflowStages]);

    // Priority color mapping
    const getPriorityColor = (priority: ProjectPriority): string => {
        const colors = {
            urgent: 'bg-red-100 text-red-800 border-red-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            normal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[priority] || colors.normal;
    };

    // Status color mapping
    const getStatusColor = (status: string): string => {
        const colors = {
            active: 'bg-green-100 text-green-800 border-green-200',
            on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            delayed: 'bg-red-100 text-red-800 border-red-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
            completed: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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
        if (project.customer_organization?.name) return project.customer_organization.name;
        if (project.customer?.contact_name) return project.customer.contact_name;
        return 'N/A';
    };

    // Get assignee display name using correct database field name with fallback
    const assigneeId = project.assigned_to || project.assignee_id;
    const assigneeDisplayName = useUserDisplayName(assigneeId);

    // Get owner display name using assigned_to field (current owner) with fallback to created_by (creator)
    const ownerDisplayName = useOwnerDisplayName(project.assigned_to || project.created_by);

    // Debug logging for owner fields
    console.log('🔍 ProjectDetailHeader: Owner fields debug:', {
        projectId: project.id,
        assigned_to: project.assigned_to,
        created_by: project.created_by,
        ownerDisplayName: ownerDisplayName
    });

    // Quick actions configuration
    const quickActions: QuickAction[] = [
        {
            id: 'edit',
            label: 'Edit',
            icon: Edit,
            action: () => setIsEditModalOpen(true),
            variant: 'outline',
            disabled: false,
            tooltip: 'Edit project details'
        },
        {
            id: 'share',
            label: 'Share',
            icon: Share,
            action: () => {
                toast({
                    title: 'Coming Soon',
                    description: 'Share functionality will be available in a future update.',
                });
            },
            variant: 'outline',
            disabled: false,
            tooltip: 'Share project with team'
        },
        {
            id: 'track',
            label: 'Track',
            icon: Target,
            action: () => {
                toast({
                    title: 'Coming Soon',
                    description: 'Track functionality will be available in a future update.',
                });
            },
            variant: 'outline',
            tooltip: 'Track project progress'
        }
    ];

    // Handle star toggle
    const handleStarToggle = () => {
        setIsStarred(!isStarred);
        // TODO: Implement actual starring functionality
    };

    return (
        <div className={cn("border-b bg-card", className)}>
            {/* Top Navigation Bar */}
            <div className="p-4 border-b">
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <Button variant="ghost" onClick={onBack} className="flex-shrink-0">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Projects
                        </Button>
                    )}
                    <Separator orientation="vertical" className="h-6" />

                    {/* Real-time status indicator */}
                    <div className="flex items-center space-x-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            realTimeStatus === 'connected' && "bg-green-500 animate-pulse",
                            realTimeStatus === 'disconnected' && "bg-red-500",
                            realTimeStatus === 'reconnecting' && "bg-yellow-500 animate-pulse"
                        )} />
                        <span className="text-xs text-muted-foreground">
                            {realTimeStatus === 'connected' && 'Live Data'}
                            {realTimeStatus === 'disconnected' && 'Offline'}
                            {realTimeStatus === 'reconnecting' && 'Reconnecting...'}
                        </span>
                    </div>

                    <div className="flex-1" />

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStarToggle}
                            className={cn(
                                "flex-shrink-0",
                                isStarred && "text-yellow-600"
                            )}
                        >
                            <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
                        </Button>

                        {quickActions.map((action) => (
                            <TooltipProvider key={action.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={action.variant || 'outline'}
                                            size="sm"
                                            onClick={action.action}
                                            disabled={action.disabled}
                                            className="flex-shrink-0"
                                        >
                                            <action.icon className="w-4 h-4 mr-2" />
                                            {action.label}
                                        </Button>
                                    </TooltipTrigger>
                                    {action.tooltip && (
                                        <TooltipContent>
                                            <p>{action.tooltip}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        ))}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Activity Log
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Activity className="w-4 h-4 mr-2" />
                                    Performance Analytics
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Timer className="w-4 h-4 mr-2" />
                                    Time Tracking
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Main Header Content */}
            <div className="p-6">
                {/* Project Title and Key Info */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-4 mb-2">
                                <h1 className="text-2xl font-bold text-foreground truncate">
                                    {project.project_id} – {project.title}
                                </h1>

                                {/* Priority and Status Badges */}
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    <Badge className={cn("text-xs", getPriorityColor(project.priority_level || 'normal'))}>
                                        {(project.priority_level || 'normal').charAt(0).toUpperCase() + (project.priority_level || 'normal').slice(1)} Priority
                                    </Badge>

                                    <Badge className={cn("text-xs", getStatusColor(project.status || 'active'))}>
                                        {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Active'}
                                    </Badge>

                                    {/* Current Stage Badge */}
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        {project.current_stage?.name || 'Unknown Stage'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Key Metrics Row */}
                            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                    <Building2 className="w-4 h-4" />
                                    <span>Customer: {getCustomerDisplayName()}</span>
                                </div>

                                <Separator orientation="vertical" className="h-4" />

                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created: {project.created_at ? format(parseISO(project.created_at), 'MMM dd, yyyy') : 'Unknown'}</span>
                                </div>

                                <Separator orientation="vertical" className="h-4" />

                                <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>Owner: {ownerDisplayName}</span>
                                </div>

                                {project.estimated_value && (
                                    <>
                                        <Separator orientation="vertical" className="h-4" />
                                        <div className="flex items-center space-x-1">
                                            <DollarSign className="w-4 h-4" />
                                            <span>Value: {formatCurrency(project.estimated_value)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Health Score and Alerts */}
                        <div className="flex items-center space-x-4 flex-shrink-0">
                            {/* Health Score */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="text-center">
                                            <div className={cn(
                                                "text-2xl font-bold",
                                                metrics.healthScore >= 80 && "text-green-600",
                                                metrics.healthScore >= 60 && metrics.healthScore < 80 && "text-yellow-600",
                                                metrics.healthScore < 60 && "text-red-600"
                                            )}>
                                                {metrics.healthScore}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">Health</div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Project health score based on timeline, priority, and stage duration</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Alert Indicators */}
                            <div className="flex items-center space-x-2">
                                {project.priority_level === 'urgent' && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Zap className="w-5 h-5 text-red-600" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Urgent priority project</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                                {metrics.isOverdue && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Project is overdue</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                                {metrics.isDueSoon && !metrics.isOverdue && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Clock className="w-5 h-5 text-yellow-600" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Project due soon</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                                {metrics.daysInStage > 14 && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Timer className="w-5 h-5 text-orange-600" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Long time in current stage ({metrics.daysInStage} days)</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Overall Progress</span>
                                    <span className="text-sm font-bold text-blue-600">{metrics.progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${metrics.progressPercentage}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Days in Stage</span>
                                    <span className={cn(
                                        "text-sm font-bold",
                                        metrics.daysInStage > 14 ? "text-red-600" :
                                            metrics.daysInStage > 7 ? "text-yellow-600" : "text-green-600"
                                    )}>
                                        {metrics.daysInStage}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {project.stage_entered_at
                                        ? formatDistanceToNow(parseISO(project.stage_entered_at), { addSuffix: true })
                                        : 'Recently entered'
                                    }
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Total Duration</span>
                                    <span className="text-sm font-bold">{metrics.totalDuration} days</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {project.estimated_delivery_date ? (
                                        <>Due {format(parseISO(project.estimated_delivery_date), 'MMM dd, yyyy')}</>
                                    ) : (
                                        'No due date set'
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Workflow Stepper */}
                {workflowStages.length > 0 && (
                    <div className="mb-6">
                        <WorkflowStepper
                            key={`${project.id}-${project.current_stage_id}-${project.updated_at}`}
                            project={project}
                        />
                    </div>
                )}
            </div>

            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                project={project}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    toast({
                        title: 'Project updated',
                        description: `Project "${project.title}" updated.`,
                    });
                }}
            />
        </div>
    );
}