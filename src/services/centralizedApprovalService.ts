import { supabase } from '@/integrations/supabase/client.js';
import {
    Approval,
    ApprovalCreateData,
    ApprovalUpdateData,
    ApprovalDecisionData,
    ApprovalFilter,
    ApprovalStats,
    ApprovalHistory,
    ApprovalAttachment,
    ApprovalNotification,
    ApprovalType,
    ApprovalStatus,
    ApprovalPriority,
    LegacyApprovalRequest,
    LegacyApprovalHistory
} from '@/types/approval';
import { User } from '@/types/user';

export class CentralizedApprovalService {
    /**
     * Create a new approval request
     */
    async createApproval(data: ApprovalCreateData, organizationId: string): Promise<Approval> {
        try {
            const { data: approval, error } = await supabase
                .from('approvals')
                .insert({
                    organization_id: organizationId,
                    approval_type: data.approval_type,
                    title: data.title,
                    description: data.description,
                    reference_id: data.reference_id,
                    entity_type: data.entity_type,
                    entity_id: data.entity_id,
                    approval_chain_id: data.approval_chain_id,
                    step_number: data.step_number || 1,
                    total_steps: data.total_steps || 1,
                    requested_by: data.current_approver_id, // This will be set by the function
                    current_approver_id: data.current_approver_id,
                    current_approver_role: data.current_approver_role,
                    current_approver_department: data.current_approver_department,
                    priority: data.priority || 'normal',
                    due_date: data.due_date,
                    request_reason: data.request_reason,
                    request_metadata: data.request_metadata || {},
                    created_by: data.current_approver_id
                })
                .select(`
                    *,
                    requester:requested_by(*),
                    current_approver:current_approver_id(*),
                    decided_by_user:decided_by(*)
                `)
                .single();

            if (error) throw error;

            // Send notification to approver
            await this.sendApprovalRequestNotification(approval.id, approval.current_approver_id!);

            return approval as Approval;
        } catch (error) {
            console.error('Error creating approval:', error);
            throw error;
        }
    }

    /**
     * Get approval by ID with full details
     */
    async getApprovalById(id: string): Promise<Approval> {
        try {
            const { data: approval, error } = await supabase
                .from('approvals')
                .select(`
                    *,
                    requester:requested_by(*),
                    current_approver:current_approver_id(*),
                    decided_by_user:decided_by(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return approval as Approval;
        } catch (error) {
            console.error('Error fetching approval:', error);
            throw error;
        }
    }

    /**
     * Get approvals with filtering and pagination
     */
    async getApprovals(
        filter: ApprovalFilter = {},
        page: number = 1,
        limit: number = 20,
        organizationId: string
    ): Promise<{ approvals: Approval[]; total: number }> {
        try {
            let query = supabase
                .from('approvals')
                .select(`
                    *,
                    requester:requested_by(*),
                    current_approver:current_approver_id(*),
                    decided_by_user:decided_by(*)
                `, { count: 'exact' })
                .eq('organization_id', organizationId);

            // Apply filters
            if (filter.approval_type) {
                query = query.eq('approval_type', filter.approval_type);
            }
            if (filter.status) {
                query = query.eq('status', filter.status);
            }
            if (filter.priority) {
                query = query.eq('priority', filter.priority);
            }
            if (filter.entity_type) {
                query = query.eq('entity_type', filter.entity_type);
            }
            if (filter.entity_id) {
                query = query.eq('entity_id', filter.entity_id);
            }
            if (filter.requested_by) {
                query = query.eq('requested_by', filter.requested_by);
            }
            if (filter.current_approver_id) {
                query = query.eq('current_approver_id', filter.current_approver_id);
            }
            if (filter.due_date_from) {
                query = query.gte('due_date', filter.due_date_from);
            }
            if (filter.due_date_to) {
                query = query.lte('due_date', filter.due_date_to);
            }
            if (filter.created_at_from) {
                query = query.gte('created_at', filter.created_at_from);
            }
            if (filter.created_at_to) {
                query = query.lte('created_at', filter.created_at_to);
            }
            if (filter.overdue_only) {
                query = query.lt('due_date', new Date().toISOString());
            }

            // Apply pagination
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            // Order by priority and creation date
            query = query.order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            const { data: approvals, error, count } = await query;

            if (error) throw error;

            return {
                approvals: (approvals || []) as Approval[],
                total: count || 0
            };
        } catch (error) {
            console.error('Error fetching approvals:', error);
            throw error;
        }
    }

    /**
     * Get pending approvals for a specific user
     */
    async getPendingApprovalsForUser(userId: string): Promise<Approval[]> {
        try {
            const { data: approvals, error } = await supabase
                .from('approvals')
                .select(`
                    *,
                    requester:requested_by(*),
                    current_approver:current_approver_id(*),
                    decided_by_user:decided_by(*)
                `)
                .eq('current_approver_id', userId)
                .in('status', ['pending', 'in_review'])
                .order('priority', { ascending: false })
                .order('created_at', { ascending: true });

            if (error) throw error;
            return (approvals || []) as Approval[];
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
            throw error;
        }
    }

    /**
     * Submit an approval decision
     */
    async submitApprovalDecision(
        approvalId: string,
        decision: ApprovalDecisionData
    ): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('submit_approval_decision', {
                p_approval_id: approvalId,
                p_decision: decision.decision,
                p_comments: decision.comments,
                p_reason: decision.reason,
                p_metadata: decision.metadata || {}
            });

            if (error) throw error;

            // Send notification about the decision
            await this.sendApprovalDecisionNotification(approvalId, decision.decision);

            return true;
        } catch (error) {
            console.error('Error submitting approval decision:', error);
            throw error;
        }
    }

    /**
     * Update approval details
     */
    async updateApproval(id: string, data: ApprovalUpdateData): Promise<Approval> {
        try {
            const { data: approval, error } = await supabase
                .from('approvals')
                .update({
                    ...data,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select(`
                    *,
                    requester:requested_by(*),
                    current_approver:current_approver_id(*),
                    decided_by_user:decided_by(*)
                `)
                .single();

            if (error) throw error;
            return approval as Approval;
        } catch (error) {
            console.error('Error updating approval:', error);
            throw error;
        }
    }

    /**
     * Delete an approval (only if pending and created by the user)
     */
    async deleteApproval(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('approvals')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting approval:', error);
            throw error;
        }
    }

    /**
     * Get approval history
     */
    async getApprovalHistory(approvalId: string): Promise<ApprovalHistory[]> {
        try {
            const { data: history, error } = await supabase
                .from('approval_history')
                .select(`
                    *,
                    action_by_user:action_by(*)
                `)
                .eq('approval_id', approvalId)
                .order('action_at', { ascending: false });

            if (error) throw error;
            return (history || []) as ApprovalHistory[];
        } catch (error) {
            console.error('Error fetching approval history:', error);
            throw error;
        }
    }

    /**
     * Get approval history by entity ID
     */
    async getEntityApprovalHistory(entityType: string, entityId: string): Promise<ApprovalHistory[]> {
        try {
            const { data: history, error } = await supabase
                .from('approval_history')
                .select(`
                    ah:*,
                    action_by_user:action_by(*),
                    approval:approval_id(*)
                `)
                .eq('approval.entity_type', entityType)
                .eq('approval.entity_id', entityId)
                .order('action_at', { ascending: false });

            if (error) throw error;
            return (history || []) as ApprovalHistory[];
        } catch (error) {
            console.error('Error fetching entity approval history:', error);
            throw error;
        }
    }

    /**
     * Get approval attachments
     */
    async getApprovalAttachments(approvalId: string): Promise<ApprovalAttachment[]> {
        try {
            const { data: attachments, error } = await supabase
                .from('approval_attachments')
                .select(`
                    *,
                    uploaded_by_user:uploaded_by(*)
                `)
                .eq('approval_id', approvalId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;
            return (attachments || []) as ApprovalAttachment[];
        } catch (error) {
            console.error('Error fetching approval attachments:', error);
            throw error;
        }
    }

    /**
     * Upload attachment to approval
     */
    async uploadApprovalAttachment(
        approvalId: string,
        file: File,
        attachmentType: string = 'supporting_document',
        description?: string
    ): Promise<ApprovalAttachment> {
        try {
            // Upload file to storage
            const fileName = `${approvalId}/${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('approval-attachments')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('approval-attachments')
                .getPublicUrl(fileName);

            // Create attachment record
            const { data: attachment, error } = await supabase
                .from('approval_attachments')
                .insert({
                    approval_id: approvalId,
                    file_name: fileName,
                    original_file_name: file.name,
                    file_type: file.type,
                    file_size: file.size,
                    file_url: urlData.publicUrl,
                    mime_type: file.type,
                    attachment_type: attachmentType,
                    description,
                    uploaded_by: (await supabase.auth.getUser()).data.user?.id
                })
                .select(`
                    *,
                    uploaded_by_user:uploaded_by(*)
                `)
                .single();

            if (error) throw error;
            return attachment as ApprovalAttachment;
        } catch (error) {
            console.error('Error uploading approval attachment:', error);
            throw error;
        }
    }

    /**
     * Get approval statistics
     */
    async getApprovalStats(organizationId: string): Promise<ApprovalStats> {
        try {
            const { data: approvals, error } = await supabase
                .from('approvals')
                .select('status, approval_type, priority, due_date')
                .eq('organization_id', organizationId);

            if (error) throw error;

            const stats: ApprovalStats = {
                total: approvals.length,
                pending: 0,
                in_review: 0,
                approved: 0,
                rejected: 0,
                delegated: 0,
                expired: 0,
                cancelled: 0,
                auto_approved: 0,
                escalated: 0,
                overdue: 0,
                by_type: {} as Record<ApprovalType, number>,
                by_priority: {} as Record<ApprovalPriority, number>
            };

            const now = new Date();

            approvals.forEach(approval => {
                // Count by status
                stats[approval.status as keyof ApprovalStats]++;

                // Count by type
                const type = approval.approval_type as ApprovalType;
                stats.by_type[type] = (stats.by_type[type] || 0) + 1;

                // Count by priority
                const priority = approval.priority as ApprovalPriority;
                stats.by_priority[priority] = (stats.by_priority[priority] || 0) + 1;

                // Count overdue
                if (approval.due_date && new Date(approval.due_date) < now &&
                    ['pending', 'in_review'].includes(approval.status)) {
                    stats.overdue++;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error fetching approval stats:', error);
            throw error;
        }
    }

    /**
     * Delegate approval to another user
     */
    async delegateApproval(
        approvalId: string,
        delegateUserId: string,
        reason: string,
        endDate?: string
    ): Promise<Approval> {
        try {
            // Start a transaction to ensure data consistency
            const { data: approval, error } = await supabase
                .from('approvals')
                .update({
                    delegated_to: delegateUserId,
                    delegation_reason: reason,
                    delegation_end_date: endDate,
                    delegated_at: new Date().toISOString(),
                    status: 'delegated',
                    updated_at: new Date().toISOString()
                })
                .eq('id', approvalId)
                .select(`
                    *,
                    requester:requested_by(*),
                    current_approver:current_approver_id(*),
                    decided_by_user:decided_by(*)
                `)
                .single();

            if (error) throw error;

            // Send notification to delegate
            await this.sendApprovalDelegationNotification(approvalId, delegateUserId);

            return approval as Approval;
        } catch (error) {
            console.error('Error delegating approval:', error);
            throw error;
        }
    }

    /**
     * Create a delegation rule for automatic approval delegation
     */
    async createApprovalDelegation(
        delegatorId: string,
        delegateId: string,
        startDate: string,
        endDate: string,
        reason: string,
        organizationId: string,
        includeNewApprovals: boolean = true
    ): Promise<any> {
        try {
            const { data: delegation, error } = await supabase
                .from('approval_delegations')
                .insert({
                    delegator_id: delegatorId,
                    delegate_id: delegateId,
                    start_date: startDate,
                    end_date: endDate,
                    reason,
                    include_new_approvals: includeNewApprovals,
                    organization_id: organizationId,
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            return delegation;
        } catch (error) {
            console.error('Error creating approval delegation:', error);
            throw error;
        }
    }

    /**
     * Get active delegations for a user
     */
    async getActiveDelegations(userId: string, organizationId: string): Promise<any[]> {
        try {
            const { data: delegations, error } = await supabase
                .from('approval_delegations')
                .select(`
                    *,
                    delegator:delegator_id(*),
                    delegate:delegate_id(*)
                `)
                .eq('organization_id', organizationId)
                .eq('status', 'active')
                .and(`delegator_id.eq.${userId},or(delegate_id.eq.${userId})`)
                .lte('start_date', new Date().toISOString())
                .gte('end_date', new Date().toISOString());

            if (error) throw error;

            return delegations || [];
        } catch (error) {
            console.error('Error fetching active delegations:', error);
            throw error;
        }
    }

    /**
     * Map a specific approval to a delegation rule
     */
    async mapApprovalToDelegation(delegationId: string, approvalId: string): Promise<any> {
        try {
            const { data: mapping, error } = await supabase
                .from('approval_delegation_mappings')
                .insert({
                    delegation_id: delegationId,
                    approval_id: approvalId
                })
                .select()
                .single();

            if (error) throw error;

            return mapping;
        } catch (error) {
            console.error('Error mapping approval to delegation:', error);
            throw error;
        }
    }

    /**
     * Escalate approval to higher authority
     */
    async escalateApproval(
        approvalId: string,
        escalateToUserId: string,
        reason: string
    ): Promise<Approval> {
        try {
            const { data: approval, error } = await supabase
                .from('approvals')
                .update({
                    escalated_to: escalateToUserId,
                    escalation_reason: reason,
                    escalated_at: new Date().toISOString(),
                    status: 'escalated',
                    updated_at: new Date().toISOString()
                })
                .eq('id', approvalId)
                .select(`
                    *,
                    requester:requested_by(*),
                    current_approver:current_approver_id(*),
                    decided_by_user:decided_by(*)
                `)
                .single();

            if (error) throw error;

            // Send notification about escalation
            await this.sendApprovalEscalationNotification(approvalId, escalateToUserId);

            return approval as Approval;
        } catch (error) {
            console.error('Error escalating approval:', error);
            throw error;
        }
    }

    /**
     * Auto-approve based on rules
     */
    async autoApproveApproval(approvalId: string, reason: string): Promise<Approval> {
        try {
            const { data: approval, error } = await supabase
                .from('approvals')
                .update({
                    status: 'auto_approved',
                    auto_approved_at: new Date().toISOString(),
                    auto_approval_reason: reason,
                    updated_at: new Date().toISOString()
                })
                .eq('id', approvalId)
                .select(`
                    *,
                    requester:requested_by(*),
                    current_approver:current_approver_id(*),
                    decided_by_user:decided_by(*)
                `)
                .single();

            if (error) throw error;

            // Send notification about auto-approval
            await this.sendAutoApprovalNotification(approvalId);

            return approval as Approval;
        } catch (error) {
            console.error('Error auto-approving approval:', error);
            throw error;
        }
    }

    // Notification methods
    private async sendApprovalRequestNotification(approvalId: string, approverId: string): Promise<void> {
        try {
            const approval = await this.getApprovalById(approvalId);

            await supabase
                .from('approval_notifications')
                .insert({
                    approval_id: approvalId,
                    organization_id: approval.organization_id,
                    notification_type: 'request',
                    recipient_id: approverId,
                    recipient_type: 'approver',
                    subject: `Approval Request: ${approval.title}`,
                    message: `You have a new approval request: ${approval.title}`,
                    notification_data: {
                        approval_type: approval.approval_type,
                        entity_type: approval.entity_type,
                        entity_id: approval.entity_id
                    }
                });
        } catch (error) {
            console.error('Error sending approval request notification:', error);
        }
    }

    private async sendApprovalDecisionNotification(approvalId: string, decision: string): Promise<void> {
        try {
            const approval = await this.getApprovalById(approvalId);

            await supabase
                .from('approval_notifications')
                .insert({
                    approval_id: approvalId,
                    organization_id: approval.organization_id,
                    notification_type: 'decision',
                    recipient_id: approval.requested_by,
                    recipient_type: 'requester',
                    subject: `Approval ${decision}: ${approval.title}`,
                    message: `Your approval request "${approval.title}" has been ${decision}`,
                    notification_data: {
                        decision,
                        approval_type: approval.approval_type
                    }
                });
        } catch (error) {
            console.error('Error sending approval decision notification:', error);
        }
    }

    private async sendApprovalDelegationNotification(approvalId: string, delegateId: string): Promise<void> {
        try {
            const approval = await this.getApprovalById(approvalId);

            await supabase
                .from('approval_notifications')
                .insert({
                    approval_id: approvalId,
                    organization_id: approval.organization_id,
                    notification_type: 'delegation',
                    recipient_id: delegateId,
                    recipient_type: 'approver',
                    subject: `Approval Delegated: ${approval.title}`,
                    message: `An approval has been delegated to you: ${approval.title}`,
                    notification_data: {
                        approval_type: approval.approval_type
                    }
                });
        } catch (error) {
            console.error('Error sending approval delegation notification:', error);
        }
    }

    private async sendApprovalEscalationNotification(approvalId: string, escalateToId: string): Promise<void> {
        try {
            const approval = await this.getApprovalById(approvalId);

            await supabase
                .from('approval_notifications')
                .insert({
                    approval_id: approvalId,
                    organization_id: approval.organization_id,
                    notification_type: 'escalation',
                    recipient_id: escalateToId,
                    recipient_type: 'approver',
                    subject: `Approval Escalated: ${approval.title}`,
                    message: `An approval has been escalated to you: ${approval.title}`,
                    notification_data: {
                        approval_type: approval.approval_type
                    }
                });
        } catch (error) {
            console.error('Error sending approval escalation notification:', error);
        }
    }

    private async sendAutoApprovalNotification(approvalId: string): Promise<void> {
        try {
            const approval = await this.getApprovalById(approvalId);

            await supabase
                .from('approval_notifications')
                .insert({
                    approval_id: approvalId,
                    organization_id: approval.organization_id,
                    notification_type: 'decision',
                    recipient_id: approval.requested_by,
                    recipient_type: 'requester',
                    subject: `Auto-Approved: ${approval.title}`,
                    message: `Your approval request "${approval.title}" has been automatically approved`,
                    notification_data: {
                        decision: 'auto_approved',
                        approval_type: approval.approval_type
                    }
                });
        } catch (error) {
            console.error('Error sending auto-approval notification:', error);
        }
    }

    // Migration helper methods for backward compatibility
    async migrateLegacyApprovals(): Promise<number> {
        try {
            // Get all legacy approval records from reviews table
            const { data: legacyApprovals, error } = await supabase
                .from('reviews')
                .select('*')
                .like('review_type', 'stage_approval_%');

            if (error) throw error;

            let migratedCount = 0;

            for (const legacy of legacyApprovals || []) {
                try {
                    // Create new approval record
                    await this.createApproval({
                        approval_type: 'stage_transition',
                        title: `Stage Transition Approval - ${legacy.reviewer_role}`,
                        description: `Legacy approval for project stage transition`,
                        entity_type: 'project',
                        entity_id: legacy.project_id,
                        current_approver_id: legacy.reviewer_id,
                        current_approver_role: legacy.reviewer_role,
                        priority: 'normal',
                        request_reason: 'Migrated from legacy approval system',
                        request_metadata: {
                            legacy_review_id: legacy.id,
                            original_review_type: legacy.review_type
                        }
                    }, legacy.organization_id);

                    migratedCount++;
                } catch (migrationError) {
                    console.error(`Error migrating legacy approval ${legacy.id}:`, migrationError);
                }
            }

            return migratedCount;
        } catch (error) {
            console.error('Error migrating legacy approvals:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const centralizedApprovalService = new CentralizedApprovalService();