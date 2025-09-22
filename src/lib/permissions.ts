import { UserRole, Permission, ROLE_PERMISSIONS, PermissionCheckResult } from '../types/auth';
import { supabase } from '@/integrations/supabase/client.ts';

/**
 * Check if a user role has permission to perform an action on a resource
 */
export function hasPermission(
    userRole: UserRole,
    resource: string,
    action: string
): PermissionCheckResult {
    const rolePermissions = ROLE_PERMISSIONS[userRole];

    if (!rolePermissions) {
        return {
            allowed: false,
            reason: 'Invalid user role',
            requiredRole: userRole
        };
    }

    const resourcePermission = rolePermissions.find(p => p.resource === resource);

    if (!resourcePermission) {
        return {
            allowed: false,
            reason: `No permissions defined for resource: ${resource}`,
            requiredPermissions: [`${resource}:${action}`]
        };
    }

    const hasAction = resourcePermission.actions.includes(action);

    return {
        allowed: hasAction,
        reason: hasAction ? undefined : `Action '${action}' not allowed for role '${userRole}' on resource '${resource}'`,
        requiredPermissions: hasAction ? undefined : [`${resource}:${action}`]
    };
}

/**
 * Get all permissions for a specific user role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
    return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if a user role has any permissions for a resource
 */
export function hasResourceAccess(userRole: UserRole, resource: string): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions?.some(p => p.resource === resource) || false;
}

/**
 * Get all actions a user role can perform on a specific resource
 */
export function getResourceActions(userRole: UserRole, resource: string): string[] {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    const resourcePermission = rolePermissions?.find(p => p.resource === resource);
    return resourcePermission?.actions || [];
}

/**
 * Check if a user role can perform multiple actions on a resource
 */
export function hasMultiplePermissions(
    userRole: UserRole,
    resource: string,
    actions: string[]
): PermissionCheckResult {
    const missingActions: string[] = [];

    for (const action of actions) {
        const result = hasPermission(userRole, resource, action);
        if (!result.allowed) {
            missingActions.push(action);
        }
    }

    if (missingActions.length > 0) {
        return {
            allowed: false,
            reason: `Missing permissions for actions: ${missingActions.join(', ')}`,
            requiredPermissions: missingActions.map(action => `${resource}:${action}`)
        };
    }

    return { allowed: true };
}

/**
 * Get the minimum role required to perform an action on a resource
 */
export function getMinimumRoleForPermission(resource: string, action: string): UserRole | null {
    const roles = Object.keys(ROLE_PERMISSIONS) as UserRole[];

    for (const role of roles) {
        const result = hasPermission(role, resource, action);
        if (result.allowed) {
            return role;
        }
    }

    return null;
}

/**
 * Get the hierarchy level of a user role
 * Based on the hierarchy: Admin > Management > Sales > Procurement > Engineering > QA > Production
 */
export function getRoleHierarchyLevel(role: UserRole): number {
    const roleHierarchy: Record<UserRole, number> = {
        [UserRole.ADMIN]: 7,
        [UserRole.MANAGEMENT]: 6,
        [UserRole.SALES]: 5,
        [UserRole.PROCUREMENT]: 4,
        [UserRole.ENGINEERING]: 3,
        [UserRole.QA]: 2,
        [UserRole.PRODUCTION]: 1
    };

    return roleHierarchy[role] || 0;
}

/**
 * Check if one role has higher privileges than another
 * Based on the hierarchy: Admin > Management > Sales > Procurement > Engineering > QA > Production
 */
export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
    return getRoleHierarchyLevel(role1) > getRoleHierarchyLevel(role2);
}

/**
 * Check if one role has equal or higher privileges than another
 */
export function isEqualOrHigherRole(role1: UserRole, role2: UserRole): boolean {
    return getRoleHierarchyLevel(role1) >= getRoleHierarchyLevel(role2);
}

/**
 * Get all roles that have equal or higher privileges than the specified role
 */
export function getEqualOrHigherRoles(role: UserRole): UserRole[] {
    const targetLevel = getRoleHierarchyLevel(role);
    return Object.values(UserRole).filter(r => getRoleHierarchyLevel(r) >= targetLevel);
}

/**
 * ENHANCED PERMISSION SYSTEM FUNCTIONS
 * These functions integrate with the new database-backed permission system
 */

/**
 * Check if a user has enhanced permission (database-backed)
 */
export async function hasEnhancedPermission(
    userId: string,
    resource: string,
    action: string
): Promise<PermissionCheckResult> {
    try {
        const { data, error } = await supabase.rpc('has_user_permission_enhanced', {
            p_user_id: userId,
            p_resource: resource,
            p_action: action
        });

        if (error) {
            console.error('Error checking enhanced permission:', error);
            return {
                allowed: false,
                reason: 'Error checking permission',
                requiredPermissions: [`${resource}:${action}`]
            };
        }

        return {
            allowed: data,
            reason: data ? undefined : `Enhanced permission check failed for ${resource}:${action}`,
            requiredPermissions: data ? undefined : [`${resource}:${action}`]
        };
    } catch (error) {
        console.error('Error in hasEnhancedPermission:', error);
        return {
            allowed: false,
            reason: 'Permission check failed',
            requiredPermissions: [`${resource}:${action}`]
        };
    }
}

/**
 * Check if a user has access to a feature
 */
export async function hasFeatureAccess(
    userId: string,
    featureKey: string
): Promise<boolean> {
    try {
        const { data, error } = await supabase.rpc('has_user_feature_access', {
            p_user_id: userId,
            p_feature_key: featureKey
        });

        if (error) {
            console.error('Error checking feature access:', error);
            return false;
        }

        return data;
    } catch (error) {
        console.error('Error in hasFeatureAccess:', error);
        return false;
    }
}

/**
 * Get user's effective permissions (combines role + custom + overrides)
 */
export async function getUserEffectivePermissions(userId: string): Promise<{
    baseRole: UserRole;
    customRoles: string[];
    grantedPermissions: string[];
    deniedPermissions: string[];
    featureAccess: Record<string, boolean>;
}> {
    try {
        // Get user profile
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('role, custom_permissions_cache')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return {
                baseRole: 'sales' as UserRole,
                customRoles: [],
                grantedPermissions: [],
                deniedPermissions: [],
                featureAccess: {}
            };
        }

        // Parse cached permissions if available
        if (user.custom_permissions_cache) {
            const cache = user.custom_permissions_cache as any;
            return {
                baseRole: user.role as UserRole,
                customRoles: cache.custom_roles?.map((cr: any) => cr.name) || [],
                grantedPermissions: cache.user_overrides
                    ?.filter((ov: any) => ov.type === 'grant')
                    ?.map((ov: any) => ov.permission) || [],
                deniedPermissions: cache.user_overrides
                    ?.filter((ov: any) => ov.type === 'deny')
                    ?.map((ov: any) => ov.permission) || [],
                featureAccess: cache.feature_access?.reduce((acc: any, fa: any) => {
                    acc[fa.feature_key] = fa.has_access;
                    return acc;
                }, {}) || {}
            };
        }

        // Fallback to basic role permissions
        return {
            baseRole: user.role as UserRole,
            customRoles: [],
            grantedPermissions: [],
            deniedPermissions: [],
            featureAccess: {}
        };
    } catch (error) {
        console.error('Error getting user effective permissions:', error);
        return {
            baseRole: 'sales' as UserRole,
            customRoles: [],
            grantedPermissions: [],
            deniedPermissions: [],
            featureAccess: {}
        };
    }
}

/**
 * Refresh user's permission cache
 */
export async function refreshUserPermissionCache(userId: string): Promise<void> {
    try {
        await supabase.rpc('refresh_user_permissions_cache', {
            p_user_id: userId
        });
    } catch (error) {
        console.error('Error refreshing permission cache:', error);
    }
}