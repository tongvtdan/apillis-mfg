import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus, ProjectPriority, ProjectType } from '@/types/project';
import { useToast } from '@/hooks/use-toast';

export interface ProjectActionData {
    // Project Information
    title: string;
    description?: string;
    project_type: ProjectType;
    priority_level: ProjectPriority;
    status?: ProjectStatus;

    // Customer Information
    customer_organization_id?: string;
    point_of_contacts?: string[];

    // Project Details
    estimated_value?: number;
    estimated_delivery_date?: string;

    // Additional Information
    tags?: string[];
    notes?: string;
}

export interface ProjectUpdateData extends Partial<ProjectActionData> {
    id: string;
}

export interface ProjectActionOptions {
    showToast?: boolean;
    refreshData?: boolean;
    onSuccess?: (project: Project) => void;
    onError?: (error: Error) => void;
}

class ProjectActionService {
    private toast = useToast();

    /**
     * Create a new project
     */
    async createProject(
        data: ProjectActionData,
        options: ProjectActionOptions = {}
    ): Promise<Project> {
        const { showToast = true, onSuccess, onError } = options;

        try {
            // Get current user and organization
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', user?.id)
                .single();

            if (!user || !profile?.organization_id) {
                throw new Error('User must be authenticated to create projects');
            }

            // Generate unique project ID
            const projectId = await this.generateProjectId();

            // Prepare project data
            const projectData = {
                organization_id: profile.organization_id,
                project_id: projectId,
                title: data.title,
                description: data.description || null,
                project_type: data.project_type,
                priority_level: data.priority_level,
                status: data.status || 'active',
                customer_id: data.customer_id || null,
                estimated_value: data.estimated_value || null,
                estimated_delivery_date: data.estimated_delivery_date || null,
                source: 'manual',
                created_by: user.id,
                tags: data.tags || [],
                notes: data.notes || null,
                stage_entered_at: new Date().toISOString()
            };

            // Insert project
            const { data: newProject, error: projectError } = await supabase
                .from('projects')
                .insert(projectData)
                .select(`
                    *,
                    customer:contacts(*),
                    current_stage:workflow_stages(*)
                `)
                .single();

            if (projectError) throw projectError;

            // Show success message
            if (showToast) {
                this.toast({
                    title: "Project Created",
                    description: `Project ${projectId} has been created successfully.`,
                });
            }

            // Call success callback
            onSuccess?.(newProject as Project);

            return newProject as Project;

        } catch (error: any) {
            console.error('Error creating project:', error);

            let errorMessage = "There was an error creating the project. Please try again.";

            if (error.message.includes('duplicate key')) {
                errorMessage = "A project with this ID already exists. Please try again.";
            } else if (error.message.includes('foreign key')) {
                errorMessage = "Invalid customer reference. Please check your customer information.";
            } else if (error.message.includes('not null')) {
                errorMessage = "Required fields cannot be empty. Please check your inputs.";
            }

            // Show error message
            if (showToast) {
                this.toast({
                    variant: "destructive",
                    title: "Creation Error",
                    description: errorMessage,
                });
            }

            // Call error callback
            onError?.(error);

            throw error;
        }
    }

    /**
     * Update an existing project
     */
    async updateProject(
        data: ProjectUpdateData,
        options: ProjectActionOptions = {}
    ): Promise<Project> {
        const { showToast = true, onSuccess, onError } = options;

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User must be authenticated to update projects');
            }

            // Prepare update data
            const updateData = {
                title: data.title,
                description: data.description || null,
                project_type: data.project_type,
                priority_level: data.priority_level,
                status: data.status,
                customer_id: data.customer_id || null,
                estimated_value: data.estimated_value || null,
                estimated_delivery_date: data.estimated_delivery_date || null,
                tags: data.tags || [],
                notes: data.notes || null,
                updated_at: new Date().toISOString()
            };

            // Update project
            const { data: updatedProject, error: projectError } = await supabase
                .from('projects')
                .update(updateData)
                .eq('id', data.id)
                .select(`
                    *,
                    customer:contacts(*),
                    current_stage:workflow_stages(*)
                `)
                .single();

            if (projectError) throw projectError;

            // Show success message
            if (showToast) {
                this.toast({
                    title: "Project Updated",
                    description: `Project "${data.title}" has been updated successfully.`,
                });
            }

            // Call success callback
            onSuccess?.(updatedProject as Project);

            return updatedProject as Project;

        } catch (error: any) {
            console.error('Error updating project:', error);

            let errorMessage = "There was an error updating the project. Please try again.";

            if (error.message.includes('duplicate key')) {
                errorMessage = "A project with this title already exists. Please try again.";
            } else if (error.message.includes('foreign key')) {
                errorMessage = "Invalid customer reference. Please check your customer information.";
            } else if (error.message.includes('not null')) {
                errorMessage = "Required fields cannot be empty. Please check your inputs.";
            }

            // Show error message
            if (showToast) {
                this.toast({
                    variant: "destructive",
                    title: "Update Error",
                    description: errorMessage,
                });
            }

            // Call error callback
            onError?.(error);

            throw error;
        }
    }

    /**
     * Delete a project
     */
    async deleteProject(
        projectId: string,
        options: ProjectActionOptions = {}
    ): Promise<void> {
        const { showToast = true, onSuccess, onError } = options;

        try {
            // Get project details for confirmation message
            const { data: project } = await supabase
                .from('projects')
                .select('title')
                .eq('id', projectId)
                .single();

            // Delete project
            const { error: deleteError } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (deleteError) throw deleteError;

            // Show success message
            if (showToast) {
                this.toast({
                    title: "Project Deleted",
                    description: `Project "${project?.title}" has been deleted successfully.`,
                });
            }

            // Call success callback
            onSuccess?.({} as Project);

        } catch (error: any) {
            console.error('Error deleting project:', error);

            let errorMessage = "There was an error deleting the project. Please try again.";

            if (error.message.includes('foreign key')) {
                errorMessage = "Cannot delete project with associated data. Please remove related items first.";
            }

            // Show error message
            if (showToast) {
                this.toast({
                    variant: "destructive",
                    title: "Delete Error",
                    description: errorMessage,
                });
            }

            // Call error callback
            onError?.(error);

            throw error;
        }
    }

    /**
     * Duplicate a project
     */
    async duplicateProject(
        project: Project,
        options: ProjectActionOptions = {}
    ): Promise<Project> {
        const { showToast = true, onSuccess, onError } = options;

        try {
            // Generate new project ID
            const newProjectId = await this.generateProjectId();

            // Create duplicated project data
            const duplicatedData: ProjectActionData = {
                title: `${project.title} (Copy)`,
                description: project.description || undefined,
                project_type: project.project_type || 'fabrication',
                priority_level: project.priority_level || 'medium',
                status: 'active',
                customer_id: project.customer_id || undefined,
                estimated_value: project.estimated_value || undefined,
                estimated_delivery_date: project.estimated_delivery_date || undefined,
                tags: project.tags || [],
                notes: project.notes || undefined,
            };

            // Create new project
            const newProject = await this.createProject(duplicatedData, {
                showToast: false,
                onSuccess,
                onError
            });

            // Show success message
            if (showToast) {
                this.toast({
                    title: "Project Duplicated",
                    description: `Project "${project.title}" has been duplicated successfully.`,
                });
            }

            return newProject;

        } catch (error: any) {
            console.error('Error duplicating project:', error);

            // Show error message
            if (showToast) {
                this.toast({
                    variant: "destructive",
                    title: "Duplicate Error",
                    description: "Failed to duplicate project. Please try again.",
                });
            }

            // Call error callback
            onError?.(error);

            throw error;
        }
    }

    /**
     * Archive a project (set status to completed)
     */
    async archiveProject(
        projectId: string,
        options: ProjectActionOptions = {}
    ): Promise<Project> {
        const { showToast = true, onSuccess, onError } = options;

        try {
            // Update project status to completed
            const updatedProject = await this.updateProject({
                id: projectId,
                status: 'completed'
            }, {
                showToast: false,
                onSuccess,
                onError
            });

            // Show success message
            if (showToast) {
                this.toast({
                    title: "Project Archived",
                    description: `Project "${updatedProject.title}" has been archived successfully.`,
                });
            }

            return updatedProject;

        } catch (error: any) {
            console.error('Error archiving project:', error);

            // Show error message
            if (showToast) {
                this.toast({
                    variant: "destructive",
                    title: "Archive Error",
                    description: "Failed to archive project. Please try again.",
                });
            }

            // Call error callback
            onError?.(error);

            throw error;
        }
    }

    /**
     * Bulk delete projects
     */
    async bulkDeleteProjects(
        projectIds: string[],
        options: ProjectActionOptions = {}
    ): Promise<void> {
        const { showToast = true, onSuccess, onError } = options;

        try {
            // Delete multiple projects
            const { error: deleteError } = await supabase
                .from('projects')
                .delete()
                .in('id', projectIds);

            if (deleteError) throw deleteError;

            // Show success message
            if (showToast) {
                this.toast({
                    title: "Projects Deleted",
                    description: `${projectIds.length} projects have been deleted successfully.`,
                });
            }

            // Call success callback
            onSuccess?.({} as Project);

        } catch (error: any) {
            console.error('Error bulk deleting projects:', error);

            let errorMessage = "There was an error deleting the projects. Please try again.";

            if (error.message.includes('foreign key')) {
                errorMessage = "Cannot delete projects with associated data. Please remove related items first.";
            }

            // Show error message
            if (showToast) {
                this.toast({
                    variant: "destructive",
                    title: "Bulk Delete Error",
                    description: errorMessage,
                });
            }

            // Call error callback
            onError?.(error);

            throw error;
        }
    }

    /**
     * Bulk archive projects
     */
    async bulkArchiveProjects(
        projectIds: string[],
        options: ProjectActionOptions = {}
    ): Promise<void> {
        const { showToast = true, onSuccess, onError } = options;

        try {
            // Update multiple projects status to completed
            const { error: updateError } = await supabase
                .from('projects')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .in('id', projectIds);

            if (updateError) throw updateError;

            // Show success message
            if (showToast) {
                this.toast({
                    title: "Projects Archived",
                    description: `${projectIds.length} projects have been archived successfully.`,
                });
            }

            // Call success callback
            onSuccess?.({} as Project);

        } catch (error: any) {
            console.error('Error bulk archiving projects:', error);

            // Show error message
            if (showToast) {
                this.toast({
                    variant: "destructive",
                    title: "Bulk Archive Error",
                    description: "Failed to archive projects. Please try again.",
                });
            }

            // Call error callback
            onError?.(error);

            throw error;
        }
    }

    /**
     * Generate unique project ID
     */
    private async generateProjectId(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const sequence = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        return `P-${year}${month}${day}${sequence}`;
    }
}

// Export singleton instance
export const projectActionService = new ProjectActionService();
