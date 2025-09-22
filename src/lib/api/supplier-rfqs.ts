import { supabase } from '@/integrations/supabase/client.ts';
import type { SupplierRFQ, SupplierQuote } from '@/types/supplier-rfq';

export const supplierRfqsApi = {
  async getByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from('supplier_rfqs')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as (SupplierRFQ & { supplier?: any })[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('supplier_rfqs')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as SupplierRFQ & { supplier?: any };
  },

  async create(rfq: Omit<SupplierRFQ, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('supplier_rfqs')
      .insert(rfq)
      .select()
      .single();
    
    if (error) throw error;
    return data as SupplierRFQ;
  },

  async update(id: string, updates: Partial<SupplierRFQ>) {
    const { data, error } = await supabase
      .from('supplier_rfqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as SupplierRFQ;
  }
};

export const supplierQuotesApi = {
  async getByRfqId(rfqId: string) {
    const { data, error } = await supabase
      .from('supplier_quotes')
      .select('*')
      .eq('supplier_rfq_id', rfqId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data as SupplierQuote[];
  },

  async create(quote: Omit<SupplierQuote, 'id' | 'submitted_at'>) {
    const { data, error } = await supabase
      .from('supplier_quotes')
      .insert(quote)
      .select()
      .single();
    
    if (error) throw error;
    return data as SupplierQuote;
  },

  async update(id: string, updates: Partial<SupplierQuote>) {
    const { data, error } = await supabase
      .from('supplier_quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as SupplierQuote;
  },

  async selectQuote(id: string) {
    // First, unselect all other quotes for the same RFQ
    const quote = await supabase
      .from('supplier_quotes')
      .select('supplier_rfq_id')
      .eq('id', id)
      .single();

    if (quote.error) throw quote.error;

    await supabase
      .from('supplier_quotes')
      .update({ is_selected: false })
      .eq('supplier_rfq_id', quote.data.supplier_rfq_id);

    // Then select this quote
    const { data, error } = await supabase
      .from('supplier_quotes')
      .update({ is_selected: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as SupplierQuote;
  }
};