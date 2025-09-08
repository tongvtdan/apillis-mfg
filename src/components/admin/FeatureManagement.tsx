import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Label } from '@/components/ui/label';
import {
    ToggleLeft,
    Users,
    UserPlus,
    UserMinus,
    Settings,
    RefreshCw,
    Eye,
    EyeOff
} from 'lucide-react';
import { usePermissionsAdmin } from '@/hooks/usePermissionsAdmin';
import { FeatureToggle } from '@/services/permissionService';

export default function FeatureManagement() {
    const {
        features,
        users,
        loading,
        toggleFeature,
        grantUserFeatureAccess,
        revokeUserFeatureAccess,
        refreshData
    } = usePermissionsAdmin();

    const [selectedFeature, setSelectedFeature] = useState<FeatureToggle | null>(null);
    const [userAccessDialogOpen, setUserAccessDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    const handleToggleFeature = async (featureKey: string, enabled: boolean) => {
        try {
            await toggleFeature(featureKey, enabled);
        } catch (error) {
            // Error is handled in the hook
        }
    };

    const handleGrantFeatureAccess = async () => {
        if (!selectedFeature || !selectedUserId) return;

        try {
            await grantUserFeatureAccess(selectedUserId, selectedFeature.feature_key);
            setUserAccessDialogOpen(false);
            setSelectedUserId('');
        } catch (error) {
            // Error is handled in the hook
        }
    };

    const handleRevokeFeatureAccess = async (userId: string, featureKey: string) => {
        try {
            await revokeUserFeatureAccess(userId, featureKey);
        } catch (error) {
            // Error is handled in the hook
        }
    };

    const getUsersWithFeatureAccess = (featureKey: string) => {
        return users.filter(user => user.featureAccess[featureKey]);
    };

    const getUsersWithoutFeatureAccess = (featureKey: string) => {
        return users.filter(user => !user.featureAccess[featureKey]);
    };

    const getRoleDisplayName = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const getRequiredPermissionsDisplay = (permissions: string[]) => {
        if (!permissions || permissions.length === 0) return 'None';
        return permissions.map(p => p.split(':')[1]).join(', ');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ToggleLeft className="h-5 w-5" />
                                Feature Management
                            </CardTitle>
                            <CardDescription>
                                Control feature availability and manage user-specific feature access across your organization.
                            </CardDescription>
                        </div>
                        <Button onClick={refreshData} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Total Features</p>
                                <p className="text-2xl font-bold text-base-content">{features.length}</p>
                            </div>
                            <ToggleLeft className="h-8 w-8 text-base-content/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Enabled Features</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {features.filter(f => f.is_enabled).length}
                                </p>
                            </div>
                            <Eye className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Disabled Features</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {features.filter(f => !f.is_enabled).length}
                                </p>
                            </div>
                            <EyeOff className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Features Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Feature Toggles</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Feature</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Min Role</TableHead>
                                    <TableHead>Required Permissions</TableHead>
                                    <TableHead>Users with Access</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            Loading features...
                                        </TableCell>
                                    </TableRow>
                                ) : features.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            No features configured.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    features.map((feature) => {
                                        const usersWithAccess = getUsersWithFeatureAccess(feature.feature_key);
                                        return (
                                            <TableRow key={feature.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{feature.feature_name}</div>
                                                        <div className="text-sm text-base-content/70 font-mono">
                                                            {feature.feature_key}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{feature.description || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={feature.is_enabled}
                                                            onCheckedChange={(checked) => handleToggleFeature(feature.feature_key, checked)}
                                                        />
                                                        <Badge variant={feature.is_enabled ? 'default' : 'secondary'}>
                                                            {feature.is_enabled ? 'Enabled' : 'Disabled'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {getRoleDisplayName(feature.required_role || 'sales')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {getRequiredPermissionsDisplay(feature.required_permissions)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">{usersWithAccess.length}</span>
                                                        {usersWithAccess.length > 0 && (
                                                            <div className="flex -space-x-2">
                                                                {usersWithAccess.slice(0, 3).map(user => (
                                                                    <div
                                                                        key={user.userId}
                                                                        className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
                                                                        title={user.name}
                                                                    >
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                ))}
                                                                {usersWithAccess.length > 3 && (
                                                                    <div className="w-6 h-6 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center border-2 border-background">
                                                                        +{usersWithAccess.length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Dialog open={userAccessDialogOpen && selectedFeature?.id === feature.id} onOpenChange={setUserAccessDialogOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedFeature(feature);
                                                                        setUserAccessDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <UserPlus className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="modal-dialog">
                                                                <DialogHeader className="modal-dialog-header">
                                                                    <DialogTitle className="modal-dialog-title">Grant Feature Access: {feature.feature_name}</DialogTitle>
                                                                    <DialogDescription className="modal-dialog-description">
                                                                        Grant specific users access to this feature.
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
                                                                                {getUsersWithoutFeatureAccess(feature.feature_key).map(user => (
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
                                                                        setUserAccessDialogOpen(false);
                                                                        setSelectedFeature(null);
                                                                        setSelectedUserId('');
                                                                    }}>
                                                                        Cancel
                                                                    </Button>
                                                                    <Button className="modal-button-primary" onClick={handleGrantFeatureAccess} disabled={!selectedUserId}>
                                                                        Grant Access
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Button variant="ghost" size="sm">
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Access Management */}
            {selectedFeature && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Users with Access: {selectedFeature.feature_name}
                        </CardTitle>
                        <CardDescription>
                            Users who have been explicitly granted access to this feature.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {getUsersWithFeatureAccess(selectedFeature.feature_key).map(user => (
                                <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-base-content/70">{user.email}</div>
                                            <Badge variant="outline" className="text-xs mt-1">
                                                {user.baseRole}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRevokeFeatureAccess(user.userId, selectedFeature.feature_key)}
                                    >
                                        <UserMinus className="h-4 w-4 mr-2" />
                                        Revoke Access
                                    </Button>
                                </div>
                            ))}
                            {getUsersWithFeatureAccess(selectedFeature.feature_key).length === 0 && (
                                <div className="text-center py-8 text-base-content/70">
                                    No users have been explicitly granted access to this feature.
                                    {selectedFeature.is_enabled && (
                                        <div className="mt-2 text-sm">
                                            Users with role <Badge variant="outline">{getRoleDisplayName(selectedFeature.required_role || 'sales')}</Badge> or higher have automatic access.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
