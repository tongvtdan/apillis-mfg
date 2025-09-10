import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, BarChart3 } from 'lucide-react';
import { DashboardWidget, ManufacturingMetrics, TimeRange } from '../../types/dashboard.types';
import { useProjects } from '@/hooks/useProjects';
import { PROJECT_TYPE_LABELS, PROJECT_STAGES, LEGACY_TO_STAGE_NAME } from '@/types/project';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart as RechartsPieChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface ProjectOverviewWidgetProps {
    widget: DashboardWidget;
    metrics: ManufacturingMetrics | null;
    timeRange: TimeRange;
    isEditMode: boolean;
    onUpdate: (updates: Partial<DashboardWidget>) => void;
}


export function ProjectOverviewWidget({ widget, metrics, timeRange, isEditMode, onUpdate }: ProjectOverviewWidgetProps) {
    const { projects, loading } = useProjects();


    // Aggregate project data for charts
    const projectStats = React.useMemo(() => {
        const stats = {
            totalProjects: projects.length,
            activeProjects: 0,
            completedProjects: 0,
            byType: {
                system_build: 0,
                fabrication: 0,
                manufacturing: 0,
                unspecified: 0
            },
            byStage: {} as Record<string, number>
        };

        // Initialize stage counts
        PROJECT_STAGES.forEach(stage => {
            stats.byStage[stage.name] = 0;
        });

        if (!projects || !Array.isArray(projects)) {
            console.warn('⚠️ Projects array is invalid:', projects);
            return stats;
        }

        projects.forEach((project: any) => {
            if (!project) return; // Skip if project is null/undefined

            // Count by status - use same logic as dashboard service
            const isCompleted = project.status === 'completed' || project.current_stage === 'shipped_closed';
            const isActive = project.status === 'inquiry' ||
                project.status === 'reviewing' ||
                project.status === 'quoted' ||
                project.status === 'confirmed' ||
                project.status === 'procurement' ||
                project.status === 'production';

            if (isCompleted) {
                stats.completedProjects++;
            } else if (isActive) {
                stats.activeProjects++;
            }
            // Note: Projects in 'draft' or 'cancelled' status are not counted as active

            // Count by project type
            const projectType = project.project_type || 'unspecified';
            if (stats.byType[projectType as keyof typeof stats.byType] !== undefined) {
                stats.byType[projectType as keyof typeof stats.byType]++;
            } else {
                stats.byType.unspecified++;
            }

            // Count by stage
            let stageName = 'Inquiry Received'; // default

            // Handle different possible current_stage formats
            if (project.current_stage) {
                if (typeof project.current_stage === 'object' && project.current_stage?.name) {
                    // New workflow stage format
                    stageName = project.current_stage.name;
                } else if (Array.isArray(project.current_stage) && project.current_stage.length > 0 && project.current_stage[0]?.name) {
                    // Array format (sometimes Supabase returns arrays)
                    stageName = project.current_stage[0].name;
                } else if (typeof project.current_stage === 'string') {
                    // Legacy stage ID format
                    stageName = LEGACY_TO_STAGE_NAME[project.current_stage as keyof typeof LEGACY_TO_STAGE_NAME] || project.current_stage;
                }
            } else {
                // Fallback: try to infer from status field if available
                if (project.status) {
                    const statusMapping: Record<string, string> = {
                        'draft': 'Inquiry Received',
                        'inquiry': 'Inquiry Received',
                        'reviewing': 'Technical Review',
                        'quoted': 'Quoted',
                        'confirmed': 'Order Confirmed',
                        'procurement': 'Procurement Planning',
                        'production': 'In Production',
                        'completed': 'Shipped & Closed'
                    };
                    stageName = statusMapping[project.status] || 'Inquiry Received';
                }
            }

            // Safety check for stageName
            if (!stageName || typeof stageName !== 'string') {
                stageName = 'Inquiry Received';
            }

            stats.byStage[stageName] = (stats.byStage[stageName] || 0) + 1;

        });

        return stats;
    }, [projects]);

    // Prepare chart data
    const typeChartData = Object.entries(projectStats.byType).map(([type, count]) => ({
        name: PROJECT_TYPE_LABELS[type as keyof typeof PROJECT_TYPE_LABELS] || type,
        value: count,
        type: type
    })).filter(item => item.value > 0);

    const stageChartData = Object.entries(projectStats.byStage).map(([stage, count]) => ({
        name: stage,
        value: count
    })).filter(item => item.value > 0);

    const typeColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <PieChart className="h-5 w-5" />
                        <span>{widget.title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="animate-pulse">
                            <div className="bg-muted rounded-lg h-64"></div>
                        </div>
                        <div className="animate-pulse">
                            <div className="bg-muted rounded-lg h-64"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (projects.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <PieChart className="h-5 w-5" />
                        <span>{widget.title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No projects found</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>{widget.title}</span>
                    <Badge variant="outline" className="ml-auto">
                        {projectStats.totalProjects} Total Projects
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Types Chart */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4" />
                                <span>Projects by Type</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {typeChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '6px'
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {typeChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={typeColors[index % typeColors.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">No project type data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Project Stages Chart */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center space-x-2">
                                <PieChart className="h-4 w-4" />
                                <span>Projects by Stage</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stageChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={stageChartData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={70}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {stageChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={typeColors[index % typeColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '6px'
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">No stage data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{projectStats.totalProjects}</div>
                        <div className="text-xs text-muted-foreground">Total Projects</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{projectStats.activeProjects}</div>
                        <div className="text-xs text-muted-foreground">Active Projects</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{projectStats.completedProjects}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {projectStats.totalProjects > 0 ? Math.round((projectStats.completedProjects / projectStats.totalProjects) * 100) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Completion Rate</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

