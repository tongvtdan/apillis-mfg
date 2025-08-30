import { Project } from '@/types/project';

const CACHE_KEY = 'apillis_projects_cache';
const CACHE_TIMESTAMP_KEY = 'apillis_projects_cache_timestamp';
const QUERY_CACHE_KEY_PREFIX = 'apillis_query_cache_';
const OFFLINE_QUEUE_KEY = 'apillis_offline_queue';
const OFFLINE_CACHE_KEY = 'apillis_offline_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for better stability
const OFFLINE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for offline
const QUERY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for query-specific cache

interface OfflineQueueItem {
    id: string;
    operation: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
    retryCount: number;
}

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
    // Offline support methods
    queueOfflineOperation: (operation: 'create' | 'update' | 'delete', data: any) => void;
    getOfflineQueue: () => OfflineQueueItem[];
    processOfflineQueue: () => Promise<void>;
    clearOfflineQueue: () => void;
    enableOfflineMode: () => void;
    getOfflineStatus: () => { isOffline: boolean; queueLength: number; lastSync?: Date };
    addProject: (project: Project) => void;
    removeProject: (projectId: string) => void;
    getLastUpdated: () => Date | null;
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
            if (!cachedData) {
                // Try offline cache if main cache is not available
                if (!navigator.onLine) {
                    const offlineCache = localStorage.getItem(OFFLINE_CACHE_KEY);
                    if (offlineCache) {
                        const cache = JSON.parse(offlineCache);
                        if (Date.now() < cache.expiresAt) {
                            console.log('📴 Using offline cache');
                            return cache.projects;
                        }
                    }
                }
                return null;
            }

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
            if (!timestamp) {
                // Check offline cache if main cache is not available
                if (!navigator.onLine) {
                    const offlineCache = localStorage.getItem(OFFLINE_CACHE_KEY);
                    if (offlineCache) {
                        const cache = JSON.parse(offlineCache);
                        return Date.now() < cache.expiresAt;
                    }
                }
                return false;
            }

            const cacheTime = parseInt(timestamp, 10);
            const now = Date.now();
            const duration = navigator.onLine ? CACHE_DURATION : OFFLINE_CACHE_DURATION;

            return (now - cacheTime) < duration;
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
    },

    // Offline support methods
    queueOfflineOperation: (operation: 'create' | 'update' | 'delete', data: any) => {
        try {
            const queueItem: OfflineQueueItem = {
                id: `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                operation,
                data,
                timestamp: Date.now(),
                retryCount: 0
            };

            const existingQueue = cacheService.getOfflineQueue();
            const updatedQueue = [...existingQueue, queueItem];

            localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
            console.log('📝 Queued offline operation:', operation, queueItem.id);
        } catch (error) {
            console.warn('📝 Failed to queue offline operation:', error);
        }
    },

    getOfflineQueue: (): OfflineQueueItem[] => {
        try {
            const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
            return queueData ? JSON.parse(queueData) : [];
        } catch (error) {
            console.warn('📝 Failed to get offline queue:', error);
            return [];
        }
    },

    processOfflineQueue: async (): Promise<void> => {
        const queue = cacheService.getOfflineQueue();
        if (queue.length === 0) return;

        console.log(`🔄 Processing ${queue.length} offline operations`);
        const processedItems: string[] = [];

        for (const item of queue) {
            try {
                // Here you would call the actual API operations
                // For now, we'll just simulate processing
                console.log(`Processing offline operation: ${item.operation} for ${item.id}`);

                // Mark as processed
                processedItems.push(item.id);
            } catch (error) {
                console.error(`Failed to process offline operation ${item.id}:`, error);

                // Increment retry count
                item.retryCount++;

                // Remove if too many retries
                if (item.retryCount >= 3) {
                    processedItems.push(item.id);
                    console.error(`Giving up on offline operation ${item.id} after 3 retries`);
                }
            }
        }

        // Remove processed items
        const remainingQueue = queue.filter(item => !processedItems.includes(item.id));
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));

        console.log(`✅ Processed ${processedItems.length} offline operations`);
    },

    clearOfflineQueue: () => {
        try {
            localStorage.removeItem(OFFLINE_QUEUE_KEY);
            console.log('🗑️ Offline queue cleared');
        } catch (error) {
            console.warn('🗑️ Failed to clear offline queue:', error);
        }
    },

    enableOfflineMode: () => {
        try {
            // Save current cache to offline storage with extended duration
            const projects = cacheService.getProjects();
            if (projects) {
                const offlineCache = {
                    projects,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + OFFLINE_CACHE_DURATION
                };
                localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(offlineCache));
                console.log('📴 Offline mode enabled, cache extended');
            }
        } catch (error) {
            console.warn('📴 Failed to enable offline mode:', error);
        }
    },

    getOfflineStatus: () => {
        const queue = cacheService.getOfflineQueue();
        const lastUpdated = cacheService.getLastUpdated();

        return {
            isOffline: !navigator.onLine,
            queueLength: queue.length,
            lastSync: lastUpdated
        };
    },

    addProject: (project: Project) => {
        try {
            const projects = cacheService.getProjects() || [];
            const updatedProjects = [...projects, project];
            cacheService.setProjects(updatedProjects);

            // Queue for offline sync if offline
            if (!navigator.onLine) {
                cacheService.queueOfflineOperation('create', project);
            }

            console.log('✅ Added project to cache:', project.id);
        } catch (error) {
            console.warn('❌ Failed to add project to cache:', error);
        }
    },

    removeProject: (projectId: string) => {
        try {
            const projects = cacheService.getProjects() || [];
            const updatedProjects = projects.filter(p => p.id !== projectId);
            cacheService.setProjects(updatedProjects);

            // Queue for offline sync if offline
            if (!navigator.onLine) {
                cacheService.queueOfflineOperation('delete', { id: projectId });
            }

            console.log('✅ Removed project from cache:', projectId);
        } catch (error) {
            console.warn('❌ Failed to remove project from cache:', error);
        }
    },

    getLastUpdated: (): Date | null => {
        try {
            const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
            return timestamp ? new Date(parseInt(timestamp, 10)) : null;
        } catch (error) {
            console.warn('❌ Failed to get last updated timestamp:', error);
            return null;
        }
    }
};