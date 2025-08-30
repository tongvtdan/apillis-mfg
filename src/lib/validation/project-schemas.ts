import { z } from 'zod';

// Database constraint constants
export const PROJECT_CONSTRAINTS = {
    TITLE_MAX_LENGTH: 255,
    PROJECT_ID_MAX_LENGTH: 50,
    SOURCE_MAX_LENGTH: 50,
    PROJECT_TYPE_MAX_LENGTH: 100,
    ESTIMATED_VALUE_MAX_DIGITS: 15,
    ESTIMATED_VALUE_DECIMAL_PLACES: 2,
    CONTACT_NAME_MAX_LENGTH: 255,
    CONTACT_EMAIL_MAX_LENGTH: 255,
    CONTACT_PHONE_MAX_LENGTH: 50,
    COMPANY_NAME_MAX_LENGTH: 255,
} as const;

// Enum validation schemas matching database constraints
export const ProjectStatusSchema = z.enum(['active', 'on_hold', 'delayed', 'cancelled', 'completed'], {
    errorMap: () => ({ message: 'Please select a valid project status' })
});

export const ProjectPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a valid priority level' })
});

// File upload validation schema
export const FileUploadSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'File name is required'),
    size: z.number()
        .min(1, 'File cannot be empty')
        .max(50 * 1024 * 1024, 'File size cannot exceed 50MB'), // 50MB limit
    type: z.string().min(1, 'File type is required'),
});

// Supported file types for project uploads
export const SUPPORTED_FILE_TYPES = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

    // CAD files
    'application/acad', // DWG
    'application/dxf', // DXF
    'application/step', // STEP
    'application/x-step', // STEP
    'model/step', // STEP
    'application/iges', // IGES
    'model/iges', // IGES

    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',

    // Text files
    'text/plain',
    'text/csv',
] as const;

// Project intake form validation schema
export const ProjectIntakeFormSchema = z.object({
    // Company & Contact Information
    companyName: z.string()
        .min(1, 'Company name is required')
        .max(PROJECT_CONSTRAINTS.COMPANY_NAME_MAX_LENGTH, `Company name cannot exceed ${PROJECT_CONSTRAINTS.COMPANY_NAME_MAX_LENGTH} characters`)
        .trim(),

    contactName: z.string()
        .min(1, 'Contact name is required')
        .max(PROJECT_CONSTRAINTS.CONTACT_NAME_MAX_LENGTH, `Contact name cannot exceed ${PROJECT_CONSTRAINTS.CONTACT_NAME_MAX_LENGTH} characters`)
        .trim(),

    contactEmail: z.string()
        .email('Please enter a valid email address')
        .max(PROJECT_CONSTRAINTS.CONTACT_EMAIL_MAX_LENGTH, `Email cannot exceed ${PROJECT_CONSTRAINTS.CONTACT_EMAIL_MAX_LENGTH} characters`)
        .optional()
        .or(z.literal('')), // Allow empty string

    contactPhone: z.string()
        .max(PROJECT_CONSTRAINTS.CONTACT_PHONE_MAX_LENGTH, `Phone number cannot exceed ${PROJECT_CONSTRAINTS.CONTACT_PHONE_MAX_LENGTH} characters`)
        .optional()
        .or(z.literal('')), // Allow empty string

    // Project Details
    projectTitle: z.string()
        .min(1, 'Project title is required')
        .max(PROJECT_CONSTRAINTS.TITLE_MAX_LENGTH, `Project title cannot exceed ${PROJECT_CONSTRAINTS.TITLE_MAX_LENGTH} characters`)
        .trim(),

    description: z.string()
        .optional()
        .or(z.literal('')), // Allow empty string - not required in database

    priority: ProjectPrioritySchema.default('medium'),

    estimatedValue: z.string()
        .optional()
        .refine((val) => {
            if (!val || val === '') return true; // Optional field
            const num = parseFloat(val);
            return !isNaN(num) && num >= 0;
        }, 'Please enter a valid positive number')
        .refine((val) => {
            if (!val || val === '') return true;
            const num = parseFloat(val);
            // Check if it fits in DECIMAL(15,2)
            const maxValue = Math.pow(10, PROJECT_CONSTRAINTS.ESTIMATED_VALUE_MAX_DIGITS - PROJECT_CONSTRAINTS.ESTIMATED_VALUE_DECIMAL_PLACES) - 0.01;
            return num <= maxValue;
        }, `Estimated value cannot exceed ${Math.pow(10, PROJECT_CONSTRAINTS.ESTIMATED_VALUE_MAX_DIGITS - PROJECT_CONSTRAINTS.ESTIMATED_VALUE_DECIMAL_PLACES) - 0.01}`),

    dueDate: z.string()
        .optional()
        .refine((val) => {
            if (!val || val === '') return true; // Optional field
            const date = new Date(val);
            return !isNaN(date.getTime()) && date > new Date();
        }, 'Due date must be in the future'),

    // Additional Information
    notes: z.string().optional().or(z.literal('')), // Allow empty string
});

// Project edit form validation schema (for future EditProjectModal)
export const ProjectEditFormSchema = z.object({
    title: z.string()
        .min(1, 'Project title is required')
        .max(PROJECT_CONSTRAINTS.TITLE_MAX_LENGTH, `Project title cannot exceed ${PROJECT_CONSTRAINTS.TITLE_MAX_LENGTH} characters`)
        .trim(),

    description: z.string().optional().or(z.literal('')),

    status: ProjectStatusSchema,

    priority_level: ProjectPrioritySchema,

    estimated_value: z.number()
        .positive('Estimated value must be positive')
        .max(
            Math.pow(10, PROJECT_CONSTRAINTS.ESTIMATED_VALUE_MAX_DIGITS - PROJECT_CONSTRAINTS.ESTIMATED_VALUE_DECIMAL_PLACES) - 0.01,
            'Estimated value exceeds maximum allowed'
        )
        .optional(),

    project_type: z.string()
        .max(PROJECT_CONSTRAINTS.PROJECT_TYPE_MAX_LENGTH, `Project type cannot exceed ${PROJECT_CONSTRAINTS.PROJECT_TYPE_MAX_LENGTH} characters`)
        .optional()
        .or(z.literal('')),

    notes: z.string().optional().or(z.literal('')),

    tags: z.array(z.string()).optional(),
});

// File upload validation with type checking
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        return { isValid: false, error: 'File size cannot exceed 50MB' };
    }

    // Check if file is empty
    if (file.size === 0) {
        return { isValid: false, error: 'File cannot be empty' };
    }

    // Check file type
    const isValidType = SUPPORTED_FILE_TYPES.includes(file.type as any) ||
        // Additional check for file extensions since MIME types can be inconsistent
        /\.(pdf|doc|docx|xls|xlsx|dwg|dxf|step|stp|iges|igs|jpg|jpeg|png|gif|bmp|tiff|txt|csv)$/i.test(file.name);

    if (!isValidType) {
        return {
            isValid: false,
            error: 'Unsupported file type. Please upload PDF, CAD files (DWG, DXF, STEP), images, or office documents.'
        };
    }

    return { isValid: true };
};

// Validation for multiple file uploads
export const validateFileUploads = (files: File[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if at least one file is uploaded
    if (files.length === 0) {
        errors.push('At least one file must be uploaded');
    }

    // Check maximum number of files (reasonable limit)
    if (files.length > 20) {
        errors.push('Cannot upload more than 20 files at once');
    }

    // Validate each file
    files.forEach((file, index) => {
        const validation = validateFileUpload(file);
        if (!validation.isValid) {
            errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
        }
    });

    // Check total size (100MB limit for all files combined)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 100 * 1024 * 1024) {
        errors.push('Total file size cannot exceed 100MB');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Type exports for form data
export type ProjectIntakeFormData = z.infer<typeof ProjectIntakeFormSchema>;
export type ProjectEditFormData = z.infer<typeof ProjectEditFormSchema>;
export type FileUploadData = z.infer<typeof FileUploadSchema>;