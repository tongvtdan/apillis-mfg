import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    Key,
    Shield,
    User,
    Check,
    X,
    Info
} from 'lucide-react';
import { useAuth } from '@/core/auth';

interface Permission {
    id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
    category: string;
}

interface CustomRole {
    id: string;
    name: string;
    description?: string;
    permissions: Permission[];
}

export default function MyRolesViewer() {
    const { profile } = useAuth();

    // Mock data - in a real implementation, this would come from the permission service
    const userRoles: CustomRole[] = [
        {
            id: '1',
            name: 'Sales Representative',
            description: 'Standard sales role with RFQ management capabilities',
            permissions: [
                { id: '1', name: 'rfq:create', resource: 'rfq', action: 'create', description: 'Create new RFQs', category: 'general' },
                { id: '2', name: 'rfq:read', resource: 'rfq', action: 'read', description: 'View RFQ information', category: 'general' },
                { id: '3', name: 'rfq:update', resource: 'rfq', action: 'update', description: 'Update RFQ information', category: 'general' },
                { id: '4', name: 'customer:read', resource: 'customer', action: 'read', description: 'View customer information', category: 'general' },
                { id: '5', name: 'dashboard:read', resource: 'dashboard', action: 'read', description: 'Access dashboard', category: 'general' },
            ]
        }
    ];

    const baseRolePermissions: Permission[] = [
        { id: '6', name: 'profile:read_own', resource: 'profile', action: 'read_own', description: 'View own profile', category: 'general' },
        { id: '7', name: 'profile:update_own', resource: 'profile', action: 'update_own', description: 'Update own profile', category: 'general' },
        { id: '8', name: 'notifications:read', resource: 'notifications', action: 'read', description: 'View notifications', category: 'general' },
    ];

    // Group permissions by resource for better display
    const permissionsByResource = useMemo(() => {
        const allPermissions = [...baseRolePermissions];
        userRoles.forEach(role => {
            allPermissions.push(...role.permissions);
        });

        const grouped: Record<string, Permission[]> = {};
        allPermissions.forEach(permission => {
            if (!grouped[permission.resource]) {
                grouped[permission.resource] = [];
            }
            if (!grouped[permission.resource].find(p => p.name === permission.name)) {
                grouped[permission.resource].push(permission);
            }
        });
        return grouped;
    }, [userRoles, baseRolePermissions]);

    const totalPermissions = Object.values(permissionsByResource).reduce((sum, perms) => sum + perms.length, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                My Roles & Permissions
                            </CardTitle>
                            <CardDescription>
                                View your current roles and permissions in the system.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Current User Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Base Role</p>
                                <p className="text-lg font-semibold text-base-content">
                                    {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Not assigned'}
                                </p>
                            </div>
                            <Key className="h-8 w-8 text-base-content/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Custom Roles</p>
                                <p className="text-lg font-semibold text-base-content">{userRoles.length}</p>
                            </div>
                            <Shield className="h-8 w-8 text-base-content/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Total Permissions</p>
                                <p className="text-lg font-semibold text-base-content">{totalPermissions}</p>
                            </div>
                            <Check className="h-8 w-8 text-base-content/70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Custom Roles */}
            {userRoles.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Your Custom Roles
                        </CardTitle>
                        <CardDescription>
                            Additional roles assigned to you beyond your base role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {userRoles.map(role => (
                                <div key={role.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold">{role.name}</h4>
                                            {role.description && (
                                                <p className="text-sm text-base-content/70 mt-1">{role.description}</p>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            {role.permissions.length} permissions
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {role.permissions.slice(0, 5).map(permission => (
                                            <Badge key={permission.id} variant="secondary" className="text-xs">
                                                {permission.action}
                                            </Badge>
                                        ))}
                                        {role.permissions.length > 5 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{role.permissions.length - 5} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Permissions by Resource */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        Your Permissions by Resource
                    </CardTitle>
                    <CardDescription>
                        Detailed breakdown of all permissions you have across different system resources.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {Object.entries(permissionsByResource).map(([resource, permissions]) => (
                            <div key={resource} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold capitalize text-base">
                                        {resource.replace('_', ' ')}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                        {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>

                                <div className="ml-4 space-y-2">
                                    {permissions.map(permission => (
                                        <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg bg-base-50 dark:bg-base-900">
                                            <div className="flex items-center gap-3">
                                                <Check className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <div className="font-medium text-sm">{permission.action}</div>
                                                    <div className="text-xs text-base-content/70">{permission.description}</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {permission.name}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Permission Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Permission Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Resources You Can Access</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(permissionsByResource).map(resource => (
                                        <Badge key={resource} variant="outline" className="capitalize">
                                            {resource.replace('_', ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Permission Categories</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(new Set(Object.values(permissionsByResource).flat().map(p => p.category))).map(category => (
                                        <Badge key={category} variant="secondary" className="capitalize">
                                            {category}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Need Additional Access?</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        If you need additional permissions or roles to perform your job functions,
                                        please contact your system administrator or management team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
