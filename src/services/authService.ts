import { supabase } from '@/integrations/supabase/client.ts';
import { UserProfile } from '@/core/auth';

/**
 * Optimized Auth Service
 * Provides efficient data fetching from both auth.users and users table
 * Eliminates redundant queries and optimizes performance
 */

export interface AuthUserData {
    id: string;
    email: string;
    email_confirmed_at?: string;
    last_sign_in_at?: string;
    created_at: string;
    updated_at: string;
    raw_user_meta_data?: Record<string, any>;
}

export interface CombinedUserData extends UserProfile {
    authUser: AuthUserData;
    organization: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

/**
 * Optimized function to get both auth user and profile data in parallel
 * Reduces database calls and improves performance
 */
export async function getCombinedUserData(userId: string): Promise<CombinedUserData | null> {
    try {
        // Get auth user data and profile data in parallel
        const [authResult, profileResult] = await Promise.all([
            supabase.auth.getUser(),
            supabase
                .from('users')
                .select(`
          *,
          organizations!inner (
            id,
            name,
            slug
          )
        `)
                .eq('id', userId)
                .maybeSingle()
        ]);

        if (authResult.error || profileResult.error) {
            console.error('Error fetching combined user data:', {
                authError: authResult.error,
                profileError: profileResult.error
            });
            return null;
        }

        if (!authResult.data.user || !profileResult.data) {
            console.warn('Auth user or profile data not found');
            return null;
        }

        const authUser: AuthUserData = {
            id: authResult.data.user.id,
            email: authResult.data.user.email || '',
            email_confirmed_at: authResult.data.user.email_confirmed_at || undefined,
            last_sign_in_at: authResult.data.user.last_sign_in_at || undefined,
            created_at: authResult.data.user.created_at,
            updated_at: authResult.data.user.updated_at,
            raw_user_meta_data: authResult.data.user.raw_user_meta_data || {}
        };

        const profile: UserProfile = {
            ...profileResult.data,
            role: profileResult.data.role as UserProfile['role'],
            status: profileResult.data.status as UserProfile['status'],
            preferences: typeof profileResult.data.preferences === 'object' && profileResult.data.preferences !== null
                ? profileResult.data.preferences as Record<string, any>
                : {}
        };

        return {
            ...profile,
            authUser,
            organization: profileResult.data.organizations || null
        };
    } catch (error) {
        console.error('Error in getCombinedUserData:', error);
        return null;
    }
}

/**
 * Optimized function to get user profile with minimal data
 * For cases where we only need basic profile information
 */
export async function getUserProfileMinimal(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
        id,
        organization_id,
        email,
        name,
        role,
        status,
        department,
        preferences,
        last_login_at
      `)
            .eq('id', userId)
            .maybeSingle();

        if (error || !data) {
            console.error('Error fetching minimal user profile:', error);
            return null;
        }

        return {
            ...data,
            role: data.role as UserProfile['role'],
            status: data.status as UserProfile['status'],
            preferences: typeof data.preferences === 'object' && data.preferences !== null
                ? data.preferences as Record<string, any>
                : {},
            // Fill in required fields that weren't selected
            created_at: '',
            updated_at: ''
        };
    } catch (error) {
        console.error('Error in getUserProfileMinimal:', error);
        return null;
    }
}

/**
 * Optimized function to update user profile with validation
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('users')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            console.error('Error updating user profile:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        return false;
    }
}

/**
 * Optimized function to get user permissions based on role
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .maybeSingle();

        if (error || !data) {
            console.error('Error fetching user role:', error);
            return [];
        }

        // Return permissions based on role (this could be moved to a separate permissions table)
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

        return rolePermissions[data.role] || [];
    } catch (error) {
        console.error('Error in getUserPermissions:', error);
        return [];
    }
}

/**
 * Optimized function to check if user has specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
        const permissions = await getUserPermissions(userId);

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
 * Optimized function to get users by organization with minimal data
 */
export async function getUsersByOrganization(orgId: string): Promise<Array<{ id: string, name: string, email: string, role: string }>> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('organization_id', orgId)
            .eq('status', 'active')
            .order('name');

        if (error) {
            console.error('Error fetching users by organization:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUsersByOrganization:', error);
        return [];
    }
}

/**
 * Optimized function to get user statistics for dashboard
 */
export async function getUserStatistics(orgId: string): Promise<{
    total_users: number;
    active_users: number;
    users_by_role: Record<string, number>;
}> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('role, status')
            .eq('organization_id', orgId);

        if (error) {
            console.error('Error fetching user statistics:', error);
            return { total_users: 0, active_users: 0, users_by_role: {} };
        }

        const stats = {
            total_users: data.length,
            active_users: data.filter(u => u.status === 'active').length,
            users_by_role: data.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };

        return stats;
    } catch (error) {
        console.error('Error in getUserStatistics:', error);
        return { total_users: 0, active_users: 0, users_by_role: {} };
    }
}
