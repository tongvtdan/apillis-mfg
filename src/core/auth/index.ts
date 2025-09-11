// Core Auth Module Exports
// This module provides authentication, authorization, and user management functionality

export { AuthProvider, useAuth } from './AuthProvider';
export type { UserProfile, AuthContextType } from './AuthProvider';

export { useAuth as useAuthCore } from './useAuth';
export {
    useCurrentUser,
    useHasRole,
    useHasAnyRole,
    useIsAdmin,
    useIsManagement,
    useCanManageProjects,
    useCanApprove,
    useUserPermissions,
    useHasPermission
} from './useAuth';

export {
    getCombinedUserData,
    getUserProfileMinimal,
    updateUserProfile,
    getUserPermissions,
    hasPermission,
    getUsersByOrganization,
    getUserStatistics
} from './authService';
export type { AuthUserData, CombinedUserData } from './authService';

export {
    getCurrentUserOrgId,
    isRole,
    hasAnyRole,
    hasPermission as hasPermissionRLS,
    getCurrentUserId,
    isAuthenticated,
    getCurrentUserProfile,
    createOrgScopedQuery,
    createUserScopedQuery
} from './rls-helpers';
