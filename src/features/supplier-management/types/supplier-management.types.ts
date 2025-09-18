import { z } from 'zod';

// Supplier status and types
export type SupplierStatus = 'active' | 'inactive' | 'pending_approval' | 'suspended' | 'blacklisted';
export type SupplierType = 'manufacturer' | 'distributor' | 'service_provider' | 'raw_material' | 'component';
export type QualificationStatus = 'not_qualified' | 'in_review' | 'qualified' | 'expired' | 'rejected';

// Supplier contact and location
export interface SupplierContact {
    id: string;
    name: string;
    title: string;
    email: string;
    phone: string;
    isPrimary: boolean;
    department?: string;
}

export interface SupplierLocation {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isPrimary: boolean;
    phone?: string;
    email?: string;
}

// Core supplier information
export const supplierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Supplier name must be at least 2 characters'),
    companyName: z.string().optional(),
    primaryContactName: z.string().optional(),
    description: z.string().optional(),

    // Basic information
    supplierType: z.enum(['manufacturer', 'distributor', 'service_provider', 'raw_material', 'component']),
    status: z.enum(['active', 'inactive', 'pending_approval', 'suspended', 'blacklisted']),
    qualificationStatus: z.enum(['not_qualified', 'in_review', 'qualified', 'expired', 'rejected']),

    // Contact information
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    website: z.string().url().optional(),

    // Address information
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().optional(),
    country: z.string().min(2, 'Country must be at least 2 characters'),
    postalCode: z.string().optional(),

    // Business information
    taxId: z.string().optional(),
    registrationNumber: z.string().optional(),
    industry: z.string().optional(),

    // Capabilities and certifications
    capabilities: z.array(z.string()),
    certifications: z.array(z.string()),
    qualityStandards: z.array(z.string()),

    // Financial information
    paymentTerms: z.string().optional(),
    currency: z.string().default('USD'),

    // Performance metrics
    onTimeDelivery: z.number().min(0).max(100).optional(),
    qualityRating: z.number().min(0).max(5).optional(),
    responsiveness: z.number().min(0).max(5).optional(),

    // Metadata
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    createdBy: z.string().optional(),
    approvedBy: z.string().optional(),
    approvedAt: z.string().optional(),
    notes: z.string().optional(),

    // Additional contacts and locations
    contacts: z.array(z.object({
        name: z.string(),
        title: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        isPrimary: z.boolean().default(false)
    })).optional(),

    locations: z.array(z.object({
        name: z.string(),
        address: z.string(),
        city: z.string(),
        country: z.string(),
        isPrimary: z.boolean().default(false)
    })).optional()
});

// RFQ (Request for Quote) related types
export interface RFQItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    specifications: string[];
    deliveryDate?: string;
    targetPrice?: number;
}

export const rfqSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, 'RFQ title must be at least 3 characters'),
    description: z.string().optional(),
    projectId: z.string(),
    items: z.array(z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unit: z.string(),
        specifications: z.array(z.string()),
        deliveryDate: z.string().optional(),
        targetPrice: z.number().positive().optional()
    })),
    suppliers: z.array(z.string()).min(1, 'At least one supplier must be selected'),
    status: z.enum(['draft', 'sent', 'in_review', 'completed', 'cancelled']),
    dueDate: z.string(),
    budget: z.number().positive().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']),
    requirements: z.array(z.string()),
    attachments: z.array(z.string()).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    createdBy: z.string(),
    sentAt: z.string().optional(),
    completedAt: z.string().optional()
});

// Supplier response to RFQ
export const supplierResponseSchema = z.object({
    id: z.string().optional(),
    rfqId: z.string(),
    supplierId: z.string(),
    status: z.enum(['pending', 'submitted', 'accepted', 'declined', 'no_quote']),

    // Response details
    items: z.array(z.object({
        rfqItemId: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        totalPrice: z.number(),
        leadTime: z.number().positive(), // days
        notes: z.string().optional(),
        alternativeOffered: z.boolean().default(false),
        alternativeDescription: z.string().optional()
    })),

    // Overall response
    totalValue: z.number(),
    validityPeriod: z.number().positive(), // days
    paymentTerms: z.string().optional(),
    deliveryTerms: z.string().optional(),
    warranty: z.string().optional(),

    // Supplier comments
    comments: z.string().optional(),
    exceptions: z.array(z.string()),

    // Metadata
    submittedAt: z.string().optional(),
    reviewedAt: z.string().optional(),
    reviewedBy: z.string().optional()
});

// Supplier performance tracking
export interface SupplierPerformance {
    supplierId: string;
    period: string; // YYYY-MM
    metrics: {
        totalOrders: number;
        onTimeDeliveries: number;
        qualityIncidents: number;
        averageLeadTime: number;
        averageCostVariance: number;
        responsivenessRating: number;
    };
    score: number; // Overall performance score 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// Search and filtering
export interface SupplierSearchFilters {
    name?: string;
    supplierType?: SupplierType[];
    status?: SupplierStatus[];
    qualificationStatus?: QualificationStatus[];
    country?: string[];
    capabilities?: string[];
    certifications?: string[];
    minRating?: number;
    maxRating?: number;
    hasCreditLimit?: boolean;
}

export interface SupplierSearchResult {
    suppliers: Supplier[];
    totalCount: number;
    facets: {
        supplierTypes: Record<SupplierType, number>;
        countries: Record<string, number>;
        capabilities: Record<string, number>;
        certifications: Record<string, number>;
        statuses: Record<SupplierStatus, number>;
    };
}

// Type inference
export type Supplier = z.infer<typeof supplierSchema>;
export type RFQ = z.infer<typeof rfqSchema>;
export type SupplierResponse = z.infer<typeof supplierResponseSchema>;

// RFQ workflow states
export type RFQWorkflowState = 'draft' | 'supplier_selection' | 'sent' | 'responses_received' | 'evaluation' | 'awarded' | 'completed';

// Supplier qualification criteria
export const QUALIFICATION_CRITERIA = {
    financial: {
        name: 'Financial Stability',
        weight: 25,
        criteria: [
            'Financial statements review',
            'Credit rating check',
            'Payment history',
            'Insurance coverage'
        ]
    },
    technical: {
        name: 'Technical Capability',
        weight: 30,
        criteria: [
            'Quality management system',
            'Technical certifications',
            'Equipment capabilities',
            'R&D capabilities'
        ]
    },
    operational: {
        name: 'Operational Excellence',
        weight: 25,
        criteria: [
            'On-time delivery record',
            'Quality performance',
            'Communication effectiveness',
            'Problem resolution'
        ]
    },
    compliance: {
        name: 'Compliance & Ethics',
        weight: 20,
        criteria: [
            'Regulatory compliance',
            'Ethical business practices',
            'Environmental standards',
            'Labor practices'
        ]
    }
} as const;

// Supplier status configuration
export const SUPPLIER_STATUS_CONFIG = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
    inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    suspended: { label: 'Suspended', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    blacklisted: { label: 'Blacklisted', color: 'bg-red-100 text-red-800 border-red-200' }
} as const;

// Supplier type configuration
export const SUPPLIER_TYPE_CONFIG = {
    manufacturer: { label: 'Manufacturer', icon: '🏭', color: 'bg-blue-100 text-blue-800' },
    distributor: { label: 'Distributor', icon: '📦', color: 'bg-purple-100 text-purple-800' },
    service_provider: { label: 'Service Provider', icon: '🔧', color: 'bg-green-100 text-green-800' },
    raw_material: { label: 'Raw Material', icon: '⚗️', color: 'bg-orange-100 text-orange-800' },
    component: { label: 'Component', icon: '⚙️', color: 'bg-red-100 text-red-800' }
} as const;

// Qualification status configuration
export const QUALIFICATION_STATUS_CONFIG = {
    not_qualified: { label: 'Not Qualified', color: 'bg-gray-100 text-gray-800' },
    in_review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
    qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800' },
    expired: { label: 'Expired', color: 'bg-orange-100 text-orange-800' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
} as const;

// RFQ status configuration
export const RFQ_STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
    in_review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
} as const;
