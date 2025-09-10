import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    FileText,
    Search,
    Filter,
    RefreshCw,
    Eye,
    User,
    Shield,
    Key
} from 'lucide-react';
import { usePermissionsAdmin } from '@/core/auth/hooks/usePermissionsAdmin';
import { format } from 'date-fns';

export default function AuditLog() {
    const { auditLog, users, loadAuditLog, loading } = usePermissionsAdmin();

    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [userFilter, setUserFilter] = useState<string>('all');

    // Filter audit log entries
    const filteredAuditLog = useMemo(() => {
        return auditLog.filter(entry => {
            const matchesSearch = !searchQuery ||
                entry.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.entity_type.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesAction = actionFilter === 'all' || entry.action_type === actionFilter;
            const matchesEntity = entityFilter === 'all' || entry.entity_type === entityFilter;
            const matchesUser = userFilter === 'all' ||
                entry.user_id === userFilter ||
                entry.target_user_id === userFilter;

            return matchesSearch && matchesAction && matchesEntity && matchesUser;
        });
    }, [auditLog, searchQuery, actionFilter, entityFilter, userFilter]);

    // Get unique values for filters
    const uniqueActions = useMemo(() => {
        const actions = new Set(auditLog.map(entry => entry.action_type));
        return Array.from(actions);
    }, [auditLog]);

    const uniqueEntities = useMemo(() => {
        const entities = new Set(auditLog.map(entry => entry.entity_type));
        return Array.from(entities);
    }, [auditLog]);

    const uniqueUsers = useMemo(() => {
        const userIds = new Set([
            ...auditLog.map(entry => entry.user_id),
            ...auditLog.map(entry => entry.target_user_id).filter(Boolean)
        ]);
        return Array.from(userIds);
    }, [auditLog]);

    const getActionIcon = (actionType: string) => {
        if (actionType.includes('grant') || actionType.includes('assign')) {
            return <Shield className="h-4 w-4 text-green-600" />;
        }
        if (actionType.includes('deny') || actionType.includes('revoke') || actionType.includes('remove')) {
            return <Shield className="h-4 w-4 text-red-600" />;
        }
        if (actionType.includes('role') || actionType.includes('permission')) {
            return <Key className="h-4 w-4 text-blue-600" />;
        }
        return <FileText className="h-4 w-4 text-gray-600" />;
    };

    const getActionBadgeColor = (actionType: string) => {
        if (actionType.includes('grant') || actionType.includes('assign') || actionType.includes('create')) {
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        }
        if (actionType.includes('deny') || actionType.includes('revoke') || actionType.includes('remove') || actionType.includes('delete')) {
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        }
        if (actionType.includes('update') || actionType.includes('toggle')) {
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        }
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    };

    const getUserName = (userId: string | null) => {
        if (!userId) return 'System';
        const user = users.find(u => u.userId === userId);
        return user ? user.name : `User ${userId.slice(0, 8)}`;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
        } catch {
            return dateString;
        }
    };

    const handleRefresh = () => {
        loadAuditLog();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Permission Audit Log
                            </CardTitle>
                            <CardDescription>
                                View detailed audit trail of all permission-related changes and user actions.
                            </CardDescription>
                        </div>
                        <Button onClick={handleRefresh} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Audit Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Total Events</p>
                                <p className="text-2xl font-bold text-base-content">{auditLog.length}</p>
                            </div>
                            <FileText className="h-8 w-8 text-base-content/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Grant Actions</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {auditLog.filter(e => e.action_type.includes('grant')).length}
                                </p>
                            </div>
                            <Shield className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Revoke Actions</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {auditLog.filter(e => e.action_type.includes('revoke') || e.action_type.includes('deny')).length}
                                </p>
                            </div>
                            <Shield className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Role Changes</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {auditLog.filter(e => e.action_type.includes('role')).length}
                                </p>
                            </div>
                            <Key className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-base-content/70" />
                            <Input
                                placeholder="Search audit log..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {uniqueActions.map(action => (
                                    <SelectItem key={action} value={action}>{action.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={entityFilter} onValueChange={setEntityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by entity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Entities</SelectItem>
                                {uniqueEntities.map(entity => (
                                    <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={userFilter} onValueChange={setUserFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by user" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {uniqueUsers.map(userId => (
                                    <SelectItem key={userId} value={userId}>
                                        {getUserName(userId)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Log Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Audit Events ({filteredAuditLog.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Target User</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Loading audit log...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAuditLog.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            {auditLog.length === 0 ? 'No audit events found.' : 'No events match your filters.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAuditLog.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {formatDate(entry.created_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getActionIcon(entry.action_type)}
                                                    <Badge className={getActionBadgeColor(entry.action_type)}>
                                                        {entry.action_type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-base-content/70" />
                                                    <span className="text-sm">{getUserName(entry.user_id)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {entry.target_user_id ? (
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-base-content/70" />
                                                        <span className="text-sm">{getUserName(entry.target_user_id)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-base-content/50">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {entry.entity_type}
                                                </Badge>
                                                {entry.entity_id && (
                                                    <div className="text-xs text-base-content/70 font-mono mt-1">
                                                        ID: {entry.entity_id.slice(0, 8)}...
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {entry.reason && (
                                                        <div className="text-sm text-base-content/80">
                                                            {entry.reason}
                                                        </div>
                                                    )}
                                                    {entry.old_values && (
                                                        <div className="text-xs text-red-600">
                                                            Old: {JSON.stringify(entry.old_values)}
                                                        </div>
                                                    )}
                                                    {entry.new_values && (
                                                        <div className="text-xs text-green-600">
                                                            New: {JSON.stringify(entry.new_values)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
