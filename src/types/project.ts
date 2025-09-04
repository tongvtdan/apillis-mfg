// Legacy ProjectStage enum - kept for backward compatibility
export type ProjectStage = 'inquiry_received' | 'technical_review' | 'supplier_rfq_sent' | 'quoted' | 'order_confirmed' | 'procurement_planning' | 'in_production' | 'shipped_closed';

// Dynamic stage type based on database workflow_stages
export type WorkflowStageId = string; // UUID from workflow_stages table
export type ProjectStatus = 'active' | 'on_hold' | 'cancelled' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectType = 'system_build' | 'fabrication' | 'manufacturing';
export type ProjectSource = 'manual' | 'portal' | 'email' | 'api' | 'import' | 'migration';
export type IntakeType = 'rfq' | 'purchase_order' | 'project_idea' | 'direct_request';
export type IntakeSource = 'portal' | 'email' | 'api' | 'phone' | 'walk_in';

// Volume data interface for multi-tier volumes
export interface VolumeData {
  quantity: number;
  unit: 'pcs' | 'units' | 'kits';
  frequency: 'per year' | 'per month' | 'per quarter' | 'prototype' | 'initial';
}

// Customer interface removed - customers are stored in contacts table with type='customer'
// Use Contact interface with type='customer' instead
export type Customer = Contact & { type: 'customer' };

export interface Contact {
  // Core database fields - must match database schema exactly
  id: string;
  organization_id: string;
  type: 'customer' | 'supplier' | 'partner' | 'internal'; // Updated to match database enum
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  is_active?: boolean; // Optional in database (has default)
  notes?: string;
  created_at?: string; // Optional in database (has default)
  updated_at?: string;

  // AI and metadata fields from database schema
  metadata?: Record<string, any>;
  ai_category?: Record<string, any>;
  ai_capabilities?: string[]; // Updated to match database type
  ai_risk_score?: number;
  ai_last_analyzed?: string;
  created_by?: string;
}

export interface WorkflowStage {
  // Core database fields - must match database schema exactly
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  stage_order: number;
  is_active?: boolean;
  exit_criteria?: string;
  responsible_roles?: string[]; // Array of user roles
  estimated_duration_days?: number; // Optional in database (has default)
  created_at?: string; // Optional in database (has default)
  updated_at?: string;

  // Computed fields for compatibility
  order_index?: number; // Computed from stage_order for backward compatibility

  // New fields for sub-stages support
  sub_stages_count?: number;
  sub_stages?: WorkflowSubStage[];
}

export interface WorkflowSubStage {
  id: string;
  organization_id: string;
  workflow_stage_id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  sub_stage_order: number;
  is_active?: boolean; // Optional in database (has default)
  exit_criteria?: string;
  responsible_roles?: string[];
  estimated_duration_hours?: number;
  is_required?: boolean; // Optional in database (has default)
  can_skip?: boolean; // Optional in database (has default)
  auto_advance?: boolean; // Optional in database (has default)
  requires_approval?: boolean; // Optional in database (has default)
  approval_roles?: string[];
  metadata?: Record<string, any>;
  created_at?: string; // Optional in database (has default)
  updated_at?: string;
}

export interface ProjectSubStageProgress {
  id: string;
  organization_id: string;
  project_id: string;
  workflow_stage_id: string;
  sub_stage_id: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked'; // Optional in database (has default)
  started_at?: string;
  completed_at?: string;
  assigned_to?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at?: string; // Optional in database (has default)
  updated_at?: string;
}

export interface Project {
  // Core database fields - must match database schema exactly
  id: string;
  organization_id: string; // Required in database
  project_id: string; // P-25082001 format
  title: string;
  description?: string;
  customer_id?: string;
  current_stage_id?: string;
  status: ProjectStatus;
  priority_level?: ProjectPriority;
  priority_score?: number; // Added from database schema
  source?: string;
  assigned_to?: string;
  created_by?: string;
  estimated_value?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  stage_entered_at?: string;
  project_type?: string;
  intake_type?: IntakeType;
  intake_source?: IntakeSource;
  notes?: string;
  created_at?: string; // Optional in database (has default)
  updated_at?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;

  // New fields for enhanced intake form
  volume?: VolumeData[];
  target_price_per_unit?: number;
  project_reference?: string;
  desired_delivery_date?: string;

  // Computed/joined fields (not in database)
  customer?: Contact;
  current_stage?: WorkflowStage;
  assignee?: any; // User interface to be defined
  creator?: any; // User interface to be defined

  // Calculated fields
  days_in_stage?: number;
  due_date?: string; // Computed from estimated_delivery_date

  // Legacy fields for backward compatibility - to be gradually removed
  current_stage_legacy?: ProjectStage;
  priority?: ProjectPriority; // Maps to priority_level
  assignee_id?: string;
  estimated_completion?: string;
  actual_completion?: string;
  updated_by?: string;
  engineering_reviewer_id?: string;
  qa_reviewer_id?: string;
  production_reviewer_id?: string;
  review_summary?: any;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface ProjectStageHistory {
  id: string;
  project_id: string;
  stage_id: string;
  entered_at: string;
  exited_at?: string;
  duration_minutes?: number;
  entered_by?: string;
  exit_reason?: string;
  notes?: string;
  created_at: string;
  // Enhanced fields for display
  stage_name?: string;
  user_name?: string;
  user_email?: string;
  bypass_required?: boolean;
  bypass_reason?: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  assigned_at?: string; // Optional in database (has default)
  assigned_by?: string;
  is_active?: boolean; // Optional in database (has default)
}

export interface ProjectDocument {
  id: string;
  organization_id: string; // Added from database schema
  project_id?: string; // Optional in database
  file_name: string;
  title: string;
  description?: string;
  file_size?: number;
  file_type?: string;
  file_path: string;
  mime_type?: string;
  version?: number;
  is_current_version?: boolean;
  category?: string;
  access_level?: string;
  tags?: string[]; // Added from database schema
  metadata?: Record<string, any>;
  created_at?: string; // Optional in database (has default)
  updated_at?: string; // Added from database schema
  uploaded_by?: string;
  approved_at?: string; // Added from database schema
  approved_by?: string; // Added from database schema
  // Link-specific fields
  external_id?: string;
  external_url?: string;
  storage_provider?: string;
  link_type?: string;
  link_permissions?: Record<string, any>;
  link_expires_at?: string;
  link_access_count?: number;
  link_last_accessed?: string;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  user_id?: string;
  comment: string;
  page_number?: number;
  coordinates?: Record<string, any>;
  is_resolved: boolean;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  user_id?: string;
  action: 'view' | 'download' | 'upload' | 'delete' | 'share';
  ip_address?: string;
  user_agent?: string;
  accessed_at: string;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  activity_type: string;
  description: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at: string;
  created_by?: string;
}

export interface ProjectStageInfo {
  id: ProjectStage;
  name: string;
  color: string;
  count: number;
}

// Duplicate WorkflowStage interface removed - using the main definition above

export interface ProjectMetric {
  id: string;
  project_id: string;
  phase_name: string;
  phase_start: string;
  phase_end?: string;
  time_spent?: string;
  created_at: string;
}

// Legacy PROJECT_STAGES - kept for backward compatibility
export const PROJECT_STAGES: ProjectStageInfo[] = [
  { id: "inquiry_received", name: "Inquiry Received", color: "bg-blue-100 text-blue-800", count: 0 },
  { id: "technical_review", name: "Technical Review", color: "bg-orange-100 text-orange-800", count: 0 },
  { id: "supplier_rfq_sent", name: "Supplier RFQ Sent", color: "bg-indigo-100 text-indigo-800", count: 0 },
  { id: "quoted", name: "Quoted", color: "bg-green-100 text-green-800", count: 0 },
  { id: "order_confirmed", name: "Order Confirmed", color: "bg-purple-100 text-purple-800", count: 0 },
  { id: "procurement_planning", name: "Procurement & Planning", color: "bg-yellow-100 text-yellow-800", count: 0 },
  { id: "in_production", name: "In Production", color: "bg-teal-100 text-teal-800", count: 0 },
  { id: "shipped_closed", name: "Shipped & Closed", color: "bg-gray-100 text-gray-800", count: 0 }
];

// Stage name mapping from database to legacy enum for backward compatibility
export const STAGE_NAME_TO_LEGACY: Record<string, ProjectStage> = {
  'Inquiry Received': 'inquiry_received',
  'Technical Review': 'technical_review',
  'Supplier RFQ': 'supplier_rfq_sent',
  'Quoted': 'quoted',
  'Order Confirmed': 'order_confirmed',
  'Procurement Planning': 'procurement_planning',
  'In Production': 'in_production',
  'Shipped & Closed': 'shipped_closed'
};

// Legacy enum to stage name mapping
export const LEGACY_TO_STAGE_NAME: Record<ProjectStage, string> = {
  'inquiry_received': 'Inquiry Received',
  'technical_review': 'Technical Review',
  'supplier_rfq_sent': 'Supplier RFQ',
  'quoted': 'Quoted',
  'order_confirmed': 'Order Confirmed',
  'procurement_planning': 'Procurement Planning',
  'in_production': 'In Production',
  'shipped_closed': 'Shipped & Closed'
};

export const STAGE_COLORS: Record<ProjectStage, string> = {
  inquiry_received: 'bg-blue-100 text-blue-800',
  technical_review: 'bg-orange-100 text-orange-800',
  supplier_rfq_sent: 'bg-indigo-100 text-indigo-800',
  quoted: 'bg-green-100 text-green-800',
  order_confirmed: 'bg-purple-100 text-purple-800',
  procurement_planning: 'bg-yellow-100 text-yellow-800',
  in_production: 'bg-teal-100 text-teal-800',
  shipped_closed: 'bg-gray-100 text-gray-800'
};

export const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  system_build: 'System Build',
  fabrication: 'Fabrication',
  manufacturing: 'Manufacturing'
};

export const PROJECT_TYPE_DESCRIPTIONS: Record<ProjectType, string> = {
  system_build: 'From requirements to design, fabrication, assemble, test and delivery',
  fabrication: 'Parts fabrication like CNC machining, sheet metal, etc.',
  manufacturing: 'Contract manufacturing, high volume production, etc.'
};

export const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  system_build: 'bg-blue-100 text-blue-800 border-blue-200',
  fabrication: 'bg-green-100 text-green-800 border-green-200',
  manufacturing: 'bg-purple-100 text-purple-800 border-purple-200'
};

// Legacy RFQ compatibility - gradually phase out
export type RFQStatus = ProjectStage;
export type RFQPriority = ProjectPriority;
export type RFQType = ProjectType;
export type RFQ = Project;
export type RFQAttachment = ProjectDocument;
export type RFQActivity = ProjectActivity;
export type RFQStage = ProjectStageInfo;

export const RFQ_STAGES = PROJECT_STAGES;

// Type validation functions
export function isValidProjectStatus(status: string): status is ProjectStatus {
  return ['active', 'on_hold', 'cancelled', 'completed'].includes(status);
}

export function isValidProjectPriority(priority: string): priority is ProjectPriority {
  return ['low', 'medium', 'high', 'urgent'].includes(priority);
}