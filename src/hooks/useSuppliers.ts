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

export function useSuppliers(showArchived = false) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    if (!user || !profile?.organization_id) {
      setSuppliers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('organizations')
        .select(`
          *,
          contacts:contacts!organization_id(
            id,
            contact_name,
            email,
            phone,
            role,
            is_primary_contact
          )
        `)
        .eq('organization_type', 'supplier');

      // Filter by active status based on showArchived parameter
      if (!showArchived) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query.order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching suppliers:', fetchError);
        setError(fetchError.message);
        return;
      }

      const mapped: Supplier[] = (data || []).map((org: any) => {
        const primaryContact = org.contacts?.find((c: any) => c.is_primary_contact) || org.contacts?.[0];
        return {
          id: org.id,
          name: primaryContact?.contact_name || org.name,
          company: org.name,
          email: primaryContact?.email ?? undefined,
          phone: primaryContact?.phone ?? undefined,
          address: org.address ?? undefined,
          country: org.country ?? undefined,
          specialties: [] as any, // Will be populated from organization data if needed
          rating: 4.0, // Default rating, can be enhanced later
          response_rate: 0,
          is_active: org.is_active ?? true,
          created_at: org.created_at,
          updated_at: org.updated_at,
          total_quotes_sent: 0,
          total_quotes_received: 0,
          average_turnaround_days: 0,
          tags: [],
        };
      });

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
      // First create the organization
      const orgData: any = {
        name: supplierData.company || supplierData.name,
        organization_type: 'supplier',
        address: supplierData.address,
        country: supplierData.country,
        is_active: true,
      };

      const { data: orgDataResult, error: orgError } = await supabase
        .from('organizations')
        .insert([orgData])
        .select('*')
        .single();

      if (orgError) {
        console.error('Error creating supplier organization:', orgError);
        throw orgError;
      }

      // Then create a contact for this organization
      const contactData: any = {
        organization_id: orgDataResult.id,
        type: 'supplier',
        company_name: supplierData.company || supplierData.name,
        contact_name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        is_primary_contact: true,
        is_active: true,
      };

      const { data: contactResult, error: contactError } = await supabase
        .from('contacts')
        .insert([contactData])
        .select('*')
        .single();

      if (contactError) {
        console.error('Error creating supplier contact:', contactError);
        throw contactError;
      }

      const data = { ...orgDataResult, contacts: [contactResult] };

      // Map to app type and add to local state
      const mapped: Supplier = {
        id: data.id,
        name: data.contacts?.[0]?.contact_name || data.name,
        company: data.name,
        email: data.contacts?.[0]?.email ?? undefined,
        phone: data.contacts?.[0]?.phone ?? undefined,
        address: data.address ?? undefined,
        country: data.country ?? undefined,
        specialties: [] as any,
        rating: 4.0,
        response_rate: 0,
        is_active: data.is_active ?? true,
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
        description: `${data.contact_name || data.company_name} has been added to your supplier list`,
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

  const archiveSupplier = async (supplierId: string): Promise<boolean> => {
    try {
      // Archive the organization
      const { error: orgError } = await supabase
        .from('organizations')
        .update({ is_active: false })
        .eq('id', supplierId);

      if (orgError) {
        console.error('Error archiving supplier organization:', orgError);
        throw orgError;
      }

      // Also archive all associated contacts
      const { error: contactError } = await supabase
        .from('contacts')
        .update({ is_active: false })
        .eq('organization_id', supplierId)
        .eq('type', 'supplier');

      if (contactError) {
        console.error('Error archiving supplier contacts:', contactError);
        throw contactError;
      }

      // Update local state
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));

      toast({
        title: "Supplier Archived",
        description: "Supplier has been archived successfully",
      });

      return true;
    } catch (err) {
      console.error('Error in archiveSupplier:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive supplier",
      });
      return false;
    }
  };

  const unarchiveSupplier = async (supplierId: string): Promise<Supplier> => {
    try {
      // Unarchive the organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .update({ is_active: true })
        .eq('id', supplierId)
        .select(`
          *,
          contacts:contacts!organization_id(
            id,
            contact_name,
            email,
            phone,
            role,
            is_primary_contact
          )
        `)
        .single();

      if (orgError) {
        console.error('Error unarchiving supplier organization:', orgError);
        throw orgError;
      }

      // Also unarchive all associated contacts
      const { error: contactError } = await supabase
        .from('contacts')
        .update({ is_active: true })
        .eq('organization_id', supplierId)
        .eq('type', 'supplier');

      if (contactError) {
        console.error('Error unarchiving supplier contacts:', contactError);
        throw contactError;
      }

      // Map to Supplier type and add to local state
      const primaryContact = orgData.contacts?.find((c: any) => c.is_primary_contact) || orgData.contacts?.[0];
      const unarchivedSupplier: Supplier = {
        id: orgData.id,
        name: primaryContact?.contact_name || orgData.name,
        company: orgData.name,
        email: primaryContact?.email ?? undefined,
        phone: primaryContact?.phone ?? undefined,
        address: orgData.address ?? undefined,
        country: orgData.country ?? undefined,
        specialties: [] as any,
        rating: 4.0,
        response_rate: 0,
        is_active: true,
        created_at: orgData.created_at,
        updated_at: orgData.updated_at,
        total_quotes_sent: 0,
        total_quotes_received: 0,
        average_turnaround_days: 0,
        tags: [],
      };

      setSuppliers(prev => [unarchivedSupplier, ...prev]);

      toast({
        title: "Supplier Reactivated",
        description: "Supplier has been reactivated successfully",
      });

      return unarchivedSupplier;
    } catch (err) {
      console.error('Error in unarchiveSupplier:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reactivate supplier",
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
      .from('organizations')
      .select(`
        *,
        contacts:contacts!organization_id(
          id,
          contact_name,
          email,
          phone,
          role,
          is_primary_contact
        )
      `)
      .eq('id', id)
      .eq('organization_type', 'supplier')
      .single();

    if (error) {
      throw error;
    }

    const primaryContact = data.contacts?.find((c: any) => c.is_primary_contact) || data.contacts?.[0];

    return {
      id: data.id,
      name: primaryContact?.contact_name || data.name,
      company: data.name,
      email: primaryContact?.email ?? undefined,
      phone: primaryContact?.phone ?? undefined,
      address: data.address ?? undefined,
      country: data.country ?? undefined,
      specialties: [] as any,
      rating: 4.0,
      response_rate: 0,
      is_active: data.is_active ?? true,
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
  }, [user, profile]); // Added profile to dependency array

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
    archiveSupplier,
    unarchiveSupplier,
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