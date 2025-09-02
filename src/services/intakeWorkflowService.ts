import { supabase } from '@/integrations/supabase/client';
import { IntakeMappingService } from './intakeMappingService';

export class IntakeWorkflowService {
    /**
     * Get the initial stage ID for an intake type
     */
    static async getInitialStageId(intakeType: string, organizationId: string): Promise<string | null> {
        try {
            const stageSlug = IntakeMappingService.getInitialStageSlug(intakeType);

            const { data, error } = await supabase
                .from('workflow_stages')
                .select('id')
                .eq('organization_id', organizationId)
                .eq('slug', stageSlug)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('Error getting initial stage:', error);
                return null;
            }

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
            const { data, error } = await supabase
                .from('workflow_stages')
                .select('id')
                .eq('organization_id', organizationId)
                .eq('is_active', true)
                .order('stage_order', { ascending: true })
                .limit(1)
                .single();

            if (error) {
                console.error('Error getting first stage:', error);
                return null;
            }

            return data?.id || null;
        } catch (error) {
            console.error('Error getting first stage:', error);
            return null;
        }
    }
}
