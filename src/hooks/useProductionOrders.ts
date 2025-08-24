import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProductionOrder {
  id: string;
  production_number: string;
  project_id?: string;
  status: string; // Using string since it's TEXT with CHECK constraint
  priority: string; // Using string since it's TEXT with CHECK constraint
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  quantity: number;
  completed_quantity?: number;
  assigned_to?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useProductionOrders() {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProductionOrders();
  }, []);

  const fetchProductionOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('production_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductionOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch production orders');
    } finally {
      setLoading(false);
    }
  };

  return {
    productionOrders,
    loading,
    error,
    refetch: fetchProductionOrders
  };
}