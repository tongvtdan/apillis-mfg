import { z } from 'zod';

// Customer status and types
export type CustomerStatus = 'active' | 'inactive' | 'prospect' | 'former' | 'blacklisted';
export type CustomerType = 'individual' | 'business' | 'government' | 'non_profit' | 'educational';
export type CustomerTier = 'platinum' | 'gold' | 'silver' | 'bronze';
export type IndustryType = 'manufacturing' | 'automotive' | 'aerospace' | 'electronics' | 'medical' | 'energy' | 'construction' | 'other';

// Contact relationship types
export type ContactRelationship = 'primary' | 'technical' | 'billing' | 'shipping' | 'decision_maker' | 'influencer';

// Customer core schema
export const customerSchema = z.object({
    id: z.string().optional(),
    organizationId: z.string(),

    // Basic information
    name: z.string().min(2, 'Customer name must be at least 2 characters'),
    displayName: z.string().optional(),
    customerType: z.enum(['individual', 'business', 'government', 'non_profit', 'educational']),
    status: z.enum(['active', 'inactive', 'prospect', 'former', 'blacklisted']),
    customerTier: z.enum(['platinum', 'gold', 'silver', 'bronze']).optional(),

    // Business information
    industry: z.string().optional(),
    companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
    annualRevenue: z.number().positive().optional(),
    employeeCount: z.number().positive().optional(),

    // Contact information
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    website: z.string().url().optional(),

    // Address information
    billingAddress: z.object({
        street: z.string().min(5, 'Street address is required'),
        city: z.string().min(2, 'City is required'),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().min(2, 'Country is required')
    }),

    shippingAddress: z.object({
        street: z.string().min(5, 'Street address is required'),
        city: z.string().min(2, 'City is required'),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().min(2, 'Country is required'),
        isSameAsBilling: z.boolean().default(false)
    }).optional(),

    // Financial information
    creditLimit: z.number().positive().optional(),
    paymentTerms: z.string().optional(),
    taxId: z.string().optional(),
    currency: z.string().default('USD'),

    // Classification and tags
    tags: z.array(z.string()),
    source: z.string().optional(),
    referralSource: z.string().optional(),

    // Metadata
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    createdBy: z.string().optional(),
    lastActivityAt: z.string().optional(),
    notes: z.string().optional()
});

// Contact schema
export const contactSchema = z.object({
    id: z.string().optional(),
    customerId: z.string(),
    organizationId: z.string(),

    // Personal information
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    title: z.string().optional(),
    department: z.string().optional(),

    // Contact information
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    mobile: z.string().optional(),

    // Relationship
    relationship: z.enum(['primary', 'technical', 'billing', 'shipping', 'decision_maker', 'influencer']),
    isPrimary: z.boolean().default(false),
    reportsTo: z.string().optional(),

    // Preferences
    preferredCommunication: z.enum(['email', 'phone', 'mail']).default('email'),
    timezone: z.string().optional(),

    // Status
    isActive: z.boolean().default(true),
    lastContactedAt: z.string().optional(),

    // Metadata
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    createdBy: z.string().optional(),
    notes: z.string().optional()
});

// Customer interaction/activity schema
export const customerInteractionSchema = z.object({
    id: z.string().optional(),
    customerId: z.string(),
    contactId: z.string().optional(),
    organizationId: z.string(),

    // Interaction details
    type: z.enum(['call', 'email', 'meeting', 'quote', 'order', 'complaint', 'feedback', 'other']),
    direction: z.enum(['inbound', 'outbound']).optional(),
    subject: z.string().min(1, 'Subject is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),

    // Outcome and follow-up
    outcome: z.string().optional(),
    nextFollowUp: z.string().optional(),
    followUpNotes: z.string().optional(),

    // Metadata
    createdAt: z.string().optional(),
    createdBy: z.string(),
    duration: z.number().optional(), // minutes for calls/meetings
    attachments: z.array(z.string()).optional()
});

// Customer performance metrics
export interface CustomerMetrics {
    customerId: string;
    period: string; // YYYY-MM

    // Order metrics
    totalOrders: number;
    totalOrderValue: number;
    averageOrderValue: number;

    // Project metrics
    activeProjects: number;
    completedProjects: number;
    onTimeDelivery: number; // percentage

    // Financial metrics
    totalRevenue: number;
    outstandingInvoices: number;
    paymentDelay: number; // average days

    // Satisfaction metrics
    satisfactionScore: number; // 1-5 scale
    complaintCount: number;
    repeatBusinessRate: number;

    // Activity metrics
    lastOrderDate: string;
    lastContactDate: string;
    interactionCount: number;
}

// Customer segmentation criteria
export interface CustomerSegment {
    id: string;
    name: string;
    criteria: {
        customerType?: CustomerType[];
        industry?: string[];
        customerTier?: CustomerTier[];
        annualRevenue?: { min?: number; max?: number };
        employeeCount?: { min?: number; max?: number };
        status?: CustomerStatus[];
        tags?: string[];
    };
    customerCount: number;
    totalRevenue: number;
    averageOrderValue: number;
    createdAt: string;
    updatedAt: string;
}

// Search and filtering
export interface CustomerSearchFilters {
    name?: string;
    customerType?: CustomerType[];
    status?: CustomerStatus[];
    industry?: string[];
    customerTier?: CustomerTier[];
    country?: string;
    state?: string;
    city?: string;
    tags?: string[];
    hasActiveProjects?: boolean;
    lastActivityBefore?: string;
    lastActivityAfter?: string;
    minRevenue?: number;
    maxRevenue?: number;
    createdAfter?: string;
    createdBefore?: string;
}

export interface CustomerSearchResult {
    customers: Customer[];
    totalCount: number;
    facets: {
        customerTypes: Record<CustomerType, number>;
        industries: Record<string, number>;
        statuses: Record<CustomerStatus, number>;
        tiers: Record<CustomerTier, number>;
        countries: Record<string, number>;
        tags: Record<string, number>;
    };
}

// Type inference
export type Customer = z.infer<typeof customerSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type CustomerInteraction = z.infer<typeof customerInteractionSchema>;

// Customer lifecycle stages
export type CustomerLifecycleStage = 'prospect' | 'lead' | 'customer' | 'champion' | 'former';

// Customer health score calculation
export interface CustomerHealthScore {
    customerId: string;
    overallScore: number; // 0-100
    components: {
        recency: number; // Recent activity
        frequency: number; // Interaction frequency
        monetary: number; // Revenue contribution
        engagement: number; // Engagement level
        satisfaction: number; // Satisfaction metrics
    };
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
}

// Configuration objects
export const CUSTOMER_TYPE_CONFIG = {
    individual: { label: 'Individual', icon: '👤', color: 'bg-blue-100 text-blue-800' },
    business: { label: 'Business', icon: '🏢', color: 'bg-green-100 text-green-800' },
    government: { label: 'Government', icon: '🏛️', color: 'bg-purple-100 text-purple-800' },
    non_profit: { label: 'Non-Profit', icon: '🤝', color: 'bg-orange-100 text-orange-800' },
    educational: { label: 'Educational', icon: '🎓', color: 'bg-red-100 text-red-800' }
} as const;

export const CUSTOMER_STATUS_CONFIG = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
    inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    prospect: { label: 'Prospect', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    former: { label: 'Former', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    blacklisted: { label: 'Blacklisted', color: 'bg-red-100 text-red-800 border-red-200' }
} as const;

export const CUSTOMER_TIER_CONFIG = {
    platinum: { label: 'Platinum', color: 'bg-purple-100 text-purple-800', multiplier: 1.5 },
    gold: { label: 'Gold', color: 'bg-yellow-100 text-yellow-800', multiplier: 1.25 },
    silver: { label: 'Silver', color: 'bg-gray-100 text-gray-800', multiplier: 1.1 },
    bronze: { label: 'Bronze', color: 'bg-orange-100 text-orange-800', multiplier: 1.0 }
} as const;

export const CONTACT_RELATIONSHIP_CONFIG = {
    primary: { label: 'Primary Contact', icon: '⭐', priority: 1 },
    decision_maker: { label: 'Decision Maker', icon: '👑', priority: 2 },
    technical: { label: 'Technical Contact', icon: '🔧', priority: 3 },
    billing: { label: 'Billing Contact', icon: '💰', priority: 4 },
    shipping: { label: 'Shipping Contact', icon: '📦', priority: 5 },
    influencer: { label: 'Influencer', icon: '🎯', priority: 6 }
} as const;
