import { WorkflowKanban } from "@/components/dashboard/WorkflowKanban";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { PendingTasks } from "@/components/dashboard/PendingTasks";
import { MonthlyProgress } from "@/components/dashboard/MonthlyProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjects";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  AlertTriangle,
  Users
} from "lucide-react";

export default function Dashboard() {
  const { projects, loading } = useProjects();

  // Calculate real stats from projects data
  const activeProjects = projects.filter(p => 
    ['inquiry', 'review', 'quoted'].includes(p.status)
  ).length;
  
  const wonProjects = projects.filter(p => p.status === 'won').length;
  const lostProjects = projects.filter(p => p.status === 'lost').length;
  const highPriorityProjects = projects.filter(p => p.priority === 'high').length;

  const stats = [
    {
      title: "Active Projects",
      value: loading ? "..." : activeProjects.toString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: FileText,
      description: "currently in pipeline"
    },
    {
      title: "Won Projects",
      value: loading ? "..." : wonProjects.toString(),
      change: "+8%",
      changeType: "positive" as const, 
      icon: CheckCircle,
      description: "successfully closed"
    },
    {
      title: "High Priority",
      value: loading ? "..." : highPriorityProjects.toString(),
      change: "-5%",
      changeType: "negative" as const,
      icon: AlertTriangle,
      description: "requiring attention"
    },
    {
      title: "Total Projects",
      value: loading ? "..." : projects.length.toString(),
      change: "+15%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "all time"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your procurement operations.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities - Full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
        
        {/* Pending Tasks - Full width on mobile, 1/3 on desktop */}
        <div className="lg:col-span-1">
          <PendingTasks />
        </div>
      </div>

      {/* Monthly Progress and Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MonthlyProgress />
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Workflow</CardTitle>
              <CardDescription>Drag and drop projects between stages</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowKanban />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}