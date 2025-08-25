import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

console.log('🔧 useDashboardData.ts: Hook file loaded');

export interface DashboardSummary {
  projects: {
    total: number;
    by_status: Record<string, number>;
  };
  rfqs: {
    total: number;
    by_status: Record<string, number>;
  };
  recent_projects: Array<{
    id: string;
    project_id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    customer_name?: string;
  }>;
  recent_rfqs: Array<{
    id: string;
    rfq_number: string;
    project_name: string;
    company_name: string;
    status: string;
    priority: string;
    created_at: string;
  }>;
  generated_at: number;
}

export function useDashboardData() {
  console.log('🔧 useDashboardData: Hook called');
  
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
    isLoading: !data
  };
}

export function useRFQsCount() {
  const { data } = useDashboardData();
  return {
    total: data?.rfqs?.total ?? 0,
    byStatus: data?.rfqs?.by_status ?? {},
    isLoading: !data
  };
}

export function useRecentActivity() {
  const { data } = useDashboardData();
  return {
    projects: data?.recent_projects ?? [],
    rfqs: data?.recent_rfqs ?? [],
    isLoading: !data
  };
}