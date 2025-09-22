import { supabase } from '@/integrations/supabase/client';
import { WorkflowSubStage, ProjectSubStageProgress } from '../types/project';

export class WorkflowSubStageService {
    /**
     * Get all sub-stages for a specific workflow stage
     */
    static async getSubStagesByStageId(stageId: string): Promise<WorkflowSubStage[]> {
        const { data, error } = await supabase
            .from('workflow_sub_stages')
            .select('*')
            .eq('workflow_stage_id', stageId)
            .eq('is_active', true)
            .order('sub_stage_order');

        if (error) {
            throw new Error(`Failed to fetch sub-stages: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get all sub-stages for multiple workflow stages
     */
    static async getSubStagesByStageIds(stageIds: string[]): Promise<WorkflowSubStage[]> {
        const { data, error } = await supabase
            .from('workflow_sub_stages')
            .select('*')
            .in('workflow_stage_id', stageIds)
            .eq('is_active', true)
            .order('workflow_stage_id, sub_stage_order');

        if (error) {
            throw new Error(`Failed to fetch sub-stages: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get sub-stage progress for a project
     */
    static async getProjectSubStageProgress(projectId: string): Promise<ProjectSubStageProgress[]> {
        const { data, error } = await supabase
            .from('project_sub_stage_progress')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at');

        if (error) {
            throw new Error(`Failed to fetch sub-stage progress: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Update sub-stage progress status
     */
    static async updateSubStageProgress(
        progressId: string,
        updates: Partial<ProjectSubStageProgress>
    ): Promise<ProjectSubStageProgress> {
        const { data, error } = await supabase
            .from('project_sub_stage_progress')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', progressId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update sub-stage progress: ${error.message}`);
        }

        return data;
    }

    /**
     * Create sub-stage progress for a project
     */
    static async createSubStageProgress(
        progress: Omit<ProjectSubStageProgress, 'id' | 'created_at' | 'updated_at'>
    ): Promise<ProjectSubStageProgress> {
        const { data, error } = await supabase
            .from('project_sub_stage_progress')
            .insert(progress)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create sub-stage progress: ${error.message}`);
        }

        return data;
    }

    /**
     * Get sub-stage with its progress for a project
     */
    static async getSubStageWithProgress(
        subStageId: string,
        projectId: string
    ): Promise<{ subStage: WorkflowSubStage; progress?: ProjectSubStageProgress }> {
        // Get sub-stage
        const { data: subStage, error: subStageError } = await supabase
            .from('workflow_sub_stages')
            .select('*')
            .eq('id', subStageId)
            .single();

        if (subStageError) {
            throw new Error(`Failed to fetch sub-stage: ${subStageError.message}`);
        }

        // Get progress
        const { data: progress, error: progressError } = await supabase
            .from('project_sub_stage_progress')
            .select('*')
            .eq('sub_stage_id', subStageId)
            .eq('project_id', projectId)
            .single();

        if (progressError && !progressError.message.includes('No rows found')) {
            throw new Error(`Failed to fetch sub-stage progress: ${progressError.message}`);
        }

        return {
            subStage,
            progress: progress || undefined
        };
    }

    /**
     * Check if all required sub-stages are completed for a workflow stage
     */
    static async isStageCompleted(projectId: string, stageId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('project_sub_stage_progress')
            .select(`
                sub_stage_id,
                status,
                workflow_sub_stages!inner(is_required)
            `)
            .eq('project_id', projectId)
            .eq('workflow_stage_id', stageId);

        if (error) {
            throw new Error(`Failed to check stage completion: ${error.message}`);
        }

        const requiredSubStages = data.filter(item => item.workflow_sub_stages.is_required);
        const completedRequiredSubStages = requiredSubStages.filter(
            item => item.status === 'completed' || item.status === 'skipped'
        );

        return requiredSubStages.length > 0 && requiredSubStages.length === completedRequiredSubStages.length;
    }

    /**
     * Get next available sub-stage for a project
     */
    static async getNextSubStage(projectId: string, stageId: string): Promise<WorkflowSubStage | null> {
        const { data, error } = await supabase
            .from('project_sub_stage_progress')
            .select(`
                sub_stage_id,
                status,
                workflow_sub_stages!inner(*)
            `)
            .eq('project_id', projectId)
            .eq('workflow_stage_id', stageId)
            .order('workflow_sub_stages.sub_stage_order');

        if (error) {
            throw new Error(`Failed to get next sub-stage: ${error.message}`);
        }

        const pendingSubStage = data.find(item =>
            item.status === 'pending' || item.status === 'in_progress'
        );

        return pendingSubStage?.workflow_sub_stages || null;
    }

    /**
     * Auto-advance project to next sub-stage if conditions are met
     */
    static async autoAdvanceSubStage(projectId: string, stageId: string): Promise<void> {
        const currentProgress = await this.getProjectSubStageProgress(projectId);
        const stageProgress = currentProgress.filter(p => p.workflow_stage_id === stageId);

        for (const progress of stageProgress) {
            if (progress.status === 'in_progress') {
                const { data: subStage } = await supabase
                    .from('workflow_sub_stages')
                    .select('auto_advance, estimated_duration_hours')
                    .eq('id', progress.sub_stage_id)
                    .single();

                if (subStage?.auto_advance && progress.started_at) {
                    const startTime = new Date(progress.started_at);
                    const estimatedDuration = subStage.estimated_duration_hours || 0;
                    const expectedCompletion = new Date(startTime.getTime() + (estimatedDuration * 60 * 60 * 1000));

                    if (new Date() >= expectedCompletion) {
                        await this.updateSubStageProgress(progress.id, {
                            status: 'completed',
                            completed_at: new Date().toISOString()
                        });
                    }
                }
            }
        }
    }
}
