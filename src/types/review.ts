export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';
export type RiskSeverity = 'low' | 'medium' | 'high';
export type RiskCategory = 'technical' | 'timeline' | 'cost' | 'quality';
export type ClarificationStatus = 'open' | 'resolved' | 'closed';
export type Department = 'Engineering' | 'QA' | 'Production';

export interface InternalReview {
  id: string;
  project_id: string;
  department: Department;
  reviewer_id?: string;
  reviewer_name?: string;
  status: ReviewStatus;
  feedback?: string;
  suggestions?: string[];
  risks?: any[];
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

export interface RFQRisk {
  id: string;
  project_id: string;
  review_id?: string;
  description: string;
  category: RiskCategory;
  severity: RiskSeverity;
  mitigation_plan?: string;
  created_at: string;
  created_by?: string;
}

export interface RFQClarification {
  id: string;
  project_id: string;
  requested_by?: string;
  description: string;
  status: ClarificationStatus;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface ReviewSummary {
  [department: string]: {
    status: ReviewStatus;
    reviewer_id?: string;
    submitted_at?: string;
    feedback?: string;
  };
}

export interface ReviewSubmission {
  status: ReviewStatus;
  feedback: string;
  suggestions: string[];
  risks: Omit<RFQRisk, 'id' | 'project_id' | 'created_at' | 'created_by'>[];
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  Engineering: 'Engineering Review',
  QA: 'Quality Assurance Review',
  Production: 'Production Review'
};

export const STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  revision_requested: 'bg-orange-100 text-orange-800 border-orange-200'
};

export const RISK_SEVERITY_COLORS: Record<RiskSeverity, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200'
};

export const RISK_CATEGORY_COLORS: Record<RiskCategory, string> = {
  technical: 'bg-blue-100 text-blue-800 border-blue-200',
  timeline: 'bg-purple-100 text-purple-800 border-purple-200',
  cost: 'bg-orange-100 text-orange-800 border-orange-200',
  quality: 'bg-pink-100 text-pink-800 border-pink-200'
};