import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, Project } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

      // First, get all customer organizations
      let orgQuery = supabase
        .from('organizations')
        .select(`
          *,
          contacts:contacts!organization_id(
            id,
            contact_name,
            email,
            phone,
            role,
            is_primary_contact,
            is_active
          )
        `)
        .eq('organization_type', 'customer');

      // Filter by active status based on showArchived parameter
      if (!showArchived) {
        orgQuery = orgQuery.eq('is_active', true);
      }

      const { data: organizations, error: orgError } = await orgQuery.order('name');

      if (orgError) {
        console.error('Error fetching customer organizations:', orgError);
        setError(orgError.message);
        return;
      }

      // Get project summaries for each customer organization
      const customersWithSummaries = await Promise.all(
        (organizations || []).map(async (org) => {
          // Get projects for this customer organization
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select(`
              id,
              status,
              estimated_value,
              actual_value,
              created_at,
              updated_at
            `)
            .eq('customer_organization_id', org.id)
            .eq('organization_id', profile.organization_id);

          if (projectsError) {
            console.error(`Error fetching projects for organization ${org.id}:`, projectsError);
          }

          // Calculate project summary
          const projectSummary: CustomerProjectSummary = {
            total_projects: projects?.length || 0,
            active_projects: projects?.filter(p => p.status === 'active').length || 0,
            completed_projects: projects?.filter(p => p.status === 'completed').length || 0,
            cancelled_projects: projects?.filter(p => p.status === 'cancelled').length || 0,
            on_hold_projects: projects?.filter(p => p.status === 'on_hold').length || 0,
            total_value: projects?.reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0,
            active_value: projects?.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0,
            completed_value: projects?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.actual_value || p.estimated_value || 0), 0) || 0,
            avg_project_value: projects?.length ? projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0) / projects.length : 0,
            latest_project_date: projects?.length ? projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : undefined
          };

          // Find primary contact
          const primaryContact = org.contacts?.find(c => c.is_primary_contact) || org.contacts?.[0];

          return {
            ...org,
            project_summary: projectSummary,
            primary_contact: primaryContact ? {
              id: primaryContact.id,
              contact_name: primaryContact.contact_name,
              email: primaryContact.email,
              phone: primaryContact.phone,
              role: primaryContact.role
            } : undefined
          };
        })
      );

      setCustomers(customersWithSummaries);
    } catch (err) {
      console.error('Error in fetchCustomerOrganizations:', err);
      setError('Failed to fetch customer organizations');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerById = async (id: string): Promise<CustomerOrganizationWithSummary | null> => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          contacts:contacts!organization_id(
            id,
            contact_name,
            email,
            phone,
            role,
            is_primary_contact,
            is_active
          )
        `)
        .eq('id', id)
        .eq('organization_type', 'customer')
        .single();

      if (error) {
        throw error;
      }

      if (!data) return null;

      // Get project summary for this customer
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          status,
          estimated_value,
          actual_value,
          created_at,
          updated_at
        `)
        .eq('customer_organization_id', data.id)
        .eq('organization_id', profile?.organization_id);

      if (projectsError) {
        console.error(`Error fetching projects for organization ${data.id}:`, projectsError);
      }

      const projectSummary: CustomerProjectSummary = {
        total_projects: projects?.length || 0,
        active_projects: projects?.filter(p => p.status === 'active').length || 0,
        completed_projects: projects?.filter(p => p.status === 'completed').length || 0,
        cancelled_projects: projects?.filter(p => p.status === 'cancelled').length || 0,
        on_hold_projects: projects?.filter(p => p.status === 'on_hold').length || 0,
        total_value: projects?.reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0,
        active_value: projects?.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0,
        completed_value: projects?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.actual_value || p.estimated_value || 0), 0) || 0,
        avg_project_value: projects?.length ? projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0) / projects.length : 0,
        latest_project_date: projects?.length ? projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : undefined
      };

      const primaryContact = data.contacts?.find(c => c.is_primary_contact) || data.contacts?.[0];

      return {
        ...data,
        project_summary: projectSummary,
        primary_contact: primaryContact ? {
          id: primaryContact.id,
          contact_name: primaryContact.contact_name,
          email: primaryContact.email,
          phone: primaryContact.phone,
          role: primaryContact.role
        } : undefined
      };
    } catch (err) {
      console.error('Error fetching customer by ID:', err);
      return null;
    }
  };

  const searchCustomers = async (criteria: { name?: string; industry?: string; country?: string }): Promise<CustomerOrganizationWithSummary[]> => {
    try {
      let query = supabase
        .from('organizations')
        .select(`
          *,
          contacts:contacts!organization_id(
            id,
            contact_name,
            email,
            phone,
            role,
            is_primary_contact,
            is_active
          )
        `)
        .eq('organization_type', 'customer');

      if (criteria.name) {
        query = query.ilike('name', `%${criteria.name}%`);
      }
      if (criteria.industry) {
        query = query.ilike('industry', `%${criteria.industry}%`);
      }
      if (criteria.country) {
        query = query.ilike('country', `%${criteria.country}%`);
      }

      const { data: organizations, error } = await query.order('name');

      if (error) {
        throw error;
      }

      // Get project summaries for each organization
      const customersWithSummaries = await Promise.all(
        (organizations || []).map(async (org) => {
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select(`
              id,
              status,
              estimated_value,
              actual_value,
              created_at,
              updated_at
            `)
            .eq('customer_organization_id', org.id)
            .eq('organization_id', profile?.organization_id);

          if (projectsError) {
            console.error(`Error fetching projects for organization ${org.id}:`, projectsError);
          }

          const projectSummary: CustomerProjectSummary = {
            total_projects: projects?.length || 0,
            active_projects: projects?.filter(p => p.status === 'active').length || 0,
            completed_projects: projects?.filter(p => p.status === 'completed').length || 0,
            cancelled_projects: projects?.filter(p => p.status === 'cancelled').length || 0,
            on_hold_projects: projects?.filter(p => p.status === 'on_hold').length || 0,
            total_value: projects?.reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0,
            active_value: projects?.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0,
            completed_value: projects?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.actual_value || p.estimated_value || 0), 0) || 0,
            avg_project_value: projects?.length ? projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0) / projects.length : 0,
            latest_project_date: projects?.length ? projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : undefined
          };

          const primaryContact = org.contacts?.find(c => c.is_primary_contact) || org.contacts?.[0];

          return {
            ...org,
            project_summary: projectSummary,
            primary_contact: primaryContact ? {
              id: primaryContact.id,
              contact_name: primaryContact.contact_name,
              email: primaryContact.email,
              phone: primaryContact.phone,
              role: primaryContact.role
            } : undefined
          };
        })
      );

      return customersWithSummaries;
    } catch (err) {
      console.error('Error searching customers:', err);
      return [];
    }
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id)
        .eq('organization_type', 'customer');

      if (error) {
        throw error;
      }

      setCustomers(prev => prev.filter(customer => customer.id !== id));

      toast({
        title: "Customer Deleted",
        description: "Customer organization has been removed successfully.",
      });
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete customer organization",
      });
      throw err;
    }
  };

  const archiveCustomer = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ is_active: false })
        .eq('id', id)
        .eq('organization_type', 'customer');

      if (error) {
        throw error;
      }

      setCustomers(prev => prev.filter(customer => customer.id !== id));

      toast({
        title: "Customer Archived",
        description: "Customer organization has been archived successfully.",
      });
    } catch (err) {
      console.error('Error archiving customer:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive customer organization",
      });
      throw err;
    }
  };

  const unarchiveCustomer = async (id: string): Promise<CustomerOrganizationWithSummary> => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({ is_active: true })
        .eq('id', id)
        .eq('organization_type', 'customer')
        .select(`
          *,
          contacts:contacts!organization_id(
            id,
            contact_name,
            email,
            phone,
            role,
            is_primary_contact,
            is_active
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      // Get project summary for this customer
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          status,
          estimated_value,
          actual_value,
          created_at,
          updated_at
        `)
        .eq('customer_organization_id', data.id)
        .eq('organization_id', profile?.organization_id);

      if (projectsError) {
        console.error(`Error fetching projects for organization ${data.id}:`, projectsError);
      }

      const projectSummary: CustomerProjectSummary = {
        total_projects: projects?.length || 0,
        active_projects: projects?.filter(p => p.status === 'active').length || 0,
        completed_projects: projects?.filter(p => p.status === 'completed').length || 0,
        cancelled_projects: projects?.filter(p => p.status === 'cancelled').length || 0,
        on_hold_projects: projects?.filter(p => p.status === 'on_hold').length || 0,
        total_value: projects?.reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0,
        active_value: projects?.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0,
        completed_value: projects?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.actual_value || p.estimated_value || 0), 0) || 0,
        avg_project_value: projects?.length ? projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0) / projects.length : 0,
        latest_project_date: projects?.length ? projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : undefined
      };

      const primaryContact = data.contacts?.find(c => c.is_primary_contact) || data.contacts?.[0];

      const unarchivedCustomer: CustomerOrganizationWithSummary = {
        ...data,
        project_summary: projectSummary,
        primary_contact: primaryContact ? {
          id: primaryContact.id,
          contact_name: primaryContact.contact_name,
          email: primaryContact.email,
          phone: primaryContact.phone,
          role: primaryContact.role
        } : undefined
      };

      setCustomers(prev => [unarchivedCustomer, ...prev]);

      toast({
        title: "Customer Reactivated",
        description: "Customer organization has been reactivated successfully.",
      });

      return unarchivedCustomer;
    } catch (err) {
      console.error('Error unarchiving customer:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reactivate customer organization",
      });
      throw err;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchCustomerOrganizations();

    const channel = supabase
      .channel('customer-organizations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations',
          filter: `organization_type=eq.customer`
        },
        (payload) => {
          console.log('Customer organization change received:', payload);
          // Refetch data when organizations change
          fetchCustomerOrganizations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `organization_id=eq.${profile?.organization_id}`
        },
        (payload) => {
          console.log('Project change received, refetching customer summaries:', payload);
          // Refetch data when projects change to update summaries
          fetchCustomerOrganizations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomerOrganizations,
    getCustomerById,
    searchCustomers,
    deleteCustomer,
    archiveCustomer,
    unarchiveCustomer
  };
}