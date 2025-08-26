import { useCallback, useEffect, useState } from 'react';
import { Project, ProjectStatus } from '@/types/project';
import { WorkflowValidator } from '@/lib/workflow-validator';
import { useProjects } from './useProjects';
import { useToast } from './use-toast';

export function useWorkflowAutoAdvance(project: Project) {
    const [isChecking, setIsChecking] = useState(false);
    const [autoAdvanceAvailable, setAutoAdvanceAvailable] = useState(false);
    const [nextStage, setNextStage] = useState<ProjectStatus | null>(null);
    const [autoAdvanceReason, setAutoAdvanceReason] = useState<string>('');
    const { updateProjectStatusOptimistic } = useProjects();
    const { toast } = useToast();

    const checkAutoAdvance = useCallback(async () => {
        if (isChecking) return;

        setIsChecking(true);
        try {
            const result = await WorkflowValidator.checkAndAutoAdvance(project);

            setAutoAdvanceAvailable(result.shouldAdvance);
            setNextStage(result.nextStage);
            setAutoAdvanceReason(result.reason);
        } catch (error) {
            console.error('Error checking auto-advance:', error);
        } finally {
            setIsChecking(false);
        }
    }, [project, isChecking]);

    const executeAutoAdvance = useCallback(async () => {
        if (!nextStage || !autoAdvanceAvailable) return false;

        try {
            const success = await updateProjectStatusOptimistic(project.id, nextStage);

            if (success) {
                toast({
                    title: "Auto-Advance Executed",
                    description: `Project automatically advanced to ${nextStage}`,
                });

                // Reset state
                setAutoAdvanceAvailable(false);
                setNextStage(null);
                setAutoAdvanceReason('');

                return true;
            }
        } catch (error) {
            console.error('Error executing auto-advance:', error);
            toast({
                variant: "destructive",
                title: "Auto-Advance Failed",
                description: "Failed to automatically advance project. Please try manually.",
            });
        }

        return false;
    }, [nextStage, autoAdvanceAvailable, project.id, updateProjectStatusOptimistic, toast]);

    // Check auto-advance when project changes
    useEffect(() => {
        checkAutoAdvance();
    }, [project.status, checkAutoAdvance]);

    return {
        isChecking,
        autoAdvanceAvailable,
        nextStage,
        autoAdvanceReason,
        checkAutoAdvance,
        executeAutoAdvance
    };
}
