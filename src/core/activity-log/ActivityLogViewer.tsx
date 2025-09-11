import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Search,
    Filter,
    Download,
    RefreshCw,
    Calendar,
    User,
    FileText,
    Settings,
    Activity,
    Eye,
    Edit,
    Trash2,
    Plus,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { useCurrentActivityLog, useActivityLogFilters, useActivityLogPagination, useActivityLogSearch, useActivityLogDateFilter, useActivityLogExport } from './useActivityLog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ActivityLogViewerProps {
    className?: string;
    showFilters?: boolean;
    showExport?: boolean;
    showPagination?: boolean;
    maxHeight?: string;
}

export function ActivityLogViewer({
    className,
    showFilters = true,
    showExport = true,
    showPagination = true,
    maxHeight = "600px"
}: ActivityLogViewerProps) {
    const {
        filteredEntries,
        loading,
        error,
        total,
        totalPages,
        page,
        pageSize
    } = useCurrentActivityLog();

    const { filters, setFilters, clearFilters } = useActivityLogFilters();
    const { setPage, setPageSize, goToNextPage, goToPrevPage, goToFirstPage, goToLastPage } = useActivityLogPagination();
    const { searchQuery, setSearchQuery, clearSearch } = useActivityLogSearch();
    const { dateRange, setDateRange, clearDateFilter } = useActivityLogDateFilter();
    const { exportEntries } = useActivityLogExport();

    const [activeTab, setActiveTab] = useState('all');

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const actions = [...new Set(filteredEntries.map(e => e.action))].sort();
        const entityTypes = [...new Set(filteredEntries.map(e => e.entity_type))].sort();
        const users = [...new Set(filteredEntries.map(e => e.user_id).filter(Boolean))];
        const projects = [...new Set(filteredEntries.map(e => e.project_id).filter(Boolean))];

        return { actions, entityTypes, users, projects };
    }, [filteredEntries]);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'view':
            case 'read':
                return <Eye className="h-4 w-4 text-blue-500" />;
            case 'create':
            case 'add':
                return <Plus className="h-4 w-4 text-green-500" />;
            case 'update':
            case 'edit':
                return <Edit className="h-4 w-4 text-orange-500" />;
            case 'delete':
            case 'remove':
                return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'login':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'logout':
                return <XCircle className="h-4 w-4 text-gray-500" />;
            case 'export':
                return <Download className="h-4 w-4 text-purple-500" />;
            default:
                return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'view':
            case 'read':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'create':
            case 'add':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'update':
            case 'edit':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'delete':
            case 'remove':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'login':
                return 'text-green-700 bg-green-100 border-green-300';
            case 'logout':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            case 'export':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getEntityTypeIcon = (entityType: string) => {
        switch (entityType) {
            case 'user':
                return <User className="h-4 w-4" />;
            case 'project':
                return <FileText className="h-4 w-4" />;
            case 'document':
                return <FileText className="h-4 w-4" />;
            case 'organization':
                return <Settings className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2) || '??';
    };

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const data = await exportEntries(format);
            if (data) {
                const blob = new Blob([data], {
                    type: format === 'csv' ? 'text/csv' : 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `activity-log.${format}`;
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const filteredEntriesByTab = useMemo(() => {
        if (activeTab === 'all') return filteredEntries;

        switch (activeTab) {
            case 'users':
                return filteredEntries.filter(e => e.entity_type === 'user');
            case 'projects':
                return filteredEntries.filter(e => e.entity_type === 'project');
            case 'documents':
                return filteredEntries.filter(e => e.entity_type === 'document');
            case 'system':
                return filteredEntries.filter(e => e.entity_type === 'organization' || e.entity_type === 'system');
            default:
                return filteredEntries;
        }
    }, [filteredEntries, activeTab]);

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Failed to Load Activity Log</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Activity Log</span>
                        <Badge variant="outline" className="ml-2">
                            {total} entries
                        </Badge>
                    </CardTitle>

                    <div className="flex items-center space-x-2">
                        {showExport && (
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv')}
                                    disabled={loading}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('json')}
                                    disabled={loading}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    JSON
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search and Quick Filters */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <div className="relative flex-1 min-w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search activities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {showFilters && (
                        <>
                            <Select
                                value={filters.action?.[0] || 'all'}
                                onValueChange={(value) => setFilters({
                                    ...filters,
                                    action: value === 'all' ? undefined : [value]
                                })}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    {filterOptions.actions.map(action => (
                                        <SelectItem key={action} value={action}>
                                            {action.charAt(0).toUpperCase() + action.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.entity_type?.[0] || 'all'}
                                onValueChange={(value) => setFilters({
                                    ...filters,
                                    entity_type: value === 'all' ? undefined : [value]
                                })}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Entity Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {filterOptions.entityTypes.map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                disabled={!Object.keys(filters).length && !searchQuery}
                            >
                                Clear Filters
                            </Button>
                        </>
                    )}
                </div>

                {/* Activity Type Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList>
                        <TabsTrigger value="all">
                            All ({filteredEntries.length})
                        </TabsTrigger>
                        <TabsTrigger value="users">
                            Users ({filteredEntries.filter(e => e.entity_type === 'user').length})
                        </TabsTrigger>
                        <TabsTrigger value="projects">
                            Projects ({filteredEntries.filter(e => e.entity_type === 'project').length})
                        </TabsTrigger>
                        <TabsTrigger value="documents">
                            Documents ({filteredEntries.filter(e => e.entity_type === 'document').length})
                        </TabsTrigger>
                        <TabsTrigger value="system">
                            System ({filteredEntries.filter(e => e.entity_type === 'organization' || e.entity_type === 'system').length})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        <span>Loading activities...</span>
                    </div>
                ) : filteredEntriesByTab.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Activities Found</h3>
                        <p className="text-muted-foreground">
                            {filteredEntries.length === 0
                                ? 'No activity has been logged yet.'
                                : 'Try adjusting your filters to see more activities.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3" style={{ maxHeight }}>
                        {filteredEntriesByTab.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                {/* Action Icon */}
                                <div className="flex-shrink-0">
                                    {getActionIcon(entry.action)}
                                </div>

                                {/* User Avatar */}
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src="" alt={entry.user?.name} />
                                    <AvatarFallback className="text-xs">
                                        {getInitials(entry.user?.name || 'Unknown')}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Activity Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-sm truncate">
                                            {entry.user?.name || 'Unknown User'}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={cn("text-xs", getActionColor(entry.action))}
                                        >
                                            {entry.action.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {getEntityTypeIcon(entry.entity_type)}
                                            <span className="ml-1">
                                                {entry.entity_type}
                                            </span>
                                        </Badge>
                                    </div>

                                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                        <span className="flex items-center space-x-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {entry.created_at
                                                    ? format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')
                                                    : 'Unknown time'
                                                }
                                            </span>
                                        </span>

                                        {entry.project && (
                                            <span className="truncate max-w-32">
                                                Project: {entry.project.title}
                                            </span>
                                        )}

                                        {entry.user_agent && (
                                            <span className="truncate max-w-32">
                                                {entry.user_agent.split(' ')[0]}
                                            </span>
                                        )}
                                    </div>

                                    {entry.description && (
                                        <p className="text-sm text-muted-foreground mt-2 truncate">
                                            {entry.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {showPagination && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} entries
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Select
                                value={pageSize.toString()}
                                onValueChange={(value) => setPageSize(parseInt(value))}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToFirstPage}
                                    disabled={page === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToPrevPage}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm px-3">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToNextPage}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToLastPage}
                                    disabled={page === totalPages}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Compact activity log component for dashboards
 */
export function ActivityLogSummary({
    className,
    limit = 5
}: {
    className?: string;
    limit?: number;
}) {
    const { filteredEntries, loading } = useCurrentActivityLog();

    const recentEntries = filteredEntries.slice(0, limit);

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading activities...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {recentEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                    <div className="space-y-3">
                        {recentEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center space-x-3 text-sm">
                                {getActionIcon(entry.action)}
                                <div className="flex-1 min-w-0">
                                    <p className="truncate">
                                        <span className="font-medium">
                                            {entry.user?.name || 'Unknown'}
                                        </span>
                                        {' '}
                                        {entry.action.replace('_', ' ')}
                                        {entry.entity_type && (
                                            <span className="text-muted-foreground">
                                                {' '}{entry.entity_type}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {entry.created_at
                                            ? format(new Date(entry.created_at), 'MMM d, HH:mm')
                                            : 'Unknown time'
                                        }
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Helper function for action icons (used in both components)
function getActionIcon(action: string) {
    switch (action) {
        case 'view':
        case 'read':
            return <Eye className="h-4 w-4 text-blue-500" />;
        case 'create':
        case 'add':
            return <Plus className="h-4 w-4 text-green-500" />;
        case 'update':
        case 'edit':
            return <Edit className="h-4 w-4 text-orange-500" />;
        case 'delete':
        case 'remove':
            return <Trash2 className="h-4 w-4 text-red-500" />;
        case 'login':
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'logout':
            return <XCircle className="h-4 w-4 text-gray-500" />;
        case 'export':
            return <Download className="h-4 w-4 text-purple-500" />;
        default:
            return <Activity className="h-4 w-4 text-gray-500" />;
    }
}
