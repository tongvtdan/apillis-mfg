import { useMemo } from "react";
import { AlertTriangle, Timer } from "lucide-react";
import { Project, ProjectStatus } from "@/types/project";

interface StageMetricsProps {
    projects: Project[];
    stageId: ProjectStatus;
}

export function StageMetrics({ projects, stageId }: StageMetricsProps) {
    // Calculate stage metrics
    const metrics = useMemo(() => {
        const avgDaysInStage = projects.length > 0
            ? projects.reduce((sum, p) => sum + p.days_in_stage, 0) / projects.length
            : 0;

        const bottleneckCount = projects.filter(p => p.days_in_stage > 14).length;
        const overdueCount = projects.filter(p => p.days_in_stage > 7).length;

        return { avgDaysInStage, bottleneckCount, overdueCount };
    }, [projects]);

    if (projects.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
                <span>Avg. Time:</span>
                <span className="font-medium">{metrics.avgDaysInStage.toFixed(1)}d</span>
            </div>
            {metrics.bottleneckCount > 0 && (
                <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{metrics.bottleneckCount} bottleneck(s)</span>
                </div>
            )}
            {metrics.overdueCount > 0 && (
                <div className="flex items-center space-x-1 text-orange-600">
                    <Timer className="h-3 w-3" />
                    <span>{metrics.overdueCount} overdue</span>
                </div>
            )}
        </div>
    );
}
