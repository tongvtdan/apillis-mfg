import { useAuth } from '@/contexts/AuthContext';
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

  const canCreateRFQ = () => {
    return checkPermission('rfq', 'create').allowed;
  };

  const canReviewRFQ = () => {
    return checkPermission('rfq', 'review').allowed;
  };

  const canApproveRFQ = () => {
    return checkPermission('rfq', 'approve').allowed;
  };

  // ENHANCED PERMISSION SYSTEM FUNCTIONS
  const checkEnhancedPermission = async (resource: string, action: string) => {
    if (!profile?.id) {
      return { allowed: false, reason: 'Not authenticated' };
    }
    return await hasEnhancedPermission(profile.id, resource, action);
  };

  const checkFeatureAccess = async (featureKey: string) => {
    if (!profile?.id) return false;
    return await hasFeatureAccess(profile.id, featureKey);
  };

  const getEffectivePermissions = async () => {
    if (!profile?.id) {
      return {
        baseRole: 'sales' as UserRole,
        customRoles: [],
        grantedPermissions: [],
        deniedPermissions: [],
        featureAccess: {}
      };
    }
    return await getUserEffectivePermissions(profile.id);
  };

  const refreshPermissionCache = async () => {
    if (!profile?.id) return;
    await refreshUserPermissionCache(profile.id);
  };

  // Enhanced permission checkers for specific resources
  const canManageCustomers = async () => {
    const result = await checkEnhancedPermission('customer', 'create');
    return result.allowed;
  };

  const canManageSuppliers = async () => {
    const result = await checkEnhancedPermission('supplier', 'create');
    return result.allowed;
  };

  const canArchiveCustomers = async () => {
    const result = await checkEnhancedPermission('customer', 'archive');
    return result.allowed;
  };

  const canArchiveSuppliers = async () => {
    const result = await checkEnhancedPermission('supplier', 'archive');
    return result.allowed;
  };

  const canUseAdvancedAnalytics = async () => {
    return await checkFeatureAccess('advanced_analytics');
  };

  const canUseSupplierRating = async () => {
    return await checkFeatureAccess('supplier_rating');
  };

  const canUseBulkOperations = async () => {
    return await checkFeatureAccess('bulk_operations');
  };

  return {
    profile,
    // Legacy permission functions
    checkPermission,
    checkResourceAccess,
    getActions,
    canManageUsers,
    canViewAnalytics,
    canCreateRFQ,
    canReviewRFQ,
    canApproveRFQ,
    // Enhanced permission functions
    checkEnhancedPermission,
    checkFeatureAccess,
    getEffectivePermissions,
    refreshPermissionCache,
    // Enhanced resource-specific checkers
    canManageCustomers,
    canManageSuppliers,
    canArchiveCustomers,
    canArchiveSuppliers,
    canUseAdvancedAnalytics,
    canUseSupplierRating,
    canUseBulkOperations,
  };
}