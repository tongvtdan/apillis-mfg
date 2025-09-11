import { z } from 'zod';

// Core review types - extracted and enhanced
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';
export type RiskSeverity = 'low' | 'medium' | 'high';
export type RiskCategory = 'technical' | 'timeline' | 'cost' | 'quality' | 'supply_chain' | 'regulatory';
export type EngineeringDepartment = 'Design' | 'Manufacturing' | 'Quality' | 'Materials';

// Engineering review schema
export const engineeringReviewSchema = z.object({
    // Basic review information
    status: z.enum(['approved', 'rejected', 'revision_requested']),
    department: z.enum(['Design', 'Manufacturing', 'Quality', 'Materials']),

    // Technical assessment
    technical_feasibility: z.enum(['excellent', 'good', 'acceptable', 'concerning', 'not_feasible']),
    complexity_level: z.enum(['low', 'medium', 'high', 'very_high']),
    estimated_effort_hours: z.number().positive().optional(),

    // Feedback and recommendations
    feedback: z.string().min(10, 'Feedback must be at least 10 characters'),
    technical_notes: z.string().optional(),
    recommendations: z.array(z.string().min(1, 'Recommendation cannot be empty')),

    // Risk assessment
    risks: z.array(z.object({
        description: z.string().min(10, 'Risk description must be at least 10 characters'),
        category: z.enum(['technical', 'timeline', 'cost', 'quality', 'supply_chain', 'regulatory']),
        severity: z.enum(['low', 'medium', 'high']),
        mitigation_plan: z.string().min(5, 'Mitigation plan is required'),
        probability: z.enum(['low', 'medium', 'high']).optional()
    })),

    // Design considerations
    design_changes_required: z.boolean(),
    design_change_details: z.string().optional(),

    // Manufacturing considerations
    manufacturing_notes: z.string().optional(),
    special_processes_required: z.array(z.string()).optional(),

    // Timeline assessment
    estimated_completion_weeks: z.number().positive().optional(),

    // Additional metadata
    confidence_level: z.enum(['high', 'medium', 'low']),
    requires_follow_up: z.boolean(),
    follow_up_notes: z.string().optional()
});

// Enhanced risk schema
export const engineeringRiskSchema = z.object({
    id: z.string().optional(),
    project_id: z.string(),
    review_id: z.string().optional(),
    description: z.string().min(10),
    category: z.enum(['technical', 'timeline', 'cost', 'quality', 'supply_chain', 'regulatory']),
    severity: z.enum(['low', 'medium', 'high']),
    probability: z.enum(['low', 'medium', 'high']).optional(),
    mitigation_plan: z.string().min(5),
    impact_assessment: z.string().optional(),
    created_at: z.string().optional(),
    created_by: z.string().optional(),
    updated_at: z.string().optional()
});

// Technical specification schema
export const technicalSpecSchema = z.object({
    category: z.string().min(1),
    specification: z.string().min(1),
    tolerance: z.string().optional(),
    critical: z.boolean(),
    notes: z.string().optional()
});

// Type inference
export type EngineeringReviewData = z.infer<typeof engineeringReviewSchema>;
export type EngineeringRisk = z.infer<typeof engineeringRiskSchema>;
export type TechnicalSpec = z.infer<typeof technicalSpecSchema>;

// Review workflow states
export type ReviewWorkflowState = 'draft' | 'in_review' | 'approved' | 'rejected' | 'revision_requested';

// Review submission result
export interface ReviewSubmissionResult {
    success: boolean;
    reviewId?: string;
    error?: string;
    warnings?: string[];
}

// Department configuration
export const DEPARTMENT_CONFIG = {
    Design: {
        label: 'Design Engineering',
        focus: 'Technical design and specifications',
        icon: '🔧'
    },
    Manufacturing: {
        label: 'Manufacturing Engineering',
        focus: 'Production processes and methods',
        icon: '⚙️'
    },
    Quality: {
        label: 'Quality Engineering',
        focus: 'Quality requirements and testing',
        icon: '✅'
    },
    Materials: {
        label: 'Materials Engineering',
        focus: 'Material selection and properties',
        icon: '🧪'
    }
} as const;

// Status configuration
export const STATUS_CONFIG = {
    pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
    revision_requested: { label: 'Revision Requested', color: 'bg-orange-100 text-orange-800 border-orange-200' }
} as const;

// Risk severity configuration
export const RISK_SEVERITY_CONFIG = {
    low: { label: 'Low Risk', color: 'bg-green-100 text-green-800 border-green-200', score: 1 },
    medium: { label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', score: 2 },
    high: { label: 'High Risk', color: 'bg-red-100 text-red-800 border-red-200', score: 3 }
} as const;

// Risk category configuration
export const RISK_CATEGORY_CONFIG = {
    technical: { label: 'Technical', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    timeline: { label: 'Timeline', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    cost: { label: 'Cost', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    quality: { label: 'Quality', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    supply_chain: { label: 'Supply Chain', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    regulatory: { label: 'Regulatory', color: 'bg-red-100 text-red-800 border-red-200' }
} as const;

// Technical feasibility ratings
export const TECHNICAL_FEASIBILITY_RATINGS = {
    excellent: { label: 'Excellent', score: 5, color: 'text-green-600' },
    good: { label: 'Good', score: 4, color: 'text-blue-600' },
    acceptable: { label: 'Acceptable', score: 3, color: 'text-yellow-600' },
    concerning: { label: 'Concerning', score: 2, color: 'text-orange-600' },
    not_feasible: { label: 'Not Feasible', score: 1, color: 'text-red-600' }
} as const;

// Complexity levels
export const COMPLEXITY_LEVELS = {
    low: { label: 'Low Complexity', description: 'Standard processes, minimal customization' },
    medium: { label: 'Medium Complexity', description: 'Some customization, standard challenges' },
    high: { label: 'High Complexity', description: 'Significant customization, technical challenges' },
    very_high: { label: 'Very High Complexity', description: 'Novel technology, high technical risk' }
} as const;
