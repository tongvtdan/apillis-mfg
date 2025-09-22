import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, Contact } from '@/types/project';
import { CustomerOrganizationService } from '@/services/customerOrganizationService';
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
    contacts?: Contact[];
}

export function useCustomerOrganizations(showArchived = false) {
    const [organizations, setOrganizations] = useState<CustomerOrganizationWithSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth();
    const { toast } = useToast();

    const fetchOrganizations = async () => {
        if (!user || !profile?.organization_id) {
            setOrganizations([]);
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
            const organizationsWithSummary = await Promise.all(
                (orgs || []).map(async (org) => {
                    const projectSummary = await calculateProjectSummary(org.id);

                    return {
                        ...org,
                        project_summary: projectSummary,
                        primary_contact: org.contacts?.find((c: any) => c.is_primary_contact) || org.contacts?.[0]
                    } as CustomerOrganizationWithSummary;
                })
            );

            setOrganizations(organizationsWithSummary);
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

    const createOrganization = async (
        organizationData: Partial<Organization>,
        contactData?: {
            contact_name?: string;
            email?: string;
            phone?: string;
            role?: string;
        }
    ): Promise<Organization> => {
        try {
            // Create the organization
            const newOrganization = await CustomerOrganizationService.createCustomerOrganization({
                ...organizationData,
                organization_type: 'customer'
            });

            // Create primary contact if provided
            if (contactData && (contactData.contact_name || contactData.email || contactData.phone)) {
                await CustomerOrganizationService.addContactToOrganization(newOrganization.id, {
                    ...contactData,
                    is_primary_contact: true,
                    type: 'customer'
                });
            }

            // Refetch organizations to include the new one
            await fetchOrganizations();

            toast({
                title: "Organization Created",
                description: `${newOrganization.name} has been created successfully.`,
            });

            return newOrganization;
        } catch (err) {
            console.error('Error creating organization:', err);
            toast({
                title: "Error",
                description: "Failed to create organization. Please try again.",
                variant: "destructive",
            });
            throw err;
        }
    };

    const updateOrganization = async (
        organizationId: string,
        organizationData: Partial<Organization>
    ): Promise<Organization> => {
        try {
            const updatedOrganization = await CustomerOrganizationService.updateCustomerOrganization(
                organizationId,
                organizationData
            );

            // Refetch organizations to include the updated one
            await fetchOrganizations();

            toast({
                title: "Organization Updated",
                description: `${updatedOrganization.name} has been updated successfully.`,
            });

            return updatedOrganization;
        } catch (err) {
            console.error('Error updating organization:', err);
            toast({
                title: "Error",
                description: "Failed to update organization. Please try again.",
                variant: "destructive",
            });
            throw err;
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, [user, profile?.organization_id, showArchived]);

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

    const deleteCustomer = async (customerId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('organizations')
                .delete()
                .eq('id', customerId)
                .eq('organization_type', 'customer');

            if (error) {
                console.error('Error deleting customer:', error);
                throw new Error(`Failed to delete customer: ${error.message}`);
            }

            // Refetch organizations to remove the deleted one
            await fetchOrganizations();

            toast({
                title: "Customer Deleted",
                description: "Customer has been deleted successfully.",
            });
        } catch (err) {
            console.error('Error deleting customer:', err);
            toast({
                title: "Error",
                description: "Failed to delete customer. Please try again.",
                variant: "destructive",
            });
            throw err;
        }
    };

    const archiveCustomer = async (customerId: string, archived: boolean = true): Promise<void> => {
        try {
            const { error } = await supabase
                .from('organizations')
                .update({ is_active: !archived })
                .eq('id', customerId)
                .eq('organization_type', 'customer');

            if (error) {
                console.error('Error archiving customer:', error);
                throw new Error(`Failed to archive customer: ${error.message}`);
            }

            // Refetch organizations to reflect the change
            await fetchOrganizations();

            toast({
                title: archived ? "Customer Archived" : "Customer Restored",
                description: archived
                    ? "Customer has been archived successfully."
                    : "Customer has been restored successfully.",
            });
        } catch (err) {
            console.error('Error archiving customer:', err);
            toast({
                title: "Error",
                description: "Failed to update customer status. Please try again.",
                variant: "destructive",
            });
            throw err;
        }
    };

    return {
        customers: organizations,
        loading,
        error,
        createOrganization,
        updateOrganization,
        deleteCustomer,
        archiveCustomer,
        refetch: fetchOrganizations
    };
}

export function useCustomerOrganization(organizationId: string) {
    const [organization, setOrganization] = useState<CustomerOrganizationWithSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchOrganization = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await CustomerOrganizationService.getCustomerOrganizationById(organizationId);
            setOrganization(data);
        } catch (err) {
            console.error('Error fetching customer organization:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch customer organization');
            setOrganization(null);
        } finally {
            setLoading(false);
        }
    };

    const addContact = async (contactData: Partial<Contact>): Promise<Contact> => {
        try {
            const newContact = await CustomerOrganizationService.addContactToOrganization(
                organizationId,
                contactData
            );

            // Refetch organization to get updated contacts
            await fetchOrganization();

            toast({
                title: "Contact Added",
                description: `Contact ${newContact.contact_name} has been added successfully.`,
            });

            return newContact;
        } catch (err) {
            console.error('Error adding contact:', err);
            toast({
                title: "Error",
                description: "Failed to add contact. Please try again.",
                variant: "destructive",
            });
            throw err;
        }
    };

    const updateContact = async (
        contactId: string,
        contactData: Partial<Contact>
    ): Promise<Contact> => {
        try {
            const updatedContact = await CustomerOrganizationService.updateContactInOrganization(
                contactId,
                contactData
            );

            // Refetch organization to get updated contacts
            await fetchOrganization();

            toast({
                title: "Contact Updated",
                description: `Contact has been updated successfully.`,
            });

            return updatedContact;
        } catch (err) {
            console.error('Error updating contact:', err);
            toast({
                title: "Error",
                description: "Failed to update contact. Please try again.",
                variant: "destructive",
            });
            throw err;
        }
    };

    const setPrimaryContact = async (contactId: string): Promise<void> => {
        try {
            await CustomerOrganizationService.setPrimaryContact(organizationId, contactId);

            // Refetch organization to get updated contacts
            await fetchOrganization();

            toast({
                title: "Primary Contact Updated",
                description: "Primary contact has been updated successfully.",
            });
        } catch (err) {
            console.error('Error setting primary contact:', err);
            toast({
                title: "Error",
                description: "Failed to update primary contact.",
                variant: "destructive",
            });
            throw err;
        }
    };

    useEffect(() => {
        if (organizationId) {
            fetchOrganization();
        }
    }, [organizationId]);

    return {
        organization,
        loading,
        error,
        addContact,
        updateContact,
        setPrimaryContact,
        refetch: fetchOrganization
    };
}
