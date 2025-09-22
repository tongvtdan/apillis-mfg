import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client.ts';
import { useAuth } from '@/core/auth';
import { CustomerSearchResult, ContactSearchResult } from '../types/intake.types';

export interface UseIntakeCustomersOptions {
    autoLoadContacts?: boolean;
}

export interface IntakeCustomerState {
    // Customer search
    customerSearchOpen: boolean;
    customerSearchQuery: string;
    customerSearchLoading: boolean;
    customerSearchResults: CustomerSearchResult[];

    // Customer creation
    customerCreationOpen: boolean;
    customerCreationLoading: boolean;

    // Contact management
    contactSearchOpen: boolean;
    selectedContacts: string[];
    contactSearchLoading: boolean;
    availableContacts: ContactSearchResult[];
    organizationContacts: ContactSearchResult[];

    // Errors
    customerError: string | null;
    contactError: string | null;
}

export function useIntakeCustomers(options: UseIntakeCustomersOptions = {}) {
    const { autoLoadContacts = true } = options;
    const { profile } = useAuth();

    const [state, setState] = useState<IntakeCustomerState>({
        customerSearchOpen: false,
        customerSearchQuery: '',
        customerSearchLoading: false,
        customerSearchResults: [],
        customerCreationOpen: false,
        customerCreationLoading: false,
        contactSearchOpen: false,
        selectedContacts: [],
        contactSearchLoading: false,
        availableContacts: [],
        organizationContacts: [],
        customerError: null,
        contactError: null
    });

    // Search customers by query
    const searchCustomers = useCallback(async (query: string) => {
        if (!query.trim() || !profile?.organization_id) return;

        setState(prev => ({ ...prev, customerSearchLoading: true, customerError: null }));

        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name, company, email, phone, country, website')
                .eq('organization_id', profile.organization_id)
                .or(`name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`)
                .limit(10);

            if (error) throw error;

            const results: CustomerSearchResult[] = data.map(org => ({
                id: org.id,
                name: org.name || '',
                company: org.company || '',
                email: org.email || '',
                phone: org.phone,
                country: org.country,
                website: org.website
            }));

            setState(prev => ({
                ...prev,
                customerSearchResults: results,
                customerSearchLoading: false
            }));

        } catch (error) {
            console.error('Customer search failed:', error);
            setState(prev => ({
                ...prev,
                customerSearchLoading: false,
                customerError: 'Failed to search customers'
            }));
        }
    }, [profile?.organization_id]);

    // Load contacts for selected customer
    const loadCustomerContacts = useCallback(async (customerId: string) => {
        if (!customerId) return;

        setState(prev => ({ ...prev, contactSearchLoading: true, contactError: null }));

        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('id, name, email, phone, position')
                .eq('organization_id', customerId)
                .order('name');

            if (error) throw error;

            const contacts: ContactSearchResult[] = data.map(contact => ({
                id: contact.id,
                name: contact.name || '',
                email: contact.email || '',
                phone: contact.phone,
                position: contact.position
            }));

            setState(prev => ({
                ...prev,
                organizationContacts: contacts,
                contactSearchLoading: false
            }));

        } catch (error) {
            console.error('Failed to load customer contacts:', error);
            setState(prev => ({
                ...prev,
                contactSearchLoading: false,
                contactError: 'Failed to load contacts'
            }));
        }
    }, []);

    // Create new customer
    const createCustomer = useCallback(async (customerData: {
        name: string;
        company: string;
        email: string;
        phone?: string;
        country?: string;
        website?: string;
    }) => {
        if (!profile?.organization_id) return null;

        setState(prev => ({ ...prev, customerCreationLoading: true }));

        try {
            const { data, error } = await supabase
                .from('organizations')
                .insert({
                    ...customerData,
                    organization_id: profile.organization_id,
                    type: 'customer',
                    created_by: profile.id,
                    updated_by: profile.id
                })
                .select()
                .single();

            if (error) throw error;

            setState(prev => ({
                ...prev,
                customerCreationLoading: false,
                customerCreationOpen: false,
                customerSearchOpen: false
            }));

            return data;

        } catch (error) {
            console.error('Customer creation failed:', error);
            setState(prev => ({
                ...prev,
                customerCreationLoading: false,
                customerError: 'Failed to create customer'
            }));
            return null;
        }
    }, [profile]);

    // Create new contact
    const createContact = useCallback(async (contactData: {
        name: string;
        email: string;
        phone?: string;
        position?: string;
        organizationId: string;
    }) => {
        setState(prev => ({ ...prev, contactSearchLoading: true }));

        try {
            const { data, error } = await supabase
                .from('contacts')
                .insert({
                    name: contactData.name,
                    email: contactData.email,
                    phone: contactData.phone,
                    position: contactData.position,
                    organization_id: contactData.organizationId,
                    created_by: profile?.id
                })
                .select()
                .single();

            if (error) throw error;

            // Reload contacts for the organization
            await loadCustomerContacts(contactData.organizationId);

            return data;

        } catch (error) {
            console.error('Contact creation failed:', error);
            setState(prev => ({
                ...prev,
                contactSearchLoading: false,
                contactError: 'Failed to create contact'
            }));
            return null;
        }
    }, [profile?.id, loadCustomerContacts]);

    // Select customer
    const selectCustomer = useCallback((customer: CustomerSearchResult) => {
        setState(prev => ({
            ...prev,
            customerSearchOpen: false,
            customerSearchQuery: '',
            customerSearchResults: []
        }));

        // Load contacts for selected customer
        loadCustomerContacts(customer.id);

        return customer;
    }, [loadCustomerContacts]);

    // Toggle contact selection
    const toggleContact = useCallback((contactId: string) => {
        setState(prev => ({
            ...prev,
            selectedContacts: prev.selectedContacts.includes(contactId)
                ? prev.selectedContacts.filter(id => id !== contactId)
                : [...prev.selectedContacts, contactId]
        }));
    }, []);

    // State setters
    const setCustomerSearchOpen = useCallback((open: boolean) => {
        setState(prev => ({ ...prev, customerSearchOpen: open }));
    }, []);

    const setCustomerSearchQuery = useCallback((query: string) => {
        setState(prev => ({ ...prev, customerSearchQuery: query }));
    }, []);

    const setCustomerCreationOpen = useCallback((open: boolean) => {
        setState(prev => ({ ...prev, customerCreationOpen: open }));
    }, []);

    const setContactSearchOpen = useCallback((open: boolean) => {
        setState(prev => ({ ...prev, contactSearchOpen: open }));
    }, []);

    // Clear errors
    const clearErrors = useCallback(() => {
        setState(prev => ({
            ...prev,
            customerError: null,
            contactError: null
        }));
    }, []);

    // Auto-load contacts if enabled
    useEffect(() => {
        if (autoLoadContacts && profile?.organization_id) {
            loadCustomerContacts(profile.organization_id);
        }
    }, [autoLoadContacts, profile?.organization_id, loadCustomerContacts]);

    return {
        // State
        ...state,

        // Actions
        searchCustomers,
        selectCustomer,
        createCustomer,
        createContact,
        loadCustomerContacts,
        toggleContact,

        // State setters
        setCustomerSearchOpen,
        setCustomerSearchQuery,
        setCustomerCreationOpen,
        setContactSearchOpen,
        clearErrors
    };
}
