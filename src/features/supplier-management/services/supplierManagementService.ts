import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/core/auth';
import { useApproval } from '@/core/approvals';
import {
    Supplier,
    RFQ,
    SupplierResponse,
    SupplierSearchFilters,
    SupplierSearchResult,
    SupplierPerformance,
    QUALIFICATION_CRITERIA,
    supplierSchema,
    rfqSchema,
    supplierResponseSchema
} from '../types/supplier-management.types';

export class SupplierManagementService {

    /**
     * Create a new supplier
     */
    static async createSupplier(
        supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>,
        userId: string,
        documents?: Array<{
            file?: File;
            documentType: string;
            title?: string;
            description?: string;
        }>,
        externalLinks?: Array<{
            title: string;
            url: string;
            description?: string;
        }>
    ): Promise<Supplier> {

        console.log('🏢 Creating new supplier:', supplierData.name);

        try {
            // Validate supplier data
            const validatedData = supplierSchema.parse({
                ...supplierData,
                createdBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Get user's organization ID
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', userId)
                .single();

            if (userError || !userData?.organization_id) {
                throw new Error('User organization not found');
            }

            // Create organization record for supplier
            console.log('📝 Inserting organization data:', {
                name: validatedData.name,
                description: validatedData.description,
                industry: validatedData.industry,
                address: validatedData.address,
                city: validatedData.city,
                state: validatedData.state,
                country: validatedData.country,
                postal_code: validatedData.postalCode,
                website: validatedData.website,
                organization_type: 'supplier',
                is_active: true,
                tax_id: validatedData.taxId,
                payment_terms: validatedData.paymentTerms,
                default_currency: validatedData.currency,
                metadata: {
                    supplierType: validatedData.supplierType,
                    qualificationStatus: validatedData.qualificationStatus,
                    capabilities: validatedData.capabilities,
                    certifications: validatedData.certifications,
                    qualityStandards: validatedData.qualityStandards,
                    onTimeDelivery: validatedData.onTimeDelivery,
                    qualityRating: validatedData.qualityRating,
                    responsiveness: validatedData.responsiveness,
                    notes: validatedData.notes
                }
            });

            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: validatedData.name,
                    description: validatedData.description || null,
                    industry: validatedData.industry || null,
                    address: validatedData.address || null,
                    city: validatedData.city || null,
                    state: validatedData.state || null,
                    country: validatedData.country || null,
                    postal_code: validatedData.postalCode || null,
                    website: validatedData.website || null,
                    organization_type: 'supplier',
                    is_active: true,
                    tax_id: validatedData.taxId || null,
                    payment_terms: validatedData.paymentTerms || null,
                    default_currency: validatedData.currency || 'USD',
                    metadata: {
                        supplierType: validatedData.supplierType,
                        qualificationStatus: validatedData.qualificationStatus,
                        capabilities: validatedData.capabilities,
                        certifications: validatedData.certifications,
                        qualityStandards: validatedData.qualityStandards,
                        onTimeDelivery: validatedData.onTimeDelivery,
                        qualityRating: validatedData.qualityRating,
                        responsiveness: validatedData.responsiveness,
                        notes: validatedData.notes
                    }
                })
                .select()
                .single();


            // Create primary contact record
            const { data: contactData, error: contactError } = await supabase
                .from('contacts')
                .insert({
                    organization_id: orgData.id,
                    type: 'supplier',
                    contact_name: validatedData.name,
                    email: validatedData.email,
                    phone: validatedData.phone,
                    address: validatedData.address,
                    city: validatedData.city,
                    state: validatedData.state,
                    country: validatedData.country,
                    postal_code: validatedData.postalCode,
                    website: validatedData.website,
                    is_primary_contact: true,
                    role: 'Primary Contact',
                    notes: validatedData.notes,
                    created_by: userId
                })
                .select()
                .single();

            if (contactError) {
                throw new Error(`Failed to create supplier contact: ${contactError.message}`);
            }

            // Create additional contacts if provided
            if (validatedData.contacts && validatedData.contacts.length > 0) {
                const additionalContacts = validatedData.contacts
                    .filter(contact => !contact.isPrimary)
                    .map(contact => ({
                        organization_id: orgData.id,
                        type: 'supplier',
                        contact_name: contact.name,
                        email: contact.email,
                        phone: contact.phone,
                        role: contact.title,
                        is_primary_contact: false,
                        notes: contact.department,
                        created_by: userId
                    }));

                if (additionalContacts.length > 0) {
                    const { error: additionalContactsError } = await supabase
                        .from('contacts')
                        .insert(additionalContacts);

                    if (additionalContactsError) {
                        console.warn('Failed to create additional contacts:', additionalContactsError);
                    }
                }
            }

            // Transform the organization data to match Supplier interface
            const supplier: Supplier = {
                id: orgData.id,
                name: orgData.name,
                companyName: orgData.name,
                description: orgData.description,
                supplierType: validatedData.supplierType,
                status: validatedData.status,
                qualificationStatus: validatedData.qualificationStatus,
                email: contactData.email,
                phone: contactData.phone,
                website: orgData.website,
                address: orgData.address,
                city: orgData.city,
                state: orgData.state,
                country: orgData.country,
                postalCode: orgData.postal_code,
                taxId: orgData.tax_id,
                registrationNumber: orgData.metadata?.registrationNumber,
                industry: orgData.industry,
                capabilities: orgData.metadata?.capabilities || [],
                certifications: orgData.metadata?.certifications || [],
                qualityStandards: orgData.metadata?.qualityStandards || [],
                paymentTerms: orgData.payment_terms,
                currency: orgData.default_currency || 'USD',
                onTimeDelivery: orgData.metadata?.onTimeDelivery,
                qualityRating: orgData.metadata?.qualityRating,
                responsiveness: orgData.metadata?.responsiveness,
                createdAt: orgData.created_at,
                updatedAt: orgData.updated_at,
                createdBy: userId,
                notes: orgData.metadata?.notes,
                contacts: validatedData.contacts,
                locations: validatedData.locations
            };

            // Upload documents if provided
            if (documents && documents.length > 0) {
                console.log('📄 Uploading supplier documents:', documents.length);
                await this.uploadSupplierDocuments(orgData.id, documents, userId, userData.organization_id);
            }

            // Create external link documents if provided
            if (externalLinks && externalLinks.length > 0) {
                console.log('🔗 Creating external link documents:', externalLinks.length);
                await this.createExternalLinkDocuments(orgData.id, externalLinks, userId, userData.organization_id);
            }

            return supplier;

        } catch (error) {
            console.error('❌ Supplier creation failed:', error);
            throw new Error(`Failed to create supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update supplier information
     */
    static async updateSupplier(supplierId: string, updates: Partial<Supplier>, userId: string): Promise<Supplier> {

        console.log('📝 Updating supplier:', supplierId);

        try {
            const updateData = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Update organization record
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .update({
                    name: updateData.name,
                    description: updateData.description,
                    industry: updateData.industry,
                    address: updateData.address,
                    city: updateData.city,
                    state: updateData.state,
                    country: updateData.country,
                    postal_code: updateData.postalCode,
                    website: updateData.website,
                    tax_id: updateData.taxId,
                    payment_terms: updateData.paymentTerms,
                    default_currency: updateData.currency,
                    metadata: {
                        supplierType: updateData.supplierType,
                        qualificationStatus: updateData.qualificationStatus,
                        capabilities: updateData.capabilities,
                        certifications: updateData.certifications,
                        qualityStandards: updateData.qualityStandards,
                        onTimeDelivery: updateData.onTimeDelivery,
                        qualityRating: updateData.qualityRating,
                        responsiveness: updateData.responsiveness,
                        notes: updateData.notes
                    }
                })
                .eq('id', supplierId)
                .select()
                .single();

            if (orgError) {
                throw new Error(`Failed to update supplier organization: ${orgError.message}`);
            }

            // Update primary contact if email or phone changed
            if (updateData.email || updateData.phone) {
                const { error: contactError } = await supabase
                    .from('contacts')
                    .update({
                        email: updateData.email,
                        phone: updateData.phone,
                        contact_name: updateData.name
                    })
                    .eq('organization_id', supplierId)
                    .eq('is_primary_contact', true);

                if (contactError) {
                    console.warn('Failed to update primary contact:', contactError);
                }
            }

            // Transform the organization data to match Supplier interface
            const supplier: Supplier = {
                id: orgData.id,
                name: orgData.name,
                companyName: orgData.name,
                description: orgData.description,
                supplierType: orgData.metadata?.supplierType || 'manufacturer',
                status: orgData.metadata?.status || 'active',
                qualificationStatus: orgData.metadata?.qualificationStatus || 'not_qualified',
                email: updateData.email,
                phone: updateData.phone,
                website: orgData.website,
                address: orgData.address,
                city: orgData.city,
                state: orgData.state,
                country: orgData.country,
                postalCode: orgData.postal_code,
                taxId: orgData.tax_id,
                registrationNumber: orgData.metadata?.registrationNumber,
                industry: orgData.industry,
                capabilities: orgData.metadata?.capabilities || [],
                certifications: orgData.metadata?.certifications || [],
                qualityStandards: orgData.metadata?.qualityStandards || [],
                paymentTerms: orgData.payment_terms,
                currency: orgData.default_currency || 'USD',
                onTimeDelivery: orgData.metadata?.onTimeDelivery,
                qualityRating: orgData.metadata?.qualityRating,
                responsiveness: orgData.metadata?.responsiveness,
                createdAt: orgData.created_at,
                updatedAt: orgData.updated_at,
                createdBy: userId,
                notes: orgData.metadata?.notes,
                contacts: updateData.contacts,
                locations: updateData.locations
            };

            // Log activity
            await this.logSupplierActivity(supplierId, 'supplier_updated', {
                updatedFields: Object.keys(updates)
            }, userId);

            return supplier;

        } catch (error) {
            console.error('❌ Supplier update failed:', error);
            throw new Error(`Failed to update supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get supplier by ID
     */
    static async getSupplierById(supplierId: string): Promise<Supplier> {
        console.log('🔍 Getting supplier by ID:', supplierId);

        try {
            // Get organization data
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', supplierId)
                .eq('organization_type', 'supplier')
                .single();

            if (orgError || !orgData) {
                throw new Error(`Supplier not found: ${orgError?.message || 'Unknown error'}`);
            }

            // Get primary contact
            const { data: contactData, error: contactError } = await supabase
                .from('contacts')
                .select('*')
                .eq('organization_id', supplierId)
                .eq('is_primary_contact', true)
                .single();

            if (contactError || !contactData) {
                throw new Error(`Primary contact not found: ${contactError?.message || 'Unknown error'}`);
            }

            // Transform to Supplier interface
            const supplier: Supplier = {
                id: orgData.id,
                name: orgData.name,
                companyName: orgData.name,
                description: orgData.description,
                supplierType: orgData.metadata?.supplierType || 'manufacturer',
                status: orgData.is_active ? 'active' : 'inactive',
                qualificationStatus: orgData.metadata?.qualificationStatus || 'not_qualified',
                email: contactData.email,
                phone: contactData.phone,
                website: orgData.website,
                address: orgData.address,
                city: orgData.city,
                state: orgData.state,
                country: orgData.country,
                postalCode: orgData.postal_code,
                taxId: orgData.tax_id,
                registrationNumber: orgData.metadata?.registrationNumber,
                industry: orgData.industry,
                capabilities: orgData.metadata?.capabilities || [],
                certifications: orgData.metadata?.certifications || [],
                qualityStandards: orgData.metadata?.qualityStandards || [],
                paymentTerms: orgData.payment_terms,
                currency: orgData.default_currency || 'USD',
                onTimeDelivery: orgData.metadata?.onTimeDelivery,
                qualityRating: orgData.metadata?.qualityRating,
                responsiveness: orgData.metadata?.responsiveness,
                createdAt: orgData.created_at,
                updatedAt: orgData.updated_at,
                createdBy: orgData.created_by,
                notes: orgData.metadata?.notes,
                contacts: [contactData],
                locations: []
            };

            return supplier;

        } catch (error) {
            console.error('❌ Failed to get supplier by ID:', error);
            throw new Error(`Failed to get supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Search and filter suppliers
     */
    static async searchSuppliers(filters: SupplierSearchFilters, organizationId: string): Promise<SupplierSearchResult> {

        console.log('🔍 Searching suppliers with filters:', filters);

        try {
            let query = supabase
                .from('organizations')
                .select(`
                    *,
                    contacts!inner(*)
                `, { count: 'exact' })
                .eq('organization_type', 'supplier');

            // Apply filters
            if (filters.name) {
                query = query.ilike('name', `%${filters.name}%`);
            }

            if (filters.country?.length) {
                query = query.in('country', filters.country);
            }

            const { data, error, count } = await query
                .order('name')
                .limit(100);

            if (error) {
                throw new Error(`Failed to search suppliers: ${error.message}`);
            }

            // Transform organization data to Supplier interface
            const suppliers: Supplier[] = (data || []).map(org => {
                const primaryContact = org.contacts?.find((c: any) => c.is_primary_contact) || org.contacts?.[0];

                return {
                    id: org.id,
                    name: org.name,
                    companyName: org.name,
                    description: org.description,
                    supplierType: org.metadata?.supplierType || 'manufacturer',
                    status: org.metadata?.status || 'active',
                    qualificationStatus: org.metadata?.qualificationStatus || 'not_qualified',
                    email: primaryContact?.email,
                    phone: primaryContact?.phone,
                    website: org.website,
                    address: org.address,
                    city: org.city,
                    state: org.state,
                    country: org.country,
                    postalCode: org.postal_code,
                    taxId: org.tax_id,
                    registrationNumber: org.metadata?.registrationNumber,
                    industry: org.industry,
                    capabilities: org.metadata?.capabilities || [],
                    certifications: org.metadata?.certifications || [],
                    qualityStandards: org.metadata?.qualityStandards || [],
                    paymentTerms: org.payment_terms,
                    currency: org.default_currency || 'USD',
                    onTimeDelivery: org.metadata?.onTimeDelivery,
                    qualityRating: org.metadata?.qualityRating,
                    responsiveness: org.metadata?.responsiveness,
                    createdAt: org.created_at,
                    updatedAt: org.updated_at,
                    createdBy: org.metadata?.createdBy,
                    notes: org.metadata?.notes,
                    contacts: org.contacts?.map((c: any) => ({
                        id: c.id,
                        name: c.contact_name,
                        title: c.role,
                        email: c.email,
                        phone: c.phone,
                        isPrimary: c.is_primary_contact,
                        department: c.notes
                    })),
                    locations: [] // TODO: Implement locations if needed
                };
            });

            // Apply additional filters in memory for complex queries
            let filteredSuppliers = suppliers;

            if (filters.supplierType?.length) {
                filteredSuppliers = filteredSuppliers.filter(s =>
                    filters.supplierType!.includes(s.supplierType)
                );
            }

            if (filters.status?.length) {
                filteredSuppliers = filteredSuppliers.filter(s =>
                    filters.status!.includes(s.status)
                );
            }

            if (filters.qualificationStatus?.length) {
                filteredSuppliers = filteredSuppliers.filter(s =>
                    filters.qualificationStatus!.includes(s.qualificationStatus)
                );
            }

            if (filters.capabilities?.length) {
                filteredSuppliers = filteredSuppliers.filter(s =>
                    filters.capabilities!.some(cap => s.capabilities.includes(cap))
                );
            }

            if (filters.minRating && filters.minRating > 0) {
                filteredSuppliers = filteredSuppliers.filter(s =>
                    (s.qualityRating || 0) >= filters.minRating!
                );
            }

            if (filters.maxRating && filters.maxRating < 5) {
                filteredSuppliers = filteredSuppliers.filter(s =>
                    (s.qualityRating || 0) <= filters.maxRating!
                );
            }

            // Calculate facets
            const facets = this.calculateFacets(filteredSuppliers);

            return {
                suppliers: filteredSuppliers,
                totalCount: filteredSuppliers.length,
                facets
            };

        } catch (error) {
            console.error('❌ Supplier search failed:', error);
            throw new Error(`Failed to search suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Calculate search facets
     */
    private static calculateFacets(suppliers: Supplier[]) {
        const facets = {
            supplierTypes: {} as Record<string, number>,
            countries: {} as Record<string, number>,
            capabilities: {} as Record<string, number>,
            certifications: {} as Record<string, number>,
            statuses: {} as Record<string, number>
        };

        suppliers.forEach(supplier => {
            // Supplier types
            const type = supplier.supplierType;
            facets.supplierTypes[type] = (facets.supplierTypes[type] || 0) + 1;

            // Countries
            const country = supplier.country;
            facets.countries[country] = (facets.countries[country] || 0) + 1;

            // Statuses
            const status = supplier.status;
            facets.statuses[status] = (facets.statuses[status] || 0) + 1;

            // Capabilities
            supplier.capabilities?.forEach(capability => {
                facets.capabilities[capability] = (facets.capabilities[capability] || 0) + 1;
            });

            // Certifications
            supplier.certifications?.forEach(cert => {
                facets.certifications[cert] = (facets.certifications[cert] || 0) + 1;
            });
        });

        return facets;
    }

    /**
     * Qualify a supplier
     */
    static async qualifySupplier(
        supplierId: string,
        qualificationData: {
            criteria: Record<string, number>; // criterion -> score (0-100)
            overallScore: number;
            recommendations: string[];
            validUntil: string;
            approvedBy: string;
        },
        userId: string
    ): Promise<void> {

        console.log('✅ Qualifying supplier:', supplierId);

        try {
            // Update supplier qualification status in organization metadata
            const { error: updateError } = await supabase
                .from('organizations')
                .update({
                    metadata: {
                        qualificationStatus: 'qualified',
                        qualificationScore: qualificationData.overallScore,
                        qualificationCriteria: qualificationData.criteria,
                        qualificationRecommendations: qualificationData.recommendations,
                        qualificationValidUntil: qualificationData.validUntil,
                        qualificationApprovedBy: qualificationData.approvedBy,
                        qualificationApprovedAt: new Date().toISOString()
                    },
                    updated_at: new Date().toISOString()
                })
                .eq('id', supplierId);

            if (updateError) {
                throw new Error(`Failed to update supplier qualification: ${updateError.message}`);
            }

            // Create qualification record in supplier_qualifications table if it exists
            const qualificationRecord = {
                organization_id: supplierId,
                criteria_scores: qualificationData.criteria,
                overall_score: qualificationData.overallScore,
                recommendations: qualificationData.recommendations,
                valid_until: qualificationData.validUntil,
                approved_by: qualificationData.approvedBy,
                approved_at: new Date().toISOString(),
                created_by: userId
            };

            const { error: qualError } = await supabase
                .from('supplier_qualifications')
                .insert(qualificationRecord);

            if (qualError) {
                console.warn('Failed to create qualification record (table may not exist):', qualError);
            }

            // Log activity
            await this.logSupplierActivity(supplierId, 'supplier_qualified', {
                overallScore: qualificationData.overallScore,
                validUntil: qualificationData.validUntil
            }, userId);

        } catch (error) {
            console.error('❌ Supplier qualification failed:', error);
            throw new Error(`Failed to qualify supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create RFQ (Request for Quote)
     */
    static async createRFQ(rfqData: Omit<RFQ, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<RFQ> {

        console.log('📋 Creating RFQ:', rfqData.title);

        try {
            const validatedData = rfqSchema.parse({
                ...rfqData,
                createdBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Get user's organization ID
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', userId)
                .single();

            if (userError || !userData?.organization_id) {
                throw new Error('User organization not found');
            }

            // Create RFQ record
            const { data, error } = await supabase
                .from('supplier_rfqs')
                .insert({
                    organization_id: userData.organization_id,
                    project_id: validatedData.projectId,
                    supplier_id: validatedData.suppliers[0], // For now, assume single supplier
                    rfq_number: validatedData.title,
                    status: validatedData.status,
                    priority: validatedData.priority,
                    due_date: validatedData.dueDate,
                    requirements: validatedData.description,
                    special_instructions: validatedData.requirements.join('\n'),
                    created_by: userId
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create RFQ: ${error.message}`);
            }

            // Log activity
            await this.logRFQActivity(data.id, 'rfq_created', {
                title: data.rfq_number,
                supplierCount: validatedData.suppliers.length,
                itemCount: validatedData.items.length
            }, userId);

            // Transform to RFQ interface
            const rfq: RFQ = {
                id: data.id,
                title: data.rfq_number,
                description: data.requirements,
                projectId: data.project_id,
                items: validatedData.items,
                suppliers: [data.supplier_id],
                status: data.status,
                dueDate: data.due_date,
                budget: validatedData.budget,
                priority: data.priority,
                requirements: data.special_instructions ? data.special_instructions.split('\n') : [],
                attachments: validatedData.attachments,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                createdBy: data.created_by,
                sentAt: data.sent_at,
                completedAt: undefined
            };

            return rfq;

        } catch (error) {
            console.error('❌ RFQ creation failed:', error);
            throw new Error(`Failed to create RFQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Send RFQ to suppliers
     */
    static async sendRFQ(rfqId: string, userId: string): Promise<void> {

        console.log('📤 Sending RFQ:', rfqId);

        try {
            // Update RFQ status
            const { error: updateError } = await supabase
                .from('supplier_rfqs')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', rfqId);

            if (updateError) {
                throw new Error(`Failed to update RFQ: ${updateError.message}`);
            }

            // Here you would typically send emails to suppliers
            // For now, we'll just log the activity
            await this.logRFQActivity(rfqId, 'rfq_sent', {}, userId);

        } catch (error) {
            console.error('❌ RFQ sending failed:', error);
            throw new Error(`Failed to send RFQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Submit supplier response to RFQ
     */
    static async submitSupplierResponse(
        responseData: Omit<SupplierResponse, 'id' | 'submittedAt'>,
        userId: string
    ): Promise<SupplierResponse> {

        console.log('📝 Submitting supplier response for RFQ:', responseData.rfqId);

        try {
            const validatedData = supplierResponseSchema.parse({
                ...responseData,
                submittedAt: new Date().toISOString()
            });

            // Get user's organization ID
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', userId)
                .single();

            if (userError || !userData?.organization_id) {
                throw new Error('User organization not found');
            }

            // Create supplier quote record
            const { data, error } = await supabase
                .from('supplier_quotes')
                .insert({
                    organization_id: userData.organization_id,
                    supplier_rfq_id: validatedData.rfqId,
                    supplier_id: validatedData.supplierId,
                    quote_number: `Q-${Date.now()}`,
                    total_amount: validatedData.totalValue,
                    currency: 'USD', // Default currency
                    lead_time_days: validatedData.items[0]?.leadTime || 30,
                    valid_until: new Date(Date.now() + validatedData.validityPeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    payment_terms: validatedData.paymentTerms,
                    shipping_terms: validatedData.deliveryTerms,
                    status: 'received',
                    notes: validatedData.comments,
                    submitted_at: validatedData.submittedAt
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to submit response: ${error.message}`);
            }

            // Log activity
            await this.logRFQActivity(responseData.rfqId, 'supplier_response_submitted', {
                supplierId: responseData.supplierId,
                totalValue: responseData.totalValue
            }, userId);

            // Transform to SupplierResponse interface
            const response: SupplierResponse = {
                id: data.id,
                rfqId: data.supplier_rfq_id,
                supplierId: data.supplier_id,
                status: 'submitted',
                items: validatedData.items,
                totalValue: data.total_amount,
                validityPeriod: validatedData.validityPeriod,
                paymentTerms: data.payment_terms,
                deliveryTerms: data.shipping_terms,
                warranty: validatedData.warranty,
                comments: data.notes,
                exceptions: validatedData.exceptions,
                submittedAt: data.submitted_at,
                reviewedAt: undefined,
                reviewedBy: undefined
            };

            return response;

        } catch (error) {
            console.error('❌ Supplier response submission failed:', error);
            throw new Error(`Failed to submit supplier response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get supplier performance metrics
     */
    static async getSupplierPerformance(supplierId: string, period?: string): Promise<SupplierPerformance | null> {

        try {
            const targetPeriod = period || new Date().toISOString().slice(0, 7); // YYYY-MM

            // Try to get from supplier_performance table first
            const { data, error } = await supabase
                .from('supplier_performance_metrics')
                .select('*')
                .eq('supplier_id', supplierId)
                .eq('period_start', targetPeriod + '-01')
                .single();

            if (error && error.code !== 'PGRST116') { // Not found error
                console.warn('Failed to fetch supplier performance from metrics table:', error);
            }

            if (data) {
                return {
                    supplierId: data.supplier_id,
                    period: targetPeriod,
                    metrics: {
                        totalOrders: data.total_orders || 0,
                        onTimeDeliveries: data.on_time_deliveries || 0,
                        qualityIncidents: data.quality_incidents || 0,
                        averageLeadTime: data.average_lead_time_days || 0,
                        averageCostVariance: data.average_cost_variance || 0,
                        responsivenessRating: data.response_rate || 0
                    },
                    score: data.overall_performance_score || 0,
                    grade: data.performance_grade as 'A' | 'B' | 'C' | 'D' | 'F' || 'F'
                };
            }

            // Fallback: get basic performance data from organization metadata
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .select('metadata')
                .eq('id', supplierId)
                .single();

            if (orgError) {
                console.warn('Failed to fetch supplier organization:', orgError);
                return null;
            }

            const metadata = orgData?.metadata as any;
            if (metadata?.performanceMetrics) {
                return {
                    supplierId,
                    period: targetPeriod,
                    metrics: metadata.performanceMetrics,
                    score: metadata.performanceScore || 0,
                    grade: metadata.performanceGrade || 'F'
                };
            }

            return null;

        } catch (error) {
            console.error('❌ Failed to fetch supplier performance:', error);
            return null;
        }
    }

    /**
     * Update supplier performance metrics
     */
    static async updateSupplierPerformance(
        supplierId: string,
        metrics: Partial<SupplierPerformance['metrics']>,
        userId: string
    ): Promise<void> {

        try {
            const period = new Date().toISOString().slice(0, 7); // YYYY-MM

            // Calculate overall score (0-100)
            const performance = await this.getSupplierPerformance(supplierId, period);
            const updatedMetrics = { ...performance?.metrics, ...metrics };

            const score = this.calculatePerformanceScore(updatedMetrics);

            // Try to update supplier_performance_metrics table first
            const performanceData = {
                supplier_id: supplierId,
                period_start: period + '-01',
                period_end: period + '-31',
                metrics: updatedMetrics,
                score,
                grade: this.calculateGrade(score),
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('supplier_performance_metrics')
                .upsert(performanceData, {
                    onConflict: 'supplier_id,period_start,period_end'
                });

            if (error) {
                console.warn('Failed to update supplier performance metrics table:', error);

                // Fallback: update organization metadata
                const { error: orgError } = await supabase
                    .from('organizations')
                    .update({
                        metadata: {
                            performanceMetrics: updatedMetrics,
                            performanceScore: score,
                            performanceGrade: this.calculateGrade(score),
                            performanceUpdatedAt: new Date().toISOString()
                        }
                    })
                    .eq('id', supplierId);

                if (orgError) {
                    throw new Error(`Failed to update supplier performance: ${orgError.message}`);
                }
            }

            // Log activity
            await this.logSupplierActivity(supplierId, 'performance_updated', {
                score,
                grade: this.calculateGrade(score)
            }, userId);

        } catch (error) {
            console.error('❌ Supplier performance update failed:', error);
            throw new Error(`Failed to update supplier performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Calculate performance score
     */
    private static calculatePerformanceScore(metrics: SupplierPerformance['metrics']): number {
        if (metrics.totalOrders === 0) return 0;

        const onTimeScore = (metrics.onTimeDeliveries / metrics.totalOrders) * 30;
        const qualityScore = Math.max(0, (5 - metrics.qualityIncidents) / 5) * 25;
        const leadTimeScore = Math.max(0, (30 - metrics.averageLeadTime) / 30) * 20; // Assuming 30 days is target
        const costVarianceScore = Math.max(0, (1 - Math.abs(metrics.averageCostVariance)) * 100) * 15;
        const responsivenessScore = (metrics.responsivenessRating / 5) * 10;

        return Math.round(onTimeScore + qualityScore + leadTimeScore + costVarianceScore + responsivenessScore);
    }

    /**
     * Calculate performance grade
     */
    private static calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Get RFQs for project
     */
    static async getProjectRFQs(projectId: string): Promise<RFQ[]> {

        try {
            const { data, error } = await supabase
                .from('supplier_rfqs')
                .select(`
                    *,
                    suppliers:supplier_id(
                        organizations!inner(name, organization_type)
                    ),
                    responses:supplier_quotes(count)
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch RFQs: ${error.message}`);
            }

            // Transform the data to match RFQ interface
            const rfqs: RFQ[] = (data || []).map(rfq => ({
                id: rfq.id,
                title: rfq.rfq_number,
                description: rfq.requirements,
                projectId: rfq.project_id,
                items: [], // TODO: Implement RFQ items if needed
                suppliers: [rfq.supplier_id],
                status: rfq.status,
                dueDate: rfq.due_date,
                budget: undefined,
                priority: rfq.priority || 'normal',
                requirements: rfq.requirements ? [rfq.requirements] : [],
                attachments: [],
                createdAt: rfq.created_at,
                updatedAt: rfq.updated_at,
                createdBy: rfq.created_by,
                sentAt: rfq.sent_at,
                completedAt: undefined
            }));

            return rfqs;

        } catch (error) {
            console.error('❌ Failed to fetch project RFQs:', error);
            throw new Error(`Failed to fetch RFQs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Log supplier activity
     */
    private static async logSupplierActivity(
        supplierId: string,
        action: string,
        details: any,
        userId: string
    ) {
        try {
            // Get user's organization_id first
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', userId)
                .single();

            if (userError || !userData?.organization_id) {
                console.warn('Could not get user organization for activity log:', userError);
                return;
            }

            const { error } = await supabase
                .from('activity_log')
                .insert({
                    organization_id: userData.organization_id,
                    entity_type: 'supplier',
                    entity_id: supplierId,
                    user_id: userId,
                    action,
                    new_values: details,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.warn('Failed to log supplier activity:', error);
            }
        } catch (error) {
            console.warn('Activity logging failed:', error);
        }
    }

    /**
     * Log RFQ activity
     */
    private static async logRFQActivity(
        rfqId: string,
        action: string,
        details: any,
        userId: string
    ) {
        try {
            // Get user's organization_id first
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', userId)
                .single();

            if (userError || !userData?.organization_id) {
                console.warn('Could not get user organization for activity log:', userError);
                return;
            }

            const { error } = await supabase
                .from('activity_log')
                .insert({
                    organization_id: userData.organization_id,
                    entity_type: 'rfq',
                    entity_id: rfqId,
                    user_id: userId,
                    action,
                    new_values: details,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.warn('Failed to log RFQ activity:', error);
            }
        } catch (error) {
            console.warn('Activity logging failed:', error);
        }
    }

    /**
     * Export supplier data
     */
    static exportSupplierData(suppliers: Supplier[]): {
        csv: string;
        json: string;
    } {

        // CSV export
        const csvHeaders = [
            'Name',
            'Type',
            'Status',
            'Qualification Status',
            'Email',
            'Phone',
            'Country',
            'Quality Rating',
            'On-Time Delivery'
        ];

        const csvRows = suppliers.map(supplier => [
            supplier.name,
            supplier.supplierType,
            supplier.status,
            supplier.qualificationStatus,
            supplier.email,
            supplier.phone || '',
            supplier.country,
            supplier.qualityRating?.toString() || '',
            supplier.onTimeDelivery?.toString() || ''
        ]);

        const csvData = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        // JSON export
        const jsonData = JSON.stringify(suppliers, null, 2);

        return {
            csv: csvData,
            json: jsonData
        };
    }

    /**
     * Upload supplier documents to storage and database
     */
    private static async uploadSupplierDocuments(
        supplierId: string,
        documents: Array<{
            file?: File;
            documentType: string;
            title?: string;
            description?: string;
        }>,
        userId: string,
        organizationId: string
    ): Promise<void> {
        try {
            for (const doc of documents) {
                if (!doc.file) continue;

                // Upload file to storage
                // Clean the file name to avoid issues with special characters
                const cleanFileName = doc.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const fileName = `supplier-${supplierId}-${Date.now()}-${cleanFileName}`;
                const filePath = `suppliers/${supplierId}/${fileName}`;

                console.log('📤 Uploading file to storage:', {
                    originalFileName: doc.file.name,
                    cleanFileName: cleanFileName,
                    fileName: fileName,
                    filePath: filePath,
                    fileSize: doc.file.size,
                    documentType: doc.documentType,
                    mimeType: doc.file.type
                });

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(filePath, doc.file, {
                        contentType: doc.file.type,
                        upsert: false
                    });

                if (uploadError) {
                    console.error('❌ File upload failed:', uploadError);
                    throw new Error(`Failed to upload file ${doc.file.name}: ${uploadError.message}`);
                }

                console.log('✅ File uploaded successfully:', uploadData);

                // Create document record in database
                console.log('💾 Creating document record with data:', {
                    organization_id: organizationId,
                    userId: userId,
                    fileName: fileName,
                    filePath: filePath,
                    documentType: doc.documentType
                });

                const { error: docError } = await supabase
                    .from('documents')
                    .insert({
                        organization_id: organizationId,
                        title: doc.title || doc.file.name,
                        description: doc.description || `Supplier document: ${doc.documentType}`,
                        file_name: fileName,
                        file_path: filePath,
                        file_size: doc.file.size,
                        mime_type: doc.file.type,
                        category: doc.documentType as any,
                        uploaded_by: userId,
                        metadata: {
                            supplierId: supplierId,
                            documentType: doc.documentType,
                            originalFileName: doc.file.name
                        }
                    });

                if (docError) {
                    console.error('❌ Document record creation failed:', docError);
                    // Clean up uploaded file
                    await supabase.storage.from('documents').remove([filePath]);
                    throw new Error(`Failed to create document record: ${docError.message}`);
                }

                console.log('✅ Document record created successfully');
            }
        } catch (error) {
            console.error('❌ Supplier document upload failed:', error);
            throw error;
        }
    }

    /**
     * Create external link documents in database
     */
    private static async createExternalLinkDocuments(
        supplierId: string,
        externalLinks: Array<{
            title: string;
            url: string;
            description?: string;
        }>,
        userId: string,
        organizationId: string
    ): Promise<void> {
        try {
            for (const link of externalLinks) {
                console.log('🔗 Creating external link document:', {
                    title: link.title,
                    url: link.url,
                    supplierId,
                    organization_id: organizationId,
                    userId: userId
                });

                const { error: docError } = await supabase
                    .from('documents')
                    .insert({
                        organization_id: organizationId,
                        title: link.title,
                        description: link.description || `External document link: ${link.title}`,
                        file_name: link.title,
                        file_path: link.url,
                        file_size: null,
                        mime_type: 'application/link',
                        category: 'supplier_external_link' as any,
                        uploaded_by: userId,
                        metadata: {
                            supplierId: supplierId,
                            documentType: 'supplier_external_link',
                            externalUrl: link.url,
                            isExternalLink: true
                        }
                    });

                if (docError) {
                    console.error('❌ External link document creation failed:', docError);
                    throw new Error(`Failed to create external link document: ${docError.message}`);
                }

                console.log('✅ External link document created successfully');
            }
        } catch (error) {
            console.error('❌ External link document creation failed:', error);
            throw error;
        }
    }
}
