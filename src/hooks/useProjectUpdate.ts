import { useState, useCallback } from 'react';
import { ProjectStage } from '@/types/project';
import { useProjects } from './useProjects';
import { useToast } from './use-toast';

export function useProjectUpdate(projectId: string) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [localStage, setLocalStage] = useState<ProjectStage | null>(null);
    const { updateProjectStage } = useProjects();
    const { toast } = useToast();

    const updateStatus = useCallback(async (newStage: ProjectStage) => {
        if (isUpdating) return false;

        console.log(`🔄 useProjectUpdate: Starting stage update for project ${projectId} to ${newStage}`);
        setIsUpdating(true);
        setLocalStage(newStage);

        try {
            // For now, we'll use the existing updateProjectStatusOptimistic but pass the stage
            // In a full implementation, this would update the current_stage field specifically
            const result = await updateProjectStage(projectId, newStage);
            console.log(`📊 useProjectUpdate: Stage update result for project ${projectId}:`, result);

            if (!result) {
                // Revert local stage on failure
                console.log(`❌ useProjectUpdate: Stage update failed for project ${projectId}, reverting local stage`);
                setLocalStage(null);
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: "Failed to update project stage. Please try again.",
                });
            } else {
                console.log(`✅ useProjectUpdate: Stage update successful for project ${projectId}`);
            }

            return result;
        } catch (error) {
            console.error('Error updating project stage:', error);
            setLocalStage(null);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred while updating the project stage.",
            });
            return false;
        } finally {
            setIsUpdating(false);
            // Clear local stage after a longer delay to ensure real-time updates have propagated
            setTimeout(() => {
                console.log(`🧹 useProjectUpdate: Clearing local stage for project ${projectId}`);
                setLocalStage(null);
            }, 2000);
        }
    }, [projectId, isUpdating, updateProjectStage, toast]);

    return {
        isUpdating,
        localStage,
        updateStatus,
        // Helper to get the effective stage (local or original)
        getEffectiveStage: (originalStage: ProjectStage) => localStage || originalStage
    };
}
