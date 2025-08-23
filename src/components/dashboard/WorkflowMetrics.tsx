import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, Timer, AlertTriangle, TrendingDown } from "lucide-react";
import { Project } from "@/types/project";

interface WorkflowMetricsProps {
    projects: Project[];
}

export function WorkflowMetrics({ projects }: WorkflowMetricsProps) {
    // Calculate workflow performance metrics
    const metrics = useMemo(() => {
        const totalProjects = projects.length;
        const bottleneckProjects = projects.filter(p => p.days_in_stage > 14).length;
        const overdueProjects = projects.filter(p => p.days_in_stage > 7).length;
        const avgCycleTime = totalProjects > 0
            ? projects.reduce((sum, p) => sum + p.days_in_stage, 0) / totalProjects
            : 0;

        return {
            totalProjects,
            bottleneckProjects,
            overdueProjects,
            avgCycleTime,
            bottleneckPercentage: totalProjects > 0 ? (bottleneckProjects / totalProjects) * 100 : 0,
            overduePercentage: totalProjects > 0 ? (overdueProjects / totalProjects) * 100 : 0
        };
    }, [projects]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
                <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <div>
                        <p className="text-sm font-medium">Total Projects</p>
                        <p className="text-2xl font-bold">{metrics.totalProjects}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-yellow-500" />
                    <div>
                        <p className="text-sm font-medium">Avg. Cycle Time</p>
                        <p className="text-2xl font-bold">{metrics.avgCycleTime.toFixed(1)}d</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                        <p className="text-sm font-medium">Overdue</p>
                        <p className="text-2xl font-bold">{metrics.overdueProjects}</p>
                        <p className="text-xs text-muted-foreground">{metrics.overduePercentage.toFixed(1)}%</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <div>
                        <p className="text-sm font-medium">Bottlenecks</p>
                        <p className="text-2xl font-bold">{metrics.bottleneckProjects}</p>
                        <p className="text-xs text-muted-foreground">{metrics.bottleneckPercentage.toFixed(1)}%</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
