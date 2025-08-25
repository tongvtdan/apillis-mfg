import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { PROJECT_STAGES, ProjectStatus, ProjectStage } from "@/types/project";
import { motion, AnimatePresence } from 'framer-motion';
interface StageFlowchartProps {
  selectedStage: ProjectStatus | null;
  onStageSelect: (stage: ProjectStatus) => void;
  stageCounts: Record<ProjectStatus, number>;
}
export function StageFlowchart({
  selectedStage,
  onStageSelect,
  stageCounts
}: StageFlowchartProps) {
  return <div className="w-full overflow-x-auto pb-4 pt-2 px-2">
    <div className="flex items-center gap-2 min-w-max">
      {PROJECT_STAGES.map((stage, index) => <React.Fragment key={stage.id}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{ y: -2 }}
        >
          <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md w-[160px] max-w-[160px] flex-none ${selectedStage === stage.id ? 'ring-2 ring-primary shadow-md' : ''}`} onClick={() => onStageSelect(stage.id)}>
            <CardContent className="p-4 text-center w-full">
              <div className="space-y-2">
                <motion.div
                  key={`${stage.id}-${stageCounts[stage.id] || 0}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge className={`${stage.color} text-xs font-medium`} variant="outline">
                    {stageCounts[stage.id] || 0}
                  </Badge>
                </motion.div>
                <div className="text-sm font-medium leading-tight">
                  {stage.name}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {index < PROJECT_STAGES.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.15, duration: 0.3 }}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </motion.div>
        )}
      </React.Fragment>)}
    </div>
  </div>;
}