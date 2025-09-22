import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client.ts';
import { Organization, Project } from '@/types/project';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

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

export interface CustomerOrganizationWithSummary extends Organization {
    project_summary: CustomerProjectSummary;
    primary_contact?: {
        id: string;
        contact_name?: string;
        email?: string;
        phone?: string;
        role?: string;
    };
}

export function useCustomerOrganizations(showArchived = false) {
    const [customers, setCustomers] = useState<CustomerOrganizationWithSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth();
    const { toast } = useToast();

    const fetchCustomerOrganizations = async () => {
        if (!user || !profile?.organization_id) {
            setCustomers([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch customer organizations with project summaries
            const { data: orgs, error: orgsError } = await supabase
                .from('organizations')
                .select(`
          *,
          contacts:contacts!organization_id(
            id,
            contact_name,
            email,
            phone,
            role,
            is_primary_contact
          )
        `)
                .eq('organization_type', 'customer')
                .eq('is_active', !showArchived);

            if (orgsError) throw orgsError;

            // Calculate project summaries for each customer
            const customersWithSummary = await Promise.all(
                (orgs || []).map(async (org) => {
                    const projectSummary = await calculateProjectSummary(org.id);

                    return {
                        ...org,
                        project_summary: projectSummary,
                        primary_contact: org.contacts?.find((c: any) => c.is_primary_contact) || org.contacts?.[0]
                    } as CustomerOrganizationWithSummary;
                })
            );

            setCustomers(customersWithSummary);
        } catch (err) {
            console.error('Error fetching customer organizations:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch customer organizations');

            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load customer organizations."
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateProjectSummary = async (customerId: string): Promise<CustomerProjectSummary> => {
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
    };

    const getTopCustomers = (limit = 10) => {
        return customers
            .sort((a, b) => b.project_summary.total_value - a.project_summary.total_value)
            .slice(0, limit);
    };

    const getCustomersByActivity = (activeOnly = true) => {
        if (activeOnly) {
            return customers.filter(c => c.project_summary.active_projects > 0);
        }
        return customers;
    };

    useEffect(() => {
        fetchCustomerOrganizations();
    }, [user, profile?.organization_id, showArchived]);

    return {
        customers,
        loading,
        error,
        fetchCustomerOrganizations,
        getTopCustomers,
        getCustomersByActivity,
        refetch: fetchCustomerOrganizations
    };
}
