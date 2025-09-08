import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Key,
    Plus,
    Edit,
    Users,
    Shield,
    Search,
    RefreshCw,
    UserPlus,
    UserMinus
} from 'lucide-react';
import { usePermissionsAdmin } from '@/hooks/usePermissionsAdmin';
import { CustomRole } from '@/services/permissionService';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleManagement() {
    const { profile } = useAuth();
    const {
        roles,
        permissions,
        users,
        loading,
        createCustomRole,
        assignRoleToUser,
        removeRoleFromUser,
        refreshData
    } = usePermissionsAdmin();

    // Check user permissions
    const isAdmin = profile?.role === 'admin';
    const isManagement = profile?.role === 'management';
    const canManageRoles = isAdmin || isManagement;

    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    // Create role form state
    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    // Filter roles based on search
    const filteredRoles = useMemo(() => {
        return roles.filter(role =>
            !searchQuery ||
            role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [roles, searchQuery]);

    // Group permissions by resource for the create dialog
    const permissionsByResource = useMemo(() => {
        const grouped: Record<string, typeof permissions> = {};
        permissions.forEach(permission => {
            if (!grouped[permission.resource]) {
                grouped[permission.resource] = [];
            }
            grouped[permission.resource].push(permission);
        });
        return grouped;
    }, [permissions]);

    const handleCreateRole = async () => {
        if (!roleName.trim()) return;

        try {
            await createCustomRole({
                name: roleName.trim(),
                description: roleDescription.trim() || undefined,
                permissionIds: selectedPermissions
            });

            // Reset form
            setRoleName('');
            setRoleDescription('');
            setSelectedPermissions([]);
            setCreateDialogOpen(false);
        } catch (error) {
            // Error is handled in the hook
        }
    };

    const handleAssignRole = async () => {
        if (!selectedRole || !selectedUserId) return;

        try {
            await assignRoleToUser(selectedUserId, selectedRole.id);
            setAssignDialogOpen(false);
            setSelectedRole(null);
            setSelectedUserId('');
        } catch (error) {
            // Error is handled in the hook
        }
    };

    const handleRemoveRole = async (userId: string, roleId: string) => {
        try {
            await removeRoleFromUser(userId, roleId);
        } catch (error) {
            // Error is handled in the hook
        }
    };

    const getUsersWithRole = (roleId: string) => {
        return users.filter(user =>
            user.customRoles.some(role => role.id === roleId)
        );
    };

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleResourcePermissions = (resourcePermissions: typeof permissions) => {
        const allSelected = resourcePermissions.every(p => selectedPermissions.includes(p.id));
        const resourcePermissionIds = resourcePermissions.map(p => p.id);

        if (allSelected) {
            // Deselect all
            setSelectedPermissions(prev => prev.filter(id => !resourcePermissionIds.includes(id)));
        } else {
            // Select all
            setSelectedPermissions(prev => [...new Set([...prev, ...resourcePermissionIds])]);
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
                                <Key className="h-5 w-5" />
                                {canManageRoles ? 'Custom Role Management' : 'Role Overview'}
                            </CardTitle>
                            <CardDescription>
                                {canManageRoles
                                    ? 'Create and manage custom roles with specific permissions for your organization.'
                                    : 'View available custom roles and their permissions in your organization.'
                                }
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={refreshData} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            {canManageRoles && (
                                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Role
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="modal-dialog max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader className="modal-dialog-header">
                                            <DialogTitle className="modal-dialog-title">Create Custom Role</DialogTitle>
                                            <DialogDescription className="modal-dialog-description">
                                                Define a new role with specific permissions.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="roleName">Role Name</Label>
                                                    <Input
                                                        id="roleName"
                                                        placeholder="e.g., Project Manager"
                                                        value={roleName}
                                                        onChange={(e) => setRoleName(e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="roleDescription">Description (Optional)</Label>
                                                    <Input
                                                        id="roleDescription"
                                                        placeholder="Brief description of the role"
                                                        value={roleDescription}
                                                        onChange={(e) => setRoleDescription(e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Permissions</Label>
                                                <div className="mt-2 space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                                                    {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => {
                                                        const allSelected = resourcePermissions.every(p => selectedPermissions.includes(p.id));
                                                        const someSelected = resourcePermissions.some(p => selectedPermissions.includes(p.id));

                                                        return (
                                                            <div key={resource} className="space-y-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`resource-${resource}`}
                                                                        checked={allSelected}
                                                                        indeterminate={someSelected && !allSelected}
                                                                        onCheckedChange={() => toggleResourcePermissions(resourcePermissions)}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`resource-${resource}`}
                                                                        className="font-semibold capitalize cursor-pointer"
                                                                    >
                                                                        {resource.replace('_', ' ')}
                                                                    </Label>
                                                                </div>

                                                                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {resourcePermissions.map(permission => (
                                                                        <div key={permission.id} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={permission.id}
                                                                                checked={selectedPermissions.includes(permission.id)}
                                                                                onCheckedChange={() => togglePermission(permission.id)}
                                                                            />
                                                                            <Label
                                                                                htmlFor={permission.id}
                                                                                className="text-sm cursor-pointer flex-1"
                                                                            >
                                                                                <div className="font-medium">{permission.action}</div>
                                                                                <div className="text-xs text-base-content/70">{permission.description}</div>
                                                                            </Label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

            </Card>
                                                                    <Label
                                                                        htmlFor={`resource-${resource}`}
                                                                        className="font-semibold capitalize cursor-pointer"
                                                                    >
                                                                        {resource.replace('_', ' ')}
                                                                    </Label>
                                                                </div>

                                                                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {resourcePermissions.map(permission => (
                                                                        <div key={permission.id} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={permission.id}
                                                                                checked={selectedPermissions.includes(permission.id)}
                                                                                onCheckedChange={() => togglePermission(permission.id)}
                                                                            />
                                                                            <Label
                                                                                htmlFor={permission.id}
                                                                                className="text-sm cursor-pointer flex-1"
                                                                            >
                                                                                <div className="font-medium">{permission.action}</div>
                                                                                <div className="text-xs text-base-content/70">{permission.description}</div>
                                                                            </Label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button variant="outline" className="modal-button-secondary" onClick={() => setCreateDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button className="modal-button-primary" onClick={handleCreateRole} disabled={!roleName.trim()}>
                                                Create Role
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                </CardHeader>
            </Card>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-base-content/70" />
                        <Input
                            placeholder="Search roles by name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Roles Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Custom Roles ({filteredRoles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead>Assigned Users</TableHead>
                                    <TableHead>Status</TableHead>
                                    {canManageRoles && <TableHead>Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={canManageRoles ? 6 : 5} className="text-center py-8">
                                            Loading roles...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRoles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canManageRoles ? 6 : 5} className="text-center py-8">
                                            {searchQuery ? 'No roles found matching your search.' : 'No custom roles created yet.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRoles.map((role) => {
                                        const assignedUsers = getUsersWithRole(role.id);
                                        return (
                                            <TableRow key={role.id}>
                                                <TableCell>
                                                    <div className="font-medium">{role.name}</div>
                                                    {role.is_system && (
                                                        <Badge variant="outline" className="text-xs mt-1">
                                                            System Role
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{role.description || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions.slice(0, 3).map(permission => (
                                                            <Badge key={permission.id} variant="outline" className="text-xs">
                                                                {permission.action}
                                                            </Badge>
                                                        ))}
                                                        {role.permissions.length > 3 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{role.permissions.length - 3} more
                                                            </Badge>
                                                        )}
                                                        {role.permissions.length === 0 && (
                                                            <span className="text-sm text-base-content/50">No permissions</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">{assignedUsers.length} users</span>
                                                        {assignedUsers.length > 0 && (
                                                            <div className="flex -space-x-2">
                                                                {assignedUsers.slice(0, 3).map(user => (
                                                                    <div
                                                                        key={user.userId}
                                                                        className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
                                                                        title={user.name}
                                                                    >
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                ))}
                                                                {assignedUsers.length > 3 && (
                                                                    <div className="w-6 h-6 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center border-2 border-background">
                                                                        +{assignedUsers.length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={role.is_active ? 'default' : 'secondary'}>
                                                        {role.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                {canManageRoles && (
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Dialog open={assignDialogOpen && selectedRole?.id === role.id} onOpenChange={setAssignDialogOpen}>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedRole(role);
                                                                            setAssignDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <UserPlus className="h-4 w-4" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="modal-dialog">
                                                                    <DialogHeader className="modal-dialog-header">
                                                                        <DialogTitle className="modal-dialog-title">Assign Role: {role.name}</DialogTitle>
                                                                        <DialogDescription className="modal-dialog-description">
                                                                            Assign this role to a user.
                                                                        </DialogDescription>
                                                                    </DialogHeader>

                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <Label htmlFor="userSelect">Select User</Label>
                                                                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                                                                <SelectTrigger className="mt-1">
                                                                                    <SelectValue placeholder="Choose a user..." />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {users
                                                                                        .filter(user => !user.customRoles.some(cr => cr.id === role.id))
                                                                                        .map(user => (
                                                                                            <SelectItem key={user.userId} value={user.userId}>
                                                                                                {user.name} ({user.email})
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </div>

                                                                    <DialogFooter>
                                                                        <Button variant="outline" className="modal-button-secondary" onClick={() => {
                                                                            setAssignDialogOpen(false);
                                                                            setSelectedRole(null);
                                                                            setSelectedUserId('');
                                                                        }}>
                                                                            Cancel
                                                                        </Button>
                                                                        <Button className="modal-button-primary" onClick={handleAssignRole} disabled={!selectedUserId}>
                                                                            Assign Role
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>

                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Role Assignment Management */}
            {selectedRole && canManageRoles && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Users with Role: {selectedRole.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {getUsersWithRole(selectedRole.id).map(user => (
                                <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-base-content/70">{user.email}</div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveRole(user.userId, selectedRole.id)}
                                    >
                                        <UserMinus className="h-4 w-4 mr-2" />
                                        Remove Role
                                    </Button>
                                </div>
                            ))}
                            {getUsersWithRole(selectedRole.id).length === 0 && (
                                <div className="text-center py-8 text-base-content/70">
                                    No users are assigned to this role.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
