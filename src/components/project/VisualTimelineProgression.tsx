import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    CheckCircle2,
    Clock,
    Play,
    Circle,
    Calendar,
    Timer,
    TrendingUp,
    AlertTriangle,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays, differenceInHours, parseISO } from "date-fns";
import type { Project, WorkflowStage } from "@/types/project";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

interface VisualTimelineProgressionProps {
    project: Project;
    workflowStages: WorkflowStage[];
    stageHistory?: ProjectStageHistory[];
    className?: string;
}

interface ProjectStageHistory {
    id: string;
    project_id: string;
    stage_id: string;
    entered_at: string;
    exited_at?: string;
    duration_minutes?: number;
    entered_by?: string;
    exit_reason?: string;
    notes?: string;
    created_at: string;
}

interface TimelineStage {
    stage: WorkflowStage;
    status: 'completed' | 'current' | 'upcoming';
    enteredAt?: string;
    exitedAt?: string;
    duration?: number; // in days
    isOnTime: boolean;
    isDelayed: boolean;
    estimatedDuration?: number;
}

export function VisualTimelineProgression({
    project,
    workflowStages,
    stageHistory = [],
    className
}: VisualTimelineProgressionProps) {

    // Process timeline data
    const timelineData = useMemo((): TimelineStage[] => {
        const currentStageIndex = workflowStages.findIndex(stage => stage.id === project.current_stage_id);

        return workflowStages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isUpcoming = index > currentStageIndex;

            // Find stage history for this stage
            const history = stageHistory.find(h => h.stage_id === stage.id);

            let enteredAt: string | undefined;
            let exitedAt: string | undefined;
            let duration: number | undefined;

            if (history) {
                enteredAt = history.entered_at;
                exitedAt = history.exited_at;
                if (history.duration_minutes) {
                    duration = Math.round(history.duration_minutes / (24 * 60)); // Convert to days
                }
            } else if (isCurrent) {
                // For current stage, use stage_entered_at or created_at
                enteredAt = project.stage_entered_at || project.created_at;
                // Calculate current duration
                const stageStart = parseISO(enteredAt);
                duration = differenceInDays(new Date(), stageStart);
            }

            // Estimate typical duration for this stage (could come from database)
            const estimatedDuration = stage.estimated_duration_days || getEstimatedDurationForStage(stage.name);

            // Determine if stage is on time or delayed
            const isOnTime = duration ? duration <= estimatedDuration : true;
            const isDelayed = duration ? duration > estimatedDuration * 1.5 : false;

            return {
                stage,
                status: isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming',
                enteredAt,
                exitedAt,
                duration,
                estimatedDuration,
                isOnTime,
                isDelayed
            };
        });
    }, [project, workflowStages, stageHistory]);

    // Calculate overall timeline metrics
    const timelineMetrics = useMemo(() => {
        const completedStages = timelineData.filter(t => t.status === 'completed');
        const currentStage = timelineData.find(t => t.status === 'current');

        const totalDuration = differenceInDays(new Date(), parseISO(project.created_at));
        const averageStageTime = completedStages.length > 0
            ? completedStages.reduce((sum, stage) => sum + (stage.duration || 0), 0) / completedStages.length
            : 0;

        const progressPercentage = timelineData.length > 1
            ? Math.round(((completedStages.length + (currentStage ? 0.5 : 0)) / timelineData.length) * 100)
            : 0;

        const estimatedTotalDuration = timelineData.reduce((sum, stage) => sum + (stage.estimatedDuration || 0), 0);
        const actualTotalDuration = completedStages.reduce((sum, stage) => sum + (stage.duration || 0), 0) + (currentStage?.duration || 0);

        const isAheadOfSchedule = actualTotalDuration < estimatedTotalDuration * 0.9;
        const isBehindSchedule = actualTotalDuration > estimatedTotalDuration * 1.1;

        return {
            totalDuration,
            averageStageTime,
            progressPercentage,
            estimatedTotalDuration,
            actualTotalDuration,
            isAheadOfSchedule,
            isBehindSchedule,
            completedStages: completedStages.length,
            totalStages: timelineData.length
        };
    }, [timelineData, project]);

    // Get estimated duration for stage based on stage name (fallback)
    function getEstimatedDurationForStage(stageName: string): number {
        const durations: Record<string, number> = {
            'Inquiry Received': 1,
            'Technical Review': 5,
            'Supplier RFQ': 7,
            'Quoted': 2,
            'Order Confirmed': 1,
            'Procurement Planning': 3,
            'In Production': 14,
            'Shipped & Closed': 1
        };
        return durations[stageName] || 3;
    }

    // Get stage status color
    const getStageStatusColor = (timeline: TimelineStage): string => {
        if (timeline.status === 'completed') return 'text-green-600';
        if (timeline.status === 'current') {
            if (timeline.isDelayed) return 'text-red-600';
            if (!timeline.isOnTime) return 'text-yellow-600';
            return 'text-blue-600';
        }
        return 'text-gray-400';
    };

    // Get stage background color
    const getStageBackgroundColor = (timeline: TimelineStage): string => {
        if (timeline.status === 'completed') return 'bg-green-100 border-green-200';
        if (timeline.status === 'current') {
            if (timeline.isDelayed) return 'bg-red-100 border-red-200';
            if (!timeline.isOnTime) return 'bg-yellow-100 border-yellow-200';
            return 'bg-blue-100 border-blue-200';
        }
        return 'bg-gray-50 border-gray-200';
    };

    // Get stage icon
    const getStageIcon = (timeline: TimelineStage) => {
        if (timeline.status === 'completed') return CheckCircle2;
        if (timeline.status === 'current') return Play;
        return Circle;
    };

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <Timer className="w-5 h-5" />
                        <span>Timeline Progression</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="text-muted-foreground">Completed</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-muted-foreground">Current</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-muted-foreground">Upcoming</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Overall Progress */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Overall Progress</h4>
                        <div className="flex items-center space-x-4 text-sm">
                            <span className="text-muted-foreground">
                                {timelineMetrics.completedStages} of {timelineMetrics.totalStages} stages
                            </span>
                            <Badge variant={timelineMetrics.isBehindSchedule ? 'destructive' : timelineMetrics.isAheadOfSchedule ? 'default' : 'secondary'}>
                                {timelineMetrics.isBehindSchedule ? 'Behind Schedule' :
                                    timelineMetrics.isAheadOfSchedule ? 'Ahead of Schedule' : 'On Schedule'}
                            </Badge>
                        </div>
                    </div>

                    <Progress value={timelineMetrics.progressPercentage} className="h-3" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total Duration:</span>
                            <span className="font-medium">{timelineMetrics.totalDuration} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Avg Stage Time:</span>
                            <span className="font-medium">{Math.round(timelineMetrics.averageStageTime)} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Progress:</span>
                            <span className="font-medium">{timelineMetrics.progressPercentage}%</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Stage Timeline</h4>

                    {/* Desktop Timeline - Horizontal */}
                    <div className="hidden md:block">
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200"></div>
                            <div
                                className="absolute top-6 left-6 h-0.5 bg-blue-600 transition-all duration-500"
                                style={{
                                    width: `${Math.max(0, (timelineMetrics.progressPercentage / 100) * 100 - 12)}%`
                                }}
                            ></div>

                            {/* Timeline Stages */}
                            <div className="flex justify-between">
                                {timelineData.map((timeline, index) => {
                                    const Icon = getStageIcon(timeline);

                                    return (
                                        <TooltipProvider key={timeline.stage.id}>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <div className="flex flex-col items-center space-y-2 cursor-pointer">
                                                        {/* Stage Icon */}
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                                                            getStageBackgroundColor(timeline),
                                                            timeline.status === 'current' && "ring-2 ring-blue-200 ring-offset-2"
                                                        )}>
                                                            <Icon className={cn("w-5 h-5", getStageStatusColor(timeline))} />
                                                        </div>

                                                        {/* Stage Name */}
                                                        <div className="text-center max-w-[100px]">
                                                            <div className={cn(
                                                                "text-xs font-medium truncate",
                                                                timeline.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
                                                            )}>
                                                                {timeline.stage.name}
                                                            </div>

                                                            {/* Duration */}
                                                            {timeline.duration !== undefined && (
                                                                <div className={cn(
                                                                    "text-xs mt-1",
                                                                    timeline.isDelayed ? 'text-red-600' :
                                                                        !timeline.isOnTime ? 'text-yellow-600' : 'text-green-600'
                                                                )}>
                                                                    {timeline.duration}d
                                                                    {timeline.estimatedDuration && (
                                                                        <span className="text-muted-foreground">
                                                                            /{timeline.estimatedDuration}d
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="font-medium">{timeline.stage.name}</div>
                                                        {timeline.stage.description && (
                                                            <div className="text-muted-foreground text-xs">
                                                                {timeline.stage.description}
                                                            </div>
                                                        )}

                                                        {timeline.enteredAt && (
                                                            <div className="space-y-1">
                                                                <div className="text-xs">
                                                                    <span className="font-medium">Entered:</span> {format(parseISO(timeline.enteredAt), 'MMM dd, yyyy')}
                                                                </div>
                                                                {timeline.exitedAt && (
                                                                    <div className="text-xs">
                                                                        <span className="font-medium">Exited:</span> {format(parseISO(timeline.exitedAt), 'MMM dd, yyyy')}
                                                                    </div>
                                                                )}
                                                                {timeline.duration !== undefined && (
                                                                    <div className="text-xs">
                                                                        <span className="font-medium">Duration:</span> {timeline.duration} days
                                                                        {timeline.estimatedDuration && (
                                                                            <span className="text-muted-foreground"> (est. {timeline.estimatedDuration}d)</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {timeline.status === 'current' && (
                                                            <div className="text-xs">
                                                                <span className="font-medium">Status:</span> {
                                                                    timeline.isDelayed ? 'Delayed' :
                                                                        !timeline.isOnTime ? 'At Risk' : 'On Track'
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Timeline - Vertical */}
                    <div className="md:hidden space-y-4">
                        {timelineData.map((timeline, index) => {
                            const Icon = getStageIcon(timeline);

                            return (
                                <div key={timeline.stage.id} className="flex items-start space-x-4">
                                    {/* Timeline Connector */}
                                    <div className="flex flex-col items-center">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                                            getStageBackgroundColor(timeline)
                                        )}>
                                            <Icon className={cn("w-4 h-4", getStageStatusColor(timeline))} />
                                        </div>
                                        {index < timelineData.length - 1 && (
                                            <div className={cn(
                                                "w-0.5 h-8 mt-2",
                                                timeline.status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                                            )}></div>
                                        )}
                                    </div>

                                    {/* Stage Content */}
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className={cn(
                                                "font-medium text-sm",
                                                timeline.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
                                            )}>
                                                {timeline.stage.name}
                                            </h5>

                                            {timeline.duration !== undefined && (
                                                <Badge variant="outline" className={cn(
                                                    "text-xs",
                                                    timeline.isDelayed ? 'border-red-200 text-red-700' :
                                                        !timeline.isOnTime ? 'border-yellow-200 text-yellow-700' :
                                                            'border-green-200 text-green-700'
                                                )}>
                                                    {timeline.duration}d
                                                    {timeline.estimatedDuration && `/${timeline.estimatedDuration}d`}
                                                </Badge>
                                            )}
                                        </div>

                                        {timeline.stage.description && (
                                            <p className="text-xs text-muted-foreground mb-2">
                                                {timeline.stage.description}
                                            </p>
                                        )}

                                        {timeline.enteredAt && (
                                            <div className="text-xs text-muted-foreground">
                                                {timeline.status === 'completed' ? 'Completed' : 'Started'} {formatDistanceToNow(parseISO(timeline.enteredAt), { addSuffix: true })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Timeline Insights */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-semibold flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Timeline Insights</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Estimated Total:</span>
                                <span className="font-medium">{timelineMetrics.estimatedTotalDuration} days</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Actual Progress:</span>
                                <span className="font-medium">{Math.round(timelineMetrics.actualTotalDuration)} days</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Variance:</span>
                                <span className={cn(
                                    "font-medium",
                                    timelineMetrics.isBehindSchedule ? 'text-red-600' :
                                        timelineMetrics.isAheadOfSchedule ? 'text-green-600' : 'text-foreground'
                                )}>
                                    {timelineMetrics.actualTotalDuration > timelineMetrics.estimatedTotalDuration ? '+' : ''}
                                    {Math.round(timelineMetrics.actualTotalDuration - timelineMetrics.estimatedTotalDuration)} days
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Completion:</span>
                                <span className="font-medium">{timelineMetrics.progressPercentage}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}