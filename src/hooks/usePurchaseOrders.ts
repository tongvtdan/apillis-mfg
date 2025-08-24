import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id?: string;
  project_id?: string;
  status: string; // Using string since it's TEXT with CHECK constraint
  priority: string; // Using string since it's TEXT with CHECK constraint
  total_amount?: number;
  currency?: string;
  due_date?: string;
  order_date: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  return {
    purchaseOrders,
    loading,
    error,
    refetch: fetchPurchaseOrders
  };
}