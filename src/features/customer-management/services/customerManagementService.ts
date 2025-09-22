import { supabase } from '@/integrations/supabase/client.ts.js';
import { useAuth } from '@/core/auth';
import {
    Customer,
    Contact,
    CustomerInteraction,
    CustomerSearchFilters,
    CustomerSearchResult,
    CustomerMetrics,
    CustomerHealthScore,
    CustomerLifecycleStage,
    customerSchema,
    contactSchema,
    customerInteractionSchema
} from '../types/customer.types';

export class CustomerManagementService {

    /**
     * Create a new customer
     */
    static async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Customer> {

        console.log('👥 Creating new customer:', customerData.name);

        try {
            const validatedData = customerSchema.parse({
                ...customerData,
                createdBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString()
            });

            const { data, error } = await supabase
                .from('customers')
                .insert(validatedData)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create customer: ${error.message}`);
            }

            // Log activity
            await this.logCustomerActivity(data.id, 'customer_created', {
                customerName: data.name,
                customerType: data.customerType
            }, userId);

            return data;

        } catch (error) {
            console.error('❌ Customer creation failed:', error);
            throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update customer information
     */
    static async updateCustomer(customerId: string, updates: Partial<Customer>, userId: string): Promise<Customer> {

        console.log('📝 Updating customer:', customerId);

        try {
            const updateData = {
                ...updates,
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('customers')
                .update(updateData)
                .eq('id', customerId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update customer: ${error.message}`);
            }

            // Log activity
            await this.logCustomerActivity(customerId, 'customer_updated', {
                updatedFields: Object.keys(updates)
            }, userId);

            return data;

        } catch (error) {
            console.error('❌ Customer update failed:', error);
            throw new Error(`Failed to update customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Search and filter customers
     */
    static async searchCustomers(filters: CustomerSearchFilters, organizationId: string): Promise<CustomerSearchResult> {

        console.log('🔍 Searching customers with filters:', filters);

        try {
            let query = supabase
                .from('customers')
                .select('*', { count: 'exact' })
                .eq('organization_id', organizationId);

            // Apply filters
            if (filters.name) {
                query = query.ilike('name', `%${filters.name}%`);
            }

            if (filters.customerType?.length) {
                query = query.in('customer_type', filters.customerType);
            }

            if (filters.status?.length) {
                query = query.in('status', filters.status);
            }

            if (filters.industry?.length) {
                query = query.in('industry', filters.industry);
            }

            if (filters.customerTier?.length) {
                query = query.in('customer_tier', filters.customerTier);
            }

            if (filters.country) {
                query = query.ilike('billing_address->>country', `%${filters.country}%`);
            }

            if (filters.city) {
                query = query.ilike('billing_address->>city', `%${filters.city}%`);
            }

            if (filters.minRevenue) {
                query = query.gte('annual_revenue', filters.minRevenue);
            }

            if (filters.maxRevenue) {
                query = query.lte('annual_revenue', filters.maxRevenue);
            }

            if (filters.createdAfter) {
                query = query.gte('created_at', filters.createdAfter);
            }

            if (filters.createdBefore) {
                query = query.lte('created_at', filters.createdBefore);
            }

            const { data, error, count } = await query
                .order('name')
                .limit(100);

            if (error) {
                throw new Error(`Failed to search customers: ${error.message}`);
            }

            // Calculate facets
            const facets = this.calculateFacets(data || []);

            return {
                customers: data || [],
                totalCount: count || 0,
                facets
            };

        } catch (error) {
            console.error('❌ Customer search failed:', error);
            throw new Error(`Failed to search customers: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Calculate search facets
     */
    private static calculateFacets(customers: Customer[]) {
        const facets = {
            customerTypes: {} as Record<string, number>,
            industries: {} as Record<string, number>,
            statuses: {} as Record<string, number>,
            tiers: {} as Record<string, number>,
            countries: {} as Record<string, number>,
            tags: {} as Record<string, number>
        };

        customers.forEach(customer => {
            // Customer types
            const type = customer.customerType;
            facets.customerTypes[type] = (facets.customerTypes[type] || 0) + 1;

            // Industries
            if (customer.industry) {
                facets.industries[customer.industry] = (facets.industries[customer.industry] || 0) + 1;
            }

            // Statuses
            const status = customer.status;
            facets.statuses[status] = (facets.statuses[status] || 0) + 1;

            // Tiers
            if (customer.customerTier) {
                facets.tiers[customer.customerTier] = (facets.tiers[customer.customerTier] || 0) + 1;
            }

            // Countries
            if (customer.billingAddress?.country) {
                const country = customer.billingAddress.country;
                facets.countries[country] = (facets.countries[country] || 0) + 1;
            }

            // Tags
            customer.tags?.forEach(tag => {
                facets.tags[tag] = (facets.tags[tag] || 0) + 1;
            });
        });

        return facets;
    }

    /**
     * Create customer contact
     */
    static async createContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Contact> {

        console.log('👤 Creating contact for customer:', contactData.customerId);

        try {
            const validatedData = contactSchema.parse({
                ...contactData,
                createdBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const { data, error } = await supabase
                .from('customer_contacts')
                .insert(validatedData)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create contact: ${error.message}`);
            }

            // If this is the primary contact, update other contacts
            if (validatedData.isPrimary) {
                await this.updatePrimaryContact(validatedData.customerId, data.id);
            }

            // Log activity
            await this.logCustomerActivity(contactData.customerId, 'contact_created', {
                contactName: `${validatedData.firstName} ${validatedData.lastName}`,
                relationship: validatedData.relationship
            }, userId);

            return data;

        } catch (error) {
            console.error('❌ Contact creation failed:', error);
            throw new Error(`Failed to create contact: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update primary contact for customer
     */
    private static async updatePrimaryContact(customerId: string, primaryContactId: string): Promise<void> {

        try {
            // First, set all contacts for this customer to non-primary
            await supabase
                .from('customer_contacts')
                .update({ is_primary: false })
                .eq('customer_id', customerId);

            // Then set the specified contact as primary
            await supabase
                .from('customer_contacts')
                .update({ is_primary: true })
                .eq('id', primaryContactId);

        } catch (error) {
            console.warn('Failed to update primary contact:', error);
        }
    }

    /**
     * Log customer interaction
     */
    static async logInteraction(
        interactionData: Omit<CustomerInteraction, 'id' | 'createdAt'>,
        userId: string
    ): Promise<CustomerInteraction> {

        console.log('📞 Logging customer interaction:', interactionData.type);

        try {
            const validatedData = customerInteractionSchema.parse({
                ...interactionData,
                createdAt: new Date().toISOString()
            });

            const { data, error } = await supabase
                .from('customer_interactions')
                .insert(validatedData)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to log interaction: ${error.message}`);
            }

            // Update customer's last activity
            await supabase
                .from('customers')
                .update({
                    last_activity_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', interactionData.customerId);

            // Log activity
            await this.logCustomerActivity(interactionData.customerId, 'interaction_logged', {
                interactionType: interactionData.type,
                subject: interactionData.subject
            }, userId);

            return data;

        } catch (error) {
            console.error('❌ Interaction logging failed:', error);
            throw new Error(`Failed to log interaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get customer metrics
     */
    static async getCustomerMetrics(customerId: string, period?: string): Promise<CustomerMetrics | null> {

        try {
            const targetPeriod = period || new Date().toISOString().slice(0, 7); // YYYY-MM

            // Get orders/projects data for the period
            const { data: orders, error: ordersError } = await supabase
                .from('projects')
                .select('id, total_value, status, created_at, completed_at')
                .eq('customer_id', customerId)
                .gte('created_at', `${targetPeriod}-01`)
                .lt('created_at', `${targetPeriod}-31`);

            if (ordersError) {
                throw new Error(`Failed to fetch orders: ${ordersError.message}`);
            }

            // Get interactions for the period
            const { data: interactions, error: interactionsError } = await supabase
                .from('customer_interactions')
                .select('*')
                .eq('customer_id', customerId)
                .gte('created_at', `${targetPeriod}-01`)
                .lt('created_at', `${targetPeriod}-31`);

            if (interactionsError) {
                throw new Error(`Failed to fetch interactions: ${interactionsError.message}`);
            }

            // Calculate metrics
            const ordersData = orders || [];
            const interactionsData = interactions || [];

            const totalOrders = ordersData.length;
            const totalOrderValue = ordersData.reduce((sum, order) => sum + (order.total_value || 0), 0);
            const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;

            const activeProjects = ordersData.filter(order => order.status === 'in_progress').length;
            const completedProjects = ordersData.filter(order => order.status === 'completed').length;
            const onTimeDeliveries = ordersData.filter(order =>
                order.completed_at && order.completed_at <= order.due_date
            ).length;
            const onTimeDeliveryRate = totalOrders > 0 ? (onTimeDeliveries / totalOrders) * 100 : 0;

            const lastOrderDate = ordersData.length > 0
                ? ordersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
                : '';

            const lastInteractionDate = interactionsData.length > 0
                ? interactionsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
                : '';

            return {
                customerId,
                period: targetPeriod,
                totalOrders,
                totalOrderValue,
                averageOrderValue,
                activeProjects,
                completedProjects,
                onTimeDelivery: onTimeDeliveryRate,
                totalRevenue: totalOrderValue,
                outstandingInvoices: 0, // TODO: Implement invoice tracking
                paymentDelay: 0, // TODO: Implement payment tracking
                satisfactionScore: 4.0, // TODO: Implement satisfaction tracking
                complaintCount: 0, // TODO: Implement complaint tracking
                repeatBusinessRate: 0, // TODO: Implement repeat business calculation
                lastOrderDate,
                lastContactDate: lastInteractionDate,
                interactionCount: interactionsData.length
            };

        } catch (error) {
            console.error('❌ Failed to calculate customer metrics:', error);
            return null;
        }
    }

    /**
     * Calculate customer health score
     */
    static async calculateHealthScore(customerId: string): Promise<CustomerHealthScore | null> {

        try {
            const metrics = await this.getCustomerMetrics(customerId);
            if (!metrics) return null;

            // Calculate component scores (0-100 each)
            const recency = this.calculateRecencyScore(metrics.lastContactDate);
            const frequency = this.calculateFrequencyScore(metrics.interactionCount);
            const monetary = this.calculateMonetaryScore(metrics.totalRevenue);
            const engagement = this.calculateEngagementScore(metrics);
            const satisfaction = this.calculateSatisfactionScore(metrics.satisfactionScore);

            // Overall health score (weighted average)
            const overallScore = Math.round(
                (recency * 0.2) +
                (frequency * 0.2) +
                (monetary * 0.25) +
                (engagement * 0.15) +
                (satisfaction * 0.2)
            );

            // Determine risk level
            let riskLevel: 'low' | 'medium' | 'high';
            if (overallScore >= 70) riskLevel = 'low';
            else if (overallScore >= 40) riskLevel = 'medium';
            else riskLevel = 'high';

            // Generate recommendations
            const recommendations = this.generateHealthRecommendations(overallScore, metrics);

            return {
                customerId,
                overallScore,
                components: {
                    recency,
                    frequency,
                    monetary,
                    engagement,
                    satisfaction
                },
                riskLevel,
                recommendations
            };

        } catch (error) {
            console.error('❌ Failed to calculate health score:', error);
            return null;
        }
    }

    /**
     * Calculate recency score based on last contact
     */
    private static calculateRecencyScore(lastContactDate: string): number {
        if (!lastContactDate) return 0;

        const daysSinceContact = Math.floor(
            (Date.now() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceContact <= 7) return 100;
        if (daysSinceContact <= 30) return 80;
        if (daysSinceContact <= 90) return 60;
        if (daysSinceContact <= 180) return 40;
        return 20;
    }

    /**
     * Calculate frequency score based on interaction count
     */
    private static calculateFrequencyScore(interactionCount: number): number {
        if (interactionCount >= 20) return 100;
        if (interactionCount >= 10) return 80;
        if (interactionCount >= 5) return 60;
        if (interactionCount >= 2) return 40;
        if (interactionCount >= 1) return 20;
        return 0;
    }

    /**
     * Calculate monetary score based on revenue
     */
    private static calculateMonetaryScore(totalRevenue: number): number {
        if (totalRevenue >= 100000) return 100;
        if (totalRevenue >= 50000) return 80;
        if (totalRevenue >= 25000) return 60;
        if (totalRevenue >= 10000) return 40;
        if (totalRevenue >= 1000) return 20;
        return 0;
    }

    /**
     * Calculate engagement score based on various metrics
     */
    private static calculateEngagementScore(metrics: CustomerMetrics): number {
        let score = 0;

        // Active projects contribute to engagement
        if (metrics.activeProjects > 0) score += 30;

        // On-time delivery indicates good engagement
        if (metrics.onTimeDelivery >= 90) score += 30;
        else if (metrics.onTimeDelivery >= 75) score += 20;
        else if (metrics.onTimeDelivery >= 50) score += 10;

        // Recent orders indicate engagement
        if (metrics.lastOrderDate) {
            const daysSinceOrder = Math.floor(
                (Date.now() - new Date(metrics.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceOrder <= 30) score += 40;
            else if (daysSinceOrder <= 90) score += 20;
        }

        return Math.min(score, 100);
    }

    /**
     * Calculate satisfaction score
     */
    private static calculateSatisfactionScore(satisfactionScore: number): number {
        return Math.round((satisfactionScore / 5) * 100);
    }

    /**
     * Generate health recommendations
     */
    private static generateHealthRecommendations(overallScore: number, metrics: CustomerMetrics): string[] {
        const recommendations: string[] = [];

        if (overallScore < 40) {
            recommendations.push('High risk - Immediate attention required');
            recommendations.push('Schedule urgent customer review meeting');
            recommendations.push('Review pricing and service agreements');
        } else if (overallScore < 70) {
            recommendations.push('Medium risk - Monitor closely');
            recommendations.push('Increase contact frequency');
            recommendations.push('Review satisfaction and identify improvement areas');
        }

        if (metrics.interactionCount < 5) {
            recommendations.push('Increase customer engagement through regular check-ins');
        }

        if (metrics.onTimeDelivery < 80) {
            recommendations.push('Address delivery performance issues');
        }

        if (!metrics.lastOrderDate || new Date(metrics.lastOrderDate).getTime() < Date.now() - (180 * 24 * 60 * 60 * 1000)) {
            recommendations.push('Re-engage customer with new opportunities');
        }

        return recommendations;
    }

    /**
     * Get customer contacts
     */
    static async getCustomerContacts(customerId: string): Promise<Contact[]> {

        try {
            const { data, error } = await supabase
                .from('customer_contacts')
                .select('*')
                .eq('customer_id', customerId)
                .eq('is_active', true)
                .order('is_primary', { ascending: false })
                .order('first_name');

            if (error) {
                throw new Error(`Failed to fetch contacts: ${error.message}`);
            }

            return data || [];

        } catch (error) {
            console.error('❌ Failed to fetch customer contacts:', error);
            throw new Error(`Failed to fetch contacts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get customer interactions
     */
    static async getCustomerInteractions(customerId: string, limit: number = 50): Promise<CustomerInteraction[]> {

        try {
            const { data, error } = await supabase
                .from('customer_interactions')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(`Failed to fetch interactions: ${error.message}`);
            }

            return data || [];

        } catch (error) {
            console.error('❌ Failed to fetch customer interactions:', error);
            throw new Error(`Failed to fetch interactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Log customer activity
     */
    private static async logCustomerActivity(
        customerId: string,
        action: string,
        details: any,
        userId: string
    ) {
        try {
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    entity_type: 'customer',
                    entity_id: customerId,
                    user_id: userId,
                    action,
                    details,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.warn('Failed to log customer activity:', error);
            }
        } catch (error) {
            console.warn('Activity logging failed:', error);
        }
    }

    /**
     * Export customer data
     */
    static exportCustomerData(customers: Customer[]): {
        csv: string;
        json: string;
    } {

        // CSV export
        const csvHeaders = [
            'Name',
            'Type',
            'Status',
            'Industry',
            'Email',
            'Phone',
            'Country',
            'City',
            'Annual Revenue',
            'Customer Tier',
            'Created Date'
        ];

        const csvRows = customers.map(customer => [
            customer.name,
            customer.customerType,
            customer.status,
            customer.industry || '',
            customer.email,
            customer.phone || '',
            customer.billingAddress?.country || '',
            customer.billingAddress?.city || '',
            customer.annualRevenue?.toString() || '',
            customer.customerTier || '',
            customer.createdAt || ''
        ]);

        const csvData = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        // JSON export
        const jsonData = JSON.stringify(customers, null, 2);

        return {
            csv: csvData,
            json: jsonData
        };
    }
}
