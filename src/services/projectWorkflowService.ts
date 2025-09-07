import { Project, WorkflowStage, ProjectStatus, ProjectSubStageProgress } from '@/types/project';
import { projectService } from './projectService';
import { workflowStageService } from './workflowStageService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkflowEvent {
    eventType: 'stage_changed' | 'status_changed' | 'document_uploaded' | 'review_completed' | 'communication_sent';
    projectId: string;
    userId: string;
    data: Record<string, any>;
    timestamp: string;
}

export interface WorkflowValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    requiredActions: string[];
}

export interface ProjectWorkflowState {
    project: Project;
    currentStage: WorkflowStage | null;
    subStageProgress: ProjectSubStageProgress[];
    pendingApprovals: any[];
    requiredDocuments: any[];
    nextPossibleStages: WorkflowStage[];
    workflowValidation: WorkflowValidation;
}

class ProjectWorkflowService {
    private workflowCache = new Map<string, ProjectWorkflowState>();

    /**
     * Get complete workflow state for a project
     */
    async getProjectWorkflowState(projectId: string): Promise<ProjectWorkflowState | null> {
        try {
            // Check cache first
            if (this.workflowCache.has(projectId)) {
                return this.workflowCache.get(projectId)!;
            }

            // Fetch project with all related data
            const project = await projectService.getProjectById(projectId);
            if (!project) return null;

            // Get current stage details
            const currentStage = project.current_stage_id
                ? await workflowStageService.getWorkflowStageById(project.current_stage_id)
                : null;

            // Get sub-stage progress
            const subStageProgress = await this.getSubStageProgress(projectId);

            // Get pending approvals
            const pendingApprovals = await this.getPendingApprovals(projectId);

            // Get required documents for current stage
            const requiredDocuments = await this.getRequiredDocuments(projectId, currentStage);

            // Get next possible stages
            const nextPossibleStages = await this.getNextPossibleStages(project.current_stage_id);

            // Validate current workflow state
            const workflowValidation = await this.validateWorkflowState(project);

            const workflowState: ProjectWorkflowState = {
                project,
                currentStage,
                subStageProgress,
                pendingApprovals,
                requiredDocuments,
                nextPossibleStages,
                workflowValidation
            };

            // Cache the result
            this.workflowCache.set(projectId, workflowState);

            return workflowState;
        } catch (error) {
            console.error('Error getting project workflow state:', error);
            return null;
        }
    }

    /**
     * Create a new project and initialize workflow
     */
    async createProjectWithWorkflow(projectData: {
        title: string;
        description?: string;
        customer_organization_id: string;
        priority_level?: string;
        estimated_value?: number;
        project_type?: string;
        intake_type?: string;
        intake_source?: string;
        initial_documents?: File[];
        contacts?: string[];
    }): Promise<Project | null> {
        try {
            // Get first workflow stage (inquiry received)
            const stages = await workflowStageService.getWorkflowStages();
            const initialStage = stages.find(s => s.stage_order === 1);

            if (!initialStage) {
                throw new Error('No initial workflow stage found');
            }

            // Create project with initial stage
            const project = await projectService.createProject({
                ...projectData,
                current_stage_id: initialStage.id,
                status: 'active',
                point_of_contacts: projectData.contacts || []
            });

            if (!project) {
                throw new Error('Failed to create project');
            }

            // Initialize sub-stage progress for initial stage
            await this.initializeSubStageProgress(project.id, initialStage.id);

            // Log workflow initialization
            await this.logWorkflowEvent({
                eventType: 'stage_changed',
                projectId: project.id,
                userId: project.created_by || '',
                data: {
                    from_stage: null,
                    to_stage: initialStage.id,
                    reason: 'Project creation'
                },
                timestamp: new Date().toISOString()
            });

            // Upload initial documents if provided
            if (projectData.initial_documents?.length) {
                await this.handleDocumentUploads(project.id, projectData.initial_documents);
            }

            // Clear cache
            this.workflowCache.delete(project.id);

            return project;
        } catch (error) {
            console.error('Error creating project with workflow:', error);
            return null;
        }
    }

    /**
     * Advance project to next stage with validation
     */
    async advanceProjectStage(projectId: string, targetStageId: string, userId: string, options?: {
        bypassValidation?: boolean;
        reason?: string;
        force?: boolean;
    }): Promise<{ success: boolean; message: string; project?: Project }> {
        try {
            const workflowState = await this.getProjectWorkflowState(projectId);
            if (!workflowState) {
                return { success: false, message: 'Project workflow state not found' };
            }

            const { project, currentStage, workflowValidation } = workflowState;

            // Validate transition if not bypassing
            if (!options?.bypassValidation && !workflowValidation.isValid) {
                return {
                    success: false,
                    message: `Cannot advance stage: ${workflowValidation.errors.join(', ')}`
                };
            }

            // Check if target stage is valid
            const targetStage = await workflowStageService.getWorkflowStageById(targetStageId);
            if (!targetStage) {
                return { success: false, message: 'Target stage not found' };
            }

            // Update project stage
            const updatedProject = await projectService.updateProject(projectId, {
                current_stage_id: targetStageId,
                stage_entered_at: new Date().toISOString()
            });

            if (!updatedProject) {
                return { success: false, message: 'Failed to update project stage' };
            }

            // Initialize sub-stage progress for new stage
            await this.initializeSubStageProgress(projectId, targetStageId);

            // Log the transition
            await this.logWorkflowEvent({
                eventType: 'stage_changed',
                projectId,
                userId,
                data: {
                    from_stage: currentStage?.id,
                    to_stage: targetStageId,
                    reason: options?.reason || 'Stage advancement',
                    bypassed_validation: options?.bypassValidation
                },
                timestamp: new Date().toISOString()
            });

            // Clear cache
            this.workflowCache.delete(projectId);

            return {
                success: true,
                message: `Project advanced to ${targetStage.name}`,
                project: updatedProject
            };
        } catch (error) {
            console.error('Error advancing project stage:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Update project status with workflow implications
     */
    async updateProjectStatus(projectId: string, newStatus: ProjectStatus, userId: string, reason?: string): Promise<boolean> {
        try {
            const workflowState = await this.getProjectWorkflowState(projectId);
            if (!workflowState) return false;

            // Update project status
            const success = await projectService.updateProjectStatus(projectId, newStatus);

            if (success) {
                // Log status change
                await this.logWorkflowEvent({
                    eventType: 'status_changed',
                    projectId,
                    userId,
                    data: {
                        from_status: workflowState.project.status,
                        to_status: newStatus,
                        reason: reason || 'Status update'
                    },
                    timestamp: new Date().toISOString()
                });

                // Clear cache
                this.workflowCache.delete(projectId);

                // Handle status-specific workflow actions
                await this.handleStatusChangeActions(projectId, newStatus);
            }

            return success;
        } catch (error) {
            console.error('Error updating project status:', error);
            return false;
        }
    }

    /**
     * Get sub-stage progress for a project
     */
    private async getSubStageProgress(projectId: string): Promise<ProjectSubStageProgress[]> {
        try {
            const { data, error } = await supabase
                .from('project_sub_stage_progress')
                .select(`
          *,
          sub_stage:workflow_sub_stages(*)
        `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting sub-stage progress:', error);
            return [];
        }
    }

    /**
     * Get pending approvals for a project
     */
    private async getPendingApprovals(projectId: string): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('approvals')
                .select('*')
                .eq('project_id', projectId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting pending approvals:', error);
            return [];
        }
    }

    /**
     * Get required documents for current stage
     */
    private async getRequiredDocuments(projectId: string, currentStage: WorkflowStage | null): Promise<any[]> {
        try {
            if (!currentStage) return [];

            const { data, error } = await supabase
                .from('document_requirements')
                .select('*')
                .eq('stage_id', currentStage.id)
                .eq('is_active', true);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting required documents:', error);
            return [];
        }
    }

    /**
     * Get next possible stages
     */
    private async getNextPossibleStages(currentStageId: string | undefined): Promise<WorkflowStage[]> {
        try {
            if (!currentStageId) {
                // If no current stage, return first stage
                const stages = await workflowStageService.getWorkflowStages();
                return stages.filter(s => s.stage_order === 1);
            }

            const currentStage = await workflowStageService.getWorkflowStageById(currentStageId);
            if (!currentStage) return [];

            const allStages = await workflowStageService.getWorkflowStages();

            // Return current stage and next stages
            return allStages.filter(s => s.stage_order >= currentStage.stage_order);
        } catch (error) {
            console.error('Error getting next possible stages:', error);
            return [];
        }
    }

    /**
     * Validate current workflow state
     */
    private async validateWorkflowState(project: Project): Promise<WorkflowValidation> {
        const validation: WorkflowValidation = {
            isValid: true,
            errors: [],
            warnings: [],
            requiredActions: []
        };

        try {
            // Check if project has required contacts
            if (!project.point_of_contacts || project.point_of_contacts.length === 0) {
                validation.errors.push('Project must have at least one point of contact');
                validation.isValid = false;
            }

            // Check if current stage exists
            if (project.current_stage_id) {
                const currentStage = await workflowStageService.getWorkflowStageById(project.current_stage_id);
                if (!currentStage) {
                    validation.errors.push('Current stage is invalid');
                    validation.isValid = false;
                }
            }

            // Check for overdue items
            if (project.estimated_delivery_date) {
                const dueDate = new Date(project.estimated_delivery_date);
                const now = new Date();
                if (dueDate < now && project.status === 'active') {
                    validation.warnings.push('Project is overdue');
                }
            }

            // Check for required documents
            const workflowState = await this.getProjectWorkflowState(project.id);
            if (workflowState?.requiredDocuments.length) {
                const uploadedDocs = await this.getUploadedDocuments(project.id);
                const missingDocs = workflowState.requiredDocuments.filter(req =>
                    !uploadedDocs.some(doc => doc.category === req.document_type)
                );

                if (missingDocs.length > 0) {
                    validation.warnings.push(`${missingDocs.length} required documents missing`);
                    validation.requiredActions.push('Upload missing required documents');
                }
            }

        } catch (error) {
            console.error('Error validating workflow state:', error);
            validation.errors.push('Workflow validation failed');
            validation.isValid = false;
        }

        return validation;
    }

    /**
     * Initialize sub-stage progress for a new stage
     */
    private async initializeSubStageProgress(projectId: string, stageId: string): Promise<void> {
        try {
            // Get sub-stages for the stage
            const { data: subStages, error } = await supabase
                .from('workflow_sub_stages')
                .select('*')
                .eq('workflow_stage_id', stageId)
                .eq('is_active', true)
                .order('sub_stage_order', { ascending: true });

            if (error) throw error;

            if (subStages && subStages.length > 0) {
                // Initialize progress for each sub-stage
                const progressEntries = subStages.map(subStage => ({
                    organization_id: '', // Will be set by RLS
                    project_id: projectId,
                    workflow_stage_id: stageId,
                    sub_stage_id: subStage.id,
                    status: 'pending' as const,
                    started_at: null,
                    completed_at: null,
                    assigned_to: null,
                    notes: null,
                    metadata: {}
                }));

                const { error: insertError } = await supabase
                    .from('project_sub_stage_progress')
                    .insert(progressEntries);

                if (insertError) throw insertError;
            }
        } catch (error) {
            console.error('Error initializing sub-stage progress:', error);
        }
    }

    /**
     * Log workflow events
     */
    private async logWorkflowEvent(event: WorkflowEvent): Promise<void> {
        try {
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    organization_id: '', // Will be set by RLS
                    user_id: event.userId,
                    project_id: event.projectId,
                    entity_type: 'project',
                    entity_id: event.projectId,
                    action: event.eventType,
                    description: `${event.eventType.replace('_', ' ')}: ${JSON.stringify(event.data)}`,
                    old_values: {},
                    new_values: event.data,
                    metadata: event.data,
                    ip_address: null,
                    user_agent: null
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error logging workflow event:', error);
        }
    }

    /**
     * Handle status-specific workflow actions
     */
    private async handleStatusChangeActions(projectId: string, newStatus: ProjectStatus): Promise<void> {
        try {
            switch (newStatus) {
                case 'completed':
                    await this.handleProjectCompletion(projectId);
                    break;
                case 'cancelled':
                    await this.handleProjectCancellation(projectId);
                    break;
                case 'on_hold':
                    await this.handleProjectHold(projectId);
                    break;
            }
        } catch (error) {
            console.error('Error handling status change actions:', error);
        }
    }

    /**
     * Handle document uploads
     */
    private async handleDocumentUploads(projectId: string, files: File[]): Promise<void> {
        try {
            // This would integrate with the document service
            // For now, just log the event
            console.log(`Handling ${files.length} document uploads for project ${projectId}`);
        } catch (error) {
            console.error('Error handling document uploads:', error);
        }
    }

    /**
     * Get uploaded documents for a project
     */
    private async getUploadedDocuments(projectId: string): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('project_id', projectId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting uploaded documents:', error);
            return [];
        }
    }

    /**
     * Handle project completion
     */
    private async handleProjectCompletion(projectId: string): Promise<void> {
        try {
            // Mark all sub-stages as completed
            const { error } = await supabase
                .from('project_sub_stage_progress')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('project_id', projectId)
                .eq('status', 'pending');

            if (error) throw error;

            console.log(`Project ${projectId} completion handled`);
        } catch (error) {
            console.error('Error handling project completion:', error);
        }
    }

    /**
     * Handle project cancellation
     */
    private async handleProjectCancellation(projectId: string): Promise<void> {
        try {
            // Cancel all pending approvals
            const { error: approvalError } = await supabase
                .from('approvals')
                .update({ status: 'cancelled' })
                .eq('project_id', projectId)
                .eq('status', 'pending');

            if (approvalError) throw approvalError;

            console.log(`Project ${projectId} cancellation handled`);
        } catch (error) {
            console.error('Error handling project cancellation:', error);
        }
    }

    /**
     * Handle project hold
     */
    private async handleProjectHold(projectId: string): Promise<void> {
        try {
            // Pause all active sub-stages
            const { error } = await supabase
                .from('project_sub_stage_progress')
                .update({ status: 'pending' })
                .eq('project_id', projectId)
                .eq('status', 'in_progress');

            if (error) throw error;

            console.log(`Project ${projectId} hold handled`);
        } catch (error) {
            console.error('Error handling project hold:', error);
        }
    }

    /**
     * Clear workflow cache
     */
    clearCache(projectId?: string): void {
        if (projectId) {
            this.workflowCache.delete(projectId);
        } else {
            this.workflowCache.clear();
        }
    }
}

// Export singleton instance
export const projectWorkflowService = new ProjectWorkflowService();
