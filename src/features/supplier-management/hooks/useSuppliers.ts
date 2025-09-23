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
            const transformedSuppliers = (data || []).map((org) => {
                // Determine supplier status based on available data
                // For now, we'll use the is_active flag and metadata to determine status
                let status: 'qualified' | 'expiring_soon' | 'not_qualified' | 'in_progress' = 'not_qualified';
                let expiryDate: string | undefined;

                if (org.is_active) {
                    // Check if we have performance rating to determine if qualified
                    if (org.performance_rating && org.performance_rating > 0) {
                        status = 'qualified';
                        // Set a default expiry date (1 year from now for demo purposes)
                        const oneYearFromNow = new Date();
                        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                        expiryDate = oneYearFromNow.toISOString().split('T')[0];
                    } else {
                        status = 'in_progress';
                    }
                }

                // Get performance metrics from organization metadata or default values
                const performance = {
                    rating: org.performance_rating || 0,
                    responseRate: org.metadata?.responseRate || 0,
                    turnaroundDays: org.metadata?.turnaroundDays || 0,
                    qualityScore: org.metadata?.qualityScore || 0,
                    costCompetitiveness: org.metadata?.costCompetitiveness || 0
                };

                // Determine supplier type from capabilities
                const capabilities = org.metadata?.capabilities || org.capabilities || [];
                let supplierType: 'manufacturer' | 'distributor' | 'service_provider' | 'raw_material' | 'component' = 'manufacturer';

                if (capabilities.some((cap: string) => cap.toLowerCase().includes('distribut'))) {
                    supplierType = 'distributor';
                } else if (capabilities.some((cap: string) => cap.toLowerCase().includes('service'))) {
                    supplierType = 'service_provider';
                } else if (capabilities.some((cap: string) => cap.toLowerCase().includes('raw'))) {
                    supplierType = 'raw_material';
                } else if (capabilities.some((cap: string) => cap.toLowerCase().includes('component'))) {
                    supplierType = 'component';
                }

                return {
                    id: org.id,
                    name: org.contacts?.[0]?.contact_name || org.name || 'Unnamed Supplier',
                    company: org.name,
                    email: org.contacts?.[0]?.email || '',
                    phone: org.contacts?.[0]?.phone || '',
                    address: org.address || '',
                    country: org.country || '',
                    specialties: org.metadata?.capabilities || org.capabilities || [],
                    status,
                    expiryDate,
                    capabilities: org.metadata?.capabilities || org.capabilities || [],
                    performance,
                    supplierType,
                    lastActivity: org.updated_at || org.created_at,
                    annualSpend: org.metadata?.annualSpend || 0,
                    paymentTerms: org.payment_terms || '',
                    is_active: org.is_active,
                    created_at: org.created_at,
                    updated_at: org.updated_at,
                    created_by: org.created_by,
                    updated_by: org.updated_by,
                    // Enhanced tracking fields
                    last_contact_date: org.last_evaluation_date,
                    total_quotes_sent: 0,
                    total_quotes_received: 0,
                    average_turnaround_days: org.metadata?.turnaroundDays || 0,
                    notes: org.notes || '',
                    tags: org.certifications || [],
                    // Additional fields for compatibility with existing code
                    company_name: org.name,
                    contact_name: org.contacts?.[0]?.contact_name || '',
                    city: org.city || '',
                    state: org.state || '',
                    postal_code: org.postal_code || '',
                    website: org.website || '',
                    tax_id: org.tax_id || '',
                    credit_limit: org.credit_limit || 0,
                    organization_id: org.id,
                    organization_type: org.organization_type,
                    certifications: org.metadata?.certifications || org.certifications || [],
                    last_evaluation_date: org.last_evaluation_date,
                    preferred_contact_method: org.preferred_contact_method || 'email'
                };
            });

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
                    name: supplierData.company || supplierData.name,
                    organization_type: 'supplier',
                    address: supplierData.address,
                    country: supplierData.country,
                    notes: supplierData.notes,
                    capabilities: supplierData.specialties,
                    certifications: supplierData.tags,
                    performance_rating: supplierData.rating || 0,
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
                    contact_name: supplierData.name,
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
                name: contactData.contact_name || orgData.name || 'Unnamed Supplier',
                company: orgData.name,
                email: contactData.email,
                phone: contactData.phone,
                address: orgData.address,
                country: orgData.country,
                specialties: orgData.capabilities || [],
                rating: orgData.performance_rating || 0,
                response_rate: 0,
                is_active: orgData.is_active,
                created_at: orgData.created_at,
                updated_at: orgData.updated_at,
                created_by: orgData.created_by,
                updated_by: orgData.updated_by,
                // Enhanced tracking fields
                last_contact_date: orgData.last_evaluation_date,
                total_quotes_sent: 0,
                total_quotes_received: 0,
                average_turnaround_days: 0,
                notes: orgData.notes || '',
                tags: orgData.certifications || [],
                // Additional fields for compatibility
                company_name: orgData.name,
                contact_name: contactData.contact_name,
                city: orgData.city,
                state: orgData.state,
                postal_code: orgData.postal_code,
                website: orgData.website,
                tax_id: orgData.tax_id,
                payment_terms: orgData.payment_terms,
                credit_limit: orgData.credit_limit,
                organization_id: orgData.id,
                organization_type: orgData.organization_type,
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
                    name: updates.company || updates.name,
                    address: updates.address,
                    country: updates.country,
                    notes: updates.notes,
                    capabilities: updates.specialties,
                    certifications: updates.tags,
                    performance_rating: updates.rating,
                    updated_at: new Date().toISOString()
                })
                .eq('id', supplierId)
                .select()
                .single();

            if (orgError) {
                throw orgError;
            }

            // Update primary contact if contact info is provided
            if (updates.name || updates.email || updates.phone) {
                const { error: contactError } = await supabase
                    .from('contacts')
                    .update({
                        contact_name: updates.name,
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
                name: updatedSupplier.contacts?.[0]?.contact_name || updatedSupplier.name || 'Unnamed Supplier',
                company: updatedSupplier.name,
                email: updatedSupplier.contacts?.[0]?.email || '',
                phone: updatedSupplier.contacts?.[0]?.phone || '',
                address: updatedSupplier.address,
                country: updatedSupplier.country,
                specialties: updatedSupplier.capabilities || [],
                rating: updatedSupplier.performance_rating || 0,
                response_rate: 0,
                is_active: updatedSupplier.is_active,
                created_at: updatedSupplier.created_at,
                updated_at: updatedSupplier.updated_at,
                created_by: updatedSupplier.created_by,
                updated_by: updatedSupplier.updated_by,
                // Enhanced tracking fields
                last_contact_date: updatedSupplier.last_evaluation_date,
                total_quotes_sent: 0,
                total_quotes_received: 0,
                average_turnaround_days: 0,
                notes: updatedSupplier.notes || '',
                tags: updatedSupplier.certifications || [],
                // Additional fields for compatibility
                company_name: updatedSupplier.name,
                contact_name: updatedSupplier.contacts?.[0]?.contact_name || '',
                city: updatedSupplier.city,
                state: updatedSupplier.state,
                postal_code: updatedSupplier.postal_code,
                website: updatedSupplier.website,
                tax_id: updatedSupplier.tax_id,
                payment_terms: updatedSupplier.payment_terms,
                credit_limit: updatedSupplier.credit_limit,
                organization_id: updatedSupplier.id,
                organization_type: updatedSupplier.organization_type,
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

    const archiveSupplier = async (supplierId: string): Promise<void> => {
        if (!user || !profile?.organization_id) {
            throw new Error('User must be authenticated to archive suppliers');
        }

        try {
            setLoading(true);
            setError(null);

            // Archive by setting is_active to false
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
                title: "Supplier Archived",
                description: "Supplier has been archived successfully.",
            });
        } catch (error) {
            console.error('Error archiving supplier:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            toast({
                title: "Supplier Archive Failed",
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

            if (criteria.name) {
                query = query.ilike('name', `%${criteria.name}%`);
            }

            if (criteria.country) {
                query = query.ilike('country', `%${criteria.country}%`);
            }

            if (criteria.specialties && criteria.specialties.length > 0) {
                query = query.contains('capabilities', criteria.specialties);
            }

            const { data, error: fetchError } = await query.order('name', { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            // Transform the data to match Supplier interface
            const transformedSuppliers = (data || []).map((org) => {
                // Determine supplier status based on available data
                let status: 'qualified' | 'expiring_soon' | 'not_qualified' | 'in_progress' = 'not_qualified';
                let expiryDate: string | undefined;

                if (org.is_active) {
                    if (org.performance_rating && org.performance_rating > 0) {
                        status = 'qualified';
                        const oneYearFromNow = new Date();
                        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                        expiryDate = oneYearFromNow.toISOString().split('T')[0];
                    } else {
                        status = 'in_progress';
                    }
                }

                // Get performance metrics from organization metadata or default values
                const performance = {
                    rating: org.performance_rating || 0,
                    responseRate: org.metadata?.responseRate || 0,
                    turnaroundDays: org.metadata?.turnaroundDays || 0,
                    qualityScore: org.metadata?.qualityScore || 0,
                    costCompetitiveness: org.metadata?.costCompetitiveness || 0
                };

                // Determine supplier type from capabilities
                const capabilities = org.metadata?.capabilities || org.capabilities || [];
                let supplierType: 'manufacturer' | 'distributor' | 'service_provider' | 'raw_material' | 'component' = 'manufacturer';

                if (capabilities.some((cap: string) => cap.toLowerCase().includes('distribut'))) {
                    supplierType = 'distributor';
                } else if (capabilities.some((cap: string) => cap.toLowerCase().includes('service'))) {
                    supplierType = 'service_provider';
                } else if (capabilities.some((cap: string) => cap.toLowerCase().includes('raw'))) {
                    supplierType = 'raw_material';
                } else if (capabilities.some((cap: string) => cap.toLowerCase().includes('component'))) {
                    supplierType = 'component';
                }

                return {
                    id: org.id,
                    name: org.contacts?.[0]?.contact_name || org.name || 'Unnamed Supplier',
                    company: org.name,
                    email: org.contacts?.[0]?.email || '',
                    phone: org.contacts?.[0]?.phone || '',
                    address: org.address || '',
                    country: org.country || '',
                    specialties: org.metadata?.capabilities || org.capabilities || [],
                    status,
                    expiryDate,
                    capabilities: org.metadata?.capabilities || org.capabilities || [],
                    performance,
                    supplierType,
                    lastActivity: org.updated_at || org.created_at,
                    annualSpend: org.metadata?.annualSpend || 0,
                    paymentTerms: org.payment_terms || '',
                    is_active: org.is_active,
                    created_at: org.created_at,
                    updated_at: org.updated_at,
                    created_by: org.created_by,
                    updated_by: org.updated_by,
                    // Enhanced tracking fields
                    last_contact_date: org.last_evaluation_date,
                    total_quotes_sent: 0,
                    total_quotes_received: 0,
                    average_turnaround_days: org.metadata?.turnaroundDays || 0,
                    notes: org.notes || '',
                    tags: org.certifications || [],
                    // Additional fields for compatibility with existing code
                    company_name: org.name,
                    contact_name: org.contacts?.[0]?.contact_name || '',
                    city: org.city || '',
                    state: org.state || '',
                    postal_code: org.postal_code || '',
                    website: org.website || '',
                    tax_id: org.tax_id || '',
                    credit_limit: org.credit_limit || 0,
                    organization_id: org.id,
                    organization_type: org.organization_type,
                    certifications: org.metadata?.certifications || org.certifications || [],
                    last_evaluation_date: org.last_evaluation_date,
                    preferred_contact_method: org.preferred_contact_method || 'email'
                };
            });

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
        archiveSupplier,
        searchSuppliers,
        getSupplierPerformanceMetrics,
        getSupplierAnalytics
    };
}
