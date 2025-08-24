import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  onClick 
}: OverviewCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${borderColor} ${bgColor}`}
      onClick={onClick}
    >
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