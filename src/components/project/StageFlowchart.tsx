import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { PROJECT_STAGES, ProjectStatus, ProjectStage } from "@/types/project";

interface StageFlowchartProps {
  selectedStage: ProjectStatus | null;
  onStageSelect: (stage: ProjectStatus) => void;
  stageCounts: Record<ProjectStatus, number>;
}

export function StageFlowchart({ selectedStage, onStageSelect, stageCounts }: StageFlowchartProps) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-center gap-2 min-w-max">
        {PROJECT_STAGES.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedStage === stage.id 
                  ? 'ring-2 ring-primary shadow-md scale-105' 
                  : 'hover:scale-102'
              }`}
              onClick={() => onStageSelect(stage.id)}
            >
              <CardContent className="p-4 text-center min-w-[140px]">
                <div className="space-y-2">
                  <Badge 
                    className={`${stage.color} text-xs font-medium`}
                    variant="outline"
                  >
                    {stageCounts[stage.id] || 0}
                  </Badge>
                  <div className="text-sm font-medium leading-tight">
                    {stage.name}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {index < PROJECT_STAGES.length - 1 && (
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}