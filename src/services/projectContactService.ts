// Project Contact Service - Simplified Model
// Manages project contacts using point_of_contacts array in projects table
// Primary contact = first contact in the array

import { supabase } from '@/integrations/supabase/client.ts';
import { Contact } from '@/types/project';

export interface ProjectContactWithDetails extends Contact {
    is_project_primary: boolean;
    position_in_project: number;
}

export class ProjectContactService {
    /**
     * Get all contacts for a project with details
     */
    static async getProjectContacts(projectId: string): Promise<ProjectContactWithDetails[]> {
        try {
            const { data, error } = await supabase
                .rpc('get_project_contacts', { project_uuid: projectId });

            if (error) {
                console.error('Error fetching project contacts:', error);
                throw new Error(`Failed to fetch project contacts: ${error.message}`);
            }

            return (data || []).map((contact: any, index: number) => ({
                ...contact,
                is_project_primary: index === 0,
                position_in_project: index + 1
            }));
        } catch (error) {
            console.error('ProjectContactService.getProjectContacts error:', error);
            throw error;
        }
    }

    /**
     * Get primary contact for a project
     */
    static async getPrimaryContact(projectId: string): Promise<Contact | null> {
        try {
            const { data, error } = await supabase
                .rpc('get_project_primary_contact', { project_uuid: projectId });

            if (error) {
                console.error('Error fetching primary contact:', error);
                throw new Error(`Failed to fetch primary contact: ${error.message}`);
            }

            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('ProjectContactService.getPrimaryContact error:', error);
            throw error;
        }
    }

    /**
     * Get available contacts for a customer organization
     */
    static async getAvailableContacts(organizationId: string): Promise<Contact[]> {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('organization_id', organizationId)
                .in('type', ['customer', 'partner'])
                .eq('is_active', true)
                .order('is_primary_contact', { ascending: false })
                .order('contact_name');

            if (error) {
                console.error('Error fetching available contacts:', error);
                throw new Error(`Failed to fetch available contacts: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('ProjectContactService.getAvailableContacts error:', error);
            throw error;
        }
    }

    /**
     * Set project contacts (replace all)
     */
    static async setProjectContacts(projectId: string, contactIds: string[]): Promise<void> {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ point_of_contacts: contactIds })
                .eq('id', projectId);

            if (error) {
                console.error('Error setting project contacts:', error);
                throw new Error(`Failed to set project contacts: ${error.message}`);
            }
        } catch (error) {
            console.error('ProjectContactService.setProjectContacts error:', error);
            throw error;
        }
    }

    /**
     * Add contact to project
     */
    static async addContactToProject(
        projectId: string,
        contactId: string,
        makePrimary: boolean = false
    ): Promise<void> {
        try {
            const { error } = await supabase
                .rpc('add_contact_to_project', {
                    project_uuid: projectId,
                    contact_uuid: contactId,
                    make_primary: makePrimary
                });

            if (error) {
                console.error('Error adding contact to project:', error);
                throw new Error(`Failed to add contact to project: ${error.message}`);
            }
        } catch (error) {
            console.error('ProjectContactService.addContactToProject error:', error);
            throw error;
        }
    }

    /**
     * Remove contact from project
     */
    static async removeContactFromProject(projectId: string, contactId: string): Promise<void> {
        try {
            const { error } = await supabase
                .rpc('remove_contact_from_project', {
                    project_uuid: projectId,
                    contact_uuid: contactId
                });

            if (error) {
                console.error('Error removing contact from project:', error);
                throw new Error(`Failed to remove contact from project: ${error.message}`);
            }
        } catch (error) {
            console.error('ProjectContactService.removeContactFromProject error:', error);
            throw error;
        }
    }

    /**
     * Set primary contact (move to first position)
     */
    static async setPrimaryContact(projectId: string, contactId: string): Promise<void> {
        try {
            // Get current contacts
            const { data: project, error: fetchError } = await supabase
                .from('projects')
                .select('point_of_contacts')
                .eq('id', projectId)
                .single();

            if (fetchError) {
                throw new Error(`Failed to fetch project: ${fetchError.message}`);
            }

            const currentContacts = project.point_of_contacts || [];

            // Remove contact from current position and add to front
            const newContacts = [contactId, ...currentContacts.filter((id: string) => id !== contactId)];

            const { error } = await supabase
                .from('projects')
                .update({ point_of_contacts: newContacts })
                .eq('id', projectId);

            if (error) {
                console.error('Error setting primary contact:', error);
                throw new Error(`Failed to set primary contact: ${error.message}`);
            }
        } catch (error) {
            console.error('ProjectContactService.setPrimaryContact error:', error);
            throw error;
        }
    }

    /**
     * Reorder project contacts
     */
    static async reorderContacts(projectId: string, orderedContactIds: string[]): Promise<void> {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ point_of_contacts: orderedContactIds })
                .eq('id', projectId);

            if (error) {
                console.error('Error reordering contacts:', error);
                throw new Error(`Failed to reorder contacts: ${error.message}`);
            }
        } catch (error) {
            console.error('ProjectContactService.reorderContacts error:', error);
            throw error;
        }
    }

    /**
     * Get project contact summary
     */
    static async getContactSummary(projectId: string): Promise<{
        total: number;
        primary: Contact | null;
        roles: Record<string, number>;
    }> {
        try {
            const contacts = await this.getProjectContacts(projectId);

            const summary = {
                total: contacts.length,
                primary: contacts.length > 0 ? contacts[0] : null,
                roles: contacts.reduce((acc, contact) => {
                    const role = contact.role || 'general';
                    acc[role] = (acc[role] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>)
            };

            return summary;
        } catch (error) {
            console.error('ProjectContactService.getContactSummary error:', error);
            throw error;
        }
    }

    /**
     * Validate contact belongs to project's customer organization
     */
    static async validateContactForProject(projectId: string, contactId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    customer_organization_id,
                    contacts!inner(id)
                `)
                .eq('id', projectId)
                .eq('contacts.id', contactId)
                .eq('contacts.organization_id', supabase.raw('projects.customer_organization_id'))
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error validating contact:', error);
                return false;
            }

            return !!data;
        } catch (error) {
            console.error('ProjectContactService.validateContactForProject error:', error);
            return false;
        }
    }

    /**
     * Bulk update project contacts for multiple projects
     */
    static async bulkUpdateContacts(updates: Array<{
        projectId: string;
        contactIds: string[];
    }>): Promise<void> {
        try {
            const promises = updates.map(update =>
                this.setProjectContacts(update.projectId, update.contactIds)
            );

            await Promise.all(promises);
        } catch (error) {
            console.error('ProjectContactService.bulkUpdateContacts error:', error);
            throw error;
        }
    }
}