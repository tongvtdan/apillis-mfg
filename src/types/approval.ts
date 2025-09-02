// Types for the new centralized approval system
// This replaces the makeshift use of reviews table for approvals

import { User } from '@/types/auth';

export type ApprovalType =
    | 'stage_transition'           // Workflow stage transitions
    | 'document_approval'           // Document approvals (RFQ, drawings, etc.)
    | 'engineering_change'          // Engineering change requests
    | 'supplier_qualification'      // Supplier qualification approvals
    | 'purchase_order'             // Purchase order approvals
    | 'cost_approval'               // Cost/budget approvals
    | 'quality_review'              // Quality control approvals
    | 'production_release'          // Production release approvals
    | 'shipping_approval'           // Shipping and delivery approvals
    | 'contract_approval'           // Contract and legal approvals
    | 'budget_approval'             // Budget and financial approvals
    | 'safety_review'               // Safety and compliance approvals
    | 'custom';                     // Custom approval types

export type ApprovalStatus =
    | 'pending'                     // Waiting for approval
    | 'in_review'                   // Under review
    | 'approved'                    // Approved
    | 'rejected'                    // Rejected
    | 'delegated'                   // Delegated to another user
    | 'expired'                     // Approval request expired
    | 'cancelled'                   // Cancelled by requester
    | 'auto_approved'               // Automatically approved based on rules
    | 'escalated';                  // Escalated to higher authority

export type ApprovalPriority =
    | 'low'                         // Low priority (7+ days)
    | 'normal'                      // Normal priority (3-7 days)
    | 'high'                        // High priority (1-3 days)
    | 'urgent'                      // Urgent (same day)
    | 'critical';                   // Critical (immediate)

export interface Approval {
    // Core fields
    id: string;
    organization_id: string;

    // Approval identification
    approval_type: ApprovalType;
    title: string;
    description?: string;
    reference_id?: string;

    // Entity being approved
    entity_type: string; // 'project', 'document', 'supplier', 'purchase_order', etc.
    entity_id: string;

    // Approval workflow
    approval_chain_id?: string;
    step_number: number;
    total_steps: number;

    // Requester information
    requested_by: string;
    requested_at: string;
    request_reason?: string;
    request_metadata?: Record<string, any>;

    // Current approver
    current_approver_id?: string;
    current_approver_role?: string;
    current_approver_department?: string;

    // Approval status and timing
    status: ApprovalStatus;
    priority: ApprovalPriority;
    due_date?: string;
    expires_at?: string;

    // Decision information
    decision_comments?: string;
    decision_reason?: string;
    decision_metadata?: Record<string, any>;
    decided_at?: string;
    decided_by?: string;

    // Escalation and delegation
    escalated_from?: string;
    escalated_to?: string;
    escalated_at?: string;
    escalation_reason?: string;

    // Delegation information
    delegated_from?: string;
    delegated_to?: string;
    delegated_at?: string;
    delegation_reason?: string;
    delegation_end_date?: string;

    // Auto-approval and rules
    auto_approval_rules?: Record<string, any>;
    auto_approved_at?: string;
    auto_approval_reason?: string;

    // Audit and tracking
    created_at: string;
    updated_at: string;
    created_by?: string;

    // Computed/joined fields
    requester?: User;
    current_approver?: User;
    decided_by_user?: User;
    entity?: any; // The actual entity being approved
}

export interface ApprovalHistory {
    id: string;
    approval_id: string;
    organization_id: string;

    // Action details
    action_type: string; // 'created', 'assigned', 'reviewed', 'approved', 'rejected', 'delegated', 'escalated', 'expired'
    action_by: string;
    action_at: string;

    // Action data
    old_status?: ApprovalStatus;
    new_status?: ApprovalStatus;
    comments?: string;
    metadata?: Record<string, any>;

    // Created timestamp
    created_at: string;

    // Computed/joined fields
    action_by_user?: User;
}

export interface ApprovalAttachment {
    id: string;
    approval_id: string;
    organization_id: string;

    // File information
    file_name: string;
    original_file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    mime_type?: string;

    // Attachment metadata
    attachment_type: string; // 'supporting_document', 'evidence', 'reference', 'decision_document'
    description?: string;
    uploaded_by: string;
    uploaded_at: string;

    // Created timestamp
    created_at: string;

    // Computed/joined fields
    uploaded_by_user?: User;
}

export interface ApprovalNotification {
    id: string;
    approval_id: string;
    organization_id: string;

    // Notification details
    notification_type: string; // 'request', 'reminder', 'decision', 'escalation', 'delegation'
    recipient_id: string;
    recipient_type: string; // 'approver', 'requester', 'stakeholder'

    // Notification content
    subject: string;
    message: string;
    notification_data?: Record<string, any>;

    // Delivery status
    sent_at: string;
    delivered_at?: string;
    read_at?: string;
    delivery_status: 'sent' | 'delivered' | 'read' | 'failed';

    // Delivery method
    delivery_method: 'in_app' | 'email' | 'sms' | 'push';

    // Created timestamp
    created_at: string;

    // Computed/joined fields
    recipient?: User;
}

export interface ApprovalDelegation {
    id: string;
    delegator_id: string;
    delegate_id: string;
    start_date: string;
    end_date: string;
    reason: string;
    include_new_approvals: boolean;
    status: 'active' | 'inactive' | 'expired';
    organization_id: string;
    created_at: string;
    updated_at: string;

    // Computed/joined fields
    delegator?: User;
    delegate?: User;
}

export interface ApprovalDelegationMapping {
    id: string;
    delegation_id: string;
    approval_id: string;
    created_at: string;
}

export interface ApprovalCreateData {
    approval_type: ApprovalType;
    title: string;
    description?: string;
    reference_id?: string;
    entity_type: string;
    entity_id: string;
    approval_chain_id?: string;
    step_number?: number;
    total_steps?: number;
    current_approver_id: string;
    current_approver_role?: string;
    current_approver_department?: string;
    priority?: ApprovalPriority;
    due_date?: string;
    request_reason?: string;
    request_metadata?: Record<string, any>;
}

export interface ApprovalUpdateData {
    title?: string;
    description?: string;
    current_approver_id?: string;
    current_approver_role?: string;
    current_approver_department?: string;
    status?: ApprovalStatus;
    priority?: ApprovalPriority;
    due_date?: string;
    decision_comments?: string;
    decision_reason?: string;
    decision_metadata?: Record<string, any>;
    escalated_to?: string;
    escalation_reason?: string;
    delegated_to?: string;
    delegation_reason?: string;
    delegation_end_date?: string;
}

export interface ApprovalDecisionData {
    decision: 'approved' | 'rejected';
    comments?: string;
    reason?: string;
    metadata?: Record<string, any>;
}

export interface ApprovalFilter {
    approval_type?: ApprovalType;
    status?: ApprovalStatus;
    priority?: ApprovalPriority;
    entity_type?: string;
    entity_id?: string;
    requested_by?: string;
    current_approver_id?: string;
    due_date_from?: string;
    due_date_to?: string;
    created_at_from?: string;
    created_at_to?: string;
    overdue_only?: boolean;
}

export interface ApprovalStats {
    total: number;
    pending: number;
    in_review: number;
    approved: number;
    rejected: number;
    delegated: number;
    expired: number;
    cancelled: number;
    auto_approved: number;
    escalated: number;
    overdue: number;
    by_type: Record<ApprovalType, number>;
    by_priority: Record<ApprovalPriority, number>;
}

// Legacy interfaces for backward compatibility during migration
export interface LegacyApprovalRequest {
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

export interface LegacyApprovalHistory {
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