export interface SupplierRFQ {
  id: string;
  project_id: string;
  supplier_id?: string;
  rfq_number: string;
  status: 'draft' | 'sent' | 'viewed' | 'quoted' | 'declined' | 'expired' | 'cancelled';
  sent_at?: string;
  viewed_at?: string;
  due_date?: string;
  expected_response_date?: string;
  priority: string;
  requirements?: string;
  special_instructions?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierQuote {
  id: string;
  supplier_rfq_id: string;
  quote_number?: string;
  unit_price?: number;
  total_price?: number;
  currency: string;
  quantity?: number;
  lead_time_days?: number;
  valid_until?: string;
  payment_terms?: string;
  shipping_terms?: string;
  notes?: string;
  quote_file_url?: string;
  is_selected: boolean;
  submitted_at: string;
  evaluated_at?: string;
  evaluated_by?: string;
  evaluation_score?: number;
  evaluation_notes?: string;
}