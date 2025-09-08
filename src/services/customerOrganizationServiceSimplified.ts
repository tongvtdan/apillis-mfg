// Customer Organization Service - Simplified Contact Model
// Updated to use point_of_contacts array instead of project_contact_points table

import { supabase } from '@/integrations/supabase/client';
import { Organization, Contact } from '@/types/project';
import { ProjectContactService } from './projectContactService';

export interface CustomerOrganization extends Organization {
    contacts?: Contact[];
    primary_contact?: Contact;
}

export class CustomerOrganizationServiceSimplified {
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
                .eq('organization_type', 'customer' as any)
                .eq('is_active', true as any)
                .eq('contacts.type', 'customer' as any)
                .eq('contacts.is_active', true as any)
                .order('name');

            if (error) {
                throw new Error(`Failed to fetch customer organizations: ${error.message}`);
            }

            // Process organizations to set primary contact
            const organizations = (data || []).map((org: any) => ({
                ...org,
                primary_contact: org.contacts?.find((c: Contact) => c.is_primary_contact) || org.contacts?.[0] || null
            }));

            return organizations;
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.getCustomerOrganizations error:', error);
            throw error;
        }
    }

    /**
     * Get customer organization by ID with contacts
     */
    static async getCustomerOrganization(organizationId: string): Promise<CustomerOrganization | null> {
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
                .eq('id', organizationId as any)
                .eq('organization_type', 'customer' as any)
                .eq('is_active', true as any)
                .eq('contacts.type', 'customer' as any)
                .eq('contacts.is_active', true as any)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                throw new Error(`Failed to fetch customer organization: ${error.message}`);
            }

            // Set primary contact
            const organization = {
                ...data,
                primary_contact: data.contacts?.find((c: Contact) => c.is_primary_contact) || data.contacts?.[0] || null
            };

            return organization;
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.getCustomerOrganization error:', error);
            throw error;
        }
    }

    /**
     * Create new customer organization
     */
    static async createCustomerOrganization(
        organizationData: Partial<Organization>,
        primaryContactData?: Partial<Contact>
    ): Promise<CustomerOrganization> {
        try {
            // Create organization
            const { data: organization, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: organizationData.name,
                    slug: organizationData.slug || this.generateSlug(organizationData.name || ''),
                    description: organizationData.description,
                    industry: organizationData.industry,
                    address: organizationData.address,
                    city: organizationData.city,
                    state: organizationData.state,
                    country: organizationData.country,
                    postal_code: organizationData.postal_code,
                    website: organizationData.website,
                    logo_url: organizationData.logo_url,
                    organization_type: 'customer',
                    is_active: true
                } as any)
                .select()
                .single();

            if (orgError) {
                throw new Error(`Failed to create organization: ${orgError.message}`);
            }

            let primary_contact = null;

            // Create primary contact if provided
            if (primaryContactData) {
                const { data: contact, error: contactError } = await supabase
                    .from('contacts')
                    .insert({
                        organization_id: organization.id,
                        type: 'customer',
                        company_name: organization.name,
                        contact_name: primaryContactData.contact_name,
                        email: primaryContactData.email,
                        phone: primaryContactData.phone,
                        role: primaryContactData.role || 'general',
                        is_primary_contact: true,
                        address: primaryContactData.address,
                        city: primaryContactData.city,
                        state: primaryContactData.state,
                        country: primaryContactData.country,
                        postal_code: primaryContactData.postal_code,
                        notes: primaryContactData.notes,
                        is_active: true,
                        created_by: (await supabase.auth.getUser()).data.user?.id
                    } as any)
                    .select()
                    .single();

                if (contactError) {
                    console.warn('Failed to create primary contact:', contactError);
                } else {
                    primary_contact = contact;
                }
            }

            return {
                ...organization,
                contacts: primary_contact ? [primary_contact] : [],
                primary_contact
            };
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.createCustomerOrganization error:', error);
            throw error;
        }
    }

    /**
     * Update customer organization
     */
    static async updateCustomerOrganization(
        organizationId: string,
        updates: Partial<Organization>
    ): Promise<CustomerOrganization> {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .update(updates)
                .eq('id', organizationId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update organization: ${error.message}`);
            }

            // Get updated organization with contacts
            const organization = await this.getCustomerOrganization(organizationId);
            return organization || data;
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.updateCustomerOrganization error:', error);
            throw error;
        }
    }

    /**
     * Delete customer organization
     */
    static async deleteCustomerOrganization(organizationId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('organizations')
                .delete()
                .eq('id', organizationId);

            if (error) {
                throw new Error(`Failed to delete organization: ${error.message}`);
            }
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.deleteCustomerOrganization error:', error);
            throw error;
        }
    }

    /**
     * Get contacts for a customer organization
     */
    static async getOrganizationContacts(organizationId: string): Promise<Contact[]> {
        return ProjectContactService.getAvailableContacts(organizationId);
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
                    organization_id: organizationId,
                    type: 'customer',
                    company_name: contactData.company_name,
                    contact_name: contactData.contact_name,
                    email: contactData.email,
                    phone: contactData.phone,
                    role: contactData.role || 'general',
                    is_primary_contact: contactData.is_primary_contact || false,
                    address: contactData.address,
                    city: contactData.city,
                    state: contactData.state,
                    country: contactData.country,
                    postal_code: contactData.postal_code,
                    notes: contactData.notes,
                    is_active: true
                } as any)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to add contact: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.addContactToOrganization error:', error);
            throw error;
        }
    }

    /**
     * Update contact in organization
     */
    static async updateOrganizationContact(
        contactId: string,
        updates: Partial<Contact>
    ): Promise<Contact> {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .update(updates)
                .eq('id', contactId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update contact: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.updateOrganizationContact error:', error);
            throw error;
        }
    }

    /**
     * Remove contact from organization
     */
    static async removeContactFromOrganization(contactId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('id', contactId);

            if (error) {
                throw new Error(`Failed to remove contact: ${error.message}`);
            }
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.removeContactFromOrganization error:', error);
            throw error;
        }
    }

    /**
     * Set primary contact for organization
     */
    static async setPrimaryContact(organizationId: string, contactId: string): Promise<void> {
        try {
            // First, unset all primary contacts for this organization
            await supabase
                .from('contacts')
                .update({ is_primary_contact: false })
                .eq('organization_id', organizationId);

            // Then set the new primary contact
            const { error } = await supabase
                .from('contacts')
                .update({ is_primary_contact: true })
                .eq('id', contactId)
                .eq('organization_id', organizationId);

            if (error) {
                throw new Error(`Failed to set primary contact: ${error.message}`);
            }
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.setPrimaryContact error:', error);
            throw error;
        }
    }

    /**
     * Search customer organizations
     */
    static async searchCustomerOrganizations(query: string): Promise<CustomerOrganization[]> {
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
                .or(`name.ilike.%${query}%,slug.ilike.%${query}%,description.ilike.%${query}%`)
                .eq('organization_type', 'customer' as any)
                .eq('is_active', true as any)
                .eq('contacts.type', 'customer' as any)
                .eq('contacts.is_active', true as any)
                .order('name');

            if (error) {
                throw new Error(`Failed to search organizations: ${error.message}`);
            }

            // Process organizations to set primary contact
            const organizations = (data || []).map((org: any) => ({
                ...org,
                primary_contact: org.contacts?.find((c: Contact) => c.is_primary_contact) || org.contacts?.[0] || null
            }));

            return organizations;
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.searchCustomerOrganizations error:', error);
            throw error;
        }
    }

    /**
     * Generate slug from organization name
     */
    private static generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    /**
     * Get organization statistics
     */
    static async getOrganizationStats(organizationId: string): Promise<{
        total_projects: number;
        active_projects: number;
        completed_projects: number;
        total_contacts: number;
    }> {
        try {
            // Get project counts
            const { data: projectStats, error: projectError } = await supabase
                .from('projects')
                .select('status')
                .eq('customer_organization_id', organizationId);

            if (projectError) {
                throw new Error(`Failed to get project stats: ${projectError.message}`);
            }

            // Get contact count
            const { count: contactCount, error: contactError } = await supabase
                .from('contacts')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', organizationId)
                .eq('type', 'customer')
                .eq('is_active', true);

            if (contactError) {
                throw new Error(`Failed to get contact count: ${contactError.message}`);
            }

            const projects = projectStats || [];
            const stats = {
                total_projects: projects.length,
                active_projects: projects.filter(p => p.status === 'active').length,
                completed_projects: projects.filter(p => p.status === 'completed').length,
                total_contacts: contactCount || 0
            };

            return stats;
        } catch (error) {
            console.error('CustomerOrganizationServiceSimplified.getOrganizationStats error:', error);
            throw error;
        }
    }
}