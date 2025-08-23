import { useState, useEffect } from 'react';
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

// Legacy status to new status mapping
const LEGACY_TO_NEW_STATUS: Record<string, ProjectStatus> = {
  'inquiry': 'inquiry_received',
  'review': 'technical_review',
  'quoted': 'quoted',
  'won': 'order_confirmed',
  'lost': 'shipped_closed', // Map legacy 'lost' to completed for now
  'production': 'in_production',
  'completed': 'shipped_closed',
  'cancelled': 'shipped_closed'
};

// New status to legacy status mapping for database operations
const NEW_TO_LEGACY_STATUS: Record<ProjectStatus, string> = {
  'inquiry_received': 'inquiry',
  'technical_review': 'review',
  'supplier_rfq_sent': 'review',
  'quoted': 'quoted',
  'order_confirmed': 'won',
  'procurement_planning': 'won',
  'in_production': 'production',
  'shipped_closed': 'completed'
};

// Helper function to map legacy status to new status
const mapLegacyStatusToNew = (legacyStatus: string): ProjectStatus => {
  return LEGACY_TO_NEW_STATUS[legacyStatus] || 'inquiry_received';
};

// Helper function to map new status to legacy status for database
const mapNewStatusToLegacy = (newStatus: ProjectStatus): string => {
  return NEW_TO_LEGACY_STATUS[newStatus] || 'inquiry';
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching projects:', fetchError);
        setError(fetchError.message);
        return;
      }

      // Map legacy status values to new status values
      const mappedProjects = (data || []).map(project => ({
        ...project,
        status: mapLegacyStatusToNew(project.status)
      }));

      setProjects(mappedProjects);
    } catch (err) {
      console.error('Error in fetchProjects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      // Find the current project to get the old status
      const currentProject = projects.find(project => project.id === projectId);
      if (!currentProject) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Project not found",
        });
        return false;
      }

      const oldStatus = currentProject.status;

      const { error } = await supabase
        .from('projects')
        .update({
          status: mapNewStatusToLegacy(newStatus) as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update project status",
        });
        return false;
      }

      // Format status names for display
      const formatStatusName = (status: ProjectStatus) => {
        const statusMap = {
          inquiry_received: "Inquiry Received",
          technical_review: "Technical Review",
          supplier_rfq_sent: "Supplier RFQ Sent",
          quoted: "Quoted",
          order_confirmed: "Order Confirmed",
          procurement_planning: "Procurement & Planning",
          in_production: "In Production",
          shipped_closed: "Shipped & Closed"
        };
        return statusMap[status] || status;
      };

      toast({
        title: "Status Updated",
        description: `From ${formatStatusName(oldStatus)} to ${formatStatusName(newStatus)}`,
      });

      return true;
    } catch (err) {
      console.error('Error updating project status:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project status",
      });
      return false;
    }
  };

  // Optimistic update function for drag and drop
  const updateProjectStatusOptimistic = async (projectId: string, newStatus: ProjectStatus) => {
    const currentProject = projects.find(project => project.id === projectId);
    if (!currentProject) return false;

    const oldStatus = currentProject.status;

    // Optimistically update local state immediately
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
        : project
    ));

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: mapNewStatusToLegacy(newStatus) as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        // Revert optimistic update on error
        setProjects(prev => prev.map(project =>
          project.id === projectId
            ? { ...project, status: oldStatus, updated_at: new Date().toISOString() }
            : project
        ));

        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update project status",
        });
        return false;
      }

      // Format status names for display
      const formatStatusName = (status: ProjectStatus) => {
        const statusMap = {
          inquiry_received: "Inquiry Received",
          technical_review: "Technical Review",
          supplier_rfq_sent: "Supplier RFQ Sent",
          quoted: "Quoted",
          order_confirmed: "Order Confirmed",
          procurement_planning: "Procurement & Planning",
          in_production: "In Production",
          shipped_closed: "Shipped & Closed"
        };
        return statusMap[status] || status;
      };

      toast({
        title: "Status Updated",
        description: `From ${formatStatusName(oldStatus)} to ${formatStatusName(newStatus)}`,
      });

      return true;
    } catch (err) {
      console.error('Error updating project status:', err);

      // Revert optimistic update on error
      setProjects(prev => prev.map(project =>
        project.id === projectId
          ? { ...project, status: oldStatus, updated_at: new Date().toISOString() }
          : project
      ));

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project status",
      });
      return false;
    }
  };

  // Create a new project
  const createProject = async (projectData: Partial<Project>) => {
    try {
      // Clean the data - remove fields that shouldn't be in the insert
      const cleanData = {
        title: projectData.title!,
        description: projectData.description,
        customer_id: projectData.customer_id,
        status: mapNewStatusToLegacy(projectData.status || 'inquiry_received'),
        priority: projectData.priority || 'medium',
        priority_score: projectData.priority_score,
        assignee_id: projectData.assignee_id,
        estimated_value: projectData.estimated_value,
        due_date: projectData.due_date,
        contact_name: projectData.contact_name,
        contact_email: projectData.contact_email,
        contact_phone: projectData.contact_phone,
        tags: projectData.tags,
        notes: projectData.notes,
        created_by: user?.id
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([cleanData as any])
        .select(`
          *,
          customer:customers(*)
        `)
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      setProjects(prev => [{ ...data, status: mapLegacyStatusToNew(data.status) }, ...prev]);
      return data;
    } catch (err) {
      console.error('Error in createProject:', err);
      throw err;
    }
  };

  // Create or get customer
  const createOrGetCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
    try {
      // First, try to find existing customer by email or company
      if (customerData.email || customerData.company) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('*')
          .or(`email.eq.${customerData.email},company.eq.${customerData.company}`)
          .maybeSingle();

        if (existingCustomer) {
          return existingCustomer;
        }
      }

      // Create new customer - ensure name is provided
      const cleanCustomerData = {
        name: customerData.name || customerData.company || 'Unknown',
        company: customerData.company,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        country: customerData.country
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([cleanCustomerData])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Project change received:', payload);

          if (payload.eventType === 'INSERT') {
            const newProject = { ...payload.new as Project, status: mapLegacyStatusToNew((payload.new as any).status) };
            setProjects(prev => [newProject, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedProject = { ...payload.new as Project, status: mapLegacyStatusToNew((payload.new as any).status) };
            setProjects(prev => prev.map(project =>
              project.id === updatedProject.id
                ? updatedProject
                : project
            ));
          } else if (payload.eventType === 'DELETE') {
            setProjects(prev => prev.filter(project => project.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Get project by ID
  const getProjectById = async (id: string): Promise<Project> => {
    console.log('Fetching project with ID:', id);
    
    try {
      // Try to fetch with exact ID first
      let { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('id', id)
        .single();

      // If not found, try with alternative UUID formats
      if (error || !data) {
        console.log('Project not found with exact ID, trying with normalized ID format');
        
        // The ID might be formatted differently in the database vs the URL
        // Try fetching all projects and find by ID case-insensitive
        const { data: allProjects, error: allProjectsError } = await supabase
          .from('projects')
          .select(`
            *,
            customer:customers(*)
          `);

        if (allProjectsError) {
          console.error('Error fetching all projects:', allProjectsError);
          throw new Error(`Failed to fetch projects: ${allProjectsError.message}`);
        }

        // Find project by ID case-insensitive
        data = allProjects?.find(p => {
          const normalizedId = p.id.toLowerCase().replace(/-/g, '');
          const normalizedSearchId = id.toLowerCase().replace(/-/g, '');
          return normalizedId === normalizedSearchId;
        });
      }

      if (!data) {
        console.error('No project found with ID:', id);
        throw new Error('Project not found');
      }

      console.log('Project data fetched:', data);
      return {...data, status: mapLegacyStatusToNew(data.status)};
    } catch (err) {
      console.error('Error in getProjectById:', err);
      throw err;
    }
  };

  // Enhanced functions for supplier quote integration
  const getProjectQuotes = async (projectId: string): Promise<SupplierQuote[]> => {
    try {
      const { data, error } = await supabase
        .from('supplier_quotes')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching project quotes:', err);
      return [];
    }
  };

  const getQuoteReadinessScore = async (projectId: string): Promise<QuoteReadinessIndicator | null> => {
    try {
      const { data, error } = await supabase.rpc('get_project_quote_readiness', {
        p_project_id: projectId
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error getting quote readiness score:', err);
      return null;
    }
  };

  const getProjectAnalytics = async (projectId: string): Promise<ProjectWorkflowAnalytics[]> => {
    try {
      const { data, error } = await supabase
        .from('project_workflow_analytics')
        .select('*')
        .eq('project_id', projectId)
        .order('stage_entered_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching project analytics:', err);
      return [];
    }
  };

  const detectBottlenecks = async (): Promise<BottleneckAlert[]> => {
    try {
      const { data, error } = await supabase.rpc('detect_project_bottlenecks');

      if (error) {
        throw error;
      }

      return (data || []).map((item: any): BottleneckAlert => ({
        type: '🔥 Bottlenecks Detected',
        project_id: item.project_id,
        project_title: item.project_title,
        current_stage: item.current_stage,
        hours_in_stage: item.hours_in_stage,
        sla_hours: item.sla_hours,
        severity: item.severity,
        issues: [`${item.current_stage} stage exceeds SLA by ${(item.hours_in_stage - item.sla_hours).toFixed(1)} hours`],
        recommended_actions: item.recommended_actions,
        affected_projects: [item.project_id]
      }));
    } catch (err) {
      console.error('Error detecting bottlenecks:', err);
      return [];
    }
  };

  const getProjectTimeline = async (projectId: string): Promise<ProjectWorkflowAnalytics[]> => {
    return getProjectAnalytics(projectId);
  };

  const getCriticalPath = async (projectId: string): Promise<string[]> => {
    try {
      const analytics = await getProjectAnalytics(projectId);

      // Identify stages that took longer than SLA
      const criticalStages = analytics
        .filter(stage => stage.sla_exceeded || stage.is_bottleneck)
        .map(stage => stage.stage_name);

      return criticalStages;
    } catch (err) {
      console.error('Error getting critical path:', err);
      return [];
    }
  };

  const getProjectsWithQuoteReadiness = async (): Promise<(Project & { quote_readiness?: QuoteReadinessIndicator })[]> => {
    try {
      const projectsWithQuotes = await Promise.all(
        projects.map(async (project) => {
          const quoteReadiness = await getQuoteReadinessScore(project.id);
          return {
            ...project,
            quote_readiness: quoteReadiness
          };
        })
      );

      return projectsWithQuotes;
    } catch (err) {
      console.error('Error getting projects with quote readiness:', err);
      return projects;
    }
  };

  const getAnalyticsSummary = async (): Promise<AnalyticsMetrics | null> => {
    try {
      const { data, error } = await supabase.rpc('get_project_analytics_summary');

      if (error) {
        throw error;
      }

      // Get additional metrics
      const bottlenecks = await detectBottlenecks();

      const analytics: AnalyticsMetrics = {
        supplier_response_rate: data.supplierResponseRate || 0,
        average_cycle_time: data.averageCycleTimeDays || 0,
        win_rate: 48, // Placeholder - calculate from actual data
        on_time_delivery_rate: 92, // Placeholder - calculate from actual data
        rfq_conversion_rate: 0, // Calculate from RFQ to won projects
        bottleneck_stages: bottlenecks,
        cost_savings: 0, // Calculate from quote comparisons
        intake_portal_metrics: {
          total_submissions: projects.length,
          submissions_this_week: projects.filter(p => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(p.created_at) > weekAgo;
          }).length,
          average_processing_time: data.averageCycleTimeDays || 0,
          completion_rate: 85, // Placeholder
          top_submission_sources: []
        },
        lead_time_by_phase: {
          inquiry: 1.2,
          review: 2.1,
          supplier_rfq: 2.8,
          quoted: 0.7,
          order: 0.0
        },
        generated_at: new Date().toISOString(),
        period_days: data.periodDays || 90
      };

      return analytics;
    } catch (err) {
      console.error('Error getting analytics summary:', err);
      return null;
    }
  };

  const refreshAnalytics = async (): Promise<void> => {
    try {
      await supabase.rpc('refresh_project_analytics');
    } catch (err) {
      console.error('Error refreshing analytics:', err);
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    updateProjectStatus,
    updateProjectStatusOptimistic,
    createProject,
    createOrGetCustomer,
    getProjectById,

    // New supplier quote integration
    getProjectQuotes,
    getQuoteReadinessScore,

    // Enhanced analytics
    getProjectAnalytics,
    detectBottlenecks,
    getAnalyticsSummary,
    refreshAnalytics,

    // Workflow optimization
    getProjectTimeline,
    getCriticalPath,
    getProjectsWithQuoteReadiness
  };
}

// Legacy compatibility - gradually phase out
export const useRFQs = useProjects;