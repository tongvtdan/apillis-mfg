import { supabase } from '@/integrations/supabase/client';
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
     * Get dashboard layout for user/organization
     */
    static async getDashboardLayout(organizationId: string, userId: string): Promise<DashboardLayout | null> {

        try {
            // First try to get user's custom layout
            let { data: userLayout, error: userError } = await supabase
                .from('dashboard_layouts')
                .select('*')
                .eq('organization_id', organizationId)
                .eq('created_by', userId)
                .eq('is_default', false)
                .single();

            if (userLayout && !userError) {
                return this.transformLayoutData(userLayout);
            }

            // If no user layout, get organization default
            const { data: defaultLayout, error: defaultError } = await supabase
                .from('dashboard_layouts')
                .select('*')
                .eq('organization_id', organizationId)
                .eq('is_default', true)
                .single();

            if (defaultLayout && !defaultError) {
                return this.transformLayoutData(defaultLayout);
            }

            // If no layouts exist, create default
            return await this.createDefaultLayout(organizationId, userId);

        } catch (error) {
            console.error('❌ Failed to get dashboard layout:', error);
            return null;
        }
    }

    /**
     * Save dashboard layout
     */
    static async saveDashboardLayout(layout: DashboardLayout, userId: string): Promise<void> {

        try {
            const layoutData = {
                ...layout,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('dashboard_layouts')
                .upsert(layoutData, {
                    onConflict: 'id'
                });

            if (error) {
                throw new Error(`Failed to save layout: ${error.message}`);
            }

        } catch (error) {
            console.error('❌ Failed to save dashboard layout:', error);
            throw new Error(`Failed to save dashboard layout: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create default dashboard layout
     */
    private static async createDefaultLayout(organizationId: string, userId: string): Promise<DashboardLayout> {

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
                createdBy: userId
            },
            {
                id: 'recent-activities',
                type: 'recent-activities',
                title: 'Recent Activities',
                size: 'medium',
                position: { x: 0, y: 8, w: 6, h: 4 },
                config: {
                    limit: 10,
                    showIcons: true
                },
                dataSource: 'activity_log',
                refreshInterval: 60,
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
                createdBy: userId
            },
            {
                id: 'revenue-chart',
                type: 'chart',
                title: 'Revenue Trends',
                size: 'medium',
                position: { x: 0, y: 12, w: 6, h: 4 },
                config: {
                    chartType: 'line',
                    showLegend: true,
                    showGrid: true,
                    animation: true
                },
                dataSource: 'revenue_analytics',
                refreshInterval: 3600,
                createdBy: userId
            },
            {
                id: 'customer-satisfaction',
                type: 'gauge',
                title: 'Customer Satisfaction',
                size: 'small',
                position: { x: 6, y: 12, w: 3, h: 4 },
                config: {
                    min: 0,
                    max: 5,
                    thresholds: [2, 3, 4]
                },
                dataSource: 'customer_satisfaction',
                refreshInterval: 3600,
                createdBy: userId
            },
            {
                id: 'supplier-performance',
                type: 'table',
                title: 'Top Suppliers',
                size: 'small',
                position: { x: 9, y: 12, w: 3, h: 4 },
                config: {
                    columns: ['name', 'performance', 'onTimeDelivery'],
                    sortBy: 'performance',
                    limit: 5
                },
                dataSource: 'supplier_performance',
                refreshInterval: 3600,
                createdBy: userId
            }
        ];

        const defaultLayout: DashboardLayout = {
            id: `default-${organizationId}`,
            name: 'Manufacturing Dashboard',
            description: 'Default manufacturing operations dashboard',
            widgets: defaultWidgets,
            theme: 'auto',
            isDefault: true,
            isPublic: false,
            organizationId,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await this.saveDashboardLayout(defaultLayout, userId);
        return defaultLayout;
    }

    /**
     * Transform layout data from database format
     */
    private static transformLayoutData(data: any): DashboardLayout {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            widgets: data.widgets || [],
            backgroundColor: data.background_color,
            theme: data.theme || 'auto',
            isDefault: data.is_default || false,
            isPublic: data.is_public || false,
            organizationId: data.organization_id,
            createdBy: data.created_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at
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
            const timeRange = this.getTimeRangeDates(filters.timeRange, filters.customDateRange);
            const previousTimeRange = this.getPreviousPeriodRange(timeRange);

            // Get current period metrics
            const currentMetrics = await this.calculateMetricsForPeriod(organizationId, timeRange);

            // Get previous period metrics for comparison
            const previousMetrics = await this.calculateMetricsForPeriod(organizationId, previousTimeRange);

            return {
                ...currentMetrics,
                periodStart: timeRange.start,
                periodEnd: timeRange.end,
                previousPeriodMetrics: previousMetrics
            };

        } catch (error) {
            console.error('❌ Failed to get manufacturing metrics:', error);
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

        // Projects metrics
        const { data: projects } = await supabase
            .from('projects')
            .select('id, status, total_value, created_at, completed_at')
            .eq('organization_id', organizationId)
            .gte('created_at', timeRange.start)
            .lte('created_at', timeRange.end);

        // Customers metrics
        const { data: customers } = await supabase
            .from('customers')
            .select('id, status, annual_revenue')
            .eq('organization_id', organizationId);

        // Suppliers metrics
        const { data: suppliers } = await supabase
            .from('suppliers')
            .select('id, status')
            .eq('organization_id', organizationId);

        // Calculate metrics
        const projectsData = projects || [];
        const customersData = customers || [];
        const suppliersData = suppliers || [];

        const totalProjects = projectsData.length;
        const activeProjects = projectsData.filter(p => p.status === 'in_progress').length;
        const completedProjects = projectsData.filter(p => p.status === 'completed').length;
        const totalRevenue = projectsData.reduce((sum, p) => sum + (p.total_value || 0), 0);
        const averageOrderValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;

        // On-time delivery calculation (simplified)
        const completedWithDates = projectsData.filter(p => p.completed_at && p.created_at);
        const onTimeDeliveries = completedWithDates.filter(p => {
            // Simplified: assume projects should be completed within 30 days
            const created = new Date(p.created_at);
            const completed = new Date(p.completed_at!);
            const daysDiff = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
        }).length;
        const onTimeDelivery = completedWithDates.length > 0 ? (onTimeDeliveries / completedWithDates.length) * 100 : 0;

        const totalCustomers = customersData.length;
        const activeCustomers = customersData.filter(c => c.status === 'active').length;

        const totalSuppliers = suppliersData.length;
        const activeSuppliers = suppliersData.filter(s => s.status === 'active').length;

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
                .eq('organization_id', organizationId);

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
                throw new Error(`Failed to fetch kanban data: ${error.message}`);
            }

            return (data || []).map(project => ({
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

        const { data } = await supabase
            .from('projects')
            .select('total_value, created_at')
            .eq('organization_id', organizationId)
            .gte('created_at', timeRange.start)
            .lte('created_at', timeRange.end)
            .not('total_value', 'is', null);

        const revenueByMonth = (data || []).reduce((acc, project) => {
            const month = new Date(project.created_at).toISOString().slice(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + (project.total_value || 0);
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

        const { data } = await supabase
            .from('projects')
            .select('status')
            .eq('organization_id', organizationId)
            .gte('created_at', timeRange.start)
            .lte('created_at', timeRange.end);

        const statusCounts = (data || []).reduce((acc, project) => {
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
     * Update widget configuration
     */
    static async updateWidget(widgetId: string, updates: Partial<DashboardWidget>): Promise<void> {

        try {
            const { error } = await supabase
                .from('dashboard_widgets')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', widgetId);

            if (error) {
                throw new Error(`Failed to update widget: ${error.message}`);
            }

        } catch (error) {
            console.error('❌ Failed to update widget:', error);
            throw new Error(`Failed to update widget: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
