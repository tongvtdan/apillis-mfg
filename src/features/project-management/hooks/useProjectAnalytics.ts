import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { BottleneckAlert } from '@/types/supplier';

export function useProjectAnalytics() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth();
    const { toast } = useToast();

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
          customer_organization:organizations(*),
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

    // Get bottleneck analysis for projects
    const getBottleneckAnalysis = async (): Promise<BottleneckAlert[]> => {
        try {
            setLoading(true);
            setError(null);

            // This would typically call an API endpoint or perform complex analysis
            // For now, we'll return an empty array as a placeholder
            return [];
        } catch (error) {
            console.error('Error getting bottleneck analysis:', error);
            setError(error instanceof Error ? error.message : 'Failed to get bottleneck analysis');
            return [];
        } finally {
            setLoading(false);
        }
    };

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

    // Ensure real-time subscription is set up for a specific project
    const ensureProjectSubscription = useCallback((projectId: string) => {
        if (!projectId) return;

        console.log('🔔 Ensuring real-time subscription for project:', projectId);

        // This would typically set up selective subscription for this project
        console.log('🔔 Setting up selective subscription for project:', projectId);

        // Also ensure global subscription is active
        if (window.location.pathname.includes('/projects/') || window.location.pathname.includes('/project/')) {
            console.log('🔔 Global real-time subscription should be active for project detail page');
        }
    }, []);

    return {
        loading,
        error,
        getProjectById,
        getBottleneckAnalysis,
        testCustomerOrganizationFetching,
        ensureProjectSubscription
    };
}
