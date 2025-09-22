import { supabase } from '@/integrations/supabase/client.js';

// Types for the permission system
export interface Permission {
    id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
    category: 'general' | 'admin' | 'financial' | 'approval';
    is_system: boolean;
}

export interface CustomRole {
    id: string;
    name: string;
    description?: string;
    is_system: boolean;
    is_active: boolean;
    permissions: Permission[];
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface FeatureToggle {
    id: string;
    feature_name: string;
    feature_key: string;
    description?: string;
    is_enabled: boolean;
    required_role?: string;
    required_permissions?: string[];
    config?: any;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface UserPermissionDetails {
    userId: string;
    name: string;
    email: string;
    baseRole: string;
    customRoles: CustomRole[];
    grantedPermissions: Permission[];
    deniedPermissions: Permission[];
    featureAccess: Record<string, boolean>;
    lastLogin?: string;
    createdAt: string;
}

export interface AuditEntry {
    id: string;
    user_id: string;
    target_user_id?: string;
    action_type: string;
    entity_type: string;
    entity_id?: string;
    old_values?: any;
    new_values?: any;
    reason?: string;
    created_at: string;
}

export interface PermissionChange {
    permission: string;
    type: 'grant' | 'deny' | 'revoke';
    reason?: string;
    changed_by: string;
    changed_at: string;
}

export class PermissionService {
    // User permissions management
    async getUserPermissions(userId: string): Promise<UserPermissionDetails> {
        try {
            // Get user basic info
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id, name, email, role, last_login_at, created_at')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            // Get effective permissions from cache
            const effectivePermissions = await this.getUserEffectivePermissions(userId);

            return {
                userId: user.id,
                name: user.name || '',
                email: user.email || '',
                baseRole: user.role,
                customRoles: effectivePermissions.customRoles,
                grantedPermissions: effectivePermissions.grantedPermissions,
                deniedPermissions: effectivePermissions.deniedPermissions,
                featureAccess: effectivePermissions.featureAccess,
                lastLogin: user.last_login_at,
                createdAt: user.created_at
            };
        } catch (error) {
            console.error('Error getting user permissions:', error);
            throw error;
        }
    }

    async getUserEffectivePermissions(userId: string) {
        try {
            // Get user profile with cached permissions
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('role, custom_permissions_cache')
                .eq('id', userId)
                .single();

            if (userError || !user) {
                return {
                    customRoles: [],
                    grantedPermissions: [],
                    deniedPermissions: [],
                    featureAccess: {}
                };
            }

            // If cache exists, use it
            if (user.custom_permissions_cache) {
                const cache = user.custom_permissions_cache as any;
                return {
                    customRoles: cache.custom_roles?.map((cr: any) => ({
                        id: cr.id,
                        name: cr.name,
                        description: cr.description,
                        permissions: cr.permissions || []
                    })) || [],
                    grantedPermissions: cache.user_overrides
                        ?.filter((ov: any) => ov.type === 'grant')
                        ?.map((ov: any) => ({ name: ov.permission })) || [],
                    deniedPermissions: cache.user_overrides
                        ?.filter((ov: any) => ov.type === 'deny')
                        ?.map((ov: any) => ({ name: ov.permission })) || [],
                    featureAccess: cache.feature_access?.reduce((acc: any, fa: any) => {
                        acc[fa.feature_key] = fa.has_access;
                        return acc;
                    }, {}) || {}
                };
            }

            // Fallback to basic role permissions
            return {
                customRoles: [],
                grantedPermissions: [],
                deniedPermissions: [],
                featureAccess: {}
            };
        } catch (error) {
            console.error('Error getting effective permissions:', error);
            return {
                customRoles: [],
                grantedPermissions: [],
                deniedPermissions: [],
                featureAccess: {}
            };
        }
    }

    async grantUserPermission(userId: string, permissionId: string, reason?: string): Promise<void> {
        try {
            // Get current user for audit
            const { data: currentUser } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('user_permissions')
                .upsert({
                    user_id: userId,
                    permission_id: permissionId,
                    permission_type: 'grant',
                    granted_by: currentUser.user?.id,
                    reason: reason
                }, {
                    onConflict: 'user_id,permission_id'
                });

            if (error) throw error;

            // Refresh permission cache
            await this.refreshUserPermissionCache(userId);

            // Log the change
            await this.logPermissionChange(
                currentUser.user?.id || '',
                userId,
                'grant_permission',
                'permission',
                permissionId,
                null,
                { permission_type: 'grant' },
                reason
            );

        } catch (error) {
            console.error('Error granting user permission:', error);
            throw error;
        }
    }

    async denyUserPermission(userId: string, permissionId: string, reason?: string): Promise<void> {
        try {
            const { data: currentUser } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('user_permissions')
                .upsert({
                    user_id: userId,
                    permission_id: permissionId,
                    permission_type: 'deny',
                    granted_by: currentUser.user?.id,
                    reason: reason
                }, {
                    onConflict: 'user_id,permission_id'
                });

            if (error) throw error;

            await this.refreshUserPermissionCache(userId);

            await this.logPermissionChange(
                currentUser.user?.id || '',
                userId,
                'deny_permission',
                'permission',
                permissionId,
                null,
                { permission_type: 'deny' },
                reason
            );

        } catch (error) {
            console.error('Error denying user permission:', error);
            throw error;
        }
    }

    async revokeUserPermission(userId: string, permissionId: string): Promise<void> {
        try {
            const { data: currentUser } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('user_permissions')
                .delete()
                .eq('user_id', userId)
                .eq('permission_id', permissionId);

            if (error) throw error;

            await this.refreshUserPermissionCache(userId);

            await this.logPermissionChange(
                currentUser.user?.id || '',
                userId,
                'revoke_permission',
                'permission',
                permissionId,
                { permission_type: 'grant' },
                null,
                'Permission revoked'
            );

        } catch (error) {
            console.error('Error revoking user permission:', error);
            throw error;
        }
    }

    async refreshUserPermissionCache(userId: string): Promise<void> {
        try {
            await supabase.rpc('refresh_user_permissions_cache', {
                p_user_id: userId
            });
        } catch (error) {
            console.error('Error refreshing permission cache:', error);
        }
    }

    // Role management
    async getCustomRoles(): Promise<CustomRole[]> {
        try {
            const { data, error } = await supabase
                .from('custom_roles')
                .select(`
          *,
          role_permissions (
            permissions (
              id,
              name,
              resource,
              action,
              description,
              category,
              is_system
            )
          )
        `)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;

            return (data || []).map(role => ({
                ...role,
                permissions: role.role_permissions?.map((rp: any) => rp.permissions).filter(Boolean) || []
            }));
        } catch (error) {
            console.error('Error getting custom roles:', error);
            throw error;
        }
    }

    async createCustomRole(roleData: {
        name: string;
        description?: string;
        permissionIds: string[];
    }): Promise<CustomRole> {
        try {
            const { data: currentUser } = await supabase.auth.getUser();

            // Create the role
            const { data: role, error: roleError } = await supabase
                .from('custom_roles')
                .insert({
                    name: roleData.name,
                    description: roleData.description,
                    created_by: currentUser.user?.id
                })
                .select()
                .single();

            if (roleError) throw roleError;

            // Add role permissions
            if (roleData.permissionIds.length > 0) {
                const rolePermissions = roleData.permissionIds.map(permissionId => ({
                    custom_role_id: role.id,
                    permission_id: permissionId,
                    granted_by: currentUser.user?.id
                }));

                const { error: permissionsError } = await supabase
                    .from('role_permissions')
                    .insert(rolePermissions);

                if (permissionsError) throw permissionsError;
            }

            // Log the creation
            await this.logPermissionChange(
                currentUser.user?.id || '',
                null,
                'create_role',
                'role',
                role.id,
                null,
                { name: roleData.name, description: roleData.description },
                'Custom role created'
            );

            // Return the full role data
            return this.getCustomRoleById(role.id);
        } catch (error) {
            console.error('Error creating custom role:', error);
            throw error;
        }
    }

    async getCustomRoleById(roleId: string): Promise<CustomRole> {
        try {
            const { data, error } = await supabase
                .from('custom_roles')
                .select(`
          *,
          role_permissions (
            permissions (
              id,
              name,
              resource,
              action,
              description,
              category,
              is_system
            )
          )
        `)
                .eq('id', roleId)
                .single();

            if (error) throw error;

            return {
                ...data,
                permissions: data.role_permissions?.map((rp: any) => rp.permissions).filter(Boolean) || []
            };
        } catch (error) {
            console.error('Error getting custom role:', error);
            throw error;
        }
    }

    async assignRoleToUser(userId: string, roleId: string): Promise<void> {
        try {
            const { data: currentUser } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('user_custom_roles')
                .upsert({
                    user_id: userId,
                    custom_role_id: roleId,
                    assigned_by: currentUser.user?.id
                }, {
                    onConflict: 'user_id,custom_role_id'
                });

            if (error) throw error;

            await this.refreshUserPermissionCache(userId);

            await this.logPermissionChange(
                currentUser.user?.id || '',
                userId,
                'assign_role',
                'user_custom_role',
                null,
                null,
                { role_id: roleId },
                'Custom role assigned to user'
            );

        } catch (error) {
            console.error('Error assigning role to user:', error);
            throw error;
        }
    }

    async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
        try {
            const { data: currentUser } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('user_custom_roles')
                .delete()
                .eq('user_id', userId)
                .eq('custom_role_id', roleId);

            if (error) throw error;

            await this.refreshUserPermissionCache(userId);

            await this.logPermissionChange(
                currentUser.user?.id || '',
                userId,
                'remove_role',
                'user_custom_role',
                null,
                { role_id: roleId },
                null,
                'Custom role removed from user'
            );

        } catch (error) {
            console.error('Error removing role from user:', error);
            throw error;
        }
    }

    // Feature management
    async getFeatureToggles(): Promise<FeatureToggle[]> {
        try {
            const { data, error } = await supabase
                .from('feature_toggles')
                .select('*')
                .order('feature_name');

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error getting feature toggles:', error);
            throw error;
        }
    }

    async toggleFeature(featureKey: string, enabled: boolean): Promise<void> {
        try {
            const { data: currentUser } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('feature_toggles')
                .update({
                    is_enabled: enabled,
                    updated_at: new Date().toISOString()
                })
                .eq('feature_key', featureKey);

            if (error) throw error;

            await this.logPermissionChange(
                currentUser.user?.id || '',
                null,
                'toggle_feature',
                'feature',
                null,
                null,
                { feature_key: featureKey, enabled },
                `Feature ${enabled ? 'enabled' : 'disabled'}`
            );

        } catch (error) {
            console.error('Error toggling feature:', error);
            throw error;
        }
    }

    async grantUserFeatureAccess(userId: string, featureKey: string): Promise<void> {
        try {
            const { data: currentUser } = await supabase.auth.getUser();

            // Get feature toggle ID
            const { data: feature, error: featureError } = await supabase
                .from('feature_toggles')
                .select('id')
                .eq('feature_key', featureKey)
                .single();

            if (featureError) throw featureError;

            const { error } = await supabase
                .from('user_feature_access')
                .upsert({
                    user_id: userId,
                    feature_toggle_id: feature.id,
                    has_access: true,
                    granted_by: currentUser.user?.id
                }, {
                    onConflict: 'user_id,feature_toggle_id'
                });

            if (error) throw error;

            await this.refreshUserPermissionCache(userId);

            await this.logPermissionChange(
                currentUser.user?.id || '',
                userId,
                'grant_feature_access',
                'feature',
                feature.id,
                null,
                { feature_key: featureKey },
                'Feature access granted'
            );

        } catch (error) {
            console.error('Error granting feature access:', error);
            throw error;
        }
    }

    async revokeUserFeatureAccess(userId: string, featureKey: string): Promise<void> {
        try {
            const { data: currentUser } = await supabase.auth.getUser();

            // Get feature toggle ID
            const { data: feature, error: featureError } = await supabase
                .from('feature_toggles')
                .select('id')
                .eq('feature_key', featureKey)
                .single();

            if (featureError) throw featureError;

            const { error } = await supabase
                .from('user_feature_access')
                .delete()
                .eq('user_id', userId)
                .eq('feature_toggle_id', feature.id);

            if (error) throw error;

            await this.refreshUserPermissionCache(userId);

            await this.logPermissionChange(
                currentUser.user?.id || '',
                userId,
                'revoke_feature_access',
                'feature',
                feature.id,
                { feature_key: featureKey },
                null,
                'Feature access revoked'
            );

        } catch (error) {
            console.error('Error revoking feature access:', error);
            throw error;
        }
    }

    // Permissions catalog
    async getPermissions(): Promise<Permission[]> {
        try {
            const { data, error } = await supabase
                .from('permissions')
                .select('*')
                .order('resource, action');

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error getting permissions:', error);
            throw error;
        }
    }

    // Audit log
    async getAuditLog(filters?: {
        userId?: string;
        targetUserId?: string;
        actionType?: string;
        entityType?: string;
        limit?: number;
        offset?: number;
    }): Promise<AuditEntry[]> {
        try {
            let query = supabase
                .from('permission_audit_log')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.userId) {
                query = query.eq('user_id', filters.userId);
            }

            if (filters?.targetUserId) {
                query = query.eq('target_user_id', filters.targetUserId);
            }

            if (filters?.actionType) {
                query = query.eq('action_type', filters.actionType);
            }

            if (filters?.entityType) {
                query = query.eq('entity_type', filters.entityType);
            }

            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            if (filters?.offset) {
                query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error getting audit log:', error);
            throw error;
        }
    }

    // Utility methods
    private async logPermissionChange(
        userId: string,
        targetUserId: string | null,
        actionType: string,
        entityType: string,
        entityId: string | null,
        oldValues: any,
        newValues: any,
        reason?: string
    ): Promise<void> {
        try {
            // Get organization ID
            const { data: user } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', userId)
                .single();

            await supabase
                .from('permission_audit_log')
                .insert({
                    organization_id: user?.organization_id,
                    user_id: userId,
                    target_user_id: targetUserId,
                    action_type: actionType,
                    entity_type: entityType,
                    entity_id: entityId,
                    old_values: oldValues,
                    new_values: newValues,
                    reason: reason
                });
        } catch (error) {
            console.error('Error logging permission change:', error);
        }
    }
}

// Export singleton instance
export const permissionService = new PermissionService();
