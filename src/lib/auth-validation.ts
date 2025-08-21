import { PASSWORD_PATTERNS, AUTH_CONFIG } from './auth-constants';
import { UserRole, UserStatus, AuthErrorCode } from '../types/auth';

/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate password according to security policy
 */
export function validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
        errors.push('Password is required');
        return { isValid: false, errors };
    }

    if (!PASSWORD_PATTERNS.MIN_LENGTH.test(password)) {
        errors.push(`Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
    }

    if (!PASSWORD_PATTERNS.UPPERCASE.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!PASSWORD_PATTERNS.LOWERCASE.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!PASSWORD_PATTERNS.NUMBER.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!PASSWORD_PATTERNS.SPECIAL_CHAR.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
    const errors: string[] = [];

    if (!confirmPassword) {
        errors.push('Password confirmation is required');
    } else if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate display name
 */
export function validateDisplayName(displayName: string): ValidationResult {
    const errors: string[] = [];

    if (!displayName) {
        errors.push('Display name is required');
    } else if (displayName.trim().length < 2) {
        errors.push('Display name must be at least 2 characters long');
    } else if (displayName.trim().length > 50) {
        errors.push('Display name must be less than 50 characters');
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(displayName.trim())) {
        errors.push('Display name can only contain letters, spaces, hyphens, apostrophes, and periods');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate user role
 */
export function validateUserRole(role: string): ValidationResult {
    const errors: string[] = [];
    const validRoles = Object.values(UserRole);

    if (!role) {
        errors.push('User role is required');
    } else if (!validRoles.includes(role as UserRole)) {
        errors.push('Invalid user role');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate user status
 */
export function validateUserStatus(status: string): ValidationResult {
    const errors: string[] = [];
    const validStatuses = Object.values(UserStatus);

    if (!status) {
        errors.push('User status is required');
    } else if (!validStatuses.includes(status as UserStatus)) {
        errors.push('Invalid user status');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate department name
 */
export function validateDepartment(department?: string): ValidationResult {
    const errors: string[] = [];

    if (department && department.trim().length > 0) {
        if (department.trim().length < 2) {
            errors.push('Department name must be at least 2 characters long');
        } else if (department.trim().length > 30) {
            errors.push('Department name must be less than 30 characters');
        } else if (!/^[a-zA-Z\s\-&]+$/.test(department.trim())) {
            errors.push('Department name can only contain letters, spaces, hyphens, and ampersands');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Check if password needs to be changed based on age
 */
export function isPasswordExpired(passwordLastChanged: Date): boolean {
    const now = new Date();
    const daysSinceChange = Math.floor((now.getTime() - passwordLastChanged.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceChange >= AUTH_CONFIG.PASSWORD_EXPIRY_DAYS;
}

/**
 * Check if account should be marked as dormant
 */
export function isAccountDormant(lastLogin: Date): boolean {
    const now = new Date();
    const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLogin >= AUTH_CONFIG.DORMANT_ACCOUNT_DAYS;
}

/**
 * Check if account is currently locked
 */
export function isAccountLocked(lockedUntil?: Date): boolean {
    if (!lockedUntil) return false;
    return new Date() < lockedUntil;
}

/**
 * Validate complete registration form
 */
export function validateRegistrationForm(data: {
    email: string;
    password: string;
    confirmPassword: string;
    displayName: string;
    role?: string;
    department?: string;
}): ValidationResult {
    const allErrors: string[] = [];

    const emailValidation = validateEmail(data.email);
    const passwordValidation = validatePassword(data.password);
    const passwordConfirmValidation = validatePasswordConfirmation(data.password, data.confirmPassword);
    const displayNameValidation = validateDisplayName(data.displayName);
    const departmentValidation = validateDepartment(data.department);

    allErrors.push(...emailValidation.errors);
    allErrors.push(...passwordValidation.errors);
    allErrors.push(...passwordConfirmValidation.errors);
    allErrors.push(...displayNameValidation.errors);
    allErrors.push(...departmentValidation.errors);

    if (data.role) {
        const roleValidation = validateUserRole(data.role);
        allErrors.push(...roleValidation.errors);
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
}

/**
 * Validate login form
 */
export function validateLoginForm(data: { email: string; password: string }): ValidationResult {
    const allErrors: string[] = [];

    const emailValidation = validateEmail(data.email);
    allErrors.push(...emailValidation.errors);

    if (!data.password) {
        allErrors.push('Password is required');
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
}