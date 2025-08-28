import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus, ProjectStage, Customer } from '@/types/project';
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

// Database now uses new status values directly - no mapping needed

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const realtimeChannelRef = useRef<any>(null);

  const fetchProjects = async (forceRefresh = false) => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      // Check if we have valid cached data
      if (!forceRefresh && cacheService.isCacheValid()) {
        const cachedProjects = cacheService.getProjects();
        if (cachedProjects) {
          setProjects(cachedProjects);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          *,
          customer:contacts(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching projects:', fetchError);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      // Set projects data directly
      const mappedProjects = (data || []);
      setProjects(mappedProjects as Project[]);

      // Cache the data
      cacheService.setProjects(mappedProjects as Project[]);
    } catch (err) {
      console.error('Error in fetchProjects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

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
          console.log('🔔 Selective real-time update received:', {
            projectId: payload.new.id,
            oldStatus: payload.old?.status,
            newStatus: payload.new.status
          });

          // Update the specific project in our state
          setProjects(prev => {
            const updatedProjects = prev.map(project =>
              project.id === payload.new.id
                ? { ...project, ...payload.new }
                : project
            );

            // Update cache
            cacheService.setProjects(updatedProjects);
            return updatedProjects;
          });
        }
      )
      .subscribe();

    return realtimeChannelRef.current;
  }, []);

  // Set up real-time subscription - only for project detail pages
  useEffect(() => {
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

    // Subscribe to the global real-time manager
    const unsubscribe = realtimeManager.subscribe(() => {
      // When we receive a notification, refetch projects to get the latest data
      if (shouldLog) {
        console.log('🔔 useProjects: Received real-time update notification, refetching projects');
      }
      fetchProjects();
    });

    return () => {
      if (shouldLog) {
        console.log('🔔 useProjects: Unsubscribing from real-time manager');
      }
      unsubscribe();
    };
  }, [user]); // Remove projects.length dependency to prevent infinite loops

  // Get project by ID
  const getProjectById = async (id: string): Promise<Project | null> => {
    console.log('🔍 Fetching project with ID:', id);

    try {
      // First, log all projects to see what's available
      const { data: allProjects, error: allProjectsError } = await supabase
        .from('projects')
        .select(`
          *,
          customer:contacts(*)
        `);

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
          customer:contacts(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching project by ID:', error);
        // Try alternative approach with project_id field
        const { data: altData, error: altError } = await supabase
          .from('projects')
          .select(`
            *,
            customer:contacts(*)
          `)
          .eq('project_id', id)
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
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Failed to update project status. Please try again.",
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

      // Notify real-time subscribers
      realtimeManager.notifyUpdate();

      toast({
        title: "Status Updated",
        description: "Project status has been successfully updated.",
      });

      return true;
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An unexpected error occurred while updating the project status.",
      });
      return false;
    }
  };

  // Update project stage with validation
  const updateProjectStage = async (projectId: string, newStage: ProjectStage): Promise<WorkflowValidationResult> => {
    try {
      // Validate the workflow transition
      const validationResult = WorkflowValidator.validateTransition(projectId, newStage);
      if (!validationResult.isValid) {
        toast({
          variant: "destructive",
          title: "Invalid Workflow Transition",
          description: validationResult.message || "This workflow transition is not allowed.",
        });
        return validationResult;
      }

      // Update the project stage
      const { error } = await supabase
        .from('projects')
        .update({ 
          current_stage: newStage,
          stage_entered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating project stage:', error);
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Failed to update project stage. Please try again.",
        });
        return {
          isValid: false,
          message: "Failed to update project stage in database"
        };
      }

      // Update local state optimistically
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                current_stage: newStage, 
                stage_entered_at: new Date().toISOString(),
                updated_at: new Date().toISOString() 
              } 
            : project
        )
      );

      // Notify real-time subscribers
      realtimeManager.notifyUpdate();

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
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An unexpected error occurred while updating the project stage.",
      });
      return {
        isValid: false,
        message: "An unexpected error occurred"
      };
    }
  };

  // Optimistic update for project status (for UI updates before database confirmation)
  const updateProjectStatusOptimistic = (projectId: string, newStatus: ProjectStatus) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus } 
          : project
      )
    );
  };

  // Manual refetch function
  const refetch = useCallback(async (forceRefresh = false) => {
    await fetchProjects(forceRefresh);
  }, []);

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

  return {
    projects,
    loading,
    error,
    fetchProjects,
    updateProjectStage,
    updateProjectStatusOptimistic,
    refetch,
    getProjectById,
    getBottleneckAnalysis
  };
}