import { supabase } from '@/integrations/supabase/client.js';
import { ProjectStageHistory } from '@/types/project';

export interface StageTransitionData {
    projectId: string;
    fromStageId?: string;
    toStageId: string;
    userId: string;
    reason?: string;
    bypassRequired?: boolean;
    bypassReason?: string;
    estimatedDuration?: number;
}

class StageHistoryService {
    /**
     * Record a stage transition in the activity log
     */
    async recordStageTransition(params: {
        projectId: string;
        fromStageId?: string;
        toStageId: string;
        userId: string;
        reason: string;
        bypassRequired?: boolean;
        bypassReason?: string;
        estimatedDuration?: number;
    }): Promise<void> {
        try {
            // Get project details for organization
            const project = await this.getProjectById(params.projectId);
            if (!project) {
                throw new Error('Project not found');
            }

            // Get stage names for better logging
            const fromStage = params.fromStageId ? await this.getStageById(params.fromStageId) : null;
            const toStage = await this.getStageById(params.toStageId);

            const fromStageName = fromStage?.name || 'Unknown';
            const toStageName = toStage?.name || 'Unknown';

            // Prepare activity log entry
            const activityData = {
                organization_id: project.organization_id,
                user_id: params.userId,
                entity_type: 'project',
                entity_id: params.projectId,
                project_id: params.projectId,  // Add project_id for direct reference
                action: params.bypassRequired ? 'stage_transition_bypass' : 'stage_transition',
                description: `Stage changed from ${fromStageName} to ${toStageName}`,
                metadata: {
                    from_stage_id: params.fromStageId,
                    from_stage_name: fromStageName,
                    to_stage_id: params.toStageId,
                    to_stage_name: toStageName,
                    reason: params.reason,
                    bypass_required: params.bypassRequired,
                    bypass_reason: params.bypassReason,
                    estimated_duration_days: params.estimatedDuration,
                    timestamp: new Date().toISOString()
                }
            };

            const { error } = await supabase
                .from('activity_log')
                .insert(activityData);

            if (error) {
                console.error('Error recording stage transition:', error);
                // Instead of throwing an error that stops the workflow, we'll log it and continue
                console.warn('Failed to record stage transition in activity log, continuing with transition');
                return;
            }

            console.log('✅ Stage transition recorded:', {
                project: params.projectId,
                transition: `${fromStageName} → ${toStageName}`,
                user: params.userId,
                bypass: params.bypassRequired
            });

        } catch (error) {
            console.error('Error in recordStageTransition:', error);
            // Log the error but don't stop the workflow transition
            console.warn('Non-critical error in recording stage transition, continuing with transition');
        }
    }

    /**
     * Get stage history for a project from activity logs
     */
    async getProjectStageHistory(projectId: string): Promise<ProjectStageHistory[]> {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select(`
          id,
          action,
          user_id,
          metadata,
          created_at,
          users!activity_log_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
                .eq('entity_id', projectId)
                .eq('entity_type', 'project')
                .in('action', ['stage_transition', 'stage_transition_bypass'])
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching stage history:', error);
                throw new Error(`Failed to fetch stage history: ${error.message}`);
            }

            // Transform activity log entries to stage history format
            const stageHistory: ProjectStageHistory[] = (data || []).map(entry => {
                const details = entry.metadata as any;
                const user = entry.users as any;

                return {
                    id: entry.id,
                    project_id: projectId,
                    stage_id: details?.to_stage_id || '',
                    entered_at: entry.created_at,
                    exited_at: undefined, // Will be calculated based on next transition
                    duration_minutes: undefined,
                    entered_by: entry.user_id,
                    exit_reason: details?.reason || undefined,
                    notes: details?.bypass_reason || details?.reason || undefined,
                    created_at: entry.created_at,
                    // Additional fields for display
                    stage_name: details?.to_stage_name || 'Unknown',
                    user_name: user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown User',
                    user_email: user?.email || '',
                    bypass_required: details?.bypass_required || false,
                    bypass_reason: details?.bypass_reason || undefined
                } as ProjectStageHistory & {
                    stage_name: string;
                    user_name: string;
                    user_email: string;
                    bypass_required: boolean;
                    bypass_reason?: string;
                };
            });

            // Calculate durations by setting exit times
            for (let i = 0; i < stageHistory.length - 1; i++) {
                const current = stageHistory[i];
                const next = stageHistory[i + 1];

                current.exited_at = next.entered_at;

                const enteredTime = new Date(current.entered_at).getTime();
                const exitedTime = new Date(next.entered_at).getTime();
                current.duration_minutes = Math.round((exitedTime - enteredTime) / (1000 * 60));
            }

            return stageHistory;

        } catch (error) {
            console.error('Error in getProjectStageHistory:', error);
            return [];
        }
    }

    /**
     * Get stage transition statistics for analytics
     */
    async getStageTransitionStats(organizationId: string, dateRange?: { from: string; to: string }) {
        try {
            let query = supabase
                .from('activity_log')
                .select('action, details, created_at')
                .eq('organization_id', organizationId)
                .in('action', ['stage_transition', 'stage_transition_bypass']);

            if (dateRange) {
                query = query
                    .gte('created_at', dateRange.from)
                    .lte('created_at', dateRange.to);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching transition stats:', error);
                return null;
            }

            // Analyze transition patterns
            const stats = {
                totalTransitions: data?.length || 0,
                bypassTransitions: data?.filter(d => d.action === 'stage_transition_bypass').length || 0,
                stageTransitionCounts: {} as Record<string, number>,
                averageStageTime: {} as Record<string, number>,
                bypassReasons: [] as string[]
            };

            data?.forEach(entry => {
                const details = entry.details as any;
                const stageName = details?.to_stage_name || 'Unknown';

                stats.stageTransitionCounts[stageName] = (stats.stageTransitionCounts[stageName] || 0) + 1;

                if (entry.action === 'stage_transition_bypass' && details?.bypass_reason) {
                    stats.bypassReasons.push(details.bypass_reason);
                }
            });

            return stats;

        } catch (error) {
            console.error('Error in getStageTransitionStats:', error);
            return null;
        }
    }

    /**
     * Helper method to get project by ID
     */
    private async getProjectById(projectId: string) {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('id, organization_id, title')
                .eq('id', projectId)
                .single();

            if (error) {
                console.error('Error fetching project:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getProjectById:', error);
            return null;
        }
    }

    /**
     * Helper method to get stage by ID
     */
    private async getStageById(stageId: string) {
        try {
            const { data, error } = await supabase
                .from('workflow_stages')
                .select('id, name')
                .eq('id', stageId)
                .single();

            if (error) {
                console.error('Error fetching stage:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getStageById:', error);
            return null;
        }
    }

    /**
     * Get recent stage transitions across all projects
     */
    async getRecentStageTransitions(organizationId: string, limit: number = 10) {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select(`
          id,
          action,
          project_id,
          metadata,
          created_at,
          users!activity_log_user_id_fkey (
            first_name,
            last_name,
            email
          ),
          projects!activity_log_project_id_fkey (
            project_id,
            title
          )
        `)
                .eq('organization_id', organizationId)
                .in('action', ['stage_transition', 'stage_transition_bypass'])
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching recent transitions:', error);
                return [];
            }

            return data?.map(entry => {
                const details = entry.metadata as any;
                const user = entry.users as any;
                const project = entry.projects as any;

                return {
                    id: entry.id,
                    action: entry.action,
                    project_id: entry.project_id,
                    project_title: project?.title || 'Unknown Project',
                    project_number: project?.project_id || 'Unknown',
                    stage_name: details?.to_stage_name || 'Unknown Stage',
                    user_name: user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown User',
                    bypass_required: details?.bypass_required || false,
                    created_at: entry.created_at
                };
            }) || [];

        } catch (error) {
            console.error('Error in getRecentStageTransitions:', error);
            return [];
        }
    }
}

// Export singleton instance
export const stageHistoryService = new StageHistoryService();