// Extended Project Service - Simplified Contact Model
// Extends base project operations with contact resolution and management

import { supabase } from '@/integrations/supabase/client';
import { Project, Contact } from '@/types/project';
import { ProjectContactService } from './projectContactService';

export class ProjectServiceExtended {
    /**
     * Get project with resolved contacts
     */
    static async getProjectWithContacts(projectId: string): Promise<Project | null> {
        try {
            // Get project with basic info
            const { data: project, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    customer_organization:organizations!customer_organization_id(
                        id,
                        name,
                        slug,
                        description,
                        industry,
                        address,
                        city,
                        state,
                        country,
                        postal_code,
                        website,
                        logo_url,
                        is_active
                    ),
                    current_stage:workflow_stages!current_stage_id(
                        id,
                        name,
                        description,
                        stage_order,
                        is_active,
                        estimated_duration_days
                    )
                `)
                .eq('id', projectId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                throw new Error(`Failed to fetch project: ${error.message}`);
            }

            // Resolve contacts if point_of_contacts array exists
            let contacts: Contact[] = [];
            let primary_contact: Contact | null = null;

            if (project.point_of_contacts && project.point_of_contacts.length > 0) {
                // Get contacts in the same order as the array
                const { data: contactsData, error: contactsError } = await supabase
                    .from('contacts')
                    .select('*')
                    .in('id', project.point_of_contacts);

                if (contactsError) {
                    console.warn('Failed to fetch project contacts:', contactsError);
                } else if (contactsData) {
                    // Maintain the order from point_of_contacts array
                    const contactsMap = new Map(contactsData.map(c => [c.id, c]));
                    contacts = project.point_of_contacts
                        .map((id: string) => contactsMap.get(id))
                        .filter(Boolean) as Contact[];
                    
                    primary_contact = contacts.length > 0 ? contacts[0] : null;
