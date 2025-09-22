import { supabase } from '@/integrations/supabase/client.ts';

export interface ProjectActivityStats {
    project_id: string;
    project_title: string;
    project_number: string;
    total_activities: number;
    recent_activities: number;
    last_activity: string;
    activity_types: Record<string, number>;
}

export interface UserActivityStats {
    user_id: string;
    user_name: string;
    total_activities: number;
    project_count: number;
    activity_types: Record<string, number>;
}

export interface ActivityTrend {
    date: string;
    count: number;
    project_activities?: Record<string, number>;
}

/**
 * Service for activity analytics using the new project_id column
 */
export class ActivityAnalyticsService {
    /**
     * Get activity statistics by project
     */
    async getProjectActivityStats(organizationId: string, limit: number = 20) {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select(`
          project_id,
          action,
          projects!activity_log_project_id_fkey (
            title,
            project_id
          )
        `)
                .eq('organization_id', organizationId)
                .not('project_id', 'is', null)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching project activity stats:', error);
                return [];
            }

            // Group activities by project
            const projectStats: Record<string, ProjectActivityStats> = {};

            data?.forEach(activity => {
                const projectId = activity.project_id;
                if (!projectId) return;

                if (!projectStats[projectId]) {
                    projectStats[projectId] = {
                        project_id: projectId,
                        project_title: activity.projects?.title || 'Unknown Project',
                        project_number: activity.projects?.project_id || 'Unknown',
                        total_activities: 0,
                        recent_activities: 0,
                        last_activity: '',
                        activity_types: {}
                    };
                }

                const stats = projectStats[projectId];
                stats.total_activities += 1;

                // Count activity types
                stats.activity_types[activity.action] = (stats.activity_types[activity.action] || 0) + 1;

                // Track recent activities (last 7 days)
                const activityDate = new Date(activity.created_at);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                if (activityDate >= sevenDaysAgo) {
                    stats.recent_activities += 1;
                }

                // Track last activity
                if (!stats.last_activity || activityDate > new Date(stats.last_activity)) {
                    stats.last_activity = activity.created_at;
                }
            });

            // Convert to array and sort by total activities
            return Object.values(projectStats)
                .sort((a, b) => b.total_activities - a.total_activities)
                .slice(0, limit);
        } catch (error) {
            console.error('Error in getProjectActivityStats:', error);
            return [];
        }
    }

    /**
     * Get activity statistics by user
     */
    async getUserActivityStats(organizationId: string, limit: number = 20) {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select(`
          user_id,
          action,
          users!activity_log_user_id_fkey (
            first_name,
            last_name
          )
        `)
                .eq('organization_id', organizationId)
                .not('user_id', 'is', null)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user activity stats:', error);
                return [];
            }

            // Group activities by user
            const userStats: Record<string, UserActivityStats> = {};

            data?.forEach(activity => {
                const userId = activity.user_id;
                if (!userId) return;

                if (!userStats[userId]) {
                    const user = activity.users as any;
                    userStats[userId] = {
                        user_id: userId,
                        user_name: user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown User',
                        total_activities: 0,
                        project_count: 0,
                        activity_types: {}
                    };
                }

                const stats = userStats[userId];
                stats.total_activities += 1;

                // Count activity types
                stats.activity_types[activity.action] = (stats.activity_types[activity.action] || 0) + 1;
            });

            // Get project count for each user
            const userIds = Object.keys(userStats);
            if (userIds.length > 0) {
                const { data: projectData, error: projectError } = await supabase
                    .from('activity_log')
                    .select('user_id, project_id')
                    .eq('organization_id', organizationId)
                    .not('user_id', 'is', null)
                    .not('project_id', 'is', null)
                    .in('user_id', userIds);

                if (!projectError && projectData) {
                    const userProjects: Record<string, Set<string>> = {};

                    projectData.forEach(activity => {
                        if (!userProjects[activity.user_id]) {
                            userProjects[activity.user_id] = new Set();
                        }
                        userProjects[activity.user_id].add(activity.project_id);
                    });

                    // Update project counts
                    Object.entries(userProjects).forEach(([userId, projects]) => {
                        if (userStats[userId]) {
                            userStats[userId].project_count = projects.size;
                        }
                    });
                }
            }

            // Convert to array and sort by total activities
            return Object.values(userStats)
                .sort((a, b) => b.total_activities - a.total_activities)
                .slice(0, limit);
        } catch (error) {
            console.error('Error in getUserActivityStats:', error);
            return [];
        }
    }

    /**
     * Get activity trends over time
     */
    async getActivityTrends(organizationId: string, days: number = 30) {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select('created_at, action, project_id')
                .eq('organization_id', organizationId)
                .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

            if (error) {
                console.error('Error fetching activity trends:', error);
                return [];
            }

            // Group by date
            const trends: Record<string, ActivityTrend> = {};

            data?.forEach(activity => {
                const date = new Date(activity.created_at).toISOString().split('T')[0];

                if (!trends[date]) {
                    trends[date] = {
                        date,
                        count: 0,
                        project_activities: {}
                    };
                }

                trends[date].count += 1;

                // Track activities by project
                if (activity.project_id) {
                    if (!trends[date].project_activities) {
                        trends[date].project_activities = {};
                    }
                    trends[date].project_activities![activity.project_id] =
                        (trends[date].project_activities![activity.project_id] || 0) + 1;
                }
            });

            // Convert to array and sort by date
            return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
        } catch (error) {
            console.error('Error in getActivityTrends:', error);
            return [];
        }
    }

    /**
     * Get most active projects in the last N days
     */
    async getMostActiveProjects(organizationId: string, days: number = 7, limit: number = 10) {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select(`
          project_id,
          projects!activity_log_project_id_fkey (
            title,
            project_id
          )
        `)
                .eq('organization_id', organizationId)
                .not('project_id', 'is', null)
                .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching most active projects:', error);
                return [];
            }

            // Count activities per project
            const projectActivity: Record<string, ProjectActivityStats> = {};

            data?.forEach(activity => {
                const projectId = activity.project_id;
                if (!projectId) return;

                if (!projectActivity[projectId]) {
                    projectActivity[projectId] = {
                        project_id: projectId,
                        project_title: activity.projects?.title || 'Unknown Project',
                        project_number: activity.projects?.project_id || 'Unknown',
                        total_activities: 0,
                        recent_activities: 0,
                        last_activity: '',
                        activity_types: {}
                    };
                }

                projectActivity[projectId].total_activities += 1;
            });

            // Convert to array and sort by activity count
            return Object.values(projectActivity)
                .sort((a, b) => b.total_activities - a.total_activities)
                .slice(0, limit);
        } catch (error) {
            console.error('Error in getMostActiveProjects:', error);
            return [];
        }
    }
}

// Export singleton instance
export const activityAnalyticsService = new ActivityAnalyticsService();