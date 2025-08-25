import { useState, useCallback } from 'react';
import { ProjectStatus } from '@/types/project';
import { useProjects } from './useProjects';
import { useToast } from './use-toast';

export function useProjectUpdate(projectId: string) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [localStatus, setLocalStatus] = useState<ProjectStatus | null>(null);
    const { updateProjectStatusOptimistic } = useProjects();
    const { toast } = useToast();

    const updateStatus = useCallback(async (newStatus: ProjectStatus) => {
        if (isUpdating) return false;

        setIsUpdating(true);
        setLocalStatus(newStatus);

        try {
            const result = await updateProjectStatusOptimistic(projectId, newStatus);

            if (!result) {
                // Revert local status on failure
                setLocalStatus(null);
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: "Failed to update project status. Please try again.",
                });
            }

            return result;
        } catch (error) {
            console.error('Error updating project status:', error);
            setLocalStatus(null);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred while updating the project.",
            });
            return false;
        } finally {
            setIsUpdating(false);
            // Clear local status after a short delay to allow for smooth transitions
            setTimeout(() => setLocalStatus(null), 1000);
        }
    }, [projectId, isUpdating, updateProjectStatusOptimistic, toast]);

    return {
        isUpdating,
        localStatus,
        updateStatus,
        // Helper to get the effective status (local or original)
        getEffectiveStatus: (originalStatus: ProjectStatus) => localStatus || originalStatus
    };
}
