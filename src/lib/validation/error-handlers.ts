/**
 * Database error handling utilities for user-friendly error messages
 */

export interface DatabaseError {
    code?: string;
    message: string;
    details?: any;
    hint?: string;
}

export interface UserFriendlyError {
    title: string;
    message: string;
    field?: string;
    recoverable: boolean;
}

/**
 * Convert database errors to user-friendly messages
 */
export function handleDatabaseError(error: any): UserFriendlyError {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorCode = error?.code;

    // PostgreSQL error codes
    switch (errorCode) {
        case '23505': // unique_violation
            return handleUniqueViolation(error);
        case '23503': // foreign_key_violation
            return handleForeignKeyViolation(error);
        case '23502': // not_null_violation
            return handleNotNullViolation(error);
        case '23514': // check_violation
            return handleCheckViolation(error);
        case '22001': // string_data_right_truncation
            return handleStringTruncation(error);
        case '22003': // numeric_value_out_of_range
            return handleNumericOutOfRange(error);
        default:
            return handleGenericError(errorMessage);
    }
}

function handleUniqueViolation(error: any): UserFriendlyError {
    const message = error.message || '';

    if (message.includes('project_id')) {
        return {
            title: 'Duplicate Project ID',
            message: 'A project with this ID already exists. Please try again or contact support.',
            field: 'project_id',
            recoverable: true
        };
    }

    if (message.includes('email')) {
        return {
            title: 'Email Already Exists',
            message: 'This email address is already registered. Please use a different email.',
            field: 'email',
            recoverable: true
        };
    }

    return {
        title: 'Duplicate Entry',
        message: 'This information already exists in the system. Please check your inputs.',
        recoverable: true
    };
}

function handleForeignKeyViolation(error: any): UserFriendlyError {
    const message = error.message || '';

    if (message.includes('customer_id')) {
        return {
            title: 'Invalid Customer',
            message: 'The selected customer does not exist. Please refresh the page and try again.',
            field: 'customer_id',
            recoverable: true
        };
    }

    if (message.includes('assigned_to')) {
        return {
            title: 'Invalid User Assignment',
            message: 'The selected user does not exist. Please choose a different user.',
            field: 'assigned_to',
            recoverable: true
        };
    }

    if (message.includes('current_stage_id')) {
        return {
            title: 'Invalid Workflow Stage',
            message: 'The selected workflow stage is not valid. Please refresh the page and try again.',
            field: 'current_stage_id',
            recoverable: true
        };
    }

    return {
        title: 'Invalid Reference',
        message: 'One of the selected items is no longer available. Please refresh the page and try again.',
        recoverable: true
    };
}

function handleNotNullViolation(error: any): UserFriendlyError {
    const message = error.message || '';

    if (message.includes('title')) {
        return {
            title: 'Missing Project Title',
            message: 'Project title is required and cannot be empty.',
            field: 'title',
            recoverable: true
        };
    }

    if (message.includes('project_id')) {
        return {
            title: 'Missing Project ID',
            message: 'Project ID is required. This should be generated automatically.',
            field: 'project_id',
            recoverable: false
        };
    }

    if (message.includes('organization_id')) {
        return {
            title: 'Missing Organization',
            message: 'Organization information is missing. Please log out and log back in.',
            field: 'organization_id',
            recoverable: false
        };
    }

    return {
        title: 'Missing Required Information',
        message: 'Some required information is missing. Please check all required fields.',
        recoverable: true
    };
}

function handleCheckViolation(error: any): UserFriendlyError {
    const message = error.message || '';

    if (message.includes('status')) {
        return {
            title: 'Invalid Status',
            message: 'Please select a valid project status (active, on_hold, delayed, cancelled, or completed).',
            field: 'status',
            recoverable: true
        };
    }

    if (message.includes('priority_level')) {
        return {
            title: 'Invalid Priority',
            message: 'Please select a valid priority level (low, medium, high, or urgent).',
            field: 'priority_level',
            recoverable: true
        };
    }

    return {
        title: 'Invalid Data',
        message: 'Some of the provided data is not valid. Please check your inputs and try again.',
        recoverable: true
    };
}

function handleStringTruncation(error: any): UserFriendlyError {
    const message = error.message || '';

    if (message.includes('title')) {
        return {
            title: 'Title Too Long',
            message: 'Project title cannot exceed 255 characters. Please shorten your title.',
            field: 'title',
            recoverable: true
        };
    }

    if (message.includes('project_id')) {
        return {
            title: 'Project ID Too Long',
            message: 'Project ID cannot exceed 50 characters.',
            field: 'project_id',
            recoverable: false
        };
    }

    return {
        title: 'Text Too Long',
        message: 'One of your text fields is too long. Please shorten your input and try again.',
        recoverable: true
    };
}

function handleNumericOutOfRange(error: any): UserFriendlyError {
    const message = error.message || '';

    if (message.includes('estimated_value')) {
        return {
            title: 'Value Too Large',
            message: 'The estimated value is too large. Please enter a smaller amount.',
            field: 'estimated_value',
            recoverable: true
        };
    }

    return {
        title: 'Number Out of Range',
        message: 'One of the numeric values is too large. Please enter a smaller number.',
        recoverable: true
    };
}

function handleGenericError(message: string): UserFriendlyError {
    // Check for common patterns in error messages
    if (message.toLowerCase().includes('connection')) {
        return {
            title: 'Connection Error',
            message: 'Unable to connect to the database. Please check your internet connection and try again.',
            recoverable: true
        };
    }

    if (message.toLowerCase().includes('timeout')) {
        return {
            title: 'Request Timeout',
            message: 'The request took too long to complete. Please try again.',
            recoverable: true
        };
    }

    if (message.toLowerCase().includes('permission')) {
        return {
            title: 'Permission Denied',
            message: 'You do not have permission to perform this action. Please contact your administrator.',
            recoverable: false
        };
    }

    return {
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
        recoverable: true
    };
}

/**
 * Validation error messages for form fields
 */
export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PHONE_INVALID: 'Please enter a valid phone number',
    URL_INVALID: 'Please enter a valid URL',
    NUMBER_INVALID: 'Please enter a valid number',
    DATE_INVALID: 'Please enter a valid date',
    DATE_FUTURE: 'Date must be in the future',
    DATE_PAST: 'Date must be in the past',
    MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
    MAX_LENGTH: (max: number) => `Cannot exceed ${max} characters`,
    MIN_VALUE: (min: number) => `Must be at least ${min}`,
    MAX_VALUE: (max: number) => `Cannot exceed ${max}`,
    POSITIVE_NUMBER: 'Must be a positive number',
    DECIMAL_PLACES: (places: number) => `Cannot have more than ${places} decimal places`,
} as const;

/**
 * Field-specific validation messages
 */
export const FIELD_VALIDATION_MESSAGES = {
    title: {
        required: 'Project title is required',
        maxLength: 'Project title cannot exceed 255 characters',
    },
    description: {
        maxLength: 'Description cannot exceed 5000 characters',
    },
    contactEmail: {
        invalid: 'Please enter a valid email address',
        maxLength: 'Email cannot exceed 255 characters',
    },
    contactPhone: {
        maxLength: 'Phone number cannot exceed 50 characters',
    },
    estimatedValue: {
        invalid: 'Please enter a valid amount',
        positive: 'Amount must be positive',
        maxValue: 'Amount is too large',
    },
    dueDate: {
        invalid: 'Please enter a valid date',
        future: 'Due date must be in the future',
    },
} as const;