import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface QuickStatsProps {
  activeProjects: number;
  highPriorityProjects: number;
  overdueProjects: number;
}

export function QuickStats({ activeProjects, highPriorityProjects, overdueProjects }: QuickStatsProps) {
  // Get appropriate styling based on count and type
  const getItemClass = (type: string, count: number) => {
    if (type === 'overdue' && count > 0) {
      return 'enhanced-list-item enhanced-list-item-urgent border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/30 dark:to-transparent flex items-center justify-between';
    } else if (type === 'high' && count > 0) {
      return 'enhanced-list-item enhanced-list-item-high border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/40 to-transparent dark:from-orange-950/20 dark:to-transparent flex items-center justify-between';
    } else {
      return 'enhanced-list-item enhanced-list-item-normal flex items-center justify-between';
    }
  };

  // Get text style based on count
  const getTextClass = (type: string, count: number) => {
    if (type === 'overdue' && count > 0) {
      return 'text-sm font-semibold text-red-700 dark:text-red-400';
    } else if (type === 'high' && count > 0) {
      return 'text-sm font-semibold text-orange-700 dark:text-orange-400';
    } else {
      return 'text-sm font-medium';
    }
  };

  // Get icon background style
  const getIconBgClass = (type: string, count: number) => {
    if (type === 'overdue' && count > 0) {
      return 'bg-red-100 dark:bg-red-900/30 p-1 rounded-full';
    } else if (type === 'high' && count > 0) {
      return 'bg-orange-100 dark:bg-orange-900/30 p-1 rounded-full';
    } else {
      return '';
    }
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={getItemClass('active', activeProjects)}>
          <div className="flex items-center gap-2">
            <div className="priority-indicator-low"></div>
            <span className={getTextClass('active', activeProjects)}>Active Projects</span>
          </div>
          <div className="status-badge status-badge-sm status-active">
            {activeProjects}
          </div>
        </div>
        <div className={getItemClass('high', highPriorityProjects)}>
          <div className="flex items-center gap-2">
            <div className={`priority-indicator-high ${getIconBgClass('high', highPriorityProjects)}`}></div>
            <span className={getTextClass('high', highPriorityProjects)}>High Priority</span>
          </div>
          <div className={highPriorityProjects > 0 ? "status-badge status-badge-sm status-high" : "status-badge status-badge-sm"}>
            {highPriorityProjects}
          </div>
        </div>
        <div className={getItemClass('overdue', overdueProjects)}>
          <div className="flex items-center gap-2">
            <div className={`priority-indicator-urgent ${getIconBgClass('overdue', overdueProjects)}`}></div>
            <span className={getTextClass('overdue', overdueProjects)}>Overdue</span>
          </div>
          <div className={overdueProjects > 0 ? "status-badge status-badge-sm status-overdue" : "status-badge status-badge-sm"}>
            {overdueProjects}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}