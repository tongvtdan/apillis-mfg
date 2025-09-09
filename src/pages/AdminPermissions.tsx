import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Users,
    Settings,
    Activity,
    Key,
    ToggleLeft,
    FileText,
    AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Import components (we'll create these next)
import UserManagement from '@/components/admin/UserManagement';
import RoleManagement from '@/components/admin/RoleManagement';
import FeatureManagement from '@/components/admin/FeatureManagement';
import AuditLog from '@/components/admin/AuditLog';
import MyRolesViewer from '@/components/admin/MyRolesViewer';

export default function AdminPermissions() {
    const { profile, user } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('my-roles');
    const [loading, setLoading] = useState(false);

    // Check user permissions
    const isAdmin = profile?.role === 'admin';
    const isManagement = profile?.role === 'management';
    const canManageUsers = isAdmin || isManagement;
    const canManageRoles = isAdmin || isManagement;
    const canManageFeatures = isAdmin || isManagement;
    const canViewAudit = isAdmin || isManagement;

    // All authenticated users can access this page
    if (!user) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                            <div>
                                <h2 className="text-xl font-bold text-red-900">Authentication Required</h2>
                                <p className="text-red-700 mt-1">
                                    Please log in to view your roles and permissions.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content flex items-center gap-2">
                    <Shield className="h-8 w-8 text-base-content" />
                    Roles & Permissions
                </h1>
                <p className="text-base-content/70 mt-1">
                    {canManageUsers
                        ? 'Manage user permissions, roles, and feature access across your organization.'
                        : 'View your current roles and permissions in the system.'
                    }
                </p>
            </div>

            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Total Users</p>
                                <p className="text-2xl font-bold text-base-content">--</p>
                            </div>
                            <Users className="h-8 w-8 text-base-content/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Active Roles</p>
                                <p className="text-2xl font-bold text-base-content">--</p>
                            </div>
                            <Key className="h-8 w-8 text-base-content/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Feature Toggles</p>
                                <p className="text-2xl font-bold text-base-content">--</p>
                            </div>
                            <ToggleLeft className="h-8 w-8 text-base-content/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Audit Events</p>
                                <p className="text-2xl font-bold text-base-content">--</p>
                            </div>
                            <Activity className="h-8 w-8 text-base-content/70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className={`grid w-full ${canManageUsers ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-1'}`}>
                    <TabsTrigger value="my-roles" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">My Roles</span>
                    </TabsTrigger>

                    {canManageUsers && (
                        <>
                            <TabsTrigger value="users" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="hidden sm:inline">Users</span>
                            </TabsTrigger>
                            <TabsTrigger value="roles" className="flex items-center gap-2">
                                <Key className="h-4 w-4" />
                                <span className="hidden sm:inline">Roles</span>
                            </TabsTrigger>
                            <TabsTrigger value="features" className="flex items-center gap-2">
                                <ToggleLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Features</span>
                            </TabsTrigger>
                            <TabsTrigger value="audit" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Audit</span>
                            </TabsTrigger>
                        </>
                    )}
                </TabsList>

                <TabsContent value="my-roles" className="space-y-6">
                    <MyRolesViewer />
                </TabsContent>

                {canManageUsers && (
                    <>
                        <TabsContent value="users" className="space-y-6">
                            <UserManagement />
                        </TabsContent>

                        <TabsContent value="roles" className="space-y-6">
                            <RoleManagement />
                        </TabsContent>

                        <TabsContent value="features" className="space-y-6">
                            <FeatureManagement />
                        </TabsContent>

                        <TabsContent value="audit" className="space-y-6">
                            <AuditLog />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
