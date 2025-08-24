import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InventoryItem {
  id: string;
  item_code: string;
  item_name: string;
  description?: string;
  category?: string;
  unit?: string;
  current_stock: number;
  min_stock_level?: number;
  max_stock_level?: number;
  unit_cost?: number;
  location?: string;
  supplier_id?: string;
  status: string; // Using string since it's TEXT with CHECK constraint
  last_restocked?: string;
  created_at: string;
  updated_at: string;
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('item_name', { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory
  };
}