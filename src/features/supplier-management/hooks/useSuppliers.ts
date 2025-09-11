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
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

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

            const { data, error: fetchError } = await query.order('name', { ascending: true });

            if (fetchError) {
                console.error('Error fetching suppliers:', fetchError);
                setError(fetchError.message);
                return;
            }

            // Transform the data to match Supplier interface
            const transformedSuppliers = (data || []).map(org => ({
                id: org.id,
                company_name: org.name,
                contact_name: org.contacts?.[0]?.contact_name || '',
                email: org.contacts?.[0]?.email || '',
                phone: org.contacts?.[0]?.phone || '',
                address: org.address || '',
                city: org.city || '',
                state: org.state || '',
                country: org.country || '',
                postal_code: org.postal_code || '',
                website: org.website || '',
                tax_id: org.tax_id || '',
                payment_terms: org.payment_terms || '',
                credit_limit: org.credit_limit || 0,
                notes: org.notes || '',
                is_active: org.is_active,
                created_at: org.created_at,
                updated_at: org.updated_at,
                // Additional fields for compatibility
                organization_id: org.id,
                organization_type: org.organization_type,
                created_by: org.created_by,
                // Supplier-specific fields
                capabilities: org.capabilities || [],
                certifications: org.certifications || [],
                performance_rating: org.performance_rating || 0,
                last_evaluation_date: org.last_evaluation_date,
                preferred_contact_method: org.preferred_contact_method || 'email'
            }));

            setSuppliers(transformedSuppliers);
        } catch (err) {
            console.error('Error in fetchSuppliers:', err);
            setError('Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    };

    const createSupplier = async (supplierData: CreateSupplierRequest): Promise<Supplier> => {
        if (!user || !profile?.organization_id) {
            throw new Error('User must be authenticated to create suppliers');
        }

        try {
            setLoading(true);
            setError(null);

            // Create organization first
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: supplierData.company_name,
                    organization_type: 'supplier',
                    address: supplierData.address,
                    city: supplierData.city,
                    state: supplierData.state,
                    country: supplierData.country,
                    postal_code: supplierData.postal_code,
                    website: supplierData.website,
                    tax_id: supplierData.tax_id,
                    payment_terms: supplierData.payment_terms,
                    credit_limit: supplierData.credit_limit,
                    notes: supplierData.notes,
                    capabilities: supplierData.capabilities,
                    certifications: supplierData.certifications,
                    performance_rating: supplierData.performance_rating,
                    last_evaluation_date: supplierData.last_evaluation_date,
                    preferred_contact_method: supplierData.preferred_contact_method,
                    is_active: true,
                    created_by: user.id
                })
                .select()
                .single();

            if (orgError) {
                throw orgError;
            }

            // Create contact for the organization
            const { data: contactData, error: contactError } = await supabase
                .from('contacts')
                .insert({
                    organization_id: orgData.id,
                    type: 'supplier',
                    contact_name: supplierData.contact_name,
                    email: supplierData.email,
                    phone: supplierData.phone,
                    is_primary_contact: true,
                    is_active: true,
                    created_by: user.id
                })
                .select()
                .single();

            if (contactError) {
                throw contactError;
            }

            const newSupplier: Supplier = {
                id: orgData.id,
                company_name: orgData.name,
                contact_name: contactData.contact_name,
                email: contactData.email,
                phone: contactData.phone,
                address: orgData.address,
                city: orgData.city,
                state: orgData.state,
                country: orgData.country,
                postal_code: orgData.postal_code,
                website: orgData.website,
                tax_id: orgData.tax_id,
                payment_terms: orgData.payment_terms,
                credit_limit: orgData.credit_limit,
                notes: orgData.notes,
                is_active: orgData.is_active,
                created_at: orgData.created_at,
                updated_at: orgData.updated_at,
                organization_id: orgData.id,
                organization_type: orgData.organization_type,
                created_by: orgData.created_by,
                capabilities: orgData.capabilities,
                certifications: orgData.certifications,
                performance_rating: orgData.performance_rating,
                last_evaluation_date: orgData.last_evaluation_date,
                preferred_contact_method: orgData.preferred_contact_method
            };

            setSuppliers(prev => [newSupplier, ...prev]);

            toast({
                title: "Supplier Created",
                description: `Supplier ${newSupplier.company_name} has been created successfully.`,
            });

            return newSupplier;
        } catch (error) {
            console.error('Error creating supplier:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            toast({
                title: "Supplier Creation Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateSupplier = async (supplierId: string, updates: UpdateSupplierRequest): Promise<Supplier> => {
        if (!user || !profile?.organization_id) {
            throw new Error('User must be authenticated to update suppliers');
        }

        try {
            setLoading(true);
            setError(null);

            // Update organization
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .update({
                    name: updates.company_name,
                    address: updates.address,
                    city: updates.city,
                    state: updates.state,
                    country: updates.country,
                    postal_code: updates.postal_code,
                    website: updates.website,
                    tax_id: updates.tax_id,
                    payment_terms: updates.payment_terms,
                    credit_limit: updates.credit_limit,
                    notes: updates.notes,
                    capabilities: updates.capabilities,
                    certifications: updates.certifications,
                    performance_rating: updates.performance_rating,
                    last_evaluation_date: updates.last_evaluation_date,
                    preferred_contact_method: updates.preferred_contact_method,
                    updated_at: new Date().toISOString()
                })
                .eq('id', supplierId)
                .select()
                .single();

            if (orgError) {
                throw orgError;
            }

            // Update primary contact if contact info is provided
            if (updates.contact_name || updates.email || updates.phone) {
                const { error: contactError } = await supabase
                    .from('contacts')
                    .update({
                        contact_name: updates.contact_name,
                        email: updates.email,
                        phone: updates.phone,
                        updated_at: new Date().toISOString()
                    })
                    .eq('organization_id', supplierId)
                    .eq('is_primary_contact', true);

                if (contactError) {
                    console.warn('Error updating contact:', contactError);
                }
            }

            // Fetch updated supplier with contact info
            const { data: updatedSupplier, error: fetchError } = await supabase
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
                .eq('id', supplierId)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            const transformedSupplier: Supplier = {
                id: updatedSupplier.id,
                company_name: updatedSupplier.name,
                contact_name: updatedSupplier.contacts?.[0]?.contact_name || '',
                email: updatedSupplier.contacts?.[0]?.email || '',
                phone: updatedSupplier.contacts?.[0]?.phone || '',
                address: updatedSupplier.address,
                city: updatedSupplier.city,
                state: updatedSupplier.state,
                country: updatedSupplier.country,
                postal_code: updatedSupplier.postal_code,
                website: updatedSupplier.website,
                tax_id: updatedSupplier.tax_id,
                payment_terms: updatedSupplier.payment_terms,
                credit_limit: updatedSupplier.credit_limit,
                notes: updatedSupplier.notes,
                is_active: updatedSupplier.is_active,
                created_at: updatedSupplier.created_at,
                updated_at: updatedSupplier.updated_at,
                organization_id: updatedSupplier.id,
                organization_type: updatedSupplier.organization_type,
                created_by: updatedSupplier.created_by,
                capabilities: updatedSupplier.capabilities,
                certifications: updatedSupplier.certifications,
                performance_rating: updatedSupplier.performance_rating,
                last_evaluation_date: updatedSupplier.last_evaluation_date,
                preferred_contact_method: updatedSupplier.preferred_contact_method
            };

            setSuppliers(prev =>
                prev.map(supplier =>
                    supplier.id === supplierId ? transformedSupplier : supplier
                )
            );

            toast({
                title: "Supplier Updated",
                description: `Supplier ${transformedSupplier.company_name} has been updated successfully.`,
            });

            return transformedSupplier;
        } catch (error) {
            console.error('Error updating supplier:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            toast({
                title: "Supplier Update Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteSupplier = async (supplierId: string): Promise<void> => {
        if (!user || !profile?.organization_id) {
            throw new Error('User must be authenticated to delete suppliers');
        }

        try {
            setLoading(true);
            setError(null);

            // Soft delete by setting is_active to false
            const { error } = await supabase
                .from('organizations')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', supplierId);

            if (error) {
                throw error;
            }

            setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));

            toast({
                title: "Supplier Deleted",
                description: "Supplier has been deleted successfully.",
            });
        } catch (error) {
            console.error('Error deleting supplier:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            toast({
                title: "Supplier Deletion Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const searchSuppliers = async (criteria: SupplierSearchCriteria): Promise<Supplier[]> => {
        if (!user || !profile?.organization_id) {
            return [];
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
                .eq('organization_type', 'supplier')
                .eq('is_active', true);

            if (criteria.company_name) {
                query = query.ilike('name', `%${criteria.company_name}%`);
            }

            if (criteria.country) {
                query = query.ilike('country', `%${criteria.country}%`);
            }

            if (criteria.capabilities && criteria.capabilities.length > 0) {
                query = query.contains('capabilities', criteria.capabilities);
            }

            const { data, error: fetchError } = await query.order('name', { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            // Transform the data to match Supplier interface
            const transformedSuppliers = (data || []).map(org => ({
                id: org.id,
                company_name: org.name,
                contact_name: org.contacts?.[0]?.contact_name || '',
                email: org.contacts?.[0]?.email || '',
                phone: org.contacts?.[0]?.phone || '',
                address: org.address || '',
                city: org.city || '',
                state: org.state || '',
                country: org.country || '',
                postal_code: org.postal_code || '',
                website: org.website || '',
                tax_id: org.tax_id || '',
                payment_terms: org.payment_terms || '',
                credit_limit: org.credit_limit || 0,
                notes: org.notes || '',
                is_active: org.is_active,
                created_at: org.created_at,
                updated_at: org.updated_at,
                organization_id: org.id,
                organization_type: org.organization_type,
                created_by: org.created_by,
                capabilities: org.capabilities,
                certifications: org.certifications,
                performance_rating: org.performance_rating,
                last_evaluation_date: org.last_evaluation_date,
                preferred_contact_method: org.preferred_contact_method
            }));

            return transformedSuppliers;
        } catch (error) {
            console.error('Error searching suppliers:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getSupplierPerformanceMetrics = async (supplierId: string): Promise<SupplierPerformanceMetrics | null> => {
        try {
            // This would typically fetch performance metrics from a separate table or service
            // For now, return a placeholder
            return {
                supplier_id: supplierId,
                on_time_delivery_rate: 0.95,
                quality_score: 4.2,
                cost_competitiveness: 3.8,
                communication_rating: 4.0,
                overall_rating: 4.0,
                total_orders: 0,
                successful_orders: 0,
                average_delivery_time: 0,
                last_evaluation_date: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching supplier performance metrics:', error);
            return null;
        }
    };

    const getSupplierAnalytics = async (): Promise<SupplierAnalytics> => {
        try {
            // This would typically fetch analytics data from multiple sources
            // For now, return placeholder data
            return {
                total_suppliers: suppliers.length,
                active_suppliers: suppliers.filter(s => s.is_active).length,
                average_performance_rating: 0,
                top_performing_suppliers: [],
                suppliers_by_capability: {},
                suppliers_by_country: {},
                recent_evaluations: []
            };
        } catch (error) {
            console.error('Error fetching supplier analytics:', error);
            return {
                total_suppliers: 0,
                active_suppliers: 0,
                average_performance_rating: 0,
                top_performing_suppliers: [],
                suppliers_by_capability: {},
                suppliers_by_country: {},
                recent_evaluations: []
            };
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [user, profile?.organization_id, showArchived]);

    return {
        suppliers,
        loading,
        error,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        searchSuppliers,
        getSupplierPerformanceMetrics,
        getSupplierAnalytics
    };
}
