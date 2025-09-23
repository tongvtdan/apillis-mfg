import { Organization } from '@/types/project';

export interface CustomerFormData {
    company_name: string;
    slug: string;
    description: string;
    industry: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    website: string;
}

export function processOrganizationData(data: CustomerFormData): Partial<Organization> {
    return {
        name: data.company_name.trim(),
        slug: data.slug.trim() || undefined,
        description: data.description.trim() || undefined,
        industry: data.industry.trim() || undefined,
        address: data.address.trim() || undefined,
        city: data.city.trim() || undefined,
        state: data.state.trim() || undefined,
        country: data.country || undefined,
        postal_code: data.postal_code.trim() || undefined,
        website: data.website.trim() || undefined,
        organization_type: 'customer' as const
    };
}

export function processContactData(data: CustomerFormData) {
    return {
        contact_name: data.contact_name.trim() || undefined,
        email: data.email.trim() || undefined,
        phone: data.phone.trim() || undefined,
        is_primary_contact: true
    };
}

export function populateCustomerFormData(customer: any, reset: (values: any) => void) {
    reset({
        company_name: customer.name || '',
        slug: customer.slug || '',
        description: customer.description || '',
        industry: customer.industry || '',
        contact_name: customer.primary_contact?.contact_name || '',
        email: customer.primary_contact?.email || '',
        phone: customer.primary_contact?.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || '',
        postal_code: customer.postal_code || '',
        website: customer.website || ''
    });
}
