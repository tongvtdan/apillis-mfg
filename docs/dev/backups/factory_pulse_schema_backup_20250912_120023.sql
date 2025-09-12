

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."approval_action" AS ENUM (
    'request',
    'assign',
    'reassign',
    'approve',
    'reject',
    'comment',
    'escalate',
    'cancel'
);


ALTER TYPE "public"."approval_action" OWNER TO "postgres";


CREATE TYPE "public"."approval_priority" AS ENUM (
    'low',
    'normal',
    'high',
    'urgent',
    'critical'
);


ALTER TYPE "public"."approval_priority" OWNER TO "postgres";


CREATE TYPE "public"."approval_status" AS ENUM (
    'pending',
    'in_review',
    'approved',
    'rejected',
    'cancelled',
    'expired',
    'delegated',
    'auto_approved',
    'escalated'
);


ALTER TYPE "public"."approval_status" OWNER TO "postgres";


CREATE TYPE "public"."approval_type" AS ENUM (
    'technical_review',
    'quote_approval',
    'po_approval',
    'supplier_selection',
    'quality_review',
    'shipment_release',
    'final_signoff',
    'engineering_change',
    'cost_approval',
    'budget_approval',
    'contract_approval',
    'safety_review'
);


ALTER TYPE "public"."approval_type" OWNER TO "postgres";


CREATE TYPE "public"."contact_type" AS ENUM (
    'customer',
    'supplier',
    'internal'
);


ALTER TYPE "public"."contact_type" OWNER TO "postgres";


CREATE TYPE "public"."document_category" AS ENUM (
    'inquiry',
    'rfq',
    'design_spec',
    'drawing',
    'bom',
    'supplier_rfq',
    'supplier_quote',
    'costing',
    'customer_quote',
    'po',
    'contract',
    'work_order',
    'work_instruction',
    'qa_report',
    'test_result',
    'packing_list',
    'shipping_doc',
    'delivery_confirmation',
    'invoice',
    'other'
);


ALTER TYPE "public"."document_category" OWNER TO "postgres";


CREATE TYPE "public"."notification_priority" AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


ALTER TYPE "public"."notification_priority" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'workflow',
    'approval',
    'document',
    'message',
    'system'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."organization_type" AS ENUM (
    'internal',
    'customer',
    'supplier',
    'partner'
);


ALTER TYPE "public"."organization_type" OWNER TO "postgres";


CREATE TYPE "public"."priority_level" AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


ALTER TYPE "public"."priority_level" OWNER TO "postgres";


CREATE TYPE "public"."project_status" AS ENUM (
    'draft',
    'inquiry',
    'reviewing',
    'quoted',
    'confirmed',
    'procurement',
    'production',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."project_status" OWNER TO "postgres";


CREATE TYPE "public"."sub_stage_status" AS ENUM (
    'pending',
    'in_progress',
    'in_review',
    'blocked',
    'skipped',
    'completed'
);


ALTER TYPE "public"."sub_stage_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'management',
    'engineering',
    'qa',
    'procurement',
    'production',
    'sales',
    'finance',
    'logistics',
    'auditor'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE TYPE "public"."user_status" AS ENUM (
    'active',
    'invited',
    'suspended',
    'disabled'
);


ALTER TYPE "public"."user_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_all_inactive_organizations"() RETURNS TABLE("organization_name" "text", "organization_slug" "text", "deleted_table" "text", "deleted_count" bigint, "status" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    org_record RECORD;
    deleted_count BIGINT;
    total_organizations_deleted INTEGER := 0;
    total_records_deleted BIGINT := 0;
BEGIN
    -- Log the start of deletion
    RAISE NOTICE 'Starting deletion of all inactive organizations...';
    
    -- Loop through all inactive organizations
    FOR org_record IN 
        SELECT id, name, slug 
        FROM organizations 
        WHERE is_active = FALSE
        ORDER BY created_at ASC
    LOOP
        RAISE NOTICE 'Processing organization: % (%)', org_record.name, org_record.slug;
        
        -- =========================================
        -- HANDLE SPECIAL CASES FIRST
        -- =========================================
        
        -- Update projects that have this organization as customer_organization_id
        UPDATE projects 
        SET customer_organization_id = NULL, updated_at = NOW()
        WHERE customer_organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'projects (customer refs)'::TEXT, deleted_count, 'Updated'::TEXT;
        
        -- Update users who have direct_manager_id pointing to users in this org
        UPDATE users 
        SET direct_manager_id = NULL, updated_at = NOW()
        WHERE direct_manager_id IN (
            SELECT id FROM users WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'users (manager refs)'::TEXT, deleted_count, 'Updated'::TEXT;
        
        -- Update users who have this org's users in their direct_reports array
        UPDATE users 
        SET direct_reports = array_remove(direct_reports, user_id), updated_at = NOW()
        FROM (
            SELECT id as user_id FROM users WHERE organization_id = org_record.id
        ) org_users
        WHERE user_id = ANY(direct_reports);
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'users (reports refs)'::TEXT, deleted_count, 'Updated'::TEXT;
        
        -- =========================================
        -- DELETE RELATED DATA FOR THIS ORGANIZATION
        -- =========================================
        
        -- Delete review_checklist_items (via reviews)
        DELETE FROM review_checklist_items 
        WHERE review_id IN (
            SELECT id FROM reviews WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'review_checklist_items'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete reviews
        DELETE FROM reviews WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'reviews'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete permission_audit_log
        DELETE FROM permission_audit_log WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'permission_audit_log'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete user_feature_access (via feature_toggles)
        DELETE FROM user_feature_access 
        WHERE feature_toggle_id IN (
            SELECT id FROM feature_toggles WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'user_feature_access'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete feature_toggles
        DELETE FROM feature_toggles WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'feature_toggles'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete user_custom_roles (via custom_roles)
        DELETE FROM user_custom_roles 
        WHERE custom_role_id IN (
            SELECT id FROM custom_roles WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'user_custom_roles'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete role_permissions (via custom_roles)
        DELETE FROM role_permissions 
        WHERE custom_role_id IN (
            SELECT id FROM custom_roles WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'role_permissions'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete custom_roles
        DELETE FROM custom_roles WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'custom_roles'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete user_permissions (via users)
        DELETE FROM user_permissions 
        WHERE user_id IN (
            SELECT id FROM users WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'user_permissions'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete approval_attachments (via approvals)
        DELETE FROM approval_attachments 
        WHERE approval_id IN (
            SELECT id FROM approvals WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'approval_attachments'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete approval_history (via approvals)
        DELETE FROM approval_history 
        WHERE approval_id IN (
            SELECT id FROM approvals WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'approval_history'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete approvals
        DELETE FROM approvals WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'approvals'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete document_access_log (via documents)
        DELETE FROM document_access_log 
        WHERE document_id IN (
            SELECT id FROM documents WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'document_access_log'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete document_versions (via documents)
        DELETE FROM document_versions 
        WHERE document_id IN (
            SELECT id FROM documents WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'document_versions'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete documents
        DELETE FROM documents WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'documents'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete project_sub_stage_progress (via projects)
        DELETE FROM project_sub_stage_progress 
        WHERE project_id IN (
            SELECT id FROM projects WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'project_sub_stage_progress'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete projects
        DELETE FROM projects WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'projects'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete workflow_definition_sub_stages (via workflow_definitions)
        DELETE FROM workflow_definition_sub_stages 
        WHERE workflow_definition_id IN (
            SELECT id FROM workflow_definitions WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'workflow_definition_sub_stages'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete workflow_definition_stages (via workflow_definitions)
        DELETE FROM workflow_definition_stages 
        WHERE workflow_definition_id IN (
            SELECT id FROM workflow_definitions WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'workflow_definition_stages'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete workflow_definitions
        DELETE FROM workflow_definitions WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'workflow_definitions'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete workflow_sub_stages (via workflow_stages)
        DELETE FROM workflow_sub_stages 
        WHERE workflow_stage_id IN (
            SELECT id FROM workflow_stages WHERE organization_id = org_record.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'workflow_sub_stages'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete workflow_stages
        DELETE FROM workflow_stages WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'workflow_stages'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete notifications
        DELETE FROM notifications WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'notifications'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete messages
        DELETE FROM messages WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'messages'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete activity_log
        DELETE FROM activity_log WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'activity_log'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete contacts
        DELETE FROM contacts WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'contacts'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete users
        DELETE FROM users WHERE organization_id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'users'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        -- Delete the organization itself
        DELETE FROM organizations WHERE id = org_record.id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_records_deleted := total_records_deleted + deleted_count;
        RETURN QUERY SELECT org_record.name, org_record.slug, 'organizations'::TEXT, deleted_count, 'Deleted'::TEXT;
        
        total_organizations_deleted := total_organizations_deleted + 1;
        
        RAISE NOTICE 'Successfully deleted organization: % (%)', org_record.name, org_record.slug;
        
    END LOOP;
    
    -- Log completion
    RAISE NOTICE 'Successfully deleted % inactive organizations', total_organizations_deleted;
    RAISE NOTICE 'Total records deleted: %', total_records_deleted;
    
    -- Return summary
    RETURN QUERY SELECT 
        'SUMMARY'::TEXT, 
        'SUMMARY'::TEXT, 
        'SUMMARY'::TEXT, 
        total_records_deleted, 
        FORMAT('Deleted % inactive organizations successfully', total_organizations_deleted)::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and rollback
        RAISE NOTICE 'Error deleting inactive organizations: %', SQLERRM;
        RETURN QUERY SELECT 'ERROR'::TEXT, 'ERROR'::TEXT, 'ERROR'::TEXT, 0::BIGINT, SQLERRM::TEXT;
END;
$$;


ALTER FUNCTION "public"."delete_all_inactive_organizations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dev_get_contacts_by_org"("org_name" "text") RETURNS TABLE("contact_name" "text", "email" "text", "role" "text", "type" "text")
    LANGUAGE "sql"
    AS $$
    SELECT 
        c.contact_name,
        c.email,
        c.role,
        c.type
    FROM contacts c
    JOIN organizations o ON c.organization_id = o.id
    WHERE o.name = org_name
    ORDER BY c.contact_name;
$$;


ALTER FUNCTION "public"."dev_get_contacts_by_org"("org_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dev_get_project_summary"() RETURNS TABLE("project_id" "text", "title" "text", "status" "text", "customer_name" "text", "assignee_name" "text", "current_stage" "text")
    LANGUAGE "sql"
    AS $$
    SELECT 
        p.project_id,
        p.title,
        p.status::text,
        o.name as customer_name,
        u.name as assignee_name,
        ws.name as current_stage
    FROM projects p
    LEFT JOIN organizations o ON p.customer_organization_id = o.id
    LEFT JOIN users u ON p.assigned_to = u.id
    LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
    ORDER BY p.created_at DESC;
$$;


ALTER FUNCTION "public"."dev_get_project_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dev_get_user_tasks"("user_email" "text") RETURNS TABLE("project_title" "text", "stage_name" "text", "sub_stage_name" "text", "progress_status" "text", "due_date" "date")
    LANGUAGE "sql"
    AS $$
    SELECT 
        p.title as project_title,
        ws.name as stage_name,
        wss.name as sub_stage_name,
        pssp.status::text as progress_status,
        pssp.due_at::date as due_date
    FROM project_sub_stage_progress pssp
    JOIN projects p ON pssp.project_id = p.id
    JOIN workflow_stages ws ON pssp.workflow_stage_id = ws.id
    JOIN workflow_sub_stages wss ON pssp.sub_stage_id = wss.id
    JOIN users u ON pssp.assigned_to = u.id
    WHERE u.email = user_email
    ORDER BY pssp.due_at ASC;
$$;


ALTER FUNCTION "public"."dev_get_user_tasks"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_project_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    current_year TEXT;
    sequence_number INTEGER;
    project_id TEXT;
BEGIN
    -- Get current year in YYMM format
    current_year := TO_CHAR(NOW(), 'YYMM');

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(project_id FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM projects
    WHERE project_id LIKE 'P-' || current_year || '%';

    -- Format as P-YYMMXXX (e.g., P-2501001)
    project_id := 'P-' || current_year || LPAD(sequence_number::TEXT, 3, '0');

    RETURN project_id;
END;
$_$;


ALTER FUNCTION "public"."generate_project_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_combined_user_data"("p_user_id" "uuid") RETURNS TABLE("user_id" "uuid", "email" "text", "name" "text", "role" "public"."user_role", "status" "public"."user_status", "organization_id" "uuid", "organization_name" "text", "organization_slug" "text", "department" "text", "preferences" "jsonb", "last_login_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.status,
        u.organization_id,
        o.name,
        o.slug,
        u.department,
        u.preferences,
        u.last_login_at,
        u.created_at,
        u.updated_at
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."get_combined_user_data"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_org_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT organization_id
        FROM users
        WHERE id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."get_current_user_org_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_kpis"("p_org_id" "uuid", "p_days_back" integer DEFAULT 30) RETURNS TABLE("active_projects" bigint, "completed_projects" bigint, "overdue_projects" bigint, "avg_project_completion_days" numeric, "total_approvals" bigint, "pending_approvals" bigint, "overdue_approvals" bigint, "avg_approval_time_hours" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    start_date TIMESTAMPTZ := NOW() - INTERVAL '1 day' * p_days_back;
BEGIN
    RETURN QUERY
    WITH project_stats AS (
        SELECT
            COUNT(CASE WHEN status NOT IN ('completed', 'cancelled') THEN 1 END) as active_count,
            COUNT(CASE WHEN status = 'completed' AND updated_at >= start_date THEN 1 END) as completed_count,
            COUNT(CASE WHEN estimated_delivery_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_count,
            AVG(CASE WHEN actual_delivery_date IS NOT NULL AND created_at IS NOT NULL THEN EXTRACT(EPOCH FROM (actual_delivery_date - created_at)) / 86400 ELSE NULL END)::numeric as avg_completion_days
        FROM projects
        WHERE organization_id = p_org_id
        AND created_at >= start_date
    ),
    approval_stats AS (
        SELECT
            COUNT(*) as total_count,
            COUNT(CASE WHEN status IN ('pending', 'in_review') THEN 1 END) as pending_count,
            COUNT(CASE WHEN sla_due_at < NOW() AND status IN ('pending', 'in_review') THEN 1 END) as overdue_count,
            AVG(CASE WHEN decided_at IS NOT NULL AND requested_at IS NOT NULL THEN EXTRACT(EPOCH FROM (decided_at - requested_at)) / 3600 ELSE NULL END)::numeric as avg_decision_hours
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
$$;


ALTER FUNCTION "public"."get_dashboard_kpis"("p_org_id" "uuid", "p_days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_summary"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
    user_org_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user and organization
    current_user_id := auth.uid();
    
    -- Get user's organization from users table
    SELECT organization_id INTO user_org_id
    FROM users
    WHERE id = current_user_id;
    
    -- If no organization found, return empty result
    IF user_org_id IS NULL THEN
        RETURN json_build_object(
            'projects', json_build_object(
                'total', 0,
                'by_status', '{}',
                'by_type', '{}',
                'by_priority', '{}',
                'by_stage', '{}'
            ),
            'recent_projects', '[]',
            'generated_at', extract(epoch from now()),
            'debug', json_build_object(
                'user_id', current_user_id,
                'organization_id', user_org_id,
                'error', 'No organization found for user'
            )
        );
    END IF;

    -- Build the dashboard summary
    WITH project_stats AS (
        SELECT
            COUNT(*) as total_projects,
            COUNT(CASE WHEN status = 'inquiry' THEN 1 END) as inquiry_count,
            COUNT(CASE WHEN status = 'reviewing' THEN 1 END) as reviewing_count,
            COUNT(CASE WHEN status = 'quoted' THEN 1 END) as quoted_count,
            COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
            COUNT(CASE WHEN status = 'procurement' THEN 1 END) as procurement_count,
            COUNT(CASE WHEN status = 'production' THEN 1 END) as production_count,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
            COUNT(CASE WHEN priority_level = 'low' THEN 1 END) as low_priority_count,
            COUNT(CASE WHEN priority_level = 'normal' THEN 1 END) as normal_priority_count,
            COUNT(CASE WHEN priority_level = 'high' THEN 1 END) as high_priority_count,
            COUNT(CASE WHEN priority_level = 'urgent' THEN 1 END) as urgent_priority_count,
            COUNT(CASE WHEN project_type = 'system_build' THEN 1 END) as system_build_count,
            COUNT(CASE WHEN project_type = 'fabrication' THEN 1 END) as fabrication_count,
            COUNT(CASE WHEN project_type = 'manufacturing' THEN 1 END) as manufacturing_count
        FROM projects
        WHERE organization_id = user_org_id
    ),
    stage_stats AS (
        SELECT
            ws.name as stage_name,
            COUNT(p.id) as stage_count
        FROM projects p
        LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
        WHERE p.organization_id = user_org_id
        GROUP BY ws.name
    ),
    recent_projects AS (
        SELECT
            p.id,
            p.organization_id,
            p.project_id,
            p.title,
            p.status,
            p.priority_level,
            p.project_type,
            p.created_at,
            p.estimated_delivery_date,
            CASE 
                WHEN p.stage_entered_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (NOW() - p.stage_entered_at)) / 86400 
                ELSE NULL 
            END as days_in_stage,
            ws.name as current_stage_name,
            cust_org.name as customer_name
        FROM projects p
        LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
        LEFT JOIN organizations cust_org ON p.customer_organization_id = cust_org.id
        WHERE p.organization_id = user_org_id
        ORDER BY p.created_at DESC
        LIMIT 10
    )
    SELECT json_build_object(
        'projects', json_build_object(
            'total', ps.total_projects,
            'by_status', json_build_object(
                'inquiry', ps.inquiry_count,
                'reviewing', ps.reviewing_count,
                'quoted', ps.quoted_count,
                'confirmed', ps.confirmed_count,
                'procurement', ps.procurement_count,
                'production', ps.production_count,
                'completed', ps.completed_count,
                'cancelled', ps.cancelled_count
            ),
            'by_type', json_build_object(
                'system_build', ps.system_build_count,
                'fabrication', ps.fabrication_count,
                'manufacturing', ps.manufacturing_count
            ),
            'by_priority', json_build_object(
                'low', ps.low_priority_count,
                'normal', ps.normal_priority_count,
                'high', ps.high_priority_count,
                'urgent', ps.urgent_priority_count
            ),
            'by_stage', (
                SELECT json_object_agg(
                    COALESCE(stage_name, 'no_stage'), 
                    stage_count
                )
                FROM stage_stats
            )
        ),
        'recent_projects', (
            SELECT json_agg(
                json_build_object(
                    'id', rp.id,
                    'organization_id', rp.organization_id,
                    'project_id', rp.project_id,
                    'title', rp.title,
                    'status', rp.status,
                    'priority_level', rp.priority_level,
                    'project_type', rp.project_type,
                    'created_at', rp.created_at,
                    'customer_name', rp.customer_name,
                    'estimated_delivery_date', rp.estimated_delivery_date,
                    'days_in_stage', rp.days_in_stage,
                    'current_stage', rp.current_stage_name
                )
            )
            FROM recent_projects rp
        ),
        'generated_at', extract(epoch from now()),
        'debug', json_build_object(
            'user_id', current_user_id,
            'organization_id', user_org_id,
            'query_timestamp', now()
        )
    ) INTO result
    FROM project_stats ps;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_dashboard_summary"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_dashboard_summary"() IS 'Returns dashboard summary data including project statistics and recent projects for the current user organization';



CREATE OR REPLACE FUNCTION "public"."get_dashboard_summary_test"("org_id" "uuid") RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result JSON;
BEGIN
    -- Build the dashboard summary for the specified organization
    WITH project_stats AS (
        SELECT
            COUNT(*) as total_projects,
            COUNT(CASE WHEN status = 'inquiry' THEN 1 END) as inquiry_count,
            COUNT(CASE WHEN status = 'reviewing' THEN 1 END) as reviewing_count,
            COUNT(CASE WHEN status = 'quoted' THEN 1 END) as quoted_count,
            COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
            COUNT(CASE WHEN status = 'procurement' THEN 1 END) as procurement_count,
            COUNT(CASE WHEN status = 'production' THEN 1 END) as production_count,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
            COUNT(CASE WHEN priority_level = 'low' THEN 1 END) as low_priority_count,
            COUNT(CASE WHEN priority_level = 'normal' THEN 1 END) as normal_priority_count,
            COUNT(CASE WHEN priority_level = 'high' THEN 1 END) as high_priority_count,
            COUNT(CASE WHEN priority_level = 'urgent' THEN 1 END) as urgent_priority_count,
            COUNT(CASE WHEN project_type = 'system_build' THEN 1 END) as system_build_count,
            COUNT(CASE WHEN project_type = 'fabrication' THEN 1 END) as fabrication_count,
            COUNT(CASE WHEN project_type = 'manufacturing' THEN 1 END) as manufacturing_count
        FROM projects
        WHERE organization_id = org_id
    ),
    stage_stats AS (
        SELECT
            ws.name as stage_name,
            COUNT(p.id) as stage_count
        FROM projects p
        LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
        WHERE p.organization_id = org_id
        GROUP BY ws.name
    ),
    recent_projects AS (
        SELECT
            p.id,
            p.organization_id,
            p.project_id,
            p.title,
            p.status,
            p.priority_level,
            p.project_type,
            p.created_at,
            p.estimated_delivery_date,
            CASE 
                WHEN p.stage_entered_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (NOW() - p.stage_entered_at)) / 86400 
                ELSE NULL 
            END as days_in_stage,
            ws.name as current_stage_name,
            cust_org.name as customer_name
        FROM projects p
        LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
        LEFT JOIN organizations cust_org ON p.customer_organization_id = cust_org.id
        WHERE p.organization_id = org_id
        ORDER BY p.created_at DESC
        LIMIT 10
    )
    SELECT json_build_object(
        'projects', json_build_object(
            'total', ps.total_projects,
            'by_status', json_build_object(
                'inquiry', ps.inquiry_count,
                'reviewing', ps.reviewing_count,
                'quoted', ps.quoted_count,
                'confirmed', ps.confirmed_count,
                'procurement', ps.procurement_count,
                'production', ps.production_count,
                'completed', ps.completed_count,
                'cancelled', ps.cancelled_count
            ),
            'by_type', json_build_object(
                'system_build', ps.system_build_count,
                'fabrication', ps.fabrication_count,
                'manufacturing', ps.manufacturing_count
            ),
            'by_priority', json_build_object(
                'low', ps.low_priority_count,
                'normal', ps.normal_priority_count,
                'high', ps.high_priority_count,
                'urgent', ps.urgent_priority_count
            ),
            'by_stage', (
                SELECT json_object_agg(
                    COALESCE(stage_name, 'no_stage'), 
                    stage_count
                )
                FROM stage_stats
            )
        ),
        'recent_projects', (
            SELECT json_agg(
                json_build_object(
                    'id', rp.id,
                    'organization_id', rp.organization_id,
                    'project_id', rp.project_id,
                    'title', rp.title,
                    'status', rp.status,
                    'priority_level', rp.priority_level,
                    'project_type', rp.project_type,
                    'created_at', rp.created_at,
                    'customer_name', rp.customer_name,
                    'estimated_delivery_date', rp.estimated_delivery_date,
                    'days_in_stage', rp.days_in_stage,
                    'current_stage', rp.current_stage_name
                )
            )
            FROM recent_projects rp
        ),
        'generated_at', extract(epoch from now()),
        'debug', json_build_object(
            'organization_id', org_id,
            'query_timestamp', now()
        )
    ) INTO result
    FROM project_stats ps;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_dashboard_summary_test"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_project_progress_summary"("p_project_id" "uuid") RETURNS TABLE("total_sub_stages" bigint, "completed_sub_stages" bigint, "in_progress_sub_stages" bigint, "blocked_sub_stages" bigint, "overdue_sub_stages" bigint, "next_due_date" timestamp with time zone, "estimated_completion_date" "date")
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_project_progress_summary"("p_project_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_org_simple"("user_id" "uuid") RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
    SELECT organization_id FROM users WHERE id = user_id;
$$;


ALTER FUNCTION "public"."get_user_org_simple"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") RETURNS "text"[]
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_role user_role;
    permissions TEXT[];
BEGIN
    -- Get user's role
    SELECT role INTO user_role
    FROM users
    WHERE id = p_user_id;

    -- Return permissions based on role
    CASE user_role
        WHEN 'admin' THEN
            permissions := ARRAY['*'];
        WHEN 'management' THEN
            permissions := ARRAY[
                'read:*', 'create:projects', 'update:projects', 'delete:projects',
                'approve:*', 'manage:users', 'read:analytics'
            ];
        WHEN 'engineering' THEN
            permissions := ARRAY[
                'read:projects', 'update:projects', 'create:documents',
                'read:documents', 'update:documents', 'review:projects'
            ];
        WHEN 'qa' THEN
            permissions := ARRAY[
                'read:projects', 'review:projects', 'create:documents',
                'read:documents', 'approve:quality', 'read:analytics'
            ];
        WHEN 'procurement' THEN
            permissions := ARRAY[
                'read:projects', 'update:projects', 'create:suppliers',
                'read:suppliers', 'update:suppliers', 'approve:purchase_orders'
            ];
        WHEN 'production' THEN
            permissions := ARRAY[
                'read:projects', 'update:projects', 'read:production',
                'update:production', 'create:documents'
            ];
        WHEN 'sales' THEN
            permissions := ARRAY[
                'read:projects', 'create:projects', 'update:projects',
                'read:customers', 'create:customers', 'update:customers'
            ];
        ELSE
            permissions := ARRAY[]::TEXT[];
    END CASE;

    RETURN permissions;
END;
$$;


ALTER FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_users_by_organization"("p_org_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "email" "text", "role" "public"."user_role", "department" "text", "status" "public"."user_status")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.department,
        u.status
    FROM users u
    WHERE u.organization_id = p_org_id
    AND u.status = 'active'
    ORDER BY u.name;
END;
$$;


ALTER FUNCTION "public"."get_users_by_organization"("p_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_user_feature_access"("p_user_id" "uuid", "p_feature_key" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_role user_role;
    feature_enabled BOOLEAN;
    required_role user_role;
    required_permissions TEXT[];
    has_required_role BOOLEAN;
    has_required_permissions BOOLEAN;
BEGIN
    -- Check if feature is enabled for organization
    SELECT ft.is_enabled, ft.required_role, ft.required_permissions
    INTO feature_enabled, required_role, required_permissions
    FROM feature_toggles ft
    JOIN users u ON ft.organization_id = u.organization_id
    WHERE u.id = p_user_id AND ft.feature_key = p_feature_key;

    -- If feature is disabled, return false
    IF NOT feature_enabled THEN
        RETURN false;
    END IF;

    -- Check user-specific override
    SELECT ufa.has_access
    INTO feature_enabled
    FROM user_feature_access ufa
    JOIN feature_toggles ft ON ufa.feature_toggle_id = ft.id
    WHERE ufa.user_id = p_user_id AND ft.feature_key = p_feature_key;

    -- If user has specific override, use it
    IF feature_enabled IS NOT NULL THEN
        RETURN feature_enabled;
    END IF;

    -- Get user role
    SELECT role INTO user_role
    FROM users
    WHERE id = p_user_id;

    -- Check role hierarchy
    CASE
        WHEN user_role = 'admin' THEN RETURN true;
        WHEN user_role = 'management' AND required_role IN ('management', 'sales', 'procurement', 'engineering', 'qa', 'production') THEN RETURN true;
        WHEN user_role = 'sales' AND required_role IN ('sales', 'procurement', 'engineering', 'qa', 'production') THEN RETURN true;
        WHEN user_role = 'procurement' AND required_role IN ('procurement', 'engineering', 'qa', 'production') THEN RETURN true;
        WHEN user_role = 'engineering' AND required_role IN ('engineering', 'qa', 'production') THEN RETURN true;
        WHEN user_role = 'qa' AND required_role IN ('qa', 'production') THEN RETURN true;
        WHEN user_role = 'production' AND required_role = 'production' THEN RETURN true;
        ELSE RETURN false;
    END CASE;
END;
$$;


ALTER FUNCTION "public"."has_user_feature_access"("p_user_id" "uuid", "p_feature_key" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_user_feature_access"("p_user_id" "uuid", "p_feature_key" "text") IS 'Check if user has access to a specific feature';



CREATE OR REPLACE FUNCTION "public"."has_user_permission"("p_user_id" "uuid", "p_permission" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_permissions TEXT[];
    permission_parts TEXT[];
    action_part TEXT;
    resource_part TEXT;
    wildcard_permission TEXT;
BEGIN
    -- Get user permissions
    SELECT get_user_permissions(p_user_id) INTO user_permissions;

    -- Check for wildcard permissions
    IF '*' = ANY(user_permissions) THEN
        RETURN TRUE;
    END IF;

    -- Check for exact permission match
    IF p_permission = ANY(user_permissions) THEN
        RETURN TRUE;
    END IF;

    -- Check for wildcard patterns (e.g., 'read:*' covers 'read:projects')
    permission_parts := string_to_array(p_permission, ':');
    IF array_length(permission_parts, 1) = 2 THEN
        action_part := permission_parts[1];
        resource_part := permission_parts[2];
        wildcard_permission := action_part || ':*';

        IF wildcard_permission = ANY(user_permissions) THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."has_user_permission"("p_user_id" "uuid", "p_permission" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_user_permission_enhanced"("p_user_id" "uuid", "p_resource" "text", "p_action" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_role user_role;
    permission_name TEXT;
    has_permission BOOLEAN := false;
    has_deny BOOLEAN := false;
BEGIN
    -- Build permission name
    permission_name := p_resource || ':' || p_action;

    -- Get user's base role
    SELECT role INTO user_role
    FROM users
    WHERE id = p_user_id;

    -- Check for explicit deny (takes precedence)
    SELECT EXISTS(
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = p_user_id
        AND p.name = permission_name
        AND up.permission_type = 'deny'
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    ) INTO has_deny;

    -- If explicitly denied, return false
    IF has_deny THEN
        RETURN false;
    END IF;

    -- Check for explicit grant
    SELECT EXISTS(
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = p_user_id
        AND p.name = permission_name
        AND up.permission_type = 'grant'
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    ) INTO has_permission;

    -- If explicitly granted, return true
    IF has_permission THEN
        RETURN true;
    END IF;

    -- Check custom roles
    SELECT EXISTS(
        SELECT 1 FROM user_custom_roles ucr
        JOIN role_permissions rp ON ucr.custom_role_id = rp.custom_role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ucr.user_id = p_user_id
        AND p.name = permission_name
        AND (ucr.expires_at IS NULL OR ucr.expires_at > NOW())
    ) INTO has_permission;

    -- If found in custom roles, return true
    IF has_permission THEN
        RETURN true;
    END IF;

    -- Fall back to role-based permissions (original logic)
    CASE user_role
        WHEN 'admin' THEN RETURN true;
        WHEN 'management' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:create', 'rfq:update', 'rfq:assign', 'rfq:delete',
                'customer:read', 'customer:create', 'customer:update',
                'supplier:read', 'supplier:create', 'supplier:update',
                'dashboard:read', 'analytics:read', 'analytics:export',
                'users:read', 'users:create', 'users:update', 'users:delete',
                'workflow:read', 'workflow:create', 'workflow:update', 'workflow:delete',
                'approvals:read', 'approvals:update'
            );
        WHEN 'procurement' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:create', 'rfq:update', 'rfq:assign', 'rfq:delete',
                'supplier:read', 'supplier:create', 'supplier:update',
                'dashboard:read', 'workflow:read', 'workflow:update',
                'approvals:read', 'approvals:update'
            );
        WHEN 'sales' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:create', 'rfq:update', 'rfq:assign', 'rfq:delete',
                'customer:read', 'customer:create', 'customer:update',
                'dashboard:read', 'workflow:read', 'workflow:update'
            );
        WHEN 'engineering' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:update', 'rfq:review',
                'technical_specs:read', 'technical_specs:create', 'technical_specs:update',
                'dashboard:read', 'documents:read', 'documents:create', 'documents:update',
                'workflow:read', 'workflow:update'
            );
        WHEN 'qa' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:review', 'rfq:approve', 'rfq:reject',
                'quality_specs:read', 'quality_specs:create', 'quality_specs:update',
                'dashboard:read', 'audit:read', 'audit:create',
                'workflow:read', 'workflow:update'
            );
        WHEN 'production' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:update', 'rfq:schedule',
                'production_schedule:read', 'production_schedule:create', 'production_schedule:update',
                'dashboard:read', 'capacity:read', 'capacity:update',
                'workflow:read', 'workflow:update'
            );
        ELSE RETURN false;
    END CASE;
END;
$$;


ALTER FUNCTION "public"."has_user_permission_enhanced"("p_user_id" "uuid", "p_resource" "text", "p_action" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_user_permission_enhanced"("p_user_id" "uuid", "p_resource" "text", "p_action" "text") IS 'Enhanced permission checking function with custom roles and overrides';



CREATE OR REPLACE FUNCTION "public"."log_permission_change"("p_user_id" "uuid", "p_target_user_id" "uuid", "p_action_type" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_old_values" "jsonb" DEFAULT NULL::"jsonb", "p_new_values" "jsonb" DEFAULT NULL::"jsonb", "p_reason" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Get organization ID
    SELECT organization_id INTO org_id
    FROM users
    WHERE id = p_user_id;

    -- Insert audit log
    INSERT INTO permission_audit_log (
        organization_id,
        user_id,
        target_user_id,
        action_type,
        entity_type,
        entity_id,
        old_values,
        new_values,
        reason
    ) VALUES (
        org_id,
        p_user_id,
        p_target_user_id,
        p_action_type,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values,
        p_reason
    );
END;
$$;


ALTER FUNCTION "public"."log_permission_change"("p_user_id" "uuid", "p_target_user_id" "uuid", "p_action_type" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_old_values" "jsonb", "p_new_values" "jsonb", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."log_permission_change"("p_user_id" "uuid", "p_target_user_id" "uuid", "p_action_type" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_old_values" "jsonb", "p_new_values" "jsonb", "p_reason" "text") IS 'Log permission changes for audit purposes';



CREATE OR REPLACE FUNCTION "public"."refresh_dashboard_materialized_views"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Only refresh the materialized view that actually exists
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_workload;
    
    -- Log the refresh (with proper organization_id)
    INSERT INTO activity_log (
        organization_id,
        user_id,
        entity_type,
        entity_id,
        action,
        description,
        metadata
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440000', -- Use a valid organization_id
        NULL,
        'system',
        gen_random_uuid(),
        'refresh_materialized_views',
        'Refreshed dashboard materialized views',
        jsonb_build_object(
            'refreshed_at', NOW(),
            'views_refreshed', ARRAY['mv_user_workload']
        )
    );
END;
$$;


ALTER FUNCTION "public"."refresh_dashboard_materialized_views"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_permissions_cache_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Refresh cache for affected users
    IF TG_OP = 'DELETE' THEN
        -- Handle user_permissions changes
        IF TG_TABLE_NAME = 'user_permissions' THEN
            PERFORM refresh_user_permissions_cache(OLD.user_id);
        END IF;

        -- Handle user_custom_roles changes
        IF TG_TABLE_NAME = 'user_custom_roles' THEN
            PERFORM refresh_user_permissions_cache(OLD.user_id);
        END IF;

        -- Handle user_feature_access changes
        IF TG_TABLE_NAME = 'user_feature_access' THEN
            PERFORM refresh_user_permissions_cache(OLD.user_id);
        END IF;
    ELSE
        -- Handle inserts and updates
        IF TG_TABLE_NAME = 'user_permissions' THEN
            PERFORM refresh_user_permissions_cache(NEW.user_id);
        END IF;

        IF TG_TABLE_NAME = 'user_custom_roles' THEN
            PERFORM refresh_user_permissions_cache(NEW.user_id);
        END IF;

        IF TG_TABLE_NAME = 'user_feature_access' THEN
            PERFORM refresh_user_permissions_cache(NEW.user_id);
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."refresh_permissions_cache_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_user_permissions_cache"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    permissions_data JSONB;
BEGIN
    -- Build comprehensive permissions object
    SELECT jsonb_build_object(
        'base_role', u.role,
        'custom_roles', COALESCE(
            jsonb_agg(DISTINCT jsonb_build_object(
                'id', cr.id,
                'name', cr.name,
                'permissions', (
                    SELECT jsonb_agg(p.name)
                    FROM role_permissions rp
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE rp.custom_role_id = cr.id
                )
            )) FILTER (WHERE cr.id IS NOT NULL), '[]'::jsonb
        ),
        'user_overrides', COALESCE(
            jsonb_agg(jsonb_build_object(
                'permission', p.name,
                'type', up.permission_type,
                'expires_at', up.expires_at
            )) FILTER (WHERE p.id IS NOT NULL), '[]'::jsonb
        ),
        'feature_access', COALESCE(
            jsonb_agg(jsonb_build_object(
                'feature_key', ft.feature_key,
                'has_access', COALESCE(ufa.has_access, ft.is_enabled)
            )) FILTER (WHERE ft.id IS NOT NULL), '[]'::jsonb
        ),
        'last_updated', NOW()
    ) INTO permissions_data
    FROM users u
    LEFT JOIN user_custom_roles ucr ON u.id = ucr.user_id
        AND (ucr.expires_at IS NULL OR ucr.expires_at > NOW())
    LEFT JOIN custom_roles cr ON ucr.custom_role_id = cr.id AND cr.is_active = true
    LEFT JOIN user_permissions up ON u.id = up.user_id
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    LEFT JOIN permissions p ON up.permission_id = p.id
    LEFT JOIN user_feature_access ufa ON u.id = ufa.user_id
    LEFT JOIN feature_toggles ft ON ufa.feature_toggle_id = ft.id AND ft.is_enabled = true
    WHERE u.id = p_user_id
    GROUP BY u.id, u.role;

    -- Update cache
    UPDATE users
    SET custom_permissions_cache = permissions_data,
        last_permission_update = NOW()
    WHERE id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."refresh_user_permissions_cache"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."refresh_user_permissions_cache"("p_user_id" "uuid") IS 'Refresh the cached permissions for a user';



CREATE OR REPLACE FUNCTION "public"."set_created_by"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_created_by"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_updates" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    update_sql TEXT;
    field_name TEXT;
    field_value JSONB;
BEGIN
    -- Build dynamic update SQL
    update_sql := 'UPDATE users SET updated_at = NOW()';

    -- Add fields from JSONB
    FOR field_name IN SELECT jsonb_object_keys(p_updates)
    LOOP
        field_value := p_updates->field_name;

        -- Skip certain fields that shouldn't be updated directly
        IF field_name NOT IN ('id', 'organization_id', 'created_at') THEN
            update_sql := update_sql || ', ' || field_name || ' = ' ||
                         CASE
                             WHEN jsonb_typeof(field_value) = 'string' THEN quote_literal(field_value->>0)
                             WHEN jsonb_typeof(field_value) = 'boolean' THEN (field_value->>0)::TEXT
                             WHEN jsonb_typeof(field_value) = 'number' THEN (field_value->>0)::TEXT
                             WHEN jsonb_typeof(field_value) = 'object' THEN quote_literal(field_value::TEXT)
                             WHEN jsonb_typeof(field_value) = 'array' THEN quote_literal(field_value::TEXT)
                             ELSE 'NULL'
                         END;
        END IF;
    END LOOP;

    update_sql := update_sql || ' WHERE id = ' || quote_literal(p_user_id::TEXT);

    -- Execute the update
    EXECUTE update_sql;

    RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_updates" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "project_id" "uuid",
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "action" "text" NOT NULL,
    "description" "text",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approval_attachments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "uploaded_by" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "original_file_name" "text",
    "file_type" "text",
    "file_size" bigint,
    "file_url" "text",
    "mime_type" "text",
    "attachment_type" "text" DEFAULT 'supporting_document'::"text",
    "description" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "uploaded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."approval_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approval_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action" "public"."approval_action" NOT NULL,
    "old_status" "public"."approval_status",
    "new_status" "public"."approval_status",
    "comments" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."approval_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approvals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "approval_type" "public"."approval_type" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "reference_id" "text",
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "approval_chain_id" "uuid",
    "step_number" integer DEFAULT 1,
    "total_steps" integer DEFAULT 1,
    "requested_by" "uuid" NOT NULL,
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "request_reason" "text",
    "request_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "current_approver_id" "uuid",
    "current_approver_role" "public"."user_role",
    "current_approver_department" "text",
    "status" "public"."approval_status" DEFAULT 'pending'::"public"."approval_status",
    "priority" "public"."approval_priority" DEFAULT 'normal'::"public"."approval_priority",
    "due_date" "date",
    "expires_at" timestamp with time zone,
    "sla_due_at" timestamp with time zone,
    "decision_comments" "text",
    "decision_reason" "text",
    "decision_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "decided_at" timestamp with time zone,
    "decided_by" "uuid",
    "escalated_from" "uuid",
    "escalated_to" "uuid",
    "escalated_at" timestamp with time zone,
    "escalation_reason" "text",
    "delegated_from" "uuid",
    "delegated_to" "uuid",
    "delegated_at" timestamp with time zone,
    "delegation_reason" "text",
    "delegation_end_date" "date",
    "auto_approval_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "auto_approved_at" timestamp with time zone,
    "auto_approval_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."approvals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "type" "text" DEFAULT 'customer'::"text",
    "contact_name" "text",
    "email" "text",
    "phone" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "country" "text",
    "postal_code" "text",
    "website" "text",
    "tax_id" "text",
    "payment_terms" "text",
    "credit_limit" numeric,
    "is_active" boolean DEFAULT true,
    "role" "text",
    "is_primary_contact" boolean DEFAULT false,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."contacts"."created_by" IS 'User ID of the person who created this contact';



CREATE TABLE IF NOT EXISTS "public"."custom_roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_system" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."custom_roles" IS 'Custom roles that can be assigned to users beyond basic user roles';



CREATE TABLE IF NOT EXISTS "public"."document_access_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "document_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "accessed_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."document_access_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_versions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "document_id" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" bigint,
    "mime_type" "text",
    "checksum" "text",
    "uploaded_by" "uuid" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "change_summary" "text",
    "is_current" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" bigint,
    "mime_type" "text",
    "category" "public"."document_category" DEFAULT 'other'::"public"."document_category",
    "version_number" integer DEFAULT 1,
    "is_current_version" boolean DEFAULT true,
    "storage_provider" "text" DEFAULT 'local'::"text",
    "checksum" "text",
    "access_level" "text" DEFAULT 'organization'::"text",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "uploaded_by" "uuid",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feature_toggles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "feature_name" "text" NOT NULL,
    "feature_key" "text" NOT NULL,
    "description" "text",
    "is_enabled" boolean DEFAULT true,
    "required_role" "public"."user_role",
    "required_permissions" "text"[],
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."feature_toggles" OWNER TO "postgres";


COMMENT ON TABLE "public"."feature_toggles" IS 'Feature flags to enable/disable specific application features';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "sender_id" "uuid" NOT NULL,
    "recipient_id" "uuid",
    "subject" "text" NOT NULL,
    "content" "text" NOT NULL,
    "message_type" "text",
    "priority" "public"."notification_priority" DEFAULT 'normal'::"public"."notification_priority",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "parent_message_id" "uuid",
    "thread_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_sub_stage_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "workflow_stage_id" "uuid" NOT NULL,
    "sub_stage_id" "uuid" NOT NULL,
    "status" "public"."sub_stage_status" DEFAULT 'pending'::"public"."sub_stage_status",
    "assigned_to" "uuid",
    "started_at" timestamp with time zone,
    "due_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "blocked_reason" "text",
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_sub_stage_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "customer_organization_id" "uuid" NOT NULL,
    "point_of_contacts" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "current_stage_id" "uuid",
    "workflow_definition_id" "uuid",
    "status" "public"."project_status" DEFAULT 'draft'::"public"."project_status",
    "priority_level" "public"."priority_level" DEFAULT 'normal'::"public"."priority_level",
    "priority_score" numeric(5,2) DEFAULT 0,
    "stage_entered_at" timestamp with time zone,
    "estimated_delivery_date" "date",
    "actual_delivery_date" "date",
    "requested_due_date" "date",
    "promised_due_date" "date",
    "assigned_to" "uuid",
    "created_by" "uuid",
    "estimated_value" numeric(18,2),
    "actual_value" numeric(18,2),
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "project_type" "text",
    "intake_type" "text",
    "intake_source" "text",
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "source" "text",
    "description_legacy" "text"
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "email" "text" NOT NULL,
    "name" "text",
    "role" "text" DEFAULT 'sales'::"text",
    "department" "text",
    "phone" "text",
    "avatar_url" "text",
    "status" "text" DEFAULT 'active'::"text",
    "description" "text",
    "employee_id" "text",
    "direct_manager_id" "uuid",
    "direct_reports" "uuid"[],
    "last_login_at" timestamp with time zone,
    "preferences" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "permission_override" boolean DEFAULT false,
    "custom_permissions_cache" "jsonb" DEFAULT '{}'::"jsonb",
    "last_permission_update" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."mv_user_workload" AS
 SELECT "u"."id" AS "user_id",
    "u"."organization_id",
    "u"."name" AS "user_name",
    "u"."role",
    "count"(DISTINCT "p"."id") AS "assigned_projects",
    "count"(DISTINCT "pssp"."id") AS "assigned_sub_stages",
    "count"(DISTINCT
        CASE
            WHEN ("pssp"."status" = 'in_progress'::"public"."sub_stage_status") THEN "pssp"."id"
            ELSE NULL::"uuid"
        END) AS "active_sub_stages",
    "count"(DISTINCT
        CASE
            WHEN ("pssp"."status" = 'completed'::"public"."sub_stage_status") THEN "pssp"."id"
            ELSE NULL::"uuid"
        END) AS "completed_sub_stages",
    "count"(DISTINCT
        CASE
            WHEN (("a"."current_approver_id" = "u"."id") AND ("a"."status" = 'pending'::"public"."approval_status")) THEN "a"."id"
            ELSE NULL::"uuid"
        END) AS "pending_approvals",
    "count"(DISTINCT
        CASE
            WHEN ("a"."requested_by" = "u"."id") THEN "a"."id"
            ELSE NULL::"uuid"
        END) AS "requested_approvals",
    "max"(GREATEST(COALESCE("p"."updated_at", '1970-01-01 00:00:00+00'::timestamp with time zone), COALESCE("pssp"."updated_at", '1970-01-01 00:00:00+00'::timestamp with time zone), COALESCE("a"."updated_at", '1970-01-01 00:00:00+00'::timestamp with time zone))) AS "last_activity"
   FROM ((("public"."users" "u"
     LEFT JOIN "public"."projects" "p" ON (("p"."assigned_to" = "u"."id")))
     LEFT JOIN "public"."project_sub_stage_progress" "pssp" ON (("pssp"."assigned_to" = "u"."id")))
     LEFT JOIN "public"."approvals" "a" ON ((("a"."current_approver_id" = "u"."id") OR ("a"."requested_by" = "u"."id"))))
  WHERE ("u"."status" = 'active'::"text")
  GROUP BY "u"."id", "u"."organization_id", "u"."name", "u"."role"
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."mv_user_workload" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."notification_type" DEFAULT 'system'::"public"."notification_type",
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "priority" "public"."notification_priority" DEFAULT 'normal'::"public"."notification_priority",
    "action_url" "text",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text",
    "description" "text",
    "industry" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "country" "text",
    "postal_code" "text",
    "website" "text",
    "logo_url" "text",
    "organization_type" "text" DEFAULT 'customer'::"text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."organizations"."created_by" IS 'User ID of the person who created this organization';



CREATE TABLE IF NOT EXISTS "public"."permission_audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "target_user_id" "uuid",
    "action_type" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "reason" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permission_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."permission_audit_log" IS 'Audit trail for all permission-related changes';



CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "resource" "text" NOT NULL,
    "action" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'general'::"text",
    "is_system" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."permissions" IS 'System-wide permissions catalog defining all available permissions';



CREATE TABLE IF NOT EXISTS "public"."review_checklist_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "review_id" "uuid" NOT NULL,
    "item_text" "text" NOT NULL,
    "is_checked" boolean DEFAULT false,
    "is_required" boolean DEFAULT false,
    "notes" "text",
    "checked_by" "uuid",
    "checked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."review_checklist_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."review_checklist_items" IS 'Checklist items for reviews';



CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "reviewer_role" "public"."user_role",
    "review_type" "public"."approval_type" NOT NULL,
    "status" "public"."approval_status" DEFAULT 'pending'::"public"."approval_status" NOT NULL,
    "priority" "public"."approval_priority" DEFAULT 'normal'::"public"."approval_priority" NOT NULL,
    "comments" "text",
    "risks" "jsonb" DEFAULT '{}'::"jsonb",
    "recommendations" "text",
    "tooling_required" boolean DEFAULT false,
    "estimated_cost" numeric,
    "estimated_lead_time" numeric,
    "due_date" "date",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."reviews" IS 'Reviews table with proper foreign key constraints for Supabase joins';



CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "custom_role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_permissions" IS 'Junction table linking custom roles to specific permissions';



CREATE TABLE IF NOT EXISTS "public"."user_custom_roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "custom_role_id" "uuid" NOT NULL,
    "assigned_by" "uuid",
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."user_custom_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_custom_roles" IS 'Junction table for user-custom role assignments';



CREATE TABLE IF NOT EXISTS "public"."user_feature_access" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "feature_toggle_id" "uuid" NOT NULL,
    "has_access" boolean DEFAULT true,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."user_feature_access" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_feature_access" IS 'User-specific feature access overrides';



CREATE TABLE IF NOT EXISTS "public"."user_permissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "permission_type" "text" NOT NULL,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "reason" "text",
    CONSTRAINT "user_permissions_permission_type_check" CHECK (("permission_type" = ANY (ARRAY['grant'::"text", 'deny'::"text"])))
);


ALTER TABLE "public"."user_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_permissions" IS 'User-specific permission overrides (grants or denials)';



CREATE OR REPLACE VIEW "public"."v_approval_queue" AS
 SELECT "a"."id",
    "a"."organization_id",
    "a"."approval_type",
    "a"."title",
    "a"."description",
    "a"."reference_id",
    "a"."entity_type",
    "a"."entity_id",
    "a"."approval_chain_id",
    "a"."step_number",
    "a"."total_steps",
    "a"."requested_by",
    "a"."requested_at",
    "a"."request_reason",
    "a"."request_metadata",
    "a"."current_approver_id",
    "a"."current_approver_role",
    "a"."current_approver_department",
    "a"."status",
    "a"."priority",
    "a"."due_date",
    "a"."expires_at",
    "a"."sla_due_at",
    "a"."decision_comments",
    "a"."decision_reason",
    "a"."decision_metadata",
    "a"."decided_at",
    "a"."decided_by",
    "a"."escalated_from",
    "a"."escalated_to",
    "a"."escalated_at",
    "a"."escalation_reason",
    "a"."delegated_from",
    "a"."delegated_to",
    "a"."delegated_at",
    "a"."delegation_reason",
    "a"."delegation_end_date",
    "a"."auto_approval_rules",
    "a"."auto_approved_at",
    "a"."auto_approval_reason",
    "a"."created_at",
    "a"."updated_at",
    "a"."created_by",
    "requester"."name" AS "requester_name",
    "requester"."email" AS "requester_email",
    "requester"."role" AS "requester_role",
    "approver"."name" AS "current_approver_name",
    "approver"."email" AS "current_approver_email",
    "approver"."role" AS "approver_role",
        CASE
            WHEN ("a"."entity_type" = 'project'::"text") THEN ( SELECT "projects"."title"
               FROM "public"."projects"
              WHERE ("projects"."id" = "a"."entity_id"))
            WHEN ("a"."entity_type" = 'document'::"text") THEN ( SELECT "documents"."title"
               FROM "public"."documents"
              WHERE ("documents"."id" = "a"."entity_id"))
            ELSE (("a"."entity_type" || ':'::"text") || "a"."entity_id")
        END AS "entity_title",
        CASE
            WHEN ("a"."entity_type" = 'project'::"text") THEN ( SELECT "projects"."project_id"
               FROM "public"."projects"
              WHERE ("projects"."id" = "a"."entity_id"))
            ELSE NULL::"text"
        END AS "project_code",
        CASE
            WHEN ("a"."requested_at" IS NOT NULL) THEN (EXTRACT(epoch FROM ("now"() - "a"."requested_at")) / (3600)::numeric)
            ELSE NULL::numeric
        END AS "hours_since_request",
        CASE
            WHEN ("a"."sla_due_at" IS NOT NULL) THEN
            CASE
                WHEN ("a"."sla_due_at" IS NOT NULL) THEN (EXTRACT(epoch FROM ("a"."sla_due_at" - "now"())) / (3600)::numeric)
                ELSE NULL::numeric
            END
            ELSE NULL::numeric
        END AS "hours_until_sla_due",
        CASE
            WHEN (("a"."sla_due_at" IS NOT NULL) AND ("a"."sla_due_at" < "now"()) AND ("a"."status" = ANY (ARRAY['pending'::"public"."approval_status", 'in_review'::"public"."approval_status"]))) THEN true
            ELSE false
        END AS "is_overdue",
        CASE
            WHEN (("a"."status" = 'pending'::"public"."approval_status") AND ("a"."current_approver_id" IS NULL)) THEN true
            ELSE false
        END AS "needs_assignment"
   FROM (("public"."approvals" "a"
     LEFT JOIN "public"."users" "requester" ON (("a"."requested_by" = "requester"."id")))
     LEFT JOIN "public"."users" "approver" ON (("a"."current_approver_id" = "approver"."id")))
  ORDER BY
        CASE
            WHEN (("a"."sla_due_at" IS NOT NULL) AND ("a"."sla_due_at" < "now"())) THEN 1
            ELSE 0
        END DESC,
        CASE "a"."priority"
            WHEN 'critical'::"public"."approval_priority" THEN 4
            WHEN 'urgent'::"public"."approval_priority" THEN 3
            WHEN 'high'::"public"."approval_priority" THEN 2
            WHEN 'normal'::"public"."approval_priority" THEN 1
            WHEN 'low'::"public"."approval_priority" THEN 0
            ELSE NULL::integer
        END DESC, "a"."requested_at";


ALTER VIEW "public"."v_approval_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_definition_stages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "workflow_definition_id" "uuid" NOT NULL,
    "workflow_stage_id" "uuid" NOT NULL,
    "is_included" boolean DEFAULT true,
    "stage_order_override" integer,
    "responsible_roles_override" "public"."user_role"[],
    "estimated_duration_days_override" integer,
    "requires_approval_override" boolean,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_definition_stages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_definition_sub_stages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "workflow_definition_id" "uuid" NOT NULL,
    "workflow_sub_stage_id" "uuid" NOT NULL,
    "is_included" boolean DEFAULT true,
    "sub_stage_order_override" integer,
    "responsible_roles_override" "public"."user_role"[],
    "requires_approval_override" boolean,
    "can_skip_override" boolean,
    "auto_advance_override" boolean,
    "estimated_duration_hours_override" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_definition_sub_stages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_definitions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "version" integer NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_stages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "color" "text",
    "stage_order" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "exit_criteria" "text",
    "responsible_roles" "public"."user_role"[],
    "estimated_duration_days" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_stages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_sub_stages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "workflow_stage_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "color" "text",
    "sub_stage_order" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "exit_criteria" "text",
    "responsible_roles" "public"."user_role"[],
    "estimated_duration_hours" integer,
    "is_required" boolean DEFAULT true,
    "can_skip" boolean DEFAULT false,
    "auto_advance" boolean DEFAULT false,
    "requires_approval" boolean DEFAULT false,
    "approval_roles" "public"."user_role"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_sub_stages" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_current_stage_progress" AS
 SELECT "p"."id" AS "project_id",
    "p"."project_id" AS "project_code",
    "p"."title" AS "project_title",
    "p"."priority_level",
    "p"."status" AS "project_status",
    "p"."stage_entered_at",
    "ws"."id" AS "stage_id",
    "ws"."name" AS "stage_name",
    "ws"."stage_order",
    "ws"."color" AS "stage_color",
    "wss"."id" AS "sub_stage_id",
    "wss"."name" AS "sub_stage_name",
    COALESCE("wdss"."sub_stage_order_override", "wss"."sub_stage_order") AS "sub_stage_order",
    "wss"."estimated_duration_hours",
    "wss"."responsible_roles",
    "wss"."requires_approval",
    "pssp"."status" AS "progress_status",
    "pssp"."assigned_to",
    "pssp"."started_at",
    "pssp"."due_at",
    "pssp"."completed_at",
    "pssp"."blocked_reason",
    "assignee"."name" AS "assigned_user_name",
    "assignee"."role" AS "assigned_user_role",
        CASE
            WHEN (("pssp"."due_at" IS NOT NULL) AND ("pssp"."status" <> ALL (ARRAY['completed'::"public"."sub_stage_status", 'skipped'::"public"."sub_stage_status"]))) THEN
            CASE
                WHEN ("pssp"."due_at" IS NOT NULL) THEN (EXTRACT(epoch FROM ("pssp"."due_at" - "now"())) / (3600)::numeric)
                ELSE NULL::numeric
            END
            ELSE NULL::numeric
        END AS "hours_until_due",
        CASE
            WHEN (("pssp"."started_at" IS NOT NULL) AND ("pssp"."completed_at" IS NOT NULL)) THEN
            CASE
                WHEN (("pssp"."completed_at" IS NOT NULL) AND ("pssp"."started_at" IS NOT NULL)) THEN (EXTRACT(epoch FROM ("pssp"."completed_at" - "pssp"."started_at")) / (3600)::numeric)
                ELSE NULL::numeric
            END
            ELSE NULL::numeric
        END AS "actual_hours_taken",
        CASE "p"."priority_level"
            WHEN 'urgent'::"public"."priority_level" THEN 4
            WHEN 'high'::"public"."priority_level" THEN 3
            WHEN 'normal'::"public"."priority_level" THEN 2
            WHEN 'low'::"public"."priority_level" THEN 1
            ELSE 0
        END AS "priority_score"
   FROM ((((((("public"."projects" "p"
     JOIN "public"."workflow_definitions" "wd" ON (("p"."workflow_definition_id" = "wd"."id")))
     JOIN "public"."workflow_definition_stages" "wds" ON (("wd"."id" = "wds"."workflow_definition_id")))
     JOIN "public"."workflow_stages" "ws" ON ((("wds"."workflow_stage_id" = "ws"."id") AND ("wds"."is_included" = true))))
     JOIN "public"."workflow_definition_sub_stages" "wdss" ON (("wd"."id" = "wdss"."workflow_definition_id")))
     JOIN "public"."workflow_sub_stages" "wss" ON ((("wdss"."workflow_sub_stage_id" = "wss"."id") AND ("wdss"."is_included" = true))))
     LEFT JOIN "public"."project_sub_stage_progress" "pssp" ON ((("p"."id" = "pssp"."project_id") AND ("wss"."id" = "pssp"."sub_stage_id"))))
     LEFT JOIN "public"."users" "assignee" ON (("pssp"."assigned_to" = "assignee"."id")))
  WHERE ("ws"."id" = "p"."current_stage_id")
  ORDER BY
        CASE "p"."priority_level"
            WHEN 'urgent'::"public"."priority_level" THEN 4
            WHEN 'high'::"public"."priority_level" THEN 3
            WHEN 'normal'::"public"."priority_level" THEN 2
            WHEN 'low'::"public"."priority_level" THEN 1
            ELSE 0
        END DESC, COALESCE("wdss"."sub_stage_order_override", "wss"."sub_stage_order");


ALTER VIEW "public"."v_current_stage_progress" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_project_detail" AS
 SELECT "p"."id",
    "p"."organization_id",
    "p"."project_id",
    "p"."title",
    "p"."description",
    "p"."customer_organization_id",
    "p"."point_of_contacts",
    "p"."current_stage_id",
    "p"."workflow_definition_id",
    "p"."status",
    "p"."priority_level",
    "p"."priority_score",
    "p"."stage_entered_at",
    "p"."estimated_delivery_date",
    "p"."actual_delivery_date",
    "p"."requested_due_date",
    "p"."promised_due_date",
    "p"."assigned_to",
    "p"."created_by",
    "p"."estimated_value",
    "p"."actual_value",
    "p"."tags",
    "p"."project_type",
    "p"."intake_type",
    "p"."intake_source",
    "p"."notes",
    "p"."metadata",
    "p"."created_at",
    "p"."updated_at",
    "p"."source",
    "p"."description_legacy",
    "cust_org"."name" AS "customer_name",
    "cust_org"."slug" AS "customer_slug",
    "cust_org"."organization_type" AS "customer_type",
    "cust_org"."industry" AS "customer_industry",
        CASE
            WHEN ("array_length"("p"."point_of_contacts", 1) > 0) THEN ( SELECT "contacts"."contact_name"
               FROM "public"."contacts"
              WHERE ("contacts"."id" = "p"."point_of_contacts"[1]))
            ELSE NULL::"text"
        END AS "primary_contact_name",
        CASE
            WHEN ("array_length"("p"."point_of_contacts", 1) > 0) THEN ( SELECT "contacts"."email"
               FROM "public"."contacts"
              WHERE ("contacts"."id" = "p"."point_of_contacts"[1]))
            ELSE NULL::"text"
        END AS "primary_contact_email",
    "ws"."name" AS "current_stage_name",
    "ws"."color" AS "current_stage_color",
    "ws"."stage_order" AS "current_stage_order",
    "assignee"."name" AS "assignee_name",
    "assignee"."email" AS "assignee_email",
    "assignee"."role" AS "assignee_role",
    "creator"."name" AS "creator_name",
    "creator"."email" AS "creator_email",
    COALESCE("progress_summary"."total_sub_stages", (0)::bigint) AS "total_sub_stages",
    COALESCE("progress_summary"."completed_sub_stages", (0)::bigint) AS "completed_sub_stages",
    COALESCE("progress_summary"."in_progress_sub_stages", (0)::bigint) AS "in_progress_sub_stages",
    COALESCE("progress_summary"."blocked_sub_stages", (0)::bigint) AS "blocked_sub_stages",
        CASE
            WHEN ("p"."stage_entered_at" IS NOT NULL) THEN (EXTRACT(epoch FROM ("now"() - "p"."stage_entered_at")) / (86400)::numeric)
            ELSE NULL::numeric
        END AS "days_in_current_stage",
        CASE
            WHEN ("p"."estimated_delivery_date" IS NOT NULL) THEN (EXTRACT(epoch FROM (("p"."estimated_delivery_date")::timestamp with time zone - "now"())) / (86400)::numeric)
            ELSE NULL::numeric
        END AS "days_until_due"
   FROM ((((("public"."projects" "p"
     LEFT JOIN "public"."organizations" "cust_org" ON (("p"."customer_organization_id" = "cust_org"."id")))
     LEFT JOIN "public"."workflow_stages" "ws" ON (("p"."current_stage_id" = "ws"."id")))
     LEFT JOIN "public"."users" "assignee" ON (("p"."assigned_to" = "assignee"."id")))
     LEFT JOIN "public"."users" "creator" ON (("p"."created_by" = "creator"."id")))
     LEFT JOIN ( SELECT "project_sub_stage_progress"."project_id",
            "count"(*) AS "total_sub_stages",
            "count"(
                CASE
                    WHEN ("project_sub_stage_progress"."status" = 'completed'::"public"."sub_stage_status") THEN 1
                    ELSE NULL::integer
                END) AS "completed_sub_stages",
            "count"(
                CASE
                    WHEN ("project_sub_stage_progress"."status" = 'in_progress'::"public"."sub_stage_status") THEN 1
                    ELSE NULL::integer
                END) AS "in_progress_sub_stages",
            "count"(
                CASE
                    WHEN ("project_sub_stage_progress"."status" = 'blocked'::"public"."sub_stage_status") THEN 1
                    ELSE NULL::integer
                END) AS "blocked_sub_stages"
           FROM "public"."project_sub_stage_progress"
          GROUP BY "project_sub_stage_progress"."project_id") "progress_summary" ON (("p"."id" = "progress_summary"."project_id")));


ALTER VIEW "public"."v_project_detail" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_attachments"
    ADD CONSTRAINT "approval_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_roles"
    ADD CONSTRAINT "custom_roles_organization_id_name_key" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "public"."custom_roles"
    ADD CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_access_log"
    ADD CONSTRAINT "document_access_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feature_toggles"
    ADD CONSTRAINT "feature_toggles_feature_key_key" UNIQUE ("feature_key");



ALTER TABLE ONLY "public"."feature_toggles"
    ADD CONSTRAINT "feature_toggles_organization_id_feature_key_key" UNIQUE ("organization_id", "feature_key");



ALTER TABLE ONLY "public"."feature_toggles"
    ADD CONSTRAINT "feature_toggles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permission_audit_log"
    ADD CONSTRAINT "permission_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_resource_action_key" UNIQUE ("resource", "action");



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_project_id_sub_stage_id_key" UNIQUE ("project_id", "sub_stage_id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_project_id_key" UNIQUE ("project_id");



ALTER TABLE ONLY "public"."review_checklist_items"
    ADD CONSTRAINT "review_checklist_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_custom_role_id_permission_id_key" UNIQUE ("custom_role_id", "permission_id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_custom_roles"
    ADD CONSTRAINT "user_custom_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_custom_roles"
    ADD CONSTRAINT "user_custom_roles_user_id_custom_role_id_key" UNIQUE ("user_id", "custom_role_id");



ALTER TABLE ONLY "public"."user_feature_access"
    ADD CONSTRAINT "user_feature_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_feature_access"
    ADD CONSTRAINT "user_feature_access_user_id_feature_toggle_id_key" UNIQUE ("user_id", "feature_toggle_id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_id_permission_id_key" UNIQUE ("user_id", "permission_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_definition_stages"
    ADD CONSTRAINT "workflow_definition_stages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_definition_stages"
    ADD CONSTRAINT "workflow_definition_stages_workflow_definition_id_workflow__key" UNIQUE ("workflow_definition_id", "workflow_stage_id");



ALTER TABLE ONLY "public"."workflow_definition_sub_stages"
    ADD CONSTRAINT "workflow_definition_sub_stage_workflow_definition_id_workfl_key" UNIQUE ("workflow_definition_id", "workflow_sub_stage_id");



ALTER TABLE ONLY "public"."workflow_definition_sub_stages"
    ADD CONSTRAINT "workflow_definition_sub_stages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_definitions"
    ADD CONSTRAINT "workflow_definitions_organization_id_name_version_key" UNIQUE ("organization_id", "name", "version");



ALTER TABLE ONLY "public"."workflow_definitions"
    ADD CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_stages"
    ADD CONSTRAINT "workflow_stages_organization_id_slug_key" UNIQUE ("organization_id", "slug");



ALTER TABLE ONLY "public"."workflow_stages"
    ADD CONSTRAINT "workflow_stages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_sub_stages"
    ADD CONSTRAINT "workflow_sub_stages_organization_id_slug_key" UNIQUE ("organization_id", "slug");



ALTER TABLE ONLY "public"."workflow_sub_stages"
    ADD CONSTRAINT "workflow_sub_stages_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_log_entity_created" ON "public"."activity_log" USING "btree" ("entity_type", "entity_id", "created_at" DESC);



CREATE INDEX "idx_activity_log_org_created" ON "public"."activity_log" USING "btree" ("organization_id", "created_at" DESC);



CREATE INDEX "idx_activity_log_project_created" ON "public"."activity_log" USING "btree" ("project_id", "created_at" DESC);



CREATE INDEX "idx_activity_log_user_created" ON "public"."activity_log" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_approvals_active" ON "public"."approvals" USING "btree" ("organization_id", "status", "requested_at" DESC) WHERE ("status" = ANY (ARRAY['pending'::"public"."approval_status", 'in_review'::"public"."approval_status"]));



CREATE INDEX "idx_approvals_current_approver" ON "public"."approvals" USING "btree" ("current_approver_id");



CREATE INDEX "idx_approvals_due" ON "public"."approvals" USING "btree" ("sla_due_at");



CREATE INDEX "idx_approvals_entity" ON "public"."approvals" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_approvals_org_status" ON "public"."approvals" USING "btree" ("organization_id", "status");



CREATE INDEX "idx_approvals_priority_status" ON "public"."approvals" USING "btree" ("priority", "status");



CREATE INDEX "idx_approvals_requested_at" ON "public"."approvals" USING "btree" ("requested_at" DESC);



CREATE INDEX "idx_approvals_sla_due" ON "public"."approvals" USING "btree" ("sla_due_at") WHERE ("sla_due_at" IS NOT NULL);



CREATE INDEX "idx_approvals_status" ON "public"."approvals" USING "btree" ("status");



CREATE INDEX "idx_approvals_type_status" ON "public"."approvals" USING "btree" ("approval_type", "status");



CREATE INDEX "idx_contacts_created_by" ON "public"."contacts" USING "btree" ("created_by");



CREATE INDEX "idx_contacts_email" ON "public"."contacts" USING "btree" ("email");



CREATE INDEX "idx_contacts_org_type" ON "public"."contacts" USING "btree" ("organization_id", "type");



CREATE INDEX "idx_custom_roles_org_active" ON "public"."custom_roles" USING "btree" ("organization_id", "is_active");



CREATE INDEX "idx_document_versions_current" ON "public"."document_versions" USING "btree" ("document_id", "is_current");



CREATE INDEX "idx_documents_category_version" ON "public"."documents" USING "btree" ("category", "is_current_version");



CREATE INDEX "idx_documents_org_project" ON "public"."documents" USING "btree" ("organization_id", "project_id");



CREATE INDEX "idx_documents_uploaded_at" ON "public"."documents" USING "btree" ("uploaded_by", "created_at" DESC);



CREATE INDEX "idx_feature_toggles_org_key" ON "public"."feature_toggles" USING "btree" ("organization_id", "feature_key");



CREATE INDEX "idx_messages_project_created" ON "public"."messages" USING "btree" ("project_id", "created_at" DESC);



CREATE UNIQUE INDEX "idx_mv_user_workload_user" ON "public"."mv_user_workload" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("user_id", "is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_notifications_unread_user" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC) WHERE ("is_read" = false);



CREATE INDEX "idx_notifications_user_created" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_organizations_active" ON "public"."organizations" USING "btree" ("is_active");



CREATE INDEX "idx_organizations_created_by" ON "public"."organizations" USING "btree" ("created_by");



CREATE INDEX "idx_organizations_slug" ON "public"."organizations" USING "btree" ("slug");



CREATE INDEX "idx_permission_audit_org_timestamp" ON "public"."permission_audit_log" USING "btree" ("organization_id", "created_at" DESC);



CREATE INDEX "idx_permissions_resource_action" ON "public"."permissions" USING "btree" ("resource", "action");



CREATE INDEX "idx_projects_active" ON "public"."projects" USING "btree" ("organization_id", "status", "created_at" DESC) WHERE ("status" <> ALL (ARRAY['cancelled'::"public"."project_status", 'completed'::"public"."project_status"]));



CREATE INDEX "idx_projects_assigned_status" ON "public"."projects" USING "btree" ("assigned_to", "status");



CREATE INDEX "idx_projects_created_at" ON "public"."projects" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_projects_created_org" ON "public"."projects" USING "btree" ("created_at" DESC, "organization_id");



CREATE INDEX "idx_projects_customer" ON "public"."projects" USING "btree" ("customer_organization_id");



CREATE INDEX "idx_projects_definition" ON "public"."projects" USING "btree" ("workflow_definition_id");



CREATE INDEX "idx_projects_org" ON "public"."projects" USING "btree" ("organization_id");



CREATE INDEX "idx_projects_org_customer" ON "public"."projects" USING "btree" ("organization_id", "customer_organization_id");



CREATE INDEX "idx_projects_org_status" ON "public"."projects" USING "btree" ("organization_id", "status");



CREATE INDEX "idx_projects_priority_due" ON "public"."projects" USING "btree" ("priority_level", "estimated_delivery_date");



CREATE INDEX "idx_projects_stage" ON "public"."projects" USING "btree" ("current_stage_id");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_pssp_active" ON "public"."project_sub_stage_progress" USING "btree" ("project_id", "status", "created_at" DESC) WHERE ("status" <> ALL (ARRAY['completed'::"public"."sub_stage_status", 'skipped'::"public"."sub_stage_status"]));



CREATE INDEX "idx_pssp_assigned_status" ON "public"."project_sub_stage_progress" USING "btree" ("assigned_to", "status");



CREATE INDEX "idx_pssp_due" ON "public"."project_sub_stage_progress" USING "btree" ("due_at");



CREATE INDEX "idx_pssp_due_status" ON "public"."project_sub_stage_progress" USING "btree" ("due_at", "status") WHERE ("due_at" IS NOT NULL);



CREATE INDEX "idx_pssp_project" ON "public"."project_sub_stage_progress" USING "btree" ("project_id");



CREATE INDEX "idx_pssp_project_status" ON "public"."project_sub_stage_progress" USING "btree" ("project_id", "status");



CREATE INDEX "idx_pssp_stage" ON "public"."project_sub_stage_progress" USING "btree" ("project_id", "workflow_stage_id");



CREATE INDEX "idx_pssp_stage_status" ON "public"."project_sub_stage_progress" USING "btree" ("workflow_stage_id", "status");



CREATE INDEX "idx_pssp_status" ON "public"."project_sub_stage_progress" USING "btree" ("status");



CREATE INDEX "idx_reviews_organization_id" ON "public"."reviews" USING "btree" ("organization_id");



CREATE INDEX "idx_reviews_project_id" ON "public"."reviews" USING "btree" ("project_id");



CREATE INDEX "idx_reviews_reviewer_id" ON "public"."reviews" USING "btree" ("reviewer_id");



CREATE INDEX "idx_reviews_status" ON "public"."reviews" USING "btree" ("status");



CREATE INDEX "idx_role_permissions_role" ON "public"."role_permissions" USING "btree" ("custom_role_id");



CREATE INDEX "idx_user_custom_roles_expires" ON "public"."user_custom_roles" USING "btree" ("expires_at") WHERE ("expires_at" IS NOT NULL);



CREATE INDEX "idx_user_custom_roles_user" ON "public"."user_custom_roles" USING "btree" ("user_id");



CREATE INDEX "idx_user_feature_access_user" ON "public"."user_feature_access" USING "btree" ("user_id");



CREATE INDEX "idx_user_permissions_expires" ON "public"."user_permissions" USING "btree" ("expires_at") WHERE ("expires_at" IS NOT NULL);



CREATE INDEX "idx_user_permissions_user" ON "public"."user_permissions" USING "btree" ("user_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_org" ON "public"."users" USING "btree" ("organization_id");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_workflow_stages_org_order" ON "public"."workflow_stages" USING "btree" ("organization_id", "stage_order");



CREATE INDEX "idx_workflow_sub_stages_active" ON "public"."workflow_sub_stages" USING "btree" ("is_active");



CREATE INDEX "idx_workflow_sub_stages_stage_order" ON "public"."workflow_sub_stages" USING "btree" ("workflow_stage_id", "sub_stage_order");



CREATE OR REPLACE TRIGGER "refresh_user_custom_roles_cache_on_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_custom_roles" FOR EACH ROW EXECUTE FUNCTION "public"."refresh_permissions_cache_trigger"();



CREATE OR REPLACE TRIGGER "refresh_user_feature_access_cache_on_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_feature_access" FOR EACH ROW EXECUTE FUNCTION "public"."refresh_permissions_cache_trigger"();



CREATE OR REPLACE TRIGGER "refresh_user_permissions_cache_on_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."refresh_permissions_cache_trigger"();



CREATE OR REPLACE TRIGGER "set_contacts_created_by" BEFORE INSERT ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."set_created_by"();



CREATE OR REPLACE TRIGGER "set_organizations_created_by" BEFORE INSERT ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."set_created_by"();



CREATE OR REPLACE TRIGGER "update_approval_history_updated_at" BEFORE UPDATE ON "public"."approval_history" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_approvals_updated_at" BEFORE UPDATE ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contacts_updated_at" BEFORE UPDATE ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_custom_roles_updated_at" BEFORE UPDATE ON "public"."custom_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_document_versions_updated_at" BEFORE UPDATE ON "public"."document_versions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_documents_updated_at" BEFORE UPDATE ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_feature_toggles_updated_at" BEFORE UPDATE ON "public"."feature_toggles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_permissions_updated_at" BEFORE UPDATE ON "public"."permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflow_definitions_updated_at" BEFORE UPDATE ON "public"."workflow_definitions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflow_stages_updated_at" BEFORE UPDATE ON "public"."workflow_stages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflow_sub_stages_updated_at" BEFORE UPDATE ON "public"."workflow_sub_stages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approval_attachments"
    ADD CONSTRAINT "approval_attachments_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_attachments"
    ADD CONSTRAINT "approval_attachments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_attachments"
    ADD CONSTRAINT "approval_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_current_approver_id_fkey" FOREIGN KEY ("current_approver_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_delegated_from_fkey" FOREIGN KEY ("delegated_from") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_delegated_to_fkey" FOREIGN KEY ("delegated_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



COMMENT ON CONSTRAINT "approvals_entity_id_fkey" ON "public"."approvals" IS 'Foreign key constraint linking entity_id to projects table for proper joins';



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_escalated_from_fkey" FOREIGN KEY ("escalated_from") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_escalated_to_fkey" FOREIGN KEY ("escalated_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."custom_roles"
    ADD CONSTRAINT "custom_roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."custom_roles"
    ADD CONSTRAINT "custom_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_log"
    ADD CONSTRAINT "document_access_log_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_log"
    ADD CONSTRAINT "document_access_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_log"
    ADD CONSTRAINT "document_access_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."feature_toggles"
    ADD CONSTRAINT "feature_toggles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."feature_toggles"
    ADD CONSTRAINT "feature_toggles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "public"."messages"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."permission_audit_log"
    ADD CONSTRAINT "permission_audit_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."permission_audit_log"
    ADD CONSTRAINT "permission_audit_log_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."permission_audit_log"
    ADD CONSTRAINT "permission_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_sub_stage_id_fkey" FOREIGN KEY ("sub_stage_id") REFERENCES "public"."workflow_sub_stages"("id");



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_workflow_stage_id_fkey" FOREIGN KEY ("workflow_stage_id") REFERENCES "public"."workflow_stages"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_current_stage_id_fkey" FOREIGN KEY ("current_stage_id") REFERENCES "public"."workflow_stages"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_customer_organization_id_fkey" FOREIGN KEY ("customer_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "public"."workflow_definitions"("id");



ALTER TABLE ONLY "public"."review_checklist_items"
    ADD CONSTRAINT "review_checklist_items_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."review_checklist_items"
    ADD CONSTRAINT "review_checklist_items_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_custom_role_id_fkey" FOREIGN KEY ("custom_role_id") REFERENCES "public"."custom_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_custom_roles"
    ADD CONSTRAINT "user_custom_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_custom_roles"
    ADD CONSTRAINT "user_custom_roles_custom_role_id_fkey" FOREIGN KEY ("custom_role_id") REFERENCES "public"."custom_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_custom_roles"
    ADD CONSTRAINT "user_custom_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_feature_access"
    ADD CONSTRAINT "user_feature_access_feature_toggle_id_fkey" FOREIGN KEY ("feature_toggle_id") REFERENCES "public"."feature_toggles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_feature_access"
    ADD CONSTRAINT "user_feature_access_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_feature_access"
    ADD CONSTRAINT "user_feature_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_definition_stages"
    ADD CONSTRAINT "workflow_definition_stages_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "public"."workflow_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_definition_stages"
    ADD CONSTRAINT "workflow_definition_stages_workflow_stage_id_fkey" FOREIGN KEY ("workflow_stage_id") REFERENCES "public"."workflow_stages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_definition_sub_stages"
    ADD CONSTRAINT "workflow_definition_sub_stages_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "public"."workflow_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_definition_sub_stages"
    ADD CONSTRAINT "workflow_definition_sub_stages_workflow_sub_stage_id_fkey" FOREIGN KEY ("workflow_sub_stage_id") REFERENCES "public"."workflow_sub_stages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_definitions"
    ADD CONSTRAINT "workflow_definitions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."workflow_definitions"
    ADD CONSTRAINT "workflow_definitions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_stages"
    ADD CONSTRAINT "workflow_stages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_sub_stages"
    ADD CONSTRAINT "workflow_sub_stages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_sub_stages"
    ADD CONSTRAINT "workflow_sub_stages_workflow_stage_id_fkey" FOREIGN KEY ("workflow_stage_id") REFERENCES "public"."workflow_stages"("id") ON DELETE CASCADE;



CREATE POLICY "Users can insert contacts" ON "public"."contacts" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("created_by" = "auth"."uid"())));



CREATE POLICY "Users can insert users" ON "public"."users" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update contacts" ON "public"."contacts" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update users" ON "public"."users" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view contacts" ON "public"."contacts" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND (("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."organizations" "o"
     JOIN "public"."users" "u" ON (("u"."organization_id" = "o"."id")))
  WHERE (("o"."id" = "contacts"."organization_id") AND ("u"."id" = "auth"."uid"()) AND ("u"."role" = ANY (ARRAY['admin'::"text", 'management'::"text"]))))))));



CREATE POLICY "Users can view users" ON "public"."users" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "activity_log_insert_policy" ON "public"."activity_log" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "activity_log_select_policy" ON "public"."activity_log" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "approval_attachments_insert_policy" ON "public"."approval_attachments" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approval_attachments_select_policy" ON "public"."approval_attachments" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approval_history_insert_policy" ON "public"."approval_history" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approval_history_select_policy" ON "public"."approval_history" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approvals_insert_policy" ON "public"."approvals" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approvals_select_policy" ON "public"."approvals" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approvals_update_policy" ON "public"."approvals" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "contacts_insert_policy" ON "public"."contacts" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "contacts_select_policy" ON "public"."contacts" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "contacts_update_policy" ON "public"."contacts" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."custom_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "custom_roles_org_policy" ON "public"."custom_roles" USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "document_access_log_insert_policy" ON "public"."document_access_log" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "document_access_log_select_policy" ON "public"."document_access_log" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "document_versions_insert_policy" ON "public"."document_versions" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "document_versions_select_policy" ON "public"."document_versions" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "documents_insert_policy" ON "public"."documents" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "documents_select_policy" ON "public"."documents" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "documents_update_policy" ON "public"."documents" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."feature_toggles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "feature_toggles_org_policy" ON "public"."feature_toggles" USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "messages_insert_policy" ON "public"."messages" FOR INSERT WITH CHECK ((("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")) AND ("sender_id" = "auth"."uid"())));



CREATE POLICY "messages_select_policy" ON "public"."messages" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "notifications_insert_policy" ON "public"."notifications" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "notifications_select_policy" ON "public"."notifications" FOR SELECT USING ((("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "notifications_update_policy" ON "public"."notifications" FOR UPDATE USING ((("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "organizations_access" ON "public"."organizations" USING (true);



ALTER TABLE "public"."permission_audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "permission_audit_org_policy" ON "public"."permission_audit_log" USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "permissions_admin_policy" ON "public"."permissions" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = ANY (ARRAY['admin'::"text", 'management'::"text"]))))));



CREATE POLICY "progress_insert_policy" ON "public"."project_sub_stage_progress" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "progress_select_policy" ON "public"."project_sub_stage_progress" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "progress_update_policy" ON "public"."project_sub_stage_progress" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "projects_insert_policy" ON "public"."projects" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "projects_select_policy" ON "public"."projects" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "projects_update_policy" ON "public"."projects" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."review_checklist_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "review_checklist_items_delete_policy" ON "public"."review_checklist_items" FOR DELETE USING (("review_id" IN ( SELECT "reviews"."id"
   FROM "public"."reviews"
  WHERE ("reviews"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



CREATE POLICY "review_checklist_items_insert_policy" ON "public"."review_checklist_items" FOR INSERT WITH CHECK (("review_id" IN ( SELECT "reviews"."id"
   FROM "public"."reviews"
  WHERE ("reviews"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



CREATE POLICY "review_checklist_items_select_policy" ON "public"."review_checklist_items" FOR SELECT USING (("review_id" IN ( SELECT "reviews"."id"
   FROM "public"."reviews"
  WHERE ("reviews"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



CREATE POLICY "review_checklist_items_update_policy" ON "public"."review_checklist_items" FOR UPDATE USING (("review_id" IN ( SELECT "reviews"."id"
   FROM "public"."reviews"
  WHERE ("reviews"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reviews_delete_policy" ON "public"."reviews" FOR DELETE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "reviews_insert_policy" ON "public"."reviews" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "reviews_select_policy" ON "public"."reviews" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "reviews_update_policy" ON "public"."reviews" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "role_permissions_org_policy" ON "public"."role_permissions" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_roles" "cr"
  WHERE (("cr"."id" = "role_permissions"."custom_role_id") AND ("cr"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id"))))));



ALTER TABLE "public"."user_custom_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_custom_roles_org_policy" ON "public"."user_custom_roles" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_custom_roles"."user_id") AND ("u"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id"))))));



ALTER TABLE "public"."user_feature_access" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_feature_access_org_policy" ON "public"."user_feature_access" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_feature_access"."user_id") AND ("u"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id"))))));



ALTER TABLE "public"."user_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_permissions_org_policy" ON "public"."user_permissions" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_permissions"."user_id") AND ("u"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id"))))));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_policy" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "users_select_policy" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "users_update_policy" ON "public"."users" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "workflow_definition_stages_insert_policy" ON "public"."workflow_definition_stages" FOR INSERT TO "authenticated" WITH CHECK (("workflow_definition_id" IN ( SELECT "workflow_definitions"."id"
   FROM "public"."workflow_definitions"
  WHERE ("workflow_definitions"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



CREATE POLICY "workflow_definition_stages_select_policy" ON "public"."workflow_definition_stages" FOR SELECT TO "authenticated" USING (("workflow_definition_id" IN ( SELECT "workflow_definitions"."id"
   FROM "public"."workflow_definitions"
  WHERE ("workflow_definitions"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



CREATE POLICY "workflow_definition_stages_update_policy" ON "public"."workflow_definition_stages" FOR UPDATE TO "authenticated" USING (("workflow_definition_id" IN ( SELECT "workflow_definitions"."id"
   FROM "public"."workflow_definitions"
  WHERE ("workflow_definitions"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id"))))) WITH CHECK (("workflow_definition_id" IN ( SELECT "workflow_definitions"."id"
   FROM "public"."workflow_definitions"
  WHERE ("workflow_definitions"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



CREATE POLICY "workflow_definition_sub_stages_insert_policy" ON "public"."workflow_definition_sub_stages" FOR INSERT TO "authenticated" WITH CHECK (("workflow_definition_id" IN ( SELECT "workflow_definitions"."id"
   FROM "public"."workflow_definitions"
  WHERE ("workflow_definitions"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



CREATE POLICY "workflow_definition_sub_stages_select_policy" ON "public"."workflow_definition_sub_stages" FOR SELECT TO "authenticated" USING (("workflow_definition_id" IN ( SELECT "workflow_definitions"."id"
   FROM "public"."workflow_definitions"
  WHERE ("workflow_definitions"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



CREATE POLICY "workflow_definition_sub_stages_update_policy" ON "public"."workflow_definition_sub_stages" FOR UPDATE TO "authenticated" USING (("workflow_definition_id" IN ( SELECT "workflow_definitions"."id"
   FROM "public"."workflow_definitions"
  WHERE ("workflow_definitions"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id"))))) WITH CHECK (("workflow_definition_id" IN ( SELECT "workflow_definitions"."id"
   FROM "public"."workflow_definitions"
  WHERE ("workflow_definitions"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")))));



CREATE POLICY "workflow_definitions_insert_policy" ON "public"."workflow_definitions" FOR INSERT TO "authenticated" WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_definitions_select_policy" ON "public"."workflow_definitions" FOR SELECT TO "authenticated" USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_definitions_update_policy" ON "public"."workflow_definitions" FOR UPDATE TO "authenticated" USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id"))) WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."workflow_stages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workflow_stages_insert_policy" ON "public"."workflow_stages" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_stages_select_policy" ON "public"."workflow_stages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "workflow_stages_update_policy" ON "public"."workflow_stages" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."workflow_sub_stages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workflow_sub_stages_insert_policy" ON "public"."workflow_sub_stages" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_sub_stages_select_policy" ON "public"."workflow_sub_stages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "workflow_sub_stages_update_policy" ON "public"."workflow_sub_stages" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."delete_all_inactive_organizations"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_all_inactive_organizations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_all_inactive_organizations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."dev_get_contacts_by_org"("org_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."dev_get_contacts_by_org"("org_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."dev_get_contacts_by_org"("org_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."dev_get_project_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."dev_get_project_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."dev_get_project_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."dev_get_user_tasks"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."dev_get_user_tasks"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."dev_get_user_tasks"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_project_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_project_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_project_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_combined_user_data"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_combined_user_data"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_combined_user_data"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_org_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_org_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_org_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_kpis"("p_org_id" "uuid", "p_days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_kpis"("p_org_id" "uuid", "p_days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_kpis"("p_org_id" "uuid", "p_days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_summary_test"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_summary_test"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_summary_test"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_project_progress_summary"("p_project_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_project_progress_summary"("p_project_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_project_progress_summary"("p_project_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_org_simple"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_org_simple"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_org_simple"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_users_by_organization"("p_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_users_by_organization"("p_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_users_by_organization"("p_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_user_feature_access"("p_user_id" "uuid", "p_feature_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_user_feature_access"("p_user_id" "uuid", "p_feature_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_user_feature_access"("p_user_id" "uuid", "p_feature_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_user_permission"("p_user_id" "uuid", "p_permission" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_user_permission"("p_user_id" "uuid", "p_permission" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_user_permission"("p_user_id" "uuid", "p_permission" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_user_permission_enhanced"("p_user_id" "uuid", "p_resource" "text", "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_user_permission_enhanced"("p_user_id" "uuid", "p_resource" "text", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_user_permission_enhanced"("p_user_id" "uuid", "p_resource" "text", "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_permission_change"("p_user_id" "uuid", "p_target_user_id" "uuid", "p_action_type" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_old_values" "jsonb", "p_new_values" "jsonb", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_permission_change"("p_user_id" "uuid", "p_target_user_id" "uuid", "p_action_type" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_old_values" "jsonb", "p_new_values" "jsonb", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_permission_change"("p_user_id" "uuid", "p_target_user_id" "uuid", "p_action_type" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_old_values" "jsonb", "p_new_values" "jsonb", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_dashboard_materialized_views"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_dashboard_materialized_views"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_dashboard_materialized_views"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_permissions_cache_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_permissions_cache_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_permissions_cache_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_user_permissions_cache"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_user_permissions_cache"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_user_permissions_cache"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_created_by"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_created_by"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_created_by"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_updates" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_updates" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_updates" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."approval_attachments" TO "anon";
GRANT ALL ON TABLE "public"."approval_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."approval_history" TO "anon";
GRANT ALL ON TABLE "public"."approval_history" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_history" TO "service_role";



GRANT ALL ON TABLE "public"."approvals" TO "anon";
GRANT ALL ON TABLE "public"."approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."approvals" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON TABLE "public"."custom_roles" TO "anon";
GRANT ALL ON TABLE "public"."custom_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_roles" TO "service_role";



GRANT ALL ON TABLE "public"."document_access_log" TO "anon";
GRANT ALL ON TABLE "public"."document_access_log" TO "authenticated";
GRANT ALL ON TABLE "public"."document_access_log" TO "service_role";



GRANT ALL ON TABLE "public"."document_versions" TO "anon";
GRANT ALL ON TABLE "public"."document_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."document_versions" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."feature_toggles" TO "anon";
GRANT ALL ON TABLE "public"."feature_toggles" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_toggles" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."project_sub_stage_progress" TO "anon";
GRANT ALL ON TABLE "public"."project_sub_stage_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."project_sub_stage_progress" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."mv_user_workload" TO "anon";
GRANT ALL ON TABLE "public"."mv_user_workload" TO "authenticated";
GRANT ALL ON TABLE "public"."mv_user_workload" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."permission_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."permission_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."permission_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."review_checklist_items" TO "anon";
GRANT ALL ON TABLE "public"."review_checklist_items" TO "authenticated";
GRANT ALL ON TABLE "public"."review_checklist_items" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."user_custom_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_custom_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_custom_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_feature_access" TO "anon";
GRANT ALL ON TABLE "public"."user_feature_access" TO "authenticated";
GRANT ALL ON TABLE "public"."user_feature_access" TO "service_role";



GRANT ALL ON TABLE "public"."user_permissions" TO "anon";
GRANT ALL ON TABLE "public"."user_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."v_approval_queue" TO "anon";
GRANT ALL ON TABLE "public"."v_approval_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."v_approval_queue" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_definition_stages" TO "anon";
GRANT ALL ON TABLE "public"."workflow_definition_stages" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_definition_stages" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_definition_sub_stages" TO "anon";
GRANT ALL ON TABLE "public"."workflow_definition_sub_stages" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_definition_sub_stages" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_definitions" TO "anon";
GRANT ALL ON TABLE "public"."workflow_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_stages" TO "anon";
GRANT ALL ON TABLE "public"."workflow_stages" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_stages" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_sub_stages" TO "anon";
GRANT ALL ON TABLE "public"."workflow_sub_stages" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_sub_stages" TO "service_role";



GRANT ALL ON TABLE "public"."v_current_stage_progress" TO "anon";
GRANT ALL ON TABLE "public"."v_current_stage_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."v_current_stage_progress" TO "service_role";



GRANT ALL ON TABLE "public"."v_project_detail" TO "anon";
GRANT ALL ON TABLE "public"."v_project_detail" TO "authenticated";
GRANT ALL ON TABLE "public"."v_project_detail" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
