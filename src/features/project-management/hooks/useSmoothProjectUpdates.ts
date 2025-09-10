import { useState, useEffect, useCallback, useRef } from 'react';
import { Project } from '@/types/project';
import { projectService } from '@/services/projectService';
import { useToast } from '@/shared/hooks/use-toast';

interface UseSmoothProjectUpdatesOptions {
    projectId: string;
    initialProject: Project;
    onUpdate?: (updatedProject: Project) => void;
    debounceMs?: number;
    enableOptimisticUpdates?: boolean;
}

interface UseSmoothProjectUpdatesReturn {
    project: Project;
    isUpdating: boolean;
    updateProject: (updates: Partial<Project>) => Promise<Project>;
    updateField: (field: keyof Project, value: any) => Promise<void>;
    refreshProject: () => Promise<void>;
}

export function useSmoothProjectUpdates({
    projectId,
    initialProject,
    onUpdate,
    debounceMs = 300,
    enableOptimisticUpdates = true
}: UseSmoothProjectUpdatesOptions): UseSmoothProjectUpdatesReturn {
    const [project, setProject] = useState<Project>(initialProject);
    const [isUpdating, setIsUpdating] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();
    const { toast } = useToast();

    // Update project with debouncing
    const updateProject = useCallback(async (updates: Partial<Project>): Promise<Project> => {
        setIsUpdating(true);

        try {
            // Apply optimistic update if enabled
            if (enableOptimisticUpdates) {
                setProject(prev => ({ ...prev, ...updates }));
            }

            // Debounce the actual API call
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            return new Promise((resolve, reject) => {
                debounceTimeoutRef.current = setTimeout(async () => {
                    try {
                        const updatedProject = await projectService.updateProject(projectId, updates);
                        setProject(updatedProject);
                        onUpdate?.(updatedProject);

                        toast({
                            title: "Project Updated",
                            description: "Changes have been saved successfully.",
                        });

                        resolve(updatedProject);
                    } catch (error) {
                        console.error('Error updating project:', error);

                        // Revert optimistic update on error
                        if (enableOptimisticUpdates) {
                            setProject(initialProject);
                        }

                        toast({
                            variant: "destructive",
                            title: "Update Failed",
                            description: error instanceof Error ? error.message : 'Failed to save changes.',
                        });

                        reject(error);
                    } finally {
                        setIsUpdating(false);
                    }
                }, debounceMs);
            });
        } catch (error) {
            setIsUpdating(false);
            throw error;
        }
    }, [projectId, onUpdate, debounceMs, enableOptimisticUpdates, toast, initialProject]);

    // Update a single field
    const updateField = useCallback(async (field: keyof Project, value: any): Promise<void> => {
        await updateProject({ [field]: value });
    }, [updateProject]);

    // Refresh project data
    const refreshProject = useCallback(async (): Promise<void> => {
        try {
            setIsUpdating(true);
            const freshProject = await projectService.getProjectById(projectId);
            setProject(freshProject);
            onUpdate?.(freshProject);
        } catch (error) {
            console.error('Error refreshing project:', error);
            toast({
                variant: "destructive",
                title: "Refresh Failed",
                description: "Failed to refresh project data.",
            });
        } finally {
            setIsUpdating(false);
        }
    }, [projectId, onUpdate, toast]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return {
        project,
        isUpdating,
        updateProject,
        updateField,
        refreshProject
    };
}
