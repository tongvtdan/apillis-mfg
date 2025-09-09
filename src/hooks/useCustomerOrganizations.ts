import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, Project } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Helper function to safely access project data
const safeProjectData = (projects: any[] | null | undefined) => {
  if (!projects || !Array.isArray(projects)) return [];
  return projects.filter(p => p && typeof p === 'object' && 'id' in p);
};

// Helper function to safely access organization data
const safeOrgData = (org: any) => {
  if (!org || typeof org !== 'object' || !('id' in org)) return null;
  return org;
};

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
        .eq('organization_type', 'customer' as any);

      // Filter by active status based on showArchived parameter
      if (!showArchived) {
        orgQuery = orgQuery.eq('is_active', true as any);
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
          const safeOrg = safeOrgData(org);
          if (!safeOrg) return null;

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
            .eq('customer_organization_id', safeOrg.id as any)
            .eq('organization_id', profile.organization_id as any);

          if (projectsError) {
            console.error(`Error fetching projects for organization ${safeOrg.id}:`, projectsError);
          }

          const projectsData = safeProjectData(projects);

          // Calculate project summary
          const projectSummary: CustomerProjectSummary = {
            total_projects: projectsData.length,
            active_projects: projectsData.filter(p => p?.status === 'active').length,
            completed_projects: projectsData.filter(p => p?.status === 'completed').length,
            cancelled_projects: projectsData.filter(p => p?.status === 'cancelled').length,
            on_hold_projects: projectsData.filter(p => p?.status === 'on_hold').length,
            total_value: projectsData.reduce((sum, p) => sum + (p?.estimated_value || 0), 0),
            active_value: projectsData.filter(p => p?.status === 'active').reduce((sum, p) => sum + (p?.estimated_value || 0), 0),
            completed_value: projectsData.filter(p => p?.status === 'completed').reduce((sum, p) => sum + (p?.actual_value || p?.estimated_value || 0), 0),
            avg_project_value: projectsData.length ? projectsData.reduce((sum, p) => sum + (p?.estimated_value || 0), 0) / projectsData.length : 0,
            latest_project_date: projectsData.length ? projectsData.sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())[0]?.created_at : undefined
          };

          // Find primary contact
          const primaryContact = safeOrg.contacts?.find(c => c?.is_primary_contact) || safeOrg.contacts?.[0];

          return {
            ...safeOrg,
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

      // Filter out null values
      const validCustomers = customersWithSummaries.filter(customer => customer !== null) as CustomerOrganizationWithSummary[];

      setCustomers(validCustomers);
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
        .eq('id', id as any)
        .eq('organization_type', 'customer' as any)
        .single();

      if (error) {
        throw error;
      }

      const safeData = safeOrgData(data);
      if (!safeData) return null;

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
        .eq('customer_organization_id', safeData.id as any)
        .eq('organization_id', profile?.organization_id as any);

      if (projectsError) {
        console.error(`Error fetching projects for organization ${safeData.id}:`, projectsError);
      }

      const projectsData = safeProjectData(projects);

      const projectSummary: CustomerProjectSummary = {
        total_projects: projectsData.length,
        active_projects: projectsData.filter(p => p?.status === 'active').length,
        completed_projects: projectsData.filter(p => p?.status === 'completed').length,
        cancelled_projects: projectsData.filter(p => p?.status === 'cancelled').length,
        on_hold_projects: projectsData.filter(p => p?.status === 'on_hold').length,
        total_value: projectsData.reduce((sum, p) => sum + (p?.estimated_value || 0), 0),
        active_value: projectsData.filter(p => p?.status === 'active').reduce((sum, p) => sum + (p?.estimated_value || 0), 0),
        completed_value: projectsData.filter(p => p?.status === 'completed').reduce((sum, p) => sum + (p?.actual_value || p?.estimated_value || 0), 0),
        avg_project_value: projectsData.length ? projectsData.reduce((sum, p) => sum + (p?.estimated_value || 0), 0) / projectsData.length : 0,
        latest_project_date: projectsData.length ? projectsData.sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())[0]?.created_at : undefined
      };

      const primaryContact = safeData.contacts?.find(c => c?.is_primary_contact) || safeData.contacts?.[0];

      return {
        ...safeData,
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
        .eq('organization_type', 'customer' as any);

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
          const safeOrg = safeOrgData(org);
          if (!safeOrg) return null;

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
            .eq('customer_organization_id', safeOrg.id as any)
            .eq('organization_id', profile?.organization_id as any);

          if (projectsError) {
            console.error(`Error fetching projects for organization ${safeOrg.id}:`, projectsError);
          }

          const projectsData = safeProjectData(projects);

          const projectSummary: CustomerProjectSummary = {
            total_projects: projectsData.length,
            active_projects: projectsData.filter(p => p?.status === 'active').length,
            completed_projects: projectsData.filter(p => p?.status === 'completed').length,
            cancelled_projects: projectsData.filter(p => p?.status === 'cancelled').length,
            on_hold_projects: projectsData.filter(p => p?.status === 'on_hold').length,
            total_value: projectsData.reduce((sum, p) => sum + (p?.estimated_value || 0), 0),
            active_value: projectsData.filter(p => p?.status === 'active').reduce((sum, p) => sum + (p?.estimated_value || 0), 0),
            completed_value: projectsData.filter(p => p?.status === 'completed').reduce((sum, p) => sum + (p?.actual_value || p?.estimated_value || 0), 0),
            avg_project_value: projectsData.length ? projectsData.reduce((sum, p) => sum + (p?.estimated_value || 0), 0) / projectsData.length : 0,
            latest_project_date: projectsData.length ? projectsData.sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())[0]?.created_at : undefined
          };

          const primaryContact = safeOrg.contacts?.find(c => c?.is_primary_contact) || safeOrg.contacts?.[0];

          return {
            ...safeOrg,
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

      // Filter out null values
      return customersWithSummaries.filter(customer => customer !== null) as CustomerOrganizationWithSummary[];
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
        .eq('id', id as any)
        .eq('organization_type', 'customer' as any);

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
        .update({ is_active: false } as any)
        .eq('id', id as any)
        .eq('organization_type', 'customer' as any);

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
        .update({ is_active: true } as any)
        .eq('id', id as any)
        .eq('organization_type', 'customer' as any)
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

      const safeData = safeOrgData(data);
      if (!safeData) {
        throw new Error('No valid data returned from unarchive operation');
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
        .eq('customer_organization_id', safeData.id as any)
        .eq('organization_id', profile?.organization_id as any);

      if (projectsError) {
        console.error(`Error fetching projects for organization ${safeData.id}:`, projectsError);
      }

      const projectsData = safeProjectData(projects);

      const projectSummary: CustomerProjectSummary = {
        total_projects: projectsData.length,
        active_projects: projectsData.filter(p => p?.status === 'active').length,
        completed_projects: projectsData.filter(p => p?.status === 'completed').length,
        cancelled_projects: projectsData.filter(p => p?.status === 'cancelled').length,
        on_hold_projects: projectsData.filter(p => p?.status === 'on_hold').length,
        total_value: projectsData.reduce((sum, p) => sum + (p?.estimated_value || 0), 0),
        active_value: projectsData.filter(p => p?.status === 'active').reduce((sum, p) => sum + (p?.estimated_value || 0), 0),
        completed_value: projectsData.filter(p => p?.status === 'completed').reduce((sum, p) => sum + (p?.actual_value || p?.estimated_value || 0), 0),
        avg_project_value: projectsData.length ? projectsData.reduce((sum, p) => sum + (p?.estimated_value || 0), 0) / projectsData.length : 0,
        latest_project_date: projectsData.length ? projectsData.sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())[0]?.created_at : undefined
      };

      const primaryContact = safeData.contacts?.find(c => c?.is_primary_contact) || safeData.contacts?.[0];

      const unarchivedCustomer: CustomerOrganizationWithSummary = {
        ...safeData,
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

  const createOrganization = async (organizationData: Partial<Organization>, contactData?: Partial<any>): Promise<CustomerOrganizationWithSummary> => {
    try {
      // Create the organization first
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          ...organizationData,
          organization_type: 'customer' as any,
          is_active: true as any,
          created_by: user?.id
        } as any)
        .select()
        .single();

      if (orgError) {
        throw orgError;
      }

      const safeNewOrg = safeOrgData(newOrg);
      if (!safeNewOrg) {
        throw new Error('No valid organization data returned');
      }

      // If contact data is provided, create the primary contact
      if (contactData && safeNewOrg) {
        const { error: contactError } = await supabase
          .from('contacts')
          .insert({
            organization_id: safeNewOrg.id,
            contact_name: contactData.contact_name,
            email: contactData.email,
            phone: contactData.phone,
            company_name: contactData.company_name, // Add company name to contact
            role: contactData.role || 'general',
            is_primary_contact: true,
            is_active: true,
            type: 'customer',
            created_by: user?.id
          } as any);

        if (contactError) {
          console.error('Error creating contact:', contactError);
          // Don't throw here as the organization was created successfully
        }
      }

      // Fetch the complete organization with project summary
      const completeOrg = await getCustomerById(safeNewOrg.id);
      if (completeOrg) {
        setCustomers(prev => [completeOrg, ...prev]);
      }

      toast({
        title: "Organization Created",
        description: "Customer organization has been created successfully.",
      });

      return completeOrg || {
        ...safeNewOrg,
        project_summary: {
          total_projects: 0,
          active_projects: 0,
          completed_projects: 0,
          cancelled_projects: 0,
          on_hold_projects: 0,
          total_value: 0,
          active_value: 0,
          completed_value: 0,
          avg_project_value: 0
        }
      };
    } catch (err) {
      console.error('Error creating organization:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create customer organization",
      });
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomerOrganizations,
    getCustomerById,
    searchCustomers,
    deleteCustomer,
    archiveCustomer,
    unarchiveCustomer,
    createOrganization
  };
}