import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type NotificationInsert = {
    user_id: string;
    title: string;
    message: string;
    type: 'approval_request' | 'approval_decision' | 'stage_transition' | 'project_update' | 'system';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: any;
    organization_id: string;
};

export interface NotificationTemplate {
    subject: string;
    message: string;
    emailTemplate?: string;
}

export class NotificationService {
    /**
     * Send approval request notifications
     */
    async sendApprovalRequestNotifications(
        approverIds: string[],
        projectId: string,
        projectTitle: string,
        stageId: string,
        stageName: string,
        organizationId: string
    ): Promise<void> {
        try {
            // Create in-app notifications
            const notifications: NotificationInsert[] = approverIds.map(approverId => ({
                user_id: approverId,
                title: 'Approval Required',
                message: `Your approval is required for project "${projectTitle}" to advance to ${stageName} stage.`,
                type: 'approval_request',
                priority: 'high',
                metadata: {
                    project_id: projectId,
                    stage_id: stageId,
                    action_url: `/projects/${projectId}`
                },
                organization_id: organizationId
            }));

            // Insert notifications (assuming notifications table exists)
            // For now, we'll log them since the table might not exist yet
            console.log('Approval request notifications:', notifications);

            // TODO: Send email notifications
            await this.sendEmailNotifications(approverIds, {
                subject: `Approval Required: ${projectTitle}`,
                message: `Your approval is required for project "${projectTitle}" to advance to ${stageName} stage. Please review and provide your decision.`,
                emailTemplate: 'approval_request'
            });

        } catch (error) {
            console.error('Error sending approval request notifications:', error);
            throw error;
        }
    }

    /**
     * Send approval decision notifications
     */
    async sendApprovalDecisionNotifications(
        projectId: string,
        projectTitle: string,
        approverName: string,
        decision: 'approved' | 'rejected',
        comments?: string,
        organizationId?: string
    ): Promise<void> {
        try {
            // Get project stakeholders (project manager, team members, etc.)
            const { data: project, error } = await supabase
                .from('projects')
                .select(`
          assigned_to,
          created_by,
          organization_id
        `)
                .eq('id', projectId)
                .single();

            if (error) throw error;

            const stakeholderIds = [project.assigned_to, project.created_by].filter(Boolean);
            const orgId = organizationId || project.organization_id;

            if (stakeholderIds.length === 0) return;

            const notifications: NotificationInsert[] = stakeholderIds.map(userId => ({
                user_id: userId,
                title: `Approval ${decision.charAt(0).toUpperCase() + decision.slice(1)}`,
                message: `${approverName} has ${decision} the approval for project "${projectTitle}".${comments ? ` Comment: ${comments}` : ''}`,
                type: 'approval_decision',
                priority: decision === 'rejected' ? 'high' : 'medium',
                metadata: {
                    project_id: projectId,
                    decision,
                    approver_name: approverName,
                    action_url: `/projects/${projectId}`
                },
                organization_id: orgId
            }));

            console.log('Approval decision notifications:', notifications);

            // TODO: Send email notifications
            await this.sendEmailNotifications(stakeholderIds, {
                subject: `Approval ${decision}: ${projectTitle}`,
                message: `${approverName} has ${decision} the approval for project "${projectTitle}".${comments ? ` Comment: ${comments}` : ''}`,
                emailTemplate: 'approval_decision'
            });

        } catch (error) {
            console.error('Error sending approval decision notifications:', error);
            throw error;
        }
    }

    /**
     * Send overdue approval reminders
     */
    async sendOverdueApprovalReminders(): Promise<void> {
        try {
            // Get overdue approvals
            const { data: overdueApprovals, error } = await supabase
                .from('reviews')
                .select(`
          *,
          project:project_id (
            id,
            project_id,
            title
          ),
          reviewer:reviewer_id (
            id,
            display_name,
            email
          )
        `)
                .eq('status', 'pending')
                .lt('due_date', new Date().toISOString())
                .like('review_type', 'stage_approval_%');

            if (error) throw error;

            if (!overdueApprovals || overdueApprovals.length === 0) {
                console.log('No overdue approvals found');
                return;
            }

            // Send reminders
            for (const approval of overdueApprovals) {
                const project = approval.project as any;
                const reviewer = approval.reviewer as any;

                if (reviewer?.id) {
                    const notification: NotificationInsert = {
                        user_id: reviewer.id,
                        title: 'Overdue Approval Reminder',
                        message: `Your approval for project "${project?.title}" is overdue. Please review and provide your decision.`,
                        type: 'approval_request',
                        priority: 'urgent',
                        metadata: {
                            project_id: approval.project_id,
                            approval_id: approval.id,
                            action_url: `/projects/${approval.project_id}`
                        },
                        organization_id: approval.organization_id
                    };

                    console.log('Overdue approval reminder:', notification);

                    // TODO: Send email reminder
                    if (reviewer.email) {
                        await this.sendEmailNotifications([reviewer.id], {
                            subject: `OVERDUE: Approval Required for ${project?.title}`,
                            message: `Your approval for project "${project?.title}" is overdue. Please review and provide your decision as soon as possible.`,
                            emailTemplate: 'overdue_approval_reminder'
                        });
                    }
                }
            }

        } catch (error) {
            console.error('Error sending overdue approval reminders:', error);
            throw error;
        }
    }

    /**
     * Get notification preferences for a user
     */
    async getNotificationPreferences(userId: string): Promise<{
        email_approvals: boolean;
        email_decisions: boolean;
        email_reminders: boolean;
        in_app_notifications: boolean;
    }> {
        // TODO: Implement user notification preferences
        // For now, return default preferences
        return {
            email_approvals: true,
            email_decisions: true,
            email_reminders: true,
            in_app_notifications: true
        };
    }

    /**
     * Private helper methods
     */
    private async sendEmailNotifications(
        userIds: string[],
        template: NotificationTemplate
    ): Promise<void> {
        try {
            // Get user email addresses
            const { data: users, error } = await supabase
                .from('users')
                .select('id, email, display_name')
                .in('id', userIds)
                .not('email', 'is', null);

            if (error) throw error;

            if (!users || users.length === 0) {
                console.log('No users with email addresses found');
                return;
            }

            // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
            // For now, just log the email notifications
            console.log('Email notifications to send:', {
                recipients: users.map(u => ({ id: u.id, email: u.email, name: u.display_name })),
                subject: template.subject,
                message: template.message,
                template: template.emailTemplate
            });

            // Example integration with email service:
            /*
            for (const user of users) {
              await emailService.send({
                to: user.email,
                subject: template.subject,
                template: template.emailTemplate,
                data: {
                  user_name: user.display_name,
                  message: template.message,
                  action_url: `${process.env.VITE_APP_URL}/dashboard`
                }
              });
            }
            */

        } catch (error) {
            console.error('Error sending email notifications:', error);
            // Don't throw here to avoid breaking the main flow
        }
    }

    /**
     * Create in-app notification
     */
    private async createInAppNotification(notification: NotificationInsert): Promise<void> {
        try {
            // TODO: Insert into notifications table when it exists
            console.log('In-app notification:', notification);

            /*
            const { error } = await supabase
              .from('notifications')
              .insert(notification);
      
            if (error) throw error;
            */
        } catch (error) {
            console.error('Error creating in-app notification:', error);
        }
    }
}

export const notificationService = new NotificationService();