// Project Service - Simplified Contact Model
// Updated to use point_of_contacts array instead of customer_id and project_contact_points

import { supabase } from '@/integrations/supabase/client';
import { Project, Contact, Organization } from '@/types/project';
import { ProjectContactService } from './projectContactService';

export interface ProjectCreateData {
    title: string;
    description?: string;
    customer_organization_id: string;
    point_of_contacts?: string[];
    current_stage_id?: string;
    status?: string;
    priority_level?: string;
    source?: string;
    assigned_to?: string;
    estimated_value?: number;
    tags?: string[];
    metadata?: Record<string, any>;
    project_type?: string;
    notes?: string;
    estimated_delivery_date?: string;
}

export interface ProjectUpdateData extends Partial<ProjectCreateData> {
    id?: string;
}

export class ProjectServiceSimplified {
    /**
     * Get project by ID with resolved contacts and organization
     */
    static async getProject(projectId: string): Promise<Project | null> {
        try {
            const { data, error } = await supabase
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
                        is_active
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

            // Resolve contacts from point_of_contacts array
            const project = await this.resolveProjectContacts(data);
            return project;
        } catch (error) {
            console.error('ProjectServiceSimplified.getProject error:', error);
            throw error;
        }
    }

    /**
     * Get all projects with basic info
     */
    static async getProjects(organizationId?: string): Promise<Project[]> {
        try {
            let query = supabase
                .from('projects')
                .select(`
                    *,
                    customer_organization:organizations!customer_organization_id(
                        id,
                        name,
                        slug
                    ),
                    current_stage:workflow_stages!current_stage_id(
                        id,
                        name,
                        stage_order
                    )
                `)
                .order('created_at', { ascending: false });

            if (organizationId) {
                query = query.eq('organization_id', organizationId);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Failed to fetch projects: ${error.message}`);
            }

            // Resolve contacts for each project
            const projects = await Promise.all(
                (data || []).map(project => this.resolveProjectContacts(project))
            );

            return projects;
        } catch (error) {
            console.error('ProjectServiceSimplified.getProjects error:', error);
            throw error;
        }
    }

    /**
     * Create new project
     */
    static async createProject(projectData: ProjectCreateData): Promise<Project> {
        try {
            // Generate project ID
            const projectId = await this.generateProjectId();

            const { data, error } = await supabase
                .from('projects')
                .insert({
                    project_id: projectId,
                    title: projectData.title,
                    description: projectData.description || null,
                    customer_organization_id: projectData.customer_organization_id,
                    point_of_contacts: projectData.point_of_contacts || [],
                    current_stage_id: projectData.current_stage_id || null,
                    status: projectData.status || 'active',
                    priority_level: projectData.priority_level || 'normal',
                    source: projectData.source || 'manual',
                    assigned_to: projectData.assigned_to || null,
                    estimated_value: projectData.estimated_value || null,
                    tags: projectData.tags || [],
                    metadata: projectData.metadata || {},
                    project_type: projectData.project_type || null,
                    notes: projectData.notes || null,
                    estimated_delivery_date: projectData.estimated_delivery_date || null
                })
                .select(`
                    *,
                    customer_organization:organizations!customer_organization_id(
                        id,
                        name,
                        slug,
                        description,
                        industry
                    )
                `)
                .single();

            if (error) {
                throw new Error(`Failed to create project: ${error.message}`);
            }

            const project = await this.resolveProjectContacts(data);
            return project;
        } catch (error) {
            console.error('ProjectServiceSimplified.createProject error:', error);
            throw error;
        }
    }

    /**
     * Update project
     */
    static async updateProject(projectId: string, updates: ProjectUpdateData): Promise<Project> {
        try {
            const { data, error } = await supabase
                .from('projects')
                .update({
                    title: updates.title,
                    description: updates.description,
                    customer_organization_id: updates.customer_organization_id,
                    point_of_contacts: updates.point_of_contacts,
                    current_stage_id: updates.current_stage_id,
                    status: updates.status,
                    priority_level: updates.priority_level,
                    assigned_to: updates.assigned_to,
                    estimated_value: updates.estimated_value,
                    tags: updates.tags,
                    metadata: updates.metadata,
                    project_type: updates.project_type,
                    notes: updates.notes,
                    estimated_delivery_date: updates.estimated_delivery_date
                })
                .eq('id', projectId)
                .select(`
                    *,
                    customer_organization:organizations!customer_organization_id(
                        id,
                        name,
                        slug,
                        description,
                        industry
                    )
                `)
                .single();

            if (error) {
                throw new Error(`Failed to update project: ${error.message}`);
            }

            const project = await this.resolveProjectContacts(data);
            return project;
        } catch (error) {
            console.error('ProjectServiceSimplified.updateProject error:', error);
            throw error;
        }
    }

    /**
     * Delete project
     */
    static async deleteProject(projectId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) {
                throw new Error(`Failed to delete project: ${error.message}`);
            }
        } catch (error) {
            console.error('ProjectServiceSimplified.deleteProject error:', error);
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
        return ProjectContactService.addContactToProject(projectId, contactId, makePrimary);
    }

    /**
     * Remove contact from project
     */
    static async removeContactFromProject(projectId: string, contactId: string): Promise<void> {
        return ProjectContactService.removeContactFromProject(projectId, contactId);
    }

    /**
     * Set primary contact for project
     */
    static async setPrimaryContact(projectId: string, contactId: string): Promise<void> {
        return ProjectContactService.setPrimaryContact(projectId, contactId);
    }

    /**
     * Get available contacts for a customer organization
     */
    static async getAvailableContacts(organizationId: string): Promise<Contact[]> {
        return ProjectContactService.getAvailableContacts(organizationId);
    }

    /**
     * Resolve project contacts from point_of_contacts array
     */
    private static async resolveProjectContacts(project: any): Promise<Project> {
        if (!project.point_of_contacts || project.point_of_contacts.length === 0) {
            return {
                ...project,
                contacts: [],
                primary_contact: null
            };
        }

        try {
            // Get contacts in the same order as the array
            const { data: contactsData, error } = await supabase
                .from('contacts')
                .select('*')
                .in('id', project.point_of_contacts);

            if (error) {
                console.warn('Failed to resolve project contacts:', error);
                return {
                    ...project,
                    contacts: [],
                    primary_contact: null
                };
            }

            // Maintain the order from point_of_contacts array
            const contactsMap = new Map(contactsData.map(c => [c.id, c]));
            const contacts = project.point_of_contacts
                .map((id: string) => contactsMap.get(id))
                .filter(Boolean) as Contact[];

            return {
                ...project,
                contacts,
                primary_contact: contacts.length > 0 ? contacts[0] : null
            };
        } catch (error) {
            console.warn('Error resolving project contacts:', error);
            return {
                ...project,
                contacts: [],
                primary_contact: null
            };
        }
    }

    /**
     * Generate unique project ID in P-YYMMDDXX format
     */
    private static async generateProjectId(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const baseId = `P-${year}${month}${day}`;

        // Find the next available sequence number
        const { data, error } = await supabase
            .from('projects')
            .select('project_id')
            .like('project_id', `${baseId}%`)
            .order('project_id', { ascending: false })
            .limit(1);

        if (error) {
            throw new Error(`Failed to generate project ID: ${error.message}`);
        }

        let sequence = 1;
        if (data && data.length > 0) {
            const lastId = data[0].project_id;
            const lastSequence = parseInt(lastId.slice(-2));
            sequence = lastSequence + 1;
        }

        return `${baseId}${sequence.toString().padStart(2, '0')}`;
    }

    /**
     * Search projects by various criteria
     */
    static async searchProjects(
        query: string,
        organizationId?: string,
        filters?: {
            status?: string;
            priority_level?: string;
            customer_organization_id?: string;
        }
    ): Promise<Project[]> {
        try {
            let supabaseQuery = supabase
                .from('projects')
                .select(`
                    *,
                    customer_organization:organizations!customer_organization_id(
                        id,
                        name,
                        slug
                    ),
                    current_stage:workflow_stages!current_stage_id(
                        id,
                        name,
                        stage_order
                    )
                `)
                .or(`title.ilike.%${query}%,project_id.ilike.%${query}%,description.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (organizationId) {
                supabaseQuery = supabaseQuery.eq('organization_id', organizationId);
            }

            if (filters?.status) {
                supabaseQuery = supabaseQuery.eq('status', filters.status);
            }

            if (filters?.priority_level) {
                supabaseQuery = supabaseQuery.eq('priority_level', filters.priority_level);
            }

            if (filters?.customer_organization_id) {
                supabaseQuery = supabaseQuery.eq('customer_organization_id', filters.customer_organization_id);
            }

            const { data, error } = await supabaseQuery;

            if (error) {
                throw new Error(`Failed to search projects: ${error.message}`);
            }

            // Resolve contacts for each project
            const projects = await Promise.all(
                (data || []).map(project => this.resolveProjectContacts(project))
            );

            return projects;
        } catch (error) {
            console.error('ProjectServiceSimplified.searchProjects error:', error);
            throw error;
        }
    }
}