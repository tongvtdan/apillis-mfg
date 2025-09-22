// Customer Organization Service
// Handles organization-based customer model operations

import { supabase } from '@/integrations/supabase/client.ts.js';
import { Organization, Contact, ProjectContactPoint } from '@/types/project';

export interface CustomerOrganization extends Organization {
    contacts?: Contact[];
    primary_contact?: Contact;
}

export interface ProjectContactPointWithDetails extends ProjectContactPoint {
    contact: Contact;
}

export class CustomerOrganizationService {
    /**
     * Get all customer organizations
     */
    static async getCustomerOrganizations(): Promise<CustomerOrganization[]> {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select(`
                    *,
                    contacts:contacts!organization_id(
                        id,
                        type,
                        company_name,
                        contact_name,
                        email,
                        phone,
                        role,
                        is_primary_contact,
                        is_active
                    )
                `)
                .eq('organization_type', 'customer')
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('Error fetching customer organizations:', error);
                throw new Error(`Failed to fetch customer organizations: ${error.message}`);
            }

            // Process organizations to set primary contact
            const organizations = (data || []).map(org => {
                const primaryContact = org.contacts?.find((c: Contact) => c.is_primary_contact) || org.contacts?.[0] || null;
                return {
                    ...org,
                    primary_contact: primaryContact
                };
            });

            return organizations;
        } catch (error) {
            console.error('CustomerOrganizationService.getCustomerOrganizations error:', error);
            throw error;
        }
    }

    /**
     * Get customer organization by ID
     */
    static async getCustomerOrganizationById(id: string): Promise<CustomerOrganization | null> {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select(`
                    *,
                    contacts:contacts!organization_id(
                        id,
                        type,
                        company_name,
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
                .eq('is_active', true)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error('Error fetching customer organization:', error);
                throw new Error(`Failed to fetch customer organization: ${error.message}`);
            }

            // Set primary contact
            const primaryContact = data.contacts?.find((c: Contact) => c.is_primary_contact) || data.contacts?.[0] || null;
            const organization = {
                ...data,
                primary_contact: primaryContact
            };

            return organization;
        } catch (error) {
            console.error('CustomerOrganizationService.getCustomerOrganizationById error:', error);
            throw error;
        }
    }

    /**
     * Create a new customer organization
     */
    static async createCustomerOrganization(organizationData: Partial<Organization>): Promise<Organization> {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .insert({
                    ...organizationData,
                    is_active: true,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating customer organization:', error);
                throw new Error(`Failed to create customer organization: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('CustomerOrganizationService.createCustomerOrganization error:', error);
            throw error;
        }
    }

    /**
     * Update customer organization
     */
    static async updateCustomerOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating customer organization:', error);
                throw new Error(`Failed to update customer organization: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('CustomerOrganizationService.updateCustomerOrganization error:', error);
            throw error;
        }
    }

    /**
     * Get project contact points for a project
     */
    static async getProjectContactPoints(projectId: string): Promise<ProjectContactPointWithDetails[]> {
        try {
            const { data, error } = await supabase
                .from('project_contact_points')
                .select(`
          *,
          contact:contacts(
            id,
            contact_name,
            email,
            phone,
            role,
            is_primary_contact,
            description,
            company_name
          )
        `)
                .eq('project_id', projectId)
                .order('is_primary', { ascending: false })
                .order('created_at');

            if (error) {
                console.error('Error fetching project contact points:', error);
                throw new Error(`Failed to fetch project contact points: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('CustomerOrganizationService.getProjectContactPoints error:', error);
            throw error;
        }
    }

    /**
     * Add contact point to project
     */
    static async addProjectContactPoint(
        projectId: string,
        contactId: string,
        role?: string,
        isPrimary: boolean = false
    ): Promise<ProjectContactPoint> {
        try {
            // If this is being set as primary, unset other primary contact points
            if (isPrimary) {
                await supabase
                    .from('project_contact_points')
                    .update({ is_primary: false })
                    .eq('project_id', projectId);
            }

            const { data, error } = await supabase
                .from('project_contact_points')
                .insert({
                    project_id: projectId,
                    contact_id: contactId,
                    role: role || 'general',
                    is_primary: isPrimary,
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding project contact point:', error);
                throw new Error(`Failed to add project contact point: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('CustomerOrganizationService.addProjectContactPoint error:', error);
            throw error;
        }
    }

    /**
     * Update project contact point
     */
    static async updateProjectContactPoint(
        contactPointId: string,
        updates: Partial<ProjectContactPoint>
    ): Promise<ProjectContactPoint> {
        try {
            // If this is being set as primary, unset other primary contact points
            if (updates.is_primary) {
                const { data: contactPoint } = await supabase
                    .from('project_contact_points')
                    .select('project_id')
                    .eq('id', contactPointId)
                    .single();

                if (contactPoint) {
                    await supabase
                        .from('project_contact_points')
                        .update({ is_primary: false })
                        .eq('project_id', contactPoint.project_id)
                        .neq('id', contactPointId);
                }
            }

            const { data, error } = await supabase
                .from('project_contact_points')
                .update(updates)
                .eq('id', contactPointId)
                .select()
                .single();

            if (error) {
                console.error('Error updating project contact point:', error);
                throw new Error(`Failed to update project contact point: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('CustomerOrganizationService.updateProjectContactPoint error:', error);
            throw error;
        }
    }

    /**
     * Remove contact point from project
     */
    static async removeProjectContactPoint(contactPointId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('project_contact_points')
                .delete()
                .eq('id', contactPointId);

            if (error) {
                console.error('Error removing project contact point:', error);
                throw new Error(`Failed to remove project contact point: ${error.message}`);
            }
        } catch (error) {
            console.error('CustomerOrganizationService.removeProjectContactPoint error:', error);
            throw error;
        }
    }

    /**
     * Get contacts for a customer organization
     */
    static async getOrganizationContacts(organizationId: string): Promise<Contact[]> {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('organization_id', organizationId)
                .eq('type', 'customer')
                .order('is_primary_contact', { ascending: false })
                .order('contact_name');

            if (error) {
                console.error('Error fetching organization contacts:', error);
                throw new Error(`Failed to fetch organization contacts: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('CustomerOrganizationService.getOrganizationContacts error:', error);
            throw error;
        }
    }

    /**
     * Add contact to customer organization
     */
    static async addContactToOrganization(
        organizationId: string,
        contactData: Partial<Contact>
    ): Promise<Contact> {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .insert({
                    ...contactData,
                    organization_id: organizationId,
                    type: 'customer',
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding contact to organization:', error);
                throw new Error(`Failed to add contact to organization: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('CustomerOrganizationService.addContactToOrganization error:', error);
            throw error;
        }
    }

    /**
     * Update contact in organization
     */
    static async updateContactInOrganization(
        contactId: string,
        updates: Partial<Contact>
    ): Promise<Contact> {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .update(updates)
                .eq('id', contactId)
                .eq('type', 'customer')
                .select()
                .single();

            if (error) {
                console.error('Error updating contact:', error);
                throw new Error(`Failed to update contact: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('CustomerOrganizationService.updateContactInOrganization error:', error);
            throw error;
        }
    }

    /**
     * Get primary contact for a customer organization
     */
    static async getPrimaryContact(organizationId: string): Promise<Contact | null> {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('organization_id', organizationId)
                .eq('type', 'customer')
                .eq('is_primary_contact', true)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error('Error fetching primary contact:', error);
                throw new Error(`Failed to fetch primary contact: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('CustomerOrganizationService.getPrimaryContact error:', error);
            throw error;
        }
    }

    /**
     * Set primary contact for a customer organization
     */
    static async setPrimaryContact(organizationId: string, contactId: string): Promise<void> {
        try {
            // First, unset all primary contacts for this organization
            await supabase
                .from('contacts')
                .update({ is_primary_contact: false })
                .eq('organization_id', organizationId)
                .eq('type', 'customer');

            // Then set the new primary contact
            const { error } = await supabase
                .from('contacts')
                .update({ is_primary_contact: true })
                .eq('id', contactId)
                .eq('organization_id', organizationId)
                .eq('type', 'customer');

            if (error) {
                console.error('Error setting primary contact:', error);
                throw new Error(`Failed to set primary contact: ${error.message}`);
            }
        } catch (error) {
            console.error('CustomerOrganizationService.setPrimaryContact error:', error);
            throw error;
        }
    }
}
