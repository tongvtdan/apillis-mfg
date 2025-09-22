import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Project, WorkflowStage, ProjectStatus, Contact, ProjectDocument, ProjectActivity } from '@/types/project';
import { projectWorkflowService } from '@/services/projectWorkflowService';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/core/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectContextState {
    // Core project data
    projects: Project[];
    currentProject: Project | null;
    selectedProjectId: string | null;

    // Related data
    contacts: Contact[];
    documents: ProjectDocument[];
    activities: ProjectActivity[];

    // Workflow state
    workflowStages: WorkflowStage[];
    currentWorkflowStage: WorkflowStage | null;

    // UI state
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;

    // Filters and search
    searchTerm: string;
    statusFilter: string;
    stageFilter: string;
    priorityFilter: string;
}

type ProjectAction =
    | { type: 'SET_PROJECTS'; payload: Project[] }
    | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
    | { type: 'SET_SELECTED_PROJECT'; payload: string | null }
    | { type: 'UPDATE_PROJECT'; payload: Project }
    | { type: 'ADD_PROJECT'; payload: Project }
    | { type: 'REMOVE_PROJECT'; payload: string }
    | { type: 'SET_CONTACTS'; payload: Contact[] }
    | { type: 'SET_DOCUMENTS'; payload: ProjectDocument[] }
    | { type: 'ADD_DOCUMENT'; payload: ProjectDocument }
    | { type: 'UPDATE_DOCUMENT'; payload: ProjectDocument }
    | { type: 'REMOVE_DOCUMENT'; payload: string }
    | { type: 'SET_ACTIVITIES'; payload: ProjectActivity[] }
    | { type: 'ADD_ACTIVITY'; payload: ProjectActivity }
    | { type: 'SET_WORKFLOW_STAGES'; payload: WorkflowStage[] }
    | { type: 'SET_CURRENT_WORKFLOW_STAGE'; payload: WorkflowStage | null }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_LAST_UPDATED'; payload: Date }
    | { type: 'SET_SEARCH_TERM'; payload: string }
    | { type: 'SET_STATUS_FILTER'; payload: string }
    | { type: 'SET_STAGE_FILTER'; payload: string }
    | { type: 'SET_PRIORITY_FILTER'; payload: string }
    | { type: 'RESET_FILTERS' };

const initialState: ProjectContextState = {
    projects: [],
    currentProject: null,
    selectedProjectId: null,
    contacts: [],
    documents: [],
    activities: [],
    workflowStages: [],
    currentWorkflowStage: null,
    loading: false,
    error: null,
    lastUpdated: null,
    searchTerm: '',
    statusFilter: 'all',
    stageFilter: 'all',
    priorityFilter: 'all'
};

function projectReducer(state: ProjectContextState, action: ProjectAction): ProjectContextState {
    switch (action.type) {
        case 'SET_PROJECTS':
            return { ...state, projects: action.payload, lastUpdated: new Date() };

        case 'SET_CURRENT_PROJECT':
            return { ...state, currentProject: action.payload };

        case 'SET_SELECTED_PROJECT':
            return { ...state, selectedProjectId: action.payload };

        case 'UPDATE_PROJECT':
            return {
                ...state,
                projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p),
                currentProject: state.currentProject?.id === action.payload.id ? action.payload : state.currentProject,
                lastUpdated: new Date()
            };

        case 'ADD_PROJECT':
            return {
                ...state,
                projects: [action.payload, ...state.projects],
                lastUpdated: new Date()
            };

        case 'REMOVE_PROJECT':
            return {
                ...state,
                projects: state.projects.filter(p => p.id !== action.payload),
                currentProject: state.currentProject?.id === action.payload ? null : state.currentProject,
                selectedProjectId: state.selectedProjectId === action.payload ? null : state.selectedProjectId,
                lastUpdated: new Date()
            };

        case 'SET_CONTACTS':
            return { ...state, contacts: action.payload };

        case 'SET_DOCUMENTS':
            return { ...state, documents: action.payload };

        case 'ADD_DOCUMENT':
            return { ...state, documents: [action.payload, ...state.documents] };

        case 'UPDATE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.map(d => d.id === action.payload.id ? action.payload : d)
            };

        case 'REMOVE_DOCUMENT':
            return { ...state, documents: state.documents.filter(d => d.id !== action.payload) };

        case 'SET_ACTIVITIES':
            return { ...state, activities: action.payload };

        case 'ADD_ACTIVITY':
            return { ...state, activities: [action.payload, ...state.activities] };

        case 'SET_WORKFLOW_STAGES':
            return { ...state, workflowStages: action.payload };

        case 'SET_CURRENT_WORKFLOW_STAGE':
            return { ...state, currentWorkflowStage: action.payload };

        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload };

        case 'SET_LAST_UPDATED':
            return { ...state, lastUpdated: action.payload };

        case 'SET_SEARCH_TERM':
            return { ...state, searchTerm: action.payload };

        case 'SET_STATUS_FILTER':
            return { ...state, statusFilter: action.payload };

        case 'SET_STAGE_FILTER':
            return { ...state, stageFilter: action.payload };

        case 'SET_PRIORITY_FILTER':
            return { ...state, priorityFilter: action.payload };

        case 'RESET_FILTERS':
            return {
                ...state,
                searchTerm: '',
                statusFilter: 'all',
                stageFilter: 'all',
                priorityFilter: 'all'
            };

        default:
            return state;
    }
}

interface ProjectContextType extends ProjectContextState {
    // Project actions
    selectProject: (projectId: string | null) => void;
    createProject: (projectData: any) => Promise<Project | null>;
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<boolean>;
    deleteProject: (projectId: string) => Promise<boolean>;

    // Workflow actions
    advanceProjectStage: (projectId: string, targetStageId: string, options?: any) => Promise<boolean>;
    updateProjectStatus: (projectId: string, status: ProjectStatus, reason?: string) => Promise<boolean>;

    // Document actions
    addDocument: (document: ProjectDocument) => void;
    updateDocument: (documentId: string, updates: Partial<ProjectDocument>) => void;
    removeDocument: (documentId: string) => void;

    // Activity actions
    addActivity: (activity: ProjectActivity) => void;

    // Filter actions
    setSearchTerm: (term: string) => void;
    setStatusFilter: (filter: string) => void;
    setStageFilter: (filter: string) => void;
    setPriorityFilter: (filter: string) => void;
    resetFilters: () => void;

    // Computed values
    filteredProjects: Project[];
    projectMetrics: {
        total: number;
        active: number;
        completed: number;
        overdue: number;
        totalValue: number;
    };

    // Utility functions
    refresh: () => Promise<void>;
    clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(projectReducer, initialState);
    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Load initial data
    const loadProjects = useCallback(async () => {
        if (!user || !profile?.organization_id) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const projects = await projectService.getAllProjects({
                status: state.statusFilter !== 'all' ? state.statusFilter : undefined,
                priority: state.priorityFilter !== 'all' ? state.priorityFilter : undefined
            });

            dispatch({ type: 'SET_PROJECTS', payload: projects });
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (error) {
            console.error('Error loading projects:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load projects' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [user, profile?.organization_id, state.statusFilter, state.priorityFilter]);

    // Load workflow stages
    const loadWorkflowStages = useCallback(async () => {
        try {
            const stages = await projectWorkflowService.getWorkflowStages();
            dispatch({ type: 'SET_WORKFLOW_STAGES', payload: stages });
        } catch (error) {
            console.error('Error loading workflow stages:', error);
        }
    }, []);

    // Load project details when selected
    const loadProjectDetails = useCallback(async (projectId: string) => {
        if (!projectId) return;

        try {
            const project = await projectService.getProjectById(projectId);
            if (project) {
                dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });

                // Load related data
                await loadProjectContacts(projectId);
                await loadProjectDocuments(projectId);
                await loadProjectActivities(projectId);
            }
        } catch (error) {
            console.error('Error loading project details:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load project details' });
        }
    }, []);

    // Load project contacts
    const loadProjectContacts = useCallback(async (projectId: string) => {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('organization_id', profile?.organization_id)
                .in('id', []); // This would be populated from project.point_of_contacts

            if (error) throw error;
            dispatch({ type: 'SET_CONTACTS', payload: data || [] });
        } catch (error) {
            console.error('Error loading project contacts:', error);
        }
    }, [profile?.organization_id]);

    // Load project documents
    const loadProjectDocuments = useCallback(async (projectId: string) => {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            dispatch({ type: 'SET_DOCUMENTS', payload: data || [] });
        } catch (error) {
            console.error('Error loading project documents:', error);
        }
    }, []);

    // Load project activities
    const loadProjectActivities = useCallback(async (projectId: string) => {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            dispatch({ type: 'SET_ACTIVITIES', payload: data || [] });
        } catch (error) {
            console.error('Error loading project activities:', error);
        }
    }, []);

    // Project actions
    const selectProject = useCallback((projectId: string | null) => {
        dispatch({ type: 'SET_SELECTED_PROJECT', payload: projectId });
        if (projectId) {
            loadProjectDetails(projectId);
        } else {
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
        }
    }, [loadProjectDetails]);

    const createProject = useCallback(async (projectData: any): Promise<Project | null> => {
        try {
            const project = await projectWorkflowService.createProjectWithWorkflow({
                ...projectData,
                organization_id: profile?.organization_id || '',
                created_by: user?.id || ''
            });

            if (project) {
                dispatch({ type: 'ADD_PROJECT', payload: project });
                toast({
                    title: "Project Created",
                    description: `Project ${project.project_id} created successfully`
                });
            }

            return project;
        } catch (error) {
            console.error('Error creating project:', error);
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: error instanceof Error ? error.message : 'Failed to create project'
            });
            return null;
        }
    }, [profile?.organization_id, user?.id, toast]);

    const updateProject = useCallback(async (projectId: string, updates: Partial<Project>): Promise<boolean> => {
        try {
            const updatedProject = await projectService.updateProject(projectId, updates);
            if (updatedProject) {
                dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
                toast({
                    title: "Project Updated",
                    description: "Project updated successfully"
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating project:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Failed to update project"
            });
            return false;
        }
    }, [toast]);

    const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
        try {
            await projectService.deleteProject(projectId);
            dispatch({ type: 'REMOVE_PROJECT', payload: projectId });
            toast({
                title: "Project Deleted",
                description: "Project deleted successfully"
            });
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Failed to delete project"
            });
            return false;
        }
    }, [toast]);

    // Workflow actions
    const advanceProjectStage = useCallback(async (
        projectId: string,
        targetStageId: string,
        options?: any
    ): Promise<boolean> => {
        if (!user) return false;

        try {
            const result = await projectWorkflowService.advanceProjectStage(
                projectId,
                targetStageId,
                user.id,
                options
            );

            if (result.success && result.project) {
                dispatch({ type: 'UPDATE_PROJECT', payload: result.project });
                toast({
                    title: "Stage Updated",
                    description: result.message
                });
                return true;
            } else {
                toast({
                    variant: "destructive",
                    title: "Transition Failed",
                    description: result.message
                });
                return false;
            }
        } catch (error) {
            console.error('Error advancing stage:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to advance project stage"
            });
            return false;
        }
    }, [user, toast]);

    const updateProjectStatus = useCallback(async (
        projectId: string,
        status: ProjectStatus,
        reason?: string
    ): Promise<boolean> => {
        if (!user) return false;

        try {
            const success = await projectWorkflowService.updateProjectStatus(
                projectId,
                status,
                user.id,
                reason
            );

            if (success) {
                // Update local state
                const updatedProjects = state.projects.map(p =>
                    p.id === projectId ? { ...p, status } : p
                );
                dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });

                if (state.currentProject?.id === projectId) {
                    dispatch({ type: 'SET_CURRENT_PROJECT', payload: { ...state.currentProject, status } });
                }

                toast({
                    title: "Status Updated",
                    description: `Project status changed to ${status}`
                });
            }

            return success;
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update project status"
            });
            return false;
        }
    }, [user, state.projects, state.currentProject, toast]);

    // Document actions
    const addDocument = useCallback((document: ProjectDocument) => {
        dispatch({ type: 'ADD_DOCUMENT', payload: document });
    }, []);

    const updateDocument = useCallback((documentId: string, updates: Partial<ProjectDocument>) => {
        const existingDoc = state.documents.find(d => d.id === documentId);
        if (existingDoc) {
            const updatedDoc = { ...existingDoc, ...updates };
            dispatch({ type: 'UPDATE_DOCUMENT', payload: updatedDoc });
        }
    }, [state.documents]);

    const removeDocument = useCallback((documentId: string) => {
        dispatch({ type: 'REMOVE_DOCUMENT', payload: documentId });
    }, []);

    // Activity actions
    const addActivity = useCallback((activity: ProjectActivity) => {
        dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    }, []);

    // Filter actions
    const setSearchTerm = useCallback((term: string) => {
        dispatch({ type: 'SET_SEARCH_TERM', payload: term });
    }, []);

    const setStatusFilter = useCallback((filter: string) => {
        dispatch({ type: 'SET_STATUS_FILTER', payload: filter });
    }, []);

    const setStageFilter = useCallback((filter: string) => {
        dispatch({ type: 'SET_STAGE_FILTER', payload: filter });
    }, []);

    const setPriorityFilter = useCallback((filter: string) => {
        dispatch({ type: 'SET_PRIORITY_FILTER', payload: filter });
    }, []);

    const resetFilters = useCallback(() => {
        dispatch({ type: 'RESET_FILTERS' });
    }, []);

    // Computed values
    const filteredProjects = state.projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            project.project_id.toLowerCase().includes(state.searchTerm.toLowerCase());
        const matchesStatus = state.statusFilter === 'all' || project.status === state.statusFilter;
        const matchesPriority = state.priorityFilter === 'all' || project.priority_level === state.priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const projectMetrics = {
        total: state.projects.length,
        active: state.projects.filter(p => p.status === 'active').length,
        completed: state.projects.filter(p => p.status === 'completed').length,
        overdue: state.projects.filter(p => {
            if (!p.estimated_delivery_date || p.status === 'completed') return false;
            return new Date(p.estimated_delivery_date) < new Date();
        }).length,
        totalValue: state.projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0)
    };

    // Utility functions
    const refresh = useCallback(async () => {
        await loadProjects();
        if (state.selectedProjectId) {
            await loadProjectDetails(state.selectedProjectId);
        }
    }, [loadProjects, loadProjectDetails, state.selectedProjectId]);

    const clearError = useCallback(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
    }, []);

    // Setup real-time subscriptions
    useEffect(() => {
        if (!user || !profile?.organization_id) return;

        const projectsChannel = supabase
            .channel('projects-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'projects',
                    filter: `organization_id=eq.${profile.organization_id}`
                },
                (payload) => {
                    console.log('Real-time project update:', payload);
                    loadProjects();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(projectsChannel);
        };
    }, [user, profile?.organization_id, loadProjects]);

    // Initial data load
    useEffect(() => {
        loadProjects();
        loadWorkflowStages();
    }, [loadProjects, loadWorkflowStages]);

    const contextValue: ProjectContextType = {
        ...state,
        selectProject,
        createProject,
        updateProject,
        deleteProject,
        advanceProjectStage,
        updateProjectStatus,
        addDocument,
        updateDocument,
        removeDocument,
        addActivity,
        setSearchTerm,
        setStatusFilter,
        setStageFilter,
        setPriorityFilter,
        resetFilters,
        filteredProjects,
        projectMetrics,
        refresh,
        clearError
    };

    return (
        <ProjectContext.Provider value={contextValue}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}
