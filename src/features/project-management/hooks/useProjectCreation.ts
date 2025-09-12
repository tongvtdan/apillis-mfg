import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus, ProjectPriority } from '@/types/project';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { cacheService } from '@/services/cacheService';
import { realtimeManager } from '@/lib/realtime-manager';
import { projectQueries, ProjectQueryOptions, generateProjectQueryKey } from '@/lib/project-queries';

export function useProjectCreation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Create project ID generator function
    const generateProjectId = useCallback(async (): Promise<string> => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const baseId = `P-${year}${month}${day}`;

        // Find the next available sequence number
        const { data, error } = await supabase
            .from('projects')
            .select('project_id')
            .like('project_id', `${baseId}%`)
            .order('project_id', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error generating project ID:', error);
            // Fallback to simple increment if database query fails
            return `${baseId}001`;
        }

        let sequenceNumber = 1;
        if (data && data.length > 0 && data[0] && 'project_id' in data[0]) {
            const lastProjectId = data[0].project_id;
            const lastSequence = parseInt(lastProjectId.slice(-3));
            sequenceNumber = lastSequence + 1;
        }

        return `${baseId}${sequenceNumber.toString().padStart(3, '0')}`;
    }, []);

    // Create new project
    const createProject = async (projectData: {
        title: string;
        description?: string;
        customer_organization_id?: string;
        priority?: ProjectPriority;
        estimated_value?: number;
        due_date?: string;
        notes?: string;
        tags?: string[];
        intake_type?: string;
        intake_source?: string;
        project_type?: string;
        current_stage_id?: string;
        project_id?: string; // Pre-generated project ID
        metadata?: Record<string, any>; // Additional metadata
        status?: 'draft' | 'inquiry' | 'reviewing' | 'quoted' | 'confirmed' | 'procurement' | 'production' | 'completed' | 'cancelled'; // Status parameter
    }): Promise<Project> => {
        if (!user || !profile?.organization_id) {
            throw new Error('User must be authenticated to create projects');
        }

        try {
            setLoading(true);
            setError(null);

            // Verify user's organization ID in database matches profile
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', user.id as any)
                .single();

            if (userError) {
                console.error('❌ Error fetching user data:', userError);
                throw new Error('Failed to verify user organization');
            }

            console.log('🔍 User organization verification:', {
                profile_org_id: profile.organization_id,
                database_org_id: userData && 'organization_id' in userData ? userData.organization_id : null,
                user_id: user.id,
                user_email: user.email
            });

            if (userData && 'organization_id' in userData && userData.organization_id !== profile.organization_id) {
                console.error('❌ Organization ID mismatch:', {
                    profile_org_id: profile.organization_id,
                    database_org_id: userData.organization_id,
                    user_id: user.id
                });
                // For now, let's use the profile organization ID and continue
                console.warn('⚠️ Using profile organization ID instead of database value');
            }

            console.log('🚀 Creating project with data:', {
                organization_id: profile.organization_id,
                title: projectData.title,
                customer_organization_id: projectData.customer_organization_id,
                current_stage_id: projectData.current_stage_id,
                intake_type: projectData.intake_type,
                project_type: projectData.project_type,
                project_id: projectData.project_id,
                user_id: user.id,
                user_email: user.email
            });

            // Use pre-generated project ID or generate one
            const projectId = projectData.project_id || await generateProjectId();
            console.log('📝 Using project ID:', projectId);

            // Determine project status - default to 'inquiry' unless explicitly set to 'draft'
            const projectStatus = projectData.status || 'inquiry';
            console.log('📝 Using project status:', projectStatus);

            console.log('📝 Inserting project data:', {
                organization_id: profile.organization_id,
                title: projectData.title,
                customer_organization_id: projectData.customer_organization_id,
                project_id: projectId,
                current_stage_id: projectData.current_stage_id,
                created_by: user.id,
                priority_level: (projectData.priority || 'normal') as 'low' | 'normal' | 'high' | 'urgent',
                status: projectStatus as 'draft' | 'inquiry' | 'reviewing' | 'quoted' | 'confirmed' | 'procurement' | 'production' | 'completed' | 'cancelled'
            });

            const { data, error } = await supabase
                .from('projects')
                .insert({
                    organization_id: profile.organization_id,
                    title: projectData.title,
                    description: projectData.description || null,
                    customer_organization_id: projectData.customer_organization_id || null,
                    priority_level: (projectData.priority || 'normal') as 'low' | 'normal' | 'high' | 'urgent',
                    estimated_value: projectData.estimated_value || null,
                    estimated_delivery_date: projectData.due_date || null,
                    status: projectStatus as 'draft' | 'inquiry' | 'reviewing' | 'quoted' | 'confirmed' | 'procurement' | 'production' | 'completed' | 'cancelled',
                    source: 'manual',
                    created_by: user.id,
                    tags: projectData.tags || [],
                    notes: projectData.notes || null,
                    intake_type: projectData.intake_type || null,
                    intake_source: projectData.intake_source || 'portal',
                    project_type: projectData.project_type || null,
                    current_stage_id: projectData.current_stage_id || null,
                    project_id: projectId,
                    stage_entered_at: new Date().toISOString(),
                    metadata: projectData.metadata || {}
                } as any)
                .select(`
          *,
          customer_organization:organizations!customer_organization_id(*),
          current_stage:workflow_stages(*)
        `)
                .single();

            if (error) {
                console.error('❌ Database error creating project:', error);
                console.error('❌ Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                console.error('❌ Insert data that failed:', {
                    organization_id: profile.organization_id,
                    title: projectData.title,
                    description: projectData.description,
                    customer_organization_id: projectData.customer_organization_id,
                    priority_level: (projectData.priority || 'normal') as 'low' | 'normal' | 'high' | 'urgent',
                    estimated_value: projectData.estimated_value,
                    estimated_delivery_date: projectData.due_date,
                    status: projectStatus as 'draft' | 'inquiry' | 'reviewing' | 'quoted' | 'confirmed' | 'procurement' | 'production' | 'completed' | 'cancelled',
                    source: 'manual',
                    created_by: user.id,
                    tags: projectData.tags || [],
                    notes: projectData.notes,
                    intake_type: projectData.intake_type,
                    intake_source: projectData.intake_source || 'portal',
                    project_type: projectData.project_type,
                    current_stage_id: projectData.current_stage_id,
                    project_id: projectId,
                    stage_entered_at: new Date().toISOString(),
                    metadata: projectData.metadata || {}
                });

                // Handle RLS policy violations specifically
                if (error.code === '42501') { // Insufficient privilege
                    throw new Error('You do not have permission to create projects. Please ensure you are logged in and have the necessary permissions.');
                }

                // Handle specific constraint violations
                if (error.code === '23505') { // Unique constraint violation
                    if (error.message.includes('project_id')) {
                        throw new Error('A project with this ID already exists. Please use a different project ID.');
                    }
                    throw new Error('This project conflicts with an existing record. Please check your data.');
                }

                if (error.code === '23503') { // Foreign key constraint violation
                    if (error.message.includes('customer_organization_id')) {
                        throw new Error('The specified customer does not exist. Please select a valid customer.');
                    }
                    if (error.message.includes('current_stage_id')) {
                        throw new Error('The specified workflow stage does not exist. Please select a valid stage.');
                    }
                    if (error.message.includes('created_by')) {
                        throw new Error('The specified creator does not exist. Please select a valid user.');
                    }
                    if (error.message.includes('organization_id')) {
                        throw new Error('The specified organization does not exist. Please select a valid organization.');
                    }
                    throw new Error('One or more referenced records do not exist. Please check your data. (Foreign key constraint violation)');
                }

                if (error.code === '23514') { // Check constraint violation
                    if (error.message.includes('status')) {
                        throw new Error('Invalid project status. Must be one of: active, on_hold, delayed, cancelled, completed.');
                    }
                    if (error.message.includes('priority_level')) {
                        throw new Error('Invalid priority level. Must be one of: low, normal, high, urgent.');
                    }
                    throw new Error('Invalid data provided. Please check your input values.');
                }

                if (error.code === '23502') { // Not null constraint violation
                    throw new Error('Required fields are missing. Please provide all required information.');
                }

                // Generic error handling
                throw new Error(`Database error: ${error.message}`);
            }

            console.log('✅ Project created successfully:', data);

            if (data && 'project_id' in data) {
                toast({
                    title: "Project Created",
                    description: `Project ${data.project_id} has been created successfully.`,
                });
            }

            return data as unknown as Project;
        } catch (error) {
            console.error('Error creating project:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setError(errorMessage);
            toast({
                title: "Project Creation Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Create or get customer
    const createOrGetCustomer = async (customerData: {
        name: string;
        company: string;
        email?: string;
        phone?: string;
    }) => {
        if (!user || !profile?.organization_id) {
            throw new Error('User must be authenticated to create customers');
        }

        try {
            // First, try to find existing customer organization
            const { data: existingOrg } = await supabase
                .from('organizations')
                .select('*')
                .eq('organization_type', 'customer' as any)
                .eq('is_active', true as any)
                .eq('name', customerData.company as any)
                .single();

            if (existingOrg && 'id' in existingOrg) {
                // Find a contact for this organization
                const { data: existingContact } = await supabase
                    .from('contacts')
                    .select('*')
                    .eq('organization_id', existingOrg.id as any)
                    .eq('type', 'customer' as any)
                    .eq('is_active', true as any)
                    .single();

                if (existingContact) {
                    return existingContact;
                }
            }

            // Create new customer organization and contact
            console.log('📝 Creating new customer organization with data:', {
                name: customerData.company,
                organization_type: 'customer',
                is_active: true,
                created_by: user.id
            });

            // Create organization first
            const { data: newOrg, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: customerData.company,
                    organization_type: 'customer',
                    is_active: true,
                    created_by: user.id
                } as any)
                .select()
                .single();

            if (orgError) {
                throw orgError;
            }

            // Create contact for the organization
            const { data: newCustomer, error } = await supabase
                .from('contacts')
                .insert({
                    organization_id: newOrg && 'id' in newOrg ? newOrg.id : null,
                    type: 'customer',
                    contact_name: customerData.name,
                    email: customerData.email || null,
                    phone: customerData.phone || null,
                    is_active: true,
                    created_by: user.id
                } as any)
                .select()
                .single();

            if (error) {
                console.error('❌ Database error creating customer:', error);
                console.error('❌ Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            console.log('✅ Customer created successfully:', newCustomer);
            return newCustomer;
        } catch (error) {
            console.error('Error creating/getting customer:', error);
            throw error;
        }
    };

    return {
        loading,
        error,
        createProject,
        createOrGetCustomer,
        generateProjectId
    };
}
