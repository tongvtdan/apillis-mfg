import { useState, useEffect, useCallback, useRef } from 'react';
import { Project, WorkflowStage, ProjectStatus, ProjectWorkflowState } from '@/types/project';
import { projectWorkflowService } from '@/services/projectWorkflowService';
import { projectService } from '@/services/projectService';
import { workflowStageService } from '@/services/workflowStageService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

    // Update project status
    const updateProjectStatus = useCallback(async (
        newStatus: ProjectStatus,
        reason?: string
    ): Promise<boolean> => {
        if (!projectId || !user) return false;

        try {
            const success = await projectWorkflowService.updateProjectStatus(
                projectId,
                newStatus,
                user.id,
                reason
            );

            if (success) {
                await loadWorkflowState(true);
                toast({
                    title: "Status Updated",
                    description: `Project status changed to ${newStatus}`
                });
            }

            return success;
        } catch (error) {
            console.error('Error updating project status:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Failed to update project status"
            });
            return false;
        }
    }, [projectId, user, loadWorkflowState, toast]);

    // Advance project stage
    const advanceStage = useCallback(async (
        targetStageId: string,
        options?: {
            bypassValidation?: boolean;
            reason?: string;
            force?: boolean;
        }
    ): Promise<{ success: boolean; message: string }> => {
        if (!projectId || !user) {
            return { success: false, message: 'Authentication required' };
        }

        try {
            const result = await projectWorkflowService.advanceProjectStage(
                projectId,
                targetStageId,
                user.id,
                options
            );

            if (result.success) {
                await loadWorkflowState(true);
            }

            return result;
        } catch (error) {
            console.error('Error advancing stage:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to advance stage'
            };
        }
    }, [projectId, user, loadWorkflowState]);

    // Get available stage transitions
    const getAvailableTransitions = useCallback(async (): Promise<WorkflowStage[]> => {
        if (!workflowState) return [];

        try {
            return workflowState.nextPossibleStages;
        } catch (error) {
            console.error('Error getting available transitions:', error);
            return [];
        }
    }, [workflowState]);

    // Validate current workflow state
    const validateWorkflow = useCallback(async () => {
        if (!workflowState) return null;

        try {
            return workflowState.workflowValidation;
        } catch (error) {
            console.error('Error validating workflow:', error);
            return null;
        }
    }, [workflowState]);

    // Get workflow progress
    const getWorkflowProgress = useCallback(() => {
        if (!workflowState) return { percentage: 0, completed: 0, total: 0 };

        const { subStageProgress } = workflowState;
        const completed = subStageProgress.filter(s => s.status === 'completed').length;
        const total = subStageProgress.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        return { percentage, completed, total };
    }, [workflowState]);

    // Manual refresh
    const refresh = useCallback(async () => {
        await loadWorkflowState(true);
    }, [loadWorkflowState]);

    // Setup auto-refresh
    useEffect(() => {
        if (!autoRefresh || !projectId) return;

        refreshTimerRef.current = setInterval(() => {
            loadWorkflowState();
        }, refreshInterval);

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [autoRefresh, refreshInterval, projectId, loadWorkflowState]);

    // Setup real-time updates
    useEffect(() => {
        if (!enableRealtime || !projectId) return;

        console.log('Setting up real-time workflow updates for project:', projectId);

        realtimeChannelRef.current = supabase
            .channel(`project-workflow-${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'projects',
                    filter: `id=eq.${projectId}`
                },
                (payload) => {
                    console.log('Real-time project update:', payload);
                    loadWorkflowState(true);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'project_sub_stage_progress',
                    filter: `project_id=eq.${projectId}`
                },
                (payload) => {
                    console.log('Real-time sub-stage update:', payload);
                    loadWorkflowState(true);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'workflow_stages'
                },
                (payload) => {
                    console.log('Real-time workflow stage update:', payload);
                    loadWorkflowState(true);
                }
            )
            .subscribe((status) => {
                console.log('Real-time subscription status:', status);
            });

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
        // State
        workflowState,
        loading,
        error,
        lastRefresh,

        // Actions
        createProject,
        updateProjectStatus,
        advanceStage,
        refresh,

        // Queries
        getAvailableTransitions,
        validateWorkflow,
        getWorkflowProgress,

        // Computed values
        project: workflowState?.project || null,
        currentStage: workflowState?.currentStage || null,
        subStageProgress: workflowState?.subStageProgress || [],
        pendingApprovals: workflowState?.pendingApprovals || [],
        requiredDocuments: workflowState?.requiredDocuments || [],
        nextPossibleStages: workflowState?.nextPossibleStages || [],
        workflowValidation: workflowState?.workflowValidation || null,

        // Progress
        progress: getWorkflowProgress()
    };
}
