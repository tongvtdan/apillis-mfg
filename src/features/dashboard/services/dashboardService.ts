import { supabase } from '@/integrations/supabase/client.ts.js';
import { useAuth } from '@/core/auth';
import {
    DashboardWidget,
    DashboardLayout,
    KanbanBoard,
    KanbanCard,
    ManufacturingMetrics,
    DashboardFilters,
    TimeRange,
    dashboardWidgetSchema,
    dashboardLayoutSchema,
    kanbanBoardSchema,
    kanbanCardSchema
} from '../types/dashboard.types';

export class DashboardService {

    /**
     * Get dashboard layout for user/organization (in-memory only)
     */
    static async getDashboardLayout(organizationId: string, userId: string): Promise<DashboardLayout | null> {
        // Always return the default in-memory layout
        return this.createDefaultLayoutInMemory(organizationId, userId);
    }

    /**
     * Save dashboard layout (not supported - layouts are in-memory only)
     */
    static async saveDashboardLayout(layout: DashboardLayout, userId: string): Promise<void> {
        console.log('ℹ️ Dashboard layouts are in-memory only and cannot be saved');
        // No-op - layouts are not persisted
    }

    /**
     * Create default dashboard layout in memory (fallback when database is not available)
     */
    private static createDefaultLayoutInMemory(organizationId: string, userId: string): DashboardLayout {
        const defaultWidgets: DashboardWidget[] = [
            {
                id: 'metrics-overview',
                type: 'metrics',
                title: 'Key Metrics',
                size: 'large',
                position: { x: 0, y: 0, w: 12, h: 4 },
                config: {
                    layout: 'grid',
                    showTrends: true,
                    showIcons: true
                },
                dataSource: 'manufacturing_metrics',
                refreshInterval: 60,
                isVisible: true,
                createdBy: userId
            },
            {
                id: 'quick-stats',
                type: 'quick-stats',
                title: 'Quick Stats',
                size: 'small',
                position: { x: 0, y: 4, w: 3, h: 4 },
                config: {
                    showPriority: true,
                    showOverdue: true
                },
                dataSource: 'project_stats',
                refreshInterval: 300,
                isVisible: true,
                createdBy: userId
            },
            {
                id: 'project-overview',
                type: 'project-overview',
                title: 'Project Overview',
                size: 'large',
                position: { x: 3, y: 4, w: 9, h: 6 },
                config: {
                    showProgress: true,
                    showPriority: true,
                    limit: 6
                },
                dataSource: 'projects',
                refreshInterval: 300,
                isVisible: true,
                createdBy: userId
            },
            {
                id: 'recent-activities',
                type: 'recent-activities',
                title: 'Recent Activities',
                size: 'medium',
                position: { x: 0, y: 8, w: 6, h: 4 },
                config: {
                    limit: 5,
                    showIcons: true
                },
                dataSource: 'activity_log',
                refreshInterval: 60,
                isVisible: true,
                createdBy: userId
            },
            {
                id: 'project-kanban',
                type: 'kanban',
                title: 'Project Status',
                size: 'medium',
                position: { x: 6, y: 8, w: 6, h: 4 },
                config: {
                    showSwimlanes: false,
                    showFilters: true,
                    allowDragDrop: true
                },
                dataSource: 'projects',
                refreshInterval: 300,
                isVisible: true,
                createdBy: userId
            }
        ];

        return {
            id: `default-${organizationId}-${Date.now()}`,
            name: 'Manufacturing Dashboard',
            description: 'Default manufacturing operations dashboard',
            widgets: defaultWidgets,
            isDefault: true,
            isPublic: false,
            organizationId,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }


    /**
     * Get manufacturing metrics
     */
    static async getManufacturingMetrics(
        organizationId: string,
        filters: DashboardFilters
    ): Promise<ManufacturingMetrics> {

        try {
            console.log('📊 Fetching manufacturing metrics for organization:', organizationId);
            const timeRange = this.getTimeRangeDates(filters.timeRange, filters.customDateRange);
            const previousTimeRange = this.getPreviousPeriodRange(timeRange);

            // Get current period metrics
            const currentMetrics = await this.calculateMetricsForPeriod(organizationId, timeRange);

            // Get previous period metrics for comparison
            const previousMetrics = await this.calculateMetricsForPeriod(organizationId, previousTimeRange);

            const metrics = {
                totalProjects: currentMetrics.totalProjects || 0,
                activeProjects: currentMetrics.activeProjects || 0,
                completedProjects: currentMetrics.completedProjects || 0,
                onTimeDelivery: currentMetrics.onTimeDelivery || 0,
                qualityIncidents: currentMetrics.qualityIncidents || 0,
                totalRevenue: currentMetrics.totalRevenue || 0,
                averageOrderValue: currentMetrics.averageOrderValue || 0,
                profitMargin: currentMetrics.profitMargin || 0,
                outstandingInvoices: currentMetrics.outstandingInvoices || 0,
                totalCustomers: currentMetrics.totalCustomers || 0,
                activeCustomers: currentMetrics.activeCustomers || 0,
                customerSatisfaction: currentMetrics.customerSatisfaction || 0,
                newCustomersThisMonth: currentMetrics.newCustomersThisMonth || 0,
                totalSuppliers: currentMetrics.totalSuppliers || 0,
                activeSuppliers: currentMetrics.activeSuppliers || 0,
                supplierPerformance: currentMetrics.supplierPerformance || 0,
                openRFQs: currentMetrics.openRFQs || 0,
                utilizationRate: currentMetrics.utilizationRate || 0,
                capacityUtilization: currentMetrics.capacityUtilization || 0,
                leadTime: currentMetrics.leadTime || 0,
                inventoryTurnover: currentMetrics.inventoryTurnover || 0,
                periodStart: timeRange.start,
                periodEnd: timeRange.end,
                previousPeriodMetrics: previousMetrics
            };

            console.log('✅ Manufacturing metrics calculated:', {
                totalProjects: metrics.totalProjects,
                totalCustomers: metrics.totalCustomers,
                totalSuppliers: metrics.totalSuppliers
            });

            return metrics;

        } catch (error) {
            console.error('❌ Failed to get manufacturing metrics:', error);
            // Return empty metrics instead of throwing to prevent dashboard crash
            return this.getEmptyMetrics();
        }
    }

    /**
     * Calculate metrics for a specific time period
     */
    private static async calculateMetricsForPeriod(
        organizationId: string,
        timeRange: { start: string; end: string }
    ): Promise<Partial<ManufacturingMetrics>> {

        try {
            // Projects metrics - handle potential date range issues
            let projectsQuery = supabase
                .from('projects')
                .select('id, status, estimated_value, actual_value, created_at, actual_delivery_date')
                .eq('organization_id', organizationId as any);

            // Only add date filters if we have valid dates
            if (timeRange.start && timeRange.end) {
                projectsQuery = projectsQuery
                    .gte('created_at', timeRange.start)
                    .lte('created_at', timeRange.end);
            }

            const { data: projects, error: projectsError } = await projectsQuery;

            if (projectsError) {
                console.warn('⚠️ Projects query failed:', projectsError);
                return this.getEmptyMetrics();
            }

            // Customer organizations metrics - find organizations of type 'customer'
            let customersData = [];
            try {
                const { data: customers, error: customersError } = await supabase
                    .from('organizations')
                    .select('id, organization_type, is_active')
                    .eq('organization_type', 'customer' as any);

                if (customersError) {
                    console.warn('⚠️ Customer organizations query failed:', customersError.message);
                    // Don't fail the entire dashboard for this error
                    customersData = [];
                } else {
                    customersData = customers || [];
                }
            } catch (error) {
                console.warn('⚠️ Customer organizations query not available:', error.message);
                customersData = [];
            }

            // Supplier organizations metrics - find organizations of type 'supplier'
            let suppliersData = [];
            try {
                const { data: suppliers, error: suppliersError } = await supabase
                    .from('organizations')
                    .select('id, organization_type, is_active')
                    .eq('organization_type', 'supplier' as any);

                if (suppliersError) {
                    console.warn('⚠️ Supplier organizations query failed:', suppliersError);
                    // Don't fail the entire dashboard for this error
                    suppliersData = [];
                } else {
                    suppliersData = suppliers || [];
                }
            } catch (error) {
                console.warn('⚠️ Supplier organizations query not available:', error);
            }

            // Calculate metrics
            const projectsData = (projects as any[]) || [];

            const totalProjects = projectsData.length;
            const activeProjects = projectsData.filter((p: any) => p.status === 'inquiry' || p.status === 'reviewing' || p.status === 'quoted' || p.status === 'confirmed' || p.status === 'procurement' || p.status === 'production').length;
            const completedProjects = projectsData.filter((p: any) => p.status === 'completed').length;
            const totalRevenue = projectsData.reduce((sum: number, p: any) => sum + (p.actual_value || p.estimated_value || 0), 0);
            const averageOrderValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;

            // On-time delivery calculation (simplified)
            const completedWithDates = projectsData.filter((p: any) => p.actual_delivery_date && p.created_at);
            const onTimeDeliveries = completedWithDates.filter((p: any) => {
                // Simplified: assume projects should be completed within 30 days
                const created = new Date(p.created_at);
                const delivered = new Date(p.actual_delivery_date!);
                const daysDiff = (delivered.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
                return daysDiff <= 30;
            }).length;
            const onTimeDelivery = completedWithDates.length > 0 ? (onTimeDeliveries / completedWithDates.length) * 100 : 0;

            const totalCustomers = customersData.length;
            const activeCustomers = customersData.filter(c => c.is_active === true).length;

            const totalSuppliers = suppliersData.length;
            const activeSuppliers = suppliersData.filter(s => s.is_active === true).length;

            return {
                totalProjects,
                activeProjects,
                completedProjects,
                onTimeDelivery,
                totalRevenue,
                averageOrderValue,
                totalCustomers,
                activeCustomers,
                totalSuppliers,
                activeSuppliers,
                // Placeholder values for metrics that require more complex calculations
                qualityIncidents: 0,
                profitMargin: 25,
                outstandingInvoices: totalRevenue * 0.1,
                customerSatisfaction: 4.2,
                newCustomersThisMonth: Math.floor(totalCustomers * 0.1),
                supplierPerformance: 85,
                openRFQs: 5,
                utilizationRate: 78,
                capacityUtilization: 82,
                leadTime: 14,
                inventoryTurnover: 6.5
            };

        } catch (error) {
            console.error('❌ Error calculating metrics for period:', error);
            // Return partial metrics with zeros for failed calculations
            return {
                totalProjects: 0,
                activeProjects: 0,
                completedProjects: 0,
                onTimeDelivery: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                totalCustomers: 0, // Failed to get customers
                activeCustomers: 0,
                totalSuppliers: 0, // Failed to get suppliers
                activeSuppliers: 0,
                // Default values for other metrics
                qualityIncidents: 0,
                profitMargin: 25,
                outstandingInvoices: 0,
                customerSatisfaction: 4.2,
                newCustomersThisMonth: 0,
                supplierPerformance: 85,
                openRFQs: 5,
                utilizationRate: 78,
                capacityUtilization: 82,
                leadTime: 14,
                inventoryTurnover: 6.5
            };
        }
    }

    /**
     * Get time range dates
     */
    private static getTimeRangeDates(timeRange: TimeRange, customRange?: { start: string; end: string }) {
        const now = new Date();
        let start: Date;
        let end: Date = now;

        switch (timeRange) {
            case 'today':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'yesterday':
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                start = new Date(end);
                end.setHours(23, 59, 59, 999);
                break;
            case 'last_7_days':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'last_30_days':
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'last_90_days':
                start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'last_year':
                start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            case 'custom':
                if (customRange) {
                    start = new Date(customRange.start);
                    end = new Date(customRange.end);
                } else {
                    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                }
                break;
            default:
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        return {
            start: start.toISOString(),
            end: end.toISOString()
        };
    }

    /**
     * Get previous period range for comparison
     */
    private static getPreviousPeriodRange(currentRange: { start: string; end: string }) {
        const start = new Date(currentRange.start);
        const end = new Date(currentRange.end);
        const duration = end.getTime() - start.getTime();

        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - duration);

        return {
            start: prevStart.toISOString(),
            end: prevEnd.toISOString()
        };
    }

    /**
     * Get empty metrics (fallback)
     */
    private static getEmptyMetrics(): ManufacturingMetrics {
        return {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            onTimeDelivery: 0,
            qualityIncidents: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            profitMargin: 0,
            outstandingInvoices: 0,
            totalCustomers: 0,
            activeCustomers: 0,
            customerSatisfaction: 0,
            newCustomersThisMonth: 0,
            totalSuppliers: 0,
            activeSuppliers: 0,
            supplierPerformance: 0,
            openRFQs: 0,
            utilizationRate: 0,
            capacityUtilization: 0,
            leadTime: 0,
            inventoryTurnover: 0,
            periodStart: '',
            periodEnd: '',
            previousPeriodMetrics: {}
        };
    }

    /**
     * Get kanban board data
     */
    static async getKanbanData(organizationId: string, filters?: any): Promise<KanbanCard[]> {

        try {
            let query = supabase
                .from('projects')
                .select(`
                    id,
                    title,
                    description,
                    status,
                    priority,
                    created_by,
                    created_at,
                    updated_at,
                    due_date,
                    tags
                `)
                .eq('organization_id', organizationId as any);

            // Apply filters if provided
            if (filters?.status) {
                query = query.in('status', filters.status);
            }

            if (filters?.priority) {
                query = query.in('priority', filters.priority);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.warn('⚠️ Kanban data query failed:', error);
                return [];
            }

            return ((data as any[]) || []).map((project: any) => ({
                id: project.id,
                title: project.title,
                description: project.description,
                status: project.status,
                priority: project.priority,
                assignee: project.created_by,
                dueDate: project.due_date,
                tags: project.tags || [],
                metadata: {
                    createdAt: project.created_at,
                    updatedAt: project.updated_at
                },
                createdAt: project.created_at,
                updatedAt: project.updated_at,
                createdBy: project.created_by,
                updatedBy: project.created_by
            }));

        } catch (error) {
            console.error('❌ Failed to get kanban data:', error);
            return [];
        }
    }

    /**
     * Get chart data for analytics
     */
    static async getChartData(
        organizationId: string,
        dataSource: string,
        timeRange: TimeRange,
        filters?: any
    ): Promise<any> {

        try {
            const timeRangeDates = this.getTimeRangeDates(timeRange);

            switch (dataSource) {
                case 'revenue_analytics':
                    return await this.getRevenueChartData(organizationId, timeRangeDates);

                case 'project_status':
                    return await this.getProjectStatusChartData(organizationId, timeRangeDates);

                case 'customer_satisfaction':
                    return await this.getCustomerSatisfactionData(organizationId, timeRangeDates);

                default:
                    return { labels: [], datasets: [] };
            }

        } catch (error) {
            console.error('❌ Failed to get chart data:', error);
            return { labels: [], datasets: [] };
        }
    }

    /**
     * Get revenue chart data
     */
    private static async getRevenueChartData(organizationId: string, timeRange: { start: string; end: string }) {

        const { data, error } = await supabase
            .from('projects')
            .select('estimated_value, actual_value, created_at')
            .eq('organization_id', organizationId as any)
            .gte('created_at', timeRange.start)
            .lte('created_at', timeRange.end)
            .not('estimated_value', 'is', null);

        if (error) {
            console.warn('⚠️ Revenue chart query failed:', error);
            return { labels: [], datasets: [] };
        }

        const revenueByMonth = ((data as any[]) || []).reduce((acc: Record<string, number>, project: any) => {
            const month = new Date(project.created_at).toISOString().slice(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + (project.actual_value || project.estimated_value || 0);
            return acc;
        }, {} as Record<string, number>);

        const labels = Object.keys(revenueByMonth).sort();
        const values = labels.map(month => revenueByMonth[month]);

        return {
            labels,
            datasets: [{
                label: 'Revenue',
                data: values,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true
            }]
        };
    }

    /**
     * Get project status chart data
     */
    private static async getProjectStatusChartData(organizationId: string, timeRange: { start: string; end: string }) {

        const { data, error } = await supabase
            .from('projects')
            .select('status')
            .eq('organization_id', organizationId as any)
            .gte('created_at', timeRange.start)
            .lte('created_at', timeRange.end);

        if (error) {
            console.warn('⚠️ Project status chart query failed:', error);
            return { labels: [], datasets: [] };
        }

        const statusCounts = ((data as any[]) || []).reduce((acc: Record<string, number>, project: any) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#2563eb', // draft
                    '#f59e0b', // in_progress
                    '#10b981', // completed
                    '#ef4444'  // cancelled
                ]
            }]
        };
    }

    /**
     * Get customer satisfaction data
     */
    private static async getCustomerSatisfactionData(organizationId: string, timeRange: { start: string; end: string }) {

        // This would typically come from customer feedback/interactions
        // For now, return mock data
        return {
            value: 4.2,
            max: 5,
            thresholds: [2, 3, 4],
            colors: ['#ef4444', '#f59e0b', '#10b981']
        };
    }

    /**
     * Update widget configuration (not supported - widgets are in-memory only)
     */
    static async updateWidget(widgetId: string, updates: Partial<DashboardWidget>): Promise<void> {
        console.log('ℹ️ Widget updates are in-memory only and cannot be persisted');
        // No-op - widgets are not persisted
    }

    /**
     * Export dashboard configuration
     */
    static exportDashboardConfig(layout: DashboardLayout): string {

        const exportData = {
            layout: {
                name: layout.name,
                description: layout.description,
                widgets: layout.widgets.map(widget => ({
                    id: widget.id,
                    type: widget.type,
                    title: widget.title,
                    size: widget.size,
                    position: widget.position,
                    config: widget.config
                }))
            },
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(exportData, null, 2);
    }
}
