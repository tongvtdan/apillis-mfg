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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Search,
    Filter,
    Users,
    Edit,
    Shield,
    ShieldCheck,
    ShieldX,
    UserPlus,
    RefreshCw
} from 'lucide-react';
import { usePermissionsAdmin } from '@/hooks/usePermissionsAdmin';
import { Permission } from '@/services/permissionService';

export default function UserManagement() {
    const {
        users,
        permissions,
        loading,
        selectedUser,
        setSelectedUser,
        grantUserPermission,
        denyUserPermission,
        revokeUserPermission,
        refreshData
    } = usePermissionsAdmin();

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [permissionAction, setPermissionAction] = useState<'grant' | 'deny' | 'revoke'>('grant');
    const [permissionReason, setPermissionReason] = useState('');

    // Filter users based on search and role
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = !searchQuery ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesRole = roleFilter === 'all' || user.baseRole === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    // Group permissions by resource
    const permissionsByResource = useMemo(() => {
        const grouped: Record<string, Permission[]> = {};
        permissions.forEach(permission => {
            if (!grouped[permission.resource]) {
                grouped[permission.resource] = [];
            }
            grouped[permission.resource].push(permission);
        });
        return grouped;
    }, [permissions]);

    // Get unique roles for filter
    const uniqueRoles = useMemo(() => {
        const roles = new Set(users.map(user => user.baseRole));
        return Array.from(roles);
    }, [users]);

    const handlePermissionAction = async () => {
        if (!selectedUser || !selectedPermission) return;

        try {
            switch (permissionAction) {
                case 'grant':
                    await grantUserPermission(selectedUser.userId, selectedPermission.id, permissionReason);
                    break;
                case 'deny':
                    await denyUserPermission(selectedUser.userId, selectedPermission.id, permissionReason);
                    break;
                case 'revoke':
                    await revokeUserPermission(selectedUser.userId, selectedPermission.id);
                    break;
            }

            setPermissionDialogOpen(false);
            setSelectedPermission(null);
            setPermissionReason('');
        } catch (error) {
            // Error is handled in the hook
        }
    };

    const getPermissionStatus = (userId: string, permissionName: string) => {
        const user = users.find(u => u.userId === userId);
        if (!user) return 'inherited';

        // Check for explicit grants
        const granted = user.grantedPermissions.some(p => p.name === permissionName);
        if (granted) return 'granted';

        // Check for explicit denials
        const denied = user.deniedPermissions.some(p => p.name === permissionName);
        if (denied) return 'denied';

        return 'inherited';
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'management': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'sales': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'procurement': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'engineering': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'qa': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'production': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const getPermissionStatusColor = (status: string) => {
        switch (status) {
            case 'granted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'denied': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Permission Management
                            </CardTitle>
                            <CardDescription>
                                Manage user permissions, roles, and access controls across your organization.
                            </CardDescription>
                        </div>
                        <Button onClick={refreshData} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Search & Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-base-content/70" />
                            <Input
                                placeholder="Search users by name, email, or department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {uniqueRoles.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Custom Roles</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Loading users...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No users found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.userId}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-base-content/70">{user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getRoleBadgeColor(user.baseRole)}>
                                                    {user.baseRole}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.department || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.customRoles.map(role => (
                                                        <Badge key={role.id} variant="outline" className="text-xs">
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                    {user.customRoles.length === 0 && (
                                                        <span className="text-sm text-base-content/50">None</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                                    {user.status || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedUser(user)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Dialog open={permissionDialogOpen && selectedUser?.userId === user.userId} onOpenChange={setPermissionDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setPermissionDialogOpen(true);
                                                                }}
                                                            >
                                                                <Shield className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>Manage Permissions: {user.name}</DialogTitle>
                                                                <DialogDescription>
                                                                    View and modify permissions for this user.
                                                                </DialogDescription>
                                                            </DialogHeader>

                                                            <div className="space-y-6">
                                                                {/* Permission Matrix */}
                                                                <div className="space-y-4">
                                                                    {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
                                                                        <div key={resource} className="border rounded-lg p-4">
                                                                            <h4 className="font-semibold mb-3 capitalize">{resource.replace('_', ' ')}</h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                                {resourcePermissions.map(permission => {
                                                                                    const status = getPermissionStatus(user.userId, permission.name);
                                                                                    return (
                                                                                        <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                                                                                            <div className="flex-1">
                                                                                                <div className="text-sm font-medium">{permission.action}</div>
                                                                                                <div className="text-xs text-base-content/70">{permission.description}</div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Badge className={getPermissionStatusColor(status)}>
                                                                                                    {status}
                                                                                                </Badge>
                                                                                                <div className="flex gap-1">
                                                                                                    {status !== 'granted' && (
                                                                                                        <Button
                                                                                                            size="sm"
                                                                                                            variant="ghost"
                                                                                                            onClick={() => {
                                                                                                                setSelectedPermission(permission);
                                                                                                                setPermissionAction('grant');
                                                                                                            }}
                                                                                                        >
                                                                                                            <ShieldCheck className="h-3 w-3" />
                                                                                                        </Button>
                                                                                                    )}
                                                                                                    {status !== 'denied' && (
                                                                                                        <Button
                                                                                                            size="sm"
                                                                                                            variant="ghost"
                                                                                                            onClick={() => {
                                                                                                                setSelectedPermission(permission);
                                                                                                                setPermissionAction('deny');
                                                                                                            }}
                                                                                                        >
                                                                                                            <ShieldX className="h-3 w-3" />
                                                                                                        </Button>
                                                                                                    )}
                                                                                                    {(status === 'granted' || status === 'denied') && (
                                                                                                        <Button
                                                                                                            size="sm"
                                                                                                            variant="ghost"
                                                                                                            onClick={() => {
                                                                                                                setSelectedPermission(permission);
                                                                                                                setPermissionAction('revoke');
                                                                                                            }}
                                                                                                        >
                                                                                                            <RefreshCw className="h-3 w-3" />
                                                                                                        </Button>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>
                                                                    Close
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
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

            {/* Permission Action Dialog */}
            <Dialog open={!!selectedPermission} onOpenChange={(open) => !open && setSelectedPermission(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {permissionAction === 'grant' && 'Grant Permission'}
                            {permissionAction === 'deny' && 'Deny Permission'}
                            {permissionAction === 'revoke' && 'Revoke Permission'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPermission && (
                                <>
                                    {permissionAction === 'grant' && `Grant ${selectedPermission.name} to ${selectedUser?.name}`}
                                    {permissionAction === 'deny' && `Deny ${selectedPermission.name} from ${selectedUser?.name}`}
                                    {permissionAction === 'revoke' && `Revoke ${selectedPermission.name} from ${selectedUser?.name}`}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedPermission && (
                            <div className="p-4 border rounded-lg bg-base-200">
                                <div className="font-medium">{selectedPermission.name}</div>
                                <div className="text-sm text-base-content/70">{selectedPermission.description}</div>
                                <div className="text-xs text-base-content/50 mt-1">
                                    Resource: {selectedPermission.resource} | Action: {selectedPermission.action}
                                </div>
                            </div>
                        )}

                        {(permissionAction === 'grant' || permissionAction === 'deny') && (
                            <div>
                                <Label htmlFor="reason">Reason (Optional)</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Provide a reason for this permission change..."
                                    value={permissionReason}
                                    onChange={(e) => setPermissionReason(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedPermission(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handlePermissionAction}>
                            {permissionAction === 'grant' && 'Grant Permission'}
                            {permissionAction === 'deny' && 'Deny Permission'}
                            {permissionAction === 'revoke' && 'Revoke Permission'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
