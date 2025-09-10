import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, WorkflowStage, ProjectStatus, ProjectSubStageProgress } from '@/types/project';
import { projectWorkflowService } from '@/services/projectWorkflowService';
import { useAuth } from '@/core/auth';
import { useToast } from '@/hooks/use-toast';

export interface WorkflowEvent {
    eventType: 'stage_changed' | 'status_changed' | 'document_uploaded' | 'review_completed' | 'communication_sent';
    projectId: string;
    userId: string;
    data: Record<string, any>;
    timestamp: string;
}

export interface WorkflowValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    requiredActions: string[];
}

export interface ProjectWorkflowState {
    project: Project;
    currentStage: WorkflowStage | null;
    subStageProgress: ProjectSubStageProgress[];
    pendingApprovals: any[];
    requiredDocuments: any[];
    nextPossibleStages: WorkflowStage[];
    workflowValidation: WorkflowValidation;
}

export interface WorkflowContextType {
    // Current project workflow state
    currentProjectId: string | null;
    workflowState: ProjectWorkflowState | null;
    loading: boolean;
    error: string | null;

    // Workflow actions
    loadWorkflowState: (projectId: string) => Promise<void>;
    advanceStage: (projectId: string, targetStageId: string, reason?: string) => Promise<boolean>;
    updateProjectStatus: (projectId: string, status: ProjectStatus) => Promise<boolean>;
    validateWorkflow: (projectId: string) => Promise<WorkflowValidation>;

    // Stage management
    getProjectStage: (projectId: string) => Promise<WorkflowStage | null>;
    getNextPossibleStages: (projectId: string) => Promise<WorkflowStage[]>;
    canAdvanceToStage: (projectId: string, targetStageId: string) => Promise<boolean>;

    // Sub-stage management
    getSubStageProgress: (projectId: string) => Promise<ProjectSubStageProgress[]>;
    updateSubStageProgress: (projectId: string, subStageId: string, status: string) => Promise<boolean>;

    // Workflow events
    logWorkflowEvent: (event: WorkflowEvent) => Promise<void>;
    getWorkflowHistory: (projectId: string) => Promise<WorkflowEvent[]>;

    // Cache management
    clearCache: (projectId?: string) => void;
    refreshWorkflowState: (projectId: string) => Promise<void>;
}

export const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [workflowState, setWorkflowState] = useState<ProjectWorkflowState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const { toast } = useToast();

    // Load workflow state for a project
    const loadWorkflowState = useCallback(async (projectId: string) => {
        try {
            setLoading(true);
            setError(null);
            setCurrentProjectId(projectId);

            const state = await projectWorkflowService.getProjectWorkflowState(projectId);

            if (state) {
                setWorkflowState(state);
            } else {
                setError('Failed to load project workflow state');
            }
        } catch (err) {
            console.error('Error loading workflow state:', err);
            setError('Failed to load workflow state');
        } finally {
            setLoading(false);
        }
    }, []);

    // Advance project to next stage
    const advanceStage = useCallback(async (projectId: string, targetStageId: string, reason?: string): Promise<boolean> => {
        try {
            setLoading(true);

            const success = await projectWorkflowService.advanceToStage(projectId, targetStageId, reason);

            if (success) {
                // Refresh workflow state
                await loadWorkflowState(projectId);

                toast({
                    title: "Stage Advanced",
                    description: "Project has been advanced to the next stage.",
                });

                return true;
            } else {
                toast({
                    variant: "destructive",
                    title: "Stage Advancement Failed",
                    description: "Failed to advance project stage. Please check requirements.",
                });

                return false;
            }
        } catch (err) {
            console.error('Error advancing stage:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to advance project stage.",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadWorkflowState, toast]);

    // Update project status
    const updateProjectStatus = useCallback(async (projectId: string, status: ProjectStatus): Promise<boolean> => {
        try {
            setLoading(true);

            const success = await projectWorkflowService.updateProjectStatus(projectId, status);

            if (success) {
                // Refresh workflow state
                await loadWorkflowState(projectId);

                toast({
                    title: "Status Updated",
                    description: `Project status has been updated to ${status}.`,
                });

                return true;
            } else {
                toast({
                    variant: "destructive",
                    title: "Status Update Failed",
                    description: "Failed to update project status.",
                });

                return false;
            }
        } catch (err) {
            console.error('Error updating project status:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update project status.",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadWorkflowState, toast]);

    // Validate workflow state
    const validateWorkflow = useCallback(async (projectId: string): Promise<WorkflowValidation> => {
        try {
            return await projectWorkflowService.validateWorkflowState(projectId);
        } catch (err) {
            console.error('Error validating workflow:', err);
            return {
                isValid: false,
                errors: ['Failed to validate workflow'],
                warnings: [],
                requiredActions: []
            };
        }
    }, []);

    // Get project stage
    const getProjectStage = useCallback(async (projectId: string): Promise<WorkflowStage | null> => {
        try {
            return await projectWorkflowService.getProjectStage(projectId);
        } catch (err) {
            console.error('Error getting project stage:', err);
            return null;
        }
    }, []);

    // Get next possible stages
    const getNextPossibleStages = useCallback(async (projectId: string): Promise<WorkflowStage[]> => {
        try {
            return await projectWorkflowService.getNextPossibleStages(projectId);
        } catch (err) {
            console.error('Error getting next possible stages:', err);
            return [];
        }
    }, []);

    // Check if can advance to stage
    const canAdvanceToStage = useCallback(async (projectId: string, targetStageId: string): Promise<boolean> => {
        try {
            return await projectWorkflowService.canAdvanceToStage(projectId, targetStageId);
        } catch (err) {
            console.error('Error checking stage advancement:', err);
            return false;
        }
    }, []);

    // Get sub-stage progress
    const getSubStageProgress = useCallback(async (projectId: string): Promise<ProjectSubStageProgress[]> => {
        try {
            return await projectWorkflowService.getSubStageProgress(projectId);
        } catch (err) {
            console.error('Error getting sub-stage progress:', err);
            return [];
        }
    }, []);

    // Update sub-stage progress
    const updateSubStageProgress = useCallback(async (projectId: string, subStageId: string, status: string): Promise<boolean> => {
        try {
            const success = await projectWorkflowService.updateSubStageProgress(projectId, subStageId, status);

            if (success) {
                // Refresh workflow state
                await loadWorkflowState(projectId);
            }

            return success;
        } catch (err) {
            console.error('Error updating sub-stage progress:', err);
            return false;
        }
    }, [loadWorkflowState]);

    // Log workflow event
    const logWorkflowEvent = useCallback(async (event: WorkflowEvent): Promise<void> => {
        try {
            await projectWorkflowService.logWorkflowEvent(event);
        } catch (err) {
            console.error('Error logging workflow event:', err);
        }
    }, []);

    // Get workflow history
    const getWorkflowHistory = useCallback(async (projectId: string): Promise<WorkflowEvent[]> => {
        try {
            return await projectWorkflowService.getWorkflowHistory(projectId);
        } catch (err) {
            console.error('Error getting workflow history:', err);
            return [];
        }
    }, []);

    // Clear cache
    const clearCache = useCallback((projectId?: string) => {
        if (projectId) {
            projectWorkflowService.clearCache(projectId);
        } else {
            projectWorkflowService.clearAllCache();
        }
    }, []);

    // Refresh workflow state
    const refreshWorkflowState = useCallback(async (projectId: string) => {
        // Clear cache and reload
        clearCache(projectId);
        await loadWorkflowState(projectId);
    }, [clearCache, loadWorkflowState]);

    const value: WorkflowContextType = {
        currentProjectId,
        workflowState,
        loading,
        error,
        loadWorkflowState,
        advanceStage,
        updateProjectStatus,
        validateWorkflow,
        getProjectStage,
        getNextPossibleStages,
        canAdvanceToStage,
        getSubStageProgress,
        updateSubStageProgress,
        logWorkflowEvent,
        getWorkflowHistory,
        clearCache,
        refreshWorkflowState
    };

    return (
        <WorkflowContext.Provider value={value}>
            {children}
        </WorkflowContext.Provider>
    );
}

export function useWorkflow() {
    const context = useContext(WorkflowContext);
    if (context === undefined) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }
    return context;
}
