// Customer Organization Hook
// React hook for managing organization-based customer model

import { useState, useEffect, useCallback } from 'react';
import { CustomerOrganizationServiceSimplified as CustomerOrganizationService, CustomerOrganization } from '@/services/customerOrganizationServiceSimplified';
import { Contact, Organization } from '@/types/project';

export interface UseCustomerOrganizationsOptions {
    autoFetch?: boolean;
}

export function useCustomerOrganizations(options: UseCustomerOrganizationsOptions = {}) {
    const [organizations, setOrganizations] = useState<CustomerOrganization[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrganizations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CustomerOrganizationService.getCustomerOrganizations();
            setOrganizations(data);
        } catch (err) {
            console.error('Error fetching customer organizations:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch customer organizations');
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrganization = useCallback(async (organizationData: Partial<Organization>, primaryContactData?: Partial<Contact>) => {
        try {
            setLoading(true);
            setError(null);
            const newOrganization = await CustomerOrganizationService.createCustomerOrganization(organizationData, primaryContactData);
            setOrganizations(prev => [...prev, newOrganization]);
            return newOrganization;
        } catch (err) {
            console.error('Error creating customer organization:', err);
            setError(err instanceof Error ? err.message : 'Failed to create customer organization');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrganization = useCallback(async (id: string, updates: Partial<Organization>) => {
        try {
            setLoading(true);
            setError(null);
            const updatedOrganization = await CustomerOrganizationService.updateCustomerOrganization(id, updates);
            setOrganizations(prev =>
                prev.map(org => org.id === id ? updatedOrganization : org)
            );
            return updatedOrganization;
        } catch (err) {
            console.error('Error updating customer organization:', err);
            setError(err instanceof Error ? err.message : 'Failed to update customer organization');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (options.autoFetch !== false) {
            fetchOrganizations();
        }
    }, [fetchOrganizations, options.autoFetch]);

    return {
        organizations,
        loading,
        error,
        fetchOrganizations,
        createOrganization,
        updateOrganization,
    };
}

export function useCustomerOrganization(id: string) {
    const [organization, setOrganization] = useState<CustomerOrganization | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrganization = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const data = await CustomerOrganizationService.getCustomerOrganizationById(id);
            setOrganization(data);
        } catch (err) {
            console.error('Error fetching customer organization:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch customer organization');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const updateOrganization = useCallback(async (updates: Partial<Organization>) => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const updatedOrganization = await CustomerOrganizationService.updateCustomerOrganization(id, updates);
            setOrganization(updatedOrganization);
            return updatedOrganization;
        } catch (err) {
            console.error('Error updating customer organization:', err);
            setError(err instanceof Error ? err.message : 'Failed to update customer organization');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [id]);

    const addContact = useCallback(async (contactData: Partial<Contact>) => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const newContact = await CustomerOrganizationService.addContactToOrganization(id, contactData);
            setOrganization(prev => prev ? {
                ...prev,
                contacts: [...(prev.contacts || []), newContact]
            } : null);
            return newContact;
        } catch (err) {
            console.error('Error adding contact:', err);
            setError(err instanceof Error ? err.message : 'Failed to add contact');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [id]);

    const updateContact = useCallback(async (contactId: string, updates: Partial<Contact>) => {
        try {
            setLoading(true);
            setError(null);
            const updatedContact = await CustomerOrganizationService.updateContactInOrganization(contactId, updates);
            setOrganization(prev => prev ? {
                ...prev,
                contacts: prev.contacts?.map(contact =>
                    contact.id === contactId ? updatedContact : contact
                ) || []
            } : null);
            return updatedContact;
        } catch (err) {
            console.error('Error updating contact:', err);
            setError(err instanceof Error ? err.message : 'Failed to update contact');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const setPrimaryContact = useCallback(async (contactId: string) => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            await CustomerOrganizationService.setPrimaryContact(id, contactId);
            setOrganization(prev => prev ? {
                ...prev,
                contacts: prev.contacts?.map(contact => ({
                    ...contact,
                    is_primary_contact: contact.id === contactId
                })) || [],
                primary_contact: prev.contacts?.find(contact => contact.id === contactId) || undefined
            } : null);
        } catch (err) {
            console.error('Error setting primary contact:', err);
            setError(err instanceof Error ? err.message : 'Failed to set primary contact');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrganization();
    }, [fetchOrganization]);

    return {
        organization,
        loading,
        error,
        fetchOrganization,
        updateOrganization,
        addContact,
        updateContact,
        setPrimaryContact,
    };
}

export function useProjectContactPoints(projectId: string) {
    const [contactPoints, setContactPoints] = useState<ProjectContactPointWithDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchContactPoints = useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await CustomerOrganizationService.getProjectContactPoints(projectId);
            setContactPoints(data);
        } catch (err) {
            console.error('Error fetching project contact points:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch project contact points');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const addContactPoint = useCallback(async (contactId: string, role?: string, isPrimary: boolean = false) => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);
            const newContactPoint = await CustomerOrganizationService.addProjectContactPoint(projectId, contactId, role, isPrimary);
            setContactPoints(prev => [...prev, newContactPoint]);
            return newContactPoint;
        } catch (err) {
            console.error('Error adding project contact point:', err);
            setError(err instanceof Error ? err.message : 'Failed to add project contact point');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const updateContactPoint = useCallback(async (contactPointId: string, updates: Partial<ProjectContactPointWithDetails>) => {
        try {
            setLoading(true);
            setError(null);
            const updatedContactPoint = await CustomerOrganizationService.updateProjectContactPoint(contactPointId, updates);
            setContactPoints(prev =>
                prev.map(cp => cp.id === contactPointId ? updatedContactPoint : cp)
            );
            return updatedContactPoint;
        } catch (err) {
            console.error('Error updating project contact point:', err);
            setError(err instanceof Error ? err.message : 'Failed to update project contact point');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const removeContactPoint = useCallback(async (contactPointId: string) => {
        try {
            setLoading(true);
            setError(null);
            await CustomerOrganizationService.removeProjectContactPoint(contactPointId);
            setContactPoints(prev => prev.filter(cp => cp.id !== contactPointId));
        } catch (err) {
            console.error('Error removing project contact point:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove project contact point');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContactPoints();
    }, [fetchContactPoints]);

    return {
        contactPoints,
        loading,
        error,
        fetchContactPoints,
        addContactPoint,
        updateContactPoint,
        removeContactPoint,
    };
}
