import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client.ts.js';
import { Project } from '@/types/project';
import { useAuth } from '@/core/auth';

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth();

    // Fetch projects from database
    useEffect(() => {
        const fetchProjects = async () => {
            if (!user || !profile?.organization_id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const { data, error: fetchError } = await (supabase as any)
                    .from('projects')
                    .select(`
                        *,
                        current_stage:workflow_stages(name, slug, color)
                    `)
                    .eq('organization_id', profile.organization_id)
                    .order('created_at', { ascending: false });

                if (fetchError) {
                    console.error('❌ Error fetching projects:', fetchError);
                    setError(fetchError.message);
                } else {
                    // Transform data to match Project interface
                    const transformedProjects = (data || []).map((project: any) => ({
                        ...project,
                        // Add computed fields for compatibility
                        due_date: project.estimated_delivery_date,
                        priority: project.priority_level,
                        customer_organization: null, // Will be populated separately if needed
                        primary_contact: null, // Will be populated separately if needed
                        days_in_stage: project.stage_entered_at
                            ? Math.floor((new Date().getTime() - new Date(project.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
                            : undefined,
                        // Ensure current_stage is properly mapped
                        current_stage: project.current_stage || null
                    }));

                    setProjects(transformedProjects as Project[]);
                    setError(null);
                }
            } catch (err) {
                console.error('💥 Error in fetchProjects:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
                setError(errorMessage);
                // Don't set empty array on error to preserve existing data
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user, profile?.organization_id]);

    return {
        projects,
        loading,
        error,
        refetch: () => {
            if (user && profile?.organization_id) {
                // Simple refetch by triggering useEffect again
                window.location.reload();
            }
        }
    };
}
