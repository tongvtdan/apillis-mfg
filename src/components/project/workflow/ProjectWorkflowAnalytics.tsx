import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Project, PROJECT_STAGES } from "@/types/project";
import { Clock, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface ProjectWorkflowAnalyticsProps {
    projects: Project[];
}

export function ProjectWorkflowAnalytics({ projects }: ProjectWorkflowAnalyticsProps) {
    const analytics = useMemo(() => {
        // Get unique workflow stages from projects
        const workflowStages = Array.from(
            new Map(
                projects
                    .filter(p => p.current_stage)
                    .map(p => [p.current_stage!.id, p.current_stage!])
            ).values()
        ).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

        // Calculate stage distribution using actual workflow stages
        const stageDistribution = workflowStages.map(stage => {
            const stageProjects = projects.filter(p => p.current_stage_id === stage.id);
            return {
                name: stage.name,
                count: stageProjects.length,
                percentage: projects.length > 0 ? Math.round((stageProjects.length / projects.length) * 100) : 0,
                color: stage.color || '#6B7280'
            };
        });

        // Calculate bottlenecks (stages with high project count and long average time)
        const bottlenecks = stageDistribution
            .filter(stage => stage.count > 0)
            .map(stage => {
                const stageProjects = projects.filter(p => p.current_stage?.name === stage.name);
                const avgDaysInStage = stageProjects.length > 0
                    ? stageProjects.reduce((sum, p) => sum + (p.days_in_stage || 0), 0) / stageProjects.length
                    : 0;

                return {
                    ...stage,
                    avgDaysInStage: Math.round(avgDaysInStage),
                    bottleneckScore: stage.count * avgDaysInStage
                };
            })
            .sort((a, b) => b.bottleneckScore - a.bottleneckScore);

        // Calculate priority distribution
        const priorityDistribution = [
            { name: 'Urgent', count: projects.filter(p => (p.priority_level || p.priority) === 'urgent').length, color: '#EF4444' },
            { name: 'High', count: projects.filter(p => (p.priority_level || p.priority) === 'high').length, color: '#F97316' },
            { name: 'Medium', count: projects.filter(p => (p.priority_level || p.priority) === 'medium').length, color: '#F59E0B' },
            { name: 'Low', count: projects.filter(p => (p.priority_level || p.priority) === 'low').length, color: '#10B981' }
        ];

        // Calculate workflow efficiency metrics
        const completedProjects = projects.filter(p => p.status === 'completed' || p.current_stage?.slug === 'shipped_closed');
        const activeProjects = projects.filter(p => p.status === 'active');
        const delayedProjects = projects.filter(p => p.status === 'delayed' || (p.days_in_stage && p.days_in_stage > 14));

        const totalValue = projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0);
        const completedValue = completedProjects.reduce((sum, p) => sum + (p.estimated_value || 0), 0);

        return {
            stageDistribution,
            bottlenecks: bottlenecks.slice(0, 3), // Top 3 bottlenecks
            priorityDistribution,
            metrics: {
                totalProjects: projects.length,
                activeProjects: activeProjects.length,
                completedProjects: completedProjects.length,
                delayedProjects: delayedProjects.length,
                completionRate: projects.length > 0 ? Math.round((completedProjects.length / projects.length) * 100) : 0,
                totalValue,
                completedValue,
                valueCompletionRate: totalValue > 0 ? Math.round((completedValue / totalValue) * 100) : 0
            }
        };
    }, [projects]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                                <p className="text-2xl font-bold">{analytics.metrics.totalProjects}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <BarChart className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                                <p className="text-2xl font-bold">{analytics.metrics.completionRate}%</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                        </div>
                        <Progress value={analytics.metrics.completionRate} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Delayed Projects</p>
                                <p className="text-2xl font-bold">{analytics.metrics.delayedProjects}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">{formatCurrency(analytics.metrics.totalValue)}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.metrics.valueCompletionRate}% completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stage Distribution Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Workflow Stage Distribution</CardTitle>
                        <CardDescription>Projects by current workflow stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            width={400}
                            height={300}
                            data={analytics.stageDistribution}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                fontSize={12}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3B82F6" />
                        </BarChart>
                    </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Priority Distribution</CardTitle>
                        <CardDescription>Projects by priority level</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PieChart
                            width={400}
                            height={300}
                        >
                            <Pie
                                data={analytics.priorityDistribution.filter(p => p.count > 0)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, count, percent }) => `${name}: ${count} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {analytics.priorityDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </CardContent>
                </Card>
            </div>

            {/* Bottlenecks Analysis */}
            {analytics.bottlenecks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Workflow Bottlenecks
                        </CardTitle>
                        <CardDescription>Stages with high project count and long average duration</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.bottlenecks.map((bottleneck, index) => (
                                <div key={bottleneck.name} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-xs">
                                            #{index + 1}
                                        </Badge>
                                        <div>
                                            <p className="font-medium">{bottleneck.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {bottleneck.count} projects • {bottleneck.avgDaysInStage} days avg
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">Bottleneck Score</p>
                                        <p className="text-lg font-bold text-red-600">{Math.round(bottleneck.bottleneckScore)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stage Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Stage Details</CardTitle>
                    <CardDescription>Detailed breakdown of each workflow stage</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {analytics.stageDistribution.map((stage) => (
                            <div key={stage.name} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: stage.color }}
                                    />
                                    <div>
                                        <p className="font-medium">{stage.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {stage.count} projects ({stage.percentage}%)
                                        </p>
                                    </div>
                                </div>
                                <Progress value={stage.percentage} className="w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}