import { supabase } from '@/integrations/supabase/client';
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
    static async createSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Supplier> {

        console.log('🏢 Creating new supplier:', supplierData.name);

        try {
            // Validate supplier data
            const validatedData = supplierSchema.parse({
                ...supplierData,
                createdBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const { data, error } = await supabase
                .from('suppliers')
                .insert(validatedData)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create supplier: ${error.message}`);
            }

            // Log activity
            await this.logSupplierActivity(data.id, 'supplier_created', {
                supplierName: data.name,
                supplierType: data.supplierType
            }, userId);

            return data;

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

            const { data, error } = await supabase
                .from('suppliers')
                .update(updateData)
                .eq('id', supplierId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update supplier: ${error.message}`);
            }

            // Log activity
            await this.logSupplierActivity(supplierId, 'supplier_updated', {
                updatedFields: Object.keys(updates)
            }, userId);

            return data;

        } catch (error) {
            console.error('❌ Supplier update failed:', error);
            throw new Error(`Failed to update supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Search and filter suppliers
     */
    static async searchSuppliers(filters: SupplierSearchFilters, organizationId: string): Promise<SupplierSearchResult> {

        console.log('🔍 Searching suppliers with filters:', filters);

        try {
            let query = supabase
                .from('suppliers')
                .select('*', { count: 'exact' })
                .eq('organization_id', organizationId);

            // Apply filters
            if (filters.name) {
                query = query.ilike('name', `%${filters.name}%`);
            }

            if (filters.supplierType?.length) {
                query = query.in('supplier_type', filters.supplierType);
            }

            if (filters.status?.length) {
                query = query.in('status', filters.status);
            }

            if (filters.qualificationStatus?.length) {
                query = query.in('qualification_status', filters.qualificationStatus);
            }

            if (filters.country?.length) {
                query = query.in('country', filters.country);
            }

            if (filters.capabilities?.length) {
                // This would require a more complex query for array contains
                // For now, we'll filter in memory
            }

            if (filters.minRating) {
                query = query.gte('quality_rating', filters.minRating);
            }

            if (filters.maxRating) {
                query = query.lte('quality_rating', filters.maxRating);
            }

            const { data, error, count } = await query
                .order('name')
                .limit(100);

            if (error) {
                throw new Error(`Failed to search suppliers: ${error.message}`);
            }

            // Calculate facets
            const facets = this.calculateFacets(data || []);

            return {
                suppliers: data || [],
                totalCount: count || 0,
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
            const qualificationRecord = {
                supplier_id: supplierId,
                criteria_scores: qualificationData.criteria,
                overall_score: qualificationData.overallScore,
                recommendations: qualificationData.recommendations,
                valid_until: qualificationData.validUntil,
                approved_by: qualificationData.approvedBy,
                approved_at: new Date().toISOString(),
                created_by: userId
            };

            // Update supplier qualification status
            const { error: updateError } = await supabase
                .from('suppliers')
                .update({
                    qualification_status: 'qualified',
                    approved_by: qualificationData.approvedBy,
                    approved_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', supplierId);

            if (updateError) {
                throw new Error(`Failed to update supplier: ${updateError.message}`);
            }

            // Create qualification record
            const { error: qualError } = await supabase
                .from('supplier_qualifications')
                .insert(qualificationRecord);

            if (qualError) {
                throw new Error(`Failed to create qualification record: ${qualError.message}`);
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

            const { data, error } = await supabase
                .from('rfqs')
                .insert(validatedData)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create RFQ: ${error.message}`);
            }

            // Log activity
            await this.logRFQActivity(data.id, 'rfq_created', {
                title: data.title,
                supplierCount: data.suppliers.length,
                itemCount: data.items.length
            }, userId);

            return data;

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
                .from('rfqs')
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

            const { data, error } = await supabase
                .from('supplier_responses')
                .insert(validatedData)
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

            return data;

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

            const { data, error } = await supabase
                .from('supplier_performance')
                .select('*')
                .eq('supplier_id', supplierId)
                .eq('period', targetPeriod)
                .single();

            if (error && error.code !== 'PGRST116') { // Not found error
                throw new Error(`Failed to fetch supplier performance: ${error.message}`);
            }

            return data || null;

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

            const performanceData = {
                supplier_id: supplierId,
                period,
                metrics: updatedMetrics,
                score,
                grade: this.calculateGrade(score),
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('supplier_performance')
                .upsert(performanceData, {
                    onConflict: 'supplier_id,period'
                });

            if (error) {
                throw new Error(`Failed to update supplier performance: ${error.message}`);
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
                .from('rfqs')
                .select(`
                    *,
                    suppliers:rfq_suppliers(
                        supplier:suppliers(name, company_name)
                    ),
                    responses:supplier_responses(count)
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch RFQs: ${error.message}`);
            }

            return data || [];

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
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    entity_type: 'supplier',
                    entity_id: supplierId,
                    user_id: userId,
                    action,
                    details,
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
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    entity_type: 'rfq',
                    entity_id: rfqId,
                    user_id: userId,
                    action,
                    details,
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
}
