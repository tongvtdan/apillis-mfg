import { Project } from '@/types/project';

const CACHE_KEY = 'apillis_projects_cache';
const CACHE_TIMESTAMP_KEY = 'apillis_projects_cache_timestamp';
const QUERY_CACHE_KEY_PREFIX = 'apillis_query_cache_';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for better stability
const QUERY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for query-specific cache

export interface CacheService {
    setProjects: (projects: Project[]) => void;
    getProjects: () => Project[] | null;
    isCacheValid: () => boolean;
    clearCache: () => void;
    updateProject: (projectId: string, updates: Partial<Project>) => void;
    updateProjectStatus: (projectId: string, newStatus: string) => void;
    getProject: (projectId: string) => Project | null;
    validateCacheConsistency: () => boolean;
    // Query-specific caching methods
    setQueryResult: (queryKey: string, data: any) => void;
    getQueryResult: (queryKey: string) => any | null;
    isQueryCacheValid: (queryKey: string) => boolean;
    clearQueryCache: (queryKey?: string) => void;
    generateQueryKey: (filters: Record<string, any>) => string;
}

export const cacheService: CacheService = {
    setProjects: (projects: Project[]) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(projects));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
            console.warn('Failed to cache projects:', error);
        }
    },

    getProjects: (): Project[] | null => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) return null;

            const projects = JSON.parse(cachedData) as Project[];
            return projects;
        } catch (error) {
            console.warn('Failed to retrieve cached projects:', error);
            return null;
        }
    },

    isCacheValid: (): boolean => {
        try {
            const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
            if (!timestamp) return false;

            const cacheTime = parseInt(timestamp, 10);
            const now = Date.now();

            return (now - cacheTime) < CACHE_DURATION;
        } catch (error) {
            console.warn('Failed to check cache validity:', error);
            return false;
        }
    },

    clearCache: () => {
        try {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    },

    updateProject: (projectId: string, updates: Partial<Project>) => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) {
                console.warn('💾 Cache update skipped: No cached data found');
                return;
            }

            const projects = JSON.parse(cachedData) as Project[];
            const projectIndex = projects.findIndex(p => p.id === projectId);

            if (projectIndex === -1) {
                console.warn('💾 Cache update skipped: Project not found in cache:', projectId);
                return;
            }

            const updatedProjects = projects.map(project =>
                project.id === projectId
                    ? { ...project, ...updates, updated_at: new Date().toISOString() }
                    : project
            );

            localStorage.setItem(CACHE_KEY, JSON.stringify(updatedProjects));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
            console.log('💾 Cache updated for project:', projectId, 'with updates:', updates);
        } catch (error) {
            console.warn('💾 Failed to update cached project:', error);
            // Clear corrupted cache
            cacheService.clearCache();
        }
    },

    updateProjectStatus: (projectId: string, newStatus: string) => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) {
                console.warn('💾 Status update skipped: No cached data found');
                return;
            }

            const projects = JSON.parse(cachedData) as Project[];
            const projectIndex = projects.findIndex(p => p.id === projectId);

            if (projectIndex === -1) {
                console.warn('💾 Status update skipped: Project not found in cache:', projectId);
                return;
            }

            const updatedProjects = projects.map(project =>
                project.id === projectId
                    ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
                    : project
            );

            localStorage.setItem(CACHE_KEY, JSON.stringify(updatedProjects));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
            console.log('💾 Cache status updated for project:', projectId, 'to:', newStatus);
        } catch (error) {
            console.warn('💾 Failed to update cached project status:', error);
            // Clear corrupted cache
            cacheService.clearCache();
        }
    },

    getProject: (projectId: string): Project | null => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) return null;

            const projects = JSON.parse(cachedData) as Project[];
            return projects.find(project => project.id === projectId) || null;
        } catch (error) {
            console.warn('💾 Failed to retrieve cached project:', error);
            // Clear corrupted cache
            cacheService.clearCache();
            return null;
        }
    },

    validateCacheConsistency: (): boolean => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

            if (!cachedData || !timestamp) {
                return false;
            }

            // Validate JSON structure
            const projects = JSON.parse(cachedData) as Project[];

            // Basic validation - ensure all projects have required fields
            const isValid = Array.isArray(projects) && projects.every(project =>
                project.id &&
                project.project_id &&
                project.title &&
                project.status &&
                project.priority_level
            );

            if (!isValid) {
                console.warn('💾 Cache validation failed: Invalid project structure');
                cacheService.clearCache();
                return false;
            }

            return true;
        } catch (error) {
            console.warn('💾 Cache validation failed:', error);
            cacheService.clearCache();
            return false;
        }
    },

    // Query-specific caching methods
    setQueryResult: (queryKey: string, data: any) => {
        try {
            const cacheKey = `${QUERY_CACHE_KEY_PREFIX}${queryKey}`;
            const timestampKey = `${cacheKey}_timestamp`;

            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(timestampKey, Date.now().toString());

            console.log('💾 Query result cached:', queryKey);
        } catch (error) {
            console.warn('💾 Failed to cache query result:', error);
        }
    },

    getQueryResult: (queryKey: string) => {
        try {
            const cacheKey = `${QUERY_CACHE_KEY_PREFIX}${queryKey}`;
            const cachedData = localStorage.getItem(cacheKey);

            if (!cachedData) return null;

            return JSON.parse(cachedData);
        } catch (error) {
            console.warn('💾 Failed to retrieve cached query result:', error);
            return null;
        }
    },

    isQueryCacheValid: (queryKey: string): boolean => {
        try {
            const timestampKey = `${QUERY_CACHE_KEY_PREFIX}${queryKey}_timestamp`;
            const timestamp = localStorage.getItem(timestampKey);

            if (!timestamp) return false;

            const cacheTime = parseInt(timestamp, 10);
            const now = Date.now();

            return (now - cacheTime) < QUERY_CACHE_DURATION;
        } catch (error) {
            console.warn('💾 Failed to check query cache validity:', error);
            return false;
        }
    },

    clearQueryCache: (queryKey?: string) => {
        try {
            if (queryKey) {
                // Clear specific query cache
                const cacheKey = `${QUERY_CACHE_KEY_PREFIX}${queryKey}`;
                const timestampKey = `${cacheKey}_timestamp`;
                localStorage.removeItem(cacheKey);
                localStorage.removeItem(timestampKey);
            } else {
                // Clear all query caches
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(QUERY_CACHE_KEY_PREFIX)) {
                        localStorage.removeItem(key);
                    }
                });
            }
        } catch (error) {
            console.warn('💾 Failed to clear query cache:', error);
        }
    },

    generateQueryKey: (filters: Record<string, any>): string => {
        // Create a consistent query key from filters
        const sortedFilters = Object.keys(filters)
            .sort()
            .reduce((result, key) => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    result[key] = filters[key];
                }
                return result;
            }, {} as Record<string, any>);

        return btoa(JSON.stringify(sortedFilters)).replace(/[^a-zA-Z0-9]/g, '');
    }
};