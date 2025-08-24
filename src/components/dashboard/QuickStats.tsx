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
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Active Projects</span>
          </div>
          <Badge variant="outline" className="font-semibold">{activeProjects}</Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">High Priority</span>
          </div>
          <Badge variant={highPriorityProjects > 0 ? "destructive" : "outline"} className="font-semibold">
            {highPriorityProjects}
          </Badge>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Overdue</span>
          </div>
          <Badge variant={overdueProjects > 0 ? "destructive" : "outline"} className="font-semibold">
            {overdueProjects}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}