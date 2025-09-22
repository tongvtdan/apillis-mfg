import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface ActivityLogEntry {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    description: string | null;
    old_values: Json | null;
    new_values: Json | null;
    created_at: string | null;
    user_id: string | null;
    metadata: Json | null;
    organization_id: string;
    user_agent: string | null;
    ip_address: unknown | null;
    project_id: string | null;
    // Joined fields
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    project?: {
        id: string;
        title: string;
        project_id: string;
        status: string;
    };
}

export interface ActivityLogFilter {
    action?: string[];
    entity_type?: string[];
    entity_id?: string;
    user_id?: string;
    project_id?: string;
    dateRange?: {
        from?: Date;
        to?: Date;
    };
    search?: string;
}

export interface ActivityLogStats {
    total: number;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
    byUser: Record<string, number>;
    recentActivity: number; // Last 24 hours
    trends: Array<{
        date: string;
        count: number;
        actions: Record<string, number>;
    }>;
}

export interface ActivityLogContextType {
    // State
    entries: ActivityLogEntry[];
    filteredEntries: ActivityLogEntry[];
    stats: ActivityLogStats | null;
    loading: boolean;
    error: string | null;

    // Current filters and pagination
    filters: ActivityLogFilter;
    page: number;
    pageSize: number;
    total: number;

    // Actions
    loadEntries: (filter?: ActivityLogFilter, page?: number) => Promise<void>;
    createEntry: (entry: Omit<ActivityLogEntry, 'id' | 'created_at' | 'organization_id'>) => Promise<ActivityLogEntry | null>;
    bulkCreateEntries: (entries: Omit<ActivityLogEntry, 'id' | 'created_at' | 'organization_id'>[]) => Promise<boolean>;

    // Filtering and search
    setFilters: (filters: ActivityLogFilter) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    clearFilters: () => void;

    // Analytics
    getStats: () => Promise<ActivityLogStats | null>;
    getEntityActivity: (entityType: string, entityId: string) => Promise<ActivityLogEntry[]>;
    getUserActivity: (userId: string) => Promise<ActivityLogEntry[]>;
    getProjectActivity: (projectId: string) => Promise<ActivityLogEntry[]>;

    // Export
    exportEntries: (format: 'csv' | 'json') => Promise<string | null>;
    exportFilteredEntries: (format: 'csv' | 'json') => Promise<string | null>;

    // Real-time
    subscribeToUpdates: (callback: (entry: ActivityLogEntry) => void) => () => void;

    // Cleanup
    clearEntries: () => void;
    archiveOldEntries: (daysOld: number) => Promise<number>;
}

export const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
    const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<ActivityLogEntry[]>([]);
    const [stats, setStats] = useState<ActivityLogStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<ActivityLogFilter>({});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [total, setTotal] = useState(0);

    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Load activity log entries
    const loadEntries = useCallback(async (
        filter: ActivityLogFilter = {},
        pageNum: number = 1
    ) => {
        if (!profile?.organization_id) return;

        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('activity_log')
                .select(`
                    *,
                    users:users (
                        id,
                        name,
                        email,
                        role
                    ),
                    projects:projects (
                        id,
                        title,
                        project_id,
                        status
                    )
                `, { count: 'exact' })
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false });

            // Apply filters
            if (filter.action?.length) {
                query = query.in('action', filter.action);
            }
            if (filter.entity_type?.length) {
                query = query.in('entity_type', filter.entity_type);
            }
            if (filter.entity_id) {
                query = query.eq('entity_id', filter.entity_id);
            }
            if (filter.user_id) {
                query = query.eq('user_id', filter.user_id);
            }
            if (filter.project_id) {
                query = query.eq('project_id', filter.project_id);
            }
            if (filter.dateRange?.from) {
                query = query.gte('created_at', filter.dateRange.from.toISOString());
            }
            if (filter.dateRange?.to) {
                query = query.lte('created_at', filter.dateRange.to.toISOString());
            }
            if (filter.search) {
                query = query.or(`description.ilike.%${filter.search}%,action.ilike.%${filter.search}%`);
            }

            // Apply pagination
            const from = (pageNum - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const { data, error: fetchError, count } = await query;

            if (fetchError) {
                throw new Error(`Failed to load activity log: ${fetchError.message}`);
            }

            const transformedEntries: ActivityLogEntry[] = (data || []).map(entry => ({
                ...entry,
                user: entry.users ? {
                    id: entry.users.id,
                    name: entry.users.name || entry.users.email?.split('@')[0] || 'Unknown',
                    email: entry.users.email || '',
                    role: entry.users.role || 'user'
                } : undefined,
                project: entry.projects ? {
                    id: entry.projects.id,
                    title: entry.projects.title || 'Unknown Project',
                    project_id: entry.projects.project_id || '',
                    status: entry.projects.status || 'unknown'
                } : undefined
            }));

            setEntries(transformedEntries);
            setFilteredEntries(transformedEntries);
            setTotal(count || 0);
            setPage(pageNum);

        } catch (err) {
            console.error('Error loading activity log:', err);
            setError('Failed to load activity log');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load activity log entries"
            });
        } finally {
            setLoading(false);
        }
    }, [profile?.organization_id, pageSize, toast]);

    // Create a single activity log entry
    const createEntry = useCallback(async (
        entry: Omit<ActivityLogEntry, 'id' | 'created_at' | 'organization_id'>
    ): Promise<ActivityLogEntry | null> => {
        if (!profile?.organization_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Organization context not available"
            });
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('activity_log')
                .insert({
                    ...entry,
                    organization_id: profile.organization_id,
                    user_id: entry.user_id || user?.id
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create activity log entry: ${error.message}`);
            }

            // Refresh entries if we're viewing the current page
            if (page === 1) {
                await loadEntries(filters, page);
            }

            return data as ActivityLogEntry;
        } catch (err) {
            console.error('Error creating activity log entry:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to log activity"
            });
            return null;
        }
    }, [profile?.organization_id, user?.id, page, filters, loadEntries, toast]);

    // Bulk create activity log entries
    const bulkCreateEntries = useCallback(async (
        entriesToCreate: Omit<ActivityLogEntry, 'id' | 'created_at' | 'organization_id'>[]
    ): Promise<boolean> => {
        if (!profile?.organization_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Organization context not available"
            });
            return false;
        }

        try {
            const entriesWithOrg = entriesToCreate.map(entry => ({
                ...entry,
                organization_id: profile.organization_id,
                user_id: entry.user_id || user?.id
            }));

            const { error } = await supabase
                .from('activity_log')
                .insert(entriesWithOrg);

            if (error) {
                throw new Error(`Failed to create activity log entries: ${error.message}`);
            }

            // Refresh entries if we're viewing the current page
            if (page === 1) {
                await loadEntries(filters, page);
            }

            return true;
        } catch (err) {
            console.error('Error bulk creating activity log entries:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to log activities"
            });
            return false;
        }
    }, [profile?.organization_id, user?.id, page, filters, loadEntries, toast]);

    // Set filters and reload
    const handleSetFilters = useCallback((newFilters: ActivityLogFilter) => {
        setFilters(newFilters);
        loadEntries(newFilters, 1);
    }, [loadEntries]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        const emptyFilters = {};
        setFilters(emptyFilters);
        loadEntries(emptyFilters, 1);
    }, [loadEntries]);

    // Get activity statistics
    const getStats = useCallback(async (): Promise<ActivityLogStats | null> => {
        if (!profile?.organization_id) return null;

        try {
            // Get total count and basic stats
            const { data: statsData, error: statsError } = await supabase
                .from('activity_log')
                .select('action, entity_type, user_id, created_at')
                .eq('organization_id', profile.organization_id);

            if (statsError) throw statsError;

            const entries = statsData || [];
            const stats: ActivityLogStats = {
                total: entries.length,
                byAction: {},
                byEntityType: {},
                byUser: {},
                recentActivity: 0,
                trends: []
            };

            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Calculate statistics
            entries.forEach(entry => {
                // Count by action
                stats.byAction[entry.action] = (stats.byAction[entry.action] || 0) + 1;

                // Count by entity type
                stats.byEntityType[entry.entity_type] = (stats.byEntityType[entry.entity_type] || 0) + 1;

                // Count by user
                if (entry.user_id) {
                    stats.byUser[entry.user_id] = (stats.byUser[entry.user_id] || 0) + 1;
                }

                // Count recent activity
                if (new Date(entry.created_at) >= twentyFourHoursAgo) {
                    stats.recentActivity++;
                }
            });

            // Calculate trends (last 7 days)
            const trends: Record<string, { count: number; actions: Record<string, number> }> = {};

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                trends[dateStr] = { count: 0, actions: {} };
            }

            entries.forEach(entry => {
                const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
                if (trends[entryDate]) {
                    trends[entryDate].count++;
                    trends[entryDate].actions[entry.action] = (trends[entryDate].actions[entry.action] || 0) + 1;
                }
            });

            stats.trends = Object.entries(trends).map(([date, data]) => ({
                date,
                count: data.count,
                actions: data.actions
            }));

            setStats(stats);
            return stats;
        } catch (err) {
            console.error('Error getting activity stats:', err);
            return null;
        }
    }, [profile?.organization_id]);

    // Get activity for specific entity
    const getEntityActivity = useCallback(async (
        entityType: string,
        entityId: string
    ): Promise<ActivityLogEntry[]> => {
        if (!profile?.organization_id) return [];

        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select(`
                    *,
                    users:users (
                        id,
                        name,
                        email,
                        role
                    )
                `)
                .eq('organization_id', profile.organization_id)
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            return (data || []).map(entry => ({
                ...entry,
                user: entry.users ? {
                    id: entry.users.id,
                    name: entry.users.name || entry.users.email?.split('@')[0] || 'Unknown',
                    email: entry.users.email || '',
                    role: entry.users.role || 'user'
                } : undefined
            })) as ActivityLogEntry[];
        } catch (err) {
            console.error('Error getting entity activity:', err);
            return [];
        }
    }, [profile?.organization_id]);

    // Get activity for specific user
    const getUserActivity = useCallback(async (userId: string): Promise<ActivityLogEntry[]> => {
        if (!profile?.organization_id) return [];

        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select(`
                    *,
                    projects:projects (
                        id,
                        title,
                        project_id
                    )
                `)
                .eq('organization_id', profile.organization_id)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            return (data || []).map(entry => ({
                ...entry,
                project: entry.projects ? {
                    id: entry.projects.id,
                    title: entry.projects.title || 'Unknown Project',
                    project_id: entry.projects.project_id || '',
                    status: entry.projects.status || 'unknown'
                } : undefined
            })) as ActivityLogEntry[];
        } catch (err) {
            console.error('Error getting user activity:', err);
            return [];
        }
    }, [profile?.organization_id]);

    // Get activity for specific project
    const getProjectActivity = useCallback(async (projectId: string): Promise<ActivityLogEntry[]> => {
        if (!profile?.organization_id) return [];

        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select(`
                    *,
                    users:users (
                        id,
                        name,
                        email,
                        role
                    )
                `)
                .eq('organization_id', profile.organization_id)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            return (data || []).map(entry => ({
                ...entry,
                user: entry.users ? {
                    id: entry.users.id,
                    name: entry.users.name || entry.users.email?.split('@')[0] || 'Unknown',
                    email: entry.users.email || '',
                    role: entry.users.role || 'user'
                } : undefined
            })) as ActivityLogEntry[];
        } catch (err) {
            console.error('Error getting project activity:', err);
            return [];
        }
    }, [profile?.organization_id]);

    // Export entries
    const exportEntries = useCallback(async (format: 'csv' | 'json'): Promise<string | null> => {
        try {
            if (format === 'json') {
                return JSON.stringify(filteredEntries, null, 2);
            } else {
                // CSV export
                if (filteredEntries.length === 0) return '';

                const headers = [
                    'Date',
                    'Action',
                    'Entity Type',
                    'Entity ID',
                    'User',
                    'Description',
                    'Project'
                ];

                const csvRows = [
                    headers.join(','),
                    ...filteredEntries.map(entry => [
                        entry.created_at,
                        entry.action,
                        entry.entity_type,
                        entry.entity_id,
                        entry.user?.name || 'Unknown',
                        entry.description || '',
                        entry.project?.title || ''
                    ].map(field => `"${field}"`).join(','))
                ];

                return csvRows.join('\n');
            }
        } catch (err) {
            console.error('Error exporting entries:', err);
            return null;
        }
    }, [filteredEntries]);

    // Export filtered entries (same as exportEntries for now)
    const exportFilteredEntries = useCallback(async (format: 'csv' | 'json'): Promise<string | null> => {
        return exportEntries(format);
    }, [exportEntries]);

    // Subscribe to real-time updates
    const subscribeToUpdates = useCallback((callback: (entry: ActivityLogEntry) => void) => {
        if (!profile?.organization_id) return () => { };

        const channel = supabase
            .channel('activity_log_updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activity_log',
                    filter: `organization_id=eq.${profile.organization_id}`
                },
                (payload) => {
                    const newEntry = payload.new as ActivityLogEntry;
                    callback(newEntry);
                    // Optionally refresh the current page
                    loadEntries(filters, page);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.organization_id, filters, page, loadEntries]);

    // Clear all entries from state
    const clearEntries = useCallback(() => {
        setEntries([]);
        setFilteredEntries([]);
        setTotal(0);
    }, []);

    // Archive old entries
    const archiveOldEntries = useCallback(async (daysOld: number): Promise<number> => {
        if (!profile?.organization_id) return 0;

        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const { data, error } = await supabase
                .from('activity_log')
                .delete()
                .eq('organization_id', profile.organization_id)
                .lt('created_at', cutoffDate.toISOString());

            if (error) throw error;

            // Refresh current view
            await loadEntries(filters, page);

            return data?.length || 0;
        } catch (err) {
            console.error('Error archiving old entries:', err);
            return 0;
        }
    }, [profile?.organization_id, filters, page, loadEntries]);

    // Initial load and refresh stats
    useEffect(() => {
        if (user && profile?.organization_id) {
            loadEntries();
            getStats();
        }
    }, [user, profile?.organization_id, loadEntries, getStats]);

    const value: ActivityLogContextType = {
        entries,
        filteredEntries,
        stats,
        loading,
        error,
        filters,
        page,
        pageSize,
        total,
        loadEntries,
        createEntry,
        bulkCreateEntries,
        setFilters: handleSetFilters,
        setPage,
        setPageSize,
        clearFilters,
        getStats,
        getEntityActivity,
        getUserActivity,
        getProjectActivity,
        exportEntries,
        exportFilteredEntries,
        subscribeToUpdates,
        clearEntries,
        archiveOldEntries
    };

    return (
        <ActivityLogContext.Provider value={value}>
            {children}
        </ActivityLogContext.Provider>
    );
}

export function useActivityLog() {
    const context = useContext(ActivityLogContext);
    if (context === undefined) {
        throw new Error('useActivityLog must be used within an ActivityLogProvider');
    }
    return context;
}
