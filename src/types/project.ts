// Legacy ProjectStage enum - kept for backward compatibility
export type ProjectStage = 'inquiry_received' | 'technical_review' | 'supplier_rfq_sent' | 'quoted' | 'order_confirmed' | 'procurement_planning' | 'in_production' | 'shipped_closed';

// Dynamic stage type based on database workflow_stages
export type WorkflowStageId = string; // UUID from workflow_stages table
export type ProjectStatus = 'active' | 'on_hold' | 'cancelled' | 'completed';
export type ProjectPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ProjectType = 'system_build' | 'fabrication' | 'manufacturing';
export type ProjectSource = 'manual' | 'portal' | 'email' | 'api' | 'import' | 'migration';
export type IntakeType = 'rfq' | 'purchase_order' | 'project_idea' | 'direct_request';
export type IntakeSource = 'portal' | 'email' | 'api' | 'phone' | 'walk_in';

// Customer interface removed - customers are stored in contacts table with type='customer'
// Use Contact interface with type='customer' instead
export type Customer = Contact & { type: 'customer' };

// Project summary for customer organizations
export interface CustomerProjectSummary {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  cancelled_projects: number;
  on_hold_projects: number;
  total_value: number;
  active_value: number;
  completed_value: number;
  avg_project_value: number;
  latest_project_date?: string;
}

// Customer organization with project summary
export interface CustomerOrganizationWithSummary extends Organization {
  project_summary: CustomerProjectSummary;
  primary_contact?: {
    id: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  logo_url?: string;
  organization_type: 'internal' | 'customer' | 'supplier' | 'partner';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;

  // Enhanced fields for optimized schema
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  default_currency?: string;
  timezone?: string;
  metadata?: Record<string, any>;
}

// ProjectContactPoint interface removed - replaced with point_of_contacts array in Project
// Primary contact is the first contact in the point_of_contacts array

export interface Contact {
  // Core database fields - must match database schema exactly
  id: string;
  organization_id: string;
  type: 'customer' | 'supplier' | 'partner' | 'internal'; // Updated to match database enum
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
  created_by?: string;

  // Enhanced fields for optimized schema
  role?: string; // 'purchasing', 'engineering', 'quality', etc.
  is_primary_contact?: boolean;
  department?: string;
  job_title?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  description?: string;

  // AI and metadata fields from database schema
  metadata?: Record<string, any>;
  ai_category?: Record<string, any>;
  ai_capabilities?: string[]; // Updated to match database type
  ai_risk_score?: number;
  ai_last_analyzed?: string;
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
  customer_organization_id: string; // Required - references organizations table
  point_of_contacts: string[]; // Array of contact IDs, first is primary contact
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

  // Computed/joined fields (not in database)
  customer_organization?: Organization; // Resolved from customer_organization_id
  contacts?: Contact[]; // Resolved from point_of_contacts array
  primary_contact?: Contact; // First contact in point_of_contacts array
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
  uploaded_by?: string; // Direct link to users.id (no redundant user_id field)
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
  normal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

// =========================================
// NEW INTERFACES FOR OPTIMIZED SCHEMA
// =========================================

// Workflow Definition interfaces
export interface WorkflowDefinition {
  id: string;
  organization_id: string;
  name: string;
  version: number;
  description?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowDefinitionStage {
  id: string;
  workflow_definition_id: string;
  workflow_stage_id: string;
  is_included: boolean;
  stage_order_override?: number;
  responsible_roles_override?: string[];
  estimated_duration_days_override?: number;
  requires_approval_override?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowDefinitionSubStage {
  id: string;
  workflow_definition_id: string;
  workflow_sub_stage_id: string;
  is_included: boolean;
  sub_stage_order_override?: number;
  responsible_roles_override?: string[];
  requires_approval_override?: boolean;
  can_skip_override?: boolean;
  auto_advance_override?: boolean;
  estimated_duration_hours_override?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Enhanced Project Progress interfaces
export interface ProjectSubStageProgress {
  id: string;
  organization_id: string;
  project_id: string;
  workflow_stage_id: string;
  sub_stage_id: string;
  status: 'pending' | 'in_progress' | 'in_review' | 'blocked' | 'skipped' | 'completed';
  assigned_to?: string;
  started_at?: string;
  due_at?: string;
  completed_at?: string;
  blocked_reason?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Approval Chain interfaces
export interface ApprovalChain {
  id: string;
  organization_id: string;
  chain_name: string;
  conditions?: Record<string, any>;
  steps?: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApprovalAttachment {
  id: string;
  approval_id: string;
  organization_id: string;
  uploaded_by: string;
  file_name: string;
  original_file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  mime_type?: string;
  uploaded_at: string;
  attachment_type: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Document Version interfaces
export interface DocumentVersion {
  id: string;
  organization_id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  checksum?: string;
  uploaded_by: string;
  is_current: boolean;
  uploaded_at: string;
  change_summary?: string;
  metadata?: Record<string, any>;
}

// Activity Log interface (enhanced)
export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id?: string; // Who performed the action (legitimate reference to users.id)
  project_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  description?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Notification interface (enhanced)
export interface Notification {
  id: string;
  organization_id: string;
  user_id: string; // Recipient of the notification (legitimate reference to users.id)
  type: 'workflow' | 'approval' | 'document' | 'message' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Message interface (enhanced)
export interface Message {
  id: string;
  organization_id: string;
  project_id?: string;
  sender_id: string; // Who sent the message (legitimate reference to users.id)
  recipient_id?: string; // Who receives the message (legitimate reference to users.id)
  subject: string;
  content: string;
  is_read: boolean;
  read_at?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  message_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// =========================================
// OPTIMIZED VIEW INTERFACES
// =========================================

// Project Detail View (combines project with related data)
export interface ProjectDetailView extends Project {
  customer_name?: string;
  customer_slug?: string;
  customer_type?: string;
  customer_industry?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  current_stage_name?: string;
  current_stage_color?: string;
  current_stage_order?: number;
  assignee_name?: string;
  assignee_email?: string;
  assignee_role?: string;
  creator_name?: string;
  creator_email?: string;
  total_sub_stages?: number;
  completed_sub_stages?: number;
  in_progress_sub_stages?: number;
  blocked_sub_stages?: number;
  days_in_current_stage?: number;
  days_until_due?: number;
}

// Current Stage Progress View (optimized for kanban/dashboard)
export interface CurrentStageProgressView {
  project_id: string;
  project_code: string;
  project_title: string;
  priority_level: string;
  project_status: string;
  stage_entered_at?: string;
  stage_id: string;
  stage_name: string;
  stage_order: number;
  stage_color?: string;
  sub_stage_id: string;
  sub_stage_name: string;
  sub_stage_order: number;
  estimated_duration_hours?: number;
  responsible_roles?: string[];
  requires_approval?: boolean;
  progress_status: string;
  assigned_to?: string;
  started_at?: string;
  due_at?: string;
  completed_at?: string;
  blocked_reason?: string;
  assigned_user_name?: string;
  assigned_user_role?: string;
  hours_until_due?: number;
  actual_hours_taken?: number;
  priority_score: number;
}

// Approval Queue View (optimized for approval dashboards)
export interface ApprovalQueueView {
  id: string;
  organization_id: string;
  approval_type: string;
  title: string;
  description?: string;
  entity_type: string;
  entity_id: string;
  requested_by: string;
  current_approver_id?: string;
  status: string;
  priority: string;
  due_date?: string;
  sla_due_at?: string;
  requested_at: string;
  request_reason?: string;
  requester_name?: string;
  requester_email?: string;
  requester_role?: string;
  current_approver_name?: string;
  current_approver_email?: string;
  current_approver_role?: string;
  entity_title?: string;
  project_code?: string;
  hours_since_request?: number;
  hours_until_sla_due?: number;
  is_overdue?: boolean;
  needs_assignment?: boolean;
}

// =========================================
// MATERIALIZED VIEW INTERFACES
// =========================================

// Project Dashboard Summary (materialized view)
export interface ProjectDashboardSummary {
  organization_id: string;
  status: string;
  priority_level: string;
  current_stage_id?: string;
  current_stage_name?: string;
  project_count: number;
  completed_count: number;
  avg_delivery_variance_days?: number;
  oldest_project_date?: string;
  newest_project_date?: string;
  total_estimated_value?: number;
  total_actual_value?: number;
}

// Workflow Efficiency Metrics (materialized view)
export interface WorkflowEfficiency {
  organization_id: string;
  stage_name: string;
  sub_stage_name: string;
  total_instances: number;
  completed_count: number;
  avg_completion_hours?: number;
  avg_overdue_hours?: number;
  first_started?: string;
  last_completed?: string;
}

// Approval Performance Metrics (materialized view)
export interface ApprovalPerformance {
  organization_id: string;
  approval_type: string;
  status: string;
  priority: string;
  approval_count: number;
  avg_decision_hours?: number;
  avg_overdue_hours?: number;
  overdue_count: number;
  oldest_request?: string;
  newest_decision?: string;
}

// User Workload Summary (materialized view)
export interface UserWorkload {
  user_id: string;
  organization_id: string;
  user_name: string;
  role: string;
  assigned_projects: number;
  assigned_sub_stages: number;
  active_sub_stages: number;
  completed_sub_stages: number;
  pending_approvals: number;
  requested_approvals: number;
  last_activity?: string;
}

// =========================================
// TYPE GUARDS AND UTILITY FUNCTIONS
// =========================================

// Type guards for enhanced schema validation
export function isWorkflowDefinition(obj: any): obj is WorkflowDefinition {
  return obj && typeof obj.id === 'string' && typeof obj.organization_id === 'string' &&
    typeof obj.name === 'string' && typeof obj.version === 'number';
}

export function isProjectDetailView(obj: any): obj is ProjectDetailView {
  return obj && typeof obj.id === 'string' && typeof obj.organization_id === 'string' &&
    typeof obj.project_id === 'string';
}

export function isCurrentStageProgressView(obj: any): obj is CurrentStageProgressView {
  return obj && typeof obj.project_id === 'string' && typeof obj.stage_id === 'string' &&
    typeof obj.sub_stage_id === 'string';
}

export function isApprovalQueueView(obj: any): obj is ApprovalQueueView {
  return obj && typeof obj.id === 'string' && typeof obj.organization_id === 'string' &&
    typeof obj.approval_type === 'string';
}

// Utility functions for optimized schema
export function getProjectPriorityScore(priority: ProjectPriority): number {
  switch (priority) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'normal': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

export function getApprovalPriorityScore(priority: string): number {
  switch (priority) {
    case 'critical': return 4;
    case 'urgent': return 3;
    case 'high': return 2;
    case 'normal': return 1;
    case 'low': return 0;
    default: return 0;
  }
}

export function calculateDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

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
  return ['low', 'normal', 'high', 'urgent'].includes(priority);
}