import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';

// Optimized field selection for different use cases
export const PROJECT_FIELDS = {
    // Minimal fields for list views
    LIST: `
    id,
    project_id,
    title,
    status,
    priority_level,
    current_stage_id,
    customer_id,
    assigned_to,
    created_at,
    updated_at,
    customer:contacts!customer_id(
      id,
      company_name,
      contact_name
    ),
    current_stage:workflow_stages!current_stage_id(
      id,
      name,
      stage_order
    )
  `,

    // Full fields for detail views
    DETAIL: `
    id,
    organization_id,
    project_id,
    title,
    description,
    customer_id,
    current_stage_id,
    status,
    priority_level,
    source,
    assigned_to,
    created_by,
    estimated_value,
    tags,
    metadata,
    stage_entered_at,
    project_type,
    notes,
    created_at,
    updated_at,
    customer:contacts!customer_id(
      id,
      company_name,
      contact_name,
      email,
      phone,
      type,
      is_active
    ),
                current_stage:workflow_stages!current_stage_id(
                id,
                name,
                description,
                stage_order,
                is_active,
                estimated_duration_days
            )
  `,

    // Summary fields for dashboard/analytics
    SUMMARY: `
    id,
    project_id,
    title,
    status,
    priority_level,
    current_stage_id,
    estimated_value,
    created_at,
    stage_entered_at,
    current_stage:workflow_stages!current_stage_id(
      name,
      stage_order
    )
  `
};

export interface ProjectQueryOptions {
    status?: string | string[];
    priority?: string | string[];
    projectType?: string;
    customerId?: string;
    assignedTo?: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    search?: string;
    dateRange?: {
        start: string;
        end: string;
        field?: 'created_at' | 'updated_at' | 'stage_entered_at';
    };
}

export class ProjectQueryBuilder {
    private query: any;

    constructor(fields: string = PROJECT_FIELDS.LIST) {
        this.query = supabase.from('projects').select(fields);
    }

    // Apply filters
    applyFilters(options: ProjectQueryOptions) {
        if (options.status) {
            if (Array.isArray(options.status)) {
                this.query = this.query.in('status', options.status);
            } else {
                this.query = this.query.eq('status', options.status);
            }
        }

        if (options.priority) {
            if (Array.isArray(options.priority)) {
                this.query = this.query.in('priority_level', options.priority);
            } else {
                this.query = this.query.eq('priority_level', options.priority);
            }
        }

        if (options.projectType) {
            this.query = this.query.eq('project_type', options.projectType);
        }

        if (options.customerId) {
            this.query = this.query.eq('customer_id', options.customerId);
        }

        if (options.assignedTo) {
            this.query = this.query.eq('assigned_to', options.assignedTo);
        }

        if (options.organizationId) {
            this.query = this.query.eq('organization_id', options.organizationId);
        }

        if (options.search) {
            this.query = this.query.or(`title.ilike.%${options.search}%,project_id.ilike.%${options.search}%,description.ilike.%${options.search}%`);
        }

        if (options.dateRange) {
            const field = options.dateRange.field || 'created_at';
            this.query = this.query
                .gte(field, options.dateRange.start)
                .lte(field, options.dateRange.end);
        }

        return this;
    }

    // Apply ordering
    applyOrdering(orderBy: string = 'created_at', direction: 'asc' | 'desc' = 'desc') {
        this.query = this.query.order(orderBy, { ascending: direction === 'asc' });
        return this;
    }

    // Apply pagination
    applyPagination(limit?: number, offset?: number) {
        if (limit) {
            this.query = this.query.limit(limit);
        }

        if (offset) {
            this.query = this.query.range(offset, offset + (limit || 50) - 1);
        }

        return this;
    }

    // Execute query
    async execute(): Promise<{ data: Project[] | null; error: any; count?: number }> {
        return await this.query;
    }

    // Execute with count
    async executeWithCount(): Promise<{ data: Project[] | null; error: any; count: number }> {
        const result = await this.query;

        // Get total count with same filters (without pagination)
        const countQuery = supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        // Apply same filters for count (this is a simplified version)
        const { count } = await countQuery;

        return {
            ...result,
            count: count || 0
        };
    }
}

// Convenience functions for common queries
export const projectQueries = {
    // Get all projects with basic info
    getProjectsList: async (options: ProjectQueryOptions = {}) => {
        const builder = new ProjectQueryBuilder(PROJECT_FIELDS.LIST);
        return builder
            .applyFilters(options)
            .applyOrdering(options.orderBy, options.orderDirection)
            .applyPagination(options.limit, options.offset)
            .execute();
    },

    // Get project by ID with full details
    getProjectById: async (id: string) => {
        const builder = new ProjectQueryBuilder(PROJECT_FIELDS.DETAIL);
        builder.query = builder.query.eq('id', id).single();
        return builder.execute();
    },

    // Get projects summary for dashboard
    getProjectsSummary: async (options: ProjectQueryOptions = {}) => {
        const builder = new ProjectQueryBuilder(PROJECT_FIELDS.SUMMARY);
        return builder
            .applyFilters(options)
            .applyOrdering(options.orderBy, options.orderDirection)
            .execute();
    },

    // Get active projects only
    getActiveProjects: async (options: Omit<ProjectQueryOptions, 'status'> = {}) => {
        return projectQueries.getProjectsList({
            ...options,
            status: ['active', 'inquiry_received', 'technical_review', 'supplier_rfq_sent', 'quoted', 'order_confirmed', 'procurement_planning', 'in_production']
        });
    },

    // Get projects by stage
    getProjectsByStage: async (stageId: string, options: Omit<ProjectQueryOptions, 'status'> = {}) => {
        const builder = new ProjectQueryBuilder(PROJECT_FIELDS.LIST);
        builder.query = builder.query.eq('current_stage_id', stageId);
        return builder
            .applyFilters(options)
            .applyOrdering(options.orderBy, options.orderDirection)
            .applyPagination(options.limit, options.offset)
            .execute();
    },

    // Get projects assigned to user
    getUserProjects: async (userId: string, options: Omit<ProjectQueryOptions, 'assignedTo'> = {}) => {
        return projectQueries.getProjectsList({
            ...options,
            assignedTo: userId
        });
    }
};

// Query key generator for caching
export const generateProjectQueryKey = (queryType: string, options: ProjectQueryOptions = {}): string => {
    const keyData = {
        type: queryType,
        ...options
    };

    // Sort keys for consistent cache keys
    const sortedData = Object.keys(keyData)
        .sort()
        .reduce((result, key) => {
            const value = keyData[key as keyof typeof keyData];
            if (value !== undefined && value !== null) {
                result[key] = value;
            }
            return result;
        }, {} as Record<string, any>);

    return btoa(JSON.stringify(sortedData)).replace(/[^a-zA-Z0-9]/g, '');
};