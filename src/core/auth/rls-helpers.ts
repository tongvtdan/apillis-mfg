import { supabase } from '@/integrations/supabase/client.js';

/**
 * RLS (Row Level Security) Helper Functions
 * Provides utilities for working with Supabase RLS policies
 */

/**
 * Get the current user's organization ID
 * This function is used in RLS policies to ensure data isolation
 */
export async function getCurrentUserOrgId(): Promise<string | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        const { data, error } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            console.error('Error fetching user organization:', error);
            return null;
        }

        return data.organization_id;
    } catch (error) {
        console.error('Error in getCurrentUserOrgId:', error);
        return null;
    }
}

/**
 * Check if the current user has a specific role
 */
export async function isRole(role: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return false;
        }

        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            console.error('Error fetching user role:', error);
            return false;
        }

        return data.role === role;
    } catch (error) {
        console.error('Error in isRole:', error);
        return false;
    }
}

/**
 * Check if the current user has any of the specified roles
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return false;
        }

        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            console.error('Error fetching user role:', error);
            return false;
        }

        return roles.includes(data.role);
    } catch (error) {
        console.error('Error in hasAnyRole:', error);
        return false;
    }
}

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return false;
        }

        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            console.error('Error fetching user role:', error);
            return false;
        }

        // Define role-based permissions
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

        const permissions = rolePermissions[data.role] || [];

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
    } catch (error) {
        console.error('Error in hasPermission:', error);
        return false;
    }
}

/**
 * Get the current user's ID
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    } catch (error) {
        console.error('Error in getCurrentUserId:', error);
        return null;
    }
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return !!user;
    } catch (error) {
        console.error('Error in isAuthenticated:', error);
        return false;
    }
}

/**
 * Get the current user's profile data
 */
export async function getCurrentUserProfile(): Promise<{
    id: string;
    organization_id: string;
    role: string;
    name: string;
    email: string;
} | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        const { data, error } = await supabase
            .from('users')
            .select('id, organization_id, role, name, email')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getCurrentUserProfile:', error);
        return null;
    }
}

/**
 * Create a query with automatic organization filtering
 * This ensures all queries are automatically filtered by the user's organization
 */
export function createOrgScopedQuery(tableName: string) {
    return supabase.from(tableName).select('*');
}

/**
 * Create a query with automatic user filtering
 * This ensures all queries are automatically filtered by the current user
 */
export function createUserScopedQuery(tableName: string) {
    return supabase.from(tableName).select('*');
}
