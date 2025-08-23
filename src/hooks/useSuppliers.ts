import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Supplier, 
  SupplierPerformanceMetrics, 
  SupplierAnalytics,
  CreateSupplierRequest, 
  UpdateSupplierRequest,
  SupplierSearchCriteria 
} from '@/types/supplier';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    if (!user) {
      setSuppliers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .order('rating', { ascending: false });

      if (fetchError) {
        console.error('Error fetching suppliers:', fetchError);
        setError(fetchError.message);
        return;
      }

      setSuppliers(data || []);
    } catch (err) {
      console.error('Error in fetchSuppliers:', err);
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplierData: CreateSupplierRequest): Promise<Supplier> => {
    try {
      const cleanData = {
        name: supplierData.name,
        company: supplierData.company,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        country: supplierData.country,
        specialties: supplierData.specialties,
        notes: supplierData.notes,
        tags: supplierData.tags || [],
        created_by: user?.id
      };

      const { data, error } = await supabase
        .from('suppliers')
        .insert([cleanData])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating supplier:', error);
        throw error;
      }

      // Add to local state optimistically
      setSuppliers(prev => [data, ...prev]);

      toast({
        title: "Supplier Created",
        description: `${data.name} has been added to your supplier list`,
      });

      return data;
    } catch (err) {
      console.error('Error in createSupplier:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create supplier",
      });
      throw err;
    }
  };

  const updateSupplier = async (supplierId: string, updates: UpdateSupplierRequest): Promise<Supplier> => {
    try {
      const cleanUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      const { data, error } = await supabase
        .from('suppliers')
        .update(cleanUpdates)
        .eq('id', supplierId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating supplier:', error);
        throw error;
      }

      // Update local state
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === supplierId ? data : supplier
      ));

      toast({
        title: "Supplier Updated",
        description: `${data.name} has been updated successfully`,
      });

      return data;
    } catch (err) {
      console.error('Error in updateSupplier:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update supplier",
      });
      throw err;
    }
  };

  const deactivateSupplier = async (supplierId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', supplierId);

      if (error) {
        console.error('Error deactivating supplier:', error);
        throw error;
      }

      // Update local state
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === supplierId 
          ? { ...supplier, is_active: false, updated_at: new Date().toISOString() }
          : supplier
      ));

      toast({
        title: "Supplier Deactivated",
        description: "Supplier has been deactivated",
      });

      return true;
    } catch (err) {
      console.error('Error in deactivateSupplier:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to deactivate supplier",
      });
      return false;
    }
  };

  const searchSuppliers = async (criteria: SupplierSearchCriteria): Promise<Supplier[]> => {
    try {
      let query = supabase.from('suppliers').select('*');

      // Apply search filters
      if (criteria.name) {
        query = query.or(`name.ilike.%${criteria.name}%,company.ilike.%${criteria.name}%`);
      }

      if (criteria.specialties && criteria.specialties.length > 0) {
        query = query.overlaps('specialties', criteria.specialties);
      }

      if (criteria.country) {
        query = query.eq('country', criteria.country);
      }

      if (criteria.min_rating !== undefined) {
        query = query.gte('rating', criteria.min_rating);
      }

      if (criteria.is_active !== undefined) {
        query = query.eq('is_active', criteria.is_active);
      }

      if (criteria.tags && criteria.tags.length > 0) {
        query = query.overlaps('tags', criteria.tags);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) {
        console.error('Error searching suppliers:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error in searchSuppliers:', err);
      throw err;
    }
  };

  const getSupplierPerformance = async (supplierId: string): Promise<SupplierPerformanceMetrics[]> => {
    try {
      const { data, error } = await supabase
        .from('supplier_performance_metrics')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('period_start', { ascending: false });

      if (error) {
        console.error('Error fetching supplier performance:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error in getSupplierPerformance:', err);
      throw err;
    }
  };

  const getSupplierAnalytics = async (): Promise<SupplierAnalytics[]> => {
    try {
      const { data, error } = await supabase
        .from('supplier_quote_analytics')
        .select('*')
        .order('response_rate_percent', { ascending: false });

      if (error) {
        console.error('Error fetching supplier analytics:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error in getSupplierAnalytics:', err);
      throw err;
    }
  };

  const updateSupplierPerformanceMetrics = async (supplierId: string): Promise<void> => {
    try {
      const { error } = await supabase.rpc('update_supplier_performance_metrics', {
        supplier_uuid: supplierId
      });

      if (error) {
        console.error('Error updating supplier performance metrics:', error);
        throw error;
      }

      // Refresh supplier data to reflect updated metrics
      const updatedSupplier = await getSupplierById(supplierId);
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === supplierId ? updatedSupplier : supplier
      ));
    } catch (err) {
      console.error('Error in updateSupplierPerformanceMetrics:', err);
      // Don't throw - this is a background operation
    }
  };

  const calculateSupplierRating = async (supplierId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('calculate_supplier_rating', {
        supplier_uuid: supplierId
      });

      if (error) {
        console.error('Error calculating supplier rating:', error);
        throw error;
      }

      return data || 0.0;
    } catch (err) {
      console.error('Error in calculateSupplierRating:', err);
      return 0.0;
    }
  };

  const getSupplierById = async (id: string): Promise<Supplier> => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  const getActiveSuppliers = (): Supplier[] => {
    return suppliers.filter(supplier => supplier.is_active);
  };

  const getSuppliersBySpecialty = (specialty: string): Supplier[] => {
    return suppliers.filter(supplier => 
      supplier.is_active && supplier.specialties.includes(specialty as any)
    );
  };

  const getTopPerformingSuppliers = (limit: number = 10): Supplier[] => {
    return suppliers
      .filter(supplier => supplier.is_active)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchSuppliers();

    const channel = supabase
      .channel('suppliers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suppliers'
        },
        (payload) => {
          console.log('Supplier change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newSupplier = payload.new as Supplier;
            setSuppliers(prev => [newSupplier, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedSupplier = payload.new as Supplier;
            setSuppliers(prev => prev.map(supplier => 
              supplier.id === updatedSupplier.id 
                ? updatedSupplier 
                : supplier
            ));
          } else if (payload.eventType === 'DELETE') {
            setSuppliers(prev => prev.filter(supplier => supplier.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Background performance metrics updates
  useEffect(() => {
    if (suppliers.length > 0) {
      // Update performance metrics for suppliers with recent activity
      const updateMetrics = async () => {
        const recentlyActiveSuppliers = suppliers.filter(supplier => {
          const lastContact = supplier.last_contact_date;
          if (!lastContact) return false;
          
          const daysSinceContact = (Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceContact <= 7; // Active in last week
        });

        // Update metrics for recently active suppliers
        for (const supplier of recentlyActiveSuppliers.slice(0, 5)) { // Limit to 5 at a time
          try {
            await updateSupplierPerformanceMetrics(supplier.id);
          } catch (err) {
            // Silently continue - background operation
            console.log(`Background metric update failed for supplier ${supplier.id}`);
          }
        }
      };

      // Run background updates after component mounts
      const timeoutId = setTimeout(updateMetrics, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [suppliers.length]);

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
    
    // CRUD operations
    createSupplier,
    updateSupplier,
    deactivateSupplier,
    getSupplierById,
    
    // Search and filtering
    searchSuppliers,
    getActiveSuppliers,
    getSuppliersBySpecialty,
    getTopPerformingSuppliers,
    
    // Performance tracking
    getSupplierPerformance,
    getSupplierAnalytics,
    updateSupplierPerformanceMetrics,
    calculateSupplierRating
  };
}