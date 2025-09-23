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

    const updateProgress = async (subStageId: string, updates: Partial<ProjectSubStageProgress>) => {
        try {
            setLoading(true);
            await WorkflowSubStageService.updateSubStageProgress(subStageId, updates);

            setProgress(prev =>
                prev.map(item =>
                    item.id === subStageId
                        ? { ...item, ...updates }
                        : item
                )
            );
        } catch (err) {
            console.error('Error updating progress:', err);
            setError(err instanceof Error ? err.message : 'Failed to update progress');
        } finally {
            setLoading(false);
        }
    };

    return {
        progress,
        loading,
        error,
        updateProgress
    };
}
