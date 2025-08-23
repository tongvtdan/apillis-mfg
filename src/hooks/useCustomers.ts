import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CreateCustomerRequest {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    country?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> { }

export interface CustomerSearchCriteria {
    name?: string;
    company?: string;
    email?: string;
    country?: string;
}

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchCustomers = async () => {
        if (!user) {
            setCustomers([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Error fetching customers:', fetchError);
                setError(fetchError.message);
                return;
            }

            setCustomers(data || []);
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
                .from('customers')
                .insert([customerData])
                .select('*')
                .single();

            if (error) {
                throw error;
            }

            setCustomers(prev => [data, ...prev]);

            toast({
                title: "Customer Created",
                description: `${data.name} has been added successfully.`,
            });

            return data;
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
                .from('customers')
                .update(updates)
                .eq('id', id)
                .select('*')
                .single();

            if (error) {
                throw error;
            }

            setCustomers(prev => prev.map(customer =>
                customer.id === id ? data : customer
            ));

            toast({
                title: "Customer Updated",
                description: `${data.name} has been updated successfully.`,
            });

            return data;
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
                .from('customers')
                .delete()
                .eq('id', id);

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
                .from('customers')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                throw error;
            }

            return data;
        } catch (err) {
            console.error('Error fetching customer by ID:', err);
            return null;
        }
    };

    const searchCustomers = async (criteria: CustomerSearchCriteria): Promise<Customer[]> => {
        try {
            let query = supabase.from('customers').select('*');

            if (criteria.name) {
                query = query.ilike('name', `%${criteria.name}%`);
            }
            if (criteria.company) {
                query = query.ilike('company', `%${criteria.company}%`);
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

            return data || [];
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
          customer:customers(*)
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
                    table: 'customers'
                },
                (payload) => {
                    console.log('Customer change received:', payload);

                    if (payload.eventType === 'INSERT') {
                        setCustomers(prev => [payload.new as Customer, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setCustomers(prev => prev.map(customer =>
                            customer.id === (payload.new as Customer).id
                                ? payload.new as Customer
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
    }, [user]);

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