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
        <div className="absolute -top-3 -right-2 z-10">
          <div className={`status-alert text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse
            ${alert.includes('overdue') ? 'overdue-alert' :
              alert.includes('on hold') ? 'onhold-alert' :
                alert.includes('urgent') ? 'urgent-alert' :
                  alert.includes('critical') ? 'critical-alert' :
                    'bg-destructive text-destructive-foreground'}`}>
            <AlertTriangle className="h-4 w-4" />
            {alert}
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