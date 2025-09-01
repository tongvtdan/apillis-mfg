import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface DashboardProject {
  id: string;
  project_id: string;
  title: string;
  status: string;
  priority_level: string;
  project_type?: string;
  created_at: string;
  customer_name?: string;
  estimated_delivery_date?: string;
  days_in_stage?: number;
  current_stage?: string;
}

export interface DashboardSummary {
  projects: {
    total: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
  };
  recent_projects: DashboardProject[];
  generated_at: number;
  debug?: any; // Add debug info field
}

export function useDashboardData() {
  const { user, profile } = useAuth();

  // Create query with debug info
  const query = useQuery({
    queryKey: ['dashboard-summary', user?.id, profile?.organization_id],
    queryFn: async (): Promise<DashboardSummary> => {
      console.log('Fetching dashboard summary with auth context:', { user, profile });

      // Log auth state before making the call
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session ? {
        user_id: session.user.id,
        expires_at: session.expires_at,
        has_token: !!session.access_token,
      } : 'No session');

      const { data, error } = await supabase.rpc('get_dashboard_summary');

      if (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
      }

      console.log('Dashboard summary result:', data);
      return data as unknown as DashboardSummary;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!user, // Only run query if user is authenticated
  });

  // Debug logging when data changes
  useEffect(() => {
    if (query.data) {
      console.log('Dashboard data updated:', {
        projectsTotal: query.data.projects.total,
        recentProjectsCount: query.data.recent_projects.length,
        debug: query.data.debug
      });
    }
  }, [query.data]);

  return query;
}

// Lightweight individual hooks for components that need specific data
export function useProjectsCount() {
  const { data } = useDashboardData();
  return {
    total: data?.projects?.total ?? 0,
    byStatus: data?.projects?.by_status ?? {},
    byType: data?.projects?.by_type ?? {},
    byPriority: data?.projects?.by_priority ?? {},
    isLoading: !data
  };
}

export function useRecentActivity() {
  const { data, isLoading } = useDashboardData();
  return {
    projects: data?.recent_projects ?? [],
    isLoading,
  };
}