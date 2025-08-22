import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle, 
  Building2, 
  AlertTriangle,
  TrendingUp
} from "lucide-react";

const activities = [
  {
    id: 1,
    title: "New Project received from Acme Corp",
    time: "2 hours ago",
    icon: FileText,
    iconColor: "text-blue-500"
  },
  {
    id: 2,
    title: "PO #1234 delivered successfully",
    time: "4 hours ago",
    icon: CheckCircle,
    iconColor: "text-green-500"
  },
  {
    id: 3,
    title: "Vendor ABC Industries updated profile",
    time: "6 hours ago",
    icon: Building2,
    iconColor: "text-purple-500"
  },
  {
    id: 4,
    title: "Inventory alert: Steel rods below threshold",
    time: "8 hours ago",
    icon: AlertTriangle,
    iconColor: "text-orange-500"
  },
  {
    id: 5,
    title: "Production milestone reached for Project X",
    time: "1 day ago",
    icon: TrendingUp,
    iconColor: "text-green-500"
  }
];

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-full bg-muted ${activity.iconColor}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}