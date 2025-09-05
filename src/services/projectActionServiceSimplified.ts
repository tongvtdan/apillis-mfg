// Project Action Service - Simplified Contact Model
// Updated to use point_of_contacts array instead of customer_id

import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { ProjectServiceSimplified } from './projectServiceSimplified';

export interface ProjectActionData {
    // Basic Information
    title: string;
    description?: string;
    project_type?: string;
    priority_level?: string;
    status?: string;

    // Customer Information
    customer_organization_id?: string;
    point_of_contacts?: string[];

    // Project Details
    estimated_value?: number;
    estimated_delivery_date?: string;
    tags?: string[];
    notes?: string;
    current_stage_id?: string;
    assigned_to?: string;
}

export class ProjectActionServiceSimplified {
    /**
     * Create a new project
     */
    static async createProject(data: ProjectActionData): Promise<Project> {
        try {
            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error('User not authenticated');
            }

            // Get user profile for organization
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                throw new Error('User profile not found');
            }

            const project = await ProjectServiceSimplified.createProject({
                title: data.title,
                description: data.description || null,
                project_type: data.project_type,
                priority_level: data.priority_level,
                status: data.status || 'active',
                customer_organization_id: data.customer_organization_id || null,
                point_of_contacts: data.point_of_contacts || [],
                estimated_value: data.estimated_value || null,
                estimated_delivery_date: data.estimated_delivery_date || null,
                source: 'manual',
                assigned_to: data.assigned_to || user.id,
                tags: data.tags || [],
                notes: data.notes || null,
                current_stage_id: data.current_stage_id
            });

            return project;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.createProject error:', error);
            throw error;
        }
    }

    /**
     * Update an existing project
     */
    static async updateProject(projectId: string, data: Partial<ProjectActionData>): Promise<Project> {
        try {
            const project = await ProjectServiceSimplified.updateProject(projectId, {
                title: data.title,
                description: data.description,
                project_type: data.project_type,
                priority_level: data.priority_level,
                status: data.status,
                customer_organization_id: data.customer_organization_id,
                point_of_contacts: data.point_of_contacts,
                estimated_value: data.estimated_value,
                estimated_delivery_date: data.estimated_delivery_date,
                tags: data.tags,
                notes: data.notes,
                current_stage_id: data.current_stage_id,
                assigned_to: data.assigned_to
            });

            return project;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.updateProject error:', error);
            throw error;
        }
    }

    /**
     * Duplicate a project with new title and reset status
     */
    static async duplicateProject(
        sourceProjectId: string,
        newTitle?: string,
        modifications?: Partial<ProjectActionData>
    ): Promise<Project> {
        try {
            // Get the source project
            const sourceProject = await ProjectServiceSimplified.getProject(sourceProjectId);
            if (!sourceProject) {
                throw new Error('Source project not found');
            }

            // Create new project with source data and modifications
            const duplicateData: ProjectActionData = {
                title: newTitle || `Copy of ${sourceProject.title}`,
                description: sourceProject.description || undefined,
                project_type: sourceProject.project_type || undefined,
                priority_level: sourceProject.priority_level || 'medium',
                status: 'active',
                customer_organization_id: sourceProject.customer_organization_id || undefined,
                point_of_contacts: sourceProject.point_of_contacts || [],
                estimated_value: sourceProject.estimated_value || undefined,
                estimated_delivery_date: sourceProject.estimated_delivery_date || undefined,
                tags: sourceProject.tags || [],
                notes: sourceProject.notes || undefined,
                ...modifications
            };

            const newProject = await this.createProject(duplicateData);
            return newProject;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.duplicateProject error:', error);
            throw error;
        }
    }

    /**
     * Archive a project (set status to completed)
     */
    static async archiveProject(projectId: string): Promise<Project> {
        try {
            const project = await this.updateProject(projectId, {
                status: 'completed'
            });

            return project;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.archiveProject error:', error);
            throw error;
        }
    }

    /**
     * Restore an archived project (set status to active)
     */
    static async restoreProject(projectId: string): Promise<Project> {
        try {
            const project = await this.updateProject(projectId, {
                status: 'active'
            });

            return project;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.restoreProject error:', error);
            throw error;
        }
    }

    /**
     * Delete a project permanently
     */
    static async deleteProject(projectId: string): Promise<void> {
        try {
            await ProjectServiceSimplified.deleteProject(projectId);
        } catch (error) {
            console.error('ProjectActionServiceSimplified.deleteProject error:', error);
            throw error;
        }
    }

    /**
     * Bulk update multiple projects
     */
    static async bulkUpdateProjects(
        projectIds: string[],
        updates: Partial<ProjectActionData>
    ): Promise<Project[]> {
        try {
            const promises = projectIds.map(id => this.updateProject(id, updates));
            const results = await Promise.all(promises);
            return results;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.bulkUpdateProjects error:', error);
            throw error;
        }
    }

    /**
     * Move project to different stage
     */
    static async moveProjectToStage(projectId: string, stageId: string): Promise<Project> {
        try {
            const project = await this.updateProject(projectId, {
                current_stage_id: stageId
            });

            return project;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.moveProjectToStage error:', error);
            throw error;
        }
    }

    /**
     * Assign project to user
     */
    static async assignProject(projectId: string, userId: string): Promise<Project> {
        try {
            const project = await this.updateProject(projectId, {
                assigned_to: userId
            });

            return project;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.assignProject error:', error);
            throw error;
        }
    }

    /**
     * Update project priority
     */
    static async updateProjectPriority(projectId: string, priority: string): Promise<Project> {
        try {
            const project = await this.updateProject(projectId, {
                priority_level: priority
            });

            return project;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.updateProjectPriority error:', error);
            throw error;
        }
    }

    /**
     * Add tags to project
     */
    static async addTagsToProject(projectId: string, newTags: string[]): Promise<Project> {
        try {
            // Get current project to merge tags
            const currentProject = await ProjectServiceSimplified.getProject(projectId);
            if (!currentProject) {
                throw new Error('Project not found');
            }

            const existingTags = currentProject.tags || [];
            const uniqueTags = Array.from(new Set([...existingTags, ...newTags]));

            const project = await this.updateProject(projectId, {
                tags: uniqueTags
            });

            return project;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.addTagsToProject error:', error);
            throw error;
        }
    }

    /**
     * Remove tags from project
     */
    static async removeTagsFromProject(projectId: string, tagsToRemove: string[]): Promise<Project> {
        try {
            // Get current project to filter tags
            const currentProject = await ProjectServiceSimplified.getProject(projectId);
            if (!currentProject) {
                throw new Error('Project not found');
            }

            const existingTags = currentProject.tags || [];
            const filteredTags = existingTags.filter(tag => !tagsToRemove.includes(tag));

            const project = await this.updateProject(projectId, {
                tags: filteredTags
            });

            return project;
        } catch (error) {
            console.error('ProjectActionServiceSimplified.removeTagsFromProject error:', error);
            throw error;
        }
    }
}