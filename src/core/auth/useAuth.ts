import { AuthContextType } from './AuthProvider';
import { useAuth as useAuthProvider } from './AuthProvider';

/**
 * Custom hook to access authentication context
 * Provides type-safe access to auth state and methods
 * Re-exports the useAuth hook from AuthProvider for consistency
 */
export const useAuth = useAuthProvider;

/**
 * Hook to get current user information
 * Returns user, profile, and loading state
 */
export function useCurrentUser() {
    const { user, profile, loading } = useAuth();

    return {
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        organizationId: profile?.organization_id,
        role: profile?.role,
        name: profile?.name,
        email: profile?.email
    };
}

/**
 * Hook to check if user has specific role
 * Returns boolean indicating if user has the role
 */
export function useHasRole(role: string) {
    const { profile } = useAuth();

    return profile?.role === role;
}

/**
 * Hook to check if user has any of the specified roles
 * Returns boolean indicating if user has any of the roles
 */
export function useHasAnyRole(roles: string[]) {
    const { profile } = useAuth();

    if (!profile) return false;

    return roles.includes(profile.role);
}

/**
 * Hook to check if user is admin
 * Returns boolean indicating if user is admin
 */
export function useIsAdmin() {
    return useHasRole('admin');
}

/**
 * Hook to check if user is management
 * Returns boolean indicating if user is management
 */
export function useIsManagement() {
    return useHasAnyRole(['admin', 'management']);
}

/**
 * Hook to check if user can manage projects
 * Returns boolean indicating if user can manage projects
 */
export function useCanManageProjects() {
    return useHasAnyRole(['admin', 'management', 'sales', 'engineering', 'procurement']);
}

/**
 * Hook to check if user can approve items
 * Returns boolean indicating if user can approve items
 */
export function useCanApprove() {
    return useHasAnyRole(['admin', 'management', 'qa', 'procurement']);
}

/**
 * Hook to get user permissions
 * Returns array of permissions based on user role
 */
export function useUserPermissions() {
    const { profile } = useAuth();

    if (!profile) return [];

    const rolePermissions: Record<string, string[]> = {
        admin: ['*'], // All permissions
        management: [
            'read:*', 'create:projects', 'update:projects', 'delete:projects',
            'approve:*', 'manage:users', 'read:analytics'
        ],
        engineering: [
            'read:projects', 'update:projects', 'create:documents',
            'read:documents', 'update:documents', 'review:projects'
        ],
        qa: [
            'read:projects', 'review:projects', 'create:documents',
            'read:documents', 'approve:quality', 'read:analytics'
        ],
        procurement: [
            'read:projects', 'update:projects', 'create:suppliers',
            'read:suppliers', 'update:suppliers', 'approve:purchase_orders'
        ],
        production: [
            'read:projects', 'update:projects', 'read:production',
            'update:production', 'create:documents'
        ],
        sales: [
            'read:projects', 'create:projects', 'update:projects',
            'read:customers', 'create:customers', 'update:customers'
        ]
    };

    return rolePermissions[profile.role] || [];
}

/**
 * Hook to check if user has specific permission
 * Returns boolean indicating if user has the permission
 */
export function useHasPermission(permission: string) {
    const permissions = useUserPermissions();

    // Check for wildcard permissions
    if (permissions.includes('*')) {
        return true;
    }

    // Check for exact permission match
    if (permissions.includes(permission)) {
        return true;
    }

    // Check for wildcard patterns (e.g., 'read:*' covers 'read:projects')
    const [action, resource] = permission.split(':');
    const wildcardPermission = `${action}:*`;

    return permissions.includes(wildcardPermission);
}
