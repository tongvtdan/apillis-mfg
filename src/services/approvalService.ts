import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { notificationService } from './notificationService';

type Review = Database['public']['Tables']['reviews']['Row'];
type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

export interface ApprovalRequest {
    id: string;
    project_id: string;
    stage_id: string;
    approver_id: string;
    approver_role: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    decision_reason?: string;
    due_date?: string;
    created_at: string;
    updated_at: string;
}

export interface ApprovalHistory {
    id: string;
    project_id: string;
    stage_id: string;
    approver_id: string;
    approver_name: string;
    approver_role: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    decision_reason?: string;
    created_at: string;
    completed_at?: string;
}

export class ApprovalService {
    /**
     * Create approval requests for a project stage transition
     */
    async createApprovalRequests(
        projectId: string,
        stageId: string,
        approvalRoles: string[],
        organizationId: string
    ): Promise<ApprovalRequest[]> {
        try {
            // Get users with the required roles for approval
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, role')
                .eq('organization_id', organizationId)
                .in('role', approvalRoles)
                .eq('is_active', true);

            if (usersError) throw usersError;

            if (!users || users.length === 0) {
                throw new Error(`No active users found with required approval roles: ${approvalRoles.join(', ')}`);
            }

            // Create approval requests for each required role
            const approvalRequests: ReviewInsert[] = [];

            for (const role of approvalRoles) {
                // Find a user with this role (could be enhanced to support multiple approvers per role)
                const approver = users.find(u => u.role === role);

                if (approver) {
                    approvalRequests.push({
                        project_id: projectId,
                        reviewer_id: approver.id,
                        review_type: `stage_approval_${role.toLowerCase()}`,
                        status: 'pending',
                        organization_id: organizationId,
                        priority: 'medium',
                        due_date: this.calculateDueDate(3), // 3 days default
                        metadata: {
                            stage_id: stageId,
                            approval_role: role,
                            approval_type: 'stage_transition'
                        }
                    });
                }
            }

            if (approvalRequests.length === 0) {
                throw new Error('No approval requests could be created - no matching approvers found');
            }

            // Insert approval requests
            const { data: createdApprovals, error: insertError } = await supabase
                .from('reviews')
                .insert(approvalRequests)
                .select('*');

            if (insertError) throw insertError;

            // Send notifications to approvers
            await this.sendApprovalNotifications(createdApprovals || [], projectId);

            return this.mapReviewsToApprovalRequests(createdApprovals || []);
        } catch (error) {
            console.error('Error creating approval requests:', error);
            throw error;
        }
    }

    /**
     * Get pending approvals for a user
     */
    async getPendingApprovalsForUser(userId: string): Promise<ApprovalRequest[]> {
        try {
            const { data: reviews, error } = await supabase
                .from('reviews')
                .select(`
          *,
          projects:project_id (
            id,
            project_id,
            title,
            description,
            current_stage_id
          )
        `)
                .eq('reviewer_id', userId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return this.mapReviewsToApprovalRequests(reviews || []);
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
            throw error;
        }
    }

    /**
     * Get approval status for a project stage
     */
    async getApprovalStatus(projectId: string, stageId: string): Promise<{
        required: string[];
        pending: ApprovalRequest[];
        approved: ApprovalRequest[];
        rejected: ApprovalRequest[];
        isComplete: boolean;
    }> {
        try {
            // Get stage approval requirements
            const { data: stage, error: stageError } = await supabase
                .from('workflow_sub_stages')
                .select('approval_roles, requires_approval')
                .eq('id', stageId)
                .single();

            if (stageError) throw stageError;

            const requiredRoles = stage?.approval_roles || [];
            const requiresApproval = stage?.requires_approval || false;

            if (!requiresApproval || requiredRoles.length === 0) {
                return {
                    required: [],
                    pending: [],
                    approved: [],
                    rejected: [],
                    isComplete: true
                };
            }

            // Get existing approvals for this project and stage
            const { data: reviews, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .eq('project_id', projectId)
                .contains('metadata', { stage_id: stageId });

            if (reviewsError) throw reviewsError;

            const approvals = this.mapReviewsToApprovalRequests(reviews || []);

            const pending = approvals.filter(a => a.status === 'pending');
            const approved = approvals.filter(a => a.status === 'approved');
            const rejected = approvals.filter(a => a.status === 'rejected');

            // Check if all required roles have approved
            const approvedRoles = approved.map(a => a.approver_role);
            const isComplete = requiredRoles.every(role => approvedRoles.includes(role)) && rejected.length === 0;

            return {
                required: requiredRoles,
                pending,
                approved,
                rejected,
                isComplete
            };
        } catch (error) {
            console.error('Error getting approval status:', error);
            throw error;
        }
    }

    /**
     * Submit an approval decision
     */
    async submitApproval(
        approvalId: string,
        decision: 'approved' | 'rejected',
        comments?: string,
        decisionReason?: string
    ): Promise<boolean> {
        try {
            const updateData: ReviewUpdate = {
                status: decision,
                comments,
                decision_reason: decisionReason,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('reviews')
                .update(updateData)
                .eq('id', approvalId);

            if (error) throw error;

            // Send notification about the decision
            await this.sendApprovalDecisionNotification(approvalId, decision);

            return true;
        } catch (error) {
            console.error('Error submitting approval:', error);
            throw error;
        }
    }

    /**
     * Get approval history for a project
     */
    async getApprovalHistory(projectId: string): Promise<ApprovalHistory[]> {
        try {
            const { data: reviews, error } = await supabase
                .from('reviews')
                .select(`
          *,
          reviewer:reviewer_id (
            id,
            display_name,
            role
          )
        `)
                .eq('project_id', projectId)
                .like('review_type', 'stage_approval_%')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (reviews || []).map(review => ({
                id: review.id,
                project_id: review.project_id,
                stage_id: (review.metadata as any)?.stage_id || '',
                approver_id: review.reviewer_id,
                approver_name: (review as any).reviewer?.display_name || 'Unknown',
                approver_role: (review.metadata as any)?.approval_role || (review as any).reviewer?.role || '',
                status: review.status as 'pending' | 'approved' | 'rejected',
                comments: review.comments || undefined,
                decision_reason: review.decision_reason || undefined,
                created_at: review.created_at || '',
                completed_at: review.completed_at || undefined
            }));
        } catch (error) {
            console.error('Error fetching approval history:', error);
            throw error;
        }
    }

    /**
     * Auto-assign approvers based on stage requirements
     */
    async autoAssignApprovers(
        projectId: string,
        stageId: string,
        organizationId: string
    ): Promise<{ success: boolean; message: string; approvals?: ApprovalRequest[] }> {
        try {
            // Get stage approval requirements
            const { data: stage, error: stageError } = await supabase
                .from('workflow_sub_stages')
                .select('approval_roles, requires_approval, name')
                .eq('id', stageId)
                .single();

            if (stageError) throw stageError;

            if (!stage?.requires_approval || !stage.approval_roles || stage.approval_roles.length === 0) {
                return {
                    success: true,
                    message: 'No approvals required for this stage'
                };
            }

            // Check if approvals already exist
            const existingStatus = await this.getApprovalStatus(projectId, stageId);
            if (existingStatus.pending.length > 0 || existingStatus.approved.length > 0) {
                return {
                    success: false,
                    message: 'Approval requests already exist for this stage'
                };
            }

            // Create approval requests
            const approvals = await this.createApprovalRequests(
                projectId,
                stageId,
                stage.approval_roles,
                organizationId
            );

            return {
                success: true,
                message: `Created ${approvals.length} approval requests for ${stage.name}`,
                approvals
            };
        } catch (error) {
            console.error('Error auto-assigning approvers:', error);
            return {
                success: false,
                message: `Failed to assign approvers: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Private helper methods
     */
    private calculateDueDate(daysFromNow: number): string {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString();
    }

    private mapReviewsToApprovalRequests(reviews: Review[]): ApprovalRequest[] {
        return reviews.map(review => ({
            id: review.id,
            project_id: review.project_id,
            stage_id: (review.metadata as any)?.stage_id || '',
            approver_id: review.reviewer_id,
            approver_role: (review.metadata as any)?.approval_role || '',
            status: review.status as 'pending' | 'approved' | 'rejected',
            comments: review.comments || undefined,
            decision_reason: review.decision_reason || undefined,
            due_date: review.due_date || undefined,
            created_at: review.created_at || '',
            updated_at: review.updated_at || ''
        }));
    }

    private async sendApprovalNotifications(approvals: Review[], projectId: string): Promise<void> {
        try {
            // Get project details for notification
            const { data: project, error } = await supabase
                .from('projects')
                .select('title, current_stage_id, organization_id')
                .eq('id', projectId)
                .single();

            if (error) throw error;

            // Get stage name
            const { data: stage, error: stageError } = await supabase
                .from('workflow_sub_stages')
                .select('name')
                .eq('id', project.current_stage_id)
                .single();

            if (stageError) console.warn('Could not fetch stage name:', stageError);

            const approverIds = approvals.map(a => a.reviewer_id);

            await notificationService.sendApprovalRequestNotifications(
                approverIds,
                projectId,
                project.title,
                project.current_stage_id,
                stage?.name || 'Unknown Stage',
                project.organization_id
            );
        } catch (error) {
            console.error('Error sending approval notifications:', error);
            // Don't throw to avoid breaking the main flow
        }
    }

    private async sendApprovalDecisionNotification(approvalId: string, decision: string): Promise<void> {
        try {
            // Get approval and project details
            const { data: approval, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    project:project_id (
                        id,
                        title,
                        organization_id
                    ),
                    reviewer:reviewer_id (
                        id,
                        display_name
                    )
                `)
                .eq('id', approvalId)
                .single();

            if (error) throw error;

            const project = approval.project as any;
            const reviewer = approval.reviewer as any;

            await notificationService.sendApprovalDecisionNotifications(
                approval.project_id,
                project?.title || 'Unknown Project',
                reviewer?.display_name || 'Unknown Approver',
                decision as 'approved' | 'rejected',
                approval.comments || undefined,
                project?.organization_id
            );
        } catch (error) {
            console.error('Error sending approval decision notification:', error);
            // Don't throw to avoid breaking the main flow
        }
    }
}

export const approvalService = new ApprovalService();