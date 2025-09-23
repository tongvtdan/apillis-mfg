import { AuthErrorCode } from '../types/auth';

/**
 * Authentication configuration constants
 */
export const AUTH_CONFIG = {
    // Session management
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    TOKEN_REFRESH_INTERVAL: 55 * 60 * 1000, // 55 minutes in milliseconds

    // Account security
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCK_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
    PASSWORD_RESET_TIMEOUT: 60 * 60 * 1000, // 1 hour in milliseconds

    // Password policy
    MIN_PASSWORD_LENGTH: 8,
    PASSWORD_EXPIRY_DAYS: 90,

    // Audit and compliance
    AUDIT_LOG_RETENTION_DAYS: 365,
    DORMANT_ACCOUNT_DAYS: 180, // 6 months

    // Performance
    PERMISSION_CHECK_TIMEOUT: 100, // milliseconds
} as const;

/**
 * User-friendly error messages for authentication errors
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
    [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
    [AuthErrorCode.USER_NOT_FOUND]: 'No account found with this email address.',
    [AuthErrorCode.WRONG_PASSWORD]: 'Invalid email or password. Please try again.',
    [AuthErrorCode.EMAIL_ALREADY_IN_USE]: 'An account with this email address already exists.',
    [AuthErrorCode.WEAK_PASSWORD]: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
    [AuthErrorCode.ACCOUNT_LOCKED]: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.',
    [AuthErrorCode.ACCOUNT_DISABLED]: 'Your account has been disabled. Please contact your administrator.',
    [AuthErrorCode.TOO_MANY_REQUESTS]: 'Too many requests. Please wait a moment before trying again.',
    [AuthErrorCode.NETWORK_REQUEST_FAILED]: 'Network error. Please check your connection and try again.',
    [AuthErrorCode.INVALID_EMAIL]: 'Please enter a valid email address.',
    [AuthErrorCode.OPERATION_NOT_ALLOWED]: 'This operation is not allowed. Please contact your administrator.',
    [AuthErrorCode.REQUIRES_RECENT_LOGIN]: 'For security reasons, please log in again to continue.',
    [AuthErrorCode.EXPIRED_ACTION_CODE]: 'This link has expired. Please request a new one.',
    [AuthErrorCode.INVALID_ACTION_CODE]: 'This link is invalid. Please request a new one.',
    [AuthErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action.',
    [AuthErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have sufficient permissions to access this resource.',
    [AuthErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
};

/**
 * Password validation regex patterns
 */
export const PASSWORD_PATTERNS = {
    MIN_LENGTH: /.{8,}/,
    UPPERCASE: /[A-Z]/,
    LOWERCASE: /[a-z]/,
    NUMBER: /\d/,
    SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
} as const;

/**
 * Role display names and descriptions
 */
export const ROLE_DESCRIPTIONS = {
    sales: 'Sales staff who manage customer relationships and RFQ intake',
    procurement: 'Internal staff who manage RFQ workflows and supplier relationships',
    engineering: 'Technical staff who review and provide engineering input on RFQs',
    qa: 'Quality assurance staff who review and approve technical specifications',
    production: 'Production staff who handle manufacturing scheduling and capacity planning',
    management: 'Senior management with full system access and administrative privileges',
    admin: 'System administrators with full access to all features and system configuration',
} as const;

/**
 * Navigation routes based on user roles
 */
export const ROLE_DEFAULT_ROUTES = {
    sales: '/dashboard',
    procurement: '/dashboard',
    engineering: '/dashboard',
    qa: '/dashboard',
    production: '/dashboard',
    management: '/dashboard',
    admin: '/dashboard',
} as const;

/**
 * Audit event display names
 */
export const AUDIT_EVENT_NAMES = {
    login_success: 'Successful Login',
    login_failure: 'Failed Login Attempt',
    logout: 'User Logout',
    role_change: 'Role Assignment Changed',
    password_change: 'Password Changed',
    account_locked: 'Account Locked',
    account_unlocked: 'Account Unlocked',
    profile_update: 'Profile Updated',
} as const;