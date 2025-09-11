import { useContext } from 'react';
import { ActivityLogContext, ActivityLogContextType } from './ActivityLogProvider';

/**
 * Custom hook to access activity log context
 * Provides type-safe access to activity log state and methods
 */
export function useActivityLog(): ActivityLogContextType {
    const context = useContext(ActivityLogContext);

    if (context === undefined) {
        throw new Error('useActivityLog must be used within an ActivityLogProvider');
    }

    return context;
}

/**
 * Hook to get current activity log state
 * Returns entries, loading, and error status
 */
export function useCurrentActivityLog() {
    const {
        entries,
        filteredEntries,
        stats,
        loading,
        error,
        total,
        page,
        pageSize
    } = useActivityLog();

    return {
        entries,
        filteredEntries,
        stats,
        loading,
        error,
        total,
        page,
        pageSize,
        hasEntries: entries.length > 0,
        hasFilteredEntries: filteredEntries.length > 0,
        totalPages: Math.ceil(total / pageSize),
        isFirstPage: page === 1,
        isLastPage: page >= Math.ceil(total / pageSize)
    };
}

/**
 * Hook to manage activity log entries
 * Provides methods for creating and managing log entries
 */
export function useActivityLogManagement() {
    const {
        createEntry,
        bulkCreateEntries,
        loadEntries,
        clearEntries,
        archiveOldEntries,
        loading
    } = useActivityLog();

    return {
        createEntry,
        bulkCreateEntries,
        loadEntries,
        clearEntries,
        archiveOldEntries,
        loading
    };
}

/**
 * Hook to manage activity log filtering
 * Provides methods for filtering and searching entries
 */
export function useActivityLogFilters() {
    const {
        filters,
        setFilters,
        clearFilters,
        setPage,
        setPageSize,
        page,
        pageSize,
        total
    } = useActivityLog();

    return {
        filters,
        setFilters,
        clearFilters,
        setPage,
        setPageSize,
        page,
        pageSize,
        total,
        hasActiveFilters: Object.keys(filters).length > 0
    };
}

/**
 * Hook to get activity log statistics
 * Returns various activity statistics
 */
export function useActivityLogStats() {
    const { stats, getStats } = useActivityLog();

    return {
        stats,
        getStats,
        totalActivities: stats?.total || 0,
        recentActivities: stats?.recentActivity || 0,
        activitiesByAction: stats?.byAction || {},
        activitiesByEntityType: stats?.byEntityType || {},
        activitiesByUser: stats?.byUser || {},
        activityTrends: stats?.trends || []
    };
}

/**
 * Hook to get activity for specific entities
 * Provides methods for entity-specific activity retrieval
 */
export function useEntityActivity() {
    const {
        getEntityActivity,
        getUserActivity,
        getProjectActivity
    } = useActivityLog();

    return {
        getEntityActivity,
        getUserActivity,
        getProjectActivity
    };
}

/**
 * Hook to manage activity log export
 * Provides methods for exporting activity data
 */
export function useActivityLogExport() {
    const {
        exportEntries,
        exportFilteredEntries
    } = useActivityLog();

    return {
        exportEntries,
        exportFilteredEntries
    };
}

/**
 * Hook to manage real-time activity log updates
 * Provides methods for subscribing to real-time updates
 */
export function useActivityLogRealtime() {
    const { subscribeToUpdates } = useActivityLog();

    return {
        subscribeToUpdates
    };
}

/**
 * Hook to get activity log summary for dashboard
 * Returns summarized activity data for quick overview
 */
export function useActivityLogSummary() {
    const { stats, filteredEntries } = useActivityLog();

    const summary = {
        total: stats?.total || 0,
        recent: stats?.recentActivity || 0,
        today: filteredEntries.filter(entry => {
            const today = new Date();
            const entryDate = new Date(entry.created_at || '');
            return entryDate.toDateString() === today.toDateString();
        }).length,
        thisWeek: filteredEntries.filter(entry => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const entryDate = new Date(entry.created_at || '');
            return entryDate >= weekAgo;
        }).length,
        topActions: stats?.byAction ? Object.entries(stats.byAction)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .reduce((acc, [action, count]) => ({ ...acc, [action]: count }), {}) : {},
        topEntityTypes: stats?.byEntityType ? Object.entries(stats.byEntityType)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .reduce((acc, [type, count]) => ({ ...acc, [type]: count }), {}) : {}
    };

    return summary;
}

/**
 * Hook to manage activity log pagination
 * Provides pagination controls and state
 */
export function useActivityLogPagination() {
    const {
        page,
        pageSize,
        total,
        setPage,
        setPageSize
    } = useActivityLog();

    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const goToNextPage = () => {
        if (hasNextPage) {
            setPage(page + 1);
        }
    };

    const goToPrevPage = () => {
        if (hasPrevPage) {
            setPage(page - 1);
        }
    };

    const goToFirstPage = () => setPage(1);
    const goToLastPage = () => setPage(totalPages);

    return {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        goToNextPage,
        goToPrevPage,
        goToFirstPage,
        goToLastPage,
        setPageSize
    };
}

/**
 * Hook to manage activity log search
 * Provides search functionality
 */
export function useActivityLogSearch() {
    const { filters, setFilters } = useActivityLog();

    const searchQuery = filters.search || '';

    const setSearchQuery = (query: string) => {
        setFilters({
            ...filters,
            search: query
        });
    };

    const clearSearch = () => {
        setFilters({
            ...filters,
            search: undefined
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        clearSearch,
        hasSearch: searchQuery.length > 0
    };
}

/**
 * Hook to manage activity log date filtering
 * Provides date range filtering functionality
 */
export function useActivityLogDateFilter() {
    const { filters, setFilters } = useActivityLog();

    const dateRange = filters.dateRange;

    const setDateRange = (from?: Date, to?: Date) => {
        setFilters({
            ...filters,
            dateRange: from || to ? { from, to } : undefined
        });
    };

    const clearDateFilter = () => {
        setFilters({
            ...filters,
            dateRange: undefined
        });
    };

    const presetRanges = {
        today: () => {
            const today = new Date();
            setDateRange(today, today);
        },
        yesterday: () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            setDateRange(yesterday, yesterday);
        },
        lastWeek: () => {
            const today = new Date();
            const lastWeek = new Date();
            lastWeek.setDate(today.getDate() - 7);
            setDateRange(lastWeek, today);
        },
        lastMonth: () => {
            const today = new Date();
            const lastMonth = new Date();
            lastMonth.setMonth(today.getMonth() - 1);
            setDateRange(lastMonth, today);
        },
        lastQuarter: () => {
            const today = new Date();
            const lastQuarter = new Date();
            lastQuarter.setMonth(today.getMonth() - 3);
            setDateRange(lastQuarter, today);
        }
    };

    return {
        dateRange,
        setDateRange,
        clearDateFilter,
        presetRanges,
        hasDateFilter: !!(dateRange?.from || dateRange?.to)
    };
}

/**
 * Hook to get activity log entries by specific criteria
 * Provides filtered views of activity data
 */
export function useActivityLogEntries() {
    const { filteredEntries } = useActivityLog();

    const getEntriesByAction = (action: string) => {
        return filteredEntries.filter(entry => entry.action === action);
    };

    const getEntriesByEntityType = (entityType: string) => {
        return filteredEntries.filter(entry => entry.entity_type === entityType);
    };

    const getEntriesByUser = (userId: string) => {
        return filteredEntries.filter(entry => entry.user_id === userId);
    };

    const getEntriesByProject = (projectId: string) => {
        return filteredEntries.filter(entry => entry.project_id === projectId);
    };

    const getRecentEntries = (hours: number = 24) => {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - hours);

        return filteredEntries.filter(entry => {
            const entryDate = new Date(entry.created_at || '');
            return entryDate >= cutoff;
        });
    };

    return {
        getEntriesByAction,
        getEntriesByEntityType,
        getEntriesByUser,
        getEntriesByProject,
        getRecentEntries,
        allEntries: filteredEntries
    };
}
