import { useState, useCallback } from 'react';
import { useProjectManagement } from './index';
import { useToast } from '@/shared/hooks/use-toast';

export function useProjectUpdate(projectId: string) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [localStageId, setLocalStageId] = useState<string | null>(null);
    const { updateProjectStage } = useProjectManagement();
    const { toast } = useToast();

    const updateStatus = useCallback(async (newStageId: string) => {
        if (isUpdating) return false;

        // Validate input
        if (!projectId || !newStageId) {
            toast({
                variant: "destructive",
                title: "Invalid Parameters",
                description: "Project ID and stage ID are required.",
            });
            return false;
        }

        console.log(`🔄 useProjectUpdate: Starting stage update for project ${projectId} to stage ${newStageId}`);
        setIsUpdating(true);
        setLocalStageId(newStageId);

        try {
            // Use the updated updateProjectStage function that expects stage ID
            const result = await updateProjectStage(projectId, newStageId);

            if (result.isValid) {
                toast({
                    title: "Stage Updated",
                    description: "Project stage has been updated successfully.",
                });
                return true;
            } else {
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: result.message,
                });
                return false;
            }
        } catch (error) {
            console.error('Error updating project stage:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
            });
            return false;
        } finally {
            setIsUpdating(false);
            setLocalStageId(null);
        }
    }, [projectId, updateProjectStage, toast, isUpdating]);

    return {
        updateStatus,
        isUpdating,
        localStageId
    };
}
