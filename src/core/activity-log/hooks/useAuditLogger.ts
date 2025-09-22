import { useCallback } from 'react';
import { useAuth } from '@/core/auth';
import { supabase } from '@/integrations/supabase/client.js';

export type AuditEventType =
    | 'login_success'
    | 'login_failure'
    | 'logout'
    | 'role_change'
    | 'password_change'
    | 'account_locked'
    | 'account_unlocked'
    | 'profile_update'
    | 'permission_denied'
    | 'session_expired'
    | 'token_refresh'
    | 'unauthorized_access';

export interface AuditLogEntry {
    action: AuditEventType;
    success: boolean;
    details?: Record<string, any>;
    entityType?: string;
    entityId?: string;
    projectId?: string;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Hook for comprehensive audit logging
 */
export function useAuditLogger() {
    const { user, profile } = useAuth();

    // Get client information
    const getClientInfo = useCallback(() => {
        return {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer
        };
    }, []);

    // Log audit event
    const logAuditEvent = useCallback(async (entry: AuditLogEntry) => {
        try {
            const clientInfo = getClientInfo();

            // Prepare audit log data
            const auditData: any = {
                action: entry.action,
                user_id: user?.id || null,
                organization_id: profile?.organization_id || null,
                entity_type: entry.entityType || 'user',
                entity_id: entry.entityId || user?.id || null,
                old_values: null,
                new_values: {
                    success: entry.success,
                    details: entry.details || {},
                    client_info: clientInfo
                },
                user_agent: entry.userAgent || clientInfo.userAgent,
                ip_address: null // Will be populated by server if available
            };

            // Add project_id if available
            if (entry.projectId) {
                auditData.project_id = entry.projectId;
            }

            // Insert into activity_log table
            const { error } = await supabase
                .from('activity_log')
                .insert(auditData);

            if (error) {
                console.error('Failed to log audit event:', error);
            }
        } catch (error) {
            console.error('Error logging audit event:', error);
        }
    }, [user, profile, getClientInfo]);

    // Specific audit logging methods
    const logLoginSuccess = useCallback((details?: Record<string, any>) => {
        logAuditEvent({
            action: 'login_success',
            success: true,
            details: {
                ...details,
                login_method: 'email_password'
            }
        });
    }, [logAuditEvent]);

    const logLoginFailure = useCallback((email: string, reason: string) => {
        logAuditEvent({
            action: 'login_failure',
            success: false,
            details: {
                email,
                reason,
                attempt_time: new Date().toISOString()
            }
        });
    }, [logAuditEvent]);

    const logLogout = useCallback((reason?: string) => {
        logAuditEvent({
            action: 'logout',
            success: true,
            details: {
                reason: reason || 'user_initiated',
                logout_time: new Date().toISOString()
            }
        });
    }, [logAuditEvent]);

    const logRoleChange = useCallback((oldRole: string, newRole: string, changedBy?: string) => {
        logAuditEvent({
            action: 'role_change',
            success: true,
            details: {
                old_role: oldRole,
                new_role: newRole,
                changed_by: changedBy,
                change_time: new Date().toISOString()
            }
        });
    }, [logAuditEvent]);

    const logProfileUpdate = useCallback((changes: Record<string, any>) => {
        logAuditEvent({
            action: 'profile_update',
            success: true,
            details: {
                changes,
                update_time: new Date().toISOString()
            }
        });
    }, [logAuditEvent]);

    const logPermissionDenied = useCallback((resource: string, action: string, requiredRole?: string) => {
        logAuditEvent({
            action: 'permission_denied',
            success: false,
            details: {
                resource,
                action,
                required_role: requiredRole,
                user_role: profile?.role,
                access_time: new Date().toISOString()
            }
        });
    }, [logAuditEvent, profile]);

    const logSessionExpired = useCallback((reason: string) => {
        logAuditEvent({
            action: 'session_expired',
            success: true,
            details: {
                reason,
                expiry_time: new Date().toISOString()
            }
        });
    }, [logAuditEvent]);

    const logTokenRefresh = useCallback((success: boolean, error?: string) => {
        logAuditEvent({
            action: 'token_refresh',
            success,
            details: {
                refresh_time: new Date().toISOString(),
                error: error || null
            }
        });
    }, [logAuditEvent]);

    const logUnauthorizedAccess = useCallback((attemptedResource: string, attemptedAction: string) => {
        logAuditEvent({
            action: 'unauthorized_access',
            success: false,
            details: {
                attempted_resource: attemptedResource,
                attempted_action: attemptedAction,
                user_role: profile?.role,
                access_time: new Date().toISOString()
            }
        });
    }, [logAuditEvent, profile]);

    return {
        logAuditEvent,
        logLoginSuccess,
        logLoginFailure,
        logLogout,
        logRoleChange,
        logProfileUpdate,
        logPermissionDenied,
        logSessionExpired,
        logTokenRefresh,
        logUnauthorizedAccess
    };
}
