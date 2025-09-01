import { useState, useEffect, useCallback, useRef } from 'react';
import { Project } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { optimizedQueryService, QueryOptions, QueryConfig } from '@/services/optimizedQueryService';
import { enhancedRealtimeManager } from '@/lib/enhanced-realtime-manager';
import { cacheService } from '@/services/cacheService';
import { RetryService } from '@/services/retryService';

// Hook configuration options
interface UseEnhancedProjectsConfig {
    // Query configuration
    fields?: keyof typeof import('@/services/optimizedQueryService').FIELD_PRESETS | string;
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
        cacheHitRate: number;
        totalQueries: number;
    };
}

// Optimistic update interface
interface OptimisticUpdateOptions {
    showOptimisticUI?: boolean;
    rollbackOnError?: boolean;
    timeout?: number;
}

/**
 * Enhanced projects hook with optimized queries, real-time updates,
 * intelligent caching, and optimistic updates
 */
export function useEnhancedProjects(
    queryOptions: QueryOptions = {},
    config: UseEnhancedProjectsConfig = {}
) {
    // Default configuration
    const defaultConfig: UseEnhancedProjectsConfig = {
        fields: 'BASIC',
        useCache: true,
        enableRealtime: true,
        realtimeConfig: {
            priority: 'medium',
            selectiveUpdates: true
        },
        preloadData: false,
        enableMetrics: true,
        fallbackToCache: true,
        showErrorToasts: true
    };

    const finalConfig = { ...defaultConfig, ...config };
    const { user, profile } = useAuth();
    const { toast } = useToast();

    // State management
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

    // Refs for cleanup and optimization
    const realtimeUnsubscribeRef = useRef<(() => void) | null>(null);
    const lastQueryRef = useRef<string>('');
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Generate query key for caching and deduplication
     */
    const generateQueryKey = useCallback((options: QueryOptions): string => {
        return JSON.stringify({ ...options, organizationId: profile?.organization_id });
    }, [profile?.organization_id]);

    /**
     * Fetch projects with enhanced error handling and caching
     */
    const fetchProjects = useCallback(async (
        options: QueryOptions = {},
        forceRefresh = false
    ): Promise<void> => {
        if (!user || !profile?.organization_id) {
            setState(prev => ({
                ...prev,
                projects: [],
                loading: false,
                error: null
            }));
            return;
        }

        const queryKey = generateQueryKey(options);

        // Prevent duplicate queries
        if (lastQueryRef.current === queryKey && !forceRefresh) {
            return;
        }

        // Cancel previous query if still running
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            setState(prev => ({
                ...prev,
                loading: !prev.projects.length, // Don't show loading if we have cached data
                isRefreshing: !!prev.projects.length,
                error: null
            }));

            lastQueryRef.current = queryKey;

            // Prepare query configuration
            const queryConfig: QueryConfig = {
                fields: finalConfig.fields,
                useCache: finalConfig.useCache && !forceRefresh,
                organizationId: profile.organization_id,
                metrics: finalConfig.enableMetrics
            };

            // Execute optimized query
            const result = await optimizedQueryService.getProjects(options, queryConfig);

            // Check if query was aborted
            if (abortControllerRef.current?.signal.aborted) {
                return;
            }

            setState(prev => ({
                ...prev,
                projects: result.data,
                loading: false,
                isRefreshing: false,
                error: result.error || null,
                lastUpdated: new Date(),
                fromCache: result.fromCache || false,
                metrics: result.metrics ? {
                    queryTime: result.metrics.duration || 0,
                    cacheHitRate: result.metrics.cacheHit ? 100 : 0,
                    totalQueries: 1
                } : undefined
            }));

            // Show success message for manual refreshes
            if (forceRefresh && !result.fromCache) {
                toast({
                    title: "Data refreshed",
                    description: `Loaded ${result.data.length} projects`
                });
            }

        } catch (error) {
            // Check if query was aborted
            if (abortControllerRef.current?.signal.aborted) {
                return;
            }

            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';

            setState(prev => ({
                ...prev,
                loading: false,
                isRefreshing: false,
                error: errorMessage
            }));

            if (finalConfig.showErrorToasts) {
                toast({
                    variant: "destructive",
                    title: "Failed to load projects",
                    description: errorMessage
                });
            }

            console.error('Enhanced projects fetch error:', error);
        }
    }, [user, profile, generateQueryKey, finalConfig, toast]);

    /**
     * Set up real-time subscriptions
     */
    const setupRealtimeSubscriptions = useCallback(() => {
        if (!finalConfig.enableRealtime || !user || !profile?.organization_id) {
            return;
        }

        // Clean up existing subscription
        if (realtimeUnsubscribeRef.current) {
            realtimeUnsubscribeRef.current();
        }

        // Set up enhanced real-time subscription
        const unsubscribe = enhancedRealtimeManager.subscribe(
            `projects-${profile.organization_id}`,
            {
                table: 'projects',
                event: '*',
                filter: `organization_id=eq.${profile.organization_id}`,
                priority: finalConfig.realtimeConfig?.priority || 'medium',
                retryConfig: {
                    maxAttempts: 5,
                    baseDelay: 1000,
                    backoffFactor: 2
                }
            },
            (payload) => {
                console.log('Real-time update received:', payload);

                // Update real-time status
                setState(prev => ({
                    ...prev,
                    realtimeStatus: {
                        ...prev.realtimeStatus,
                        connected: true,
                        lastUpdate: new Date()
                    }
                }));

                // Handle different event types
                switch (payload.eventType) {
                    case 'INSERT':
                        if (payload.new) {
                            setState(prev => ({
                                ...prev,
                                projects: [payload.new, ...prev.projects]
                            }));
                        }
                        break;

                    case 'UPDATE':
                        if (payload.new) {
                            setState(prev => ({
                                ...prev,
                                projects: prev.projects.map(project =>
                                    project.id === payload.new.id ? { ...project, ...payload.new } : project
                                )
                            }));
                        }
                        break;

                    case 'DELETE':
                        if (payload.old) {
                            setState(prev => ({
                                ...prev,
                                projects: prev.projects.filter(project => project.id !== payload.old.id)
                            }));
                        }
                        break;
                }
            }
        );

        realtimeUnsubscribeRef.current = unsubscribe;

        // Update subscription status
        setState(prev => ({
            ...prev,
            realtimeStatus: {
                ...prev.realtimeStatus,
                subscriptionCount: 1
            }
        }));

    }, [finalConfig.enableRealtime, user, profile, finalConfig.realtimeConfig]);

    /**
     * Perform optimistic update
     */
    const performOptimisticUpdate = useCallback(async (
        updateId: string,
        operation: 'create' | 'update' | 'delete',
        data: Partial<Project>,
        confirmationOperation: () => Promise<Project>,
        options: OptimisticUpdateOptions = {}
    ): Promise<{ success: boolean; data?: Project; error?: Error }> => {
        const {
            showOptimisticUI = true,
            rollbackOnError = true,
            timeout = 5000
        } = options;

        if (!showOptimisticUI) {
            // Just perform the operation without optimistic UI
            try {
                const result = await confirmationOperation();
                return { success: true, data: result };
            } catch (error) {
                return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
            }
        }

        // Get current project for rollback
        const rollbackData = operation === 'update' && data.id
            ? state.projects.find(p => p.id === data.id)
            : undefined;

        // Perform optimistic update through enhanced real-time manager
        return await enhancedRealtimeManager.performOptimisticUpdate(
            updateId,
            operation,
            data,
            rollbackData,
            confirmationOperation
        );
    }, [state.projects]);

    /**
     * Update project with optimistic UI
     */
    const updateProject = useCallback(async (
        projectId: string,
        updates: Partial<Project>,
        options: OptimisticUpdateOptions = {}
    ): Promise<{ success: boolean; data?: Project; error?: Error }> => {
        return performOptimisticUpdate(
            `update-${projectId}-${Date.now()}`,
            'update',
            { id: projectId, ...updates },
            async () => {
                // This would be replaced with actual API call
                const result = await optimizedQueryService.getProjectById(projectId, {
                    organizationId: profile?.organization_id
                });

                if (!result) {
                    throw new Error('Failed to update project');
                }

                return result;
            },
            options
        );
    }, [performOptimisticUpdate, profile?.organization_id]);

    /**
     * Create project with optimistic UI
     */
    const createProject = useCallback(async (
        projectData: Partial<Project>,
        options: OptimisticUpdateOptions = {}
    ): Promise<{ success: boolean; data?: Project; error?: Error }> => {
        const tempId = `temp-${Date.now()}`;

        return performOptimisticUpdate(
            `create-${tempId}`,
            'create',
            { ...projectData, id: tempId },
            async () => {
                // This would be replaced with actual API call
                throw new Error('Create project API not implemented');
            },
            options
        );
    }, [performOptimisticUpdate]);

    /**
     * Delete project with optimistic UI
     */
    const deleteProject = useCallback(async (
        projectId: string,
        options: OptimisticUpdateOptions = {}
    ): Promise<{ success: boolean; error?: Error }> => {
        const project = state.projects.find(p => p.id === projectId);
        if (!project) {
            return { success: false, error: new Error('Project not found') };
        }

        const result = await performOptimisticUpdate(
            `delete-${projectId}-${Date.now()}`,
            'delete',
            project,
            async () => {
                // This would be replaced with actual API call
                throw new Error('Delete project API not implemented');
            },
            options
        );

        return { success: result.success, error: result.error };
    }, [state.projects, performOptimisticUpdate]);

    /**
     * Refresh data manually
     */
    const refresh = useCallback(async (showToast = true) => {
        await fetchProjects(queryOptions, true);

        if (showToast) {
            toast({
                title: "Refreshed",
                description: "Project data has been updated"
            });
        }
    }, [fetchProjects, queryOptions, toast]);

    /**
     * Force refresh all data and clear caches
     */
    const forceRefresh = useCallback(async () => {
        // Clear all caches
        cacheService.clearCache();
        optimizedQueryService.clearCache();

        // Force refresh through enhanced real-time manager
        await enhancedRealtimeManager.forceRefresh();

        // Refetch data
        await fetchProjects(queryOptions, true);
    }, [fetchProjects, queryOptions]);

    /**
     * Get performance statistics
     */
    const getPerformanceStats = useCallback(() => {
        return optimizedQueryService.getPerformanceStats();
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchProjects(queryOptions);
    }, [fetchProjects, JSON.stringify(queryOptions)]);

    // Set up real-time subscriptions
    useEffect(() => {
        setupRealtimeSubscriptions();

        return () => {
            if (realtimeUnsubscribeRef.current) {
                realtimeUnsubscribeRef.current();
            }
        };
    }, [setupRealtimeSubscriptions]);

    // Set authentication status for real-time manager
    useEffect(() => {
        enhancedRealtimeManager.setAuthenticationStatus(!!user, user?.id);
    }, [user]);

    // Preload data if configured
    useEffect(() => {
        if (finalConfig.preloadData && profile?.organization_id) {
            optimizedQueryService.preloadQueries(profile.organization_id);
        }
    }, [finalConfig.preloadData, profile?.organization_id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (realtimeUnsubscribeRef.current) {
                realtimeUnsubscribeRef.current();
            }
        };
    }, []);

    return {
        // Data
        projects: state.projects,
        loading: state.loading,
        error: state.error,
        isRefreshing: state.isRefreshing,
        lastUpdated: state.lastUpdated,
        fromCache: state.fromCache,

        // Real-time status
        realtimeStatus: state.realtimeStatus,

        // Performance metrics
        metrics: state.metrics,

        // Actions
        refresh,
        forceRefresh,
        updateProject,
        createProject,
        deleteProject,

        // Utilities
        getPerformanceStats,

        // Enhanced real-time manager access
        realtimeManager: enhancedRealtimeManager,

        // Query service access
        queryService: optimizedQueryService
    };
}