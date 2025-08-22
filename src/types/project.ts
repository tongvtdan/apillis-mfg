export type ProjectStatus = 'inquiry' | 'review' | 'quoted' | 'won' | 'lost' | 'production' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_id: string; // P-25082001 format
  title: string;
  description?: string;
  customer_id?: string;
  customer?: Customer;
  status: ProjectStatus;
  priority: ProjectPriority;
  priority_score?: number;
  assignee_id?: string;
  estimated_value?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  days_in_stage: number;
  stage_entered_at: string;
  engineering_reviewer_id?: string;
  qa_reviewer_id?: string;
  production_reviewer_id?: string;
  review_summary?: any; // JSONB field from database
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  tags?: string[];
  notes?: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  filename: string;
  file_size?: number;
  file_type?: string;
  file_url?: string;
  storage_path: string;
  version?: number;
  is_latest?: boolean;
  uploaded_at: string;
  uploaded_by?: string;
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

export interface ProjectStage {
  id: ProjectStatus;
  name: string;
  color: string;
  count: number;
}

export interface WorkflowStage {
  id: string;
  name: string;
  color: string;
  stage_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProjectMetric {
  id: string;
  project_id: string;
  phase_name: string;
  phase_start: string;
  phase_end?: string;
  time_spent?: string;
  created_at: string;
}

export const PROJECT_STAGES: ProjectStage[] = [
  { id: "inquiry", name: "New Inquiry", color: "bg-blue-100 text-blue-800", count: 0 },
  { id: "review", name: "Under Review", color: "bg-orange-100 text-orange-800", count: 0 },
  { id: "quoted", name: "Quoted", color: "bg-purple-100 text-purple-800", count: 0 },
  { id: "won", name: "Won", color: "bg-green-100 text-green-800", count: 0 },
  { id: "production", name: "Production", color: "bg-teal-100 text-teal-800", count: 0 },
  { id: "completed", name: "Completed", color: "bg-gray-100 text-gray-800", count: 0 }
];

export const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

// Legacy RFQ compatibility - gradually phase out
export type RFQStatus = ProjectStatus;
export type RFQPriority = ProjectPriority;
export type RFQ = Project;
export type RFQAttachment = ProjectDocument;
export type RFQActivity = ProjectActivity;
export type RFQStage = ProjectStage;

export const RFQ_STAGES = PROJECT_STAGES;