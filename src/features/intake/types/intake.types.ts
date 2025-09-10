import { z } from 'zod';

// Volume item schema - extracted from original component
export const volumeItemSchema = z.object({
    qty: z.number().positive('Quantity must be positive'),
    unit: z.enum(['pcs', 'units', 'kits']),
    freq: z.enum(['per year', 'per month', 'per quarter', 'prototype', 'initial', 'one_time'])
});

// Document item schema - enhanced for better file handling
export const documentItemSchema = z.object({
    type: z.string().min(1, 'Document type is required'),
    file: z.instanceof(File).optional(),
    link: z.string().optional(),
    uploaded: z.boolean().optional(),
    description: z.string().optional(), // Added for better UX
}).refine(data => {
    // Either file or link is required, but not both
    const hasFile = data.file && data.file instanceof File;
    const hasLink = data.link && data.link.trim().length > 0;
    return hasFile || hasLink;
}, {
    message: "Either a file upload or a link is required"
}).refine(data => {
    // If link is provided, it should be a valid URL
    if (data.link && data.link.trim().length > 0) {
        try {
            new URL(data.link);
            return true;
        } catch {
            return false;
        }
    }
    return true;
}, {
    message: "Link must be a valid URL"
});

// Comprehensive validation schema for intake form
export const intakeFormSchema = z.object({
    // Basic project information
    intakeType: z.enum(['inquiry', 'rfq', 'po', 'design_idea']),
    projectTitle: z.string().min(3, 'Project title must be at least 3 characters').max(100, 'Project title cannot exceed 100 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),

    // Volume and pricing information
    volumes: z.array(volumeItemSchema).optional(),
    targetPricePerUnit: z.number().positive('Target price must be positive').optional(),

    // Project metadata
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    desiredDeliveryDate: z.string().refine(date => new Date(date) > new Date(Date.now() + 604800000), 'Delivery date must be at least 7 days from now'),
    projectReference: z.string().optional(), // Only for PO

    // Customer information
    selectedCustomerId: z.string().optional(), // For existing customer selection
    customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
    company: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    country: z.string().optional(),
    website: z.string().optional(),

    // Contact information
    pointOfContacts: z.array(z.string()).optional(), // Array of contact IDs

    // Document requirements
    documents: z.array(documentItemSchema).min(2, 'At least two items required: Drawing and BOM'),

    // Additional information
    notes: z.string().optional(),
    agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms')
});

// Type inference from schemas
export type IntakeFormData = z.infer<typeof intakeFormSchema>;
export type VolumeItem = z.infer<typeof volumeItemSchema>;
export type DocumentItem = z.infer<typeof documentItemSchema>;

// Submission types - enhanced with better descriptions
export type IntakeSubmissionType = 'inquiry' | 'rfq' | 'po' | 'design_idea';

export const SUBMISSION_TYPE_CONFIG = {
    inquiry: { label: 'General Inquiry', description: 'Initial contact or information request' },
    rfq: { label: 'Request for Quote', description: 'Formal request for pricing and capabilities' },
    po: { label: 'Purchase Order', description: 'Existing purchase order processing' },
    design_idea: { label: 'Design Idea', description: 'Concept or design proposal' }
} as const;

// Form section states
export type FormSectionState = 'idle' | 'loading' | 'valid' | 'invalid' | 'completed';

// Document upload modes
export type DocumentUploadMode = 'none' | 'file' | 'link';

// Intake workflow states
export type IntakeWorkflowState = 'draft' | 'submitting' | 'processing' | 'completed' | 'error';

// Customer search and creation
export interface CustomerSearchResult {
    id: string;
    name: string;
    company: string;
    email: string;
    phone?: string;
    country?: string;
    website?: string;
}

export interface ContactSearchResult {
    id: string;
    name: string;
    email: string;
    phone?: string;
    position?: string;
}

// Project creation result
export interface IntakeSubmissionResult {
    success: boolean;
    projectId?: string;
    error?: string;
    warnings?: string[];
}

// Form validation result
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
}

// Document processing status
export interface DocumentProcessingStatus {
    index: number;
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
    progress?: number;
    error?: string;
}
