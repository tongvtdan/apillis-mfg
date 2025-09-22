import { supabase } from '@/integrations/supabase/client';
import { 
    WorkflowDefinition, 
    WorkflowDefinitionStage, 
    WorkflowDefinitionSubStage,
    WorkflowStage,
    WorkflowSubStage
} from '../types/project';

class WorkflowDefinitionService {
    private cache = new Map<string, any>();
    private cacheTimestamps = new Map<string, number>();
    private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

    /**
     * Get default workflow definition for organization
     */
    async getDefaultWorkflowDefinition(organizationId: string): Promise<WorkflowDefinition | null> {
        const cacheKey = `default_definition_${organizationId}`;
        const now = Date.now();

        // Check cache
        if (this.cache.has(cacheKey) && 
            (now - (this.cacheTimestamps.get(cacheKey) || 0)) < this.CACHE_DURATION) {
            return this.cache.get(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('workflow_definitions')
                .select('*')
                .eq('organization_id', organizationId)
                .eq('name', 'Default Manufacturing Workflow')
                .eq('is_active', true)
                .single();

            if (error) throw error;

            // Cache the result
            this.cache.set(cacheKey, data || null);
            this.cacheTimestamps.set(cacheKey, now);

            return data || null;
        } catch (error) {
            console.error('Error fetching default workflow definition:', error);
            return null;
        }
    }

    /**
     * Get workflow definition by ID
     */
    async getWorkflowDefinitionById(id: string): Promise<WorkflowDefinition | null> {
        const cacheKey = `definition_${id}`;
        const now = Date.now();

        // Check cache
        if (this.cache.has(cacheKey) && 
            (now - (this.cacheTimestamps.get(cacheKey) || 0)) < this.CACHE_DURATION) {
            return this.cache.get(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('workflow_definitions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Cache the result
            this.cache.set(cacheKey, data || null);
            this.cacheTimestamps.set(cacheKey, now);

            return data || null;
        } catch (error) {
            console.error('Error fetching workflow definition:', error);
            return null;
        }
    }

    /**
     * Get workflow definition stages with overrides
     */
    async getWorkflowDefinitionStages(workflowDefinitionId: string): Promise<WorkflowDefinitionStage[]> {
        const cacheKey = `definition_stages_${workflowDefinitionId}`;
        const now = Date.now();

        // Check cache
        if (this.cache.has(cacheKey) && 
            (now - (this.cacheTimestamps.get(cacheKey) || 0)) < this.CACHE_DURATION) {
            return this.cache.get(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('workflow_definition_stages')
                .select(`
                    *,
                    workflow_stage:workflow_stages(*)
                `)
                .eq('workflow_definition_id', workflowDefinitionId)
                .eq('is_included', true)
                .order('stage_order_override');

            if (error) throw error;

            // Cache the result
            this.cache.set(cacheKey, data || []);
            this.cacheTimestamps.set(cacheKey, now);

            return data || [];
        } catch (error) {
            console.error('Error fetching workflow definition stages:', error);
            return [];
        }
    }

    /**
     * Get workflow definition sub-stages with overrides
     */
    async getWorkflowDefinitionSubStages(workflowDefinitionId: string): Promise<WorkflowDefinitionSubStage[]> {
        const cacheKey = `definition_substages_${workflowDefinitionId}`;
        const now = Date.now();

        // Check cache
        if (this.cache.has(cacheKey) && 
            (now - (this.cacheTimestamps.get(cacheKey) || 0)) < this.CACHE_DURATION) {
            return this.cache.get(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('workflow_definition_sub_stages')
                .select(`
                    *,
                    workflow_sub_stage:workflow_sub_stages(*)
                `)
                .eq('workflow_definition_id', workflowDefinitionId)
                .eq('is_included', true)
                .order('sub_stage_order_override');

            if (error) throw error;

            // Cache the result
            this.cache.set(cacheKey, data || []);
            this.cacheTimestamps.set(cacheKey, now);

            return data || [];
        } catch (error) {
            console.error('Error fetching workflow definition sub-stages:', error);
            return [];
        }
    }

    /**
     * Create a new workflow definition
     */
    async createWorkflowDefinition(definitionData: {
        organization_id: string;
        name: string;
        version: number;
        description?: string;
        is_active?: boolean;
        created_by?: string;
    }): Promise<WorkflowDefinition | null> {
        try {
            const { data, error } = await supabase
                .from('workflow_definitions')
                .insert([{
                    ...definitionData,
                    is_active: definitionData.is_active ?? true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            // Clear relevant caches
            this.clearOrganizationCache(definitionData.organization_id);

            return data || null;
        } catch (error) {
            console.error('Error creating workflow definition:', error);
            return null;
        }
    }

    /**
     * Update an existing workflow definition
     */
    async updateWorkflowDefinition(id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition | null> {
        try {
            const { data, error } = await supabase
                .from('workflow_definitions')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Clear relevant caches
            this.cache.delete(`definition_${id}`);
            this.cacheTimestamps.delete(`definition_${id}`);

            return data || null;
        } catch (error) {
            console.error('Error updating workflow definition:', error);
            return null;
        }
    }

    /**
     * Link workflow stages to a workflow definition
     */
    async linkStagesToDefinition(workflowDefinitionId: string, stageIds: string[]): Promise<boolean> {
        try {
            // Get existing links
            const { data: existingLinks } = await supabase
                .from('workflow_definition_stages')
                .select('workflow_stage_id')
                .eq('workflow_definition_id', workflowDefinitionId);

            const existingStageIds = existingLinks?.map(link => link.workflow_stage_id) || [];
            
            // Determine which stages to add/remove
            const stagesToAdd = stageIds.filter(id => !existingStageIds.includes(id));
            const stagesToRemove = existingStageIds.filter(id => !stageIds.includes(id));

            // Add new stage links
            if (stagesToAdd.length > 0) {
                const insertData = stagesToAdd.map(stageId => ({
                    workflow_definition_id: workflowDefinitionId,
                    workflow_stage_id: stageId,
                    is_included: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));

                const { error: insertError } = await supabase
                    .from('workflow_definition_stages')
                    .insert(insertData);

                if (insertError) throw insertError;
            }

            // Remove old stage links
            if (stagesToRemove.length > 0) {
                const { error: deleteError } = await supabase
                    .from('workflow_definition_stages')
                    .delete()
                    .match({
                        workflow_definition_id: workflowDefinitionId
                    })
                    .in('workflow_stage_id', stagesToRemove);

                if (deleteError) throw deleteError;
            }

            // Clear cache
            this.cache.clear();
            this.cacheTimestamps.clear();

            return true;
        } catch (error) {
            console.error('Error linking stages to workflow definition:', error);
            return false;
        }
    }

    /**
     * Apply workflow definition overrides to base stages
     */
    async applyDefinitionOverrides(
        workflowDefinitionId: string, 
        baseStages: WorkflowStage[]
    ): Promise<WorkflowStage[]> {
        try {
            // Get definition stage overrides
            const definitionStages = await this.getWorkflowDefinitionStages(workflowDefinitionId);
            
            // Apply overrides to base stages
            return baseStages.map(baseStage => {
                const override = definitionStages.find(defStage => 
                    defStage.workflow_stage_id === baseStage.id
                );
                
                if (override) {
                    return {
                        ...baseStage,
                        stage_order: override.stage_order_override ?? baseStage.stage_order,
                        responsible_roles: override.responsible_roles_override ?? baseStage.responsible_roles,
                        estimated_duration_days: override.estimated_duration_days_override ?? baseStage.estimated_duration_days,
                    };
                }
                
                return baseStage;
            });
        } catch (error) {
            console.error('Error applying definition overrides:', error);
            return baseStages;
        }
    }

    /**
     * Clear cache for an organization
     */
    private clearOrganizationCache(organizationId: string): void {
        // Clear all cache entries for this organization
        const keysToDelete: string[] = [];
        
        for (const [key] of this.cache) {
            if (key.includes(organizationId)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.cacheTimestamps.delete(key);
        });
    }

    /**
     * Clear all cache
     */
    clearCache(): void {
        this.cache.clear();
        this.cacheTimestamps.clear();
    }
}

// Export singleton instance
export const workflowDefinitionService = new WorkflowDefinitionService();