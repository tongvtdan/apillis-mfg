import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    CheckCircle,
    Circle,
    Clock,
    AlertTriangle,
    ArrowRight,
    Users,
    FileText,
    Calendar,
    Info
} from "lucide-react";
import { Project, WorkflowStage } from "@/types/project";
import { useWorkflowStages } from "@/hooks/useWorkflowStages";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EnhancedStageProgressionProps {
    project: Project;
    onStageClick?: (stage: WorkflowStage) => void;
    showDetails?: boolean;
    compact?: boolean;
}

interface StageStatus {
    stage: WorkflowStage;
    status: 'completed' | 'current' | 'upcoming' | 'blocked';
    progress: number;
    estimatedDuration?: string;
    actualDuration?: string;
    requirements: {
        total: number;
        completed: number;
    };
}

export function EnhancedStageProgression({
    project,
    onStageClick,
    showDetails = true,
    compact = false
}: EnhancedStageProgressionProps) {
    const { data: workflowStages = [], isLoading } = useWorkflowStages();
    const [hoveredStage, setHoveredStage] = useState<string | null>(null);

    // Calculate stage statuses
    const stageStatuses: StageStatus[] = workflowStages.map((stage, index) => {
        const currentStageIndex = workflowStages.findIndex(s => s.id === project.current_stage_id);

        let status: StageStatus['status'] = 'upcoming';
        let progress = 0;

        if (index < currentStageIndex) {
            status = 'completed';
            progress = 100;
        } else if (index === currentStageIndex) {
            status = 'current';
            progress = calculateStageProgress(stage, project);
        } else {
            status = 'upcoming';
            progress = 0;
        }

        // Calculate requirements (mock data for now)
        const requirements = {
            total: getStageRequirementCount(stage),
            completed: status === 'completed' ? getStageRequirementCount(stage) :
                status === 'current' ? Math.floor(getStageRequirementCount(stage) * (progress / 100)) : 0
        };

        return {
            stage,
            status,
            progress,
            estimatedDuration: stage.estimated_duration_days ? `${stage.estimated_duration_days} days` : undefined,
            requirements
        };
    });

    const calculateStageProgress = (stage: WorkflowStage, project: Project): number => {
        // Basic progress calculation based on project data
        // In a real implementation, this would check actual completion criteria
        switch (stage.name) {
            case 'Inquiry Received':
                return (project.customer_organization_id ? 50 : 0) + (project.description ? 50 : 0);
            case 'Technical Review':
                return project.notes ? 75 : 25;
            case 'Supplier RFQ':
                return 50; // Would check actual RFQ status
            case 'Quoted':
                return project.estimated_value ? 80 : 30;
            case 'Order Confirmed':
                return 60; // Would check PO status
            default:
                return 40;
        }
    };

    const getStageRequirementCount = (stage: WorkflowStage): number => {
        // Return number of requirements based on stage
        switch (stage.name) {
            case 'Inquiry Received':
                return 2;
            case 'Technical Review':
                return 3;
            case 'Supplier RFQ':
                return 4;
            case 'Quoted':
                return 3;
            case 'Order Confirmed':
                return 2;
            case 'Procurement Planning':
                return 4;
            case 'In Production':
                return 3;
            case 'Shipped & Closed':
                return 2;
            default:
                return 1;
        }
    };

    const getStatusIcon = (status: StageStatus) => {
        switch (status.status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'current':
                return <Clock className="w-5 h-5 text-blue-600" />;
            case 'blocked':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            default:
                return <Circle className="w-5 h-5 text-gray-300" />;
        }
    };

    const getStatusColor = (status: StageStatus) => {
        switch (status.status) {
            case 'completed':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'current':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'blocked':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-400 bg-gray-50 border-gray-200';
        }
    };

    const getProgressColor = (status: StageStatus) => {
        switch (status.status) {
            case 'completed':
                return 'bg-green-600';
            case 'current':
                return 'bg-blue-600';
            case 'blocked':
                return 'bg-red-600';
            default:
                return 'bg-gray-300';
        }
    };

    const handleStageClick = (stage: WorkflowStage) => {
        if (onStageClick) {
            onStageClick(stage);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <Clock className="w-5 h-5 animate-spin mr-2" />
                        <span>Loading stage progression...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (compact) {
        // Compact horizontal view
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        {stageStatuses.map((stageStatus, index) => (
                            <React.Fragment key={stageStatus.stage.id}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={cn(
                                                    "flex flex-col items-center cursor-pointer transition-all duration-200",
                                                    onStageClick && "hover:scale-105"
                                                )}
                                                onClick={() => handleStageClick(stageStatus.stage)}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1",
                                                    getStatusColor(stageStatus)
                                                )}>
                                                    {getStatusIcon(stageStatus)}
                                                </div>
                                                <span className="text-xs text-center max-w-[60px] truncate">
                                                    {stageStatus.stage.name}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-sm">
                                                <div className="font-medium">{stageStatus.stage.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {stageStatus.progress}% complete
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {index < stageStatuses.length - 1 && (
                                    <div className={cn(
                                        "flex-1 h-0.5 mx-2",
                                        stageStatus.status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                                    )} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Full detailed view
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Project Stage Progression</span>
                    <Badge variant="secondary">
                        {stageStatuses.filter(s => s.status === 'completed').length} / {stageStatuses.length} Complete
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overall Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{Math.round((stageStatuses.filter(s => s.status === 'completed').length / stageStatuses.length) * 100)}%</span>
                    </div>
                    <Progress
                        value={(stageStatuses.filter(s => s.status === 'completed').length / stageStatuses.length) * 100}
                        className="h-2"
                    />
                </div>

                {/* Stage Details */}
                <div className="space-y-3">
                    {stageStatuses.map((stageStatus, index) => (
                        <div
                            key={stageStatus.stage.id}
                            className={cn(
                                "p-4 border rounded-lg transition-all duration-200",
                                getStatusColor(stageStatus),
                                onStageClick && "cursor-pointer hover:shadow-md",
                                hoveredStage === stageStatus.stage.id && "shadow-md"
                            )}
                            onClick={() => handleStageClick(stageStatus.stage)}
                            onMouseEnter={() => setHoveredStage(stageStatus.stage.id)}
                            onMouseLeave={() => setHoveredStage(null)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    {getStatusIcon(stageStatus)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{stageStatus.stage.name}</h4>
                                            <Badge variant={stageStatus.status === 'current' ? 'default' : 'secondary'}>
                                                {stageStatus.status === 'completed' ? 'Complete' :
                                                    stageStatus.status === 'current' ? 'In Progress' :
                                                        stageStatus.status === 'blocked' ? 'Blocked' : 'Upcoming'}
                                            </Badge>
                                        </div>

                                        {stageStatus.stage.description && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {stageStatus.stage.description}
                                            </p>
                                        )}

                                        {/* Stage Progress */}
                                        {stageStatus.status === 'current' && (
                                            <div className="mb-2">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>Stage Progress</span>
                                                    <span>{stageStatus.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className={cn("h-1.5 rounded-full transition-all duration-300", getProgressColor(stageStatus))}
                                                        style={{ width: `${stageStatus.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Requirements */}
                                        {showDetails && (
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>{stageStatus.requirements.completed}/{stageStatus.requirements.total} Requirements</span>
                                                </div>

                                                {stageStatus.estimatedDuration && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{stageStatus.estimatedDuration}</span>
                                                    </div>
                                                )}

                                                {stageStatus.stage.responsible_roles && stageStatus.stage.responsible_roles.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        <span>{stageStatus.stage.responsible_roles.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {onStageClick && stageStatus.status !== 'completed' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStageClick(stageStatus.stage);
                                        }}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}