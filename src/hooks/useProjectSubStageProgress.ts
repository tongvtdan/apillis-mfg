import { useState, useEffect } from 'react';
import { ProjectSubStageProgress } from '@/types/project';
import { WorkflowSubStageService } from '@/services/workflowSubStageService';

interface UseProjectSubStageProgressOptions {
    projectId?: string;
    enabled?: boolean;
}

export function useProjectSubStageProgress(options: UseProjectSubStageProgressOptions = {}) {
    const { projectId, enabled = true } = options;

    const [progress, setProgress] = useState<ProjectSubStageProgress[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !projectId) return;

        const fetchProgress = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await WorkflowSubStageService.getProjectSubStageProgress(projectId);
                setProgress(data);
            } catch (err) {
                console.error('Error fetching project sub-stage progress:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch progress');
                setProgress([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [projectId, enabled]);

    return {
        progress,
        loading,
        error,
        refetch: () => {
            // Trigger refetch by changing the dependency
            setProgress([]);
            setError(null);
        }
    };
}
