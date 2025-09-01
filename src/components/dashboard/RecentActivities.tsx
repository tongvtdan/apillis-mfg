import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  CheckCircle,
  Building2,
  AlertTriangle,
  TrendingUp,
  Send,
  Package,
  Cog,
  User,
  Plus,
  Edit3,
  Trash2
} from "lucide-react";
import { useEffect } from "react";

interface Activity {
  id: string;
  type: 'project' | 'user' | 'contact' | 'document' | 'review';
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  customer_name?: string;
  project_id?: string;
  action: string;
  entity_type: string;
}

export function RecentActivities() {
  const { activities, loading, error } = useActivityLogs(10);
  const navigate = useNavigate();

  // Map activities to a more user-friendly format
  const mappedActivities = activities
    .map(activity => {
      try {
        let type: 'project' | 'user' | 'contact' | 'document' | 'review' = 'project';
        let title = '';
        let description = '';
        let status = '';
        let priority = 'medium';
        let projectId: string | undefined;

        // Process the activity

        // Determine activity type and details based on entity_type
        switch (activity.entity_type) {
          case 'projects':
            type = 'project';
            // Try to get title from new_values first, then old_values
            title = activity.new_values?.title || activity.old_values?.title || 'Untitled Project';
            description = `${activity.action === 'INSERT' ? 'Created' : activity.action === 'UPDATE' ? 'Updated' : activity.action} project`;
            status = activity.new_values?.status || activity.old_values?.status || 'active';
            priority = activity.new_values?.priority_level || activity.old_values?.priority_level || 'medium';
            projectId = activity.entity_id;
            break;
          case 'contacts':
            type = 'contact';
            // Try to get company name from new_values first, then old_values
            title = activity.new_values?.company_name || activity.old_values?.company_name || 'Untitled Contact';
            description = `${activity.action === 'INSERT' ? 'Created' : activity.action === 'UPDATE' ? 'Updated' : activity.action} contact`;
            break;
          default:
            // Handle unknown entity types
            type = 'project';
            title = activity.description || activity.entity_type || 'Activity';
            description = activity.action || 'Unknown action';
          // Handle unknown entity types
        }

        // If we still don't have a title, use a fallback
        if (!title) {
          title = 'Untitled ' + (activity.entity_type?.slice(0, -1) || 'item'); // Remove 's' from entity_type
        }

        // Ensure we have a valid created_at - handle different date formats
        let createdAt: string;
        if (activity.created_at) {
          // Handle PostgreSQL timestamp format like '2025-08-31 02:42:12.83972+00'
          if (typeof activity.created_at === 'string' && activity.created_at.includes(' ')) {
            // Convert PostgreSQL format to ISO format
            // '2025-08-31 02:42:12.83972+00' -> '2025-08-31T02:42:12.83972Z'
            createdAt = activity.created_at.replace(' ', 'T').replace('+00', 'Z');
          } else {
            createdAt = activity.created_at;
          }
        } else {
          createdAt = new Date().toISOString();
        }

        // Map the activity data

        return {
          id: activity.id,
          type,
          title,
          description,
          status,
          priority,
          created_at: createdAt,
          project_id: projectId,
          action: activity.action,
          entity_type: activity.entity_type
        };
      } catch (error) {
        // Handle mapping errors
        // Return a fallback activity object
        return {
          id: activity.id,
          type: 'project',
          title: 'Activity Error',
          description: 'Failed to process activity',
          status: 'active',
          priority: 'medium',
          created_at: new Date().toISOString(),
          project_id: undefined,
          action: 'ERROR',
          entity_type: 'error'
        };
      }
    })
    .filter(activity => activity.title && activity.description); // Filter out activities with missing data

  const getActivityIcon = (entityType: string, action: string) => {
    // Special handling for action types
    if (action === 'INSERT') return Plus;
    if (action === 'UPDATE') return Edit3;
    if (action === 'DELETE') return Trash2;

    // Default icons based on entity type
    switch (entityType) {
      case 'projects': return FileText;
      case 'users': return User;
      case 'contacts': return Building2;
      case 'documents': return FileText;
      case 'reviews': return CheckCircle;
      default: return FileText;
    }
  };

  const getIconColorClass = (entityType: string) => {
    switch (entityType) {
      case 'projects': return 'text-blue-500';
      case 'users': return 'text-green-500';
      case 'contacts': return 'text-purple-500';
      case 'documents': return 'text-yellow-500';
      case 'reviews': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  const getIconBgClass = (entityType: string) => {
    switch (entityType) {
      case 'projects': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'users': return 'bg-green-100 dark:bg-green-900/30';
      case 'contacts': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'documents': return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'reviews': return 'bg-indigo-100 dark:bg-indigo-900/30';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.project_id) {
      navigate(`/projects/${activity.project_id}`);
    }
  };

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

  // Show error if there is one
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Error loading activities: {error}
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
        {mappedActivities.map((activity) => {
          const IconComponent = getActivityIcon(activity.entity_type, activity.action);
          const iconColor = getIconColorClass(activity.entity_type);
          const iconBg = getIconBgClass(activity.entity_type);

          return (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleActivityClick(activity as any)}
            >
              <div className={`p-2 rounded-full ${iconBg}`}>
                <IconComponent className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.description} • {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        {mappedActivities.length === 0 && (
          <div className="text-center py-4">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
