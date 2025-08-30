import { Project } from '@/types/project';
import { projectService } from './projectService';
import { cacheService } from './cacheService';
import { toast } from 'sonner';

interface RetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
}

interface ServiceOptions {
    useCache?: boolean;
    timeout?: number;
    retryOptions?: RetryOptions;
    fallbackToCache?: boolean;
}

/**
 * Enhanced project service with comprehensive error handling, retry logic, and fallback mechanisms
 */
class EnhancedProjectService {
    private defaultRetryOptions: RetryOptions = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2
    };

    private defaultServiceOptions: ServiceOptions = {
        useCache: true,
        timeout: 10000,
        fallbackToCache: true,
        retryOptions: this.defaultRetryOptions
    };

    /**
     * Execute operation with retry logic and exponential backoff
     */
    private async withRetry<T>(
        operation: () => Promise<T>,
        options: RetryOptions = {}
    ): Promise<T> {
        const {
            maxRetries = this.defaultRetryOptions.maxRetries!,
            baseDelay = this.defaultRetryOptions.baseDelay!,
            maxDelay = this.defaultRetryOptions.maxDelay!,
            backoffFactor = this.defaultRetryOptions.backoffFactor!
        } = options;

        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                // Don't retry on the last attempt
                if (attempt === maxRetries) {
                    break;
                }

                // Don't retry certain types of errors
                if (!this.isRetryableError(lastError)) {
                    break;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    baseDelay * Math.pow(backoffFactor, attempt),
                    maxDelay
                );

                console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay`);

                // Add jitter to prevent thundering herd
                const jitteredDelay = delay + Math.random() * 1000;

                await this.sleep(jitteredDelay);
            }
        }

        throw lastError!;
    }

    /**
     * Check if an error is retryable
     */
    private isRetryableError(error: Error): boolean {
        const message = error.message.toLowerCase();

        // Network errors are retryable
        if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
            return true;
        }

        // Server errors (5xx) are retryable
        if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
            return true;
        }

        // Rate limiting is retryable
        if (message.includes('rate limit') || message.includes('too many requests')) {
            return true;
        }

        // Connection errors are retryable
        if (message.includes('connection') || message.includes('econnreset') || message.includes('enotfound')) {
            return true;
        }

        // Client errors (4xx) are generally not retryable
        if (message.includes('400') || message.includes('401') || message.includes('403') || message.includes('404')) {
            return false;
        }

        return false;
    }

    /**
     * Sleep utility for delays
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Execute operation with timeout
     */
    private async withTimeout<T>(
        operation: () => Promise<T>,
        timeoutMs: number
    ): Promise<T> {
        return Promise.race([
            operation(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
            )
        ]);
    }

    /**
     * Get project by ID with enhanced error handling
     */
    async getProjectById(
        id: string,
        options: ServiceOptions = {}
    ): Promise<Project | null> {
        const opts = { ...this.defaultServiceOptions, ...options };

        try {
            // Try cache first if enabled
            if (opts.useCache) {
                const cachedProject = cacheService.getProject(id);
                if (cachedProject && cacheService.isCacheValid()) {
                    console.log('✅ Returning cached project:', id);
                    return cachedProject;
                }
            }

            // Execute with retry and timeout
            const project = await this.withRetry(
                () => this.withTimeout(
                    () => projectService.getProjectById(id),
                    opts.timeout!
                ),
                opts.retryOptions
            );

            // Cache the result
            if (opts.useCache && project) {
                cacheService.setProject(project);
            }

            return project;
        } catch (error) {
            console.error('Failed to get project by ID:', error);

            // Try fallback to cache if enabled
            if (opts.fallbackToCache) {
                const cachedProject = cacheService.getProject(id);
                if (cachedProject) {
                    console.log('⚠️ Using cached project as fallback:', id);
                    toast.warning('Using cached data', {
                        description: 'Unable to fetch latest data, showing cached version.'
                    });
                    return cachedProject;
                }
            }

            // Re-throw error if no fallback available
            throw error;
        }
    }

    /**
     * Get all projects with enhanced error handling
     */
    async getAllProjects(
        filters: {
            status?: string;
            priority?: string;
            limit?: number;
            offset?: number;
        } = {},
        options: ServiceOptions = {}
    ): Promise<Project[]> {
        const opts = { ...this.defaultServiceOptions, ...options };

        try {
            // Try cache first if enabled and no filters
            if (opts.useCache && Object.keys(filters).length === 0) {
                const cachedProjects = cacheService.getProjects();
                if (cachedProjects && cacheService.isCacheValid()) {
                    console.log('✅ Returning cached projects');
                    return cachedProjects;
                }
            }

            // Execute with retry and timeout
            const projects = await this.withRetry(
                () => this.withTimeout(
                    () => projectService.getAllProjects(filters),
                    opts.timeout!
                ),
                opts.retryOptions
            );

            // Cache the result if no filters
            if (opts.useCache && Object.keys(filters).length === 0) {
                cacheService.setProjects(projects);
            }

            return projects;
        } catch (error) {
            console.error('Failed to get all projects:', error);

            // Try fallback to cache if enabled
            if (opts.fallbackToCache) {
                const cachedProjects = cacheService.getProjects();
                if (cachedProjects) {
                    console.log('⚠️ Using cached projects as fallback');
                    toast.warning('Using cached data', {
                        description: 'Unable to fetch latest data, showing cached version.'
                    });

                    // Apply filters to cached data if needed
                    if (Object.keys(filters).length > 0) {
                        return this.filterCachedProjects(cachedProjects, filters);
                    }

                    return cachedProjects;
                }
            }

            // Return empty array instead of throwing for better UX
            console.log('⚠️ No cached data available, returning empty array');
            toast.error('Unable to load projects', {
                description: 'Please check your connection and try again.'
            });

            return [];
        }
    }

    /**
     * Create project with enhanced error handling
     */
    async createProject(
        projectData: Partial<Project>,
        options: ServiceOptions = {}
    ): Promise<Project | null> {
        const opts = { ...this.defaultServiceOptions, ...options };

        try {
            const project = await this.withRetry(
                () => this.withTimeout(
                    () => projectService.createProject(projectData),
                    opts.timeout!
                ),
                opts.retryOptions
            );

            // Update cache
            if (opts.useCache && project) {
                cacheService.addProject(project);
            }

            toast.success('Project created successfully');
            return project;
        } catch (error) {
            console.error('Failed to create project:', error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error('Failed to create project', {
                description: errorMessage
            });

            throw error;
        }
    }

    /**
     * Update project with enhanced error handling
     */
    async updateProject(
        id: string,
        updates: Partial<Project>,
        options: ServiceOptions = {}
    ): Promise<Project | null> {
        const opts = { ...this.defaultServiceOptions, ...options };

        try {
            const project = await this.withRetry(
                () => this.withTimeout(
                    () => projectService.updateProject(id, updates),
                    opts.timeout!
                ),
                opts.retryOptions
            );

            // Update cache
            if (opts.useCache && project) {
                cacheService.updateProject(project);
            }

            toast.success('Project updated successfully');
            return project;
        } catch (error) {
            console.error('Failed to update project:', error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error('Failed to update project', {
                description: errorMessage
            });

            throw error;
        }
    }

    /**
     * Test connection with enhanced diagnostics
     */
    async testConnection(options: ServiceOptions = {}): Promise<{
        success: boolean;
        error?: string;
        source: 'supabase' | 'mock';
        responseTime?: number;
        details?: any;
    }> {
        const opts = { ...this.defaultServiceOptions, ...options };
        const startTime = Date.now();

        try {
            const result = await this.withTimeout(
                () => projectService.testConnection(),
                opts.timeout!
            );

            const responseTime = Date.now() - startTime;

            return {
                ...result,
                responseTime,
                details: {
                    timestamp: new Date().toISOString(),
                    responseTime,
                    cacheStatus: cacheService.isCacheValid() ? 'valid' : 'invalid',
                    cachedProjectsCount: cacheService.getProjects()?.length || 0
                }
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Connection test failed';

            return {
                success: false,
                error: errorMessage,
                source: 'supabase',
                responseTime,
                details: {
                    timestamp: new Date().toISOString(),
                    responseTime,
                    error: errorMessage,
                    cacheStatus: cacheService.isCacheValid() ? 'valid' : 'invalid',
                    cachedProjectsCount: cacheService.getProjects()?.length || 0
                }
            };
        }
    }

    /**
     * Filter cached projects based on criteria
     */
    private filterCachedProjects(
        projects: Project[],
        filters: {
            status?: string;
            priority?: string;
            limit?: number;
            offset?: number;
        }
    ): Project[] {
        let filtered = [...projects];

        // Apply status filter
        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }

        // Apply priority filter
        if (filters.priority) {
            filtered = filtered.filter(p => p.priority_level === filters.priority);
        }

        // Apply pagination
        if (filters.offset) {
            filtered = filtered.slice(filters.offset);
        }

        if (filters.limit) {
            filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
    }

    /**
     * Clear all caches
     */
    clearCache(): void {
        cacheService.clearCache();
        toast.info('Cache cleared');
    }

    /**
     * Get cache status
     */
    getCacheStatus(): {
        isValid: boolean;
        projectCount: number;
        lastUpdated?: Date;
    } {
        return {
            isValid: cacheService.isCacheValid(),
            projectCount: cacheService.getProjects()?.length || 0,
            lastUpdated: cacheService.getLastUpdated()
        };
    }

    /**
     * Preload projects for better performance
     */
    async preloadProjects(options: ServiceOptions = {}): Promise<void> {
        try {
            console.log('🔄 Preloading projects...');
            await this.getAllProjects({}, options);
            console.log('✅ Projects preloaded successfully');
        } catch (error) {
            console.warn('⚠️ Failed to preload projects:', error);
        }
    }
}

// Export singleton instance
export const enhancedProjectService = new EnhancedProjectService();