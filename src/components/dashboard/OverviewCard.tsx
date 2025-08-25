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
  // Determine priority class based on alert and description content
  const getPriorityClass = (alert: string | null | undefined, description: string) => {
    // Priority level escalation:
    // 1. Has alert with 'overdue' - highest priority (critical)
    // 2. Has alert with 'urgent' or 'critical' - very high priority
    // 3. Has alert with 'on hold' - high priority
    // 4. Description contains 'urgent' or 'critical' - medium-high priority
    // 5. Description contains 'high priority' - medium priority 
    // 6. Normal priority (default)

    if (alert) {
      if (alert.includes('overdue')) {
        return 'border-2 border-red-500 bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/40 dark:to-transparent shadow-md';
      } else if (alert.includes('urgent') || alert.includes('critical')) {
        return 'border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/40 dark:to-transparent shadow-md';
      } else if (alert.includes('on hold')) {
        return 'border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/40 dark:to-transparent shadow-md';
      }
      return 'border-2 border-destructive/40 bg-gradient-to-r from-destructive/5 to-transparent shadow-md';
    }

    if (description.includes('urgent') || description.includes('critical')) {
      return 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20 dark:to-transparent';
    } else if (description.includes('high priority')) {
      return 'border-l-4 border-l-red-400 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20 dark:to-transparent';
    } else if (description.includes('low stock')) {
      return 'border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-950/20 dark:to-transparent';
    }

    return '';
  };

  // Style icon container based on priority
  const getIconClass = (alert: string | null | undefined, description: string) => {
    if (alert) {
      if (alert.includes('overdue')) {
        return 'bg-red-100 dark:bg-red-900/30';
      } else if (alert.includes('urgent') || alert.includes('critical')) {
        return 'bg-orange-100 dark:bg-orange-900/30';
      } else if (alert.includes('on hold')) {
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      }
      return 'bg-destructive/10 dark:bg-destructive/20';
    }

    if (description.includes('urgent') || description.includes('critical')) {
      return 'bg-orange-100 dark:bg-orange-900/20';
    } else if (description.includes('high priority')) {
      return 'bg-red-100 dark:bg-red-900/20';
    } else if (description.includes('low stock')) {
      return 'bg-yellow-100 dark:bg-yellow-900/20';
    }

    return 'bg-muted/50 dark:bg-muted/20';
  };

  // Style description text based on priority
  const getDescriptionClass = (alert: string | null | undefined, description: string) => {
    if (alert) {
      if (alert.includes('overdue') || alert.includes('urgent') || alert.includes('critical')) {
        return 'text-destructive font-medium';
      } else if (alert.includes('on hold')) {
        return 'text-yellow-700 dark:text-yellow-400 font-medium';
      }
      return 'text-destructive/80 font-medium';
    }

    if (description.includes('urgent') || description.includes('critical')) {
      return 'text-orange-700 dark:text-orange-400 font-medium';
    } else if (description.includes('high priority')) {
      return 'text-red-700 dark:text-red-400 font-medium';
    } else if (description.includes('low stock')) {
      return 'text-yellow-700 dark:text-yellow-400 font-medium';
    }

    return 'text-muted-foreground';
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${borderColor} ${bgColor} relative ${getPriorityClass(alert, description)}`}
      onClick={onClick}
    >
      {alert && (
        <div className="absolute -top-4 -right-3 z-20">
          <div className={`status-alert text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 
            shadow-lg border-2 backdrop-blur-sm transition-all duration-200
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
              <div className={`rounded-full p-1.5 ${getIconClass(alert, description)}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${alert ? 'text-foreground' : 'text-foreground'}`}>{count}</p>
              <p className={`text-sm ${getDescriptionClass(alert, description)}`}>{description}</p>
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