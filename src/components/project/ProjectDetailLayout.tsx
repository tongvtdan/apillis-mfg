import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    FileText,
    MessageSquare,
    Users,
    BarChart3,
    Settings,
    Clock,
    CheckCircle2,
    AlertCircle,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, WorkflowStage } from "@/types/project";

interface ProjectDetailLayoutProps {
    project: Project;
    workflowStages?: WorkflowStage[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    children?: React.ReactNode;
    className?: string;
}

interface TabConfig {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    disabled?: boolean;
}

export function ProjectDetailLayout({
    project,
    workflowStages = [],
    activeTab = 'overview',
    onTabChange,
    children,
    className
}: ProjectDetailLayoutProps) {
    const [internalActiveTab, setInternalActiveTab] = useState(activeTab);

    // Handle tab changes
    const handleTabChange = (tab: string) => {
        setInternalActiveTab(tab);
        onTabChange?.(tab);
    };

    // Tab configuration with dynamic badges
    const tabs: TabConfig[] = [
        {
            id: 'overview',
            label: 'Overview',
            icon: Activity,
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: FileText,
            badge: 0, // Will be populated by parent
        },
        {
            id: 'communication',
            label: 'Communication',
            icon: MessageSquare,
            badge: 0, // Will be populated by parent
        },
        {
            id: 'reviews',
            label: 'Reviews',
            icon: Users,
            badge: 0, // Will be populated by parent
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
        }
    ];

    // Get current stage info
    const currentStage = workflowStages.find(stage => stage.id === project.current_stage_id);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Project Status Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Project Status</CardTitle>
                        <div className="flex items-center space-x-2">
                            {currentStage && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {currentStage.name}
                                </Badge>
                            )}
                            <Badge className={getStatusColor(project.status)}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Progress Indicator */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                    {calculateProgress(project, workflowStages)}%
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${calculateProgress(project, workflowStages)}%` }}
                                />
                            </div>
                        </div>

                        {/* Time in Stage */}
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <div className="text-sm font-medium">
                                    {getDaysInStage(project)} days in stage
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Since {formatStageEntryDate(project)}
                                </div>
                            </div>
                        </div>

                        {/* Health Indicator */}
                        <div className="flex items-center space-x-2">
                            {getHealthIcon(project)}
                            <div>
                                <div className="text-sm font-medium">
                                    {getHealthStatus(project)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Project health
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={internalActiveTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            disabled={tab.disabled}
                            className="flex items-center space-x-2"
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <Badge
                                    variant={tab.badgeVariant || 'secondary'}
                                    className="ml-1 h-5 min-w-[20px] text-xs"
                                >
                                    {tab.badge}
                                </Badge>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Tab Content */}
                <div className="mt-6">
                    {children}
                </div>
            </Tabs>
        </div>
    );
}

// Helper functions
function getStatusColor(status: string): string {
    const colors = {
        active: 'bg-green-100 text-green-800 border-green-200',
        on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        completed: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
}

function calculateProgress(project: Project, stages: WorkflowStage[]): number {
    if (!project.current_stage_id || stages.length === 0) return 0;

    const currentStageIndex = stages.findIndex(stage => stage.id === project.current_stage_id);
    if (currentStageIndex === -1) return 0;

    return Math.round((currentStageIndex / (stages.length - 1)) * 100);
}

function getDaysInStage(project: Project): number {
    const stageEnteredAt = project.stage_entered_at || project.created_at;
    if (!stageEnteredAt) return 0;

    const entryDate = new Date(stageEnteredAt);
    const now = new Date();
    return Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
}

function formatStageEntryDate(project: Project): string {
    const stageEnteredAt = project.stage_entered_at || project.created_at;
    if (!stageEnteredAt) return 'Unknown';

    return new Date(stageEnteredAt).toLocaleDateString();
}

function getHealthIcon(project: Project): React.ReactElement {
    const health = getHealthStatus(project);

    if (health === 'Good') {
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    } else if (health === 'At Risk') {
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    } else {
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
}

function getHealthStatus(project: Project): string {
    const daysInStage = getDaysInStage(project);

    // Simple health calculation based on time in stage and priority
    if (project.priority_level === 'critical' && daysInStage > 3) return 'Critical';
    if (project.priority_level === 'high' && daysInStage > 7) return 'At Risk';
    if (daysInStage > 14) return 'At Risk';

    return 'Good';
}