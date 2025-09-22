import { supabase } from '@/integrations/supabase/client.js';
import { Project } from '@/types/project';
import { cacheService } from './cacheService';
import { RetryService } from './retryService';
import { toast } from 'sonner';

// Query performance metrics
interface QueryMetrics {
    queryId: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    cacheHit: boolean;
    recordCount?: number;
    error?: string;
}

// Field selection presets for different use cases
export const FIELD_PRESETS = {
    // Minimal fields for list views and cards
    MINIMAL: `
    id,
    project_id,
    title,
    status,
    priority_level,
    current_stage_id,
    created_at,
    updated_at
  `,

    // Basic fields for table views
    BASIC: `
    id,
    project_id,
    title,
    status,
    priority_level,
    current_stage_id,
    customer_organization_id,
    point_of_contacts,
    assigned_to,
    estimated_value,
    created_at,
    updated_at,
    customer_organization:organizations!customer_organization_id(
      id,
      name,
      slug
    ),
    current_stage:workflow_stages!current_stage_id(
      id,
      name,
      stage_order
    )
  `,

    // Extended fields for detail views
    EXTENDED: `
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
    updated_at,
    customer_organization:organizations!customer_organization_id(
      id,
      name,
      slug,
      description,
      industry,
      address,
      city,
      state,
      country,
      postal_code,
      website,
      logo_url,
      is_active
    ),
    current_stage:workflow_stages!current_stage_id(
      id,
      name,
      description,
      stage_order,
      is_active,
      estimated_duration_days
    )
  `,

    // Full fields for comprehensive operations
    FULL: `
    *,
    customer_organization:organizations!customer_organization_id(*),
    current_stage:workflow_stages!current_stage_id(*),
    assigned_user:users!assigned_to(
      id,
      email,
      full_name,
      role
    ),
    created_user:users!created_by(
      id,
      email,
      full_name
    )
  `
};

// Query configuration options
export interface QueryConfig {
    fields?: keyof typeof FIELD_PRESETS | string;
    useCache?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
    timeout?: number;
    retryConfig?: {
        maxAttempts: number;
        baseDelay: number;
        backoffFactor: number;
    };
    metrics?: boolean;
    organizationId?: string;
}

// Filter and pagination options
export interface QueryOptions {
    // Filtering
    status?: string | string[];
    priority?: string | string[];
    projectType?: string;
    customerId?: string;
    assignedTo?: string;
    stageId?: string;
    search?: string;
    tags?: string[];
    dateRange?: {
        field: 'created_at' | 'updated_at' | 'stage_entered_at' | 'estimated_delivery_date';
        start: string;
        end: string;
    };

    // Sorting
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';

    // Pagination
    limit?: number;
    offset?: number;
    page?: number;
    pageSize?: number;

    // Advanced options
    includeInactive?: boolean;
    includeArchived?: boolean;
}

// Query result with metadata
export interface QueryResult<T> {
    data: T[];
    count?: number;
    totalCount?: number;
    hasMore?: boolean;
    nextOffset?: number;
    metrics?: QueryMetrics;
    fromCache?: boolean;
    error?: string;
}

/**
 * Optimized query service with selective field loading, intelligent caching,
 * and performance monitoring
 */
class OptimizedQueryService {
    private queryMetrics = new Map<string, QueryMetrics>();
    private activeQueries = new Set<string>();
    private defaultConfig: QueryConfig = {
        fields: 'BASIC',
        useCache: true,
        cacheTTL: 5 * 60 * 1000, // 5 minutes
        timeout: 10000,
        retryConfig: {
            maxAttempts: 3,
            baseDelay: 1000,
            backoffFactor: 2
        },
        metrics: true
    };

    /**
     * Get projects with optimized query and caching
     */
    async getProjects(
        options: QueryOptions = {},
        config: QueryConfig = {}
    ): Promise<QueryResult<Project>> {
        const finalConfig = { ...this.defaultConfig, ...config };
        const queryId = this.generateQueryId('projects', options, finalConfig);

        // Start metrics tracking
        let metrics: QueryMetrics | undefined;
        if (finalConfig.metrics) {
            metrics = this.startMetrics(queryId);
        }

        try {
            // Check cache first
            if (finalConfig.useCache) {
                const cachedResult = this.getCachedResult(queryId, finalConfig.cacheTTL!);
                if (cachedResult) {
                    if (metrics) {
                        this.endMetrics(queryId, true, cachedResult.data.length);
                    }
                    return {
                        ...cachedResult,
                        fromCache: true,
                        metrics: metrics ? this.queryMetrics.get(queryId) : undefined
                    };
                }
            }

            // Prevent duplicate queries
            if (this.activeQueries.has(queryId)) {
                throw new Error('Query already in progress');
            }

            this.activeQueries.add(queryId);

            // Build and execute query
            const result = await this.executeProjectQuery(options, finalConfig);

            // Cache the result
            if (finalConfig.useCache && result.data.length > 0) {
                this.setCachedResult(queryId, result, finalConfig.cacheTTL!);
            }

            if (metrics) {
                this.endMetrics(queryId, false, result.data.length);
            }

            return {
                ...result,
                fromCache: false,
                metrics: metrics ? this.queryMetrics.get(queryId) : undefined
            };

        } catch (error) {
            if (metrics) {
                this.endMetrics(queryId, false, 0, error instanceof Error ? error.message : 'Unknown error');
            }

            // Try fallback to cache on error
            if (finalConfig.useCache) {
                const cachedResult = this.getCachedResult(queryId, finalConfig.cacheTTL! * 2); // Extended TTL for fallback
                if (cachedResult) {
                    console.warn('Using cached data as fallback due to query error:', error);
                    toast.warning('Using cached data', {
                        description: 'Unable to fetch latest data, showing cached version.'
                    });

                    return {
                        ...cachedResult,
                        fromCache: true,
                        error: error instanceof Error ? error.message : 'Query failed, using cached data'
                    };
                }
            }

            throw error;
        } finally {
            this.activeQueries.delete(queryId);
        }
    }

    /**
     * Get single project by ID with optimized query
     */
    async getProjectById(
        id: string,
        config: QueryConfig = {}
    ): Promise<Project | null> {
        const finalConfig = { ...this.defaultConfig, ...config, fields: config.fields || 'EXTENDED' };
        const queryId = this.generateQueryId('project-detail', { id }, finalConfig);

        // Start metrics
        let metrics: QueryMetrics | undefined;
        if (finalConfig.metrics) {
            metrics = this.startMetrics(queryId);
        }

        try {
            // Check cache first
            if (finalConfig.useCache) {
                const cachedProject = cacheService.getProject(id);
                if (cachedProject && cacheService.isCacheValid()) {
                    if (metrics) {
                        this.endMetrics(queryId, true, 1);
                    }
                    return cachedProject;
                }
            }

            // Execute query with retry logic
            const result = await RetryService.execute(
                async () => {
                    const fields = typeof finalConfig.fields === 'string' && finalConfig.fields in FIELD_PRESETS
                        ? FIELD_PRESETS[finalConfig.fields as keyof typeof FIELD_PRESETS]
                        : finalConfig.fields || FIELD_PRESETS.EXTENDED;

                    let query = supabase
                        .from('projects')
                        .select(fields)
                        .eq('id', id);

                    // Add organization filter if provided
                    if (finalConfig.organizationId) {
                        query = query.eq('organization_id', finalConfig.organizationId);
                    }

                    const { data, error } = await query.single();

                    if (error) {
                        throw new Error(`Failed to fetch project: ${error.message}`);
                    }

                    return data as Project;
                },
                finalConfig.retryConfig
            );

            if (!result.success) {
                throw result.error!;
            }

            const project = result.data!;

            // Cache the result
            if (finalConfig.useCache) {
                cacheService.updateProject(id, project);
            }

            if (metrics) {
                this.endMetrics(queryId, false, 1);
            }

            return project;

        } catch (error) {
            if (metrics) {
                this.endMetrics(queryId, false, 0, error instanceof Error ? error.message : 'Unknown error');
            }

            // Try fallback to cache
            if (finalConfig.useCache) {
                const cachedProject = cacheService.getProject(id);
                if (cachedProject) {
                    console.warn('Using cached project as fallback due to query error:', error);
                    return cachedProject;
                }
            }

            console.error('Failed to get project by ID:', error);
            return null;
        }
    }

    /**
     * Execute the actual project query with all filters and options
     */
    private async executeProjectQuery(
        options: QueryOptions,
        config: QueryConfig
    ): Promise<QueryResult<Project>> {
        return await RetryService.execute(
            async () => {
                // Determine fields to select
                const fields = typeof config.fields === 'string' && config.fields in FIELD_PRESETS
                    ? FIELD_PRESETS[config.fields as keyof typeof FIELD_PRESETS]
                    : config.fields || FIELD_PRESETS.BASIC;

                // Build base query
                let query = supabase.from('projects').select(fields, { count: 'exact' });

                // Add organization filter if provided
                if (config.organizationId) {
                    query = query.eq('organization_id', config.organizationId);
                }

                // Apply filters
                query = this.applyFilters(query, options);

                // Apply sorting
                const orderBy = options.orderBy || 'created_at';
                const orderDirection = options.orderDirection || 'desc';
                query = query.order(orderBy, { ascending: orderDirection === 'asc' });

                // Apply pagination
                if (options.limit || options.pageSize) {
                    const limit = options.limit || options.pageSize || 50;
                    let offset = options.offset || 0;

                    // Calculate offset from page if provided
                    if (options.page && options.pageSize) {
                        offset = (options.page - 1) * options.pageSize;
                    }

                    query = query.range(offset, offset + limit - 1);
                }

                // Execute query
                const { data, error, count } = await query;

                if (error) {
                    throw new Error(`Query failed: ${error.message} (Code: ${error.code})`);
                }

                // Calculate pagination metadata
                const totalCount = count || 0;
                const limit = options.limit || options.pageSize || 50;
                const offset = options.offset || (options.page ? (options.page - 1) * (options.pageSize || 50) : 0);
                const hasMore = totalCount > offset + (data?.length || 0);
                const nextOffset = hasMore ? offset + limit : undefined;

                return {
                    data: (data || []) as Project[],
                    count: data?.length || 0,
                    totalCount,
                    hasMore,
                    nextOffset
                };
            },
            config.retryConfig
        ).then(result => {
            if (!result.success) {
                throw result.error!;
            }
            return result.data!;
        });
    }

    /**
     * Apply filters to the query
     */
    private applyFilters(query: any, options: QueryOptions): any {
        // Status filter
        if (options.status) {
            if (Array.isArray(options.status)) {
                query = query.in('status', options.status);
            } else {
                query = query.eq('status', options.status);
            }
        }

        // Priority filter
        if (options.priority) {
            if (Array.isArray(options.priority)) {
                query = query.in('priority_level', options.priority);
            } else {
                query = query.eq('priority_level', options.priority);
            }
        }

        // Project type filter
        if (options.projectType) {
            query = query.eq('project_type', options.projectType);
        }

        // Customer organization filter
        if (options.customerId) {
            query = query.eq('customer_organization_id', options.customerId);
        }

        // Assigned user filter
        if (options.assignedTo) {
            query = query.eq('assigned_to', options.assignedTo);
        }

        // Stage filter
        if (options.stageId) {
            query = query.eq('current_stage_id', options.stageId);
        }

        // Search filter
        if (options.search) {
            const searchTerm = `%${options.search}%`;
            query = query.or(`title.ilike.${searchTerm},project_id.ilike.${searchTerm},description.ilike.${searchTerm}`);
        }

        // Tags filter
        if (options.tags && options.tags.length > 0) {
            query = query.overlaps('tags', options.tags);
        }

        // Date range filter
        if (options.dateRange) {
            query = query
                .gte(options.dateRange.field, options.dateRange.start)
                .lte(options.dateRange.field, options.dateRange.end);
        }

        // Include inactive filter
        if (!options.includeInactive) {
            query = query.neq('status', 'cancelled');
        }

        return query;
    }

    /**
     * Generate unique query ID for caching and metrics
     */
    private generateQueryId(operation: string, options: any, config: QueryConfig): string {
        const keyData = {
            operation,
            options: this.sanitizeOptions(options),
            fields: config.fields,
            organizationId: config.organizationId
        };

        return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    }

    /**
     * Sanitize options for consistent cache keys
     */
    private sanitizeOptions(options: any): any {
        const sanitized: any = {};

        Object.keys(options).forEach(key => {
            const value = options[key];
            if (value !== undefined && value !== null && value !== '') {
                sanitized[key] = value;
            }
        });

        return sanitized;
    }

    /**
     * Get cached query result
     */
    private getCachedResult(queryId: string, ttl: number): QueryResult<Project> | null {
        try {
            const cacheKey = `query_${queryId}`;
            const timestampKey = `${cacheKey}_timestamp`;

            const cachedData = localStorage.getItem(cacheKey);
            const timestamp = localStorage.getItem(timestampKey);

            if (!cachedData || !timestamp) {
                return null;
            }

            const cacheTime = parseInt(timestamp, 10);
            const now = Date.now();

            if ((now - cacheTime) > ttl) {
                // Cache expired
                localStorage.removeItem(cacheKey);
                localStorage.removeItem(timestampKey);
                return null;
            }

            return JSON.parse(cachedData);
        } catch (error) {
            console.warn('Error reading cached query result:', error);
            return null;
        }
    }

    /**
     * Set cached query result
     */
    private setCachedResult(queryId: string, result: QueryResult<Project>, ttl: number): void {
        try {
            const cacheKey = `query_${queryId}`;
            const timestampKey = `${cacheKey}_timestamp`;

            localStorage.setItem(cacheKey, JSON.stringify(result));
            localStorage.setItem(timestampKey, Date.now().toString());

            // Clean up old cache entries periodically
            this.cleanupOldCacheEntries();
        } catch (error) {
            console.warn('Error caching query result:', error);
        }
    }

    /**
     * Clean up old cache entries to prevent storage bloat
     */
    private cleanupOldCacheEntries(): void {
        try {
            const keys = Object.keys(localStorage);
            const queryKeys = keys.filter(key => key.startsWith('query_') && key.endsWith('_timestamp'));

            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            queryKeys.forEach(timestampKey => {
                const timestamp = localStorage.getItem(timestampKey);
                if (timestamp && (now - parseInt(timestamp, 10)) > maxAge) {
                    const cacheKey = timestampKey.replace('_timestamp', '');
                    localStorage.removeItem(cacheKey);
                    localStorage.removeItem(timestampKey);
                }
            });
        } catch (error) {
            console.warn('Error cleaning up cache entries:', error);
        }
    }

    /**
     * Start metrics tracking for a query
     */
    private startMetrics(queryId: string): QueryMetrics {
        const metrics: QueryMetrics = {
            queryId,
            startTime: Date.now(),
            cacheHit: false
        };

        this.queryMetrics.set(queryId, metrics);
        return metrics;
    }

    /**
     * End metrics tracking for a query
     */
    private endMetrics(queryId: string, cacheHit: boolean, recordCount: number, error?: string): void {
        const metrics = this.queryMetrics.get(queryId);
        if (metrics) {
            metrics.endTime = Date.now();
            metrics.duration = metrics.endTime - metrics.startTime;
            metrics.cacheHit = cacheHit;
            metrics.recordCount = recordCount;
            metrics.error = error;
        }
    }

    /**
     * Get query performance metrics
     */
    getMetrics(): Array<QueryMetrics> {
        return Array.from(this.queryMetrics.values());
    }

    /**
     * Get aggregated performance statistics
     */
    getPerformanceStats(): {
        totalQueries: number;
        cacheHitRate: number;
        averageQueryTime: number;
        errorRate: number;
        slowQueries: QueryMetrics[];
    } {
        const metrics = this.getMetrics();
        const totalQueries = metrics.length;

        if (totalQueries === 0) {
            return {
                totalQueries: 0,
                cacheHitRate: 0,
                averageQueryTime: 0,
                errorRate: 0,
                slowQueries: []
            };
        }

        const cacheHits = metrics.filter(m => m.cacheHit).length;
        const errors = metrics.filter(m => m.error).length;
        const completedQueries = metrics.filter(m => m.duration !== undefined);
        const totalTime = completedQueries.reduce((sum, m) => sum + (m.duration || 0), 0);
        const slowQueries = metrics.filter(m => (m.duration || 0) > 2000); // Queries over 2 seconds

        return {
            totalQueries,
            cacheHitRate: (cacheHits / totalQueries) * 100,
            averageQueryTime: completedQueries.length > 0 ? totalTime / completedQueries.length : 0,
            errorRate: (errors / totalQueries) * 100,
            slowQueries
        };
    }

    /**
     * Clear all cached query results
     */
    clearCache(): void {
        try {
            const keys = Object.keys(localStorage);
            const queryKeys = keys.filter(key => key.startsWith('query_'));

            queryKeys.forEach(key => {
                localStorage.removeItem(key);
            });

            console.log('Query cache cleared');
        } catch (error) {
            console.warn('Error clearing query cache:', error);
        }
    }

    /**
     * Clear metrics history
     */
    clearMetrics(): void {
        this.queryMetrics.clear();
        console.log('Query metrics cleared');
    }

    /**
     * Preload commonly used queries
     */
    async preloadQueries(organizationId: string): Promise<void> {
        const commonQueries = [
            // Active projects
            { status: ['active', 'inquiry_received', 'technical_review'] },
            // High priority projects
            { priority: 'high' },
            // Recent projects
            { orderBy: 'created_at', limit: 20 }
        ];

        const preloadPromises = commonQueries.map(options =>
            this.getProjects(options, {
                organizationId,
                useCache: true,
                fields: 'BASIC'
            }).catch(error => {
                console.warn('Failed to preload query:', options, error);
            })
        );

        await Promise.allSettled(preloadPromises);
        console.log('Query preloading completed');
    }
}

// Export singleton instance
export const optimizedQueryService = new OptimizedQueryService();