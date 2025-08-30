import { ZodError, ZodIssue } from 'zod';

/**
 * Utility functions for handling validation errors and providing user-friendly messages
 */

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

export interface FormValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    fieldErrors: Record<string, string[]>;
}

/**
 * Convert Zod validation errors to user-friendly format
 */
export const formatZodErrors = (error: ZodError): FormValidationResult => {
    const errors: ValidationError[] = [];
    const fieldErrors: Record<string, string[]> = {};

    error.issues.forEach((issue: ZodIssue) => {
        const field = issue.path.join('.');
        const message = issue.message;
        const code = issue.code;

        errors.push({ field, message, code });

        if (!fieldErrors[field]) {
            fieldErrors[field] = [];
        }
        fieldErrors[field].push(message);
    });

    return {
        isValid: false,
        errors,
        fieldErrors
    };
};

/**
 * Get the first error message for a specific field
 */
export const getFieldError = (fieldErrors: Record<string, string[]>, fieldName: string): string | undefined => {
    return fieldErrors[fieldName]?.[0];
};

/**
 * Check if a specific field has validation errors
 */
export const hasFieldError = (fieldErrors: Record<string, string[]>, fieldName: string): boolean => {
    return Boolean(fieldErrors[fieldName]?.length);
};

/**
 * Get all error messages as a flat array
 */
export const getAllErrorMessages = (fieldErrors: Record<string, string[]>): string[] => {
    return Object.values(fieldErrors).flat();
};

/**
 * Format validation errors for display in toast notifications
 */
export const formatErrorsForToast = (fieldErrors: Record<string, string[]>): string => {
    const messages = getAllErrorMessages(fieldErrors);

    if (messages.length === 1) {
        return messages[0];
    }

    if (messages.length <= 3) {
        return messages.join(', ');
    }

    return `${messages.slice(0, 2).join(', ')} and ${messages.length - 2} more error${messages.length - 2 > 1 ? 's' : ''}`;
};

/**
 * Database constraint error mapping
 */
export const DATABASE_ERROR_MESSAGES: Record<string, string> = {
    // PostgreSQL constraint errors
    '23505': 'This value already exists. Please choose a different value.',
    '23503': 'Referenced record not found. Please check your selection.',
    '23502': 'This field is required and cannot be empty.',
    '23514': 'Invalid value provided. Please check the allowed values.',

    // Custom application errors
    'DUPLICATE_PROJECT_ID': 'Project ID already exists. Please use a different ID.',
    'INVALID_STAGE_TRANSITION': 'Invalid workflow stage transition.',
    'INSUFFICIENT_PERMISSIONS': 'You do not have permission to perform this action.',
    'FILE_TOO_LARGE': 'File size exceeds the maximum allowed limit.',
    'UNSUPPORTED_FILE_TYPE': 'File type is not supported for upload.',
};

/**
 * Convert database error codes to user-friendly messages
 */
export const formatDatabaseError = (error: any): string => {
    // PostgreSQL error codes
    if (error.code && DATABASE_ERROR_MESSAGES[error.code]) {
        return DATABASE_ERROR_MESSAGES[error.code];
    }

    // Custom application error codes
    if (error.message && DATABASE_ERROR_MESSAGES[error.message]) {
        return DATABASE_ERROR_MESSAGES[error.message];
    }

    // Supabase specific errors
    if (error.message) {
        // Handle common Supabase error patterns
        if (error.message.includes('duplicate key value')) {
            return 'This value already exists. Please choose a different value.';
        }

        if (error.message.includes('violates foreign key constraint')) {
            return 'Referenced record not found. Please check your selection.';
        }

        if (error.message.includes('violates not-null constraint')) {
            return 'Required field is missing. Please fill in all required fields.';
        }

        if (error.message.includes('violates check constraint')) {
            return 'Invalid value provided. Please check the allowed values.';
        }
    }

    // Fallback to generic error message
    return 'An unexpected error occurred. Please try again or contact support.';
};

/**
 * Validation error severity levels
 */
export enum ValidationSeverity {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}

/**
 * Enhanced validation error with severity
 */
export interface EnhancedValidationError extends ValidationError {
    severity: ValidationSeverity;
    suggestion?: string;
}

/**
 * Create enhanced validation errors with suggestions
 */
export const createEnhancedError = (
    field: string,
    message: string,
    code: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR,
    suggestion?: string
): EnhancedValidationError => {
    return {
        field,
        message,
        code,
        severity,
        suggestion
    };
};

/**
 * Common validation error suggestions
 */
export const VALIDATION_SUGGESTIONS: Record<string, string> = {
    'too_small': 'Please enter a longer value.',
    'too_big': 'Please enter a shorter value.',
    'invalid_email': 'Please enter a valid email address (e.g., user@example.com).',
    'invalid_date': 'Please enter a valid date in the format YYYY-MM-DD.',
    'invalid_number': 'Please enter a valid number.',
    'required': 'This field is required and must be filled in.',
    'invalid_enum': 'Please select one of the available options.',
};

/**
 * Get validation suggestion based on error code
 */
export const getValidationSuggestion = (code: string): string | undefined => {
    return VALIDATION_SUGGESTIONS[code];
};

/**
 * Format validation errors with suggestions for better UX
 */
export const formatErrorsWithSuggestions = (error: ZodError): EnhancedValidationError[] => {
    return error.issues.map((issue: ZodIssue) => {
        const field = issue.path.join('.');
        const message = issue.message;
        const code = issue.code;
        const suggestion = getValidationSuggestion(code);

        return createEnhancedError(field, message, code, ValidationSeverity.ERROR, suggestion);
    });
};