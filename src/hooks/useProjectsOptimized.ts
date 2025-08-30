import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WorkflowValidator, WorkflowValidationResult } from '@/lib/workflow-validator';
import { cacheService } from '@/services/cacheService';
import { realtimeManager } from '@/lib/realtime-manager';
import { projectQueries, ProjectQueryOptions, generateProjectQueryKey } from '@/lib/project-queries';

export function useProjectsOptimized() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchProjects = async (forceRefresh = false, options?: ProjectQueryOptions) => {
        if (!user) {
            setProjects([]);
            setLoading(false);
            return;
        }

        try {
            // Check cache based on whether options are applied
            if (!forceRefresh) {
                if (options && Object.keys(options).length > 0) {
                    // Check query-specific cache for filtered results
                    const queryKey = generateProjectQueryKey('list', options);
                    if (cacheService.isQueryCacheValid(queryKey)) {
                        const cachedResult = cacheService.getQueryResult(queryKey);
                        if (cachedResult) {
                            setProjects(cachedResult);
                            setLoading(false);
                            return;
                        }
                    }
                } else {
                    // Check main cache for unfiltered results
                    if (cacheService.isCacheValid() && cacheService.validateCacheConsistency()) {
                        const cachedProjects = cacheService.getProjects();
                        if (cachedProjects) {
                            setProjects(cachedProjects);
                            setLoading(false);
                            return;
                        }
                    }
                }
            }

            setLoading(true);
            setError(null);

            // Use optimized query builder
            const { data, error: fetchError } = await projectQueries.getProjectsList(options || {});

            if (fetchError) {
                console.error('Error fetching projects:', fetchError);
                const errorMessage = fetchError.code === 'PGRST116'
                    ? 'Database connection error. Please check your connection and try again.'
                    : fetchError.message || 'Failed to fetch projects';
                setError(errorMessage);
                setLoading(false);
                return;
            }

            // Validate and transform the data
            const mappedProjects = (data || []).map(project => ({
                ...project,
                // Ensure required fields have proper defaults
                status: project.status || 'active',
                priority_level: project.priority_level || 'medium',
                source: project.source || 'portal',
                tags: project.tags || [],
                metadata: project.metadata || {},
                // Calculate days in stage if stage_entered_at exists
                days_in_stage: project.stage_entered_at
                    ? Math.floor((new Date().getTime() - new Date(project.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
                    : undefined
            }));

            setProjects(mappedProjects as Project[]);

            // Cache the data appropriately
            if (options && Object.keys(options).length > 0) {
                // Cache filtered results with query-specific key
                const queryKey = generateProjectQueryKey('list', options);
                cacheService.setQueryResult(queryKey, mappedProjects as Project[]);
            } else {
                // Cache full dataset in main cache
                cacheService.setProjects(mappedProjects as Project[]);
            }
        } catch (err) {
            console.error('Error in fetchProjects:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Set up real-time subscription
    useEffect(() => {
        fetchProjects();

        // Only subscribe to real-time updates on specific routes
        const shouldSubscribeToRealtime = window.location.pathname.includes('/projects/') ||
            window.location.pathname.includes('/project/') ||
            window.location.pathname === '/projects';

        if (!shouldSubscribeToRealtime) {
            return;
        }

        // Subscribe to the global real-time manager
        const unsubscribe = realtimeManager.subscribe(() => {
            // When we receive a notification, refetch projects to get the latest data
            fetchProjects();
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

    // Get project by ID with optimized query
    const getProjectById = async (id: string): Promise<Project | null> => {
        console.log('🔍 Fetching project with ID:', id);

        try {
            const { data, error } = await projectQueries.getProjectById(id);

            if (error) {
                console.error('❌ Error fetching project:', error);
                return null;
            }

            if (!data) {
                console.log('❌ No project found with ID:', id);
                return null;
            }

            console.log('✅ Successfully fetched project:', data.project_id);
            return data as Project;
        } catch (err) {
            console.error('❌ Unexpected error in getProjectById:', err);
            return null;
        }
    };

    // Update project status with validation
    const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus): Promise<boolean> => {
        try {
            // Validate input parameters
            if (!projectId || !newStatus) {
                toast({
                    variant: "destructive",
                    title: "Invalid Parameters",
                    description: "Project ID and status are required.",
                });
                return false;
            }

            // Validate status value
            const validStatuses: ProjectStatus[] = ['active', 'on_hold', 'delayed', 'cancelled', 'completed'];
            if (!validStatuses.includes(newStatus)) {
                toast({
                    variant: "destructive",
                    title: "Invalid Status",
                    description: `Status must be one of: ${validStatuses.join(', ')}`,
                });
                return false;
            }

            // Validate the workflow transition
            const validationResult = WorkflowValidator.validateTransition(projectId, newStatus);
            if (!validationResult.isValid) {
                toast({
                    variant: "destructive",
                    title: "Invalid Workflow Transition",
                    description: validationResult.message || "This workflow transition is not allowed.",
                });
                return false;
            }

            // Update the project status
            const { error } = await supabase
                .from('projects')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId);

            if (error) {
                console.error('Error updating project status:', error);
                const errorMessage = error.code === '23514'
                    ? 'Invalid status value. Please select a valid status.'
                    : error.message || 'Failed to update project status. Please try again.';

                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: errorMessage,
                });
                return false;
            }

            // Update local state optimistically
            setProjects(prev =>
                prev.map(project =>
                    project.id === projectId
                        ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
                        : project
                )
            );

            // Update cache
            const updatedProjects = projects.map(project =>
                project.id === projectId
                    ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
                    : project
            );
            cacheService.setProjects(updatedProjects);

            toast({
                title: "Status Updated",
                description: "Project status has been successfully updated.",
            });

            return true;
        } catch (error) {
            console.error('Error updating project status:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while updating the project status.';
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: errorMessage,
            });
            return false;
        }
    };

    // Update project stage with validation
    const updateProjectStage = async (projectId: string, newStageId: string): Promise<WorkflowValidationResult> => {
        try {
            // Validate input parameters
            if (!projectId || !newStageId) {
                const errorResult = {
                    isValid: false,
                    message: "Project ID and stage ID are required."
                };
                toast({
                    variant: "destructive",
                    title: "Invalid Parameters",
                    description: errorResult.message,
                });
                return errorResult;
            }

            // Validate the workflow transition
            const validationResult = WorkflowValidator.validateTransition(projectId, newStageId);
            if (!validationResult.isValid) {
                toast({
                    variant: "destructive",
                    title: "Invalid Workflow Transition",
                    description: validationResult.message || "This workflow transition is not allowed.",
                });
                return validationResult;
            }

            // Update the project stage using correct database field name
            const { error } = await supabase
                .from('projects')
                .update({
                    current_stage_id: newStageId,
                    stage_entered_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId);

            if (error) {
                console.error('Error updating project stage:', error);
                const errorMessage = error.code === '23503'
                    ? 'Invalid stage ID. The specified stage does not exist.'
                    : error.message || 'Failed to update project stage. Please try again.';

                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: errorMessage,
                });
                return {
                    isValid: false,
                    message: errorMessage
                };
            }

            // Update local state optimistically
            setProjects(prev =>
                prev.map(project =>
                    project.id === projectId
                        ? {
                            ...project,
                            current_stage_id: newStageId,
                            stage_entered_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                        : project
                )
            );

            // Update cache
            const updatedProjects = projects.map(project =>
                project.id === projectId
                    ? {
                        ...project,
                        current_stage_id: newStageId,
                        stage_entered_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                    : project
            );
            cacheService.setProjects(updatedProjects);

            // Refetch to get the full stage relationship data
            setTimeout(() => fetchProjects(true), 100);

            toast({
                title: "Stage Updated",
                description: "Project stage has been successfully updated.",
            });

            return {
                isValid: true,
                message: "Project stage updated successfully"
            };
        } catch (error) {
            console.error('Error updating project stage:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while updating the project stage.';
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: errorMessage,
            });
            return {
                isValid: false,
                message: errorMessage
            };
        }
    };

    // Optimistic update for project status (for UI updates before database confirmation)
    const updateProjectStatusOptimistic = (projectId: string, newStatus: ProjectStatus) => {
        setProjects(prev =>
            prev.map(project =>
                project.id === projectId
                    ? { ...project, status: newStatus }
                    : project
            )
        );
    };

    // Manual refetch function
    const refetch = useCallback(async (forceRefresh = false) => {
        await fetchProjects(forceRefresh);
    }, []);

    // Enhanced refetch function with filtering support
    const refetchWithFilters = useCallback(async (options?: ProjectQueryOptions, forceRefresh = false) => {
        await fetchProjects(forceRefresh, options);
    }, []);

    // Get bottleneck analysis for projects
    const getBottleneckAnalysis = async () => {
        try {
            // This would typically call an API endpoint or perform complex analysis
            // For now, we'll return an empty array as a placeholder
            return [];
        } catch (error) {
            console.error('Error getting bottleneck analysis:', error);
            return [];
        }
    };

    return {
        projects,
        loading,
        error,
        fetchProjects,
        updateProjectStage,
        updateProjectStatusOptimistic,
        refetch,
        refetchWithFilters,
        getProjectById,
        getBottleneckAnalysis
    };
}