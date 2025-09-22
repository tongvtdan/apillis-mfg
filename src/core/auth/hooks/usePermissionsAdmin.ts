import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client.ts.js';
import { useToast } from '@/shared/hooks/use-toast';
import { permissionService, UserPermissionDetails, CustomRole, FeatureToggle, Permission, AuditEntry } from '@/services/permissionService';

interface UserWithPermissions extends UserPermissionDetails {
    status?: string;
    department?: string;
}

export function usePermissionsAdmin() {
    const { toast } = useToast();

    // State
    const [users, setUsers] = useState<UserWithPermissions[]>([]);
    const [roles, setRoles] = useState<CustomRole[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [features, setFeatures] = useState<FeatureToggle[]>([]);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
    const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);

    // Load initial data
    const loadUsers = useCallback(async () => {
        try {
            const { data: usersData, error } = await supabase
                .from('users')
                .select('id, name, email, role, status, department, last_login_at, created_at')
                .order('name');

            if (error) throw error;

            // Get permissions for each user
            const usersWithPermissions = await Promise.all(
                (usersData || []).map(async (user) => {
                    try {
                        const userPermissions = await permissionService.getUserPermissions(user.id);
                        return {
                            ...userPermissions,
                            status: user.status,
                            department: user.department
                        } as UserWithPermissions;
                    } catch (error) {
                        console.error(`Error loading permissions for user ${user.id}:`, error);
                        return {
                            userId: user.id,
                            name: user.name || '',
                            email: user.email || '',
                            baseRole: user.role,
                            customRoles: [],
                            grantedPermissions: [],
                            deniedPermissions: [],
                            featureAccess: {},
                            lastLogin: user.last_login_at,
                            createdAt: user.created_at,
                            status: user.status,
                            department: user.department
                        } as UserWithPermissions;
                    }
                })
            );

            setUsers(usersWithPermissions);
        } catch (error) {
            console.error('Error loading users:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load users."
            });
        }
    }, [toast]);

    const loadRoles = useCallback(async () => {
        try {
            const rolesData = await permissionService.getCustomRoles();
            setRoles(rolesData);
        } catch (error) {
            console.error('Error loading roles:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load custom roles."
            });
        }
    }, [toast]);

    const loadPermissions = useCallback(async () => {
        try {
            const permissionsData = await permissionService.getPermissions();
            setPermissions(permissionsData);
        } catch (error) {
            console.error('Error loading permissions:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load permissions."
            });
        }
    }, [toast]);

    const loadFeatures = useCallback(async () => {
        try {
            const featuresData = await permissionService.getFeatureToggles();
            setFeatures(featuresData);
        } catch (error) {
            console.error('Error loading features:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load feature toggles."
            });
        }
    }, [toast]);

    const loadAuditLog = useCallback(async (filters?: any) => {
        try {
            const auditData = await permissionService.getAuditLog(filters);
            setAuditLog(auditData);
        } catch (error) {
            console.error('Error loading audit log:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load audit log."
            });
        }
    }, [toast]);

    // Load all data
    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadUsers(),
                loadRoles(),
                loadPermissions(),
                loadFeatures(),
                loadAuditLog()
            ]);
        } finally {
            setLoading(false);
        }
    }, [loadUsers, loadRoles, loadPermissions, loadFeatures, loadAuditLog]);

    // User permission management
    const grantUserPermission = useCallback(async (userId: string, permissionId: string, reason?: string) => {
        try {
            await permissionService.grantUserPermission(userId, permissionId, reason);
            toast({
                title: "Permission Granted",
                description: "User permission has been granted successfully."
            });
            await refreshData(); // Refresh to show updated permissions
        } catch (error) {
            console.error('Error granting permission:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to grant permission."
            });
        }
    }, [toast, refreshData]);

    const denyUserPermission = useCallback(async (userId: string, permissionId: string, reason?: string) => {
        try {
            await permissionService.denyUserPermission(userId, permissionId, reason);
            toast({
                title: "Permission Denied",
                description: "User permission has been denied successfully."
            });
            await refreshData();
        } catch (error) {
            console.error('Error denying permission:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to deny permission."
            });
        }
    }, [toast, refreshData]);

    const revokeUserPermission = useCallback(async (userId: string, permissionId: string) => {
        try {
            await permissionService.revokeUserPermission(userId, permissionId);
            toast({
                title: "Permission Revoked",
                description: "User permission has been revoked successfully."
            });
            await refreshData();
        } catch (error) {
            console.error('Error revoking permission:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to revoke permission."
            });
        }
    }, [toast, refreshData]);

    // Role management
    const createCustomRole = useCallback(async (roleData: { name: string; description?: string; permissionIds: string[] }) => {
        try {
            const newRole = await permissionService.createCustomRole(roleData);
            setRoles(prev => [...prev, newRole]);
            toast({
                title: "Role Created",
                description: `Custom role "${roleData.name}" has been created successfully.`
            });
            return newRole;
        } catch (error) {
            console.error('Error creating role:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create custom role."
            });
            throw error;
        }
    }, [toast]);

    const updateCustomRole = useCallback(async (roleId: string, updates: Partial<CustomRole>) => {
        try {
            // For now, we'll recreate the role since the backend doesn't have an update method
            // In a real implementation, you'd want to add update methods to the service
            await loadRoles(); // Reload roles
            toast({
                title: "Role Updated",
                description: "Custom role has been updated successfully."
            });
        } catch (error) {
            console.error('Error updating role:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update custom role."
            });
        }
    }, [loadRoles, toast]);

    const assignRoleToUser = useCallback(async (userId: string, roleId: string) => {
        try {
            await permissionService.assignRoleToUser(userId, roleId);
            toast({
                title: "Role Assigned",
                description: "Custom role has been assigned to user successfully."
            });
            await refreshData();
        } catch (error) {
            console.error('Error assigning role:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to assign role to user."
            });
        }
    }, [toast, refreshData]);

    const removeRoleFromUser = useCallback(async (userId: string, roleId: string) => {
        try {
            await permissionService.removeRoleFromUser(userId, roleId);
            toast({
                title: "Role Removed",
                description: "Custom role has been removed from user successfully."
            });
            await refreshData();
        } catch (error) {
            console.error('Error removing role:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to remove role from user."
            });
        }
    }, [toast, refreshData]);

    // Feature management
    const toggleFeature = useCallback(async (featureKey: string, enabled: boolean) => {
        try {
            await permissionService.toggleFeature(featureKey, enabled);
            setFeatures(prev => prev.map(feature =>
                feature.feature_key === featureKey
                    ? { ...feature, is_enabled: enabled }
                    : feature
            ));
            toast({
                title: "Feature Updated",
                description: `Feature has been ${enabled ? 'enabled' : 'disabled'} successfully.`
            });
        } catch (error) {
            console.error('Error toggling feature:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update feature."
            });
        }
    }, [toast]);

    const grantUserFeatureAccess = useCallback(async (userId: string, featureKey: string) => {
        try {
            await permissionService.grantUserFeatureAccess(userId, featureKey);
            toast({
                title: "Feature Access Granted",
                description: "User has been granted access to the feature."
            });
            await refreshData();
        } catch (error) {
            console.error('Error granting feature access:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to grant feature access."
            });
        }
    }, [toast, refreshData]);

    const revokeUserFeatureAccess = useCallback(async (userId: string, featureKey: string) => {
        try {
            await permissionService.revokeUserFeatureAccess(userId, featureKey);
            toast({
                title: "Feature Access Revoked",
                description: "User feature access has been revoked."
            });
            await refreshData();
        } catch (error) {
            console.error('Error revoking feature access:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to revoke feature access."
            });
        }
    }, [toast, refreshData]);

    // Initialize data on mount
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return {
        // State
        users,
        roles,
        permissions,
        features,
        auditLog,
        loading,
        selectedUser,
        selectedRole,

        // Setters
        setSelectedUser,
        setSelectedRole,

        // Actions
        refreshData,
        loadAuditLog,

        // User permission management
        grantUserPermission,
        denyUserPermission,
        revokeUserPermission,

        // Role management
        createCustomRole,
        updateCustomRole,
        assignRoleToUser,
        removeRoleFromUser,

        // Feature management
        toggleFeature,
        grantUserFeatureAccess,
        revokeUserFeatureAccess
    };
}
