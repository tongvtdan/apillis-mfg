import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentActivity } from '@/hooks/useDashboardData';
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  CheckCircle,
  Building2,
  AlertTriangle,
  TrendingUp,
  Send,
  Package,
  Cog
} from "lucide-react";

export function RecentActivities() {
  const { projects, rfqs, isLoading } = useRecentActivity();

  // Combine and sort recent activities
  const allActivities = [
    ...projects.map(project => ({
      id: `project-${project.id}`,
      type: 'project' as const,
      title: project.title,
      subtitle: `Project ${project.project_id}`,
      timestamp: project.created_at,
      status: project.status,
      customer: project.customer_name
    })),
    ...rfqs.map(rfq => ({
      id: `rfq-${rfq.id}`,
      type: 'rfq' as const,
      title: rfq.project_name,
      subtitle: `RFQ ${rfq.rfq_number}`,
      timestamp: rfq.created_at,
      status: rfq.status,
      customer: rfq.company_name
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'inquiry_received': return FileText;
      case 'order_confirmed': return CheckCircle;
      case 'quoted': return TrendingUp;
      case 'technical_review': return Building2;
      case 'supplier_rfq_sent': return Send;
      case 'procurement_planning': return Package;
      case 'in_production': return Cog;
      case 'shipped_closed': return AlertTriangle;
      default: return FileText;
    }
  };

  // Get the status badge classes
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'inquiry_received': return 'status-badge status-badge-sm status-inquiry';
      case 'order_confirmed': return 'status-badge status-badge-sm status-active';
      case 'quoted': return 'status-badge status-badge-sm status-quote';
      case 'technical_review': return 'status-badge status-badge-sm status-review';
      case 'supplier_rfq_sent': return 'status-badge status-badge-sm status-active';
      case 'procurement_planning': return 'status-badge status-badge-sm status-review';
      case 'in_production': return 'status-badge status-badge-sm status-active';
      case 'shipped_closed': return 'status-badge status-badge-sm status-overdue';
      default: return 'status-badge status-badge-sm';
    }
  };

  // Get the list item classes with enhanced styling
  const getListItemClass = (status: string) => {
    switch (status) {
      case 'inquiry_received':
        return 'enhanced-list-item enhanced-list-item-normal border-l-4 border-l-blue-400 bg-blue-50/10 dark:bg-blue-950/10';
      case 'order_confirmed':
        return 'enhanced-list-item enhanced-list-item-active border-l-4 border-l-green-400 bg-green-50/10 dark:bg-green-950/10';
      case 'quoted':
        return 'enhanced-list-item enhanced-list-item-medium border-l-4 border-l-purple-400 bg-purple-50/10 dark:bg-purple-950/10';
      case 'technical_review':
        return 'enhanced-list-item enhanced-list-item-normal border-l-4 border-l-yellow-400 bg-yellow-50/10 dark:bg-yellow-950/10';
      case 'supplier_rfq_sent':
        return 'enhanced-list-item enhanced-list-item-normal border-l-4 border-l-indigo-400 bg-indigo-50/10 dark:bg-indigo-950/10';
      case 'procurement_planning':
        return 'enhanced-list-item enhanced-list-item-normal border-l-4 border-l-yellow-400 bg-yellow-50/10 dark:bg-yellow-950/10';
      case 'in_production':
        return 'enhanced-list-item enhanced-list-item-active border-l-4 border-l-teal-400 bg-teal-50/10 dark:bg-teal-950/10';
      case 'shipped_closed':
        return 'enhanced-list-item enhanced-list-item-high border-l-4 border-l-red-400 bg-red-50/10 dark:bg-red-950/10';
      default:
        return 'enhanced-list-item enhanced-list-item-normal';
    }
  };

  // Get activity icon color with enhanced visibility
  const getIconColorClass = (status: string) => {
    switch (status) {
      case 'inquiry_received': return 'text-blue-600 dark:text-blue-400';
      case 'order_confirmed': return 'text-green-600 dark:text-green-400';
      case 'quoted': return 'text-purple-600 dark:text-purple-400';
      case 'technical_review': return 'text-yellow-600 dark:text-yellow-400';
      case 'supplier_rfq_sent': return 'text-indigo-600 dark:text-indigo-400';
      case 'procurement_planning': return 'text-yellow-600 dark:text-yellow-400';
      case 'in_production': return 'text-teal-600 dark:text-teal-400';
      case 'shipped_closed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get icon background class with enhanced styling
  const getIconBgClass = (status: string) => {
    switch (status) {
      case 'inquiry_received': return 'bg-blue-100 dark:bg-blue-950/70 shadow-sm';
      case 'order_confirmed': return 'bg-green-100 dark:bg-green-950/70 shadow-sm';
      case 'quoted': return 'bg-purple-100 dark:bg-purple-950/70 shadow-sm';
      case 'technical_review': return 'bg-yellow-100 dark:bg-yellow-950/70 shadow-sm';
      case 'supplier_rfq_sent': return 'bg-indigo-100 dark:bg-indigo-950/70 shadow-sm';
      case 'procurement_planning': return 'bg-yellow-100 dark:bg-yellow-950/70 shadow-sm';
      case 'in_production': return 'bg-teal-100 dark:bg-teal-950/70 shadow-sm';
      case 'shipped_closed': return 'bg-red-100 dark:bg-red-950/70 shadow-sm';
      default: return 'bg-gray-100 dark:bg-gray-800/80 shadow-sm';
    }
  };

  // Get text styling based on status
  const getTitleClass = (status: string) => {
    switch (status) {
      case 'inquiry_received': return 'text-sm font-medium text-blue-800 dark:text-blue-300';
      case 'order_confirmed': return 'text-sm font-medium text-green-800 dark:text-green-300';
      case 'quoted': return 'text-sm font-medium text-purple-800 dark:text-purple-300';
      case 'technical_review': return 'text-sm font-medium text-yellow-800 dark:text-yellow-300';
      case 'supplier_rfq_sent': return 'text-sm font-medium text-indigo-800 dark:text-indigo-300';
      case 'procurement_planning': return 'text-sm font-medium text-yellow-800 dark:text-yellow-300';
      case 'in_production': return 'text-sm font-medium text-teal-800 dark:text-teal-300';
      case 'shipped_closed': return 'text-sm font-medium text-red-800 dark:text-red-300';
      default: return 'text-sm font-medium text-foreground';
    }
  };

  // Get recent activities from the combined list
  const recentActivities = allActivities.slice(0, 5);

  if (isLoading) {
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
        {recentActivities.map((activity) => {
          const IconComponent = getActivityIcon(activity.status);
          const iconColor = getIconColorClass(activity.status);
          const iconBg = getIconBgClass(activity.status);
          const statusClass = getStatusClass(activity.status);
          const listItemClass = getListItemClass(activity.status);
          const titleClass = getTitleClass(activity.status);

          return (
            <div key={activity.id} className={`flex items-start space-x-3 ${listItemClass}`}>
              <div className={`p-2 rounded-full ${iconBg}`}>
                <IconComponent className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className={titleClass}>
                    {activity.title}
                  </p>
                  <div className={statusClass}>
                    {activity.status.replace('_', ' ').charAt(0).toUpperCase() + activity.status.replace('_', ' ').slice(1)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        {recentActivities.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent activities</p>
        )}
      </CardContent>
    </Card>
  );
}