import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

export function useCustomers() {
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

            const { data, error: fetchError } = await supabase
                .from('contacts')
                .select('*')
                .eq('type', 'customer')
                .eq('organization_id', profile.organization_id) // Added organization_id filter
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Error fetching customers:', fetchError);
                setError(fetchError.message);
                return;
            }

            // Transform contacts to Customer type
            const customerData = (data || []).map(contact => ({
                ...contact,
                type: 'customer' as const
            }));

            setCustomers(customerData);
        } catch (err) {
            console.error('Error in fetchCustomers:', err);
            setError('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const createCustomer = async (customerData: CreateCustomerRequest): Promise<Customer> => {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .insert([{ 
                    ...customerData, 
                    type: 'customer',
                    organization_id: profile?.organization_id // Added organization_id
                }])
                .select('*')
                .single();

            if (error) {
                throw error;
            }

            const newCustomer = { ...data, type: 'customer' as const };
            setCustomers(prev => [newCustomer, ...prev]);

            toast({
                title: "Customer Created",
                description: `${data.company_name} has been added successfully.`,
            });

            return newCustomer;
        } catch (err) {
            console.error('Error creating customer:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create customer",
            });
            throw err;
        }
    };

    const updateCustomer = async (id: string, updates: UpdateCustomerRequest): Promise<Customer> => {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .update(updates)
                .eq('id', id)
                .eq('type', 'customer')
                .select('*')
                .single();

            if (error) {
                throw error;
            }

            const updatedCustomer = { ...data, type: 'customer' as const };
            setCustomers(prev => prev.map(customer =>
                customer.id === id ? updatedCustomer : customer
            ));

            toast({
                title: "Customer Updated",
                description: `${data.company_name} has been updated successfully.`,
            });

            return updatedCustomer;
        } catch (err) {
            console.error('Error updating customer:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update customer",
            });
            throw err;
        }
    };

    const deleteCustomer = async (id: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('id', id)
                .eq('type', 'customer');

            if (error) {
                throw error;
            }

            setCustomers(prev => prev.filter(customer => customer.id !== id));

            toast({
                title: "Customer Deleted",
                description: "Customer has been removed successfully.",
            });
        } catch (err) {
            console.error('Error deleting customer:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete customer",
            });
            throw err;
        }
    };

    const getCustomerById = async (id: string): Promise<Customer | null> => {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('id', id)
                .eq('type', 'customer')
                .single();

            if (error) {
                throw error;
            }

            return data ? { ...data, type: 'customer' as const } : null;
        } catch (err) {
            console.error('Error fetching customer by ID:', err);
            return null;
        }
    };

    const searchCustomers = async (criteria: CustomerSearchCriteria): Promise<Customer[]> => {
        try {
            let query = supabase
                .from('contacts')
                .select('*')
                .eq('type', 'customer')
                .eq('organization_id', profile?.organization_id); // Added organization_id filter

            if (criteria.company_name) {
                query = query.ilike('company_name', `%${criteria.company_name}%`);
            }
            if (criteria.contact_name) {
                query = query.ilike('contact_name', `%${criteria.contact_name}%`);
            }
            if (criteria.email) {
                query = query.ilike('email', `%${criteria.email}%`);
            }
            if (criteria.country) {
                query = query.ilike('country', `%${criteria.country}%`);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Transform contacts to Customer type
            return (data || []).map(contact => ({
                ...contact,
                type: 'customer' as const
            }));
        } catch (err) {
            console.error('Error searching customers:', err);
            return [];
        }
    };

    const getCustomerProjects = async (customerId: string) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          customer:contacts!customer_id(*)
        `)
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data || [];
        } catch (err) {
            console.error('Error fetching customer projects:', err);
            return [];
        }
    };

    // Set up real-time subscription
    useEffect(() => {
        fetchCustomers();

        const channel = supabase
            .channel('customers-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'contacts',
                    filter: 'type=eq.customer'
                },
                (payload) => {
                    console.log('Customer change received:', payload);

                    if (payload.eventType === 'INSERT') {
                        const newCustomer = { ...payload.new, type: 'customer' as const };
                        setCustomers(prev => [newCustomer, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedCustomer = { ...payload.new, type: 'customer' as const };
                        setCustomers(prev => prev.map(customer =>
                            customer.id === updatedCustomer.id
                                ? updatedCustomer
                                : customer
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setCustomers(prev => prev.filter(customer => customer.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, profile]); // Added profile to dependency array

    return {
        customers,
        loading,
        error,
        refetch: fetchCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        searchCustomers,
        getCustomerProjects
    };
}