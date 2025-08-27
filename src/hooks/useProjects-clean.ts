import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStage, ProjectStatus, Customer } from '@/types/project';
import {
    SupplierQuote,
    QuoteReadinessIndicator,
    BottleneckAlert,
    AnalyticsMetrics,
    ProjectWorkflowAnalytics
} from '@/types/supplier';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WorkflowValidator, WorkflowValidationResult } from '@/lib/workflow-validator';
import { cacheService } from '@/services/cacheService';
import { realtimeManager } from '@/lib/realtime-manager';

// Database now uses new status values directly - no mapping needed

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();
    const realtimeChannelRef = useRef<any>(null);

    const fetchProjects = async (forceRefresh = false) => {
        if (!user) {
            setProjects([]);
            setLoading(false);
            return;
        }

        try {
            // Check if we have valid cached data
            if (!forceRefresh && cacheService.isCacheValid()) {
                const cachedProjects = cacheService.getProjects();
                if (cachedProjects) {
                    setProjects(cachedProjects);
                    setLoading(false);
                    return;
                }
            }

            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('projects')
                .select(`
          *,
          customer:customers(*)
        `)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Error fetching projects:', fetchError);
                setError(fetchError.message);
                return;
            }

            // Database now uses new status values directly - cast to Project type
            const mappedProjects = (data || []) as Project[];

            // Cache the data
            cacheService.setProjects(mappedProjects);
            setProjects(mappedProjects);
        } catch (err) {
            console.error('Error in fetchProjects:', err);
            setError('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    // Selective real-time subscription for specific projects
    const subscribeToProjectUpdates = useCallback((projectIds: string[]) => {
        if (projectIds.length === 0) return;

        // Clean up existing subscription
        if (realtimeChannelRef.current) {
            supabase.removeChannel(realtimeChannelRef.current);
        }

        console.log('🔔 Setting up selective real-time subscription for projects:', projectIds);

        realtimeChannelRef.current = supabase
            .channel('selective-project-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'projects',
                    filter: `id=in.(${projectIds.join(',')})`
                },
                (payload) => {
                    console.log('🔔 Selective real-time update received:', {
                        projectId: payload.new.id,
                        oldStatus: payload.old?.status,
                        newStatus: payload.new.status
                    });

                    // Update the specific project in our state
                    setProjects(prev => {
                        const updatedProjects = prev.map(project =>
                            project.id === payload.new.id
                                ? { ...project, ...payload.new }
                                : project
                        );

                        // Update cache
                        cacheService.setProjects(updatedProjects);
                        return updatedProjects;
                    });
                }
            )
            .subscribe();

        return realtimeChannelRef.current;
    }, []);

    // Set up real-time subscription - only for project detail pages
    useEffect(() => {
        fetchProjects();

        // Only subscribe to real-time updates on specific routes
        const shouldSubscribeToRealtime = window.location.pathname.includes('/projects/') ||
            window.location.pathname.includes('/project/') ||
            window.location.pathname === '/projects';

        console.log('🔔 useProjects: Real-time subscription check:', {
            currentPath: window.location.pathname,
            shouldSubscribe: shouldSubscribeToRealtime,
            realtimeManagerStatus: realtimeManager.getStatus()
        });

        if (!shouldSubscribeToRealtime) {
            console.log('🔔 useProjects: Skipping real-time subscription for route:', window.location.pathname);
            return;
        }

        // Subscribe to the global real-time manager
        const unsubscribe = realtimeManager.subscribe(() => {
            // When we receive a notification, refetch projects to get the latest data
            console.log('🔔 useProjects: Received real-time update notification, refetching projects');
            fetchProjects();
        });

        return () => {
            console.log('🔔 useProjects: Unsubscribing from real-time manager');
            unsubscribe();
        };
    }, [user]); // Remove projects.length dependency to prevent infinite loops

    // Get project by ID
    const getProjectById = async (id: string): Promise<Project> => {
        console.log('🔍 Fetching project with ID:', id);

        try {
            // First, log all projects to see what's available
            const { data: allProjects, error: allProjectsError } = await supabase
                .from('projects')
                .select(`
          *,
          customer:customers(*)
        `);

            if (allProjectsError) {
                console.error('❌ Error fetching all projects:', allProjectsError);
                throw new Error(`Database error: ${allProjectsError.message} (Code: ${allProjectsError.code})`);
            }

            console.log('📊 Database status:');
            console.log(`  - Total projects found: ${allProjects?.length || 0}`);
            console.log(`  - Available project IDs:`, allProjects?.map(p => p.id) || []);
            console.log(`  - Sample project IDs:`, allProjects?.map(p => p.project_id) || []);

            // Try to fetch with exact ID first
            let { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          customer:customers(*)
        `)
                .eq('id', id)
                .single();

            if (error) {
                console.log(`⚠️ Direct ID lookup failed: ${error.message} (Code: ${error.code})`);
            }

            // If not found, try to find by matching ID regardless of format
            if (error || !data) {
                console.log('🔄 Trying alternative matching methods...');

                // Find project by ID case-insensitive
                data = allProjects?.find(p => {
                    const normalizedId = (p.id || '').toLowerCase().replace(/-/g, '');
                    const normalizedSearchId = (id || '').toLowerCase().replace(/-/g, '');
                    const matches = normalizedId === normalizedSearchId;
                    if (matches) {
                        console.log(`✅ Found match: ${p.id} matches ${id}`);
                    }
                    return matches;
                });

                if (!data) {
                    console.log('🎯 Trying to find sample project P-25082301...');
                    // Check if we have sample projects defined
                    data = allProjects?.find(p => p.project_id === 'P-25082301');
                    if (data) {
                        console.log(`✅ Using sample project: ${data.id} (${data.project_id})`);
                    }
                }
            }

            if (!data) {
                console.error('❌ Project resolution failed:');
                console.error(`  - Requested ID: ${id}`);
                console.error(`  - Available projects: ${allProjects?.length || 0}`);
                console.error(`  - Database appears to be: ${allProjects?.length === 0 ? 'EMPTY' : 'POPULATED'}`);
                throw new Error(`Project not found: ${id}`);
            }

            console.log('✅ Project found:', {
                id: data.id,
                project_id: data.project_id,
                status: data.status,
                customer: data.customer
            });

            return data;
        } catch (err) {
            console.error('Error fetching project by ID:', err);
            throw err;
        }
    };

    const updateProjectStatus = async (projectId: string, newStage: ProjectStage) => {
        try {
            // Find the current project to get the old stage
            const currentProject = projects.find(project => project.id === projectId);
            if (!currentProject) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Project not found",
                });
                return false;
            }

            // Validate the status change using workflow validator
            const validationResult = await WorkflowValidator.validateStatusChange(currentProject, newStage);

            if (!validationResult.isValid) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: validationResult.errors.join(", "),
                });
                return false;
            }

            const oldStage = currentProject.current_stage;

            const { error } = await supabase
                .from('projects')
                .update({
                    current_stage: newStage,
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId);

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to update project stage",
                });
                return false;
            }

            // Log successful update for debugging
            console.log('✅ Database update successful, real-time subscription should handle UI updates');
            console.log('🔔 Global real-time channel status:', realtimeManager.getStatus());

            // Format stage names for display
            const formatStageName = (stage: ProjectStage) => {
                const stageMap = {
                    inquiry_received: "Inquiry Received",
                    technical_review: "Technical Review",
                    supplier_rfq_sent: "Supplier RFQ Sent",
                    quoted: "Quoted",
                    order_confirmed: "Order Confirmed",
                    procurement_planning: "Procurement & Planning",
                    in_production: "In Production",
                    shipped_closed: "Shipped & Closed"
                };
                return stageMap[stage] || stage;
            };

            // Show warnings if any
            if (validationResult.warnings.length > 0) {
                toast({
                    variant: "warning",
                    title: "Stage Updated with Warnings",
                    description: `From ${formatStageName(oldStage)} to ${formatStageName(newStage)}. Warnings: ${validationResult.warnings.join(", ")}`,
                });
            } else {
                toast({
                    title: "Stage Updated",
                    description: `From ${formatStageName(oldStage)} to ${formatStageName(newStage)}`,
                });
            }

            return true;
        } catch (err) {
            console.error('Error updating project stage:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred while updating the project.",
            });
            return false;
        }
    };

    // Optimistic update for immediate UI feedback
    const updateProjectStatusOptimistic = useCallback(async (projectId: string, newStage: ProjectStage) => {
        try {
            // Find the current project to get the old stage
            const currentProject = projects.find(project => project.id === projectId);
            if (!currentProject) {
                console.error('Project not found for optimistic update:', projectId);
                return false;
            }

            // Validate the status change using workflow validator
            const validationResult = await WorkflowValidator.validateStatusChange(currentProject, newStage);

            if (!validationResult.isValid) {
                console.error('Validation failed for optimistic update:', validationResult.errors);
                return false;
            }

            const oldStage = currentProject.current_stage;

            // Optimistically update the UI first
            setProjects(prev =>
                prev.map(project =>
                    project.id === projectId
                        ? { ...project, current_stage: newStage, updated_at: new Date().toISOString() }
                        : project
                )
            );

            // Update cache immediately for instant feedback
            const updatedProjects = projects.map(project =>
                project.id === projectId
                    ? { ...project, current_stage: newStage, updated_at: new Date().toISOString() }
                    : project
            );
            cacheService.setProjects(updatedProjects);

            // Perform the actual database update
            const result = await updateProjectStatus(projectId, newStage);

            if (!result) {
                // Revert optimistic update on failure
                setProjects(prev =>
                    prev.map(project =>
                        project.id === projectId
                            ? { ...project, current_stage: oldStage, updated_at: currentProject.updated_at }
                            : project
                    )
                );

                // Revert cache
                const revertedProjects = projects.map(project =>
                    project.id === projectId
                        ? { ...project, current_stage: oldStage, updated_at: currentProject.updated_at }
                        : project
                );
                cacheService.setProjects(revertedProjects);
            }

            return result;
        } catch (error) {
            console.error('Error in optimistic update:', error);
            return false;
        }
    }, [projects, updateProjectStatus]);

    // Create new project
    const createProject = async (projectData: Partial<Project>) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([projectData])
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        } catch (err) {
            console.error('Error creating project:', err);
            throw err;
        }
    };

    // Create or get customer
    const createOrGetCustomer = async (customerData: Partial<Customer>) => {
        try {
            // First try to find existing customer
            const { data: existingCustomer, error: findError } = await supabase
                .from('customers')
                .select('*')
                .eq('email', customerData.email)
                .single();

            if (existingCustomer) {
                return existingCustomer;
            }

            // Create new customer if not found
            const { data: newCustomer, error: createError } = await supabase
                .from('customers')
                .insert([customerData])
                .select()
                .single();

            if (createError) {
                throw createError;
            }

            return newCustomer;
        } catch (err) {
            console.error('Error creating customer:', err);
            throw err;
        }
    };

    // Test real-time subscription status
    const testSupabaseRealtime = useCallback(async () => {
        console.log('🧪 Testing real-time subscription status:', {
            selectiveChannel: !!realtimeChannelRef.current,
            realtimeManager: realtimeManager.getStatus(),
            currentProjects: projects.length
        });
    }, [projects.length]);

    // Refetch projects
    const refetch = useCallback(() => {
        fetchProjects(true);
    }, []);

    return {
        projects,
        loading,
        error,
        fetchProjects,
        updateProjectStage: updateProjectStatus,
        updateProjectStageOptimistic: updateProjectStatusOptimistic,
        createProject,
        createOrGetCustomer,
        getProjectById,
        subscribeToProjectUpdates,
        testSupabaseRealtime,
        refetch
    };
}
