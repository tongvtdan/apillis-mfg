// Factory Pulse Enhancement: Supplier and Quote Management Types
// Following existing project patterns and database schema

export type SupplierQuoteStatus = 
  | 'sent'          // RFQ sent to supplier
  | 'received'      // Quote received from supplier  
  | 'rejected'      // Quote rejected by supplier
  | 'accepted'      // Quote accepted by us
  | 'expired'       // Quote deadline passed
  | 'cancelled';    // RFQ cancelled

export type QuoteComparisonStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export type SupplierSpecialty = 
  | 'machining'
  | 'fabrication' 
  | 'casting'
  | 'finishing'
  | 'injection_molding'
  | 'assembly'
  | '3d_printing'
  | 'prototyping'
  | 'coating'
  | 'painting'
  | 'welding'
  | 'sheet_metal'
  | 'electronics'
  | 'testing'
  | 'packaging';

export type BottleneckSeverity = 'normal' | 'warning' | 'critical';

export type EvaluationCriteriaType = 'price' | 'quality' | 'delivery' | 'service';

// Core Supplier Interface
export interface Supplier {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  specialties: SupplierSpecialty[];
  rating: number; // 0.0-5.0
  response_rate: number; // 0.0-100.0 percentage
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Enhanced tracking fields
  last_contact_date?: string;
  total_quotes_sent: number;
  total_quotes_received: number;
  average_turnaround_days: number;
  notes?: string;
  tags: string[];
}

// Supplier Quote Interface
export interface SupplierQuote {
  id: string;
  project_id: string;
  supplier_id: string;
  supplier?: Supplier; // Populated via join
  project?: import('./project').Project; // Populated via join
  
  // Quote details
  quote_amount?: number;
  lead_time_days?: number;
  quote_valid_until?: string; // Date string
  currency: string; // Default 'USD'
  
  // Status tracking
  status: SupplierQuoteStatus;
  rfq_sent_at: string;
  quote_received_at?: string;
  quote_deadline?: string;
  
  // Communication
  rfq_message?: string;
  quote_notes?: string;
  internal_notes?: string;
  
  // Attachments
  attachments: QuoteAttachment[];
  rfq_document_url?: string;
  quote_document_url?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Performance tracking
  response_time_hours?: number;
  is_competitive?: boolean;
  quality_score?: number; // 0.0-5.0
  
  // Additional quote details
  unit_price?: number;
  minimum_quantity?: number;
  payment_terms?: string;
  delivery_terms?: string;
  warranty_terms?: string;
}

// Quote Attachment Interface
export interface QuoteAttachment {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  file_url: string;
  storage_path: string;
  uploaded_at: string;
  uploaded_by?: string;
}

// Quote Comparison Interface  
export interface QuoteComparison {
  id: string;
  project_id: string;
  selected_quote_id?: string;
  selected_quote?: SupplierQuote;
  
  // Comparison metadata
  comparison_date: string;
  comparison_criteria: Record<string, any>; // JSONB
  evaluation_notes?: string;
  decision_rationale?: string;
  
  // Scores (JSONB stored as objects)
  quote_scores: Record<string, Record<string, number>>; // { quote_id: { criteria: score } }
  total_scores: Record<string, number>; // { quote_id: total_score }
  
  // Decision makers
  evaluated_by?: string;
  approved_by?: string;
  
  // Status
  status: QuoteComparisonStatus;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Quote Evaluation Criteria
export interface QuoteEvaluationCriteria {
  id: string;
  name: string;
  weight: number; // 0.0-1.0
  criteria_type: EvaluationCriteriaType;
  description?: string;
  is_active: boolean;
  created_at: string;
}

// Supplier Performance Metrics
export interface SupplierPerformanceMetrics {
  id: string;
  supplier_id: string;
  period_start: string;
  period_end: string;
  quotes_sent: number;
  quotes_received: number;
  response_rate: number; // 0.0-100.0
  average_turnaround_hours: number;
  quotes_accepted: number;
  win_rate: number; // 0.0-100.0
  on_time_delivery_rate: number; // 0.0-100.0
  created_at: string;
}

// Quote Status History
export interface SupplierQuoteStatusHistory {
  id: string;
  supplier_quote_id: string;
  old_status?: SupplierQuoteStatus;
  new_status: SupplierQuoteStatus;
  changed_by?: string;
  changed_at: string;
  reason?: string;
  notes?: string;
}

// Quote Readiness Indicator (from database function)
export interface QuoteReadinessIndicator {
  totalSuppliers: number;     // 5 suppliers contacted
  receivedQuotes: number;     // 3 quotes received  
  pendingQuotes: number;      // 2 pending
  overdueQuotes: number;      // 0 overdue
  readinessPercentage: number; // 60.0
  statusText: string;         // "3/5 quotes in – 2 pending"
  colorCode: 'green' | 'yellow' | 'orange' | 'red' | 'gray';
}

// Enhanced Project Card Features (extends existing Project interface)
export interface EnhancedProjectCard {
  // All existing Project fields
  id: string;
  project_id: string;        // P-25082001 format
  title: string;
  priority: import('./project').ProjectPriority;
  days_in_stage: number;
  customer?: import('./project').Customer;
  assignee_id?: string;
  estimated_value?: number;
  
  // New enhanced features
  quote_readiness_score?: QuoteReadinessIndicator;
  bottleneck_warning?: boolean;     // Show 🔥 icon if stuck
  risk_count?: number;              // Show ⚠️ 2 risks logged
  approval_status?: {
    engineering?: 'approved' | 'pending' | 'rejected';
    qa?: 'approved' | 'pending' | 'rejected';
    production?: 'approved' | 'pending' | 'rejected';
  };
  file_count?: number;              // Show 📁 4 files
  supplier_quotes?: SupplierQuote[]; // Associated quotes
}

// Bottleneck Alert System
export interface BottleneckAlert {
  type: '🔥 Bottlenecks Detected';
  project_id: string;
  project_title: string;
  current_stage: string;
  hours_in_stage: number;
  sla_hours: number;
  severity: BottleneckSeverity;
  issues: string[];               // ['Supplier RFQ phase exceeds SLA', '3 RFQs delayed due to missing drawings']
  recommended_actions: string[];
  affected_projects?: string[];
}

// Project Workflow Analytics
export interface ProjectWorkflowAnalytics {
  id: string;
  project_id: string;
  stage_name: string;
  stage_entered_at: string;
  stage_exited_at?: string;
  time_in_stage_hours?: number;
  is_bottleneck: boolean;
  bottleneck_reason?: string;
  sla_target_hours?: number;
  sla_exceeded: boolean;
  assignee_id?: string;
  reviewer_id?: string;
  stage_notes?: string;
  created_at: string;
}

// Bottleneck Detection Configuration
export interface BottleneckDetectionConfig {
  id: string;
  stage_name: string;
  sla_hours: number;
  warning_threshold_hours: number;
  critical_threshold_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Analytics Metrics (from database functions)
export interface AnalyticsMetrics {
  // Core KPIs from wireframe specifications
  supplier_response_rate: number;     // Target: 90%
  average_cycle_time: number;         // 6.8 days
  win_rate: number;                   // 48%
  on_time_delivery_rate: number;     // 92%
  
  // Enhanced metrics
  rfq_conversion_rate: number;        // RFQ to won projects
  bottleneck_stages: BottleneckAlert[];
  cost_savings: number;
  intake_portal_metrics: IntakePortalStats;
  
  // Lead time breakdown by phase
  lead_time_by_phase: {
    inquiry: number;              // 1.2 days
    review: number;               // 2.1 days
    supplier_rfq: number;         // 2.8 days (exceeds SLA)
    quoted: number;               // 0.7 days
    order: number;                // 0.0 days
  };
  
  // Metadata
  generated_at: string;
  period_days: number;
}

// Intake Portal Statistics
export interface IntakePortalStats {
  total_submissions: number;
  submissions_this_week: number;
  average_processing_time: number;
  completion_rate: number;
  top_submission_sources: Array<{
    source: string;
    count: number;
  }>;
}

// Supplier Analytics View (from database view)
export interface SupplierAnalytics {
  supplier_id: string;
  supplier_name: string;
  supplier_company?: string;
  total_quotes: number;
  quotes_received: number;
  quotes_accepted: number;
  quotes_expired: number;
  response_rate_percent: number;
  win_rate_percent: number;
  avg_response_time_hours: number;
  first_quote_date: string;
  last_activity_date: string;
}

// API Request/Response Types
export interface CreateSupplierRequest {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  specialties: SupplierSpecialty[];
  notes?: string;
  tags?: string[];
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  is_active?: boolean;
  rating?: number;
}

export interface CreateSupplierQuoteRequest {
  project_id: string;
  supplier_id: string;
  quote_deadline?: string;
  rfq_message?: string;
  currency?: string;
}

export interface UpdateSupplierQuoteRequest {
  quote_amount?: number;
  lead_time_days?: number;
  quote_valid_until?: string;
  quote_notes?: string;
  internal_notes?: string;
  quality_score?: number;
  unit_price?: number;
  minimum_quantity?: number;
  payment_terms?: string;
  delivery_terms?: string;
  warranty_terms?: string;
}

export interface SendRFQRequest {
  project_id: string;
  supplier_ids: string[];
  quote_deadline?: string;
  rfq_message?: string;
}

export interface AcceptQuoteRequest {
  quote_id: string;
  decision_rationale?: string;
  internal_notes?: string;
}

export interface SupplierSearchCriteria {
  name?: string;
  specialties?: SupplierSpecialty[];
  country?: string;
  min_rating?: number;
  is_active?: boolean;
  tags?: string[];
}

// Status Badge Configuration
export const SUPPLIER_QUOTE_STATUS_COLORS: Record<SupplierQuoteStatus, string> = {
  sent: 'bg-blue-100 text-blue-800 border-blue-200',
  received: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  accepted: 'bg-purple-100 text-purple-800 border-purple-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-orange-100 text-orange-800 border-orange-200'
};

export const SUPPLIER_QUOTE_STATUS_LABELS: Record<SupplierQuoteStatus, string> = {
  sent: 'RFQ Sent',
  received: 'Quote Received',
  rejected: 'Rejected',
  accepted: 'Accepted',
  expired: 'Expired',
  cancelled: 'Cancelled'
};

export const BOTTLENECK_SEVERITY_COLORS: Record<BottleneckSeverity, string> = {
  normal: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

export const SPECIALTY_LABELS: Record<SupplierSpecialty, string> = {
  machining: 'CNC Machining',
  fabrication: 'Metal Fabrication',
  casting: 'Casting & Molding',
  finishing: 'Surface Finishing',
  injection_molding: 'Injection Molding',
  assembly: 'Assembly Services',
  '3d_printing': '3D Printing',
  prototyping: 'Rapid Prototyping',
  coating: 'Coating Services',
  painting: 'Painting & Powder Coating',
  welding: 'Welding Services',
  sheet_metal: 'Sheet Metal Work',
  electronics: 'Electronics Assembly',
  testing: 'Testing & Validation',
  packaging: 'Packaging Services'
};

// Quote Readiness Color Codes
export const QUOTE_READINESS_COLORS = {
  green: 'bg-green-100 text-green-800 border-green-200', // Ready (80%+)
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200', // Waiting (50-79%)
  orange: 'bg-orange-100 text-orange-800 border-orange-200', // Pending (<50%)
  red: 'bg-red-100 text-red-800 border-red-200', // Overdue
  gray: 'bg-gray-100 text-gray-800 border-gray-200' // No RFQs sent
} as const;

// Enhanced Priority Color System (extends existing)
export const ENHANCED_PRIORITY_COLORS = {
  urgent: {
    light: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
    dark: { bg: '#7f1d1d', text: '#fca5a5', glow: true }
  },
  high: {
    light: { bg: '#fef3c7', text: '#d97706', border: '#fbbf24' },
    dark: { bg: '#78350f', text: '#fbbf24', glow: true }
  },
  medium: {
    light: { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' },
    dark: { bg: '#1e3a8a', text: '#93c5fd', glow: false }
  },
  low: {
    light: { bg: '#dcfce7', text: '#16a34a', border: '#86efac' },
    dark: { bg: '#14532d', text: '#86efac', glow: false }
  }
} as const;

// Default evaluation criteria weights
export const DEFAULT_EVALUATION_CRITERIA = [
  { name: 'Price Competitiveness', weight: 0.40, criteria_type: 'price' as EvaluationCriteriaType },
  { name: 'Quality Rating', weight: 0.25, criteria_type: 'quality' as EvaluationCriteriaType },
  { name: 'Delivery Time', weight: 0.20, criteria_type: 'delivery' as EvaluationCriteriaType },
  { name: 'Service Level', weight: 0.15, criteria_type: 'service' as EvaluationCriteriaType }
] as const;