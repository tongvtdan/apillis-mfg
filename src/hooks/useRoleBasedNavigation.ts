import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, hasResourceAccess } from '@/lib/permissions';
import { UserRole } from '@/types/auth';
import { ROLE_DEFAULT_ROUTES } from '@/lib/auth-constants';

export interface NavigationItem {
    path: string;
    label: string;
    icon?: string;
    requiredPermissions?: string[];
    requiredRoles?: UserRole[];
    children?: NavigationItem[];
}

/**
 * Hook for role-based navigation management
 */
export function useRoleBasedNavigation() {
    const { profile } = useAuth();

    // Define navigation structure with permissions
    const navigationItems: NavigationItem[] = useMemo(() => [
        {
            path: '/dashboard',
            label: 'Dashboard',
            icon: 'LayoutDashboard',
            requiredPermissions: ['dashboard:read']
        },
        {
            path: '/projects',
            label: 'Projects',
            icon: 'FolderOpen',
            requiredPermissions: ['rfq:read']
        },
        {
            path: '/customers',
            label: 'Customers',
            icon: 'Users',
            requiredPermissions: ['customer:read']
        },
        {
            path: '/suppliers',
            label: 'Suppliers',
            icon: 'Truck',
            requiredPermissions: ['supplier:read']
        },
        {
            path: '/inventory',
            label: 'Inventory',
            icon: 'Package',
            requiredRoles: [UserRole.PROCUREMENT, UserRole.PRODUCTION, UserRole.MANAGEMENT, UserRole.ADMIN]
        },
        {
            path: '/purchase-orders',
            label: 'Purchase Orders',
            icon: 'ShoppingCart',
            requiredRoles: [UserRole.PROCUREMENT, UserRole.MANAGEMENT, UserRole.ADMIN]
        },
        {
            path: '/production',
            label: 'Production',
            icon: 'Cog',
            requiredRoles: [UserRole.PRODUCTION, UserRole.MANAGEMENT, UserRole.ADMIN]
        },
        {
            path: '/reviews',
            label: 'Reviews',
            icon: 'CheckSquare',
            requiredRoles: [UserRole.ENGINEERING, UserRole.QA, UserRole.PRODUCTION, UserRole.MANAGEMENT, UserRole.ADMIN, UserRole.PROCUREMENT]
        },
        {
            path: '/analytics',
            label: 'Analytics',
            icon: 'BarChart3',
            requiredRoles: [UserRole.MANAGEMENT, UserRole.ADMIN, UserRole.PROCUREMENT]
        },
        {
            path: '/reports',
            label: 'Reports',
            icon: 'FileText',
            requiredPermissions: ['analytics:read']
        },
        {
            path: '/users',
            label: 'User Management',
            icon: 'UserCog',
            requiredRoles: [UserRole.MANAGEMENT, UserRole.ADMIN]
        },
        {
            path: '/settings',
            label: 'Settings',
            icon: 'Settings',
            requiredPermissions: ['profile:read_own']
        }
    ], []);

    // Filter navigation items based on user permissions
    const allowedNavigationItems = useMemo(() => {
        if (!profile) return [];

        return navigationItems.filter(item => {
            // Check role-based access
            if (item.requiredRoles && !item.requiredRoles.includes(profile.role as UserRole)) {
                return false;
            }

            // Check permission-based access
            if (item.requiredPermissions) {
                return item.requiredPermissions.some(permission => {
                    const [resource, action] = permission.split(':');
                    return hasPermission(profile.role as UserRole, resource, action).allowed;
                });
            }

            return true;
        });
    }, [profile, navigationItems]);

    // Get default route for user role
    const getDefaultRoute = () => {
        if (!profile) return '/auth';
        return ROLE_DEFAULT_ROUTES[profile.role as keyof typeof ROLE_DEFAULT_ROUTES] || '/dashboard';
    };

    // Check if user can access a specific route
    const canAccessRoute = (path: string) => {
        if (!profile) return false;

        const item = navigationItems.find(nav => nav.path === path);
        if (!item) return true; // Allow access to routes not in navigation (like profile, etc.)

        // Check role-based access
        if (item.requiredRoles && !item.requiredRoles.includes(profile.role as UserRole)) {
            return false;
        }

        // Check permission-based access
        if (item.requiredPermissions) {
            return item.requiredPermissions.some(permission => {
                const [resource, action] = permission.split(':');
                return hasPermission(profile.role as UserRole, resource, action).allowed;
            });
        }

        return true;
    };

    // Check if user has access to a resource
    const hasAccess = (resource: string, action: string) => {
        if (!profile) return false;
        return hasPermission(profile.role as UserRole, resource, action).allowed;
    };

    // Check if user has access to any resource
    const hasResourcePermission = (resource: string) => {
        if (!profile) return false;
        return hasResourceAccess(profile.role as UserRole, resource);
    };

    // Get user's role hierarchy level for UI display
    const getRoleLevel = () => {
        if (!profile) return 0;

        const roleLevels: Record<string, number> = {
            'admin': 7,
            'management': 6,
            'sales': 5,
            'procurement': 4,
            'engineering': 3,
            'qa': 2,
            'production': 1
        };

        return roleLevels[profile.role] || 0;
    };

    return {
        navigationItems: allowedNavigationItems,
        getDefaultRoute,
        canAccessRoute,
        hasAccess,
        hasResourcePermission,
        getRoleLevel,
        userRole: profile?.role,
        isAdmin: profile?.role === 'admin',
        isManagement: profile?.role === 'management' || profile?.role === 'admin'
    };
}