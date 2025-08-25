import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface OverviewCardProps {
  title: string;
  count: number;
  activeCount: number;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
  bgColor: string;
  borderColor: string;
  alert?: string | null;
  onClick: () => void;
}

export function OverviewCard({
  title,
  count,
  activeCount,
  description,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  alert,
  onClick
}: OverviewCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${borderColor} ${bgColor} relative`}
      onClick={onClick}
    >
      {alert && (
        <div className="absolute -top-4 -right-3 z-20">
          <div className={`status-alert text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 
            shadow-lg border-2 backdrop-blur-sm animate-pulse transform hover:scale-110 transition-all duration-200
            ${alert.includes('overdue') ? 'bg-red-500/90 text-white border-red-300 shadow-red-500/30' :
              alert.includes('on hold') ? 'bg-yellow-500/90 text-white border-yellow-300 shadow-yellow-500/30' :
                alert.includes('urgent') ? 'bg-orange-500/90 text-white border-orange-300 shadow-orange-500/30' :
                  alert.includes('critical') ? 'bg-red-600/90 text-white border-red-400 shadow-red-600/30' :
                    'bg-destructive/90 text-destructive-foreground border-destructive/50 shadow-destructive/30'}`}>
            <AlertTriangle className="h-4 w-4 drop-shadow-sm" />
            <span className="drop-shadow-sm">{alert}</span>
          </div>
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-5 w-5 ${color}`} />
              <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className={`text-right ${color}`}>
            <Badge variant="outline" className={`${color} ${borderColor}`}>
              {activeCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}