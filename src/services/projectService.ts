import { Project, Contact, WorkflowStage } from '@/types/project';
// Mock project data removed - using database only

// Environment flag to control data source - force Supabase mode
const USE_MOCK_DATA = false;

// Connection timeout for Supabase calls
const CONNECTION_TIMEOUT = 5000; // 5 seconds

interface ProjectServiceOptions {
    forceMock?: boolean;
    timeout?: number;
}

class ProjectService {
    private useMockData: boolean;
    private connectionTimeout: number;

    constructor() {
        this.useMockData = USE_MOCK_DATA;
        this.connectionTimeout = CONNECTION_TIMEOUT;
    }

    // Set whether to use mock data
    setUseMockData(useMock: boolean) {
        this.useMockData = useMock;
        console.log(`🔄 ProjectService: Switched to ${useMock ? 'MOCK' : 'SUPABASE'} data mode`);
    }

    // Get project by ID with fallback
    async getProjectById(id: string, options: ProjectServiceOptions = {}): Promise<Project> {
        const { forceMock = false, timeout = this.connectionTimeout } = options;

        console.log(`🔍 ProjectService: Fetching project ${id} (mode: ${forceMock ? 'MOCK' : 'SUPABASE'})`);

        // If forced to use mock data, return error since mock data is not available
        if (forceMock) {
            throw new Error(`Mock data is not available. Please use Supabase mode.`);
        }

        // Try Supabase with timeout
        try {
            const supabaseProject = await this.getSupabaseProjectWithTimeout(id, timeout);
            console.log('✅ ProjectService: Successfully fetched from Supabase');
            return supabaseProject;
        } catch (error) {
            console.error('❌ ProjectService: Failed to fetch project from Supabase:', error);
            throw new Error(`Project with ID "${id}" not found`);
        }
    }

    // Get all projects with fallback and filtering options
    async getAllProjects(options: ProjectServiceOptions & {
        status?: string;
        priority?: string;
        limit?: number;
        offset?: number;
        orderBy?: string;
        orderDirection?: 'asc' | 'desc';
    } = {}): Promise<Project[]> {
        const {
            forceMock = false,
            timeout = this.connectionTimeout,
            status,
            priority,
            limit,
            offset,
            orderBy = 'created_at',
            orderDirection = 'desc'
        } = options;

        console.log(`📊 ProjectService: Fetching projects with filters:`, {
            status, priority, limit, offset, orderBy, orderDirection
        });

        // If forced to use mock data, return empty array since mock data is not available
        if (forceMock) {
            console.warn('⚠️ ProjectService: Mock data requested but not available, returning empty array');
            return [];
        }

        // Try Supabase with timeout and filtering
        try {
            const supabaseProjects = await this.getSupabaseProjectsWithTimeout(timeout, {
                status, priority, limit, offset, orderBy, orderDirection
            });
            console.log(`✅ ProjectService: Successfully fetched ${supabaseProjects.length} projects from Supabase`);
            return supabaseProjects;
        } catch (error) {
            console.warn('⚠️ ProjectService: Supabase failed, returning empty array:', error);
            return [];
        }
    }

    // Test connection to Supabase
    async testConnection(): Promise<{ success: boolean; error?: string; source: 'supabase' | 'mock' }> {
        try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data, error } = await supabase
                .from('projects')
                .select('id')
                .limit(1);

            if (error) throw error;

            console.log('✅ ProjectService: Supabase connection test successful');
            return { success: true, source: 'supabase' };
        } catch (error: any) {
            console.warn('⚠️ ProjectService: Supabase connection test failed:', error);
            return {
                success: false,
                error: error?.message || 'Unknown error',
                source: 'supabase'
            };
        }
    }

    // Private method to get mock project
    private getMockProject(id: string): Project {
        throw new Error(`Mock project with ID "${id}" not found - mock data not available`);
    }

    // Private method to get Supabase project with timeout
    private async getSupabaseProjectWithTimeout(id: string, timeout: number): Promise<Project> {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Supabase connection timeout after ${timeout}ms`));
            }, timeout);

            try {
                // Dynamic import to avoid issues if Supabase is not available
                const { supabase } = await import('@/integrations/supabase/client');

                // Optimized query with selective field specification to reduce data transfer
                const { data, error } = await supabase
                    .from('projects')
                    .select(`
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
                order_index,
                is_active,
                estimated_duration_days
            )
          `)
                    .eq('id', id)
                    .single();

                clearTimeout(timeoutId);

                if (error) {
                    throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`);
                }

                if (!data) {
                    throw new Error(`Project with ID "${id}" not found in Supabase`);
                }

                // Transform database data to match frontend interface expectations
                const mappedProject = this.transformProjectData(data);

                resolve(mappedProject);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    // Private method to get all Supabase projects with timeout and filtering
    private async getSupabaseProjectsWithTimeout(timeout: number, filters: {
        status?: string;
        priority?: string;
        limit?: number;
        offset?: number;
        orderBy?: string;
        orderDirection?: 'asc' | 'desc';
    } = {}): Promise<Project[]> {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Supabase connection timeout after ${timeout}ms`));
            }, timeout);

            try {
                // Dynamic import to avoid issues if Supabase is not available
                const { supabase } = await import('@/integrations/supabase/client');

                // Build optimized query with filtering and pagination
                let query = supabase
                    .from('projects')
                    .select(`
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
                order_index,
                is_active,
                estimated_duration_days
            )
          `);

                // Apply filters
                if (filters.status) {
                    query = query.eq('status', filters.status);
                }
                if (filters.priority) {
                    query = query.eq('priority_level', filters.priority);
                }

                // Apply ordering
                const orderDirection = filters.orderDirection === 'asc' ? true : false;
                query = query.order(filters.orderBy || 'created_at', { ascending: orderDirection });

                // Apply pagination
                if (filters.limit) {
                    query = query.limit(filters.limit);
                }
                if (filters.offset) {
                    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
                }

                const { data, error } = await query;

                clearTimeout(timeoutId);

                if (error) {
                    throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`);
                }

                // Transform database data to match frontend interface expectations
                const mappedProjects = (data || []).map(project => this.transformProjectData(project));

                resolve(mappedProjects);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    // Private method to transform database data to frontend format
    private transformProjectData(data: any): Project {
        if (!data) {
            throw new Error('No project data provided for transformation');
        }

        try {
            // Handle nullable fields properly with proper type checking
            const transformedProject: Project = {
                // Core database fields - direct mapping with type safety
                id: this.validateString(data.id, 'id'),
                organization_id: this.validateString(data.organization_id, 'organization_id'),
                project_id: this.validateString(data.project_id, 'project_id'),
                title: this.validateString(data.title, 'title'),
                description: this.validateOptionalString(data.description),
                customer_id: this.validateOptionalString(data.customer_id),
                current_stage_id: this.validateOptionalString(data.current_stage_id),
                status: this.validateString(data.status, 'status'),
                priority_level: this.validateString(data.priority_level, 'priority_level'),
                source: this.validateString(data.source, 'source'),
                assigned_to: this.validateOptionalString(data.assigned_to),
                created_by: this.validateOptionalString(data.created_by),
                estimated_value: this.validateOptionalNumber(data.estimated_value),
                tags: this.validateOptionalArray(data.tags),
                metadata: this.transformJsonbField(data.metadata),
                stage_entered_at: this.transformTimestamp(data.stage_entered_at),
                project_type: this.validateOptionalString(data.project_type),
                notes: this.validateOptionalString(data.notes),
                created_at: this.transformTimestamp(data.created_at, true),
                updated_at: this.transformTimestamp(data.updated_at, true),

                // Joined/computed fields
                customer: data.customer ? this.transformContactData(data.customer) : undefined,
                current_stage: data.current_stage ? this.transformWorkflowStageData(data.current_stage) : undefined,

                // Calculated fields
                days_in_stage: this.calculateDaysInStage(data.stage_entered_at)
            };

            return transformedProject;
        } catch (error) {
            console.error('Error transforming project data:', error);
            throw new Error(`Failed to transform project data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Private method to transform contact data
    private transformContactData(data: any): Contact {
        if (!data) return data;

        try {
            return {
                id: this.validateString(data.id, 'contact.id'),
                organization_id: this.validateString(data.organization_id, 'contact.organization_id'),
                type: data.type as 'customer' | 'supplier',
                company_name: this.validateString(data.company_name, 'contact.company_name'),
                contact_name: this.validateOptionalString(data.contact_name),
                email: this.validateOptionalString(data.email),
                phone: this.validateOptionalString(data.phone),
                address: this.validateOptionalString(data.address),
                city: this.validateOptionalString(data.city),
                state: this.validateOptionalString(data.state),
                country: this.validateOptionalString(data.country),
                postal_code: this.validateOptionalString(data.postal_code),
                website: this.validateOptionalString(data.website),
                tax_id: this.validateOptionalString(data.tax_id),
                payment_terms: this.validateOptionalString(data.payment_terms),
                credit_limit: this.validateOptionalNumber(data.credit_limit),
                is_active: Boolean(data.is_active),
                notes: this.validateOptionalString(data.notes),
                created_at: this.transformTimestamp(data.created_at, true)!,
                updated_at: this.transformTimestamp(data.updated_at, true)!,
                // Legacy/optional fields with proper transformation
                metadata: this.transformJsonbField(data.metadata),
                ai_category: this.transformJsonbField(data.ai_category),
                ai_capabilities: this.validateOptionalArray(data.ai_capabilities),
                ai_risk_score: this.validateOptionalNumber(data.ai_risk_score),
                ai_last_analyzed: this.transformTimestamp(data.ai_last_analyzed),
                created_by: this.validateOptionalString(data.created_by)
            };
        } catch (error) {
            console.error('Error transforming contact data:', error);
            throw new Error(`Failed to transform contact data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Private method to transform workflow stage data
    private transformWorkflowStageData(data: any): WorkflowStage {
        if (!data) return data;

        try {
            return {
                id: this.validateString(data.id, 'workflow_stage.id'),
                name: this.validateString(data.name, 'workflow_stage.name'),
                description: this.validateOptionalString(data.description),
                order_index: this.validateRequiredNumber(data.order_index, 'workflow_stage.order_index'),
                is_active: Boolean(data.is_active),
                estimated_duration_days: this.validateOptionalNumber(data.estimated_duration_days),
                required_approvals: this.transformJsonbArrayField(data.required_approvals),
                auto_advance_conditions: this.transformJsonbField(data.auto_advance_conditions),
                created_at: this.transformTimestamp(data.created_at, true)!,
                updated_at: this.transformTimestamp(data.updated_at, true)!
            };
        } catch (error) {
            console.error('Error transforming workflow stage data:', error);
            throw new Error(`Failed to transform workflow stage data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Method to create a new project
    async createProject(projectData: Partial<Project>): Promise<Project> {
        try {
            const { supabase } = await import('@/integrations/supabase/client');

            // Validate required fields
            if (!projectData.title) {
                throw new Error('Project title is required');
            }
            if (!projectData.organization_id) {
                throw new Error('Organization ID is required');
            }

            // Prepare data for database insertion
            const insertData = {
                organization_id: projectData.organization_id,
                project_id: projectData.project_id,
                title: projectData.title,
                description: projectData.description || null,
                customer_id: projectData.customer_id || null,
                current_stage_id: projectData.current_stage_id || null,
                status: projectData.status || 'active',
                priority_level: projectData.priority_level || 'medium',
                source: projectData.source || 'portal',
                assigned_to: projectData.assigned_to || null,
                created_by: projectData.created_by || null,
                estimated_value: projectData.estimated_value || null,
                tags: projectData.tags || null,
                metadata: projectData.metadata || {},
                stage_entered_at: projectData.stage_entered_at || new Date().toISOString(),
                project_type: projectData.project_type || null,
                notes: projectData.notes || null
            };

            const { data, error } = await supabase
                .from('projects')
                .insert(insertData)
                .select(`
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
                    current_stage:workflow_stages!current_stage_id(
                        id,
                        name,
                        description,
                        order_index,
                        is_active,
                        estimated_duration_days,
                        required_approvals,
                        auto_advance_conditions,
                        created_at,
                        updated_at
                    )
                `)
                .single();

            if (error) {
                console.error('Database error creating project:', error);

                // Handle specific constraint violations
                if (error.code === '23505') { // Unique constraint violation
                    if (error.message.includes('project_id')) {
                        throw new Error('A project with this ID already exists. Please use a different project ID.');
                    }
                    throw new Error('This project conflicts with an existing record. Please check your data.');
                }

                if (error.code === '23503') { // Foreign key constraint violation
                    if (error.message.includes('customer_id')) {
                        throw new Error('The specified customer does not exist. Please select a valid customer.');
                    }
                    if (error.message.includes('current_stage_id')) {
                        throw new Error('The specified workflow stage does not exist. Please select a valid stage.');
                    }
                    if (error.message.includes('assigned_to')) {
                        throw new Error('The specified assignee does not exist. Please select a valid user.');
                    }
                    if (error.message.includes('created_by')) {
                        throw new Error('The specified creator does not exist. Please select a valid user.');
                    }
                    if (error.message.includes('organization_id')) {
                        throw new Error('The specified organization does not exist. Please select a valid organization.');
                    }
                    throw new Error('One or more referenced records do not exist. Please check your data.');
                }

                if (error.code === '23514') { // Check constraint violation
                    if (error.message.includes('status')) {
                        throw new Error('Invalid project status. Must be one of: active, on_hold, delayed, cancelled, completed.');
                    }
                    if (error.message.includes('priority_level')) {
                        throw new Error('Invalid priority level. Must be one of: low, medium, high, urgent.');
                    }
                    throw new Error('Invalid data provided. Please check your input values.');
                }

                if (error.code === '23502') { // Not null constraint violation
                    throw new Error('Required fields are missing. Please provide all required information.');
                }

                throw new Error(`Failed to create project: ${error.message} (Code: ${error.code})`);
            }

            if (!data) {
                throw new Error('No data returned from project creation');
            }

            return this.transformProjectData(data);
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    // Method to update a project
    async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
        try {
            const { supabase } = await import('@/integrations/supabase/client');

            // Prepare data for database update - only include fields that exist in database
            const updateData: any = {};

            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.customer_id !== undefined) updateData.customer_id = updates.customer_id;
            if (updates.current_stage_id !== undefined) updateData.current_stage_id = updates.current_stage_id;
            if (updates.status !== undefined) updateData.status = updates.status;
            if (updates.priority_level !== undefined) updateData.priority_level = updates.priority_level;
            if (updates.source !== undefined) updateData.source = updates.source;
            if (updates.assigned_to !== undefined) updateData.assigned_to = updates.assigned_to;
            if (updates.estimated_value !== undefined) updateData.estimated_value = updates.estimated_value;
            if (updates.tags !== undefined) updateData.tags = updates.tags;
            if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
            if (updates.stage_entered_at !== undefined) updateData.stage_entered_at = updates.stage_entered_at;
            if (updates.project_type !== undefined) updateData.project_type = updates.project_type;
            if (updates.notes !== undefined) updateData.notes = updates.notes;

            // Always update the updated_at timestamp
            updateData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('projects')
                .update(updateData)
                .eq('id', id)
                .select(`
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
                    current_stage:workflow_stages!current_stage_id(
                        id,
                        name,
                        description,
                        order_index,
                        is_active,
                        estimated_duration_days,
                        required_approvals,
                        auto_advance_conditions,
                        created_at,
                        updated_at
                    )
                `)
                .single();

            if (error) {
                console.error('Database error updating project:', error);

                // Handle specific constraint violations
                if (error.code === '23505') { // Unique constraint violation
                    if (error.message.includes('project_id')) {
                        throw new Error('A project with this ID already exists. Please use a different project ID.');
                    }
                    throw new Error('This project conflicts with an existing record. Please check your data.');
                }

                if (error.code === '23503') { // Foreign key constraint violation
                    if (error.message.includes('customer_id')) {
                        throw new Error('The specified customer does not exist. Please select a valid customer.');
                    }
                    if (error.message.includes('current_stage_id')) {
                        throw new Error('The specified workflow stage does not exist. Please select a valid stage.');
                    }
                    if (error.message.includes('assigned_to')) {
                        throw new Error('The specified assignee does not exist. Please select a valid user.');
                    }
                    if (error.message.includes('organization_id')) {
                        throw new Error('The specified organization does not exist. Please select a valid organization.');
                    }
                    throw new Error('One or more referenced records do not exist. Please check your data.');
                }

                if (error.code === '23514') { // Check constraint violation
                    if (error.message.includes('status')) {
                        throw new Error('Invalid project status. Must be one of: active, on_hold, delayed, cancelled, completed.');
                    }
                    if (error.message.includes('priority_level')) {
                        throw new Error('Invalid priority level. Must be one of: low, medium, high, urgent.');
                    }
                    throw new Error('Invalid data provided. Please check your input values.');
                }

                if (error.code === '23502') { // Not null constraint violation
                    throw new Error('Required fields are missing. Please provide all required information.');
                }

                throw new Error(`Failed to update project: ${error.message} (Code: ${error.code})`);
            }

            if (!data) {
                throw new Error(`Project with ID "${id}" not found for update`);
            }

            return this.transformProjectData(data);
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    }

    // Method to get projects by customer
    async getProjectsByCustomer(customerId: string): Promise<Project[]> {
        try {
            const { supabase } = await import('@/integrations/supabase/client');

            const { data, error } = await supabase
                .from('projects')
                .select(`
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
                    current_stage:workflow_stages!current_stage_id(
                        id,
                        name,
                        description,
                        order_index,
                        is_active,
                        estimated_duration_days,
                        required_approvals,
                        auto_advance_conditions,
                        created_at,
                        updated_at
                    )
                `)
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Database error fetching projects by customer:', error);
                throw new Error(`Failed to fetch projects: ${error.message} (Code: ${error.code})`);
            }

            return (data || []).map(project => this.transformProjectData(project));
        } catch (error) {
            console.error('Error fetching projects by customer:', error);
            throw error;
        }
    }

    // Method to get projects by status
    async getProjectsByStatus(status: string): Promise<Project[]> {
        try {
            const { supabase } = await import('@/integrations/supabase/client');

            const { data, error } = await supabase
                .from('projects')
                .select(`
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
                    current_stage:workflow_stages!current_stage_id(
                        id,
                        name,
                        description,
                        order_index,
                        is_active,
                        estimated_duration_days,
                        required_approvals,
                        auto_advance_conditions,
                        created_at,
                        updated_at
                    )
                `)
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Database error fetching projects by status:', error);
                throw new Error(`Failed to fetch projects: ${error.message} (Code: ${error.code})`);
            }

            return (data || []).map(project => this.transformProjectData(project));
        } catch (error) {
            console.error('Error fetching projects by status:', error);
            throw error;
        }
    }

    // Method to delete a project
    async deleteProject(id: string): Promise<void> {
        try {
            const { supabase } = await import('@/integrations/supabase/client');

            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Database error deleting project:', error);

                // Handle specific constraint violations
                if (error.code === '23503') { // Foreign key constraint violation
                    throw new Error('Cannot delete project because it is referenced by other records. Please remove related data first.');
                }

                throw new Error(`Failed to delete project: ${error.message} (Code: ${error.code})`);
            }

            console.log(`✅ ProjectService: Successfully deleted project ${id}`);
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    // Helper methods for data validation and transformation
    private validateString(value: any, fieldName: string): string {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error(`Invalid ${fieldName}: expected non-empty string, got ${typeof value}`);
        }
        return value.trim();
    }

    private validateOptionalString(value: any): string | undefined {
        if (value === null || value === undefined) {
            return undefined;
        }
        if (typeof value !== 'string') {
            return undefined;
        }
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
    }

    private validateOptionalNumber(value: any): number | undefined {
        if (value === null || value === undefined) {
            return undefined;
        }
        if (typeof value === 'number' && !isNaN(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? undefined : parsed;
        }
        return undefined;
    }

    private validateOptionalArray(value: any): string[] | undefined {
        if (value === null || value === undefined) {
            return undefined;
        }
        if (Array.isArray(value)) {
            return value.filter(item => typeof item === 'string' && item.trim() !== '');
        }
        return undefined;
    }

    private validateRequiredNumber(value: any, fieldName: string): number {
        if (value === null || value === undefined) {
            throw new Error(`Required field ${fieldName} is missing`);
        }
        if (typeof value === 'number' && !isNaN(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
        throw new Error(`Invalid ${fieldName}: expected number, got ${typeof value}`);
    }

    private transformJsonbArrayField(value: any): any[] | undefined {
        if (value === null || value === undefined) {
            return undefined;
        }

        // If it's already an array, return it
        if (Array.isArray(value)) {
            return value;
        }

        // If it's a string, try to parse it as JSON
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : undefined;
            } catch {
                return undefined;
            }
        }

        return undefined;
    }

    private transformJsonbField(value: any): Record<string, any> | undefined {
        if (value === null || value === undefined) {
            return undefined;
        }

        // If it's already an object, return it
        if (typeof value === 'object' && !Array.isArray(value)) {
            return value;
        }

        // If it's a string, try to parse it as JSON
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : undefined;
            } catch {
                return undefined;
            }
        }

        return undefined;
    }

    private transformTimestamp(value: any, required: boolean = false): string | undefined {
        if (value === null || value === undefined) {
            if (required) {
                throw new Error('Required timestamp field is missing');
            }
            return undefined;
        }

        // If it's already a string, validate it's a proper ISO timestamp
        if (typeof value === 'string') {
            try {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    if (required) {
                        throw new Error('Invalid timestamp format');
                    }
                    return undefined;
                }
                return date.toISOString();
            } catch {
                if (required) {
                    throw new Error('Invalid timestamp format');
                }
                return undefined;
            }
        }

        // If it's a Date object, convert to ISO string
        if (value instanceof Date) {
            if (isNaN(value.getTime())) {
                if (required) {
                    throw new Error('Invalid date object');
                }
                return undefined;
            }
            return value.toISOString();
        }

        if (required) {
            throw new Error('Invalid timestamp type');
        }
        return undefined;
    }

    private calculateDaysInStage(stageEnteredAt: any): number | undefined {
        if (!stageEnteredAt) {
            return undefined;
        }

        try {
            const enteredDate = new Date(stageEnteredAt);
            if (isNaN(enteredDate.getTime())) {
                return undefined;
            }

            const now = new Date();
            const diffTime = now.getTime() - enteredDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return diffDays >= 0 ? diffDays : 0;
        } catch {
            return undefined;
        }
    }


}

// Export singleton instance
export const projectService = new ProjectService();

// Export class for testing
export { ProjectService };