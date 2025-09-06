import { Project, Contact, ProjectDocument, ProjectActivity, WorkflowStage } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

interface ProjectDataOptions {
    includeContacts?: boolean;
    includeDocuments?: boolean;
    includeActivities?: boolean;
    includeWorkflow?: boolean;
    limit?: number;
    offset?: number;
}

interface ProjectWithRelations extends Project {
    contacts?: Contact[];
    documents?: ProjectDocument[];
    activities?: ProjectActivity[];
    workflowStage?: WorkflowStage;
}

class ProjectDataService {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Get project with all related data in a single optimized query
     */
    async getProjectWithRelations(
        projectId: string,
        options: ProjectDataOptions = {}
    ): Promise<ProjectWithRelations | null> {
        const cacheKey = `project-relations-${projectId}-${JSON.stringify(options)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // Build the query with all relationships
            let query = supabase
                .from('projects')
                .select(`
          *,
          customer_organization:organizations(*),
          current_stage:workflow_stages(*),
          contacts:point_of_contacts(
            id,
            organization_id,
            type,
            company_name,
            contact_name,
            email,
            phone,
            address,
            city,
            state,
            country,
            postal_code,
            website,
            tax_id,
            payment_terms,
            credit_limit,
            is_active,
            notes,
            metadata,
            ai_category,
            ai_capabilities,
            ai_risk_score,
            ai_last_analyzed,
            created_at,
            updated_at,
            created_by
          ),
          documents:documents(
            id,
            organization_id,
            project_id,
            file_name,
            title,
            description,
            file_size,
            file_type,
            file_path,
            mime_type,
            version,
            is_current_version,
            category,
            access_level,
            tags,
            metadata,
            created_at,
            updated_at,
            uploaded_by,
            approved_at,
            approved_by
          ),
          activities:activity_log(
            id,
            organization_id,
            user_id,
            project_id,
            entity_type,
            entity_id,
            action,
            description,
            old_values,
            new_values,
            metadata,
            ip_address,
            user_agent,
            created_at
          )
        `)
                .eq('id', projectId)
                .single();

            const { data, error } = await query;

            if (error) throw error;
            if (!data) return null;

            // Transform the data
            const projectWithRelations = this.transformProjectWithRelations(data, options);

            // Cache the result
            this.setCachedData(cacheKey, projectWithRelations);

            return projectWithRelations;
        } catch (error) {
            console.error('Error fetching project with relations:', error);
            return null;
        }
    }

    /**
     * Get multiple projects with relations (optimized batch query)
     */
    async getProjectsWithRelations(
        projectIds: string[],
        options: ProjectDataOptions = {}
    ): Promise<ProjectWithRelations[]> {
        if (projectIds.length === 0) return [];

        const cacheKey = `projects-relations-${projectIds.sort().join('-')}-${JSON.stringify(options)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            let query = supabase
                .from('projects')
                .select(`
          *,
          customer_organization:organizations(*),
          current_stage:workflow_stages(*),
          contacts:point_of_contacts(
            id,
            organization_id,
            type,
            company_name,
            contact_name,
            email,
            phone,
            is_active,
            created_at,
            updated_at
          ),
          documents:documents(
            id,
            file_name,
            title,
            category,
            created_at,
            uploaded_by
          ),
          activities:activity_log(
            id,
            action,
            description,
            created_at
          )
        `)
                .in('id', projectIds);

            if (options.limit) query = query.limit(options.limit);
            if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

            const { data, error } = await query;

            if (error) throw error;

            const projectsWithRelations = (data || []).map(project =>
                this.transformProjectWithRelations(project, options)
            );

            this.setCachedData(cacheKey, projectsWithRelations);

            return projectsWithRelations;
        } catch (error) {
            console.error('Error fetching projects with relations:', error);
            return [];
        }
    }

    /**
     * Get projects by organization with optimized queries
     */
    async getOrganizationProjects(
        organizationId: string,
        options: ProjectDataOptions & {
            status?: string;
            priority?: string;
            stage?: string;
            search?: string;
        } = {}
    ): Promise<ProjectWithRelations[]> {
        const cacheKey = `org-projects-${organizationId}-${JSON.stringify(options)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            let query = supabase
                .from('projects')
                .select(`
          *,
          customer_organization:organizations(*),
          current_stage:workflow_stages(*),
          contacts:point_of_contacts(
            id,
            company_name,
            contact_name,
            email,
            phone,
            is_active
          ),
          documents:documents(count),
          activities:activity_log(count)
        `)
                .eq('organization_id', organizationId);

            // Apply filters
            if (options.status) query = query.eq('status', options.status);
            if (options.priority) query = query.eq('priority_level', options.priority);
            if (options.stage) query = query.eq('current_stage_id', options.stage);
            if (options.search) {
                query = query.or(`title.ilike.%${options.search}%,project_id.ilike.%${options.search}%`);
            }

            // Apply pagination
            if (options.limit) query = query.limit(options.limit);
            if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            const projectsWithRelations = (data || []).map(project =>
                this.transformProjectWithRelations(project, options)
            );

            this.setCachedData(cacheKey, projectsWithRelations);

            return projectsWithRelations;
        } catch (error) {
            console.error('Error fetching organization projects:', error);
            return [];
        }
    }

    /**
     * Update project and related data in a transaction
     */
    async updateProjectWithRelations(
        projectId: string,
        updates: {
            project?: Partial<Project>;
            contacts?: { add?: string[]; remove?: string[] };
            documents?: { add?: Partial<ProjectDocument>[]; update?: Partial<ProjectDocument>[]; remove?: string[] };
        }
    ): Promise<ProjectWithRelations | null> {
        try {
            // Start a transaction-like operation
            const results: any[] = [];

            // Update project
            if (updates.project) {
                const { data, error } = await supabase
                    .from('projects')
                    .update(updates.project)
                    .eq('id', projectId)
                    .select()
                    .single();

                if (error) throw error;
                results.push(data);
            }

            // Update contacts
            if (updates.contacts?.add?.length) {
                const { error } = await supabase
                    .from('projects')
                    .update({
                        point_of_contacts: supabase.sql`array_cat(point_of_contacts, ${updates.contacts.add})`
                    })
                    .eq('id', projectId);

                if (error) throw error;
            }

            if (updates.contacts?.remove?.length) {
                const { error } = await supabase
                    .from('projects')
                    .update({
                        point_of_contacts: supabase.sql`array_remove(point_of_contacts, ${updates.contacts.remove})`
                    })
                    .eq('id', projectId);

                if (error) throw error;
            }

            // Update documents
            if (updates.documents?.add?.length) {
                const { error } = await supabase
                    .from('documents')
                    .insert(updates.documents.add.map(doc => ({ ...doc, project_id: projectId })));

                if (error) throw error;
            }

            if (updates.documents?.update?.length) {
                for (const docUpdate of updates.documents.update) {
                    const { id, ...updateData } = docUpdate;
                    const { error } = await supabase
                        .from('documents')
                        .update(updateData)
                        .eq('id', id);

                    if (error) throw error;
                }
            }

            if (updates.documents?.remove?.length) {
                const { error } = await supabase
                    .from('documents')
                    .delete()
                    .in('id', updates.documents.remove);

                if (error) throw error;
            }

            // Clear cache and refetch
            this.clearCache();
            return await this.getProjectWithRelations(projectId);
        } catch (error) {
            console.error('Error updating project with relations:', error);
            return null;
        }
    }

    /**
     * Get project analytics and metrics
     */
    async getProjectAnalytics(organizationId: string): Promise<{
        totalProjects: number;
        activeProjects: number;
        completedProjects: number;
        overdueProjects: number;
        totalValue: number;
        averageCompletionTime: number;
        stageDistribution: Record<string, number>;
        priorityDistribution: Record<string, number>;
    }> {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
          id,
          status,
          priority_level,
          current_stage_id,
          estimated_value,
          created_at,
          updated_at,
          estimated_delivery_date,
          actual_delivery_date,
          workflow_stages(name)
        `)
                .eq('organization_id', organizationId);

            if (error) throw error;

            const projects = data || [];
            const now = new Date();

            const analytics = {
                totalProjects: projects.length,
                activeProjects: projects.filter(p => p.status === 'active').length,
                completedProjects: projects.filter(p => p.status === 'completed').length,
                overdueProjects: projects.filter(p => {
                    if (!p.estimated_delivery_date || p.status === 'completed') return false;
                    return new Date(p.estimated_delivery_date) < now;
                }).length,
                totalValue: projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0),
                averageCompletionTime: this.calculateAverageCompletionTime(projects),
                stageDistribution: this.calculateStageDistribution(projects),
                priorityDistribution: this.calculatePriorityDistribution(projects)
            };

            return analytics;
        } catch (error) {
            console.error('Error getting project analytics:', error);
            return {
                totalProjects: 0,
                activeProjects: 0,
                completedProjects: 0,
                overdueProjects: 0,
                totalValue: 0,
                averageCompletionTime: 0,
                stageDistribution: {},
                priorityDistribution: {}
            };
        }
    }

    /**
     * Search projects with advanced filtering
     */
    async searchProjects(
        organizationId: string,
        searchParams: {
            query?: string;
            status?: string[];
            priority?: string[];
            stages?: string[];
            dateRange?: { start: Date; end: Date };
            customer?: string;
            assignedTo?: string;
            tags?: string[];
        },
        options: ProjectDataOptions = {}
    ): Promise<ProjectWithRelations[]> {
        try {
            let query = supabase
                .from('projects')
                .select(`
          *,
          customer_organization:organizations(*),
          current_stage:workflow_stages(*),
          contacts:point_of_contacts(
            id,
            company_name,
            contact_name,
            email,
            phone
          )
        `)
                .eq('organization_id', organizationId);

            // Apply search filters
            if (searchParams.query) {
                query = query.or(`title.ilike.%${searchParams.query}%,project_id.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%`);
            }

            if (searchParams.status?.length) {
                query = query.in('status', searchParams.status);
            }

            if (searchParams.priority?.length) {
                query = query.in('priority_level', searchParams.priority);
            }

            if (searchParams.stages?.length) {
                query = query.in('current_stage_id', searchParams.stages);
            }

            if (searchParams.dateRange) {
                query = query
                    .gte('created_at', searchParams.dateRange.start.toISOString())
                    .lte('created_at', searchParams.dateRange.end.toISOString());
            }

            if (searchParams.customer) {
                query = query.ilike('customer_organization_name', `%${searchParams.customer}%`);
            }

            if (searchParams.assignedTo) {
                query = query.eq('assigned_to', searchParams.assignedTo);
            }

            if (searchParams.tags?.length) {
                query = query.overlaps('tags', searchParams.tags);
            }

            // Apply pagination
            if (options.limit) query = query.limit(options.limit);
            if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            return (data || []).map(project => this.transformProjectWithRelations(project, options));
        } catch (error) {
            console.error('Error searching projects:', error);
            return [];
        }
    }

    /**
     * Transform database data to application format
     */
    private transformProjectWithRelations(data: any, options: ProjectDataOptions): ProjectWithRelations {
        const project: ProjectWithRelations = {
            // Core project fields
            id: data.id,
            organization_id: data.organization_id,
            project_id: data.project_id,
            title: data.title,
            description: data.description,
            customer_organization_id: data.customer_organization_id,
            point_of_contacts: data.point_of_contacts || [],
            current_stage_id: data.current_stage_id,
            status: data.status,
            priority_level: data.priority_level,
            priority_score: data.priority_score,
            source: data.source,
            assigned_to: data.assigned_to,
            created_by: data.created_by,
            estimated_value: data.estimated_value,
            tags: data.tags,
            metadata: data.metadata,
            stage_entered_at: data.stage_entered_at,
            project_type: data.project_type,
            intake_type: data.intake_type,
            intake_source: data.intake_source,
            notes: data.notes,
            created_at: data.created_at,
            updated_at: data.updated_at,
            estimated_delivery_date: data.estimated_delivery_date,
            actual_delivery_date: data.actual_delivery_date,

            // Relations
            customer_organization: data.customer_organization,
            current_stage: data.current_stage
        };

        // Add optional relations based on options
        if (options.includeContacts && data.contacts) {
            project.contacts = data.contacts;
        }

        if (options.includeDocuments && data.documents) {
            project.documents = data.documents;
        }

        if (options.includeActivities && data.activities) {
            project.activities = data.activities;
        }

        if (options.includeWorkflow && data.current_stage) {
            project.workflowStage = data.current_stage;
        }

        return project;
    }

    /**
     * Calculate average completion time
     */
    private calculateAverageCompletionTime(projects: any[]): number {
        const completedProjects = projects.filter(p => p.status === 'completed' && p.actual_delivery_date);
        if (completedProjects.length === 0) return 0;

        const totalTime = completedProjects.reduce((sum, p) => {
            const start = new Date(p.created_at);
            const end = new Date(p.actual_delivery_date);
            return sum + (end.getTime() - start.getTime());
        }, 0);

        return totalTime / completedProjects.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    /**
     * Calculate stage distribution
     */
    private calculateStageDistribution(projects: any[]): Record<string, number> {
        const distribution: Record<string, number> = {};

        projects.forEach(project => {
            const stageName = project.workflow_stages?.name || 'Unknown';
            distribution[stageName] = (distribution[stageName] || 0) + 1;
        });

        return distribution;
    }

    /**
     * Calculate priority distribution
     */
    private calculatePriorityDistribution(projects: any[]): Record<string, number> {
        const distribution: Record<string, number> = {};

        projects.forEach(project => {
            const priority = project.priority_level || 'unknown';
            distribution[priority] = (distribution[priority] || 0) + 1;
        });

        return distribution;
    }

    /**
     * Cache management
     */
    private getCachedData(key: string): any {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    private setCachedData(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    private clearCache(): void {
        this.cache.clear();
    }
}

export const projectDataService = new ProjectDataService();
