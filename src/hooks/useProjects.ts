import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus, Customer } from '@/types/project';
import {
  SupplierQuote,
  QuoteReadinessIndicator,
  BottleneckAlert,
  AnalyticsMetrics,
  ProjectWorkflowAnalytics
} from '@/types/supplier';
import { useAuth } from '@/contexts/AuthContext';
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

  const fetchProjects = useCallback(async (forceRefresh = false, options?: ProjectQueryOptions) => {
    // Check if user is authenticated and has a profile with organization
    if (!user || !profile?.organization_id) {
      console.log('⚠️ No authenticated user or organization, returning empty projects array');
      console.log('User:', user);
      console.log('Profile:', profile);
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching projects for user:', user.id, 'organization:', profile.organization_id);

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
              setProjects(cachedProjects);
              setLoading(false);
              return;
            }
          }
        }
      }

      setLoading(true);
      setError(null);

      // Use optimized query with selective field specification and organization filtering
      console.log('📡 Fetching projects from database...');
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
          estimated_delivery_date,
          actual_delivery_date,
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
            is_active,
            created_at,
            updated_at
          ),
          current_stage:workflow_stages!current_stage_id(
            id,
            name,
            description,
            stage_order,
            is_active,
            created_at,
            updated_at
          ) 
        `)
        .eq('organization_id', profile.organization_id); // Add organization filter

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

      // Validate and transform the data
      const mappedProjects = (data || []).map(project => ({
        ...project,
        // Ensure required fields have proper defaults
        status: project.status || 'active',
        priority_level: project.priority_level || 'medium',
        source: project.source || 'portal',
        tags: project.tags || [],
        metadata: project.metadata || {},
        // Calculate days in stage if stage_entered_at exists
        days_in_stage: project.stage_entered_at
          ? Math.floor((new Date().getTime() - new Date(project.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
          : undefined,
        // Add computed fields for compatibility
        due_date: project.estimated_delivery_date, // Map estimated_delivery_date to due_date for compatibility
        priority: project.priority_level, // Map priority_level to priority for legacy compatibility
        // Add stage_order to current_stage if it exists
        current_stage: project.current_stage ? {
          ...project.current_stage,
          stage_order: project.current_stage.stage_order
        } : undefined
      }));

      console.log('✅ Successfully mapped projects:', mappedProjects.length);
      console.log('Mapped projects data:', mappedProjects);
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

    // Clean up existing subscription
    if (realtimeChannelRef.current) {
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
            console.log('🔔 Stage updated, refetching to get full stage data');
            fetchProjects(true);
          }
        }
      )
      .subscribe((status) => {
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
        }
      });

    return realtimeChannelRef.current;
  }, [fetchProjects]); // Add fetchProjects dependency

  // Set up real-time subscription - only for project detail pages
  useEffect(() => {
    console.log('🔄 useProjects useEffect triggered');
    console.log('User:', user);
    console.log('Profile:', profile);
    fetchProjects();

    // Only subscribe to real-time updates on specific routes
    const shouldSubscribeToRealtime = window.location.pathname.includes('/projects/') ||
      window.location.pathname.includes('/project/') ||
      window.location.pathname === '/projects';

    // Reduce logging frequency to prevent console spam
    const shouldLog = Math.random() < 0.1; // Only log 10% of the time

    if (shouldLog) {
      console.log('🔔 useProjects: Real-time subscription check:', {
        currentPath: window.location.pathname,
        shouldSubscribe: shouldSubscribeToRealtime,
        realtimeManagerStatus: realtimeManager.getStatus()
      });
    }

    if (!shouldSubscribeToRealtime) {
      if (shouldLog) {
        console.log('🔔 useProjects: Skipping real-time subscription for route:', window.location.pathname);
      }
      return;
    }

    // Subscribe to the global real-time manager with rate limiting
    const unsubscribe = realtimeManager.subscribe(() => {
      // Rate limit real-time updates to prevent excessive API calls
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;

      if (timeSinceLastFetch < 2000) { // Minimum 2 seconds between fetches
        console.log('🔔 useProjects: Rate limiting real-time update (last fetch was', timeSinceLastFetch, 'ms ago)');
        return;
      }

      // When we receive a notification, refetch projects to get the latest data
      if (shouldLog) {
        console.log('🔔 useProjects: Received real-time update notification, refetching projects');
      }
      lastFetchTimeRef.current = now;
      fetchProjects(true);
    });

    return () => {
      if (shouldLog) {
        console.log('🔔 useProjects: Unsubscribing from real-time manager');
      }
      unsubscribe();
    };
  }, [user, profile]); // Remove fetchProjects from dependency array to prevent circular dependency

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
          customer:contacts(*),
          current_stage:workflow_stages(*)
        `)
        .eq('organization_id', profile.organization_id); // Add organization filter

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
          customer:contacts(*),
          current_stage:workflow_stages(*)
        `)
        .eq('id', id)
        .eq('organization_id', profile.organization_id) // Add organization filter
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
          .eq('organization_id', profile.organization_id) // Add organization filter
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
      const validationResult = WorkflowValidator.validateTransition(projectId, newStatus);
      if (!validationResult.isValid) {
        toast({
          variant: "destructive",
          title: "Invalid Workflow Transition",
          description: validationResult.message || "This workflow transition is not allowed.",
        });
        return false;
      }

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
          message: "Project ID and stage ID are required."
        };
        toast({
          variant: "destructive",
          title: "Invalid Parameters",
          description: errorResult.message,
        });
        return errorResult;
      }

      // Validate the workflow transition
      const validationResult = WorkflowValidator.validateTransition(projectId, newStageId);
      if (!validationResult.isValid) {
        toast({
          variant: "destructive",
          title: "Invalid Workflow Transition",
          description: validationResult.message || "This workflow transition is not allowed.",
        });
        return validationResult;
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
          message: errorMessage
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
        message: "Project stage updated successfully"
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
        message: errorMessage
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
  }, [fetchProjects]); // Add fetchProjects dependency

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
  }, [fetchProjects]); // Add fetchProjects dependency

  // Create new project
  const createProject = async (projectData: {
    title: string;
    description?: string;
    customer_id?: string;
    priority?: ProjectPriority;
    estimated_value?: number;
    due_date?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
    tags?: string[];
  }): Promise<Project> => {
    if (!user || !profile?.organization_id) {
      throw new Error('User must be authenticated to create projects');
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          organization_id: profile.organization_id,
          title: projectData.title,
          description: projectData.description,
          customer_id: projectData.customer_id,
          priority_level: projectData.priority || 'medium',
          estimated_value: projectData.estimated_value,
          estimated_delivery_date: projectData.due_date,
          status: 'active',
          source: 'manual',
          created_by: user.id,
          tags: projectData.tags || [],
          notes: projectData.notes,
          // Generate project ID
          project_id: await generateProjectId(),
          stage_entered_at: new Date().toISOString()
        })
        .select(`
          *,
          customer:contacts(*),
          current_stage:workflow_stages(*)
        `)
        .single();

      if (error) throw error;

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
      throw error;
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
      // First, try to find existing customer
      const { data: existingCustomer } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('type', 'customer')
        .eq('company_name', customerData.company)
        .single();

      if (existingCustomer) {
        return existingCustomer;
      }

      // Create new customer
      const { data: newCustomer, error } = await supabase
        .from('contacts')
        .insert({
          organization_id: profile.organization_id,
          type: 'customer',
          company_name: customerData.company,
          contact_name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          is_active: true,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return newCustomer;
    } catch (error) {
      console.error('Error creating/getting customer:', error);
      throw error;
    }
  };

  // Generate unique project ID
  const generateProjectId = async (): Promise<string> => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      // Get the count of projects created today to generate sequence
      const startOfDay = new Date(year, now.getMonth(), now.getDate()).toISOString();
      const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1).toISOString();

      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile?.organization_id)
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay);

      const sequence = String((count || 0) + 1).padStart(2, '0');
      return `P-${year}${month}${day}${sequence}`;
    } catch (error) {
      console.error('Error generating project ID:', error);
      // Fallback to random sequence
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const sequence = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      return `P-${year}${month}${day}${sequence}`;
    }
  };

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
    subscribeToProjectUpdates
  };
}