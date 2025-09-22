import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Shield,
    Eye,
    Download,
    Edit,
    Trash2,
    User,
    Calendar,
    Filter,
    Search,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client.js';

interface DocumentAccessLogEntry {
    id: string;
    document_id: string;
    user_id: string;
    action: 'view' | 'download' | 'edit' | 'delete' | 'share' | 'access_denied';
    ip_address?: string;
    user_agent?: string;
    timestamp: string;
    metadata?: Record<string, any>;
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

interface DocumentAccessLogProps {
    documentId: string;
    className?: string;
    maxEntries?: number;
    showFilters?: boolean;
}

export function DocumentAccessLog({
    documentId,
    className,
    maxEntries = 50,
    showFilters = true
}: DocumentAccessLogProps) {
    const [entries, setEntries] = useState<DocumentAccessLogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        action: 'all',
        user: 'all',
        dateRange: 'all'
    });

    const loadAccessLog = useCallback(async () => {
        if (!documentId) return;

        try {
            setLoading(true);
            setError(null);

            // Load access log entries from activity_log table
            // Note: This assumes activity_log has been extended to track document access
            const { data, error: fetchError } = await supabase
                .from('activity_log')
                .select(`
                    id,
                    user_id,
                    action,
                    entity_type,
                    entity_id,
                    old_values,
                    new_values,
                    user_agent,
                    created_at,
                    users:users (
                        id,
                        name,
                        email,
                        role
                    )
                `)
                .eq('entity_type', 'document')
                .eq('entity_id', documentId)
                .order('created_at', { ascending: false })
                .limit(maxEntries);

            if (fetchError) {
                throw new Error(`Failed to load access log: ${fetchError.message}`);
            }

            // Transform the data to match our interface
            const transformedEntries: DocumentAccessLogEntry[] = (data || []).map(entry => ({
                id: entry.id,
                document_id: documentId,
                user_id: entry.user_id,
                action: entry.action as DocumentAccessLogEntry['action'],
                timestamp: entry.created_at,
                user_agent: entry.user_agent,
                metadata: entry.new_values as Record<string, any>,
                user: entry.users ? {
                    id: entry.users.id,
                    name: entry.users.name || entry.users.email?.split('@')[0] || 'Unknown',
                    email: entry.users.email || '',
                    role: entry.users.role || 'user'
                } : undefined
            }));

            setEntries(transformedEntries);
        } catch (err) {
            console.error('Error loading access log:', err);
            setError('Failed to load access log');
        } finally {
            setLoading(false);
        }
    }, [documentId, maxEntries]);

    useEffect(() => {
        loadAccessLog();
    }, [loadAccessLog]);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'view':
                return <Eye className="h-4 w-4 text-blue-500" />;
            case 'download':
                return <Download className="h-4 w-4 text-green-500" />;
            case 'edit':
                return <Edit className="h-4 w-4 text-orange-500" />;
            case 'delete':
                return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'share':
                return <User className="h-4 w-4 text-purple-500" />;
            case 'access_denied':
                return <Shield className="h-4 w-4 text-red-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'view':
                return 'text-blue-600 bg-blue-50';
            case 'download':
                return 'text-green-600 bg-green-50';
            case 'edit':
                return 'text-orange-600 bg-orange-50';
            case 'delete':
                return 'text-red-600 bg-red-50';
            case 'share':
                return 'text-purple-600 bg-purple-50';
            case 'access_denied':
                return 'text-red-700 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-50';
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

    const filteredEntries = entries.filter(entry => {
        if (filters.action !== 'all' && entry.action !== filters.action) return false;
        if (filters.user !== 'all' && entry.user_id !== filters.user) return false;

        if (filters.dateRange !== 'all') {
            const entryDate = new Date(entry.timestamp);
            const now = new Date();
            const days = parseInt(filters.dateRange);

            if (now.getTime() - entryDate.getTime() > days * 24 * 60 * 60 * 1000) {
                return false;
            }
        }

        return true;
    });

    const uniqueUsers = [...new Set(entries.map(e => e.user_id))].filter(Boolean);
    const uniqueActions = [...new Set(entries.map(e => e.action))];

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Access Log</span>
                        <Badge variant="outline" className="ml-2">
                            {filteredEntries.length} entries
                        </Badge>
                    </CardTitle>

                    {showFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadAccessLog}
                            disabled={loading}
                        >
                            <Activity className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    )}
                </div>

                {/* Filters */}
                {showFilters && uniqueUsers.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>

                        <Select
                            value={filters.action}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {uniqueActions.map(action => (
                                    <SelectItem key={action} value={action}>
                                        {action.charAt(0).toUpperCase() + action.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.user}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, user: value }))}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {uniqueUsers.map(userId => {
                                    const user = entries.find(e => e.user_id === userId)?.user;
                                    return (
                                        <SelectItem key={userId} value={userId}>
                                            {user?.name || user?.email || 'Unknown User'}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.dateRange}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Time Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="1">Last 24h</SelectItem>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                                <SelectItem value="90">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Loading access log...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Failed to Load Access Log</h3>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button variant="outline" onClick={loadAccessLog}>
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-12">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {entries.length === 0 ? 'No Access Records' : 'No Matching Records'}
                        </h3>
                        <p className="text-muted-foreground">
                            {entries.length === 0
                                ? 'This document has not been accessed yet.'
                                : 'Try adjusting your filters to see more records.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                {/* Action Icon */}
                                <div className="flex-shrink-0">
                                    {getActionIcon(entry.action)}
                                </div>

                                {/* User Info */}
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarImage src="" alt={entry.user?.name} />
                                        <AvatarFallback className="text-xs">
                                            {getInitials(entry.user?.name || 'Unknown')}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-sm truncate">
                                                {entry.user?.name || 'Unknown User'}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", getActionColor(entry.action))}
                                            >
                                                {entry.action.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center space-x-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}
                                                </span>
                                            </span>

                                            {entry.user?.email && (
                                                <span className="truncate max-w-32">
                                                    {entry.user.email}
                                                </span>
                                            )}

                                            {entry.user?.role && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {entry.user.role}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata */}
                                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                                    <div className="flex-shrink-0 text-xs text-muted-foreground max-w-48 truncate">
                                        {Object.entries(entry.metadata).map(([key, value]) => (
                                            <div key={key}>
                                                {key}: {String(value)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Compact access log summary component
 */
export function DocumentAccessLogSummary({
    documentId,
    className
}: {
    documentId: string;
    className?: string;
}) {
    const [stats, setStats] = useState({
        totalViews: 0,
        totalDownloads: 0,
        uniqueUsers: 0,
        lastAccessed: null as string | null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            if (!documentId) return;

            try {
                setLoading(true);

                // This would typically fetch from a dedicated stats table or aggregate from activity_log
                const { data, error } = await supabase
                    .from('activity_log')
                    .select('action, user_id, created_at')
                    .eq('entity_type', 'document')
                    .eq('entity_id', documentId)
                    .order('created_at', { ascending: false })
                    .limit(1000);

                if (error) throw error;

                const entries = data || [];
                const uniqueUsers = new Set(entries.map(e => e.user_id));

                const summary = {
                    totalViews: entries.filter(e => e.action === 'view').length,
                    totalDownloads: entries.filter(e => e.action === 'download').length,
                    uniqueUsers: uniqueUsers.size,
                    lastAccessed: entries.length > 0 ? entries[0].created_at : null
                };

                setStats(summary);
            } catch (error) {
                console.error('Error loading access stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [documentId]);

    if (loading) {
        return (
            <div className={cn("flex items-center space-x-2", className)}>
                <Activity className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading stats...</span>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
            <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <div className="text-xs text-muted-foreground">Views</div>
            </div>

            <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                    <Download className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{stats.totalDownloads}</div>
                <div className="text-xs text-muted-foreground">Downloads</div>
            </div>

            <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                    <User className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
                <div className="text-xs text-muted-foreground">Unique Users</div>
            </div>

            <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-sm">
                    {stats.lastAccessed
                        ? format(new Date(stats.lastAccessed), 'MMM d')
                        : 'Never'
                    }
                </div>
                <div className="text-xs text-muted-foreground">Last Access</div>
            </div>
        </div>
    );
}
