import { UserRole, Permission, ROLE_PERMISSIONS, PermissionCheckResult } from '../types/auth';

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
 * Check if one role has higher privileges than another
 * Based on the hierarchy: Admin > Management > Procurement Owner > Engineering/QA/Production > Supplier > Customer
 */
export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
        [UserRole.ADMIN]: 6,
        [UserRole.MANAGEMENT]: 5,
        [UserRole.PROCUREMENT_OWNER]: 4,
        [UserRole.PROCUREMENT]: 4,
        [UserRole.ENGINEERING]: 3,
        [UserRole.QA]: 3,
        [UserRole.PRODUCTION]: 3,
        [UserRole.SUPPLIER]: 2,
        [UserRole.CUSTOMER]: 1
    };

    return roleHierarchy[role1] > roleHierarchy[role2];
}