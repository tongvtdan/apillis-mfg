import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus, Customer } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

      setProjects(data || []);
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
          status: newStatus,
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
          inquiry: "New Inquiry",
          review: "Under Review", 
          quoted: "Quoted",
          won: "Won",
          lost: "Lost",
          production: "Production",
          completed: "Completed",
          cancelled: "Cancelled"
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
          status: newStatus,
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
          inquiry: "New Inquiry",
          review: "Under Review", 
          quoted: "Quoted",
          won: "Won",
          lost: "Lost",
          production: "Production",
          completed: "Completed",
          cancelled: "Cancelled"
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
        status: projectData.status || 'inquiry',
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

      setProjects(prev => [data, ...prev]);
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
            setProjects(prev => [payload.new as Project, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProjects(prev => prev.map(project => 
              project.id === (payload.new as Project).id 
                ? payload.new as Project 
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
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
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
    getProjectById
  };
}

// Legacy compatibility - gradually phase out
export const useRFQs = useProjects;