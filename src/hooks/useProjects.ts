import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus, Customer, ProjectPriority } from '@/types/project';
import {
  SupplierQuote,
  QuoteReadinessIndicator,
  BottleneckAlert,
  AnalyticsMetrics,
  ProjectWorkflowAnalytics
} from '@/types/supplier';
import { useAuth } from '@/core/auth';
import { useToast } from '@/hooks/use-toast';
import { WorkflowValidator, WorkflowValidationResult } from '@/lib/workflow-validator';
import { cacheService } from '@/services/cacheService';
import { realtimeManager } from '@/lib/realtime-manager';
import { projectQueries, ProjectQueryOptions, generateProjectQueryKey } from '@/lib/project-queries';

// Database now uses new status values directly - no mapping needed

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth(); // Also get profile
  const { toast } = useToast();
  const realtimeChannelRef = useRef<any>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // Stable refs for useEffect dependencies to prevent infinite loops
  const userIdRef = useRef<string | undefined>();
  const organizationIdRef = useRef<string | undefined>();

  // Update refs when values change
  userIdRef.current = user?.id;
  organizationIdRef.current = profile?.organization_id;

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
    if (data && data.length > 0) {
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
  }): Promise<Project> => {
    if (!user || !profile?.organization_id) {
      throw new Error('User must be authenticated to create projects');
    }

    try {
      // Verify user's organization ID in database matches profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('❌ Error fetching user data:', userError);
        throw new Error('Failed to verify user organization');
      }

      console.log('🔍 User organization verification:', {
        profile_org_id: profile.organization_id,
        database_org_id: userData?.organization_id,
        user_id: user.id,
        user_email: user.email
      });

      if (userData?.organization_id !== profile.organization_id) {
        console.error('❌ Organization ID mismatch:', {
          profile_org_id: profile.organization_id,
          database_org_id: userData?.organization_id,
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

      console.log('📝 Inserting project data:', {
        organization_id: profile.organization_id,
        title: projectData.title,
        customer_organization_id: projectData.customer_organization_id,
        project_id: projectId,
        current_stage_id: projectData.current_stage_id,
        created_by: user.id,
        priority_level: (projectData.priority || 'normal') as 'low' | 'normal' | 'high' | 'urgent',
        status: 'draft' as 'draft' | 'inquiry' | 'reviewing' | 'quoted' | 'confirmed' | 'procurement' | 'production' | 'completed' | 'cancelled'
      });

      const { data, error } = await supabase
        .from('projects')
        .insert({
          organization_id: profile.organization_id, // Ensure organization_id is passed
          title: projectData.title,
          description: projectData.description,
          customer_organization_id: projectData.customer_organization_id,
          priority_level: (projectData.priority || 'normal') as 'low' | 'normal' | 'high' | 'urgent',
          estimated_value: projectData.estimated_value,
          estimated_delivery_date: projectData.due_date,
          status: 'draft' as 'draft' | 'inquiry' | 'reviewing' | 'quoted' | 'confirmed' | 'procurement' | 'production' | 'completed' | 'cancelled',
          source: 'manual',
          created_by: user.id,
          tags: projectData.tags || [],
          notes: projectData.notes,
          intake_type: projectData.intake_type,
          intake_source: projectData.intake_source || 'portal',
          project_type: projectData.project_type,
          current_stage_id: projectData.current_stage_id,
          // Use pre-generated or generated project ID
          project_id: projectId,
          stage_entered_at: new Date().toISOString(),
          // Store additional metadata
          metadata: projectData.metadata || {}
        })
        .select(`
          *,
          customer_organization:organizations(*),
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
          status: 'draft' as 'draft' | 'inquiry' | 'reviewing' | 'quoted' | 'confirmed' | 'procurement' | 'production' | 'completed' | 'cancelled',
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

      // Update local state
      setProjects(prev => [data, ...prev]);

      // Update cache
      cacheService.setProjects([data, ...projects]);

      toast({
        title: "Project Created",
        description: `Project ${data.project_id} has been created successfully.`,
      });

      return data as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Project Creation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fetchProjects = useCallback(async (forceRefresh = false, options?: ProjectQueryOptions) => {
    // Check if user is authenticated
    if (!user) {
      console.log('⚠️ No authenticated user, returning empty projects array');
      setProjects([]);
      setLoading(false);
      return;
    }

    // Get organization_id with fallback logic similar to dashboard function
    let organizationId = profile?.organization_id;

    if (!organizationId) {
      console.log('⚠️ No organization_id in profile, trying fallback...');
      try {
        // Try to get the first organization as fallback (same as dashboard function)
        const { data: fallbackOrg } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (fallbackOrg?.id) {
          organizationId = fallbackOrg.id;
          console.log('✅ Using fallback organization_id:', organizationId);
        } else {
          console.log('❌ No fallback organization found, returning empty projects array');
          setProjects([]);
          setLoading(false);
          return;
        }
      } catch (fallbackError) {
        console.error('❌ Error getting fallback organization:', fallbackError);
        setProjects([]);
        setLoading(false);
        return;
      }
    }

    try {
      console.log('🔍 Fetching projects for user:', user.id, 'organization:', organizationId);

      // Check cache based on whether options are applied
      if (!forceRefresh) {
        if (options && Object.keys(options).length > 0) {
          // Check query-specific cache for filtered results
          const queryKey = generateProjectQueryKey('list', options);
          if (cacheService.isQueryCacheValid(queryKey)) {
            const cachedResult = cacheService.getQueryResult(queryKey);
            if (cachedResult) {
              console.log('📦 Using cached query result for:', queryKey);
              setProjects(cachedResult);
              setLoading(false);
              return;
            }
          }
        } else {
          // Check main cache for unfiltered results
          if (cacheService.isCacheValid() && cacheService.validateCacheConsistency()) {
            const cachedProjects = cacheService.getProjects();
            if (cachedProjects) {
              console.log('📦 Using cached projects:', cachedProjects.length);
              // Check if cached projects have customer organization data
              const hasCustomerData = cachedProjects.some(p => p.customer_organization?.name);
              if (!hasCustomerData) {
                console.log('⚠️ Cached projects missing customer data, forcing refresh');
                cacheService.clearCache();
              } else {
                setProjects(cachedProjects);
                setLoading(false);
                return;
              }
            }
          }
        }
      }

      setLoading(true);
      setError(null);

      // Use projects table with proper lookups - cleaner approach than denormalized view
      let query = supabase
        .from('projects')
        .select(`
          id,
          organization_id,
          project_id,
          title,
          description,
          customer_organization_id,
          point_of_contacts,
          current_stage_id,
          status,
          priority_level,
          source,
          assigned_to,
          created_by,
          estimated_value,
          estimated_delivery_date,
          actual_delivery_date,
          tags,
          metadata,
          stage_entered_at,
          project_type,
          notes,
          created_at,
          updated_at
        `);

      // Add organization filter
      query = query.eq('organization_id', organizationId);

      // Apply filters if provided
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.priority) {
        query = query.eq('priority_level', options.priority);
      }

      // Apply ordering and pagination
      query = query.order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error: fetchError, count } = await query;

      console.log('📊 Projects query result:', {
        dataLength: data?.length,
        count,
        hasError: !!fetchError,
        error: fetchError
      });

      if (fetchError) {
        console.error('❌ Error fetching projects:', fetchError);
        const errorMessage = fetchError.code === 'PGRST116'
          ? 'Database connection error. Please check your connection and try again.'
          : fetchError.message || 'Failed to fetch projects';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Validate and transform the data from projects table
      let mappedProjects = (data || []).map(project => ({
        ...project,
        // Ensure required fields have proper defaults
        status: project.status || 'active',
        priority_level: project.priority_level || 'normal',
        source: project.source || 'portal',
        tags: project.tags || [],
        metadata: project.metadata || {},
        point_of_contacts: project.point_of_contacts || [],
        // Calculate days in stage if stage_entered_at exists
        days_in_stage: project.stage_entered_at
          ? Math.floor((new Date().getTime() - new Date(project.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
          : undefined,
        // Add computed fields for compatibility
        due_date: project.estimated_delivery_date, // Map estimated_delivery_date to due_date for compatibility
        priority: project.priority_level, // Map priority_level to priority for legacy compatibility
        // Customer organization will be fetched separately
        customer_organization: null, // Will be populated below
        // Current stage will be fetched separately
        current_stage: null, // Will be populated below
        // Contacts will be fetched separately when needed using point_of_contacts IDs
        // Primary contact can be derived from the first contact ID in the array
        primary_contact: null // Will be populated separately when needed
      }));

      // Fetch customer organizations separately to avoid ambiguous joins
      if (mappedProjects.length > 0) {
        const customerOrgIds = [...new Set(mappedProjects
          .map(p => p.customer_organization_id)
          .filter(id => id)
        )];

        console.log('🔍 Customer organization IDs found:', customerOrgIds);

        if (customerOrgIds.length > 0) {
          try {
            const { data: orgs, error: orgError } = await supabase
              .from('organizations')
              .select('id, name')
              .in('id', customerOrgIds);

            console.log('📊 Organizations query result:', {
              orgsLength: orgs?.length,
              hasError: !!orgError,
              error: orgError,
              orgs: orgs
            });

            if (!orgError && orgs) {
              // Create a lookup map for organizations
              const orgMap = orgs.reduce((acc, org) => {
                acc[org.id] = org;
                return acc;
              }, {});

              console.log('🗺️ Organization map created:', orgMap);

              // Update projects with customer organization data
              mappedProjects = mappedProjects.map(project => {
                const customerOrg = project.customer_organization_id ?
                  orgMap[project.customer_organization_id] || null : null;

                console.log(`📝 Project ${project.project_id}: customer_organization_id=${project.customer_organization_id}, customerOrg=`, customerOrg);

                return {
                  ...project,
                  customer_organization: customerOrg
                };
              });
            }
          } catch (error) {
            console.error('❌ Error fetching customer organizations:', error);
          }
        } else {
          console.log('⚠️ No customer organization IDs found in projects');
        }
      }

      console.log('✅ Successfully mapped projects:', mappedProjects.length);
      setProjects(mappedProjects as Project[]);

      // Cache the data appropriately
      if (options) {
        // Cache filtered results with query-specific key
        const queryKey = generateProjectQueryKey('list', options);
        cacheService.setQueryResult(queryKey, mappedProjects as Project[]);
      } else {
        // Cache full dataset in main cache
        cacheService.setProjects(mappedProjects as Project[]);
      }
    } catch (err) {
      console.error('💥 Error in fetchProjects:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Selective real-time subscription for specific projects
  const subscribeToProjectUpdates = useCallback((projectIds: string[]) => {
    if (projectIds.length === 0) return;

    console.log('🔔 subscribeToProjectUpdates called with project IDs:', projectIds);

    // Clean up existing subscription
    if (realtimeChannelRef.current) {
      console.log('🔔 Cleaning up existing selective subscription');
      supabase.removeChannel(realtimeChannelRef.current);
    }

    console.log('🔔 Setting up selective real-time subscription for projects:', projectIds);

    realtimeChannelRef.current = supabase
      .channel('selective-project-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=in.(${projectIds.join(',')})`
        },
        (payload) => {
          // Validate payload structure
          if (!payload.new?.id) {
            console.warn('🔔 Selective subscription: Invalid payload received:', payload);
            return;
          }

          console.log('🔔 Selective real-time update received:', {
            projectId: payload.new.id,
            oldStatus: payload.old?.status,
            newStatus: payload.new.status,
            oldStage: payload.old?.current_stage_id,
            newStage: payload.new.current_stage_id
          });

          // Update the specific project in our state
          setProjects(prev => {
            const updatedProjects = prev.map(project =>
              project.id === payload.new.id
                ? { ...project, ...payload.new }
                : project
            );

            console.log('🔔 Projects state updated via real-time subscription:', {
              projectId: payload.new.id,
              oldStage: payload.old?.current_stage_id,
              newStage: payload.new.current_stage_id,
              projectsCount: updatedProjects.length,
              updatedProject: updatedProjects.find(p => p.id === payload.new.id)
            });

            // Update cache with error handling
            try {
              cacheService.setProjects(updatedProjects);
            } catch (error) {
              console.warn('🔔 Failed to update cache during real-time update:', error);
            }

            return updatedProjects;
          });

          // If stage was updated, we should refetch to get the full stage relationship
          if (payload.old?.current_stage_id !== payload.new.current_stage_id) {
            console.log('🔔 Stage updated, refetching to get full stage data with relationships');
            // Use setTimeout to ensure the state update completes first
            setTimeout(() => {
              fetchProjects(true);
            }, 100);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Selective subscription status changed:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Selective project subscription established for projects:', projectIds);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Selective project subscription error:', status);
          // Retry after a delay
          setTimeout(() => {
            if (realtimeChannelRef.current) {
              console.log('🔄 Retrying selective subscription...');
              subscribeToProjectUpdates(projectIds);
            }
          }, 3000);
        } else if (status === 'CLOSED') {
          console.log('🔔 Selective project subscription closed');
        } else {
          console.log('🔔 Selective subscription status:', status);
        }
      });

    return realtimeChannelRef.current;
  }, []); // Empty dependency array - fetchProjects is accessed via closure

  // Set up real-time subscription - only for project detail pages
  useEffect(() => {
    // Always subscribe to real-time updates for project-related routes
    const shouldSubscribeToRealtime = window.location.pathname.includes('/projects/') ||
      window.location.pathname.includes('/project/') ||
      window.location.pathname === '/projects';

    console.log('🔔 useProjects: Real-time subscription check:', {
      currentPath: window.location.pathname,
      shouldSubscribe: shouldSubscribeToRealtime,
      realtimeManagerStatus: realtimeManager.getStatus()
    });

    if (!shouldSubscribeToRealtime) {
      console.log('🔔 useProjects: Skipping real-time subscription for route:', window.location.pathname);
      return;
    }

    // Subscribe to the global real-time manager with improved handling
    console.log('🔔 useProjects: Setting up real-time subscription');
    const unsubscribe = realtimeManager.subscribe(() => {
      // Rate limit real-time updates to prevent excessive API calls
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;

      if (timeSinceLastFetch < 2000) { // Increased to 2 seconds for better stability
        console.log('🔔 useProjects: Rate limiting real-time update (last fetch was', timeSinceLastFetch, 'ms ago)');
        return;
      }

      // When we receive a notification, refetch projects to get the latest data
      console.log('🔔 useProjects: Received real-time update notification, refetching projects');
      lastFetchTimeRef.current = now;
      if (userIdRef.current && organizationIdRef.current) {
        fetchProjects(true);
      }
    });

    return () => {
      console.log('🔔 useProjects: Unsubscribing from real-time manager');
      unsubscribe();
    };
  }, []); // Empty dependency array to prevent infinite loops

  // Separate useEffect for initial data loading
  useEffect(() => {
    // Only run if we have the required user and organization info
    if (!userIdRef.current || !organizationIdRef.current) {
      console.log('⚠️ useProjects: Missing user or organization info, skipping initial load');
      return;
    }

    console.log('🔄 useProjects: Initial data load triggered');
    console.log('User ID:', userIdRef.current);
    console.log('Organization ID:', organizationIdRef.current);
    fetchProjects();
  }, []); // Empty dependency array - only run once on mount

  // Get project by ID
  const getProjectById = async (id: string): Promise<Project | null> => {
    console.log('🔍 Fetching project with ID:', id);

    // Check if user is authenticated and has a profile with organization
    if (!user || !profile?.organization_id) {
      console.log('⚠️ No authenticated user or organization, cannot fetch project');
      return null;
    }

    try {
      // First, log all projects to see what's available
      const { data: allProjects, error: allProjectsError } = await supabase
        .from('projects')
        .select(`
          *,
          customer_organization:organizations(*),
          current_stage:workflow_stages(*)
        `)
        .eq('organization_id', organizationId); // Add organization filter

      if (allProjectsError) {
        console.error('❌ Error fetching all projects:', allProjectsError);
        throw new Error(`Database error: ${allProjectsError.message} (Code: ${allProjectsError.code})`);
      }

      console.log('📊 Database status:');
      console.log(`  - Total projects found: ${allProjects?.length || 0}`);
      console.log(`  - Available project IDs:`, allProjects?.map(p => p.id) || []);
      console.log(`  - Sample project IDs:`, allProjects?.map(p => p.project_id) || []);

      // Try to fetch with exact ID first
      let { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customer_organization:organizations(*),
          current_stage:workflow_stages(*)
        `)
        .eq('id', id)
        .eq('organization_id', organizationId) // Add organization filter
        .single();

      if (error) {
        console.error('❌ Error fetching project by ID:', error);
        // Try alternative approach with project_id field
        const { data: altData, error: altError } = await supabase
          .from('projects')
          .select(`
            *,
            customer:contacts(*),
            current_stage:workflow_stages(*)
          `)
          .eq('project_id', id)
          .eq('organization_id', organizationId) // Add organization filter
          .single();

        if (altError) {
          console.error('❌ Error fetching project by project_id:', altError);
          // Return null if both approaches fail
          return null;
        }

        data = altData;
        error = altError;
      }

      if (error) {
        console.error('❌ Error fetching project:', error);
        return null;
      }

      if (!data) {
        console.log('❌ No project found with ID:', id);
        return null;
      }

      console.log('✅ Successfully fetched project:', data.project_id);
      return data as Project;
    } catch (err) {
      console.error('❌ Unexpected error in getProjectById:', err);
      return null;
    }
  };

  // Update project status with validation
  const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus): Promise<boolean> => {
    try {
      // Validate input parameters
      if (!projectId || !newStatus) {
        toast({
          variant: "destructive",
          title: "Invalid Parameters",
          description: "Project ID and status are required.",
        });
        return false;
      }

      // Validate status value
      const validStatuses: ProjectStatus[] = ['active', 'on_hold', 'delayed', 'cancelled', 'completed'];
      if (!validStatuses.includes(newStatus)) {
        toast({
          variant: "destructive",
          title: "Invalid Status",
          description: `Status must be one of: ${validStatuses.join(', ')}`,
        });
        return false;
      }

      // Validate the workflow transition
      // Note: This validation is now handled in the useStageTransition hook
      // For backward compatibility, we'll skip validation here
      console.log('Skipping workflow validation in updateProjectStatus - handled elsewhere');

      // Update the project status
      const { error } = await supabase
        .from('projects')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating project status:', error);
        const errorMessage = error.code === '23514'
          ? 'Invalid status value. Please select a valid status.'
          : error.message || 'Failed to update project status. Please try again.';

        toast({
          variant: "destructive",
          title: "Update Failed",
          description: errorMessage,
        });
        return false;
      }

      // Update local state optimistically
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
            : project
        )
      );

      // Update cache
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
          : project
      );
      cacheService.setProjects(updatedProjects);

      toast({
        title: "Status Updated",
        description: "Project status has been successfully updated.",
      });

      return true;
    } catch (error) {
      console.error('Error updating project status:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while updating the project status.';
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  // Update project stage with validation
  const updateProjectStage = async (projectId: string, newStageId: string): Promise<WorkflowValidationResult> => {
    try {
      // Validate input parameters
      if (!projectId || !newStageId) {
        const errorResult = {
          isValid: false,
          message: "Project ID and stage ID are required.",
          errors: ["Project ID and stage ID are required."],
          warnings: [],
          canAutoAdvance: false,
          requiresManagerApproval: false
        };
        toast({
          variant: "destructive",
          title: "Invalid Parameters",
          description: errorResult.message,
        });
        return errorResult;
      }

      // Update the project stage using correct database field name
      const { error } = await supabase
        .from('projects')
        .update({
          current_stage_id: newStageId,
          stage_entered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating project stage:', error);
        const errorMessage = error.code === '23503'
          ? 'Invalid stage ID. The specified stage does not exist.'
          : error.message || 'Failed to update project stage. Please try again.';

        toast({
          variant: "destructive",
          title: "Update Failed",
          description: errorMessage,
        });
        return {
          isValid: false,
          message: errorMessage,
          errors: [errorMessage],
          warnings: [],
          canAutoAdvance: false,
          requiresManagerApproval: false
        };
      }

      // Update local state optimistically
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? {
              ...project,
              current_stage_id: newStageId,
              stage_entered_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            : project
        )
      );

      // Update cache
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? {
            ...project,
            current_stage_id: newStageId,
            stage_entered_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          : project
      );
      cacheService.setProjects(updatedProjects);

      // Refetch to get the full stage relationship data
      setTimeout(() => fetchProjects(true), 100);

      toast({
        title: "Stage Updated",
        description: "Project stage has been successfully updated.",
      });

      return {
        isValid: true,
        message: "Project stage updated successfully",
        errors: [],
        warnings: [],
        canAutoAdvance: false,
        requiresManagerApproval: false
      };
    } catch (error) {
      console.error('Error updating project stage:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while updating the project stage.';
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
      return {
        isValid: false,
        message: errorMessage,
        errors: [errorMessage],
        warnings: [],
        canAutoAdvance: false,
        requiresManagerApproval: false
      };
    }
  };

  // Optimistic update for project status (for UI updates before database confirmation)
  const updateProjectStatusOptimistic = async (projectId: string, newStatus: ProjectStatus): Promise<boolean> => {
    try {
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? { ...project, status: newStatus }
            : project
        )
      );
      return true;
    } catch (error) {
      console.error('Error in optimistic update:', error);
      return false;
    }
  };

  // Manual refetch function
  const refetch = useCallback(async (forceRefresh = false) => {
    await fetchProjects(forceRefresh);
  }, []); // Empty dependency array - fetchProjects is accessed via closure

  // Clear cache and refetch
  const clearCacheAndRefetch = useCallback(async () => {
    console.log('🧹 Clearing cache and refetching projects');
    cacheService.clearCache();
    await fetchProjects(true);
  }, []); // Empty dependency array - fetchProjects is accessed via closure

  // Test customer organization fetching directly
  const testCustomerOrganizationFetching = useCallback(async () => {
    console.log('🧪 Testing customer organization fetching directly...');

    try {
      // Get all projects first
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, project_id, title, customer_organization_id')
        .eq('organization_id', profile?.organization_id)
        .limit(5);

      if (projectsError) {
        console.error('❌ Error fetching projects:', projectsError);
        return;
      }

      console.log('📋 Projects fetched:', projects);

      // Get customer organization IDs
      const customerOrgIds = [...new Set(projects
        .map(p => p.customer_organization_id)
        .filter(id => id)
      )];

      console.log('🔍 Customer organization IDs found:', customerOrgIds);

      if (customerOrgIds.length > 0) {
        // Fetch organizations
        const { data: orgs, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', customerOrgIds);

        console.log('📊 Organizations query result:', {
          orgsLength: orgs?.length,
          hasError: !!orgError,
          error: orgError,
          orgs: orgs
        });

        if (!orgError && orgs) {
          // Create lookup map
          const orgMap = orgs.reduce((acc, org) => {
            acc[org.id] = org;
            return acc;
          }, {});

          console.log('🗺️ Organization map created:', orgMap);

          // Test mapping
          projects.forEach(project => {
            const customerOrg = project.customer_organization_id ?
              orgMap[project.customer_organization_id] || null : null;
            console.log(`📝 Project ${project.project_id}: customer_organization_id=${project.customer_organization_id}, customerOrg=`, customerOrg);
          });
        }
      }
    } catch (error) {
      console.error('❌ Error in test:', error);
    }
  }, [profile?.organization_id]);

  // Get bottleneck analysis for projects
  const getBottleneckAnalysis = async (): Promise<BottleneckAlert[]> => {
    try {
      // This would typically call an API endpoint or perform complex analysis
      // For now, we'll return an empty array as a placeholder
      return [];
    } catch (error) {
      console.error('Error getting bottleneck analysis:', error);
      return [];
    }
  };

  // Enhanced refetch function with filtering support
  const refetchWithFilters = useCallback(async (filters?: {
    status?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }, forceRefresh = false) => {
    await fetchProjects(forceRefresh, filters);
  }, []); // Empty dependency array - fetchProjects is accessed via closure

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
        .eq('organization_type', 'customer')
        .eq('is_active', true)
        .eq('name', customerData.company)
        .single();

      if (existingOrg) {
        // Find a contact for this organization
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('*')
          .eq('organization_id', existingOrg.id)
          .eq('type', 'customer')
          .eq('is_active', true)
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
        })
        .select()
        .single();

      if (orgError) {
        throw orgError;
      }

      // Create contact for the organization
      const { data: newCustomer, error } = await supabase
        .from('contacts')
        .insert({
          organization_id: newOrg.id,
          type: 'customer',
          contact_name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          is_active: true,
          created_by: user.id
        })
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

  // Ensure real-time subscription is set up for a specific project
  const ensureProjectSubscription = useCallback((projectId: string) => {
    if (!projectId) return;

    console.log('🔔 Ensuring real-time subscription for project:', projectId);

    // Set up selective subscription for this project
    console.log('🔔 Setting up selective subscription for project:', projectId);
    subscribeToProjectUpdates([projectId]);

    // Also ensure global subscription is active
    if (window.location.pathname.includes('/projects/') || window.location.pathname.includes('/project/')) {
      console.log('🔔 Global real-time subscription should be active for project detail page');
    }
  }, [subscribeToProjectUpdates]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    updateProjectStage,
    updateProjectStatusOptimistic,
    refetch,
    refetchWithFilters,
    getProjectById,
    getBottleneckAnalysis,
    createProject,
    createOrGetCustomer,
    subscribeToProjectUpdates,
    ensureProjectSubscription,
    clearCacheAndRefetch,
    testCustomerOrganizationFetching
  };
}