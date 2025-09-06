import { WorkflowStage, ProjectStage, STAGE_NAME_TO_LEGACY, LEGACY_TO_STAGE_NAME } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

class WorkflowStageService {
    private cachedStages: WorkflowStage[] | null = null;
    private cacheTimestamp: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Get all workflow stages from database
    async getWorkflowStages(forceRefresh = false): Promise<WorkflowStage[]> {
        const now = Date.now();

        // Return cached data if still valid
        if (!forceRefresh && this.cachedStages && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
            console.log('Returning cached workflow stages');
            return this.cachedStages;
        }

        try {
            const { data: userData } = await supabase.auth.getUser();
            const organizationId = userData.user?.user_metadata?.organization_id;

            let query = supabase
                .from('workflow_stages')
                .select('*')
                .eq('is_active', true);

            // Filter by organization if available
            if (organizationId) {
                query = query.eq('organization_id', organizationId);
            }

            const { data, error } = await query.order('stage_order', { ascending: true });

            if (error) {
                console.error('Error fetching workflow stages:', error);
                throw new Error(`Failed to fetch workflow stages: ${error.message}`);
            }

            this.cachedStages = data || [];
            this.cacheTimestamp = now;

            console.log('Fetched workflow stages:', this.cachedStages);
            return this.cachedStages;
        } catch (error) {
            console.error('Error in getWorkflowStages:', error);
            // Return empty array as fallback
            return [];
        }
    }

    // Get workflow stage by ID
    async getWorkflowStageById(id: string): Promise<WorkflowStage | null> {
        const stages = await this.getWorkflowStages();
        return stages.find(stage => stage.id === id) || null;
    }

    // Get workflow stage by name
    async getWorkflowStageByName(name: string): Promise<WorkflowStage | null> {
        const stages = await this.getWorkflowStages();
        return stages.find(stage => stage.name === name) || null;
    }

    // Update estimated duration days for a workflow stage
    async updateStageEstimatedDuration(stageId: string, estimatedDurationDays: number): Promise<WorkflowStage | null> {
        try {
            const { data, error } = await supabase
                .from('workflow_stages')
                .update({
                    estimated_duration_days: estimatedDurationDays,
                    updated_at: new Date().toISOString()
                })
                .eq('id', stageId)
                .select()
                .single();

            if (error) {
                console.error('Error updating workflow stage duration:', error);
                throw new Error(`Failed to update workflow stage duration: ${error.message}`);
            }

            // Clear cache to force refresh on next fetch
            this.clearCache();

            return data;
        } catch (error) {
            console.error('Error in updateStageEstimatedDuration:', error);
            return null;
        }
    }

    // Update multiple stage durations at once
    async updateMultipleStageDurations(stageDurations: { stageId: string; duration: number }[]): Promise<boolean> {
        try {
            const updates = stageDurations.map(async ({ stageId, duration }) => {
                return await supabase
                    .from('workflow_stages')
                    .update({
                        estimated_duration_days: duration,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', stageId);
            });

            const results = await Promise.all(updates);

            // Check if any update failed
            const hasError = results.some(result => result.error);

            if (hasError) {
                const errors = results.filter(result => result.error).map(result => result.error?.message);
                console.error('Some updates failed:', errors);
            }

            // Clear cache to force refresh on next fetch
            this.clearCache();

            return !hasError;
        } catch (error) {
            console.error('Error in updateMultipleStageDurations:', error);
            return false;
        }
    }

    // Convert legacy ProjectStage enum to workflow stage ID
    async legacyStageToId(legacyStage: ProjectStage): Promise<string | null> {
        const stageName = LEGACY_TO_STAGE_NAME[legacyStage];
        if (!stageName) return null;

        const stage = await this.getWorkflowStageByName(stageName);
        return stage?.id || null;
    }

    // Convert workflow stage ID to legacy ProjectStage enum
    async idToLegacyStage(stageId: string): Promise<ProjectStage | null> {
        const stage = await this.getWorkflowStageById(stageId);
        if (!stage) return null;

        return STAGE_NAME_TO_LEGACY[stage.name] || null;
    }

    // Get stage color for UI (with fallback to legacy colors)
    getStageColor(stage: WorkflowStage | ProjectStage | string): string {
        // If it's a WorkflowStage object, try to map to legacy color
        if (typeof stage === 'object' && 'name' in stage) {
            const legacyStage = STAGE_NAME_TO_LEGACY[stage.name];
            if (legacyStage) {
                return this.getLegacyStageColor(legacyStage);
            }
            return 'bg-gray-100 text-gray-800'; // Default color
        }

        // If it's a legacy ProjectStage enum
        if (typeof stage === 'string') {
            return this.getLegacyStageColor(stage as ProjectStage);
        }

        return 'bg-gray-100 text-gray-800'; // Default color
    }

    private getLegacyStageColor(stage: ProjectStage): string {
        const colors: Record<ProjectStage, string> = {
            inquiry_received: 'bg-blue-100 text-blue-800',
            technical_review: 'bg-orange-100 text-orange-800',
            supplier_rfq_sent: 'bg-indigo-100 text-indigo-800',
            quoted: 'bg-green-100 text-green-800',
            order_confirmed: 'bg-purple-100 text-purple-800',
            procurement_planning: 'bg-yellow-100 text-yellow-800',
            in_production: 'bg-teal-100 text-teal-800',
            shipped_closed: 'bg-gray-100 text-gray-800'
        };

        return colors[stage] || 'bg-gray-100 text-gray-800';
    }

    // Get next stage in workflow
    async getNextStage(currentStageId: string): Promise<WorkflowStage | null> {
        const stages = await this.getWorkflowStages();
        const currentStage = stages.find(s => s.id === currentStageId);

        if (!currentStage) return null;

        const nextStage = stages.find(s => s.stage_order === currentStage.stage_order + 1);
        return nextStage || null;
    }

    // Get previous stage in workflow
    async getPreviousStage(currentStageId: string): Promise<WorkflowStage | null> {
        const stages = await this.getWorkflowStages();
        const currentStage = stages.find(s => s.id === currentStageId);

        if (!currentStage) return null;

        const previousStage = stages.find(s => s.stage_order === currentStage.stage_order - 1);
        return previousStage || null;
    }

    // Validate stage transition
    async validateStageTransition(fromStageId: string, toStageId: string): Promise<{
        isValid: boolean;
        message?: string;
        requiresApproval?: boolean;
    }> {
        const stages = await this.getWorkflowStages();
        const fromStage = stages.find(s => s.id === fromStageId);
        const toStage = stages.find(s => s.id === toStageId);

        if (!fromStage || !toStage) {
            return {
                isValid: false,
                message: 'Invalid stage ID provided'
            };
        }

        // Allow moving to next stage or same stage
        if (toStage.stage_order >= fromStage.stage_order) {
            // Check if skipping stages (requires approval)
            if (toStage.stage_order > fromStage.stage_order + 1) {
                return {
                    isValid: true,
                    message: 'Stage skipping requires manager approval',
                    requiresApproval: true
                };
            }

            return { isValid: true };
        }

        // Moving backwards requires approval
        return {
            isValid: true,
            message: 'Moving backwards in workflow requires manager approval',
            requiresApproval: true
        };
    }

    // Clear cache (useful for testing or when stages are updated)
    clearCache(): void {
        this.cachedStages = null;
        this.cacheTimestamp = 0;
    }
}

// Export singleton instance
export const workflowStageService = new WorkflowStageService();