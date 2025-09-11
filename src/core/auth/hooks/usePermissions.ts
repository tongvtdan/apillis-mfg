import { useAuth } from '@/core/auth';
import { hasPermission, hasResourceAccess, getResourceActions, hasEnhancedPermission, hasFeatureAccess, getUserEffectivePermissions, refreshUserPermissionCache } from '@/lib/permissions';
import { UserRole } from '@/types/auth';

export function usePermissions() {
    const { profile } = useAuth();

    const checkPermission = (resource: string, action: string) => {
        if (!profile) return { allowed: false, reason: 'Not authenticated' };
        return hasPermission(profile.role as UserRole, resource, action);
    };

    const checkResourceAccess = (resource: string) => {
        if (!profile) return false;
        return hasResourceAccess(profile.role as UserRole, resource);
    };

    const getActions = (resource: string) => {
        if (!profile) return [];
        return getResourceActions(profile.role as UserRole, resource);
    };

    const canManageUsers = () => {
        return checkPermission('users', 'read').allowed;
    };

    const canViewAnalytics = () => {
        return checkPermission('analytics', 'read').allowed;
    };

    const canManageProjects = () => {
        return checkPermission('projects', 'read').allowed;
    };

    const canCreateProjects = () => {
        return checkPermission('projects', 'create').allowed;
    };

    const canManageWorkflow = () => {
        return checkPermission('workflow', 'manage').allowed;
    };

    const canViewReports = () => {
        return checkPermission('reports', 'read').allowed;
    };

    const canManageApprovals = () => {
        return checkPermission('approvals', 'manage').allowed;
    };

    const canManageSuppliers = () => {
        return checkPermission('suppliers', 'manage').allowed;
    };

    const canManageCustomers = () => {
        return checkPermission('customers', 'manage').allowed;
    };

    return {
        checkPermission,
        checkResourceAccess,
        getActions,
        canManageUsers,
        canViewAnalytics,
        canManageProjects,
        canCreateProjects,
        canManageWorkflow,
        canViewReports,
        canManageApprovals,
        canManageSuppliers,
        canManageCustomers,
        hasEnhancedPermission,
        hasFeatureAccess,
        getUserEffectivePermissions,
        refreshUserPermissionCache
    };
}
