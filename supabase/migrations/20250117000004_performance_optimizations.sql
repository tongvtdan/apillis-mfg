-- =========================================
-- Factory Pulse Database Schema - Performance Optimizations
-- Migration: Additional Indexes, Views, and Materialized Views
-- =========================================

-- =========================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =========================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON projects(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_org_customer ON projects(organization_id, customer_organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_priority_due ON projects(priority_level, estimated_delivery_date);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_status ON projects(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_projects_created_org ON projects(created_at DESC, organization_id);

-- Progress tracking composite indexes
CREATE INDEX IF NOT EXISTS idx_pssp_project_status ON project_sub_stage_progress(project_id, status);
CREATE INDEX IF NOT EXISTS idx_pssp_assigned_status ON project_sub_stage_progress(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_pssp_due_status ON project_sub_stage_progress(due_at, status) WHERE due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pssp_stage_status ON project_sub_stage_progress(workflow_stage_id, status);

-- Approval system indexes
CREATE INDEX IF NOT EXISTS idx_approvals_org_status ON approvals(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_approvals_type_status ON approvals(approval_type, status);
CREATE INDEX IF NOT EXISTS idx_approvals_priority_status ON approvals(priority, status);
CREATE INDEX IF NOT EXISTS idx_approvals_sla_due ON approvals(sla_due_at) WHERE sla_due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_approvals_requested_at ON approvals(requested_at DESC);

-- Document system indexes
CREATE INDEX IF NOT EXISTS idx_documents_org_project ON documents(organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_documents_category_version ON documents(category, is_current_version);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_current ON document_versions(document_id, is_current);

-- Activity log indexes for reporting
CREATE INDEX IF NOT EXISTS idx_activity_log_org_created ON activity_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_project_created ON activity_log(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_created ON activity_log(entity_type, entity_id, created_at DESC);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_project_created ON messages(project_id, created_at DESC);

-- =========================================
-- MATERIALIZED VIEWS FOR DASHBOARD PERFORMANCE
-- =========================================

-- Project dashboard summary (refreshed every 5 minutes)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_dashboard_summary AS
SELECT
    p.organization_id,
    p.status,
    p.priority_level,
    p.current_stage_id,
    ws.name as current_stage_name,
    COUNT(*) as project_count,
    COUNT(CASE WHEN p.actual_delivery_date IS NOT NULL THEN 1 END) as completed_count,
    AVG(EXTRACT(EPOCH FROM (p.actual_delivery_date - p.estimated_delivery_date))/86400) as avg_delivery_variance_days,
    MIN(p.created_at) as oldest_project_date,
    MAX(p.created_at) as newest_project_date,
    SUM(p.estimated_value) as total_estimated_value,
    SUM(p.actual_value) as total_actual_value
FROM projects p
LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
GROUP BY p.organization_id, p.status, p.priority_level, p.current_stage_id, ws.name;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_project_dashboard_org_status
ON mv_project_dashboard_summary(organization_id, status, priority_level, current_stage_id);

-- Workflow efficiency metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_workflow_efficiency AS
SELECT
    p.organization_id,
    ws.name as stage_name,
    wss.name as sub_stage_name,
    COUNT(pssp.id) as total_instances,
    COUNT(CASE WHEN pssp.status = 'completed' THEN 1 END) as completed_count,
    AVG(EXTRACT(EPOCH FROM (pssp.completed_at - pssp.started_at))/3600) as avg_completion_hours,
    AVG(EXTRACT(EPOCH FROM (pssp.due_at - pssp.completed_at))/3600) as avg_overdue_hours,
    MIN(pssp.started_at) as first_started,
    MAX(pssp.completed_at) as last_completed
FROM project_sub_stage_progress pssp
JOIN workflow_stages ws ON pssp.workflow_stage_id = ws.id
JOIN workflow_sub_stages wss ON pssp.sub_stage_id = wss.id
JOIN projects p ON pssp.project_id = p.id
GROUP BY p.organization_id, ws.name, wss.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_workflow_efficiency_org_stage_substage
ON mv_workflow_efficiency(organization_id, stage_name, sub_stage_name);

-- Approval performance metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_approval_performance AS
SELECT
    a.organization_id,
    a.approval_type,
    a.status,
    a.priority,
    COUNT(*) as approval_count,
    AVG(EXTRACT(EPOCH FROM (a.decided_at - a.requested_at))/3600) as avg_decision_hours,
    AVG(EXTRACT(EPOCH FROM (a.sla_due_at - a.decided_at))/3600) as avg_overdue_hours,
    COUNT(CASE WHEN a.sla_due_at < a.decided_at THEN 1 END) as overdue_count,
    MIN(a.requested_at) as oldest_request,
    MAX(a.decided_at) as newest_decision
FROM approvals a
WHERE a.status IN ('approved', 'rejected')
GROUP BY a.organization_id, a.approval_type, a.status, a.priority;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_approval_performance_org_type_status_priority
ON mv_approval_performance(organization_id, approval_type, status, priority);

-- User workload summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_workload AS
SELECT
    u.id as user_id,
    u.organization_id,
    u.name as user_name,
    u.role,

    -- Project assignments
    COUNT(DISTINCT p.id) as assigned_projects,

    -- Sub-stage assignments
    COUNT(DISTINCT pssp.id) as assigned_sub_stages,
    COUNT(DISTINCT CASE WHEN pssp.status = 'in_progress' THEN pssp.id END) as active_sub_stages,
    COUNT(DISTINCT CASE WHEN pssp.status = 'completed' THEN pssp.id END) as completed_sub_stages,

    -- Approvals
    COUNT(DISTINCT CASE WHEN a.current_approver_id = u.id AND a.status = 'pending' THEN a.id END) as pending_approvals,
    COUNT(DISTINCT CASE WHEN a.requested_by = u.id THEN a.id END) as requested_approvals,

    -- Recent activity
    MAX(GREATEST(
        COALESCE(p.updated_at, '1970-01-01'::timestamptz),
        COALESCE(pssp.updated_at, '1970-01-01'::timestamptz),
        COALESCE(a.updated_at, '1970-01-01'::timestamptz)
    )) as last_activity

FROM users u
LEFT JOIN projects p ON p.assigned_to = u.id
LEFT JOIN project_sub_stage_progress pssp ON pssp.assigned_to = u.id
LEFT JOIN approvals a ON (a.current_approver_id = u.id OR a.requested_by = u.id)
WHERE u.status = 'active'
GROUP BY u.id, u.organization_id, u.name, u.role;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_workload_user
ON mv_user_workload(user_id);

-- =========================================
-- OPTIMIZED VIEWS FOR COMMON QUERIES
-- =========================================

-- Project with full context (optimized for detail views)
CREATE OR REPLACE VIEW v_project_detail AS
SELECT
    p.*,

    -- Customer organization info
    cust_org.name as customer_name,
    cust_org.slug as customer_slug,
    cust_org.organization_type as customer_type,
    cust_org.industry as customer_industry,

    -- Primary contact info
    CASE
        WHEN array_length(p.point_of_contacts, 1) > 0
        THEN (SELECT contact_name FROM contacts WHERE id = p.point_of_contacts[1])
        ELSE NULL
    END as primary_contact_name,
    CASE
        WHEN array_length(p.point_of_contacts, 1) > 0
        THEN (SELECT email FROM contacts WHERE id = p.point_of_contacts[1])
        ELSE NULL
    END as primary_contact_email,

    -- Current stage info
    ws.name as current_stage_name,
    ws.color as current_stage_color,
    ws.stage_order as current_stage_order,

    -- Assignee info
    assignee.name as assignee_name,
    assignee.email as assignee_email,
    assignee.role as assignee_role,

    -- Creator info
    creator.name as creator_name,
    creator.email as creator_email,

    -- Workflow progress summary
    COALESCE(progress_summary.total_sub_stages, 0) as total_sub_stages,
    COALESCE(progress_summary.completed_sub_stages, 0) as completed_sub_stages,
    COALESCE(progress_summary.in_progress_sub_stages, 0) as in_progress_sub_stages,
    COALESCE(progress_summary.blocked_sub_stages, 0) as blocked_sub_stages,

    -- Days in current stage
    EXTRACT(EPOCH FROM (NOW() - p.stage_entered_at))/86400 as days_in_current_stage,

    -- Next milestone calculation
    CASE
        WHEN p.estimated_delivery_date IS NOT NULL
        THEN EXTRACT(EPOCH FROM (p.estimated_delivery_date - NOW()))/86400
        ELSE NULL
    END as days_until_due

FROM projects p
LEFT JOIN organizations cust_org ON p.customer_organization_id = cust_org.id
LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
LEFT JOIN users assignee ON p.assigned_to = assignee.id
LEFT JOIN users creator ON p.created_by = creator.id
LEFT JOIN (
    SELECT
        project_id,
        COUNT(*) as total_sub_stages,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sub_stages,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_sub_stages,
        COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked_sub_stages
    FROM project_sub_stage_progress
    GROUP BY project_id
) progress_summary ON p.id = progress_summary.project_id;

-- Current stage progress view (optimized for kanban/dashboard)
CREATE OR REPLACE VIEW v_current_stage_progress AS
SELECT
    p.id as project_id,
    p.project_id as project_code,
    p.title as project_title,
    p.priority_level,
    p.status as project_status,
    p.stage_entered_at,

    ws.id as stage_id,
    ws.name as stage_name,
    ws.stage_order,
    ws.color as stage_color,

    wss.id as sub_stage_id,
    wss.name as sub_stage_name,
    COALESCE(wdss.sub_stage_order_override, wss.sub_stage_order) as sub_stage_order,
    wss.estimated_duration_hours,
    wss.responsible_roles,
    wss.requires_approval,

    pssp.status as progress_status,
    pssp.assigned_to,
    pssp.started_at,
    pssp.due_at,
    pssp.completed_at,
    pssp.blocked_reason,

    assignee.name as assigned_user_name,
    assignee.role as assigned_user_role,

    -- Calculated fields
    CASE
        WHEN pssp.due_at IS NOT NULL AND pssp.status NOT IN ('completed', 'skipped')
        THEN EXTRACT(EPOCH FROM (pssp.due_at - NOW()))/3600
        ELSE NULL
    END as hours_until_due,

    CASE
        WHEN pssp.started_at IS NOT NULL AND pssp.completed_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (pssp.completed_at - pssp.started_at))/3600
        ELSE NULL
    END as actual_hours_taken,

    -- Priority score for sorting
    CASE p.priority_level
        WHEN 'urgent' THEN 4
        WHEN 'high' THEN 3
        WHEN 'normal' THEN 2
        WHEN 'low' THEN 1
        ELSE 0
    END as priority_score

FROM projects p
JOIN workflow_definitions wd ON p.workflow_definition_id = wd.id
JOIN workflow_definition_stages wds ON wd.id = wds.workflow_definition_id
JOIN workflow_stages ws ON wds.workflow_stage_id = ws.id AND wds.is_included = true
JOIN workflow_definition_sub_stages wdss ON wd.id = wdss.workflow_definition_id
JOIN workflow_sub_stages wss ON wdss.workflow_sub_stage_id = wss.id AND wdss.is_included = true
LEFT JOIN project_sub_stage_progress pssp ON p.id = pssp.project_id AND wss.id = pssp.sub_stage_id
LEFT JOIN users assignee ON pssp.assigned_to = assignee.id
WHERE ws.id = p.current_stage_id
ORDER BY
    priority_score DESC,
    COALESCE(wdss.sub_stage_order_override, wss.sub_stage_order);

-- Approval queue with context (optimized for approval dashboards)
CREATE OR REPLACE VIEW v_approval_queue AS
SELECT
    a.*,

    -- Requester info
    requester.name as requester_name,
    requester.email as requester_email,
    requester.role as requester_role,

    -- Current approver info
    approver.name as current_approver_name,
    approver.email as current_approver_email,
    approver.role as current_approver_role,

    -- Entity context (dynamic based on entity_type)
    CASE
        WHEN a.entity_type = 'project' THEN
            (SELECT title FROM projects WHERE id = a.entity_id::uuid)
        WHEN a.entity_type = 'document' THEN
            (SELECT title FROM documents WHERE id = a.entity_id::uuid)
        ELSE a.entity_type || ':' || a.entity_id
    END as entity_title,

    CASE
        WHEN a.entity_type = 'project' THEN
            (SELECT project_id FROM projects WHERE id = a.entity_id::uuid)
        ELSE NULL
    END as project_code,

    -- Time calculations
    EXTRACT(EPOCH FROM (NOW() - a.requested_at))/3600 as hours_since_request,
    CASE
        WHEN a.sla_due_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (a.sla_due_at - NOW()))/3600
        ELSE NULL
    END as hours_until_sla_due,

    -- Status indicators
    CASE
        WHEN a.sla_due_at IS NOT NULL AND a.sla_due_at < NOW() AND a.status IN ('pending', 'in_review')
        THEN true
        ELSE false
    END as is_overdue,

    CASE
        WHEN a.status = 'pending' AND a.current_approver_id IS NULL
        THEN true
        ELSE false
    END as needs_assignment

FROM approvals a
LEFT JOIN users requester ON a.requested_by = requester.id
LEFT JOIN users approver ON a.current_approver_id = approver.id
ORDER BY
    CASE
        WHEN a.sla_due_at IS NOT NULL AND a.sla_due_at < NOW() THEN 1
        ELSE 0
    END DESC, -- Overdue first
    CASE a.priority
        WHEN 'critical' THEN 4
        WHEN 'urgent' THEN 3
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 1
        WHEN 'low' THEN 0
    END DESC,
    a.requested_at ASC;

-- =========================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- =========================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_dashboard_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_workflow_efficiency;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_approval_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_workload;

    -- Log the refresh
    INSERT INTO activity_log (
        organization_id,
        user_id,
        entity_type,
        entity_id,
        action,
        description,
        metadata
    ) VALUES (
        NULL,
        NULL,
        'system',
        gen_random_uuid(),
        'refresh_materialized_views',
        'Refreshed all dashboard materialized views',
        jsonb_build_object(
            'refreshed_at', NOW(),
            'views_refreshed', ARRAY[
                'mv_project_dashboard_summary',
                'mv_workflow_efficiency',
                'mv_approval_performance',
                'mv_user_workload'
            ]
        )
    );
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- =========================================

-- Partial indexes for active entities only
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(organization_id, status, created_at DESC)
WHERE status NOT IN ('cancelled', 'completed');

CREATE INDEX IF NOT EXISTS idx_pssp_active ON project_sub_stage_progress(project_id, status, created_at DESC)
WHERE status NOT IN ('completed', 'skipped');

CREATE INDEX IF NOT EXISTS idx_approvals_active ON approvals(organization_id, status, requested_at DESC)
WHERE status IN ('pending', 'in_review');

CREATE INDEX IF NOT EXISTS idx_notifications_unread_user ON notifications(user_id, created_at DESC)
WHERE is_read = false;

-- =========================================
-- FULL-TEXT SEARCH INDEXES
-- =========================================

-- Full-text search on projects
CREATE INDEX IF NOT EXISTS idx_projects_fts ON projects
USING gin(to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    array_to_string(tags, ' ')
));

-- Full-text search on documents
CREATE INDEX IF NOT EXISTS idx_documents_fts ON documents
USING gin(to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '')
));

-- Full-text search on organizations/contacts
CREATE INDEX IF NOT EXISTS idx_contacts_fts ON contacts
USING gin(to_tsvector('english',
    coalesce(company_name, '') || ' ' ||
    coalesce(contact_name, '') || ' ' ||
    coalesce(email, '') || ' ' ||
    coalesce(notes, '')
));

-- =========================================
-- QUERY OPTIMIZATION FUNCTIONS
-- =========================================

-- Function to get project progress summary efficiently
CREATE OR REPLACE FUNCTION get_project_progress_summary(p_project_id UUID)
RETURNS TABLE (
    total_sub_stages BIGINT,
    completed_sub_stages BIGINT,
    in_progress_sub_stages BIGINT,
    blocked_sub_stages BIGINT,
    overdue_sub_stages BIGINT,
    next_due_date TIMESTAMPTZ,
    estimated_completion_date DATE
) AS $$
BEGIN
    RETURN QUERY
    WITH progress_stats AS (
        SELECT
            COUNT(*) as total_count,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
            COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked_count,
            COUNT(CASE WHEN due_at < NOW() AND status NOT IN ('completed', 'skipped') THEN 1 END) as overdue_count,
            MIN(CASE WHEN status NOT IN ('completed', 'skipped') THEN due_at END) as next_due
        FROM project_sub_stage_progress
        WHERE project_id = p_project_id
    ),
    stage_estimates AS (
        SELECT
            AVG(estimated_duration_hours) as avg_duration_per_substage,
            COUNT(*) as remaining_substages
        FROM project_sub_stage_progress pssp
        JOIN workflow_sub_stages wss ON pssp.sub_stage_id = wss.id
        WHERE pssp.project_id = p_project_id
        AND pssp.status NOT IN ('completed', 'skipped')
        AND wss.estimated_duration_hours IS NOT NULL
    )
    SELECT
        ps.total_count,
        ps.completed_count,
        ps.in_progress_count,
        ps.blocked_count,
        ps.overdue_count,
        ps.next_due,
        CASE
            WHEN se.avg_duration_per_substage > 0 AND se.remaining_substages > 0
            THEN CURRENT_DATE + INTERVAL '1 hour' * (se.avg_duration_per_substage * se.remaining_substages)
            ELSE NULL
        END::DATE
    FROM progress_stats ps
    CROSS JOIN stage_estimates se;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard KPIs efficiently
CREATE OR REPLACE FUNCTION get_dashboard_kpis(p_org_id UUID, p_days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    active_projects BIGINT,
    completed_projects BIGINT,
    overdue_projects BIGINT,
    avg_project_completion_days NUMERIC,
    total_approvals BIGINT,
    pending_approvals BIGINT,
    overdue_approvals BIGINT,
    avg_approval_time_hours NUMERIC
) AS $$
DECLARE
    start_date TIMESTAMPTZ := NOW() - INTERVAL '1 day' * p_days_back;
BEGIN
    RETURN QUERY
    WITH project_stats AS (
        SELECT
            COUNT(CASE WHEN status NOT IN ('completed', 'cancelled') THEN 1 END) as active_count,
            COUNT(CASE WHEN status = 'completed' AND updated_at >= start_date THEN 1 END) as completed_count,
            COUNT(CASE WHEN estimated_delivery_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_count,
            AVG(EXTRACT(EPOCH FROM (actual_delivery_date - created_at))/86400) as avg_completion_days
        FROM projects
        WHERE organization_id = p_org_id
        AND created_at >= start_date
    ),
    approval_stats AS (
        SELECT
            COUNT(*) as total_count,
            COUNT(CASE WHEN status IN ('pending', 'in_review') THEN 1 END) as pending_count,
            COUNT(CASE WHEN sla_due_at < NOW() AND status IN ('pending', 'in_review') THEN 1 END) as overdue_count,
            AVG(EXTRACT(EPOCH FROM (decided_at - requested_at))/3600) as avg_decision_hours
        FROM approvals
        WHERE organization_id = p_org_id
        AND requested_at >= start_date
        AND status IN ('approved', 'rejected')
    )
    SELECT
        ps.active_count,
        ps.completed_count,
        ps.overdue_count,
        ROUND(ps.avg_completion_days::NUMERIC, 1),
        aps.total_count,
        aps.pending_count,
        aps.overdue_count,
        ROUND(aps.avg_decision_hours::NUMERIC, 1)
    FROM project_stats ps
    CROSS JOIN approval_stats aps;
END;
$$ LANGUAGE plpgsql;
