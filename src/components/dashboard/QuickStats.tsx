import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface QuickStatsProps {
  activeProjects: number;
  highPriorityProjects: number;
  overdueProjects: number;
}

export function QuickStats({ activeProjects, highPriorityProjects, overdueProjects }: QuickStatsProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="enhanced-list-item enhanced-list-item-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="priority-indicator-low"></div>
            <span className="text-sm font-medium">Active Projects</span>
          </div>
          <div className="status-badge status-badge-sm status-active">
            {activeProjects}
          </div>
        </div>
        <div className="enhanced-list-item enhanced-list-item-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="priority-indicator-high"></div>
            <span className="text-sm font-medium">High Priority</span>
          </div>
          <div className={highPriorityProjects > 0 ? "status-badge status-badge-sm status-high" : "status-badge status-badge-sm"}>
            {highPriorityProjects}
          </div>
        </div>
        <div className="enhanced-list-item enhanced-list-item-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="priority-indicator-urgent"></div>
            <span className="text-sm font-medium">Overdue</span>
          </div>
          <div className={overdueProjects > 0 ? "status-badge status-badge-sm status-overdue" : "status-badge status-badge-sm"}>
            {overdueProjects}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}