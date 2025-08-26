export type RFQStatus = 'inquiry' | 'review' | 'quote' | 'production' | 'completed' | 'cancelled' | 'inquiry_received' | 'technical_review' | 'supplier_rfq_sent' | 'order_confirmed' | 'procurement_planning' | 'in_production' | 'shipped_closed';
export type RFQPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RFQ {
  id: string;
  rfq_number: string;
  company_name: string;
  project_name: string;
  description?: string;
  priority: RFQPriority;
  status: RFQStatus;
  assignee_id?: string;
  estimated_value?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  days_in_stage: number;
  stage_entered_at: string;
  tags?: string[];
  notes?: string;
}

export interface RFQAttachment {
  id: string;
  rfq_id: string;
  filename: string;
  file_size?: number;
  file_type?: string;
  storage_path: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export interface RFQActivity {
  id: string;
  rfq_id: string;
  activity_type: string;
  description: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at: string;
  created_by?: string;
}

export interface RFQStage {
  id: RFQStatus;
  name: string;
  color: string;
  count: number;
}

export const RFQ_STAGES: RFQStage[] = [
  { id: "inquiry_received", name: "New Inquiry", color: "bg-blue-100 text-blue-800", count: 0 },
  { id: "technical_review", name: "Under Review", color: "bg-orange-100 text-orange-800", count: 0 },
  { id: "quote", name: "Quotation", color: "bg-purple-100 text-purple-800", count: 0 },
  { id: "in_production", name: "Production", color: "bg-green-100 text-green-800", count: 0 },
  { id: "shipped_closed", name: "Completed", color: "bg-gray-100 text-gray-800", count: 0 },
  // Legacy statuses for backward compatibility
  { id: "inquiry", name: "New Inquiry (Legacy)", color: "bg-blue-100 text-blue-800", count: 0 },
  { id: "review", name: "Under Review (Legacy)", color: "bg-orange-100 text-orange-800", count: 0 },
  { id: "production", name: "Production (Legacy)", color: "bg-green-100 text-green-800", count: 0 },
  { id: "completed", name: "Completed (Legacy)", color: "bg-gray-100 text-gray-800", count: 0 }
];

export const PRIORITY_COLORS: Record<RFQPriority, string> = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};