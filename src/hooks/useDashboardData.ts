import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardSummary {
  projects: {
    total: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
  };
  recent_projects: Array<{
    id: string;
    project_id: string;
    title: string;
    status: string;
    priority: string;
    project_type?: string;
    created_at: string;
    customer_name?: string;
  }>;
  generated_at: number;
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async (): Promise<DashboardSummary> => {
      const { data, error } = await supabase.rpc('get_dashboard_summary');

      if (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
      }

      return data as unknown as DashboardSummary;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// Lightweight individual hooks for components that need specific data
export function useProjectsCount() {
  const { data } = useDashboardData();
  return {
    total: data?.projects?.total ?? 0,
    byStatus: data?.projects?.by_status ?? {},
    byType: data?.projects?.by_type ?? {},
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