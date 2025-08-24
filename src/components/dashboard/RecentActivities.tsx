import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  CheckCircle,
  Building2,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

export function RecentActivities() {
  const { projects, loading } = useProjects();

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'inquiry': return FileText;
      case 'won': return CheckCircle;
      case 'quoted': return TrendingUp;
      case 'review': return Building2;
      case 'lost': return AlertTriangle;
      default: return FileText;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'inquiry': return "text-blue-500 bg-blue-50 border border-blue-200";
      case 'won': return "text-green-500 bg-green-50 border border-green-200";
      case 'quoted': return "text-purple-500 bg-purple-50 border border-purple-200";
      case 'review': return "text-yellow-500 bg-yellow-50 border border-yellow-200";
      case 'lost': return "text-red-500 bg-red-50 border border-red-200";
      default: return "text-gray-500 bg-gray-50 border border-gray-200";
    }
  };

  const getStatusClassname = (status: string) => {
    switch (status) {
      case 'inquiry': return "bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full text-xs border border-blue-200";
      case 'won': return "bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full text-xs border border-green-200";
      case 'quoted': return "bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded-full text-xs border border-purple-200";
      case 'review': return "bg-yellow-50 text-yellow-700 font-medium px-2 py-0.5 rounded-full text-xs border border-yellow-200";
      case 'lost': return "bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded-full text-xs border border-red-200";
      default: return "bg-gray-50 text-gray-700 font-medium px-2 py-0.5 rounded-full text-xs border border-gray-200";
    }
  };

  // Get recent projects sorted by updated_at
  const recentProjects = projects
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-muted animate-pulse">
                  <div className="h-4 w-4 bg-muted-foreground/20 rounded"></div>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentProjects.map((project) => {
          const IconComponent = getActivityIcon(project.status);
          const iconColor = getActivityColor(project.status);

          return (
            <div key={project.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-foreground">
                    {project.title}
                  </p>
                  <span className={getStatusClassname(project.status)}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        {recentProjects.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent project activities</p>
        )}
      </CardContent>
    </Card>
  );
}