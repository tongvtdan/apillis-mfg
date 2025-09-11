// Database timestamp type (generic - can be adapted for any database)
export type DatabaseTimestamp = string; // ISO 8601 timestamp string

// User roles enum
export enum UserRole {
    SALES = 'sales',
    PROCUREMENT = 'procurement',
    ENGINEERING = 'engineering',
    QA = 'qa',
    PRODUCTION = 'production',
    MANAGEMENT = 'management',
    ADMIN = 'admin'
}

// User status enum
export enum UserStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    PENDING = 'Pending',
    LOCKED = 'Locked',
    DORMANT = 'Dormant'
}

// Audit event types
export enum AuditEventType {
    LOGIN_SUCCESS = 'login_success',
    LOGIN_FAILURE = 'login_failure',
    LOGOUT = 'logout',
    ROLE_CHANGE = 'role_change',
    PASSWORD_CHANGE = 'password_change',
    ACCOUNT_LOCKED = 'account_locked',
    ACCOUNT_UNLOCKED = 'account_unlocked',
    PROFILE_UPDATE = 'profile_update'
}

// User document interface
export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    status: UserStatus;
    department?: string;
    lastLogin: DatabaseTimestamp;
    createdAt: DatabaseTimestamp;
    createdBy: string;
    updatedAt: DatabaseTimestamp;
    updatedBy: string;
    passwordLastChanged: DatabaseTimestamp;
    loginAttempts: number;
    lockedUntil?: DatabaseTimestamp;
}

// Audit log interface
export interface AuditLog {
    id: string;
    timestamp: DatabaseTimestamp;
    eventType: AuditEventType;
    userId: string;
    actorId?: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    details: Record<string, any>;
    sessionId?: string;
}

// Permission interface
export interface Permission {
    resource: string;
    actions: string[];
}

// Note: AuthContextType is now defined in @/core/auth/AuthProvider.tsx

// User session interface
export interface UserSession {
    id: string;
    userId: string;
    deviceInfo: string;
    ipAddress: string;
    createdAt: DatabaseTimestamp;
    lastActivity: DatabaseTimestamp;
    isActive: boolean;
}

// Authentication error types (defined below with enhanced properties)

// Login form data
export interface LoginFormData {
    email: string;
    password: string;
    rememberMe?: boolean;
}

// Registration form data
export interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    displayName: string;
    role?: UserRole;
}

// Profile update form data
export interface ProfileUpdateData {
    displayName?: string;
    email?: string;
    department?: string;
}

// Password change form data
export interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Permission matrix mapping roles to allowed actions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.SALES]: [
        { resource: 'rfq', actions: ['create', 'read', 'update', 'assign', 'delete'] },
        { resource: 'customer', actions: ['read', 'create', 'update'] },
        { resource: 'dashboard', actions: ['read'] },
        { resource: 'profile', actions: ['read_own', 'update_own'] },
        { resource: 'workflow', actions: ['read', 'update', 'bypass'] },
        { resource: 'notifications', actions: ['read', 'create'] }
    ],
    [UserRole.PROCUREMENT]: [
        { resource: 'rfq', actions: ['create', 'read', 'update', 'assign', 'delete'] },
        { resource: 'supplier', actions: ['read', 'create', 'update'] },
        { resource: 'dashboard', actions: ['read'] },
        { resource: 'profile', actions: ['read_own', 'update_own'] },
        { resource: 'workflow', actions: ['read', 'update'] },
        { resource: 'notifications', actions: ['read', 'create'] }
    ],
    [UserRole.ENGINEERING]: [
        { resource: 'rfq', actions: ['read', 'update', 'review'] },
        { resource: 'technical_specs', actions: ['read', 'create', 'update'] },
        { resource: 'dashboard', actions: ['read'] },
        { resource: 'profile', actions: ['read_own', 'update_own'] },
        { resource: 'documents', actions: ['read', 'create', 'update'] },
        { resource: 'workflow', actions: ['read', 'update'] }
    ],
    [UserRole.QA]: [
        { resource: 'rfq', actions: ['read', 'review', 'approve', 'reject'] },
        { resource: 'quality_specs', actions: ['read', 'create', 'update'] },
        { resource: 'dashboard', actions: ['read'] },
        { resource: 'profile', actions: ['read_own', 'update_own'] },
        { resource: 'audit', actions: ['read', 'create'] },
        { resource: 'workflow', actions: ['read', 'update'] }
    ],
    [UserRole.PRODUCTION]: [
        { resource: 'rfq', actions: ['read', 'update', 'schedule'] },
        { resource: 'production_schedule', actions: ['read', 'create', 'update'] },
        { resource: 'dashboard', actions: ['read'] },
        { resource: 'profile', actions: ['read_own', 'update_own'] },
        { resource: 'capacity', actions: ['read', 'update'] },
        { resource: 'workflow', actions: ['read', 'update'] }
    ],
    [UserRole.MANAGEMENT]: [
        { resource: 'rfq', actions: ['read', 'approve', 'reject'] },
        { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'customer', actions: ['read', 'create', 'update', 'delete', 'archive'] },
        { resource: 'supplier', actions: ['read', 'create', 'update', 'delete', 'archive'] },
        { resource: 'dashboard', actions: ['read', 'admin'] },
        { resource: 'profile', actions: ['read_own', 'update_own', 'read_all'] },
        { resource: 'analytics', actions: ['read', 'export'] },
        { resource: 'audit', actions: ['read', 'export'] },
        { resource: 'workflow', actions: ['read', 'create', 'update', 'delete', 'bypass'] },
        { resource: 'system_config', actions: ['read', 'update'] }
    ],
    [UserRole.ADMIN]: [
        { resource: 'rfq', actions: ['read', 'approve', 'reject', 'delete'] },
        { resource: 'users', actions: ['read', 'create', 'update', 'delete', 'manage_roles'] },
        { resource: 'customer', actions: ['read', 'create', 'update', 'delete', 'archive'] },
        { resource: 'supplier', actions: ['read', 'create', 'update', 'delete', 'archive'] },
        { resource: 'dashboard', actions: ['read', 'admin', 'system'] },
        { resource: 'profile', actions: ['read_own', 'update_own', 'read_all', 'update_all'] },
        { resource: 'analytics', actions: ['read', 'export', 'system'] },
        { resource: 'audit', actions: ['read', 'export', 'system'] },
        { resource: 'workflow', actions: ['read', 'create', 'update', 'delete', 'bypass', 'configure'] },
        { resource: 'system_config', actions: ['read', 'update', 'delete'] },
        { resource: 'organizations', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'database', actions: ['read', 'backup', 'restore'] }
    ]
};

// Authentication error codes
export enum AuthErrorCode {
    INVALID_CREDENTIALS = 'auth/invalid-credentials',
    USER_NOT_FOUND = 'auth/user-not-found',
    WRONG_PASSWORD = 'auth/wrong-password',
    EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
    WEAK_PASSWORD = 'auth/weak-password',
    ACCOUNT_LOCKED = 'auth/account-locked',
    ACCOUNT_DISABLED = 'auth/account-disabled',
    TOO_MANY_REQUESTS = 'auth/too-many-requests',
    NETWORK_REQUEST_FAILED = 'auth/network-request-failed',
    INVALID_EMAIL = 'auth/invalid-email',
    OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',
    REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',
    EXPIRED_ACTION_CODE = 'auth/expired-action-code',
    INVALID_ACTION_CODE = 'auth/invalid-action-code',
    UNAUTHORIZED = 'auth/unauthorized',
    INSUFFICIENT_PERMISSIONS = 'auth/insufficient-permissions',
    SESSION_EXPIRED = 'auth/session-expired'
}

// Enhanced authentication error interface
export interface AuthError {
    code: AuthErrorCode;
    message: string;
    details?: any;
    timestamp?: Date;
    userId?: string;
    ipAddress?: string;
}

// Authentication response interface
export interface AuthResponse {
    success: boolean;
    user?: User;
    error?: AuthError;
    sessionId?: string;
}

// Permission check result interface
export interface PermissionCheckResult {
    allowed: boolean;
    reason?: string;
    requiredRole?: UserRole;
    requiredPermissions?: string[];
}

// Role assignment interface
export interface RoleAssignment {
    userId: string;
    oldRole: UserRole;
    newRole: UserRole;
    assignedBy: string;
    assignedAt: DatabaseTimestamp;
    reason?: string;
}