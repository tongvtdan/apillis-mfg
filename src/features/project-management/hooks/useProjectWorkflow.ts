import { useState, useEffect, useCallback, useRef } from 'react';
import { Project, WorkflowStage, ProjectStatus, ProjectWorkflowState } from '@/types/project';
import { projectWorkflowService } from '@/services/projectWorkflowService';
import { projectService } from '@/services/projectService';
import { workflowStageService } from '@/services/workflowStageService';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client.ts';

interface UseProjectWorkflowOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    enableRealtime?: boolean;
}

export function useProjectWorkflow(projectId?: string, options: UseProjectWorkflowOptions = {}) {
    const {
        autoRefresh = true,
        refreshInterval = 30000, // 30 seconds
        enableRealtime = true
    } = options;

    const [workflowState, setWorkflowState] = useState<ProjectWorkflowState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const { user } = useAuth();
    const { toast } = useToast();
    const refreshTimerRef = useRef<NodeJS.Timeout>();
    const realtimeChannelRef = useRef<any>();

    // Load workflow state
    const loadWorkflowState = useCallback(async (forceRefresh = false) => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);

            const state = await projectWorkflowService.getProjectWorkflowState(projectId);

            if (state) {
                setWorkflowState(state);
                setLastRefresh(new Date());
            } else {
                setError('Failed to load project workflow state');
            }
        } catch (err) {
            console.error('Error loading workflow state:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Create new project with workflow
    const createProject = useCallback(async (projectData: {
        title: string;
        description?: string;
        customer_organization_id: string;
        priority_level?: string;
        estimated_value?: number;
        project_type?: string;
        intake_type?: string;
        intake_source?: string;
        initial_documents?: File[];
        contacts?: string[];
    }): Promise<Project | null> => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to create projects"
            });
            return null;
        }

        try {
            const project = await projectWorkflowService.createProjectWithWorkflow({
                ...projectData,
                organization_id: user.user_metadata?.organization_id || '',
                created_by: user.id
            });

            if (project) {
                toast({
                    title: "Project Created",
                    description: `Project ${project.project_id} created successfully`
                });
            }

            return project;
        } catch (error) {
            console.error('Error creating project:', error);
            const message = error instanceof Error ? error.message : 'Failed to create project';
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: message
            });
            return null;
        }
    }, [user, toast]);

    // Advance workflow stage
    const advanceWorkflowStage = useCallback(async (newStageId: string, reason?: string) => {
        if (!projectId || !workflowState) {
            toast({
                variant: "destructive",
                title: "Invalid State",
                description: "Cannot advance workflow: missing project or workflow state"
            });
            return false;
        }

        try {
            setLoading(true);

            const success = await projectWorkflowService.advanceWorkflowStage(
                projectId,
                newStageId,
                reason
            );

            if (success) {
                toast({
                    title: "Workflow Advanced",
                    description: "Project moved to next stage successfully"
                });
                await loadWorkflowState(true);
            }

            return success;
        } catch (error) {
            console.error('Error advancing workflow:', error);
            const message = error instanceof Error ? error.message : 'Failed to advance workflow';
            toast({
                variant: "destructive",
                title: "Workflow Error",
                description: message
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [projectId, workflowState, loadWorkflowState, toast]);

    // Get available next stages
    const getAvailableNextStages = useCallback(async () => {
        if (!projectId || !workflowState) return [];

        try {
            return await projectWorkflowService.getAvailableNextStages(projectId);
        } catch (error) {
            console.error('Error getting available stages:', error);
            return [];
        }
    }, [projectId, workflowState]);

    // Set up auto-refresh
    useEffect(() => {
        if (!autoRefresh || !projectId) return;

        const setupAutoRefresh = () => {
            refreshTimerRef.current = setInterval(() => {
                loadWorkflowState();
            }, refreshInterval);
        };

        setupAutoRefresh();

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [autoRefresh, projectId, refreshInterval, loadWorkflowState]);

    // Set up real-time updates
    useEffect(() => {
        if (!enableRealtime || !projectId) return;

        const setupRealtime = () => {
            realtimeChannelRef.current = supabase
                .channel(`project-workflow-${projectId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'projects',
                    filter: `id=eq.${projectId}`
                }, () => {
                    loadWorkflowState(true);
                })
                .subscribe();
        };

        setupRealtime();

        return () => {
            if (realtimeChannelRef.current) {
                supabase.removeChannel(realtimeChannelRef.current);
            }
        };
    }, [enableRealtime, projectId, loadWorkflowState]);

    // Initial load
    useEffect(() => {
        if (projectId) {
            loadWorkflowState();
        }
    }, [projectId, loadWorkflowState]);

    return {
        workflowState,
        loading,
        error,
        lastRefresh,
        createProject,
        advanceWorkflowStage,
        getAvailableNextStages,
        refresh: () => loadWorkflowState(true)
    };
}
