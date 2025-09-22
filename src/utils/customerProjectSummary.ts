import { supabase } from '@/integrations/supabase/client';

export interface CustomerProjectSummary {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    cancelled_projects: number;
    on_hold_projects: number;
    total_value: number;
    active_value: number;
    completed_value: number;
    avg_project_value: number;
    latest_project_date?: string;
}

export async function calculateProjectSummary(customerId: string): Promise<CustomerProjectSummary> {
    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('status, estimated_value, created_at')
            .eq('customer_organization_id', customerId);

        if (error) throw error;

        const totalProjects = projects?.length || 0;
        const activeProjects = projects?.filter(p => p.status === 'active' || p.status === 'inquiry').length || 0;
        const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
        const cancelledProjects = projects?.filter(p => p.status === 'cancelled').length || 0;
        const onHoldProjects = projects?.filter(p => p.status === 'on_hold').length || 0;

        const totalValue = projects?.reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0;
        const activeValue = projects?.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0;
        const completedValue = projects?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0;
        const avgProjectValue = totalProjects > 0 ? totalValue / totalProjects : 0;

        const latestProjectDate = projects?.length > 0
            ? projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : undefined;

        return {
            total_projects: totalProjects,
            active_projects: activeProjects,
            completed_projects: completedProjects,
            cancelled_projects: cancelledProjects,
            on_hold_projects: onHoldProjects,
            total_value: totalValue,
            active_value: activeValue,
            completed_value: completedValue,
            avg_project_value: avgProjectValue,
            latest_project_date: latestProjectDate
        };
    } catch (error) {
        console.error('Error calculating project summary:', error);
        return {
            total_projects: 0,
            active_projects: 0,
            completed_projects: 0,
            cancelled_projects: 0,
            on_hold_projects: 0,
            total_value: 0,
            active_value: 0,
            completed_value: 0,
            avg_project_value: 0
        };
    }
}
