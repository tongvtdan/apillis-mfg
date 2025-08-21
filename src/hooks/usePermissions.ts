import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, hasResourceAccess, getResourceActions } from '@/lib/permissions';
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

  const canCreateRFQ = () => {
    return checkPermission('rfq', 'create').allowed;
  };

  const canReviewRFQ = () => {
    return checkPermission('rfq', 'review').allowed;
  };

  const canApproveRFQ = () => {
    return checkPermission('rfq', 'approve').allowed;
  };

  return {
    profile,
    checkPermission,
    checkResourceAccess,
    getActions,
    canManageUsers,
    canViewAnalytics,
    canCreateRFQ,
    canReviewRFQ,
    canApproveRFQ,
  };
}