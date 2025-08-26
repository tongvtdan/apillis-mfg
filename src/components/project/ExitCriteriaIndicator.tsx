import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { WorkflowValidator } from "@/lib/workflow-validator";

interface ExitCriteriaIndicatorProps {
    project: Project;
}

export function ExitCriteriaIndicator({ project }: ExitCriteriaIndicatorProps) {
    const stageProgress = WorkflowValidator.getStageProgress(project);
    const exitCriteria = stageProgress.exitCriteria;

    if (exitCriteria.length === 0) return null;

    return (
        <div className="mb-2 p-3 bg-muted/30 rounded-lg border border-muted-foreground/20">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                    Stage Requirements
                </span>
                <Badge
                    variant={stageProgress.canAdvance ? "default" : "secondary"}
                    className="text-xs"
                >
                    {stageProgress.canAdvance ? "Ready" : "Pending"}
                </Badge>
            </div>

            <div className="space-y-1.5">
                {exitCriteria.map((criteria, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        <span className="text-muted-foreground leading-tight">
                            {criteria}
                        </span>
                    </div>
                ))}
            </div>

            {!stageProgress.canAdvance && (
                <div className="mt-2 text-xs text-muted-foreground/70 italic">
                    Complete requirements to advance
                </div>
            )}
        </div>
    );
}
