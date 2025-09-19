

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


CREATE SCHEMA IF NOT EXISTS "auth";


ALTER SCHEMA "auth" OWNER TO "supabase_admin";


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "storage";


ALTER SCHEMA "storage" OWNER TO "supabase_admin";


CREATE TYPE "auth"."aal_level" AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE "auth"."aal_level" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."code_challenge_method" AS ENUM (
    's256',
    'plain'
);


ALTER TYPE "auth"."code_challenge_method" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_status" AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE "auth"."factor_status" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_type" AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE "auth"."factor_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_registration_type" AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE "auth"."oauth_registration_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."one_time_token_type" AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE "auth"."one_time_token_type" OWNER TO "supabase_auth_admin";


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
    'other',
    'supplier_nda',
    'supplier_iso',
    'supplier_insurance',
    'supplier_financial',
    'supplier_qc',
    'supplier_profile',
    'supplier_logo',
    'supplier_qualified_image',
    'supplier_external_link'
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


CREATE TYPE "public"."supplier_qualification_status" AS ENUM (
    'not_started',
    'in_progress',
    'pending_approval',
    'qualified',
    'qualified_with_conditions',
    'qualified_as_exception',
    'rejected',
    'expired'
);


ALTER TYPE "public"."supplier_qualification_status" OWNER TO "postgres";


CREATE TYPE "public"."supplier_quote_status" AS ENUM (
    'sent',
    'received',
    'rejected',
    'accepted',
    'expired',
    'cancelled'
);


ALTER TYPE "public"."supplier_quote_status" OWNER TO "postgres";


CREATE TYPE "public"."supplier_rfq_status" AS ENUM (
    'draft',
    'sent',
    'viewed',
    'quoted',
    'declined',
    'expired',
    'cancelled'
);


ALTER TYPE "public"."supplier_rfq_status" OWNER TO "postgres";


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


CREATE TYPE "storage"."buckettype" AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE "storage"."buckettype" OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "auth"."email"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION "auth"."email"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."email"() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';



CREATE OR REPLACE FUNCTION "auth"."jwt"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION "auth"."jwt"() OWNER TO "supabase_auth_admin";


CREATE OR REPLACE FUNCTION "auth"."role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION "auth"."role"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."role"() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';



CREATE OR REPLACE FUNCTION "auth"."uid"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION "auth"."uid"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."uid"() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';



CREATE OR REPLACE FUNCTION "public"."approve_supplier_qualification"("supplier_org_id" "uuid", "approver_id" "uuid", "decision_type" "text", "conditions" "text" DEFAULT NULL::"text", "exception_justification" "text" DEFAULT NULL::"text", "escalated_to" "uuid" DEFAULT NULL::"uuid", "review_due_date" "date" DEFAULT NULL::"date", "attached_document_id" "uuid" DEFAULT NULL::"uuid", "overall_score" numeric DEFAULT NULL::numeric, "criteria_scores" "jsonb" DEFAULT '{}'::"jsonb") RETURNS json
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update supplier_qualifications table with approval details
    UPDATE public.supplier_qualifications
    SET 
        qualification_status = CASE 
            WHEN decision_type = 'approve' THEN 'qualified'
            WHEN decision_type = 'partial' THEN 'qualified_with_conditions'
            WHEN decision_type = 'exception' THEN 'qualified_as_exception'
            WHEN decision_type = 'reject' THEN 'rejected'
            ELSE qualification_status
        END,
        qualification_conditions = CASE 
            WHEN decision_type = 'partial' THEN conditions 
            ELSE qualification_conditions 
        END,
        qualification_exception_justification = CASE 
            WHEN decision_type = 'exception' THEN exception_justification 
            ELSE qualification_exception_justification 
        END,
        qualification_exception_expires_at = CASE 
            WHEN decision_type = 'exception' THEN review_due_date 
            ELSE qualification_exception_expires_at 
        END,
        qualification_exception_reviewed_by = CASE 
            WHEN decision_type = 'exception' THEN escalated_to 
            ELSE qualification_exception_reviewed_by 
        END,
        overall_score = overall_score,
        criteria_scores = criteria_scores,
        approved_by = approver_id,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE organization_id = supplier_org_id;

    -- Log approval in activity_log
    INSERT INTO public.activity_log (
        organization_id,
        user_id,
        entity_type,
        entity_id,
        action,
        description,
        metadata
    ) VALUES (
        (SELECT organization_id FROM public.organizations WHERE id = supplier_org_id),
        approver_id,
        'supplier_qualification',
        supplier_org_id::TEXT,
        'approved',
        'Supplier qualification ' || decision_type || ' decision made',
        json_build_object(
            'decision_type', decision_type,
            'conditions', conditions,
            'exception_justification', exception_justification,
            'escalated_to', escalated_to,
            'review_due_date', review_due_date,
            'attached_document_id', attached_document_id,
            'overall_score', overall_score,
            'criteria_scores', criteria_scores
        )
    );

    -- Log approval in approval_history if there's a related approval
    INSERT INTO public.approval_history (
        organization_id,
        approval_id,
        user_id,
        action,
        old_status,
        new_status,
        comments,
        metadata
    )
    SELECT 
        a.organization_id,
        a.id,
        approver_id,
        'approved',
        a.status,
        CASE 
            WHEN decision_type = 'approve' THEN 'approved'::approval_status
            WHEN decision_type = 'partial' THEN 'approved'::approval_status
            WHEN decision_type = 'exception' THEN 'approved'::approval_status
            WHEN decision_type = 'reject' THEN 'rejected'::approval_status
            ELSE a.status
        END,
        'Supplier qualification ' || decision_type || ' decision',
        json_build_object(
            'decision_type', decision_type,
            'conditions', conditions,
            'exception_justification', exception_justification
        )
    FROM public.approvals a
    WHERE a.entity_type = 'supplier_qualification'
        AND a.entity_id = supplier_org_id
        AND a.status IN ('pending', 'in_review')
    LIMIT 1;

    RETURN json_build_object(
        'status', 'success',
        'message', 'Supplier qualification approval processed successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'message', SQLERRM
        );
END;
$$;


ALTER FUNCTION "public"."approve_supplier_qualification"("supplier_org_id" "uuid", "approver_id" "uuid", "decision_type" "text", "conditions" "text", "exception_justification" "text", "escalated_to" "uuid", "review_due_date" "date", "attached_document_id" "uuid", "overall_score" numeric, "criteria_scores" "jsonb") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."get_document_url"("file_path" "text", "expires_in" integer DEFAULT 3600) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    signed_url text;
BEGIN
    -- Verify user has access to this file
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.organization_id::text = (storage.foldername(file_path))[1]
    ) THEN
        RAISE EXCEPTION 'Access denied to file: %', file_path;
    END IF;
    
    -- Generate signed URL (this would need to be implemented with actual Supabase storage API)
    -- For now, return the file path - the frontend will need to use Supabase client to get signed URLs
    RETURN file_path;
END;
$$;


ALTER FUNCTION "public"."get_document_url"("file_path" "text", "expires_in" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_or_create_bootstrap_org"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    bootstrap_org_id uuid;
BEGIN
    -- Check if we already have an organization
    SELECT id INTO bootstrap_org_id FROM organizations LIMIT 1;
    
    IF bootstrap_org_id IS NOT NULL THEN
        RETURN bootstrap_org_id;
    END IF;
    
    -- Create bootstrap organization (no created_by initially)
    INSERT INTO organizations (
        id,
        name,
        slug,
        description,
        organization_type,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Bootstrap Organization',
        'bootstrap',
        'Temporary organization for bootstrap process',
        'internal',
        true,
        now(),
        now()
    ) RETURNING id INTO bootstrap_org_id;
    
    RETURN bootstrap_org_id;
END;
$$;


ALTER FUNCTION "public"."get_or_create_bootstrap_org"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."get_secure_document_url"("document_id" "uuid", "expires_in" integer DEFAULT 3600) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    doc_record record;
    signed_url text;
BEGIN
    -- Get document record
    SELECT * INTO doc_record 
    FROM public.documents 
    WHERE id = document_id;
    
    -- Check if document exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document not found: %', document_id;
    END IF;
    
    -- Verify user has access
    IF NOT verify_document_access(doc_record.organization_id, doc_record.project_id) THEN
        RAISE EXCEPTION 'Access denied to document: %', document_id;
    END IF;
    
    -- Return the file path - frontend will use Supabase client to get signed URL
    RETURN doc_record.file_path;
END;
$$;


ALTER FUNCTION "public"."get_secure_document_url"("document_id" "uuid", "expires_in" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_secure_document_url"("document_id" "uuid", "expires_in" integer) IS 'Returns the file path for a document if the user has access. Frontend should use Supabase client to get signed URLs for private storage';



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


CREATE OR REPLACE FUNCTION "public"."start_supplier_qualification"("supplier_org_id" "uuid") RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    qualification_id UUID;
BEGIN
    -- Insert or update supplier qualification record
    INSERT INTO public.supplier_qualifications (organization_id, qualification_status)
    VALUES (supplier_org_id, 'in_progress')
    ON CONFLICT (organization_id)
    DO UPDATE SET 
        qualification_status = 'in_progress', 
        updated_at = NOW()
    RETURNING id INTO qualification_id;
    
    -- Insert 5 sub-stage records if they don't exist
    INSERT INTO public.supplier_qualification_progress 
        (organization_id, supplier_id, sub_stage_slug, status)
    SELECT 
        supplier_org_id,
        c.id,
        sub_stage,
        'pending'
    FROM public.contacts c
    CROSS JOIN (
        VALUES 
        ('profile_complete'),
        ('nda_signed'),
        ('docs_uploaded'),
        ('internal_review'),
        ('final_approval')
    ) AS sub_stages(sub_stage)
    WHERE c.organization_id = supplier_org_id 
        AND c.type = 'supplier'
        AND NOT EXISTS (
            SELECT 1 FROM public.supplier_qualification_progress sqp
            WHERE sqp.supplier_id = c.id 
                AND sqp.sub_stage_slug = sub_stages.sub_stage
        )
    ON CONFLICT DO NOTHING;
    
    RETURN json_build_object(
        'status', 'success',
        'qualification_id', qualification_id,
        'message', 'Supplier qualification process started successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'message', SQLERRM
        );
END;
$$;


ALTER FUNCTION "public"."start_supplier_qualification"("supplier_org_id" "uuid") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."verify_document_access"("document_org_id" "uuid", "document_project_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_org_id uuid;
    user_id uuid;
BEGIN
    -- Get current user info
    user_id := auth.uid();
    IF user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get user's organization
    SELECT organization_id INTO user_org_id 
    FROM public.users 
    WHERE id = user_id;
    
    -- User must be in the same organization as the document
    IF user_org_id != document_org_id THEN
        RETURN false;
    END IF;
    
    -- Additional checks can be added here for project-specific access
    -- For now, organization-level access is sufficient
    
    RETURN true;
END;
$$;


ALTER FUNCTION "public"."verify_document_access"("document_org_id" "uuid", "document_project_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."verify_document_access"("document_org_id" "uuid", "document_project_id" "uuid") IS 'Verifies that the current user has access to a document based on organization membership';



CREATE OR REPLACE FUNCTION "storage"."add_prefixes"("_bucket_id" "text", "_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION "storage"."add_prefixes"("_bucket_id" "text", "_name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."can_insert_object"("bucketid" "text", "name" "text", "owner" "uuid", "metadata" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION "storage"."can_insert_object"("bucketid" "text", "name" "text", "owner" "uuid", "metadata" "jsonb") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."delete_prefix"("_bucket_id" "text", "_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION "storage"."delete_prefix"("_bucket_id" "text", "_name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."delete_prefix_hierarchy_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION "storage"."delete_prefix_hierarchy_trigger"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."enforce_bucket_name_length"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION "storage"."enforce_bucket_name_length"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."extension"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION "storage"."extension"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."filename"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION "storage"."filename"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."foldername"("name" "text") RETURNS "text"[]
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION "storage"."foldername"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."get_level"("name" "text") RETURNS integer
    LANGUAGE "sql" IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION "storage"."get_level"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."get_prefix"("name" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION "storage"."get_prefix"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."get_prefixes"("name" "text") RETURNS "text"[]
    LANGUAGE "plpgsql" IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION "storage"."get_prefixes"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."get_size_by_bucket"() RETURNS TABLE("size" bigint, "bucket_id" "text")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION "storage"."get_size_by_bucket"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."list_multipart_uploads_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer DEFAULT 100, "next_key_token" "text" DEFAULT ''::"text", "next_upload_token" "text" DEFAULT ''::"text") RETURNS TABLE("key" "text", "id" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION "storage"."list_multipart_uploads_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer, "next_key_token" "text", "next_upload_token" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."list_objects_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer DEFAULT 100, "start_after" "text" DEFAULT ''::"text", "next_token" "text" DEFAULT ''::"text") RETURNS TABLE("name" "text", "id" "uuid", "metadata" "jsonb", "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION "storage"."list_objects_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer, "start_after" "text", "next_token" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."objects_insert_prefix_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION "storage"."objects_insert_prefix_trigger"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."objects_update_prefix_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION "storage"."objects_update_prefix_trigger"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."operation"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION "storage"."operation"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."prefixes_insert_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION "storage"."prefixes_insert_trigger"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."search"("prefix" "text", "bucketname" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "offsets" integer DEFAULT 0, "search" "text" DEFAULT ''::"text", "sortcolumn" "text" DEFAULT 'name'::"text", "sortorder" "text" DEFAULT 'asc'::"text") RETURNS TABLE("name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION "storage"."search"("prefix" "text", "bucketname" "text", "limits" integer, "levels" integer, "offsets" integer, "search" "text", "sortcolumn" "text", "sortorder" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."search_legacy_v1"("prefix" "text", "bucketname" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "offsets" integer DEFAULT 0, "search" "text" DEFAULT ''::"text", "sortcolumn" "text" DEFAULT 'name'::"text", "sortorder" "text" DEFAULT 'asc'::"text") RETURNS TABLE("name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION "storage"."search_legacy_v1"("prefix" "text", "bucketname" "text", "limits" integer, "levels" integer, "offsets" integer, "search" "text", "sortcolumn" "text", "sortorder" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."search_v1_optimised"("prefix" "text", "bucketname" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "offsets" integer DEFAULT 0, "search" "text" DEFAULT ''::"text", "sortcolumn" "text" DEFAULT 'name'::"text", "sortorder" "text" DEFAULT 'asc'::"text") RETURNS TABLE("name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION "storage"."search_v1_optimised"("prefix" "text", "bucketname" "text", "limits" integer, "levels" integer, "offsets" integer, "search" "text", "sortcolumn" "text", "sortorder" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."search_v2"("prefix" "text", "bucket_name" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "start_after" "text" DEFAULT ''::"text") RETURNS TABLE("key" "text", "name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION "storage"."search_v2"("prefix" "text", "bucket_name" "text", "limits" integer, "levels" integer, "start_after" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION "storage"."update_updated_at_column"() OWNER TO "supabase_storage_admin";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "auth"."audit_log_entries" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "payload" json,
    "created_at" timestamp with time zone,
    "ip_address" character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE "auth"."audit_log_entries" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."audit_log_entries" IS 'Auth: Audit trail for user actions.';



CREATE TABLE IF NOT EXISTS "auth"."flow_state" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid",
    "auth_code" "text" NOT NULL,
    "code_challenge_method" "auth"."code_challenge_method" NOT NULL,
    "code_challenge" "text" NOT NULL,
    "provider_type" "text" NOT NULL,
    "provider_access_token" "text",
    "provider_refresh_token" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "authentication_method" "text" NOT NULL,
    "auth_code_issued_at" timestamp with time zone
);


ALTER TABLE "auth"."flow_state" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."flow_state" IS 'stores metadata for pkce logins';



CREATE TABLE IF NOT EXISTS "auth"."identities" (
    "provider_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "identity_data" "jsonb" NOT NULL,
    "provider" "text" NOT NULL,
    "last_sign_in_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "email" "text" GENERATED ALWAYS AS ("lower"(("identity_data" ->> 'email'::"text"))) STORED,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "auth"."identities" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."identities" IS 'Auth: Stores identities associated to a user.';



COMMENT ON COLUMN "auth"."identities"."email" IS 'Auth: Email is a generated column that references the optional email property in the identity_data';



CREATE TABLE IF NOT EXISTS "auth"."instances" (
    "id" "uuid" NOT NULL,
    "uuid" "uuid",
    "raw_base_config" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "auth"."instances" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."instances" IS 'Auth: Manages users across multiple sites.';



CREATE TABLE IF NOT EXISTS "auth"."mfa_amr_claims" (
    "session_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "authentication_method" "text" NOT NULL,
    "id" "uuid" NOT NULL
);


ALTER TABLE "auth"."mfa_amr_claims" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_amr_claims" IS 'auth: stores authenticator method reference claims for multi factor authentication';



CREATE TABLE IF NOT EXISTS "auth"."mfa_challenges" (
    "id" "uuid" NOT NULL,
    "factor_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "verified_at" timestamp with time zone,
    "ip_address" "inet" NOT NULL,
    "otp_code" "text",
    "web_authn_session_data" "jsonb"
);


ALTER TABLE "auth"."mfa_challenges" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_challenges" IS 'auth: stores metadata about challenge requests made';



CREATE TABLE IF NOT EXISTS "auth"."mfa_factors" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "friendly_name" "text",
    "factor_type" "auth"."factor_type" NOT NULL,
    "status" "auth"."factor_status" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "secret" "text",
    "phone" "text",
    "last_challenged_at" timestamp with time zone,
    "web_authn_credential" "jsonb",
    "web_authn_aaguid" "uuid"
);


ALTER TABLE "auth"."mfa_factors" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_factors" IS 'auth: stores metadata about factors';



CREATE TABLE IF NOT EXISTS "auth"."oauth_clients" (
    "id" "uuid" NOT NULL,
    "client_id" "text" NOT NULL,
    "client_secret_hash" "text" NOT NULL,
    "registration_type" "auth"."oauth_registration_type" NOT NULL,
    "redirect_uris" "text" NOT NULL,
    "grant_types" "text" NOT NULL,
    "client_name" "text",
    "client_uri" "text",
    "logo_uri" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "oauth_clients_client_name_length" CHECK (("char_length"("client_name") <= 1024)),
    CONSTRAINT "oauth_clients_client_uri_length" CHECK (("char_length"("client_uri") <= 2048)),
    CONSTRAINT "oauth_clients_logo_uri_length" CHECK (("char_length"("logo_uri") <= 2048))
);


ALTER TABLE "auth"."oauth_clients" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."one_time_tokens" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token_type" "auth"."one_time_token_type" NOT NULL,
    "token_hash" "text" NOT NULL,
    "relates_to" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "one_time_tokens_token_hash_check" CHECK (("char_length"("token_hash") > 0))
);


ALTER TABLE "auth"."one_time_tokens" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."refresh_tokens" (
    "instance_id" "uuid",
    "id" bigint NOT NULL,
    "token" character varying(255),
    "user_id" character varying(255),
    "revoked" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "parent" character varying(255),
    "session_id" "uuid"
);


ALTER TABLE "auth"."refresh_tokens" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."refresh_tokens" IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';



CREATE SEQUENCE IF NOT EXISTS "auth"."refresh_tokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNER TO "supabase_auth_admin";


ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNED BY "auth"."refresh_tokens"."id";



CREATE TABLE IF NOT EXISTS "auth"."saml_providers" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "entity_id" "text" NOT NULL,
    "metadata_xml" "text" NOT NULL,
    "metadata_url" "text",
    "attribute_mapping" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "name_id_format" "text",
    CONSTRAINT "entity_id not empty" CHECK (("char_length"("entity_id") > 0)),
    CONSTRAINT "metadata_url not empty" CHECK ((("metadata_url" = NULL::"text") OR ("char_length"("metadata_url") > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK (("char_length"("metadata_xml") > 0))
);


ALTER TABLE "auth"."saml_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_providers" IS 'Auth: Manages SAML Identity Provider connections.';



CREATE TABLE IF NOT EXISTS "auth"."saml_relay_states" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "request_id" "text" NOT NULL,
    "for_email" "text",
    "redirect_to" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "flow_state_id" "uuid",
    CONSTRAINT "request_id not empty" CHECK (("char_length"("request_id") > 0))
);


ALTER TABLE "auth"."saml_relay_states" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_relay_states" IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';



CREATE TABLE IF NOT EXISTS "auth"."schema_migrations" (
    "version" character varying(255) NOT NULL
);


ALTER TABLE "auth"."schema_migrations" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."schema_migrations" IS 'Auth: Manages updates to the auth system.';



CREATE TABLE IF NOT EXISTS "auth"."sessions" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "factor_id" "uuid",
    "aal" "auth"."aal_level",
    "not_after" timestamp with time zone,
    "refreshed_at" timestamp without time zone,
    "user_agent" "text",
    "ip" "inet",
    "tag" "text"
);


ALTER TABLE "auth"."sessions" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sessions" IS 'Auth: Stores session data associated to a user.';



COMMENT ON COLUMN "auth"."sessions"."not_after" IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';



CREATE TABLE IF NOT EXISTS "auth"."sso_domains" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "domain" "text" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK (("char_length"("domain") > 0))
);


ALTER TABLE "auth"."sso_domains" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_domains" IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';



CREATE TABLE IF NOT EXISTS "auth"."sso_providers" (
    "id" "uuid" NOT NULL,
    "resource_id" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "disabled" boolean,
    CONSTRAINT "resource_id not empty" CHECK ((("resource_id" = NULL::"text") OR ("char_length"("resource_id") > 0)))
);


ALTER TABLE "auth"."sso_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_providers" IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';



COMMENT ON COLUMN "auth"."sso_providers"."resource_id" IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';



CREATE TABLE IF NOT EXISTS "auth"."users" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "aud" character varying(255),
    "role" character varying(255),
    "email" character varying(255),
    "encrypted_password" character varying(255),
    "email_confirmed_at" timestamp with time zone,
    "invited_at" timestamp with time zone,
    "confirmation_token" character varying(255),
    "confirmation_sent_at" timestamp with time zone,
    "recovery_token" character varying(255),
    "recovery_sent_at" timestamp with time zone,
    "email_change_token_new" character varying(255),
    "email_change" character varying(255),
    "email_change_sent_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "raw_app_meta_data" "jsonb",
    "raw_user_meta_data" "jsonb",
    "is_super_admin" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "phone" "text" DEFAULT NULL::character varying,
    "phone_confirmed_at" timestamp with time zone,
    "phone_change" "text" DEFAULT ''::character varying,
    "phone_change_token" character varying(255) DEFAULT ''::character varying,
    "phone_change_sent_at" timestamp with time zone,
    "confirmed_at" timestamp with time zone GENERATED ALWAYS AS (LEAST("email_confirmed_at", "phone_confirmed_at")) STORED,
    "email_change_token_current" character varying(255) DEFAULT ''::character varying,
    "email_change_confirm_status" smallint DEFAULT 0,
    "banned_until" timestamp with time zone,
    "reauthentication_token" character varying(255) DEFAULT ''::character varying,
    "reauthentication_sent_at" timestamp with time zone,
    "is_sso_user" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    CONSTRAINT "users_email_change_confirm_status_check" CHECK ((("email_change_confirm_status" >= 0) AND ("email_change_confirm_status" <= 2)))
);


ALTER TABLE "auth"."users" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."users" IS 'Auth: Stores user login data within a secure schema.';



COMMENT ON COLUMN "auth"."users"."is_sso_user" IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';



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
    "company_name" "text",
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


CREATE TABLE IF NOT EXISTS "public"."document_categories" (
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "is_portal_visible" boolean DEFAULT false,
    "retention_policy" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_categories" OWNER TO "postgres";


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
    "updated_at" timestamp with time zone DEFAULT "now"()
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
    "default_currency" "text" DEFAULT 'USD'::"text",
    "tax_id" "text",
    "payment_terms" "text",
    "timezone" "text" DEFAULT 'UTC'::"text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."organizations"."default_currency" IS 'Default currency this organization use for transaction';



COMMENT ON COLUMN "public"."organizations"."tax_id" IS 'TAX id';



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



CREATE OR REPLACE VIEW "public"."review_checklist_items" AS
 SELECT NULL::"uuid" AS "id",
    NULL::"uuid" AS "review_id",
    NULL::"text" AS "item_text",
    NULL::boolean AS "is_checked",
    NULL::boolean AS "is_required",
    NULL::"text" AS "notes",
    NULL::"uuid" AS "checked_by",
    NULL::timestamp with time zone AS "checked_at"
  WHERE false;


ALTER VIEW "public"."review_checklist_items" OWNER TO "postgres";


COMMENT ON VIEW "public"."review_checklist_items" IS 'Empty view for review checklist items - placeholder for future implementation';



CREATE OR REPLACE VIEW "public"."reviews" AS
 SELECT "id",
    "organization_id",
    "entity_id" AS "project_id",
    "current_approver_id" AS "reviewer_id",
    "current_approver_role" AS "reviewer_role",
    "approval_type" AS "review_type",
    "status",
    "priority",
    "decision_comments" AS "comments",
    "request_metadata" AS "risks",
    "decision_reason" AS "recommendations",
        CASE
            WHEN ("approval_type" = 'technical_review'::"public"."approval_type") THEN true
            WHEN ("approval_type" = 'quality_review'::"public"."approval_type") THEN true
            WHEN ("approval_type" = 'engineering_change'::"public"."approval_type") THEN true
            ELSE false
        END AS "tooling_required",
    NULL::numeric AS "estimated_cost",
    NULL::numeric AS "estimated_lead_time",
    "due_date",
    "decided_at" AS "reviewed_at",
    "created_at",
    "updated_at"
   FROM "public"."approvals"
  WHERE ("entity_type" = 'project'::"text");


ALTER VIEW "public"."reviews" OWNER TO "postgres";


COMMENT ON VIEW "public"."reviews" IS 'View that maps reviews table to approvals table for backward compatibility';



CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "custom_role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_permissions" IS 'Junction table linking custom roles to specific permissions';



CREATE OR REPLACE VIEW "public"."secure_documents" AS
 SELECT "id",
    "organization_id",
    "project_id",
    "title",
    "description",
    "file_name",
    "file_path",
    "file_size",
    "mime_type",
    "category",
    "version_number",
    "is_current_version",
    "storage_provider",
    "checksum",
    "access_level",
    "tags",
    "metadata",
    "uploaded_by",
    "approved_by",
    "approved_at",
    "created_at",
    "updated_at",
        CASE
            WHEN "public"."verify_document_access"("organization_id", "project_id") THEN true
            ELSE false
        END AS "user_can_access"
   FROM "public"."documents" "d";


ALTER VIEW "public"."secure_documents" OWNER TO "postgres";


COMMENT ON VIEW "public"."secure_documents" IS 'Provides secure access to documents with access verification';



CREATE TABLE IF NOT EXISTS "public"."supplier_performance_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "total_orders" integer DEFAULT 0,
    "on_time_deliveries" integer DEFAULT 0,
    "average_lead_time_days" numeric(5,2),
    "quality_incidents" integer DEFAULT 0,
    "quality_score" numeric(5,2),
    "total_spend" numeric(18,2) DEFAULT 0,
    "average_cost_variance" numeric(5,2),
    "response_rate" numeric(5,2),
    "average_response_time_hours" numeric(5,2),
    "overall_performance_score" numeric(5,2),
    "performance_grade" "text",
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."supplier_performance_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."supplier_performance_metrics" IS 'Tracks supplier performance metrics for analytics and reporting';



COMMENT ON COLUMN "public"."supplier_performance_metrics"."period_start" IS 'Start date of the performance period';



COMMENT ON COLUMN "public"."supplier_performance_metrics"."period_end" IS 'End date of the performance period';



COMMENT ON COLUMN "public"."supplier_performance_metrics"."on_time_deliveries" IS 'Number of on-time deliveries during the period';



COMMENT ON COLUMN "public"."supplier_performance_metrics"."quality_score" IS 'Quality score (0-100) based on incidents';



COMMENT ON COLUMN "public"."supplier_performance_metrics"."response_rate" IS 'Supplier response rate percentage';



COMMENT ON COLUMN "public"."supplier_performance_metrics"."overall_performance_score" IS 'Overall performance score (0-100)';



CREATE TABLE IF NOT EXISTS "public"."supplier_qualifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "qualification_status" "public"."supplier_qualification_status" DEFAULT 'not_started'::"public"."supplier_qualification_status",
    "qualification_expiry" "date",
    "qualification_conditions" "text",
    "qualification_conditions_resolved" boolean DEFAULT false,
    "qualification_exception_justification" "text",
    "qualification_exception_expires_at" "date",
    "qualification_exception_reviewed_by" "uuid",
    "overall_score" numeric(5,2),
    "criteria_scores" "jsonb" DEFAULT '{}'::"jsonb",
    "recommendations" "text"[],
    "valid_until" "date",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."supplier_qualifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."supplier_qualifications" IS 'Stores detailed qualification information for suppliers including status, conditions, and scoring';



COMMENT ON COLUMN "public"."supplier_qualifications"."qualification_status" IS 'Current qualification status of the supplier';



COMMENT ON COLUMN "public"."supplier_qualifications"."qualification_conditions" IS 'Conditions for partial approval';



COMMENT ON COLUMN "public"."supplier_qualifications"."qualification_exception_justification" IS 'Justification for exception approval';



COMMENT ON COLUMN "public"."supplier_qualifications"."overall_score" IS 'Overall qualification score (0-100)';



COMMENT ON COLUMN "public"."supplier_qualifications"."criteria_scores" IS 'Detailed scores for each qualification criterion';



COMMENT ON COLUMN "public"."supplier_qualifications"."valid_until" IS 'Date until which the qualification is valid';



CREATE TABLE IF NOT EXISTS "public"."supplier_quotes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "supplier_rfq_id" "uuid" NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "quote_number" "text",
    "unit_price" numeric(18,2),
    "total_amount" numeric(18,2),
    "currency" "text",
    "quantity" integer,
    "lead_time_days" integer,
    "valid_until" "date",
    "payment_terms" "text",
    "shipping_terms" "text",
    "status" "public"."supplier_quote_status" DEFAULT 'sent'::"public"."supplier_quote_status",
    "notes" "text",
    "quote_file_url" "text",
    "is_selected" boolean DEFAULT false,
    "submitted_at" timestamp with time zone,
    "evaluated_at" timestamp with time zone,
    "evaluated_by" "uuid",
    "evaluation_score" numeric(5,2),
    "evaluation_notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."supplier_quotes" OWNER TO "postgres";


COMMENT ON TABLE "public"."supplier_quotes" IS 'Stores quotes received from suppliers';



COMMENT ON COLUMN "public"."supplier_quotes"."unit_price" IS 'Unit price quoted by the supplier';



COMMENT ON COLUMN "public"."supplier_quotes"."total_amount" IS 'Total amount of the quote';



COMMENT ON COLUMN "public"."supplier_quotes"."lead_time_days" IS 'Lead time in days offered by the supplier';



COMMENT ON COLUMN "public"."supplier_quotes"."valid_until" IS 'Date until which the quote is valid';



COMMENT ON COLUMN "public"."supplier_quotes"."status" IS 'Current status of the quote';



COMMENT ON COLUMN "public"."supplier_quotes"."is_selected" IS 'Whether this quote has been selected for the RFQ';



CREATE TABLE IF NOT EXISTS "public"."supplier_rfqs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "supplier_id" "uuid",
    "rfq_number" "text" NOT NULL,
    "status" "public"."supplier_rfq_status" DEFAULT 'draft'::"public"."supplier_rfq_status",
    "priority" "text",
    "due_date" "date",
    "expected_response_date" "date",
    "sent_at" timestamp with time zone,
    "viewed_at" timestamp with time zone,
    "requirements" "text",
    "special_instructions" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."supplier_rfqs" OWNER TO "postgres";


COMMENT ON TABLE "public"."supplier_rfqs" IS 'Manages RFQs sent to suppliers';



COMMENT ON COLUMN "public"."supplier_rfqs"."rfq_number" IS 'Unique RFQ number for identification';



COMMENT ON COLUMN "public"."supplier_rfqs"."status" IS 'Current status of the RFQ';



COMMENT ON COLUMN "public"."supplier_rfqs"."due_date" IS 'Date by which the RFQ response is due';



CREATE OR REPLACE VIEW "public"."supplier_details_view" AS
 SELECT "o"."id" AS "organization_id",
    "o"."name" AS "organization_name",
    "o"."slug" AS "organization_slug",
    "o"."description" AS "organization_description",
    "o"."industry",
    "o"."address",
    "o"."city",
    "o"."state",
    "o"."country",
    "o"."postal_code",
    "o"."website",
    "o"."logo_url",
    "o"."is_active",
    "c"."id" AS "primary_contact_id",
    "c"."contact_name" AS "primary_contact_name",
    "c"."email" AS "primary_contact_email",
    "c"."phone" AS "primary_contact_phone",
    "c"."role" AS "primary_contact_department",
    "c"."role" AS "primary_contact_job_title",
    "sq"."id" AS "qualification_id",
    "sq"."qualification_status",
    "sq"."qualification_expiry",
    "sq"."overall_score",
    "sq"."approved_at" AS "qualification_approved_at",
    "sq"."valid_until",
    "spm"."overall_performance_score",
    "spm"."performance_grade",
    "spm"."total_orders",
    "spm"."on_time_deliveries",
    "spm"."average_lead_time_days",
    "spm"."quality_score",
    "spm"."response_rate",
    ( SELECT "count"(*) AS "count"
           FROM "public"."supplier_rfqs" "sr"
          WHERE ("sr"."supplier_id" = "c"."id")) AS "total_rfqs_sent",
    ( SELECT "count"(*) AS "count"
           FROM "public"."supplier_quotes" "sqts"
          WHERE ("sqts"."supplier_id" = "c"."id")) AS "total_quotes_received",
    ( SELECT "count"(*) AS "count"
           FROM "public"."supplier_quotes" "sqts"
          WHERE (("sqts"."supplier_id" = "c"."id") AND ("sqts"."status" = 'accepted'::"public"."supplier_quote_status"))) AS "total_quotes_accepted",
    "o"."created_at" AS "organization_created_at",
    "o"."updated_at" AS "organization_updated_at"
   FROM ((("public"."organizations" "o"
     LEFT JOIN "public"."contacts" "c" ON ((("o"."id" = "c"."organization_id") AND ("c"."type" = 'supplier'::"text") AND ("c"."is_primary_contact" = true))))
     LEFT JOIN "public"."supplier_qualifications" "sq" ON (("o"."id" = "sq"."organization_id")))
     LEFT JOIN "public"."supplier_performance_metrics" "spm" ON ((("c"."id" = "spm"."supplier_id") AND ("spm"."period_end" = ( SELECT "max"("spm2"."period_end") AS "max"
           FROM "public"."supplier_performance_metrics" "spm2"
          WHERE ("spm2"."supplier_id" = "c"."id"))))))
  WHERE ("o"."organization_type" = 'supplier'::"text");


ALTER VIEW "public"."supplier_details_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_qualification_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "sub_stage_slug" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "completed_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "supplier_qualification_progress_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text", 'blocked'::"text"])))
);


ALTER TABLE "public"."supplier_qualification_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."supplier_qualification_progress" IS 'Tracks progress through qualification sub-stages for suppliers';



COMMENT ON COLUMN "public"."supplier_qualification_progress"."sub_stage_slug" IS 'Slug identifier for the qualification sub-stage';



COMMENT ON COLUMN "public"."supplier_qualification_progress"."status" IS 'Status of the sub-stage progress';



COMMENT ON COLUMN "public"."supplier_qualification_progress"."completed_at" IS 'Timestamp when the sub-stage was completed';



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


CREATE TABLE IF NOT EXISTS "storage"."buckets" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "owner" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "public" boolean DEFAULT false,
    "avif_autodetection" boolean DEFAULT false,
    "file_size_limit" bigint,
    "allowed_mime_types" "text"[],
    "owner_id" "text",
    "type" "storage"."buckettype" DEFAULT 'STANDARD'::"storage"."buckettype" NOT NULL
);


ALTER TABLE "storage"."buckets" OWNER TO "supabase_storage_admin";


COMMENT ON COLUMN "storage"."buckets"."owner" IS 'Field is deprecated, use owner_id instead';



CREATE TABLE IF NOT EXISTS "storage"."buckets_analytics" (
    "id" "text" NOT NULL,
    "type" "storage"."buckettype" DEFAULT 'ANALYTICS'::"storage"."buckettype" NOT NULL,
    "format" "text" DEFAULT 'ICEBERG'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "storage"."buckets_analytics" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."migrations" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "hash" character varying(40) NOT NULL,
    "executed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "storage"."migrations" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."objects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bucket_id" "text",
    "name" "text",
    "owner" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_accessed_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    "path_tokens" "text"[] GENERATED ALWAYS AS ("string_to_array"("name", '/'::"text")) STORED,
    "version" "text",
    "owner_id" "text",
    "user_metadata" "jsonb",
    "level" integer
);


ALTER TABLE "storage"."objects" OWNER TO "supabase_storage_admin";


COMMENT ON COLUMN "storage"."objects"."owner" IS 'Field is deprecated, use owner_id instead';



CREATE TABLE IF NOT EXISTS "storage"."prefixes" (
    "bucket_id" "text" NOT NULL,
    "name" "text" NOT NULL COLLATE "pg_catalog"."C",
    "level" integer GENERATED ALWAYS AS ("storage"."get_level"("name")) STORED NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "storage"."prefixes" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."s3_multipart_uploads" (
    "id" "text" NOT NULL,
    "in_progress_size" bigint DEFAULT 0 NOT NULL,
    "upload_signature" "text" NOT NULL,
    "bucket_id" "text" NOT NULL,
    "key" "text" NOT NULL COLLATE "pg_catalog"."C",
    "version" "text" NOT NULL,
    "owner_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_metadata" "jsonb"
);


ALTER TABLE "storage"."s3_multipart_uploads" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."s3_multipart_uploads_parts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "upload_id" "text" NOT NULL,
    "size" bigint DEFAULT 0 NOT NULL,
    "part_number" integer NOT NULL,
    "bucket_id" "text" NOT NULL,
    "key" "text" NOT NULL COLLATE "pg_catalog"."C",
    "etag" "text" NOT NULL,
    "owner_id" "text",
    "version" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "storage"."s3_multipart_uploads_parts" OWNER TO "supabase_storage_admin";


ALTER TABLE ONLY "auth"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT "nextval"('"auth"."refresh_tokens_id_seq"'::"regclass");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "amr_id_pk" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."audit_log_entries"
    ADD CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."flow_state"
    ADD CONSTRAINT "flow_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_provider_id_provider_unique" UNIQUE ("provider_id", "provider");



ALTER TABLE ONLY "auth"."instances"
    ADD CONSTRAINT "instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE ("session_id", "authentication_method");



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_last_challenged_at_key" UNIQUE ("last_challenged_at");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_clients"
    ADD CONSTRAINT "oauth_clients_client_id_key" UNIQUE ("client_id");



ALTER TABLE ONLY "auth"."oauth_clients"
    ADD CONSTRAINT "oauth_clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_token_unique" UNIQUE ("token");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_entity_id_key" UNIQUE ("entity_id");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_providers"
    ADD CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."document_categories"
    ADD CONSTRAINT "document_categories_pkey" PRIMARY KEY ("code");



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



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_custom_role_id_permission_id_key" UNIQUE ("custom_role_id", "permission_id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_performance_metrics"
    ADD CONSTRAINT "supplier_performance_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_performance_metrics"
    ADD CONSTRAINT "supplier_performance_metrics_supplier_id_period_start_perio_key" UNIQUE ("supplier_id", "period_start", "period_end");



ALTER TABLE ONLY "public"."supplier_qualification_progress"
    ADD CONSTRAINT "supplier_qualification_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_qualification_progress"
    ADD CONSTRAINT "supplier_qualification_progress_supplier_id_sub_stage_slug_key" UNIQUE ("supplier_id", "sub_stage_slug");



ALTER TABLE ONLY "public"."supplier_qualifications"
    ADD CONSTRAINT "supplier_qualifications_organization_id_key" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."supplier_qualifications"
    ADD CONSTRAINT "supplier_qualifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_quotes"
    ADD CONSTRAINT "supplier_quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_rfq_number_key" UNIQUE ("rfq_number");



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



ALTER TABLE ONLY "storage"."buckets_analytics"
    ADD CONSTRAINT "buckets_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."buckets"
    ADD CONSTRAINT "buckets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."migrations"
    ADD CONSTRAINT "migrations_name_key" UNIQUE ("name");



ALTER TABLE ONLY "storage"."migrations"
    ADD CONSTRAINT "migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."objects"
    ADD CONSTRAINT "objects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."prefixes"
    ADD CONSTRAINT "prefixes_pkey" PRIMARY KEY ("bucket_id", "level", "name");



ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads"
    ADD CONSTRAINT "s3_multipart_uploads_pkey" PRIMARY KEY ("id");



CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" USING "btree" ("instance_id");



CREATE UNIQUE INDEX "confirmation_token_idx" ON "auth"."users" USING "btree" ("confirmation_token") WHERE (("confirmation_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_current_idx" ON "auth"."users" USING "btree" ("email_change_token_current") WHERE (("email_change_token_current")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_new_idx" ON "auth"."users" USING "btree" ("email_change_token_new") WHERE (("email_change_token_new")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors" USING "btree" ("user_id", "created_at");



CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state" USING "btree" ("created_at" DESC);



CREATE INDEX "identities_email_idx" ON "auth"."identities" USING "btree" ("email" "text_pattern_ops");



COMMENT ON INDEX "auth"."identities_email_idx" IS 'Auth: Ensures indexed queries on the email column';



CREATE INDEX "identities_user_id_idx" ON "auth"."identities" USING "btree" ("user_id");



CREATE INDEX "idx_auth_code" ON "auth"."flow_state" USING "btree" ("auth_code");



CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state" USING "btree" ("user_id", "authentication_method");



CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" USING "btree" ("created_at" DESC);



CREATE UNIQUE INDEX "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" USING "btree" ("friendly_name", "user_id") WHERE (TRIM(BOTH FROM "friendly_name") <> ''::"text");



CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors" USING "btree" ("user_id");



CREATE INDEX "oauth_clients_client_id_idx" ON "auth"."oauth_clients" USING "btree" ("client_id");



CREATE INDEX "oauth_clients_deleted_at_idx" ON "auth"."oauth_clients" USING "btree" ("deleted_at");



CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("relates_to");



CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("token_hash");



CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens" USING "btree" ("user_id", "token_type");



CREATE UNIQUE INDEX "reauthentication_token_idx" ON "auth"."users" USING "btree" ("reauthentication_token") WHERE (("reauthentication_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "recovery_token_idx" ON "auth"."users" USING "btree" ("recovery_token") WHERE (("recovery_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id");



CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id", "user_id");



CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" USING "btree" ("parent");



CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" USING "btree" ("session_id", "revoked");



CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" USING "btree" ("updated_at" DESC);



CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" USING "btree" ("sso_provider_id");



CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" USING "btree" ("created_at" DESC);



CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" USING "btree" ("for_email");



CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" USING "btree" ("sso_provider_id");



CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions" USING "btree" ("not_after" DESC);



CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" USING "btree" ("lower"("domain"));



CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" USING "btree" ("sso_provider_id");



CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" USING "btree" ("lower"("resource_id"));



CREATE INDEX "sso_providers_resource_id_pattern_idx" ON "auth"."sso_providers" USING "btree" ("resource_id" "text_pattern_ops");



CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors" USING "btree" ("user_id", "phone");



CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions" USING "btree" ("user_id", "created_at");



CREATE UNIQUE INDEX "users_email_partial_key" ON "auth"."users" USING "btree" ("email") WHERE ("is_sso_user" = false);



COMMENT ON INDEX "auth"."users_email_partial_key" IS 'Auth: A partial unique index that applies only when is_sso_user is false';



CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" USING "btree" ("instance_id", "lower"(("email")::"text"));



CREATE INDEX "users_instance_id_idx" ON "auth"."users" USING "btree" ("instance_id");



CREATE INDEX "users_is_anonymous_idx" ON "auth"."users" USING "btree" ("is_anonymous");



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



CREATE INDEX "idx_role_permissions_role" ON "public"."role_permissions" USING "btree" ("custom_role_id");



CREATE INDEX "idx_supplier_performance_metrics_org_supplier" ON "public"."supplier_performance_metrics" USING "btree" ("organization_id", "supplier_id");



CREATE INDEX "idx_supplier_performance_metrics_period" ON "public"."supplier_performance_metrics" USING "btree" ("period_start", "period_end");



CREATE INDEX "idx_supplier_performance_metrics_score" ON "public"."supplier_performance_metrics" USING "btree" ("overall_performance_score");



CREATE INDEX "idx_supplier_qualification_progress_org_supplier" ON "public"."supplier_qualification_progress" USING "btree" ("organization_id", "supplier_id");



CREATE INDEX "idx_supplier_qualification_progress_status" ON "public"."supplier_qualification_progress" USING "btree" ("status");



CREATE INDEX "idx_supplier_qualification_progress_sub_stage" ON "public"."supplier_qualification_progress" USING "btree" ("sub_stage_slug");



CREATE INDEX "idx_supplier_qualifications_approved_by" ON "public"."supplier_qualifications" USING "btree" ("approved_by");



CREATE INDEX "idx_supplier_qualifications_expiry" ON "public"."supplier_qualifications" USING "btree" ("qualification_expiry") WHERE ("qualification_expiry" IS NOT NULL);



CREATE INDEX "idx_supplier_qualifications_org_status" ON "public"."supplier_qualifications" USING "btree" ("organization_id", "qualification_status");



CREATE INDEX "idx_supplier_quotes_org_rfq" ON "public"."supplier_quotes" USING "btree" ("organization_id", "supplier_rfq_id");



CREATE INDEX "idx_supplier_quotes_selected" ON "public"."supplier_quotes" USING "btree" ("is_selected");



CREATE INDEX "idx_supplier_quotes_submitted_at" ON "public"."supplier_quotes" USING "btree" ("submitted_at" DESC);



CREATE INDEX "idx_supplier_quotes_supplier_status" ON "public"."supplier_quotes" USING "btree" ("supplier_id", "status");



CREATE INDEX "idx_supplier_rfqs_created_at" ON "public"."supplier_rfqs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_supplier_rfqs_due_date" ON "public"."supplier_rfqs" USING "btree" ("due_date") WHERE ("due_date" IS NOT NULL);



CREATE INDEX "idx_supplier_rfqs_org_project" ON "public"."supplier_rfqs" USING "btree" ("organization_id", "project_id");



CREATE INDEX "idx_supplier_rfqs_supplier_status" ON "public"."supplier_rfqs" USING "btree" ("supplier_id", "status");



CREATE INDEX "idx_user_custom_roles_expires" ON "public"."user_custom_roles" USING "btree" ("expires_at") WHERE ("expires_at" IS NOT NULL);



CREATE INDEX "idx_user_custom_roles_user" ON "public"."user_custom_roles" USING "btree" ("user_id");



CREATE INDEX "idx_user_feature_access_user" ON "public"."user_feature_access" USING "btree" ("user_id");



CREATE INDEX "idx_user_permissions_expires" ON "public"."user_permissions" USING "btree" ("expires_at") WHERE ("expires_at" IS NOT NULL);



CREATE INDEX "idx_user_permissions_user" ON "public"."user_permissions" USING "btree" ("user_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_org" ON "public"."users" USING "btree" ("organization_id");



CREATE INDEX "idx_users_organization_id" ON "public"."users" USING "btree" ("organization_id");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_workflow_stages_org_order" ON "public"."workflow_stages" USING "btree" ("organization_id", "stage_order");



CREATE INDEX "idx_workflow_sub_stages_active" ON "public"."workflow_sub_stages" USING "btree" ("is_active");



CREATE INDEX "idx_workflow_sub_stages_stage_order" ON "public"."workflow_sub_stages" USING "btree" ("workflow_stage_id", "sub_stage_order");



CREATE UNIQUE INDEX "bname" ON "storage"."buckets" USING "btree" ("name");



CREATE UNIQUE INDEX "bucketid_objname" ON "storage"."objects" USING "btree" ("bucket_id", "name");



CREATE INDEX "idx_multipart_uploads_list" ON "storage"."s3_multipart_uploads" USING "btree" ("bucket_id", "key", "created_at");



CREATE UNIQUE INDEX "idx_name_bucket_level_unique" ON "storage"."objects" USING "btree" ("name" COLLATE "C", "bucket_id", "level");



CREATE INDEX "idx_objects_bucket_id_name" ON "storage"."objects" USING "btree" ("bucket_id", "name" COLLATE "C");



CREATE INDEX "idx_objects_lower_name" ON "storage"."objects" USING "btree" (("path_tokens"["level"]), "lower"("name") "text_pattern_ops", "bucket_id", "level");



CREATE INDEX "idx_prefixes_lower_name" ON "storage"."prefixes" USING "btree" ("bucket_id", "level", (("string_to_array"("name", '/'::"text"))["level"]), "lower"("name") "text_pattern_ops");



CREATE INDEX "name_prefix_search" ON "storage"."objects" USING "btree" ("name" "text_pattern_ops");



CREATE UNIQUE INDEX "objects_bucket_id_level_idx" ON "storage"."objects" USING "btree" ("bucket_id", "level", "name" COLLATE "C");



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



CREATE OR REPLACE TRIGGER "update_supplier_performance_metrics_updated_at" BEFORE UPDATE ON "public"."supplier_performance_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_supplier_qualification_progress_updated_at" BEFORE UPDATE ON "public"."supplier_qualification_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_supplier_qualifications_updated_at" BEFORE UPDATE ON "public"."supplier_qualifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_supplier_quotes_updated_at" BEFORE UPDATE ON "public"."supplier_quotes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_supplier_rfqs_updated_at" BEFORE UPDATE ON "public"."supplier_rfqs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflow_definitions_updated_at" BEFORE UPDATE ON "public"."workflow_definitions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflow_stages_updated_at" BEFORE UPDATE ON "public"."workflow_stages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflow_sub_stages_updated_at" BEFORE UPDATE ON "public"."workflow_sub_stages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "enforce_bucket_name_length_trigger" BEFORE INSERT OR UPDATE OF "name" ON "storage"."buckets" FOR EACH ROW EXECUTE FUNCTION "storage"."enforce_bucket_name_length"();



CREATE OR REPLACE TRIGGER "objects_delete_delete_prefix" AFTER DELETE ON "storage"."objects" FOR EACH ROW EXECUTE FUNCTION "storage"."delete_prefix_hierarchy_trigger"();



CREATE OR REPLACE TRIGGER "objects_insert_create_prefix" BEFORE INSERT ON "storage"."objects" FOR EACH ROW EXECUTE FUNCTION "storage"."objects_insert_prefix_trigger"();



CREATE OR REPLACE TRIGGER "objects_update_create_prefix" BEFORE UPDATE ON "storage"."objects" FOR EACH ROW WHEN ((("new"."name" <> "old"."name") OR ("new"."bucket_id" <> "old"."bucket_id"))) EXECUTE FUNCTION "storage"."objects_update_prefix_trigger"();



CREATE OR REPLACE TRIGGER "prefixes_create_hierarchy" BEFORE INSERT ON "storage"."prefixes" FOR EACH ROW WHEN (("pg_trigger_depth"() < 1)) EXECUTE FUNCTION "storage"."prefixes_insert_trigger"();



CREATE OR REPLACE TRIGGER "prefixes_delete_hierarchy" AFTER DELETE ON "storage"."prefixes" FOR EACH ROW EXECUTE FUNCTION "storage"."delete_prefix_hierarchy_trigger"();



CREATE OR REPLACE TRIGGER "update_objects_updated_at" BEFORE UPDATE ON "storage"."objects" FOR EACH ROW EXECUTE FUNCTION "storage"."update_updated_at_column"();



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



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
    ADD CONSTRAINT "organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;



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



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_custom_role_id_fkey" FOREIGN KEY ("custom_role_id") REFERENCES "public"."custom_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_performance_metrics"
    ADD CONSTRAINT "supplier_performance_metrics_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."supplier_performance_metrics"
    ADD CONSTRAINT "supplier_performance_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_performance_metrics"
    ADD CONSTRAINT "supplier_performance_metrics_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_qualification_progress"
    ADD CONSTRAINT "supplier_qualification_progress_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_qualification_progress"
    ADD CONSTRAINT "supplier_qualification_progress_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_qualifications"
    ADD CONSTRAINT "supplier_qualifications_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."supplier_qualifications"
    ADD CONSTRAINT "supplier_qualifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."supplier_qualifications"
    ADD CONSTRAINT "supplier_qualifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_qualifications"
    ADD CONSTRAINT "supplier_qualifications_qualification_exception_reviewed_b_fkey" FOREIGN KEY ("qualification_exception_reviewed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."supplier_quotes"
    ADD CONSTRAINT "supplier_quotes_evaluated_by_fkey" FOREIGN KEY ("evaluated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."supplier_quotes"
    ADD CONSTRAINT "supplier_quotes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_quotes"
    ADD CONSTRAINT "supplier_quotes_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_quotes"
    ADD CONSTRAINT "supplier_quotes_supplier_rfq_id_fkey" FOREIGN KEY ("supplier_rfq_id") REFERENCES "public"."supplier_rfqs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;



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



ALTER TABLE ONLY "storage"."objects"
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."prefixes"
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads"
    ADD CONSTRAINT "s3_multipart_uploads_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "storage"."s3_multipart_uploads"("id") ON DELETE CASCADE;



ALTER TABLE "auth"."audit_log_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."flow_state" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."identities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_amr_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_challenges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_factors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."one_time_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."refresh_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_relay_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."schema_migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can insert contacts" ON "public"."contacts" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can insert organizations" ON "public"."organizations" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can insert users" ON "public"."users" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update contacts" ON "public"."contacts" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update their organization" ON "public"."organizations" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update users" ON "public"."users" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view all contacts" ON "public"."contacts" FOR SELECT USING (true);



CREATE POLICY "Users can view all organizations" ON "public"."organizations" FOR SELECT USING (true);



CREATE POLICY "Users can view users" ON "public"."users" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "activity_log_insert_policy" ON "public"."activity_log" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "activity_log_select_policy" ON "public"."activity_log" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."approval_attachments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "approval_attachments_insert_policy" ON "public"."approval_attachments" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approval_attachments_select_policy" ON "public"."approval_attachments" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."approval_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "approval_history_insert_policy" ON "public"."approval_history" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approval_history_select_policy" ON "public"."approval_history" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."approvals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "approvals_insert_policy" ON "public"."approvals" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approvals_select_policy" ON "public"."approvals" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "approvals_update_policy" ON "public"."approvals" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "contacts_insert_policy" ON "public"."contacts" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "contacts_select_policy" ON "public"."contacts" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "contacts_update_policy" ON "public"."contacts" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."custom_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "custom_roles_org_policy" ON "public"."custom_roles" USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."document_access_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_access_log_insert_policy" ON "public"."document_access_log" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "document_access_log_select_policy" ON "public"."document_access_log" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."document_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_categories_delete_policy" ON "public"."document_categories" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "document_categories_insert_policy" ON "public"."document_categories" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "document_categories_select_policy" ON "public"."document_categories" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "document_categories_update_policy" ON "public"."document_categories" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



ALTER TABLE "public"."document_versions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_versions_delete_policy" ON "public"."document_versions" FOR DELETE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "document_versions_insert_policy" ON "public"."document_versions" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "document_versions_select_policy" ON "public"."document_versions" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "document_versions_update_policy" ON "public"."document_versions" FOR UPDATE USING (("organization_id" = "public"."get_current_user_org_id"())) WITH CHECK (("organization_id" = "public"."get_current_user_org_id"()));



ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "documents_delete_policy" ON "public"."documents" FOR DELETE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "documents_insert_policy" ON "public"."documents" FOR INSERT WITH CHECK (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "documents_select_policy" ON "public"."documents" FOR SELECT USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "documents_update_policy" ON "public"."documents" FOR UPDATE USING (("organization_id" = "public"."get_current_user_org_id"())) WITH CHECK (("organization_id" = "public"."get_current_user_org_id"()));



ALTER TABLE "public"."feature_toggles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "feature_toggles_org_policy" ON "public"."feature_toggles" USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_insert_policy" ON "public"."messages" FOR INSERT WITH CHECK ((("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")) AND ("sender_id" = "auth"."uid"())));



CREATE POLICY "messages_select_policy" ON "public"."messages" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_insert_policy" ON "public"."notifications" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "notifications_select_policy" ON "public"."notifications" FOR SELECT USING ((("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "notifications_update_policy" ON "public"."notifications" FOR UPDATE USING ((("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "org_delete_policy" ON "public"."organizations" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "org_insert_policy" ON "public"."organizations" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "org_select_policy" ON "public"."organizations" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "org_update_policy" ON "public"."organizations" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


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



ALTER TABLE "public"."project_sub_stage_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "projects_insert_policy" ON "public"."projects" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "projects_select_policy" ON "public"."projects" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "projects_update_policy" ON "public"."projects" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "role_permissions_org_policy" ON "public"."role_permissions" USING ((EXISTS ( SELECT 1
   FROM "public"."custom_roles" "cr"
  WHERE (("cr"."id" = "role_permissions"."custom_role_id") AND ("cr"."organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id"))))));



CREATE POLICY "spm_delete_org" ON "public"."supplier_performance_metrics" FOR DELETE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "spm_insert_org" ON "public"."supplier_performance_metrics" FOR INSERT WITH CHECK (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "spm_select_org" ON "public"."supplier_performance_metrics" FOR SELECT USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "spm_update_org" ON "public"."supplier_performance_metrics" FOR UPDATE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sq_delete_org" ON "public"."supplier_qualifications" FOR DELETE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sq_insert_org" ON "public"."supplier_qualifications" FOR INSERT WITH CHECK (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sq_select_org" ON "public"."supplier_qualifications" FOR SELECT USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sq_update_org" ON "public"."supplier_qualifications" FOR UPDATE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sqp_delete_org" ON "public"."supplier_qualification_progress" FOR DELETE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sqp_insert_org" ON "public"."supplier_qualification_progress" FOR INSERT WITH CHECK (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sqp_select_org" ON "public"."supplier_qualification_progress" FOR SELECT USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sqp_update_org" ON "public"."supplier_qualification_progress" FOR UPDATE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sqts_delete_org" ON "public"."supplier_quotes" FOR DELETE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sqts_insert_org" ON "public"."supplier_quotes" FOR INSERT WITH CHECK (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sqts_select_org" ON "public"."supplier_quotes" FOR SELECT USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "sqts_update_org" ON "public"."supplier_quotes" FOR UPDATE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "srfq_delete_org" ON "public"."supplier_rfqs" FOR DELETE USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "srfq_insert_org" ON "public"."supplier_rfqs" FOR INSERT WITH CHECK (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "srfq_select_org" ON "public"."supplier_rfqs" FOR SELECT USING (("organization_id" = "public"."get_current_user_org_id"()));



CREATE POLICY "srfq_update_org" ON "public"."supplier_rfqs" FOR UPDATE USING (("organization_id" = "public"."get_current_user_org_id"()));



ALTER TABLE "public"."supplier_performance_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_qualification_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_qualifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_rfqs" ENABLE ROW LEVEL SECURITY;


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


CREATE POLICY "users_insert_policy" ON "public"."users" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "users_select_policy" ON "public"."users" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "users_update_policy" ON "public"."users" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."workflow_definition_stages" ENABLE ROW LEVEL SECURITY;


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



ALTER TABLE "public"."workflow_definition_sub_stages" ENABLE ROW LEVEL SECURITY;


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



ALTER TABLE "public"."workflow_definitions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workflow_definitions_insert_policy" ON "public"."workflow_definitions" FOR INSERT TO "authenticated" WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_definitions_select_policy" ON "public"."workflow_definitions" FOR SELECT TO "authenticated" USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_definitions_update_policy" ON "public"."workflow_definitions" FOR UPDATE TO "authenticated" USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id"))) WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."workflow_stages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workflow_stages_insert_policy" ON "public"."workflow_stages" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_stages_select_policy" ON "public"."workflow_stages" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_stages_update_policy" ON "public"."workflow_stages" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "public"."workflow_sub_stages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workflow_sub_stages_insert_policy" ON "public"."workflow_sub_stages" FOR INSERT WITH CHECK (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_sub_stages_select_policy" ON "public"."workflow_sub_stages" FOR SELECT USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



CREATE POLICY "workflow_sub_stages_update_policy" ON "public"."workflow_sub_stages" FOR UPDATE USING (("organization_id" = ( SELECT "public"."get_current_user_org_id"() AS "get_current_user_org_id")));



ALTER TABLE "storage"."buckets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."buckets_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."objects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."prefixes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."s3_multipart_uploads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."s3_multipart_uploads_parts" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "auth" TO "anon";
GRANT USAGE ON SCHEMA "auth" TO "authenticated";
GRANT USAGE ON SCHEMA "auth" TO "service_role";
GRANT ALL ON SCHEMA "auth" TO "supabase_auth_admin";
GRANT ALL ON SCHEMA "auth" TO "dashboard_user";
GRANT USAGE ON SCHEMA "auth" TO "postgres";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "storage" TO "postgres" WITH GRANT OPTION;
GRANT USAGE ON SCHEMA "storage" TO "anon";
GRANT USAGE ON SCHEMA "storage" TO "authenticated";
GRANT USAGE ON SCHEMA "storage" TO "service_role";
GRANT ALL ON SCHEMA "storage" TO "supabase_storage_admin";
GRANT ALL ON SCHEMA "storage" TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."email"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."jwt"() TO "postgres";
GRANT ALL ON FUNCTION "auth"."jwt"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."role"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."uid"() TO "dashboard_user";



GRANT ALL ON FUNCTION "public"."approve_supplier_qualification"("supplier_org_id" "uuid", "approver_id" "uuid", "decision_type" "text", "conditions" "text", "exception_justification" "text", "escalated_to" "uuid", "review_due_date" "date", "attached_document_id" "uuid", "overall_score" numeric, "criteria_scores" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_supplier_qualification"("supplier_org_id" "uuid", "approver_id" "uuid", "decision_type" "text", "conditions" "text", "exception_justification" "text", "escalated_to" "uuid", "review_due_date" "date", "attached_document_id" "uuid", "overall_score" numeric, "criteria_scores" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_supplier_qualification"("supplier_org_id" "uuid", "approver_id" "uuid", "decision_type" "text", "conditions" "text", "exception_justification" "text", "escalated_to" "uuid", "review_due_date" "date", "attached_document_id" "uuid", "overall_score" numeric, "criteria_scores" "jsonb") TO "service_role";



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



GRANT ALL ON FUNCTION "public"."get_document_url"("file_path" "text", "expires_in" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_document_url"("file_path" "text", "expires_in" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_document_url"("file_path" "text", "expires_in" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_or_create_bootstrap_org"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_bootstrap_org"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_bootstrap_org"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_project_progress_summary"("p_project_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_project_progress_summary"("p_project_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_project_progress_summary"("p_project_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_secure_document_url"("document_id" "uuid", "expires_in" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_secure_document_url"("document_id" "uuid", "expires_in" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_secure_document_url"("document_id" "uuid", "expires_in" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_org_simple"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_org_simple"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_org_simple"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_users_by_organization"("p_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_users_by_organization"("p_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_users_by_organization"("p_org_id" "uuid") TO "service_role";



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



GRANT ALL ON FUNCTION "public"."start_supplier_qualification"("supplier_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."start_supplier_qualification"("supplier_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."start_supplier_qualification"("supplier_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_updates" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_updates" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_updates" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_document_access"("document_org_id" "uuid", "document_project_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_document_access"("document_org_id" "uuid", "document_project_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_document_access"("document_org_id" "uuid", "document_project_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "auth"."audit_log_entries" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."audit_log_entries" TO "postgres";
GRANT SELECT ON TABLE "auth"."audit_log_entries" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."flow_state" TO "postgres";
GRANT SELECT ON TABLE "auth"."flow_state" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."flow_state" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."identities" TO "postgres";
GRANT SELECT ON TABLE "auth"."identities" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."identities" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."instances" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."instances" TO "postgres";
GRANT SELECT ON TABLE "auth"."instances" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_amr_claims" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_amr_claims" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_amr_claims" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_challenges" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_challenges" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_challenges" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_factors" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_factors" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_factors" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."oauth_clients" TO "postgres";
GRANT ALL ON TABLE "auth"."oauth_clients" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."one_time_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."one_time_tokens" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."one_time_tokens" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."refresh_tokens" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."refresh_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."refresh_tokens" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "dashboard_user";
GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "postgres";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."saml_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_providers" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."saml_relay_states" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_relay_states" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_relay_states" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sessions" TO "postgres";
GRANT SELECT ON TABLE "auth"."sessions" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sessions" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sso_domains" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_domains" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_domains" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sso_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_providers" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."users" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."users" TO "postgres";
GRANT SELECT ON TABLE "auth"."users" TO "postgres" WITH GRANT OPTION;



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



GRANT ALL ON TABLE "public"."document_categories" TO "anon";
GRANT ALL ON TABLE "public"."document_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."document_categories" TO "service_role";



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



GRANT ALL ON TABLE "public"."secure_documents" TO "anon";
GRANT ALL ON TABLE "public"."secure_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."secure_documents" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_performance_metrics" TO "anon";
GRANT ALL ON TABLE "public"."supplier_performance_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_performance_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_qualifications" TO "anon";
GRANT ALL ON TABLE "public"."supplier_qualifications" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_qualifications" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_quotes" TO "anon";
GRANT ALL ON TABLE "public"."supplier_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_quotes" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_rfqs" TO "anon";
GRANT ALL ON TABLE "public"."supplier_rfqs" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_rfqs" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_details_view" TO "anon";
GRANT ALL ON TABLE "public"."supplier_details_view" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_details_view" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_qualification_progress" TO "anon";
GRANT ALL ON TABLE "public"."supplier_qualification_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_qualification_progress" TO "service_role";



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



GRANT ALL ON TABLE "storage"."buckets" TO "anon";
GRANT ALL ON TABLE "storage"."buckets" TO "authenticated";
GRANT ALL ON TABLE "storage"."buckets" TO "service_role";
GRANT ALL ON TABLE "storage"."buckets" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "storage"."buckets_analytics" TO "service_role";
GRANT ALL ON TABLE "storage"."buckets_analytics" TO "authenticated";
GRANT ALL ON TABLE "storage"."buckets_analytics" TO "anon";



GRANT ALL ON TABLE "storage"."objects" TO "anon";
GRANT ALL ON TABLE "storage"."objects" TO "authenticated";
GRANT ALL ON TABLE "storage"."objects" TO "service_role";
GRANT ALL ON TABLE "storage"."objects" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "storage"."prefixes" TO "service_role";
GRANT ALL ON TABLE "storage"."prefixes" TO "authenticated";
GRANT ALL ON TABLE "storage"."prefixes" TO "anon";



GRANT ALL ON TABLE "storage"."s3_multipart_uploads" TO "service_role";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads" TO "authenticated";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads" TO "anon";



GRANT ALL ON TABLE "storage"."s3_multipart_uploads_parts" TO "service_role";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads_parts" TO "authenticated";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads_parts" TO "anon";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES TO "dashboard_user";



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






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "service_role";



RESET ALL;
