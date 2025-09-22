import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client.ts.js';
import { Project, ProjectStatus } from '@/types/project';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
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

    const fetchProjects = useCallback(async (forceRefresh = false, options?: ProjectQueryOptions) => {
        if (!user) {
            setProjects([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Check cache first
            if (!forceRefresh) {
                if (options && Object.keys(options).length > 0) {
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

            // Fetch optimized query
            let query = supabase
                .from('projects')
                .select(`
                    id,
                    organization_id,
                    project_id,
                    title,
                    description,
                    customer_organization_id,
                    point_of_contacts,
                    current_stage_id,
                    status,
                    priority_level,
                    source,
                    assigned_to,
                    created_by,
                    estimated_value,
                    estimated_delivery_date,
                    actual_delivery_date,
                    tags,
                    metadata,
                    stage_entered_at,
                    project_type,
                    notes,
                    created_at,
                    updated_at
                `);

            // Add organization filter
            query = query.eq('organization_id', user.user_metadata?.organization_id || '');

            // Apply filters
            if (options?.status) {
                query = query.eq('status', options.status);
            }
            if (options?.priority) {
                query = query.eq('priority_level', options.priority);
            }

            // Apply ordering and pagination
            query = query.order('created_at', { ascending: false });

            if (options?.limit) {
                query = query.limit(options.limit);
            }
            if (options?.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                console.error('❌ Error fetching projects:', fetchError);
                setError(fetchError.message);
                setLoading(false);
                return;
            }

            // Transform data
            let mappedProjects = (data || []).map(project => ({
                ...project,
                status: project.status || 'active',
                priority_level: project.priority_level || 'normal',
                source: project.source || 'portal',
                tags: project.tags || [],
                metadata: project.metadata || {},
                point_of_contacts: project.point_of_contacts || [],
                days_in_stage: project.stage_entered_at
                    ? Math.floor((new Date().getTime() - new Date(project.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
                    : undefined,
                due_date: project.estimated_delivery_date,
                priority: project.priority_level,
                customer_organization: null,
                current_stage: null,
                primary_contact: null
            }));

            setProjects(mappedProjects);
            setError(null);

            // Cache results
            if (options) {
                const queryKey = generateProjectQueryKey('list', options);
                cacheService.setQueryResult(queryKey, mappedProjects);
            } else {
                cacheService.setProjects(mappedProjects);
            }

        } catch (err) {
            console.error('💥 Error in fetchProjects:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Update project status
    const updateProjectStatus = useCallback(async (projectId: string, newStatus: ProjectStatus) => {
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId);

            if (error) throw error;

            setProjects(prev =>
                prev.map(project =>
                    project.id === projectId
                        ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
                        : project
                )
            );

            toast({
                title: "Status Updated",
                description: "Project status has been successfully updated.",
            });

            return true;
        } catch (error) {
            console.error('Error updating project status:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error instanceof Error ? error.message : 'Failed to update project status.',
            });
            return false;
        }
    }, [toast]);

    // Update project stage
    const updateProjectStage = useCallback(async (projectId: string, newStageId: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    current_stage_id: newStageId,
                    stage_entered_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId);

            if (error) throw error;

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

            toast({
                title: "Stage Updated",
                description: "Project stage has been successfully updated.",
            });

            return true;
        } catch (error) {
            console.error('Error updating project stage:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error instanceof Error ? error.message : 'Failed to update project stage.',
            });
            return false;
        }
    }, [toast]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        loading,
        error,
        fetchProjects,
        updateProjectStatus,
        updateProjectStage,
        refetch: () => fetchProjects(true)
    };
}
