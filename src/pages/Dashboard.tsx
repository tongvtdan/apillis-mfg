import { WorkflowKanban } from "@/components/dashboard/WorkflowKanban";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  AlertTriangle,
  Users
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Active RFQs",
      value: "24",
      change: "+12%",
      changeType: "positive",
      icon: FileText,
      description: "Currently in pipeline"
    },
    {
      title: "Avg. Processing Time",
      value: "8.2 days",
      change: "-15%",
      changeType: "positive", 
      icon: Clock,
      description: "Down from last month"
    },
    {
      title: "Completed This Month",
      value: "18",
      change: "+25%",
      changeType: "positive",
      icon: CheckCircle,
      description: "Successfully delivered"
    },
    {
      title: "Win Rate",
      value: "42%",
      change: "+5%",
      changeType: "positive",
      icon: TrendingUp,
      description: "Quote conversion rate"
    },
    {
      title: "Overdue Items",
      value: "3",
      change: "+2",
      changeType: "negative",
      icon: AlertTriangle,
      description: "Require immediate attention"
    },
    {
      title: "Team Utilization",
      value: "78%",
      change: "+8%",
      changeType: "positive",
      icon: Users,
      description: "Current capacity usage"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="p-6 border-b">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your manufacturing RFQ pipeline and performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>{' '}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Workflow Kanban */}
      <WorkflowKanban />
    </div>
  );
}