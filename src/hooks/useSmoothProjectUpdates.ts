import { useState, useEffect, useCallback, useRef } from 'react';
import { Project } from '@/types/project';
import { projectService } from '@/services/projectService';
import { useToast } from '@/hooks/use-toast';

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
    const [pendingUpdates, setPendingUpdates] = useState<Partial<Project>>({});
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateRef = useRef<number>(0);
    const { toast } = useToast();

    // Update local project when initial project changes (from real-time updates)
    useEffect(() => {
        setProject(initialProject);
    }, [initialProject]);

    // Debounced function to sync pending updates
    const syncPendingUpdates = useCallback(async () => {
        if (Object.keys(pendingUpdates).length === 0) return;

        const updates = { ...pendingUpdates };
        setPendingUpdates({});

        try {
            const updatedProject = await projectService.updateProject(projectId, updates);
            setProject(updatedProject);
            onUpdate?.(updatedProject);

            toast({
                title: "Project Updated",
                description: "Project has been updated successfully.",
            });
        } catch (error) {
            console.error('Failed to sync pending updates:', error);

            // Rollback optimistic updates on error
            setProject(initialProject);

            toast({
                title: "Update Failed",
                description: error instanceof Error ? error.message : "Failed to update project",
                variant: "destructive",
            });
        }
    }, [projectId, pendingUpdates, onUpdate, initialProject, toast]);

    // Schedule debounced sync
    const scheduleSync = useCallback(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            syncPendingUpdates();
        }, debounceMs);
    }, [syncPendingUpdates, debounceMs]);

    // Update project with optimistic updates
    const updateProject = useCallback(async (updates: Partial<Project>): Promise<Project> => {
        setIsUpdating(true);
        lastUpdateRef.current = Date.now();

        // Optimistic update
        if (enableOptimisticUpdates) {
            const optimisticProject = {
                ...project,
                ...updates,
                updated_at: new Date().toISOString()
            };
            setProject(optimisticProject);
        }

        // Add to pending updates
        setPendingUpdates(prev => ({ ...prev, ...updates }));

        // Schedule sync
        scheduleSync();

        // Return optimistic project immediately
        const optimisticProject = {
            ...project,
            ...updates,
            updated_at: new Date().toISOString()
        };

        setIsUpdating(false);
        return optimisticProject;
    }, [project, enableOptimisticUpdates, scheduleSync]);

    // Update single field
    const updateField = useCallback(async (field: keyof Project, value: any): Promise<void> => {
        await updateProject({ [field]: value });
    }, [updateProject]);

    // Refresh project from server
    const refreshProject = useCallback(async (): Promise<void> => {
        try {
            const freshProject = await projectService.getProjectById(projectId);
            if (freshProject) {
                setProject(freshProject);
                onUpdate?.(freshProject);
            }
        } catch (error) {
            console.error('Failed to refresh project:', error);
            toast({
                title: "Refresh Failed",
                description: "Failed to refresh project data",
                variant: "destructive",
            });
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

    // Force sync any pending updates when component unmounts
    useEffect(() => {
        return () => {
            if (Object.keys(pendingUpdates).length > 0) {
                syncPendingUpdates();
            }
        };
    }, [syncPendingUpdates, pendingUpdates]);

    return {
        project,
        isUpdating,
        updateProject,
        updateField,
        refreshProject
    };
}
