import { z } from 'zod';
import { Control, FieldArrayWithId, UseFormReturn } from 'react-hook-form';
import { Organization, Contact } from '@/types/project';

// Volume item schema
export const volumeItemSchema = z.object({
    qty: z.number().positive('Quantity must be positive'),
    unit: z.enum(['pcs', 'units', 'kits']),
    freq: z.enum(['per year', 'per month', 'per quarter', 'prototype', 'initial', 'one_time'])
});

// Document item schema
export const documentItemSchema = z.object({
    type: z.string().min(1, 'Document type is required'),
    file: z.instanceof(File).optional(),
    link: z.string().optional(),
    uploaded: z.boolean().optional()
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

// Comprehensive validation schema
export const inquiryFormSchema = z.object({
    intakeType: z.enum(['inquiry', 'rfq', 'po', 'design_idea']),
    projectTitle: z.string().min(3, 'Project title must be at least 3 characters').max(100, 'Project title cannot exceed 100 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    volumes: z.array(volumeItemSchema).optional(),
    targetPricePerUnit: z.number().positive('Target price must be positive').optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    desiredDeliveryDate: z.string().refine(date => new Date(date) > new Date(Date.now() + 604800000), 'Delivery date must be at least 7 days from now'),
    projectReference: z.string().optional(), // Only for PO
    selectedCustomerId: z.string().optional(), // For customer selection
    customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
    company: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    country: z.string().optional(),
    website: z.string().optional(),
    pointOfContacts: z.array(z.string()).optional(), // Array of contact IDs
    documents: z.array(documentItemSchema).min(2, 'At least two items required: Drawing and BOM'),
    notes: z.string().optional(),
    agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms')
});

export type InquiryFormData = z.infer<typeof inquiryFormSchema>;
export type VolumeItem = z.infer<typeof volumeItemSchema>;
export type DocumentItem = z.infer<typeof documentItemSchema>;

// Shared props for all section components
export interface BaseSectionProps {
    form: UseFormReturn<InquiryFormData>;
    collapsed: boolean;
    onToggle: () => void;
}

// Contact Info Section Props
export interface ContactInfoSectionProps extends BaseSectionProps {
    organizations: Organization[] | undefined;
    organizationsLoading: boolean;
    customerSearchOpen: boolean;
    setCustomerSearchOpen: (open: boolean) => void;
    customerSearchQuery: string;
    setCustomerSearchQuery: (query: string) => void;
    filteredOrganizations: Organization[];
    handleOrganizationSelect: (organization: Organization) => void;
    organizationContacts: Contact[];
    loadingContacts: boolean;
    selectedContacts: string[];
    pointOfContactsOpen: boolean;
    setPointOfContactsOpen: (open: boolean) => void;
    handlePointOfContactToggle: (contactId: string) => void;
    onCreateCustomer: () => void;
    onCreateContact: () => void;
}

// Project Details Section Props
export interface ProjectDetailsSectionProps extends BaseSectionProps {
    submissionType: 'RFQ' | 'Purchase Order' | 'Project Idea';
    tempProjectId: string;
    isGeneratingId: boolean;
    volumeFields: FieldArrayWithId<InquiryFormData, 'volumes', 'id'>[];
    appendVolume: (value: VolumeItem) => void;
    removeVolume: (index: number) => void;
}

// File Attachments Section Props
export interface FileAttachmentsSectionProps extends BaseSectionProps {
    documentFields: FieldArrayWithId<InquiryFormData, 'documents', 'id'>[];
    appendDocument: (value: DocumentItem) => void;
    removeDocument: (index: number) => void;
    documentModes: Record<number, 'none' | 'file' | 'link'>;
    setDocumentModes: React.Dispatch<React.SetStateAction<Record<number, 'none' | 'file' | 'link'>>>;
}

// Additional Notes Section Props
export interface AdditionalNotesSectionProps extends BaseSectionProps { }

// Terms Agreement Section Props
export interface TermsAgreementSectionProps extends BaseSectionProps { }
