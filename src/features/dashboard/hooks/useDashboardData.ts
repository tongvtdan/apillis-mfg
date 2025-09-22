import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';
import { useEffect } from 'react';
import { ProjectStatus, ProjectPriority } from '@/types/project';

export interface DashboardProject {
    id: string;
    organization_id: string;
    project_id: string;
    title: string;
    status: ProjectStatus;
    priority_level: ProjectPriority;
    project_type?: string;
    created_at: string;
    customer_name?: string;
    estimated_delivery_date?: string;
    days_in_stage?: number;
    current_stage?: string | WorkflowStage;
}

export interface DashboardSummary {
    projects: {
        total: number;
        by_status: Record<string, number>;
        by_type: Record<string, number>;
        by_priority: Record<string, number>;
        by_stage: Record<string, number>;
    };
    recent_projects: DashboardProject[];
    generated_at: number;
    debug?: any; // Add debug info field
}

export function useDashboardData() {
    const { user, profile } = useAuth();

    // Create query with debug info
    const query = useQuery({
        queryKey: ['dashboard-summary', user?.id, profile?.organization_id],
        queryFn: async (): Promise<DashboardSummary> => {
            console.log('Fetching dashboard summary with auth context:', { user, profile });

            // Log auth state before making the call
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Current session:', session ? {
                user_id: session.user.id,
                expires_at: session.expires_at,
                has_token: !!session.access_token,
            } : 'No session');

            if (!user || !profile?.organization_id) {
                console.log('⚠️ No user or organization_id, returning empty dashboard data');
                return {
                    projects: {
                        total: 0,
                        by_status: {},
                        by_type: {},
                        by_priority: {},
                        by_stage: {}
                    },
                    recent_projects: [],
                    generated_at: Date.now(),
                    debug: { error: 'No user or organization_id' }
                };
            }

            try {
                console.log('🔍 Fetching dashboard data for organization:', profile.organization_id);

                // Get organization_id with fallback logic
                let organizationId = profile.organization_id;

                if (!organizationId) {
                    console.log('⚠️ No organization_id in profile, trying fallback...');
                    try {
                        // Try to get the first organization as fallback
                        const { data: fallbackOrg } = await supabase
                            .from('organizations')
                            .select('id')
                            .limit(1)
                            .maybeSingle();

                        if (fallbackOrg?.id) {
                            organizationId = fallbackOrg.id;
                            console.log('✅ Using fallback organization_id:', organizationId);
                        } else {
                            console.log('❌ No fallback organization found');
                            return {
                                projects: {
                                    total: 0,
                                    by_status: {},
                                    by_type: {},
                                    by_priority: {},
                                    by_stage: {}
                                },
                                recent_projects: [],
                                generated_at: Date.now(),
                                debug: { error: 'No organization found' }
                            };
                        }
                    } catch (fallbackError) {
                        console.error('❌ Error getting fallback organization:', fallbackError);
                        return {
                            projects: {
                                total: 0,
                                by_status: {},
                                by_type: {},
                                by_priority: {},
                                by_stage: {}
                            },
                            recent_projects: [],
                            generated_at: Date.now(),
                            debug: { error: 'Fallback organization error' }
                        };
                    }
                }

                // Fetch projects with proper organization filter
                const { data: projects, error: projectsError } = await supabase
                    .from('projects')
                    .select(`
            id,
            organization_id,
            project_id,
            title,
            status,
            priority_level,
            project_type,
            created_at,
            estimated_delivery_date,
            current_stage_id,
            stage_entered_at,
            customer_organization_id
          `)
                    .eq('organization_id', organizationId);

                if (projectsError) {
                    console.error('❌ Error fetching projects for dashboard:', projectsError);
                    throw new Error(`Failed to fetch projects: ${projectsError.message}`);
                }

                console.log('📊 Projects fetched for dashboard:', projects?.length || 0);

                // Calculate statistics
                const totalProjects = projects?.length || 0;
                const byStatus: Record<string, number> = {};
                const byType: Record<string, number> = {};
                const byPriority: Record<string, number> = {};
                const byStage: Record<string, number> = {};

                projects?.forEach(project => {
                    // Count by status
                    byStatus[project.status] = (byStatus[project.status] || 0) + 1;

                    // Count by type
                    if (project.project_type) {
                        byType[project.project_type] = (byType[project.project_type] || 0) + 1;
                    }

                    // Count by priority
                    byPriority[project.priority_level] = (byPriority[project.priority_level] || 0) + 1;

                    // Count by stage
                    if (project.current_stage_id) {
                        byStage[project.current_stage_id] = (byStage[project.current_stage_id] || 0) + 1;
                    }
                });

                // Get recent projects (last 10)
                const recentProjects = projects
                    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map(project => ({
                        id: project.id,
                        organization_id: project.organization_id,
                        project_id: project.project_id,
                        title: project.title,
                        status: project.status,
                        priority_level: project.priority_level,
                        project_type: project.project_type,
                        created_at: project.created_at,
                        estimated_delivery_date: project.estimated_delivery_date,
                        days_in_stage: project.stage_entered_at
                            ? Math.floor((new Date().getTime() - new Date(project.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
                            : undefined,
                        current_stage: project.current_stage_id
                    })) || [];

                const summary: DashboardSummary = {
                    projects: {
                        total: totalProjects,
                        by_status: byStatus,
                        by_type: byType,
                        by_priority: byPriority,
                        by_stage: byStage
                    },
                    recent_projects: recentProjects,
                    generated_at: Date.now(),
                    debug: {
                        organization_id: organizationId,
                        user_id: user.id,
                        projects_count: totalProjects,
                        timestamp: new Date().toISOString()
                    }
                };

                console.log('✅ Dashboard summary generated:', summary);
                return summary;

            } catch (error) {
                console.error('❌ Error generating dashboard summary:', error);
                throw error;
            }
        },
        enabled: !!user && !!profile?.organization_id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    });

    return query;
}
