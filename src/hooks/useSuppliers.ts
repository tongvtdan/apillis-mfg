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
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching suppliers:', fetchError);
        setError(fetchError.message);
        return;
      }

      const mapped: Supplier[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        company: row.company,
        email: row.email ?? undefined,
        phone: row.phone ?? undefined,
        address: row.address ?? undefined,
        country: row.country ?? undefined,
        specialties: (row.capabilities || []) as any,
        rating: Number(((row.quality_rating ?? 4) + (row.delivery_rating ?? 4) + (row.cost_rating ?? 4)) / 3),
        response_rate: 0,
        is_active: (row.status ?? 'active') === 'active',
        created_at: row.created_at,
        updated_at: row.updated_at,
        total_quotes_sent: 0,
        total_quotes_received: 0,
        average_turnaround_days: 0,
        tags: [],
      }));

      setSuppliers(mapped);
    } catch (err) {
      console.error('Error in fetchSuppliers:', err);
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplierData: CreateSupplierRequest): Promise<Supplier> => {
    try {
      const cleanData: any = {
        name: supplierData.name,
        company: supplierData.company || supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        country: supplierData.country,
        capabilities: supplierData.specialties as any,
        status: 'active',
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

      // Map to app type and add to local state
      const mapped: Supplier = {
        id: data.id,
        name: data.name,
        company: data.company,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        address: data.address ?? undefined,
        country: data.country ?? undefined,
        specialties: (data.capabilities || []) as any,
        rating: Number(((data.quality_rating ?? 4) + (data.delivery_rating ?? 4) + (data.cost_rating ?? 4)) / 3),
        response_rate: 0,
        is_active: (data.status ?? 'active') === 'active',
        created_at: data.created_at,
        updated_at: data.updated_at,
        total_quotes_sent: 0,
        total_quotes_received: 0,
        average_turnaround_days: 0,
        tags: [],
      };
      setSuppliers(prev => [mapped, ...prev]);

      toast({
        title: "Supplier Created",
        description: `${data.name} has been added to your supplier list`,
      });

      return mapped;
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
      const cleanUpdates: any = {
        ...updates,
        capabilities: (updates as any).specialties ?? undefined,
        specialties: undefined,
        updated_at: new Date().toISOString(),
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
      const mapped: Supplier = {
        id: data.id,
        name: data.name,
        company: data.company,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        address: data.address ?? undefined,
        country: data.country ?? undefined,
        specialties: (data.capabilities || []) as any,
        rating: Number(((data.quality_rating ?? 4) + (data.delivery_rating ?? 4) + (data.cost_rating ?? 4)) / 3),
        response_rate: 0,
        is_active: (data.status ?? 'active') === 'active',
        created_at: data.created_at,
        updated_at: data.updated_at,
        total_quotes_sent: 0,
        total_quotes_received: 0,
        average_turnaround_days: 0,
        tags: [],
      };
      setSuppliers(prev => prev.map(supplier =>
        supplier.id === supplierId ? mapped : supplier
      ));

      toast({
        title: "Supplier Updated",
        description: `${data.name} has been updated successfully`,
      });

      return mapped;
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

  const deleteSupplier = async (supplierId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) {
        console.error('Error deleting supplier:', error);
        throw error;
      }

      // Update local state
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));

      toast({
        title: "Supplier Deleted",
        description: "Supplier has been permanently deleted",
      });

      return true;
    } catch (err) {
      console.error('Error in deleteSupplier:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete supplier",
      });
      return false;
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

      if (criteria.name) {
        query = query.or(`name.ilike.%${criteria.name}%,company.ilike.%${criteria.name}%`);
      }

      if (criteria.specialties && criteria.specialties.length > 0) {
        query = query.overlaps('capabilities', criteria.specialties as any);
      }

      if (criteria.country) {
        query = query.eq('country', criteria.country);
      }

      if (criteria.is_active !== undefined) {
        query = query.eq('status', criteria.is_active ? 'active' : 'inactive');
      }

      if (criteria.tags && criteria.tags.length > 0) {
        // no tags column in DB - ignore
      }

      const { data, error } = await query.order('updated_at', { ascending: false });
      if (error) throw error;

      const mapped: Supplier[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        company: row.company,
        email: row.email ?? undefined,
        phone: row.phone ?? undefined,
        address: row.address ?? undefined,
        country: row.country ?? undefined,
        specialties: (row.capabilities || []) as any,
        rating: Number(((row.quality_rating ?? 4) + (row.delivery_rating ?? 4) + (row.cost_rating ?? 4)) / 3),
        response_rate: 0,
        is_active: (row.status ?? 'active') === 'active',
        created_at: row.created_at,
        updated_at: row.updated_at,
        total_quotes_sent: 0,
        total_quotes_received: 0,
        average_turnaround_days: 0,
        tags: [],
      }));

      // Apply min_rating client-side since DB doesn't have 'rating'
      const filtered = criteria.min_rating !== undefined
        ? mapped.filter(s => s.rating >= criteria.min_rating!)
        : mapped;

      return filtered;
    } catch (err) {
      console.error('Error in searchSuppliers:', err);
      throw err;
    }
  };

  const getSupplierPerformance = async (_supplierId: string): Promise<SupplierPerformanceMetrics[]> => {
    return [];
  };

  const getSupplierAnalytics = async (): Promise<SupplierAnalytics[]> => {
    return [];
  };

  const updateSupplierPerformanceMetrics = async (_supplierId: string): Promise<void> => {
    // no-op for now
    return;
  };

  const calculateSupplierRating = async (supplierId: string): Promise<number> => {
    const s = suppliers.find(s => s.id === supplierId);
    return s ? s.rating : 0.0;
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

    return {
      id: data.id,
      name: data.name,
      company: data.company,
      email: data.email ?? undefined,
      phone: data.phone ?? undefined,
      address: data.address ?? undefined,
      country: data.country ?? undefined,
      specialties: (data.capabilities || []) as any,
      rating: Number(((data.quality_rating ?? 4) + (data.delivery_rating ?? 4) + (data.cost_rating ?? 4)) / 3),
      response_rate: 0,
      is_active: (data.status ?? 'active') === 'active',
      created_at: data.created_at,
      updated_at: data.updated_at,
      total_quotes_sent: 0,
      total_quotes_received: 0,
      average_turnaround_days: 0,
      tags: [],
    };
  };

  const getActiveSuppliers = (): Supplier[] => {
    return suppliers.filter(supplier => (supplier.is_active));
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

  useEffect(() => {
    fetchSuppliers();
    const channel = supabase.channel('suppliers-changes');
    // Real-time not configured for this schema in demo - skip subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    // No background updates in demo
  }, [suppliers.length]);

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,

    // CRUD operations
    createSupplier,
    updateSupplier,
    deleteSupplier,
    deactivateSupplier,
    getSupplierById,

    // Search and filtering
    searchSuppliers,
    getActiveSuppliers,
    getSuppliersBySpecialty,
    getTopPerformingSuppliers,

    // Performance tracking (stubs)
    getSupplierPerformance,
    getSupplierAnalytics,
    updateSupplierPerformanceMetrics,
    calculateSupplierRating
  };
}