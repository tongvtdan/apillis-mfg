import { useState, useEffect, useCallback, useRef } from 'react';
import { Project } from '@/types/project';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { cacheService } from '@/services/cacheService';
import { supabase } from '@/integrations/supabase/client.ts';

// Hook configuration options
interface UseEnhancedProjectsConfig {
    // Query configuration
    useCache?: boolean;
    enableRealtime?: boolean;

    // Real-time subscription configuration
    realtimeConfig?: {
        priority: 'high' | 'medium' | 'low';
        selectiveUpdates?: boolean;
        projectIds?: string[];
    };

    // Performance options
    preloadData?: boolean;
    enableMetrics?: boolean;

    // Error handling
    fallbackToCache?: boolean;
    showErrorToasts?: boolean;
}

// Hook state interface
interface EnhancedProjectsState {
    projects: Project[];
    loading: boolean;
    error: string | null;
    isRefreshing: boolean;
    lastUpdated?: Date;
    fromCache: boolean;

    // Real-time status
    realtimeStatus: {
        connected: boolean;
        lastUpdate?: Date;
        subscriptionCount: number;
    };

    // Performance metrics
    metrics?: {
        queryTime: number;
        cacheHit: boolean;
        realtimeUpdates: number;
    };
}

export function useEnhancedProjects(
    queryOptions: any = {},
    config: UseEnhancedProjectsConfig = {}
) {
    const {
        useCache = true,
        enableRealtime = true,
        realtimeConfig,
        preloadData = false,
        enableMetrics = false,
        fallbackToCache = true,
        showErrorToasts = true
    } = config;

    const { user, profile } = useAuth();
    const { toast } = useToast();

    const [state, setState] = useState<EnhancedProjectsState>({
        projects: [],
        loading: true,
        error: null,
        isRefreshing: false,
        fromCache: false,
        realtimeStatus: {
            connected: false,
            subscriptionCount: 0
        }
    });

    const realtimeChannelRef = useRef<any>(null);
    const metricsRef = useRef({ queryTime: 0, cacheHit: false, realtimeUpdates: 0 });

    // Fetch projects with enhanced features
    const fetchProjects = useCallback(async (forceRefresh = false) => {
        if (!user || !profile?.organization_id) {
            setState(prev => ({
                ...prev,
                projects: [],
                loading: false,
                error: 'Authentication required'
            }));
            return;
        }

        const startTime = Date.now();
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // Check cache first
            if (useCache && !forceRefresh) {
                const cachedProjects = cacheService.getProjects();
                if (cachedProjects && cachedProjects.length > 0) {
                    setState(prev => ({
                        ...prev,
                        projects: cachedProjects,
                        loading: false,
                        fromCache: true,
                        lastUpdated: new Date()
                    }));
                    metricsRef.current.cacheHit = true;
                    return;
                }
            }

            // Fetch from database
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    customer_organization:organizations!customer_organization_id(*),
                    current_stage:workflow_stages(*)
                `)
                .eq('organization_id', profile.organization_id as any)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const projects = (data || []) as unknown as Project[];
            const queryTime = Date.now() - startTime;

            // Update metrics
            if (enableMetrics) {
                metricsRef.current.queryTime = queryTime;
                metricsRef.current.cacheHit = false;
            }

            // Cache the results
            if (useCache) {
                cacheService.setProjects(projects);
            }

            setState(prev => ({
                ...prev,
                projects,
                loading: false,
                fromCache: false,
                lastUpdated: new Date(),
                error: null,
                metrics: enableMetrics ? {
                    queryTime,
                    cacheHit: false,
                    realtimeUpdates: prev.realtimeStatus.subscriptionCount
                } : undefined
            }));

        } catch (error) {
            console.error('Error fetching enhanced projects:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';

            // Try fallback to cache
            if (fallbackToCache && !forceRefresh) {
                const cachedProjects = cacheService.getProjects();
                if (cachedProjects && cachedProjects.length > 0) {
                    setState(prev => ({
                        ...prev,
                        projects: cachedProjects,
                        loading: false,
                        fromCache: true,
                        error: `Failed to fetch latest data: ${errorMessage}. Using cached data.`
                    }));
                    return;
                }
            }

            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            if (showErrorToasts) {
                toast({
                    variant: "destructive",
                    title: "Error Loading Projects",
                    description: errorMessage
                });
            }
        }
    }, [user, profile, useCache, fallbackToCache, showErrorToasts, toast, enableMetrics]);

    // Set up real-time updates
    useEffect(() => {
        if (!enableRealtime || !user || !profile?.organization_id) return;

        const setupRealtime = () => {
            realtimeChannelRef.current = supabase
                .channel('enhanced-projects-updates')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'projects',
                    filter: `organization_id=eq.${profile.organization_id}`
                }, (payload) => {
                    console.log('Real-time project update:', payload);
                    metricsRef.current.realtimeUpdates++;

                    setState(prev => ({
                        ...prev,
                        realtimeStatus: {
                            ...prev.realtimeStatus,
                            lastUpdate: new Date()
                        }
                    }));

                    // Refresh data
                    fetchProjects(true);
                })
                .subscribe((status) => {
                    setState(prev => ({
                        ...prev,
                        realtimeStatus: {
                            ...prev.realtimeStatus,
                            connected: status === 'SUBSCRIBED',
                            subscriptionCount: status === 'SUBSCRIBED'
                                ? prev.realtimeStatus.subscriptionCount + 1
                                : prev.realtimeStatus.subscriptionCount
                        }
                    }));
                });
        };

        setupRealtime();

        return () => {
            if (realtimeChannelRef.current) {
                supabase.removeChannel(realtimeChannelRef.current);
            }
        };
    }, [enableRealtime, user, profile, fetchProjects]);

    // Initial load
    useEffect(() => {
        if (preloadData) {
            fetchProjects();
        }
    }, [preloadData, fetchProjects]);

    // Refresh function
    const refresh = useCallback(async () => {
        setState(prev => ({ ...prev, isRefreshing: true }));
        await fetchProjects(true);
        setState(prev => ({ ...prev, isRefreshing: false }));
    }, [fetchProjects]);

    // Filter projects
    const filterProjects = useCallback((filters: any) => {
        return state.projects.filter(project => {
            // Apply filters here
            return true; // Placeholder
        });
    }, [state.projects]);

    return {
        ...state,
        refresh,
        filterProjects,
        metrics: enableMetrics ? metricsRef.current : undefined
    };
}
