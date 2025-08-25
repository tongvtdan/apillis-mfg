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

  // Get the status badge classes
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'inquiry': return 'status-badge status-badge-sm status-inquiry';
      case 'won': return 'status-badge status-badge-sm status-active';
      case 'quoted': return 'status-badge status-badge-sm status-quote';
      case 'review': return 'status-badge status-badge-sm status-review';
      case 'lost': return 'status-badge status-badge-sm status-overdue';
      default: return 'status-badge status-badge-sm';
    }
  };

  // Get the list item classes with enhanced styling
  const getListItemClass = (status: string) => {
    switch (status) {
      case 'inquiry':
        return 'enhanced-list-item enhanced-list-item-normal border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-950/20 dark:to-transparent';
      case 'won':
        return 'enhanced-list-item enhanced-list-item-active border-l-4 border-l-green-400 bg-gradient-to-r from-green-50/30 to-transparent dark:from-green-950/20 dark:to-transparent';
      case 'quoted':
        return 'enhanced-list-item enhanced-list-item-medium border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50/30 to-transparent dark:from-purple-950/20 dark:to-transparent';
      case 'review':
        return 'enhanced-list-item enhanced-list-item-normal border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-950/20 dark:to-transparent';
      case 'lost':
        return 'enhanced-list-item enhanced-list-item-high border-l-4 border-l-red-400 bg-gradient-to-r from-red-50/30 to-transparent dark:from-red-950/20 dark:to-transparent';
      default:
        return 'enhanced-list-item enhanced-list-item-normal';
    }
  };

  // Get activity icon color with enhanced visibility
  const getIconColorClass = (status: string) => {
    switch (status) {
      case 'inquiry': return 'text-blue-600 dark:text-blue-400';
      case 'won': return 'text-green-600 dark:text-green-400';
      case 'quoted': return 'text-purple-600 dark:text-purple-400';
      case 'review': return 'text-yellow-600 dark:text-yellow-400';
      case 'lost': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get icon background class with enhanced styling
  const getIconBgClass = (status: string) => {
    switch (status) {
      case 'inquiry': return 'bg-blue-100 dark:bg-blue-950/70 shadow-sm';
      case 'won': return 'bg-green-100 dark:bg-green-950/70 shadow-sm';
      case 'quoted': return 'bg-purple-100 dark:bg-purple-950/70 shadow-sm';
      case 'review': return 'bg-yellow-100 dark:bg-yellow-950/70 shadow-sm';
      case 'lost': return 'bg-red-100 dark:bg-red-950/70 shadow-sm';
      default: return 'bg-gray-100 dark:bg-gray-800/80 shadow-sm';
    }
  };

  // Get text styling based on status
  const getTitleClass = (status: string) => {
    switch (status) {
      case 'inquiry': return 'text-sm font-medium text-blue-800 dark:text-blue-300';
      case 'won': return 'text-sm font-medium text-green-800 dark:text-green-300';
      case 'quoted': return 'text-sm font-medium text-purple-800 dark:text-purple-300';
      case 'review': return 'text-sm font-medium text-yellow-800 dark:text-yellow-300';
      case 'lost': return 'text-sm font-medium text-red-800 dark:text-red-300';
      default: return 'text-sm font-medium text-foreground';
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
              <div key={i} className="enhanced-list-item enhanced-list-item-normal flex items-start space-x-3">
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
          const iconColor = getIconColorClass(project.status);
          const iconBg = getIconBgClass(project.status);
          const statusClass = getStatusClass(project.status);
          const listItemClass = getListItemClass(project.status);
          const titleClass = getTitleClass(project.status);

          return (
            <div key={project.id} className={`flex items-start space-x-3 ${listItemClass}`}>
              <div className={`p-2 rounded-full ${iconBg}`}>
                <IconComponent className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className={titleClass}>
                    {project.title}
                  </p>
                  <div className={statusClass}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </div>
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