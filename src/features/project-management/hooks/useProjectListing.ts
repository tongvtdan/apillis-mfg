import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client.ts';
import { Project, ProjectStatus } from '@/types/project';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { cacheService } from '@/services/cacheService';
import { realtimeManager } from '@/lib/realtime-manager';
import { projectQueries, ProjectQueryOptions, generateProjectQueryKey } from '@/lib/project-queries';

export function useProjectListing() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const realtimeChannelRef = useRef<any>(null);
    const lastFetchTimeRef = useRef<number>(0);

    // Stable refs for useEffect dependencies to prevent infinite loops
    const userIdRef = useRef<string | undefined>();
    const organizationIdRef = useRef<string | undefined>();

    // Update refs when values change
    userIdRef.current = user?.id;
    organizationIdRef.current = profile?.organization_id;

    const fetchProjects = useCallback(async (forceRefresh = false, options?: ProjectQueryOptions) => {
        // Check if user is authenticated
        if (!user) {
            console.log('⚠️ No authenticated user, returning empty projects array');
            setProjects([]);
            setLoading(false);
            return;
        }

        // Get organization_id with fallback logic similar to dashboard function
        let organizationId = profile?.organization_id;

        if (!organizationId) {
            console.log('⚠️ No organization_id in profile, trying fallback...');
            try {
                // Try to get the first organization as fallback (same as dashboard function)
                const { data: fallbackOrg } = await supabase
                    .from('organizations')
                    .select('id')
                    .limit(1)
                    .maybeSingle();

                if (fallbackOrg?.id) {
                    organizationId = fallbackOrg.id;
                    console.log('✅ Using fallback organization_id:', organizationId);
                } else {
                    console.log('❌ No fallback organization found, returning empty projects array');
                    setProjects([]);
                    setLoading(false);
                    return;
                }
            } catch (fallbackError) {
                console.error('❌ Error getting fallback organization:', fallbackError);
                setProjects([]);
                setLoading(false);
                return;
            }
        }

        try {
            console.log('🔍 Fetching projects for user:', user.id, 'organization:', organizationId);

            // Check cache based on whether options are applied
            if (!forceRefresh) {
                if (options && Object.keys(options).length > 0) {
                    // Check query-specific cache for filtered results
                    const queryKey = generateProjectQueryKey('list', options);
                    if (cacheService.isQueryCacheValid(queryKey)) {
                        const cachedResult = cacheService.getQueryResult(queryKey);
                        if (cachedResult) {
                            console.log('📦 Using cached query result for:', queryKey);
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
                            console.log('📦 Using cached projects:', cachedProjects.length);
                            // Check if cached projects have customer organization data
                            const hasCustomerData = cachedProjects.some(p => p.customer_organization?.name);
                            if (!hasCustomerData) {
                                console.log('⚠️ Cached projects missing customer data, forcing refresh');
                                cacheService.clearCache();
                            } else {
                                setProjects(cachedProjects);
                                setLoading(false);
                                return;
                            }
                        }
                    }
                }
            }

            setLoading(true);
            setError(null);

            // Use projects table with proper lookups - cleaner approach than denormalized view
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
            query = query.eq('organization_id', organizationId);

            // Apply filters if provided
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

            const { data, error: fetchError, count } = await query;

            console.log('📊 Projects query result:', {
                dataLength: data?.length,
                count,
                hasError: !!fetchError,
                error: fetchError
            });

            if (fetchError) {
                console.error('❌ Error fetching projects:', fetchError);
                const errorMessage = fetchError.code === 'PGRST116'
                    ? 'Database connection error. Please check your connection and try again.'
                    : fetchError.message || 'Failed to fetch projects';
                setError(errorMessage);
                setLoading(false);
                return;
            }

            // Validate and transform the data from projects table
            let mappedProjects = (data || []).map(project => ({
                ...project,
                // Ensure required fields have proper defaults
                status: project.status || 'active',
                priority_level: project.priority_level || 'normal',
                source: project.source || 'portal',
                tags: project.tags || [],
                metadata: project.metadata || {},
                point_of_contacts: project.point_of_contacts || [],
                // Calculate days in stage if stage_entered_at exists
                days_in_stage: project.stage_entered_at
                    ? Math.floor((new Date().getTime() - new Date(project.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
                    : undefined,
                // Add computed fields for compatibility
                due_date: project.estimated_delivery_date, // Map estimated_delivery_date to due_date for compatibility
                priority: project.priority_level, // Map priority_level to priority for legacy compatibility
                // Customer organization will be fetched separately
                customer_organization: null, // Will be populated below
                // Current stage will be fetched separately
                current_stage: null, // Will be populated below
                // Contacts will be fetched separately when needed using point_of_contacts IDs
                // Primary contact can be derived from the first contact ID in the array
                primary_contact: null // Will be populated separately when needed
            }));

            // Fetch customer organizations separately to avoid ambiguous joins
            if (mappedProjects.length > 0) {
                const customerOrgIds = [...new Set(mappedProjects
                    .map(p => p.customer_organization_id)
                    .filter(id => id)
                )];

                console.log('🔍 Customer organization IDs found:', customerOrgIds);

                if (customerOrgIds.length > 0) {
                    try {
                        const { data: orgs, error: orgError } = await supabase
                            .from('organizations')
                            .select('id, name')
                            .in('id', customerOrgIds);

                        console.log('📊 Organizations query result:', {
                            orgsLength: orgs?.length,
                            hasError: !!orgError,
                            error: orgError,
                            orgs: orgs
                        });

                        if (!orgError && orgs) {
                            // Create a lookup map for organizations
                            const orgMap = orgs.reduce((acc, org) => {
                                acc[org.id] = org;
                                return acc;
                            }, {});

                            console.log('🗺️ Organization map created:', orgMap);

                            // Update projects with customer organization data
                            mappedProjects = mappedProjects.map(project => {
                                const customerOrg = project.customer_organization_id ?
                                    orgMap[project.customer_organization_id] || null : null;

                                console.log(`📝 Project ${project.project_id}: customer_organization_id=${project.customer_organization_id}, customerOrg=`, customerOrg);

                                return {
                                    ...project,
                                    customer_organization: customerOrg
                                };
                            });
                        }
                    } catch (error) {
                        console.error('❌ Error fetching customer organizations:', error);
                    }
                } else {
                    console.log('⚠️ No customer organization IDs found in projects');
                }
            }

            console.log('✅ Successfully mapped projects:', mappedProjects.length);
            setProjects(mappedProjects as Project[]);

            // Cache the data appropriately
            if (options) {
                // Cache filtered results with query-specific key
                const queryKey = generateProjectQueryKey('list', options);
                cacheService.setQueryResult(queryKey, mappedProjects as Project[]);
            } else {
                // Cache full dataset in main cache
                cacheService.setProjects(mappedProjects as Project[]);
            }
        } catch (err) {
            console.error('💥 Error in fetchProjects:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, profile]);

    // Selective real-time subscription for specific projects
    const subscribeToProjectUpdates = useCallback((projectIds: string[]) => {
        if (projectIds.length === 0) return;

        console.log('🔔 subscribeToProjectUpdates called with project IDs:', projectIds);

        // Clean up existing subscription
        if (realtimeChannelRef.current) {
            console.log('🔔 Cleaning up existing selective subscription');
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
                    // Validate payload structure
                    if (!payload.new?.id) {
                        console.warn('🔔 Selective subscription: Invalid payload received:', payload);
                        return;
                    }

                    console.log('🔔 Selective real-time update received:', {
                        projectId: payload.new.id,
                        oldStatus: payload.old?.status,
                        newStatus: payload.new.status,
                        oldStage: payload.old?.current_stage_id,
                        newStage: payload.new.current_stage_id
                    });

                    // Update the specific project in our state
                    setProjects(prev => {
                        const updatedProjects = prev.map(project =>
                            project.id === payload.new.id
                                ? { ...project, ...payload.new }
                                : project
                        );

                        console.log('🔔 Projects state updated via real-time subscription:', {
                            projectId: payload.new.id,
                            oldStage: payload.old?.current_stage_id,
                            newStage: payload.new.current_stage_id,
                            projectsCount: updatedProjects.length,
                            updatedProject: updatedProjects.find(p => p.id === payload.new.id)
                        });

                        // Update cache with error handling
                        try {
                            cacheService.setProjects(updatedProjects);
                        } catch (error) {
                            console.warn('🔔 Failed to update cache during real-time update:', error);
                        }

                        return updatedProjects;
                    });

                    // If stage was updated, we should refetch to get the full stage relationship
                    if (payload.old?.current_stage_id !== payload.new.current_stage_id) {
                        console.log('🔔 Stage updated, refetching to get full stage data with relationships');
                        // Use setTimeout to ensure the state update completes first
                        setTimeout(() => {
                            fetchProjects(true);
                        }, 100);
                    }
                }
            )
            .subscribe((status) => {
                console.log('🔔 Selective subscription status changed:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Selective project subscription established for projects:', projectIds);
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Selective project subscription error:', status);
                    // Retry after a delay
                    setTimeout(() => {
                        if (realtimeChannelRef.current) {
                            console.log('🔄 Retrying selective subscription...');
                            subscribeToProjectUpdates(projectIds);
                        }
                    }, 3000);
                } else if (status === 'CLOSED') {
                    console.log('🔔 Selective project subscription closed');
                } else {
                    console.log('🔔 Selective subscription status:', status);
                }
            });

        return realtimeChannelRef.current;
    }, []); // Empty dependency array - fetchProjects is accessed via closure

    // Set up real-time subscription - only for project detail pages
    useEffect(() => {
        // Always subscribe to real-time updates for project-related routes
        const shouldSubscribeToRealtime = window.location.pathname.includes('/projects/') ||
            window.location.pathname.includes('/project/') ||
            window.location.pathname === '/projects';

        console.log('🔔 useProjectListing: Real-time subscription check:', {
            currentPath: window.location.pathname,
            shouldSubscribe: shouldSubscribeToRealtime,
            realtimeManagerStatus: realtimeManager.getStatus()
        });

        if (!shouldSubscribeToRealtime) {
            console.log('🔔 useProjectListing: Skipping real-time subscription for route:', window.location.pathname);
            return;
        }

        // Subscribe to the global real-time manager with improved handling
        console.log('🔔 useProjectListing: Setting up real-time subscription');
        const unsubscribe = realtimeManager.subscribe(() => {
            // Rate limit real-time updates to prevent excessive API calls
            const now = Date.now();
            const timeSinceLastFetch = now - lastFetchTimeRef.current;

            if (timeSinceLastFetch < 2000) { // Increased to 2 seconds for better stability
                console.log('🔔 useProjectListing: Rate limiting real-time update (last fetch was', timeSinceLastFetch, 'ms ago)');
                return;
            }

            // When we receive a notification, refetch projects to get the latest data
            console.log('🔔 useProjectListing: Received real-time update notification, refetching projects');
            lastFetchTimeRef.current = now;
            if (userIdRef.current && organizationIdRef.current) {
                fetchProjects(true);
            }
        });

        return () => {
            console.log('🔔 useProjectListing: Unsubscribing from real-time manager');
            unsubscribe();
        };
    }, []); // Empty dependency array to prevent infinite loops

    // Separate useEffect for initial data loading
    useEffect(() => {
        // Only run if we have the required user and organization info
        if (!userIdRef.current || !organizationIdRef.current) {
            console.log('⚠️ useProjectListing: Missing user or organization info, skipping initial load');
            return;
        }

        console.log('🔄 useProjectListing: Initial data load triggered');
        console.log('User ID:', userIdRef.current);
        console.log('Organization ID:', organizationIdRef.current);
        fetchProjects();
    }, []); // Empty dependency array - only run once on mount

    // Manual refetch function
    const refetch = useCallback(async (forceRefresh = false) => {
        await fetchProjects(forceRefresh);
    }, []); // Empty dependency array - fetchProjects is accessed via closure

    // Clear cache and refetch
    const clearCacheAndRefetch = useCallback(async () => {
        console.log('🧹 Clearing cache and refetching projects');
        cacheService.clearCache();
        await fetchProjects(true);
    }, []); // Empty dependency array - fetchProjects is accessed via closure

    // Enhanced refetch function with filtering support
    const refetchWithFilters = useCallback(async (filters?: {
        status?: string;
        priority?: string;
        limit?: number;
        offset?: number;
    }, forceRefresh = false) => {
        await fetchProjects(forceRefresh, filters);
    }, []); // Empty dependency array - fetchProjects is accessed via closure

    return {
        projects,
        loading,
        error,
        fetchProjects,
        refetch,
        refetchWithFilters,
        subscribeToProjectUpdates,
        clearCacheAndRefetch
    };
}
