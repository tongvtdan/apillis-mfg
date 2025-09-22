import { supabase } from '@/integrations/supabase/client';
import { IntakeMappingService } from './intakeMappingService';
import { workflowStageService } from './workflowStageService';

export class IntakeWorkflowService {
    /**
     * Get the initial stage ID for an intake type
     */
    static async getInitialStageId(intakeType: string, organizationId: string): Promise<string | null> {
        try {
            const stageSlug = IntakeMappingService.getInitialStageSlug(intakeType);
            console.log('🔍 Looking up stage with slug:', stageSlug, 'for organization:', organizationId);

            // Check if stage exists first
            const { data: existingStage, error: stageError } = await supabase
                .from('workflow_stages')
                .select('id')
                .eq('organization_id', organizationId)
                .eq('slug', stageSlug)
                .eq('is_active', true)
                .single();

            if (!stageError && existingStage?.id) {
                console.log('✅ Found existing stage ID:', existingStage.id);
                return existingStage.id;
            }

            // If not found, try to initialize default stages
            console.log('🔄 Stage not found, attempting to initialize default stages...');
            const initialized = await workflowStageService.initializeDefaultStages(organizationId);
            if (!initialized) {
                console.error('❌ Failed to initialize default workflow stages');
                return null;
            }

            // Try to get the stage again after initialization
            const { data, error } = await supabase
                .from('workflow_stages')
                .select('id')
                .eq('organization_id', organizationId)
                .eq('slug', stageSlug)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('Error getting initial stage after initialization:', error);
                return null;
            }

            console.log('✅ Found stage ID after initialization:', data?.id);
            return data?.id || null;
        } catch (error) {
            console.error('Error getting initial stage:', error);
            return null;
        }
    }

    /**
     * Get the first available stage as fallback
     */
    static async getFirstAvailableStage(organizationId: string): Promise<string | null> {
        try {
            console.log('🔍 Looking up first available stage for organization:', organizationId);

            // Check if any stages exist first
            const { data: existingStages, error: checkError } = await supabase
                .from('workflow_stages')
                .select('id')
                .eq('organization_id', organizationId)
                .eq('is_active', true)
                .order('stage_order', { ascending: true })
                .limit(1);

            if (!checkError && existingStages && existingStages.length > 0) {
                console.log('✅ Found existing first stage ID:', existingStages[0].id);
                return existingStages[0].id;
            }

            // If not found, try to initialize default stages
            console.log('🔄 No stages found, attempting to initialize default stages...');
            const initialized = await workflowStageService.initializeDefaultStages(organizationId);
            if (!initialized) {
                console.error('❌ Failed to initialize default workflow stages');
                return null;
            }

            // Try to get the first stage again after initialization
            const { data, error } = await supabase
                .from('workflow_stages')
                .select('id')
                .eq('organization_id', organizationId)
                .eq('is_active', true)
                .order('stage_order', { ascending: true })
                .limit(1);

            if (error || !data || data.length === 0) {
                console.error('Error getting first stage after initialization:', error);
                return null;
            }

            console.log('✅ Found first stage ID after initialization:', data[0].id);
            return data[0].id;
        } catch (error) {
            console.error('Error getting first stage:', error);
            return null;
        }
    }
}