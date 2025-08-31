import { useQuery } from '@tanstack/react-query';
import { workflowStageService } from '@/services/workflowStageService';
import type { WorkflowStage } from '@/types/project';

export function useWorkflowStages() {
    return useQuery<WorkflowStage[], Error>({
        queryKey: ['workflow-stages'],
        queryFn: () => workflowStageService.getWorkflowStages(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    });
}

export function useWorkflowStageById(stageId: string | undefined) {
    return useQuery<WorkflowStage | null, Error>({
        queryKey: ['workflow-stage', stageId],
        queryFn: () => stageId ? workflowStageService.getWorkflowStageById(stageId) : Promise.resolve(null),
        enabled: !!stageId,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useWorkflowStageByName(stageName: string | undefined) {
    return useQuery<WorkflowStage | null, Error>({
        queryKey: ['workflow-stage-by-name', stageName],
        queryFn: () => stageName ? workflowStageService.getWorkflowStageByName(stageName) : Promise.resolve(null),
        enabled: !!stageName,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}