import { useState, useEffect } from 'react';
import { WorkflowSubStage } from '@/types/project';
import { WorkflowSubStageService } from '@/services/workflowSubStageService';

interface UseWorkflowSubStagesOptions {
    stageId?: string;
    stageIds?: string[];
    enabled?: boolean;
}

export function useWorkflowSubStages(options: UseWorkflowSubStagesOptions = {}) {
    const { stageId, stageIds, enabled = true } = options;

    const [subStages, setSubStages] = useState<WorkflowSubStage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const fetchSubStages = async () => {
            try {
                setLoading(true);
                setError(null);

                let data: WorkflowSubStage[];

                if (stageId) {
                    data = await WorkflowSubStageService.getSubStagesByStageId(stageId);
                } else if (stageIds && stageIds.length > 0) {
                    data = await WorkflowSubStageService.getSubStagesByStageIds(stageIds);
                } else {
                    data = [];
                }

                setSubStages(data);
            } catch (err) {
                console.error('Error fetching workflow sub-stages:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch sub-stages');
                setSubStages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubStages();
    }, [stageId, stageIds, enabled]);

    return {
        subStages,
        loading,
        error,
        refetch: () => {
            // Trigger refetch by changing the dependency
            setSubStages([]);
            setError(null);
        }
    };
}
