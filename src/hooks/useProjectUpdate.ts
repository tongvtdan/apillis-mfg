import { useState, useCallback } from 'react';
import { useProjects } from './useProjects';
import { useToast } from './use-toast';

export function useProjectUpdate(projectId: string) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [localStageId, setLocalStageId] = useState<string | null>(null);
    const { updateProjectStage } = useProjects();
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
            console.log(`📊 useProjectUpdate: Stage update result for project ${projectId}:`, result);

            if (!result.isValid) {
                // Revert local stage on failure
                console.log(`❌ useProjectUpdate: Stage update failed for project ${projectId}, reverting local stage`);
                setLocalStageId(null);
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: result.message || "Failed to update project stage. Please try again.",
                });
                return false;
            } else {
                console.log(`✅ useProjectUpdate: Stage update successful for project ${projectId}`);
                return true;
            }
        } catch (error) {
            console.error('Error updating project stage:', error);
            setLocalStageId(null);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while updating the project stage.';
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
            return false;
        } finally {
            setIsUpdating(false);
            // Clear local stage after a longer delay to ensure real-time updates have propagated
            setTimeout(() => {
                console.log(`🧹 useProjectUpdate: Clearing local stage for project ${projectId}`);
                setLocalStageId(null);
            }, 2000);
        }
    }, [projectId, isUpdating, updateProjectStage, toast]);

    return {
        isUpdating,
        localStageId,
        updateStatus,
        // Helper to get the effective stage ID (local or original)
        getEffectiveStageId: (originalStageId: string | null) => localStageId || originalStageId
    };
}
