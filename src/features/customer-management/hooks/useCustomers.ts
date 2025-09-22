import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/project';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

export interface CreateCustomerRequest {
    company_name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    website?: string;
    tax_id?: string;
    payment_terms?: string;
    credit_limit?: number;
    notes?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> { }

export interface CustomerSearchCriteria {
    company_name?: string;
    contact_name?: string;
    email?: string;
    country?: string;
}

export function useCustomers(showArchived = false) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth(); // Added profile
    const { toast } = useToast();

    const fetchCustomers = async () => {
        if (!user || !profile?.organization_id) { // Added profile check
            setCustomers([]);
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
                .eq('organization_type', 'customer');

            // Filter by active status based on showArchived parameter
            if (!showArchived) {
                query = query.eq('is_active', true);
            }

            const { data, error: fetchError } = await query.order('name', { ascending: true });

            if (fetchError) {
                console.error('Error fetching customers:', fetchError);
                setError(fetchError.message);
                return;
            }

            // Transform the data to match Customer interface
            const transformedCustomers = (data || []).map(org => ({
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
                created_by: org.created_by
            }));

            setCustomers(transformedCustomers);
        } catch (err) {
            console.error('Error in fetchCustomers:', err);
            setError('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const createCustomer = async (customerData: CreateCustomerRequest): Promise<Customer> => {
        if (!user || !profile?.organization_id) {
            throw new Error('User must be authenticated to create customers');
        }

        try {
            setLoading(true);
            setError(null);

            // Create organization first
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: customerData.company_name,
                    organization_type: 'customer',
                    address: customerData.address,
                    city: customerData.city,
                    state: customerData.state,
                    country: customerData.country,
                    postal_code: customerData.postal_code,
                    website: customerData.website,
                    tax_id: customerData.tax_id,
                    payment_terms: customerData.payment_terms,
                    credit_limit: customerData.credit_limit,
                    notes: customerData.notes,
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
                    type: 'customer',
                    contact_name: customerData.contact_name,
                    email: customerData.email,
                    phone: customerData.phone,
                    is_primary_contact: true,
                    is_active: true,
                    created_by: user.id
                })
                .select()
                .single();

            if (contactError) {
                throw contactError;
            }

            const newCustomer: Customer = {
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
                created_by: orgData.created_by
            };

            setCustomers(prev => [newCustomer, ...prev]);

            toast({
                title: "Customer Created",
                description: `Customer ${newCustomer.company_name} has been created successfully.`,
            });

            return newCustomer;
        } catch (error) {
            console.error('Error creating customer:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            toast({
                title: "Customer Creation Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateCustomer = async (customerId: string, updates: UpdateCustomerRequest): Promise<Customer> => {
        if (!user || !profile?.organization_id) {
            throw new Error('User must be authenticated to update customers');
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
                    updated_at: new Date().toISOString()
                })
                .eq('id', customerId)
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
                    .eq('organization_id', customerId)
                    .eq('is_primary_contact', true);

                if (contactError) {
                    console.warn('Error updating contact:', contactError);
                }
            }

            // Fetch updated customer with contact info
            const { data: updatedCustomer, error: fetchError } = await supabase
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
                .eq('id', customerId)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            const transformedCustomer: Customer = {
                id: updatedCustomer.id,
                company_name: updatedCustomer.name,
                contact_name: updatedCustomer.contacts?.[0]?.contact_name || '',
                email: updatedCustomer.contacts?.[0]?.email || '',
                phone: updatedCustomer.contacts?.[0]?.phone || '',
                address: updatedCustomer.address,
                city: updatedCustomer.city,
                state: updatedCustomer.state,
                country: updatedCustomer.country,
                postal_code: updatedCustomer.postal_code,
                website: updatedCustomer.website,
                tax_id: updatedCustomer.tax_id,
                payment_terms: updatedCustomer.payment_terms,
                credit_limit: updatedCustomer.credit_limit,
                notes: updatedCustomer.notes,
                is_active: updatedCustomer.is_active,
                created_at: updatedCustomer.created_at,
                updated_at: updatedCustomer.updated_at,
                organization_id: updatedCustomer.id,
                organization_type: updatedCustomer.organization_type,
                created_by: updatedCustomer.created_by
            };

            setCustomers(prev =>
                prev.map(customer =>
                    customer.id === customerId ? transformedCustomer : customer
                )
            );

            toast({
                title: "Customer Updated",
                description: `Customer ${transformedCustomer.company_name} has been updated successfully.`,
            });

            return transformedCustomer;
        } catch (error) {
            console.error('Error updating customer:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            toast({
                title: "Customer Update Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteCustomer = async (customerId: string): Promise<void> => {
        if (!user || !profile?.organization_id) {
            throw new Error('User must be authenticated to delete customers');
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
                .eq('id', customerId);

            if (error) {
                throw error;
            }

            setCustomers(prev => prev.filter(customer => customer.id !== customerId));

            toast({
                title: "Customer Deleted",
                description: "Customer has been deleted successfully.",
            });
        } catch (error) {
            console.error('Error deleting customer:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            toast({
                title: "Customer Deletion Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const searchCustomers = async (criteria: CustomerSearchCriteria): Promise<Customer[]> => {
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
                .eq('organization_type', 'customer')
                .eq('is_active', true);

            if (criteria.company_name) {
                query = query.ilike('name', `%${criteria.company_name}%`);
            }

            if (criteria.country) {
                query = query.ilike('country', `%${criteria.country}%`);
            }

            const { data, error: fetchError } = await query.order('name', { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            // Transform the data to match Customer interface
            const transformedCustomers = (data || []).map(org => ({
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
                created_by: org.created_by
            }));

            return transformedCustomers;
        } catch (error) {
            console.error('Error searching customers:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [user, profile?.organization_id, showArchived]);

    return {
        customers,
        loading,
        error,
        fetchCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        searchCustomers
    };
}
