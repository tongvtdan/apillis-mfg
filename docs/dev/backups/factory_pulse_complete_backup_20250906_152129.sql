

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






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






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
    'delegated',
    'expired',
    'cancelled',
    'auto_approved',
    'escalated'
);


ALTER TYPE "public"."approval_status" OWNER TO "postgres";


CREATE TYPE "public"."approval_type" AS ENUM (
    'stage_transition',
    'document_approval',
    'engineering_change',
    'supplier_qualification',
    'purchase_order',
    'cost_approval',
    'quality_review',
    'production_release',
    'shipping_approval',
    'contract_approval',
    'budget_approval',
    'safety_review',
    'custom'
);


ALTER TYPE "public"."approval_type" OWNER TO "postgres";


CREATE TYPE "public"."contact_type" AS ENUM (
    'customer',
    'supplier',
    'partner',
    'internal'
);


ALTER TYPE "public"."contact_type" OWNER TO "postgres";


CREATE TYPE "public"."intake_type" AS ENUM (
    'rfq',
    'purchase_order',
    'project_idea',
    'direct_request'
);


ALTER TYPE "public"."intake_type" OWNER TO "postgres";


CREATE TYPE "public"."organization_type_enum" AS ENUM (
    'internal',
    'customer',
    'supplier',
    'partner'
);


ALTER TYPE "public"."organization_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."priority_level" AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE "public"."priority_level" OWNER TO "postgres";


CREATE TYPE "public"."project_status" AS ENUM (
    'active',
    'completed',
    'cancelled',
    'on_hold'
);


ALTER TYPE "public"."project_status" OWNER TO "postgres";


CREATE TYPE "public"."subscription_plan" AS ENUM (
    'starter',
    'growth',
    'enterprise'
);


ALTER TYPE "public"."subscription_plan" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'management',
    'sales',
    'engineering',
    'qa',
    'production',
    'procurement',
    'supplier',
    'customer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE TYPE "public"."user_status" AS ENUM (
    'active',
    'inactive',
    'pending',
    'suspended'
);


ALTER TYPE "public"."user_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_contact_to_project"("project_uuid" "uuid", "contact_uuid" "uuid", "make_primary" boolean DEFAULT false) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_contacts UUID[];
    new_contacts UUID[];
BEGIN
    -- Get current contacts
    SELECT point_of_contacts INTO current_contacts
    FROM projects 
    WHERE id = project_uuid;
    
    -- Check if contact already exists
    IF contact_uuid = ANY(current_contacts) THEN
        -- If making primary and not already primary, move to front
        IF make_primary AND current_contacts[1] != contact_uuid THEN
            -- Remove from current position and add to front
            new_contacts := ARRAY[contact_uuid] || array_remove(current_contacts, contact_uuid);
            
            UPDATE projects 
            SET point_of_contacts = new_contacts
            WHERE id = project_uuid;
        END IF;
        
        RETURN true;
    END IF;
    
    -- Add new contact
    IF make_primary THEN
        -- Add to front
        new_contacts := ARRAY[contact_uuid] || current_contacts;
    ELSE
        -- Add to end
        new_contacts := current_contacts || ARRAY[contact_uuid];
    END IF;
    
    UPDATE projects 
    SET point_of_contacts = new_contacts
    WHERE id = project_uuid;
    
    RETURN true;
END;
$$;


ALTER FUNCTION "public"."add_contact_to_project"("project_uuid" "uuid", "contact_uuid" "uuid", "make_primary" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_expire_overdue_approvals"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE approvals 
    SET 
        status = 'expired',
        updated_at = NOW()
    WHERE status IN ('pending', 'in_review')
    AND due_date IS NOT NULL 
    AND due_date < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Log the expirations
    INSERT INTO approval_history (
        approval_id,
        organization_id,
        action_type,
        action_by,
        old_status,
        new_status,
        comments
    )
    SELECT 
        id,
        organization_id,
        'expired',
        requested_by,
        'pending',
        'expired',
        'Automatically expired due to overdue deadline'
    FROM approvals
    WHERE status = 'expired'
    AND updated_at = NOW();
    
    RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."auto_expire_overdue_approvals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_project"("project_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
    user_role TEXT;
    project_org_id UUID;
    current_stage_id UUID;
    responsible_roles user_role[];
    role_exists BOOLEAN;
BEGIN
    -- Get user role and project organization
    SELECT role::TEXT INTO user_role FROM users WHERE id = auth.uid();
    SELECT organization_id, current_stage_id INTO project_org_id, current_stage_id 
    FROM projects WHERE id = project_id;
    
    -- Check organization access
    IF project_org_id != get_current_user_org_id() THEN
        RETURN FALSE;
    END IF;
    
    -- Admin and management have full access
    IF user_role IN ('admin', 'management') THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is assigned to the project
    IF EXISTS (
        SELECT 1 FROM project_assignments 
        WHERE project_id = $1 AND user_id = auth.uid()
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check workflow stage responsible roles
    IF current_stage_id IS NOT NULL THEN
        SELECT responsible_roles INTO responsible_roles 
        FROM workflow_stages 
        WHERE id = current_stage_id;
        
        -- Check if user role exists in the responsible roles array
        SELECT user_role::user_role = ANY(responsible_roles) INTO role_exists;
        IF role_exists THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    -- Sales can access all projects (customer relationship management)
    IF user_role = 'sales' THEN
        RETURN TRUE;
    END IF;
    
    -- Portal users can only access their own projects
    IF user_role IN ('customer', 'supplier') THEN
        RETURN EXISTS (
            SELECT 1 FROM projects 
            WHERE id = $1 AND (
                (user_role = 'customer' AND customer_id IN (
                    SELECT id FROM contacts WHERE email = (
                        SELECT email FROM auth.users WHERE id = auth.uid()
                    )
                )) OR
                (user_role = 'supplier' AND id IN (
                    SELECT project_id FROM supplier_rfqs WHERE supplier_id IN (
                        SELECT id FROM contacts WHERE email = (
                            SELECT email FROM auth.users WHERE id = auth.uid()
                        )
                    )
                ))
            )
        );
    END IF;
    
    RETURN FALSE;
END;
$_$;


ALTER FUNCTION "public"."can_access_project"("project_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_document_versions"("p_document_id" "uuid", "p_keep_versions" integer DEFAULT 10) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete old versions, keeping the specified number of latest versions
    -- Always keep the current version regardless of the limit
    WITH versions_to_keep AS (
        SELECT id
        FROM document_versions
        WHERE document_id = p_document_id
        AND (
            is_current = true OR
            id IN (
                SELECT id
                FROM document_versions
                WHERE document_id = p_document_id
                ORDER BY version_number DESC
                LIMIT p_keep_versions
            )
        )
    )
    DELETE FROM document_versions
    WHERE document_id = p_document_id
    AND id NOT IN (SELECT id FROM versions_to_keep);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_document_versions"("p_document_id" "uuid", "p_keep_versions" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_old_document_versions"("p_document_id" "uuid", "p_keep_versions" integer) IS 'Removes old document versions keeping only the specified number of latest versions';



CREATE OR REPLACE FUNCTION "public"."create_approval"("p_organization_id" "uuid", "p_approval_type" "public"."approval_type", "p_title" character varying, "p_description" "text", "p_entity_type" character varying, "p_entity_id" "uuid", "p_requested_by" "uuid", "p_current_approver_id" "uuid", "p_current_approver_role" character varying, "p_priority" "public"."approval_priority" DEFAULT 'normal'::"public"."approval_priority", "p_due_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_request_reason" "text" DEFAULT NULL::"text", "p_request_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_approval_id UUID;
BEGIN
    INSERT INTO approvals (
        organization_id,
        approval_type,
        title,
        description,
        entity_type,
        entity_id,
        requested_by,
        current_approver_id,
        current_approver_role,
        priority,
        due_date,
        request_reason,
        request_metadata,
        created_by
    ) VALUES (
        p_organization_id,
        p_approval_type,
        p_title,
        p_description,
        p_entity_type,
        p_entity_id,
        p_requested_by,
        p_current_approver_id,
        p_current_approver_role,
        p_priority,
        p_due_date,
        p_request_reason,
        p_request_metadata,
        p_requested_by
    ) RETURNING id INTO v_approval_id;
    
    -- Log the creation
    INSERT INTO approval_history (
        approval_id,
        organization_id,
        action_type,
        action_by,
        new_status
    ) VALUES (
        v_approval_id,
        p_organization_id,
        'created',
        p_requested_by,
        'pending'
    );
    
    RETURN v_approval_id;
END;
$$;


ALTER FUNCTION "public"."create_approval"("p_organization_id" "uuid", "p_approval_type" "public"."approval_type", "p_title" character varying, "p_description" "text", "p_entity_type" character varying, "p_entity_id" "uuid", "p_requested_by" "uuid", "p_current_approver_id" "uuid", "p_current_approver_role" character varying, "p_priority" "public"."approval_priority", "p_due_date" timestamp with time zone, "p_request_reason" "text", "p_request_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_initial_document_version"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_version_id UUID;
BEGIN
    -- Create initial version record
    INSERT INTO document_versions (
        organization_id,
        document_id,
        version_number,
        file_name,
        file_path,
        file_size,
        mime_type,
        title,
        description,
        uploaded_by,
        is_current,
        metadata
    ) VALUES (
        NEW.organization_id,
        NEW.id,
        COALESCE(NEW.version, 1),
        NEW.file_name,
        NEW.file_path,
        COALESCE(NEW.file_size, 0),
        NEW.file_type,
        NEW.title,
        NEW.description,
        NEW.uploaded_by,
        true,
        COALESCE(NEW.metadata, '{}')
    ) RETURNING id INTO v_version_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_initial_document_version"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_initial_document_version"() IS 'Automatically creates initial version record when document is created';



CREATE OR REPLACE FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" "text", "p_priority" "public"."priority_level" DEFAULT 'medium'::"public"."priority_level", "p_action_url" "text" DEFAULT NULL::"text", "p_action_label" "text" DEFAULT NULL::"text", "p_related_entity_type" "text" DEFAULT NULL::"text", "p_related_entity_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    notification_id UUID;
    user_org_id UUID;
BEGIN
    -- Get user's organization ID
    SELECT organization_id INTO user_org_id 
    FROM users 
    WHERE id = p_user_id;

    -- Insert notification
    INSERT INTO notifications (
        organization_id,
        user_id,
        title,
        message,
        type,
        priority,
        action_url,
        action_label,
        related_entity_type,
        related_entity_id
    ) VALUES (
        user_org_id,
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_priority,
        p_action_url,
        p_action_label,
        p_related_entity_type,
        p_related_entity_id
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$;


ALTER FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" "text", "p_priority" "public"."priority_level", "p_action_url" "text", "p_action_label" "text", "p_related_entity_type" "text", "p_related_entity_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_project_sub_stage_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- When a project's current_stage_id changes, create progress records for all sub-stages
    IF NEW.current_stage_id IS DISTINCT FROM OLD.current_stage_id AND NEW.current_stage_id IS NOT NULL THEN
        INSERT INTO project_sub_stage_progress (
            organization_id,
            project_id,
            workflow_stage_id,
            sub_stage_id,
            status
        )
        SELECT 
            NEW.organization_id,
            NEW.id,
            NEW.current_stage_id,
            ws.id,
            CASE 
                WHEN ws.sub_stage_order = 1 THEN 'in_progress'
                ELSE 'pending'
            END
        FROM workflow_sub_stages ws
        WHERE ws.workflow_stage_id = NEW.current_stage_id
        AND ws.is_active = true
        AND ws.is_required = true
        ON CONFLICT (project_id, sub_stage_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_project_sub_stage_progress"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expire_approval_delegations"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE approval_delegations 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND end_date < NOW();
END;
$$;


ALTER FUNCTION "public"."expire_approval_delegations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_project_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.project_id IS NULL THEN
        NEW.project_id := 'P-' || TO_CHAR(NOW(), 'YYMMDD') || 
                         LPAD((
                             SELECT COALESCE(MAX(CAST(SUBSTRING(project_id FROM 9) AS INTEGER)), 0) + 1
                             FROM projects 
                             WHERE project_id LIKE 'P-' || TO_CHAR(NOW(), 'YYMMDD') || '%'
                         )::TEXT, 2, '0');
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_project_id"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."get_current_user_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT role::TEXT
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."get_current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_summary"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_org_id UUID;
    current_user_id UUID;
    result JSONB;
    project_counts JSONB;
    recent_projects JSONB;
    status_counts JSONB;
    type_counts JSONB;
    priority_counts JSONB;
    stage_counts JSONB;
    project_record RECORD;
    debug_info JSONB;
BEGIN
    -- Get current user ID and log it for debugging
    current_user_id := auth.uid();
    
    -- Try to get user's organization ID
    SELECT organization_id INTO user_org_id
    FROM users
    WHERE id = current_user_id;
    
    -- Create debug info
    debug_info := jsonb_build_object(
        'current_user_id', current_user_id,
        'organization_id', user_org_id,
        'timestamp', extract(epoch from now())
    );
    
    -- If no organization found, try to get any organization for demo purposes
    IF user_org_id IS NULL THEN
        -- For demo/development purposes, get the first organization
        SELECT id INTO user_org_id FROM organizations LIMIT 1;
        
        -- Update debug info
        debug_info := debug_info || jsonb_build_object('fallback_to_first_org', true);
        
        -- If still no organization, return empty result with debug info
        IF user_org_id IS NULL THEN
            RETURN jsonb_build_object(
                'projects', jsonb_build_object('total', 0, 'by_status', '{}', 'by_type', '{}', 'by_priority', '{}', 'by_stage', '{}'),
                'recent_projects', '[]',
                'generated_at', extract(epoch from now()),
                'debug', debug_info
            );
        END IF;
    END IF;
    
    -- Add organization ID to debug info
    debug_info := debug_info || jsonb_build_object('using_organization_id', user_org_id);
    
    -- Get project counts by status
    status_counts := '{}';
    FOR project_record IN
        SELECT
            status,
            COUNT(*) as count
        FROM projects
        WHERE organization_id = user_org_id
        GROUP BY status
    LOOP
        status_counts := status_counts || jsonb_build_object(project_record.status, project_record.count);
    END LOOP;
    
    -- Get project counts by type
    type_counts := '{}';
    FOR project_record IN
        SELECT
            project_type,
            COUNT(*) as count
        FROM projects
        WHERE organization_id = user_org_id
        GROUP BY project_type
    LOOP
        -- Use 'other' for null project_type instead of 'unspecified' to avoid enum issues
        type_counts := type_counts || jsonb_build_object(COALESCE(project_record.project_type, 'other'), project_record.count);
    END LOOP;
    
    -- Get project counts by priority - FIX: Use valid enum values for priority_level
    priority_counts := '{}';
    FOR project_record IN
        SELECT
            COALESCE(priority_level, 'medium') as priority, -- Set default to 'medium' instead of 'unspecified'
            COUNT(*) as count
        FROM projects
        WHERE organization_id = user_org_id
        GROUP BY COALESCE(priority_level, 'medium') -- Group with the default value
    LOOP
        priority_counts := priority_counts || jsonb_build_object(project_record.priority, project_record.count);
    END LOOP;
    
    -- Get project counts by stage
    stage_counts := '{}';
    FOR project_record IN
        SELECT
            current_stage_id,
            COUNT(*) as count
        FROM projects
        WHERE organization_id = user_org_id AND current_stage_id IS NOT NULL
        GROUP BY current_stage_id
    LOOP
        stage_counts := stage_counts || jsonb_build_object(project_record.current_stage_id, project_record.count);
    END LOOP;
    
    -- Build project counts object
    project_counts := jsonb_build_object(
        'total', (SELECT COUNT(*) FROM projects WHERE organization_id = user_org_id),
        'by_status', status_counts,
        'by_type', type_counts,
        'by_priority', priority_counts,
        'by_stage', stage_counts
    );
    
    -- Get recent projects with customer information
    recent_projects := (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'organization_id', p.organization_id,
                'project_id', p.project_id,
                'title', p.title,
                'status', p.status,
                'priority_level', COALESCE(p.priority_level, 'medium'), -- Set default to 'medium' for NULL values
                'project_type', p.project_type,
                'created_at', p.created_at,
                'customer_name', p.customer_organization_name, -- Use the joined organization name
                'estimated_delivery_date', p.estimated_delivery_date,
                'current_stage', p.current_stage_id,
                'days_in_stage',
                CASE
                    WHEN p.stage_entered_at IS NOT NULL THEN
                        EXTRACT(DAY FROM (NOW() - p.stage_entered_at))
                    ELSE NULL
                END
            )
        )
        FROM (
            SELECT 
                p.*,
                o.name as customer_organization_name
            FROM projects p
            LEFT JOIN organizations o ON p.customer_organization_id = o.id
            WHERE p.organization_id = user_org_id
            ORDER BY p.created_at DESC
            LIMIT 10
        ) p
    );
    
    -- If no recent projects, set to empty array
    IF recent_projects IS NULL THEN
        recent_projects := '[]';
    END IF;
    
    -- Count projects for debug info
    debug_info := debug_info || jsonb_build_object(
        'project_count', (SELECT COUNT(*) FROM projects WHERE organization_id = user_org_id),
        'project_query', format('SELECT * FROM projects WHERE organization_id = %L', user_org_id)
    );
    
    -- Build final result
    result := jsonb_build_object(
        'projects', project_counts,
        'recent_projects', recent_projects,
        'generated_at', extract(epoch from now()),
        'debug', debug_info
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_dashboard_summary"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_dashboard_summary"() IS 'Returns enhanced dashboard summary data including project counts by status and type, and recent projects with customer information. 
Requires user to be authenticated and have an organization_id.';



CREATE OR REPLACE FUNCTION "public"."get_document_version_history"("p_document_id" "uuid") RETURNS TABLE("version_id" "uuid", "version_number" integer, "file_name" character varying, "file_size" bigint, "mime_type" character varying, "title" character varying, "description" "text", "change_summary" "text", "uploaded_by" "uuid", "uploader_name" character varying, "uploader_email" character varying, "uploaded_at" timestamp with time zone, "is_current" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dv.id,
        dv.version_number,
        dv.file_name,
        dv.file_size,
        dv.mime_type,
        dv.title,
        dv.description,
        dv.change_summary,
        dv.uploaded_by,
        u.name as uploader_name,
        u.email as uploader_email,
        dv.uploaded_at,
        dv.is_current
    FROM document_versions dv
    LEFT JOIN users u ON dv.uploaded_by = u.id
    WHERE dv.document_id = p_document_id
    ORDER BY dv.version_number DESC;
END;
$$;


ALTER FUNCTION "public"."get_document_version_history"("p_document_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_document_version_history"("p_document_id" "uuid") IS 'Returns complete version history for a document';



CREATE OR REPLACE FUNCTION "public"."get_pending_approvals_for_user"("p_user_id" "uuid") RETURNS TABLE("approval_id" "uuid", "approval_type" "public"."approval_type", "title" character varying, "description" "text", "entity_type" character varying, "entity_id" "uuid", "priority" "public"."approval_priority", "due_date" timestamp with time zone, "created_at" timestamp with time zone, "requested_by_name" character varying, "days_overdue" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.approval_type,
        a.title,
        a.description,
        a.entity_type,
        a.entity_id,
        a.priority,
        a.due_date,
        a.created_at,
        u.name as requested_by_name,
        CASE 
            WHEN a.due_date IS NOT NULL AND a.due_date < NOW() 
            THEN EXTRACT(DAY FROM NOW() - a.due_date)::INTEGER
            ELSE 0
        END as days_overdue
    FROM approvals a
    JOIN users u ON a.requested_by = u.id
    WHERE a.current_approver_id = p_user_id
    AND a.status IN ('pending', 'in_review')
    AND a.organization_id IN (
        SELECT organization_id FROM users WHERE id = p_user_id
    )
    ORDER BY 
        CASE 
            WHEN a.due_date IS NOT NULL AND a.due_date < NOW() THEN 0
            WHEN a.priority = 'critical' THEN 1
            WHEN a.priority = 'urgent' THEN 2
            WHEN a.priority = 'high' THEN 3
            WHEN a.priority = 'normal' THEN 4
            ELSE 5
        END,
        a.created_at ASC;
END;
$$;


ALTER FUNCTION "public"."get_pending_approvals_for_user"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_project_contacts"("project_uuid" "uuid") RETURNS TABLE("contact_id" "uuid", "contact_name" character varying, "email" character varying, "phone" character varying, "role" character varying, "is_primary_contact" boolean, "is_project_primary" boolean, "company_name" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as contact_id,
        c.contact_name,
        c.email,
        c.phone,
        c.role,
        c.is_primary_contact,
        (c.id = p.point_of_contacts[1]) as is_project_primary,
        c.company_name
    FROM projects p
    CROSS JOIN UNNEST(p.point_of_contacts) WITH ORDINALITY AS contact_ids(contact_id, position)
    JOIN contacts c ON c.id = contact_ids.contact_id
    WHERE p.id = project_uuid
    ORDER BY contact_ids.position;
END;
$$;


ALTER FUNCTION "public"."get_project_contacts"("project_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_project_primary_contact"("project_uuid" "uuid") RETURNS TABLE("contact_id" "uuid", "contact_name" character varying, "email" character varying, "phone" character varying, "role" character varying, "company_name" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as contact_id,
        c.contact_name,
        c.email,
        c.phone,
        c.role,
        c.company_name
    FROM projects p
    JOIN contacts c ON c.id = p.point_of_contacts[1]
    WHERE p.id = project_uuid
    AND array_length(p.point_of_contacts, 1) > 0;
END;
$$;


ALTER FUNCTION "public"."get_project_primary_contact"("project_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_organization"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (SELECT organization_id FROM users WHERE id = auth.uid());
END;
$$;


ALTER FUNCTION "public"."get_user_organization"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_project_stage_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    stage_name TEXT;
    assigned_users UUID[];
    user_id UUID;
BEGIN
    -- Only proceed if stage actually changed
    IF OLD.current_stage_id IS DISTINCT FROM NEW.current_stage_id THEN
        -- Get stage name
        SELECT name INTO stage_name 
        FROM workflow_stages 
        WHERE id = NEW.current_stage_id;

        -- Update stage_entered_at
        NEW.stage_entered_at = NOW();

        -- Get assigned users for notifications
        SELECT ARRAY_AGG(user_id) INTO assigned_users
        FROM project_assignments 
        WHERE project_id = NEW.id AND is_active = true;

        -- Create notifications for assigned users
        FOREACH user_id IN ARRAY assigned_users
        LOOP
            PERFORM create_notification(
                user_id,
                'Project Stage Updated',
                'Project ' || NEW.project_id || ' moved to ' || stage_name,
                'stage_change',
                'medium',
                '/projects/' || NEW.id,
                'View Project',
                'project',
                NEW.id
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_project_stage_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_approval_overdue"("p_approval_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_due_date TIMESTAMPTZ;
    v_status approval_status;
BEGIN
    SELECT due_date, status
    INTO v_due_date, v_status
    FROM approvals
    WHERE id = p_approval_id;
    
    RETURN v_due_date IS NOT NULL 
           AND v_due_date < NOW() 
           AND v_status IN ('pending', 'in_review');
END;
$$;


ALTER FUNCTION "public"."is_approval_overdue"("p_approval_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_internal_user"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT role IN ('admin', 'management', 'sales', 'procurement', 'engineering', 'qa', 'production')
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."is_internal_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_portal_user"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT role IN ('customer', 'supplier')
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."is_portal_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    user_org_id UUID;
    entity_org_id UUID;
    entity_project_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Get user's organization ID
    IF current_user_id IS NOT NULL THEN
        SELECT organization_id INTO user_org_id 
        FROM users 
        WHERE id = current_user_id;
    END IF;

    -- Get entity's organization ID (fallback chain)
    entity_org_id := COALESCE(NEW.organization_id, OLD.organization_id, user_org_id);
    
    -- Try to determine project_id for better analytics
    -- Check if the entity itself is a project
    IF TG_TABLE_NAME = 'projects' THEN
        entity_project_id := COALESCE(NEW.id, OLD.id);
    -- Check if the entity has a project_id field (like documents, messages, etc.)
    ELSIF TG_TABLE_NAME IN ('documents', 'messages', 'project_assignments', 'project_sub_stage_progress') THEN
        entity_project_id := COALESCE(NEW.project_id, OLD.project_id);
    -- For other entities, try to get project_id from metadata if it's a JSON field
    ELSIF TG_TABLE_NAME = 'activity_log' THEN
        -- When inserting into activity_log directly, preserve existing project_id
        entity_project_id := COALESCE(NEW.project_id, OLD.project_id);
    END IF;

    -- Only log if we have an organization ID
    IF entity_org_id IS NOT NULL THEN
        INSERT INTO activity_log (
            organization_id,
            user_id,
            entity_type,
            entity_id,
            action,
            description,
            old_values,
            new_values,
            project_id  -- Add project_id to the insert
        ) VALUES (
            entity_org_id,
            current_user_id,  -- Use the variable instead of calling auth.uid() again
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Created ' || TG_TABLE_NAME
                WHEN TG_OP = 'UPDATE' THEN 'Updated ' || TG_TABLE_NAME
                WHEN TG_OP = 'DELETE' THEN 'Deleted ' || TG_TABLE_NAME
                ELSE TG_OP || ' ' || TG_TABLE_NAME
            END,
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
            entity_project_id  -- Include the determined project_id
        );
    ELSE
        -- Log to server logs when we can't determine organization_id for debugging
        RAISE LOG 'log_activity: Could not determine organization_id for table %, operation %', TG_TABLE_NAME, TG_OP;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."log_activity"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."log_activity"() IS 'Enhanced activity logging function that automatically populates project_id for better analytics. Handles edge cases with better error logging.';



CREATE OR REPLACE FUNCTION "public"."remove_contact_from_project"("project_uuid" "uuid", "contact_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE projects 
    SET point_of_contacts = array_remove(point_of_contacts, contact_uuid)
    WHERE id = project_uuid;
    
    RETURN true;
END;
$$;


ALTER FUNCTION "public"."remove_contact_from_project"("project_uuid" "uuid", "contact_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_approval_expires_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.due_date IS NOT NULL AND NEW.expires_at IS NULL THEN
        NEW.expires_at = NEW.due_date + INTERVAL '1 day';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_approval_expires_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_approval_decision"("p_approval_id" "uuid", "p_decision" "public"."approval_status", "p_comments" "text" DEFAULT NULL::"text", "p_reason" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_old_status approval_status;
    v_organization_id UUID;
    v_current_approver_id UUID;
BEGIN
    -- Get current approval details
    SELECT status, organization_id, current_approver_id
    INTO v_old_status, v_organization_id, v_current_approver_id
    FROM approvals
    WHERE id = p_approval_id;
    
    -- Check if approval exists and user can approve
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Approval not found';
    END IF;
    
    IF v_current_approver_id != auth.uid() THEN
        RAISE EXCEPTION 'User not authorized to approve this request';
    END IF;
    
    IF v_old_status != 'pending' AND v_old_status != 'in_review' THEN
        RAISE EXCEPTION 'Approval is not in a state that can be decided';
    END IF;
    
    -- Update approval
    UPDATE approvals SET
        status = p_decision,
        decision_comments = p_comments,
        decision_reason = p_reason,
        decision_metadata = p_metadata,
        decided_at = NOW(),
        decided_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_approval_id;
    
    -- Log the decision
    INSERT INTO approval_history (
        approval_id,
        organization_id,
        action_type,
        action_by,
        old_status,
        new_status,
        comments
    ) VALUES (
        p_approval_id,
        v_organization_id,
        CASE 
            WHEN p_decision = 'approved' THEN 'approved'
            WHEN p_decision = 'rejected' THEN 'rejected'
            ELSE 'updated'
        END,
        auth.uid(),
        v_old_status,
        p_decision,
        p_comments
    );
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."submit_approval_decision"("p_approval_id" "uuid", "p_decision" "public"."approval_status", "p_comments" "text", "p_reason" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_approval_delegations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_approval_delegations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_approval_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_approval_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_document_link_access"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update access count and last accessed time
    UPDATE documents 
    SET 
        link_access_count = link_access_count + 1,
        link_last_accessed = NOW()
    WHERE id = NEW.document_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_document_link_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_document_on_version_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- If this version is being set as current, update the main document record
    IF NEW.is_current = true AND (OLD.is_current IS NULL OR OLD.is_current = false) THEN
        -- Update the main document record
        UPDATE documents SET
            file_name = NEW.file_name,
            file_path = NEW.file_path,
            file_size = NEW.file_size,
            file_type = NEW.mime_type,
            version = NEW.version_number,
            is_current_version = true,
            updated_at = NOW()
        WHERE id = NEW.document_id;
        
        -- Ensure only one version is marked as current
        UPDATE document_versions SET
            is_current = false
        WHERE document_id = NEW.document_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_document_on_version_change"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_document_on_version_change"() IS 'Updates main document record when version is changed';



CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_workflow_stage_sub_stages_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update the count when sub-stages are inserted, updated, or deleted
    UPDATE workflow_stages 
    SET sub_stages_count = (
        SELECT COUNT(*) 
        FROM workflow_sub_stages 
        WHERE workflow_stage_id = COALESCE(NEW.workflow_stage_id, OLD.workflow_stage_id)
        AND is_active = true
    )
    WHERE id = COALESCE(NEW.workflow_stage_id, OLD.workflow_stage_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_workflow_stage_sub_stages_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_contact_migration"() RETURNS TABLE("validation_type" character varying, "count_value" integer, "status" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check projects with contact points but empty array
    RETURN QUERY
    SELECT 
        'projects_missing_contacts'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM projects p
    WHERE EXISTS (
        SELECT 1 FROM project_contact_points pcp 
        WHERE pcp.project_id = p.id
    )
    AND (p.point_of_contacts IS NULL OR array_length(p.point_of_contacts, 1) IS NULL);
    
    -- Check for invalid contact IDs in arrays
    RETURN QUERY
    SELECT 
        'invalid_contact_ids'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM (
        SELECT UNNEST(p.point_of_contacts) as contact_id
        FROM projects p
        WHERE p.point_of_contacts IS NOT NULL
    ) contact_ids
    LEFT JOIN contacts c ON contact_ids.contact_id = c.id
    WHERE c.id IS NULL;
    
    -- Check primary contact consistency
    RETURN QUERY
    SELECT 
        'primary_contact_consistency'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'WARNING'::VARCHAR(20)
        END as status
    FROM projects p
    WHERE array_length(p.point_of_contacts, 1) > 0
    AND NOT EXISTS (
        SELECT 1 FROM project_contact_points pcp
        WHERE pcp.project_id = p.id 
        AND pcp.contact_id = p.point_of_contacts[1]
        AND pcp.is_primary = true
    );
END;
$$;


ALTER FUNCTION "public"."validate_contact_migration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_customer_organization_migration"() RETURNS TABLE("validation_type" character varying, "count_value" integer, "status" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check for projects with customer_id but no customer_organization_id
    RETURN QUERY
    SELECT 
        'projects_without_org'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM projects 
    WHERE customer_id IS NOT NULL AND customer_organization_id IS NULL;
    
    -- Check for orphaned project_contact_points
    RETURN QUERY
    SELECT 
        'orphaned_contact_points'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM project_contact_points pcp
    LEFT JOIN projects p ON pcp.project_id = p.id
    WHERE p.id IS NULL;
    
    -- Check for contacts without organization_id
    RETURN QUERY
    SELECT 
        'contacts_without_org'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM contacts 
    WHERE type = 'customer' AND organization_id IS NULL;
END;
$$;


ALTER FUNCTION "public"."validate_customer_organization_migration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_migration_before_cleanup"() RETURNS TABLE("validation_type" character varying, "count_value" integer, "status" character varying, "details" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check all projects have been migrated
    RETURN QUERY
    SELECT 
        'projects_with_contacts'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) > 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status,
        'Projects with migrated contact arrays'::TEXT as details
    FROM projects 
    WHERE point_of_contacts IS NOT NULL AND array_length(point_of_contacts, 1) > 0;
    
    -- Check for projects that still rely on customer_id
    RETURN QUERY
    SELECT 
        'projects_using_customer_id'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'WARNING'::VARCHAR(20)
        END as status,
        'Projects still using old customer_id field'::TEXT as details
    FROM projects 
    WHERE customer_id IS NOT NULL 
    AND (point_of_contacts IS NULL OR array_length(point_of_contacts, 1) IS NULL);
    
    -- Check data consistency between old and new models
    RETURN QUERY
    SELECT 
        'data_consistency_check'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'WARNING'::VARCHAR(20)
        END as status,
        'Projects where old customer_id is not in new contact array'::TEXT as details
    FROM projects p
    WHERE p.customer_id IS NOT NULL 
    AND p.point_of_contacts IS NOT NULL
    AND NOT (p.customer_id = ANY(p.point_of_contacts));
END;
$$;


ALTER FUNCTION "public"."validate_migration_before_cleanup"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "entity_type" character varying(50) NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "action" character varying(100) NOT NULL,
    "description" "text",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "project_id" "uuid"
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


COMMENT ON COLUMN "public"."activity_log"."project_id" IS 'Optional reference to the project associated with this activity for analytics purposes';



CREATE TABLE IF NOT EXISTS "public"."approval_attachments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "original_file_name" character varying(255) NOT NULL,
    "file_type" character varying(100) NOT NULL,
    "file_size" bigint NOT NULL,
    "file_url" "text" NOT NULL,
    "mime_type" character varying(100),
    "attachment_type" character varying(50) DEFAULT 'supporting_document'::character varying,
    "description" "text",
    "uploaded_by" "uuid" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."approval_attachments" OWNER TO "postgres";


COMMENT ON TABLE "public"."approval_attachments" IS 'Supporting documents and files attached to approvals';



CREATE TABLE IF NOT EXISTS "public"."approval_chains" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "chain_name" character varying(255) NOT NULL,
    "entity_type" character varying(50) NOT NULL,
    "conditions" "jsonb" NOT NULL,
    "steps" "jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."approval_chains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approval_delegation_mappings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "delegation_id" "uuid" NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."approval_delegation_mappings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approval_delegations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "delegator_id" "uuid" NOT NULL,
    "delegate_id" "uuid" NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "reason" "text" NOT NULL,
    "include_new_approvals" boolean DEFAULT true,
    "status" "text" DEFAULT 'active'::"text",
    "organization_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "approval_delegations_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."approval_delegations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approval_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "action_type" character varying(50) NOT NULL,
    "action_by" "uuid" NOT NULL,
    "action_at" timestamp with time zone DEFAULT "now"(),
    "old_status" "public"."approval_status",
    "new_status" "public"."approval_status",
    "comments" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."approval_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."approval_history" IS 'Audit trail for all approval actions and status changes';



CREATE TABLE IF NOT EXISTS "public"."approval_notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "notification_type" character varying(50) NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "recipient_type" character varying(20) DEFAULT 'approver'::character varying,
    "subject" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "notification_data" "jsonb" DEFAULT '{}'::"jsonb",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "delivered_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "delivery_status" character varying(20) DEFAULT 'sent'::character varying,
    "delivery_method" character varying(20) DEFAULT 'in_app'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "approval_notifications_delivery_method_check" CHECK ((("delivery_method")::"text" = ANY (ARRAY[('in_app'::character varying)::"text", ('email'::character varying)::"text", ('sms'::character varying)::"text", ('push'::character varying)::"text"]))),
    CONSTRAINT "approval_notifications_delivery_status_check" CHECK ((("delivery_status")::"text" = ANY (ARRAY[('sent'::character varying)::"text", ('delivered'::character varying)::"text", ('read'::character varying)::"text", ('failed'::character varying)::"text"])))
);


ALTER TABLE "public"."approval_notifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."approval_notifications" IS 'Notification history for approval-related communications';



CREATE TABLE IF NOT EXISTS "public"."approvals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "approval_type" "public"."approval_type" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "reference_id" character varying(100),
    "entity_type" character varying(50) NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "approval_chain_id" "uuid",
    "step_number" integer DEFAULT 1,
    "total_steps" integer DEFAULT 1,
    "requested_by" "uuid" NOT NULL,
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "request_reason" "text",
    "request_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "current_approver_id" "uuid",
    "current_approver_role" character varying(50),
    "current_approver_department" character varying(100),
    "status" "public"."approval_status" DEFAULT 'pending'::"public"."approval_status",
    "priority" "public"."approval_priority" DEFAULT 'normal'::"public"."approval_priority",
    "due_date" timestamp with time zone,
    "expires_at" timestamp with time zone,
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
    "delegation_end_date" timestamp with time zone,
    "auto_approval_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "auto_approved_at" timestamp with time zone,
    "auto_approval_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "valid_decision_timing" CHECK ((("decided_at" IS NULL) OR ("decided_at" >= "created_at"))),
    CONSTRAINT "valid_delegation_end" CHECK ((("delegation_end_date" IS NULL) OR ("delegation_end_date" > "delegated_at"))),
    CONSTRAINT "valid_due_date" CHECK ((("due_date" IS NULL) OR ("due_date" > "created_at"))),
    CONSTRAINT "valid_expires_at" CHECK ((("expires_at" IS NULL) OR ("expires_at" > "created_at")))
);


ALTER TABLE "public"."approvals" OWNER TO "postgres";


COMMENT ON TABLE "public"."approvals" IS 'Centralized approval management table for all approval types in the system';



COMMENT ON COLUMN "public"."approvals"."approval_type" IS 'Type of approval (stage transition, document, engineering change, etc.)';



COMMENT ON COLUMN "public"."approvals"."entity_type" IS 'Type of entity being approved (project, document, supplier, etc.)';



COMMENT ON COLUMN "public"."approvals"."entity_id" IS 'ID of the entity being approved';



COMMENT ON COLUMN "public"."approvals"."step_number" IS 'Current step in multi-step approval process';



COMMENT ON COLUMN "public"."approvals"."total_steps" IS 'Total number of steps in approval chain';



COMMENT ON COLUMN "public"."approvals"."priority" IS 'Approval priority level affecting due dates and notifications';



COMMENT ON COLUMN "public"."approvals"."decision_metadata" IS 'Additional metadata about the approval decision';



COMMENT ON COLUMN "public"."approvals"."auto_approval_rules" IS 'JSON rules for automatic approval based on conditions';



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
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."contacts"."role" IS 'Role of the contact person (purchasing, engineering, quality, etc.)';



COMMENT ON COLUMN "public"."contacts"."is_primary_contact" IS 'Indicates if this is the primary contact for the organization';



CREATE TABLE IF NOT EXISTS "public"."document_access_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid",
    "user_id" "uuid",
    "action" character varying(20) NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "accessed_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "document_access_log_action_check" CHECK ((("action")::"text" = ANY (ARRAY[('view'::character varying)::"text", ('download'::character varying)::"text", ('upload'::character varying)::"text", ('delete'::character varying)::"text", ('share'::character varying)::"text", ('comment'::character varying)::"text", ('approve'::character varying)::"text"])))
);


ALTER TABLE "public"."document_access_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_versions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "document_id" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" bigint NOT NULL,
    "mime_type" character varying(100),
    "title" character varying(255) NOT NULL,
    "description" "text",
    "change_summary" "text",
    "uploaded_by" "uuid",
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "is_current" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "positive_file_size" CHECK (("file_size" >= 0)),
    CONSTRAINT "positive_version_number" CHECK (("version_number" > 0))
);


ALTER TABLE "public"."document_versions" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_versions" IS 'Version history for documents with file tracking and metadata';



COMMENT ON COLUMN "public"."document_versions"."version_number" IS 'Sequential version number starting from 1';



COMMENT ON COLUMN "public"."document_versions"."change_summary" IS 'Summary of changes made in this version';



COMMENT ON COLUMN "public"."document_versions"."is_current" IS 'Whether this is the current active version';



COMMENT ON COLUMN "public"."document_versions"."metadata" IS 'Additional version-specific metadata';



CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text",
    "file_name" character varying(255) NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" bigint,
    "file_type" character varying(100),
    "mime_type" character varying(100),
    "version" integer DEFAULT 1,
    "is_current_version" boolean DEFAULT true,
    "category" character varying(100),
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "access_level" character varying(50) DEFAULT 'internal'::character varying,
    "uploaded_by" "uuid",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "external_id" character varying(255),
    "external_url" "text",
    "storage_provider" character varying(50) DEFAULT 'supabase'::character varying,
    "sync_status" character varying(20) DEFAULT 'synced'::character varying,
    "last_synced_at" timestamp with time zone,
    "ai_extracted_data" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_processing_status" character varying(20) DEFAULT 'pending'::character varying,
    "ai_confidence_score" numeric(5,2),
    "ai_processed_at" timestamp with time zone,
    "link_type" character varying(50) DEFAULT 'file'::character varying,
    "link_permissions" "jsonb" DEFAULT '{}'::"jsonb",
    "link_expires_at" timestamp with time zone,
    "link_access_count" integer DEFAULT 0,
    "link_last_accessed" timestamp with time zone,
    CONSTRAINT "documents_ai_processing_status_check" CHECK ((("ai_processing_status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('processing'::character varying)::"text", ('completed'::character varying)::"text", ('failed'::character varying)::"text", ('skipped'::character varying)::"text"]))),
    CONSTRAINT "documents_link_type_check" CHECK ((("link_type")::"text" = ANY (ARRAY[('file'::character varying)::"text", ('folder'::character varying)::"text", ('shared_link'::character varying)::"text", ('embed'::character varying)::"text"]))),
    CONSTRAINT "documents_storage_provider_check" CHECK ((("storage_provider")::"text" = ANY (ARRAY[('supabase'::character varying)::"text", ('google_drive'::character varying)::"text", ('dropbox'::character varying)::"text", ('onedrive'::character varying)::"text", ('s3'::character varying)::"text", ('azure_blob'::character varying)::"text"]))),
    CONSTRAINT "documents_sync_status_check" CHECK ((("sync_status")::"text" = ANY (ARRAY[('synced'::character varying)::"text", ('pending'::character varying)::"text", ('failed'::character varying)::"text", ('conflict'::character varying)::"text"])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


COMMENT ON COLUMN "public"."documents"."link_type" IS 'Type of link: file, folder, shared_link, or embed';



COMMENT ON COLUMN "public"."documents"."link_permissions" IS 'JSON object containing link permissions and access controls';



COMMENT ON COLUMN "public"."documents"."link_expires_at" IS 'Expiration date for temporary links';



COMMENT ON COLUMN "public"."documents"."link_access_count" IS 'Number of times the link has been accessed';



COMMENT ON COLUMN "public"."documents"."link_last_accessed" IS 'Last time the link was accessed';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "sender_id" "uuid" NOT NULL,
    "recipient_id" "uuid",
    "recipient_type" character varying(50) DEFAULT 'user'::character varying,
    "subject" character varying(255),
    "content" "text" NOT NULL,
    "message_type" character varying(50) DEFAULT 'internal'::character varying,
    "priority" "public"."priority_level" DEFAULT 'medium'::"public"."priority_level",
    "status" character varying(50) DEFAULT 'sent'::character varying,
    "thread_id" "uuid",
    "parent_message_id" "uuid",
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "type" character varying(50) NOT NULL,
    "priority" "public"."priority_level" DEFAULT 'medium'::"public"."priority_level",
    "status" character varying(50) DEFAULT 'unread'::character varying,
    "action_url" "text",
    "action_label" character varying(100),
    "related_entity_type" character varying(50),
    "related_entity_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "expires_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
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
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."organizations"."organization_type" IS 'Type of organization: internal, customer, supplier, or partner';



CREATE TABLE IF NOT EXISTS "public"."project_assignments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(100) NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "assigned_by" "uuid",
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."project_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_contact_points_backup" (
    "id" "uuid",
    "project_id" "uuid",
    "contact_id" "uuid",
    "role" character varying(100),
    "is_primary" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "backup_created_at" timestamp with time zone
);


ALTER TABLE "public"."project_contact_points_backup" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_contact_points_backup" IS 'Backup of project_contact_points before migration cleanup. Can be dropped after verification.';



CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" character varying(50) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "current_stage_id" "uuid",
    "status" "public"."project_status" DEFAULT 'active'::"public"."project_status",
    "priority_score" integer DEFAULT 50,
    "priority_level" "public"."priority_level" DEFAULT 'medium'::"public"."priority_level",
    "estimated_value" numeric(15,2),
    "estimated_delivery_date" timestamp with time zone,
    "actual_delivery_date" timestamp with time zone,
    "source" character varying(50),
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "stage_entered_at" timestamp with time zone DEFAULT "now"(),
    "project_type" character varying(100),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "assigned_to" "uuid",
    "intake_type" "public"."intake_type",
    "intake_source" character varying(50) DEFAULT 'portal'::character varying,
    "volume" "jsonb",
    "target_price_per_unit" numeric(15,2),
    "project_reference" "text",
    "desired_delivery_date" "date",
    "customer_organization_id" "uuid",
    "point_of_contacts" "uuid"[] DEFAULT '{}'::"uuid"[]
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


COMMENT ON COLUMN "public"."projects"."intake_type" IS 'Classification of how the project was submitted (RFQ, Purchase Order, Project Idea, etc.)';



COMMENT ON COLUMN "public"."projects"."intake_source" IS 'Source of the project intake (portal, email, api, etc.)';



COMMENT ON COLUMN "public"."projects"."volume" IS 'Multi-tier volume data with quantity, unit, and frequency (JSONB format)';



COMMENT ON COLUMN "public"."projects"."target_price_per_unit" IS 'Target price per unit in USD';



COMMENT ON COLUMN "public"."projects"."project_reference" IS 'External project reference (e.g., PO-2025-TECHNOVA-001)';



COMMENT ON COLUMN "public"."projects"."desired_delivery_date" IS 'Customer desired delivery date (separate from estimated_delivery_date)';



COMMENT ON COLUMN "public"."projects"."customer_organization_id" IS 'References the customer organization for this project. Replaces direct customer contact relationship.';



COMMENT ON COLUMN "public"."projects"."point_of_contacts" IS 'Array of contact IDs for this project. First contact is primary contact.';



CREATE OR REPLACE VIEW "public"."project_details_view" AS
 SELECT "p"."id",
    "p"."organization_id",
    "p"."project_id",
    "p"."title",
    "p"."description",
    "p"."current_stage_id",
    "p"."status",
    "p"."priority_score",
    "p"."priority_level",
    "p"."estimated_value",
    "p"."estimated_delivery_date",
    "p"."actual_delivery_date",
    "p"."source",
    "p"."tags",
    "p"."metadata",
    "p"."stage_entered_at",
    "p"."project_type",
    "p"."notes",
    "p"."created_at",
    "p"."updated_at",
    "p"."created_by",
    "p"."assigned_to",
    "p"."intake_type",
    "p"."intake_source",
    "p"."volume",
    "p"."target_price_per_unit",
    "p"."project_reference",
    "p"."desired_delivery_date",
    "p"."customer_organization_id",
    "p"."point_of_contacts",
    "o"."name" AS "customer_organization_name",
    "o"."slug" AS "customer_organization_slug",
    "o"."address" AS "customer_address",
    "o"."city" AS "customer_city",
    "o"."country" AS "customer_country",
    "o"."website" AS "customer_website",
        CASE
            WHEN ("array_length"("p"."point_of_contacts", 1) > 0) THEN (( SELECT "c"."contact_name"
               FROM "public"."contacts" "c"
              WHERE ("c"."id" = "p"."point_of_contacts"[1])))::character varying
            ELSE NULL::character varying
        END AS "primary_contact_name",
        CASE
            WHEN ("array_length"("p"."point_of_contacts", 1) > 0) THEN (( SELECT "c"."email"
               FROM "public"."contacts" "c"
              WHERE ("c"."id" = "p"."point_of_contacts"[1])))::character varying
            ELSE NULL::character varying
        END AS "primary_contact_email",
        CASE
            WHEN ("array_length"("p"."point_of_contacts", 1) > 0) THEN (( SELECT "c"."phone"
               FROM "public"."contacts" "c"
              WHERE ("c"."id" = "p"."point_of_contacts"[1])))::character varying
            ELSE NULL::character varying
        END AS "primary_contact_phone",
    COALESCE("array_length"("p"."point_of_contacts", 1), 0) AS "contact_count"
   FROM ("public"."projects" "p"
     LEFT JOIN "public"."organizations" "o" ON (("p"."customer_organization_id" = "o"."id")));


ALTER VIEW "public"."project_details_view" OWNER TO "postgres";


COMMENT ON VIEW "public"."project_details_view" IS 'Optimized view for project details with customer organization and primary contact info';



CREATE TABLE IF NOT EXISTS "public"."project_sub_stage_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "workflow_stage_id" "uuid" NOT NULL,
    "sub_stage_id" "uuid" NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "assigned_to" "uuid",
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "project_sub_stage_progress_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('in_progress'::character varying)::"text", ('completed'::character varying)::"text", ('skipped'::character varying)::"text", ('blocked'::character varying)::"text"])))
);


ALTER TABLE "public"."project_sub_stage_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "review_type" character varying(50) NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "priority" "public"."priority_level" DEFAULT 'medium'::"public"."priority_level",
    "comments" "text",
    "recommendations" "text",
    "decision" character varying(50),
    "decision_reason" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "due_date" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_quotes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "quote_number" character varying(100),
    "total_amount" numeric(15,2),
    "currency" character varying(3) DEFAULT 'VND'::character varying,
    "lead_time_days" integer,
    "valid_until" timestamp with time zone,
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "terms_and_conditions" "text",
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "submitted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."supplier_quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_rfqs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "supplier_id" "uuid",
    "rfq_number" character varying(50) NOT NULL,
    "status" character varying(20) DEFAULT 'draft'::character varying,
    "sent_at" timestamp with time zone,
    "viewed_at" timestamp with time zone,
    "due_date" timestamp with time zone,
    "expected_response_date" "date",
    "priority" character varying(10) DEFAULT 'medium'::character varying,
    "requirements" "text",
    "special_instructions" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "supplier_rfqs_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('draft'::character varying)::"text", ('sent'::character varying)::"text", ('viewed'::character varying)::"text", ('quoted'::character varying)::"text", ('declined'::character varying)::"text", ('expired'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."supplier_rfqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
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


CREATE TABLE IF NOT EXISTS "public"."workflow_stages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "color" character varying(7) DEFAULT '#3B82F6'::character varying,
    "stage_order" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "exit_criteria" "text",
    "responsible_roles" "public"."user_role"[] DEFAULT '{}'::"public"."user_role"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "estimated_duration_days" integer DEFAULT 0
);


ALTER TABLE "public"."workflow_stages" OWNER TO "postgres";


COMMENT ON COLUMN "public"."workflow_stages"."estimated_duration_days" IS 'Estimated duration of this stage in days for project planning';



CREATE TABLE IF NOT EXISTS "public"."workflow_sub_stages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "workflow_stage_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "color" character varying(7) DEFAULT '#6B7280'::character varying,
    "sub_stage_order" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "exit_criteria" "text",
    "responsible_roles" "public"."user_role"[] DEFAULT '{}'::"public"."user_role"[],
    "estimated_duration_hours" integer,
    "is_required" boolean DEFAULT true,
    "can_skip" boolean DEFAULT false,
    "auto_advance" boolean DEFAULT false,
    "requires_approval" boolean DEFAULT false,
    "approval_roles" "public"."user_role"[] DEFAULT '{}'::"public"."user_role"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_sub_stages" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_attachments"
    ADD CONSTRAINT "approval_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_chains"
    ADD CONSTRAINT "approval_chains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_delegation_mappings"
    ADD CONSTRAINT "approval_delegation_mappings_delegation_id_approval_id_key" UNIQUE ("delegation_id", "approval_id");



ALTER TABLE ONLY "public"."approval_delegation_mappings"
    ADD CONSTRAINT "approval_delegation_mappings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_delegations"
    ADD CONSTRAINT "approval_delegations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_notifications"
    ADD CONSTRAINT "approval_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_access_log"
    ADD CONSTRAINT "document_access_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."project_assignments"
    ADD CONSTRAINT "project_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_assignments"
    ADD CONSTRAINT "project_assignments_project_id_user_id_role_key" UNIQUE ("project_id", "user_id", "role");



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_project_id_sub_stage_id_key" UNIQUE ("project_id", "sub_stage_id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_project_id_key" UNIQUE ("project_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_quotes"
    ADD CONSTRAINT "supplier_quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_rfq_number_key" UNIQUE ("rfq_number");



ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "unique_document_version" UNIQUE ("document_id", "version_number");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_stages"
    ADD CONSTRAINT "workflow_stages_organization_id_slug_key" UNIQUE ("organization_id", "slug");



ALTER TABLE ONLY "public"."workflow_stages"
    ADD CONSTRAINT "workflow_stages_organization_id_stage_order_key" UNIQUE ("organization_id", "stage_order");



ALTER TABLE ONLY "public"."workflow_stages"
    ADD CONSTRAINT "workflow_stages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_sub_stages"
    ADD CONSTRAINT "workflow_sub_stages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_sub_stages"
    ADD CONSTRAINT "workflow_sub_stages_workflow_stage_id_slug_key" UNIQUE ("workflow_stage_id", "slug");



ALTER TABLE ONLY "public"."workflow_sub_stages"
    ADD CONSTRAINT "workflow_sub_stages_workflow_stage_id_sub_stage_order_key" UNIQUE ("workflow_stage_id", "sub_stage_order");



CREATE INDEX "activity_log_project_id_idx" ON "public"."activity_log" USING "btree" ("project_id");



CREATE INDEX "idx_activity_log_created_at" ON "public"."activity_log" USING "btree" ("created_at");



CREATE INDEX "idx_activity_log_entity" ON "public"."activity_log" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_activity_log_org_id" ON "public"."activity_log" USING "btree" ("organization_id");



CREATE INDEX "idx_activity_log_user_id" ON "public"."activity_log" USING "btree" ("user_id");



CREATE INDEX "idx_approval_attachments_approval" ON "public"."approval_attachments" USING "btree" ("approval_id");



CREATE INDEX "idx_approval_attachments_type" ON "public"."approval_attachments" USING "btree" ("attachment_type");



CREATE INDEX "idx_approval_attachments_uploaded_by" ON "public"."approval_attachments" USING "btree" ("uploaded_by");



CREATE INDEX "idx_approval_delegation_mappings_approval" ON "public"."approval_delegation_mappings" USING "btree" ("approval_id");



CREATE INDEX "idx_approval_delegation_mappings_delegation" ON "public"."approval_delegation_mappings" USING "btree" ("delegation_id");



CREATE INDEX "idx_approval_delegations_dates" ON "public"."approval_delegations" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_approval_delegations_delegate" ON "public"."approval_delegations" USING "btree" ("delegate_id");



CREATE INDEX "idx_approval_delegations_delegator" ON "public"."approval_delegations" USING "btree" ("delegator_id");



CREATE INDEX "idx_approval_delegations_org" ON "public"."approval_delegations" USING "btree" ("organization_id");



CREATE INDEX "idx_approval_delegations_status" ON "public"."approval_delegations" USING "btree" ("status");



CREATE INDEX "idx_approval_history_action_at" ON "public"."approval_history" USING "btree" ("action_at");



CREATE INDEX "idx_approval_history_action_by" ON "public"."approval_history" USING "btree" ("action_by");



CREATE INDEX "idx_approval_history_approval" ON "public"."approval_history" USING "btree" ("approval_id");



CREATE INDEX "idx_approval_history_status" ON "public"."approval_history" USING "btree" ("old_status", "new_status");



CREATE INDEX "idx_approval_notifications_approval" ON "public"."approval_notifications" USING "btree" ("approval_id");



CREATE INDEX "idx_approval_notifications_recipient" ON "public"."approval_notifications" USING "btree" ("recipient_id");



CREATE INDEX "idx_approval_notifications_sent_at" ON "public"."approval_notifications" USING "btree" ("sent_at");



CREATE INDEX "idx_approval_notifications_status" ON "public"."approval_notifications" USING "btree" ("delivery_status");



CREATE INDEX "idx_approval_notifications_type" ON "public"."approval_notifications" USING "btree" ("notification_type");



CREATE INDEX "idx_approvals_chain" ON "public"."approvals" USING "btree" ("approval_chain_id", "step_number");



CREATE INDEX "idx_approvals_created_at" ON "public"."approvals" USING "btree" ("created_at");



CREATE INDEX "idx_approvals_current_approver" ON "public"."approvals" USING "btree" ("current_approver_id");



CREATE INDEX "idx_approvals_due_date" ON "public"."approvals" USING "btree" ("due_date");



CREATE INDEX "idx_approvals_entity" ON "public"."approvals" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_approvals_expires_at" ON "public"."approvals" USING "btree" ("expires_at");



CREATE INDEX "idx_approvals_organization" ON "public"."approvals" USING "btree" ("organization_id");



CREATE INDEX "idx_approvals_priority" ON "public"."approvals" USING "btree" ("priority");



CREATE INDEX "idx_approvals_requested_by" ON "public"."approvals" USING "btree" ("requested_by");



CREATE INDEX "idx_approvals_status" ON "public"."approvals" USING "btree" ("status");



CREATE INDEX "idx_approvals_type" ON "public"."approvals" USING "btree" ("approval_type");



CREATE INDEX "idx_contacts_active" ON "public"."contacts" USING "btree" ("is_active");



CREATE INDEX "idx_contacts_company" ON "public"."contacts" USING "btree" ("company_name");



CREATE INDEX "idx_contacts_is_primary_contact" ON "public"."contacts" USING "btree" ("is_primary_contact");



CREATE INDEX "idx_contacts_org_id" ON "public"."contacts" USING "btree" ("organization_id");



CREATE INDEX "idx_contacts_role" ON "public"."contacts" USING "btree" ("role");



CREATE INDEX "idx_contacts_type" ON "public"."contacts" USING "btree" ("type");



CREATE INDEX "idx_document_versions_document_id" ON "public"."document_versions" USING "btree" ("document_id");



CREATE INDEX "idx_document_versions_is_current" ON "public"."document_versions" USING "btree" ("document_id", "is_current");



CREATE INDEX "idx_document_versions_organization" ON "public"."document_versions" USING "btree" ("organization_id");



CREATE INDEX "idx_document_versions_uploaded_at" ON "public"."document_versions" USING "btree" ("uploaded_at");



CREATE INDEX "idx_document_versions_uploaded_by" ON "public"."document_versions" USING "btree" ("uploaded_by");



CREATE INDEX "idx_document_versions_version_number" ON "public"."document_versions" USING "btree" ("document_id", "version_number");



CREATE INDEX "idx_documents_category" ON "public"."documents" USING "btree" ("category");



CREATE INDEX "idx_documents_external_id" ON "public"."documents" USING "btree" ("external_id");



CREATE INDEX "idx_documents_link_type" ON "public"."documents" USING "btree" ("link_type");



CREATE INDEX "idx_documents_org_id" ON "public"."documents" USING "btree" ("organization_id");



CREATE INDEX "idx_documents_project_id" ON "public"."documents" USING "btree" ("project_id");



CREATE INDEX "idx_documents_sync_status" ON "public"."documents" USING "btree" ("sync_status");



CREATE INDEX "idx_documents_uploaded_by" ON "public"."documents" USING "btree" ("uploaded_by");



CREATE INDEX "idx_messages_org_id" ON "public"."messages" USING "btree" ("organization_id");



CREATE INDEX "idx_messages_project_id" ON "public"."messages" USING "btree" ("project_id");



CREATE INDEX "idx_messages_recipient" ON "public"."messages" USING "btree" ("recipient_id");



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_messages_thread" ON "public"."messages" USING "btree" ("thread_id");



CREATE INDEX "idx_notifications_org_id" ON "public"."notifications" USING "btree" ("organization_id");



CREATE INDEX "idx_notifications_status" ON "public"."notifications" USING "btree" ("status");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_organizations_city" ON "public"."organizations" USING "btree" ("city");



CREATE INDEX "idx_organizations_country" ON "public"."organizations" USING "btree" ("country");



CREATE INDEX "idx_organizations_is_active" ON "public"."organizations" USING "btree" ("is_active");



CREATE INDEX "idx_organizations_slug" ON "public"."organizations" USING "btree" ("slug");



CREATE INDEX "idx_project_assignments_project" ON "public"."project_assignments" USING "btree" ("project_id");



CREATE INDEX "idx_project_assignments_user" ON "public"."project_assignments" USING "btree" ("user_id");



CREATE INDEX "idx_project_sub_stage_progress_assigned_to" ON "public"."project_sub_stage_progress" USING "btree" ("assigned_to");



CREATE INDEX "idx_project_sub_stage_progress_project_id" ON "public"."project_sub_stage_progress" USING "btree" ("project_id");



CREATE INDEX "idx_project_sub_stage_progress_status" ON "public"."project_sub_stage_progress" USING "btree" ("status");



CREATE INDEX "idx_project_sub_stage_progress_sub_stage_id" ON "public"."project_sub_stage_progress" USING "btree" ("sub_stage_id");



CREATE INDEX "idx_project_sub_stage_progress_workflow_stage_id" ON "public"."project_sub_stage_progress" USING "btree" ("workflow_stage_id");



CREATE INDEX "idx_projects_assigned_to" ON "public"."projects" USING "btree" ("assigned_to");



CREATE INDEX "idx_projects_created_by" ON "public"."projects" USING "btree" ("created_by");



CREATE INDEX "idx_projects_customer_organization_id" ON "public"."projects" USING "btree" ("customer_organization_id");



CREATE INDEX "idx_projects_desired_delivery_date" ON "public"."projects" USING "btree" ("desired_delivery_date");



CREATE INDEX "idx_projects_intake_source" ON "public"."projects" USING "btree" ("intake_source");



CREATE INDEX "idx_projects_intake_type" ON "public"."projects" USING "btree" ("intake_type");



CREATE INDEX "idx_projects_org_id" ON "public"."projects" USING "btree" ("organization_id");



CREATE INDEX "idx_projects_point_of_contacts" ON "public"."projects" USING "gin" ("point_of_contacts");



CREATE INDEX "idx_projects_priority" ON "public"."projects" USING "btree" ("priority_level");



CREATE INDEX "idx_projects_project_id" ON "public"."projects" USING "btree" ("project_id");



CREATE INDEX "idx_projects_project_reference" ON "public"."projects" USING "btree" ("project_reference");



CREATE INDEX "idx_projects_stage" ON "public"."projects" USING "btree" ("current_stage_id");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_projects_target_price" ON "public"."projects" USING "btree" ("target_price_per_unit");



CREATE INDEX "idx_projects_volume" ON "public"."projects" USING "gin" ("volume");



CREATE INDEX "idx_reviews_org_id" ON "public"."reviews" USING "btree" ("organization_id");



CREATE INDEX "idx_reviews_project_id" ON "public"."reviews" USING "btree" ("project_id");



CREATE INDEX "idx_reviews_reviewer" ON "public"."reviews" USING "btree" ("reviewer_id");



CREATE INDEX "idx_reviews_status" ON "public"."reviews" USING "btree" ("status");



CREATE INDEX "idx_reviews_type" ON "public"."reviews" USING "btree" ("review_type");



CREATE INDEX "idx_supplier_quotes_org_id" ON "public"."supplier_quotes" USING "btree" ("organization_id");



CREATE INDEX "idx_supplier_quotes_project" ON "public"."supplier_quotes" USING "btree" ("project_id");



CREATE INDEX "idx_supplier_quotes_supplier" ON "public"."supplier_quotes" USING "btree" ("supplier_id");



CREATE INDEX "idx_supplier_rfqs_project_id" ON "public"."supplier_rfqs" USING "btree" ("project_id");



CREATE INDEX "idx_supplier_rfqs_status" ON "public"."supplier_rfqs" USING "btree" ("status");



CREATE INDEX "idx_supplier_rfqs_supplier_id" ON "public"."supplier_rfqs" USING "btree" ("supplier_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_manager" ON "public"."users" USING "btree" ("direct_manager_id");



CREATE INDEX "idx_users_org_id" ON "public"."users" USING "btree" ("organization_id");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_users_status" ON "public"."users" USING "btree" ("status");



CREATE INDEX "idx_workflow_stages_active" ON "public"."workflow_stages" USING "btree" ("organization_id", "is_active");



CREATE INDEX "idx_workflow_stages_order" ON "public"."workflow_stages" USING "btree" ("organization_id", "stage_order");



CREATE INDEX "idx_workflow_stages_org_id" ON "public"."workflow_stages" USING "btree" ("organization_id");



CREATE INDEX "idx_workflow_sub_stages_is_active" ON "public"."workflow_sub_stages" USING "btree" ("is_active");



CREATE INDEX "idx_workflow_sub_stages_order" ON "public"."workflow_sub_stages" USING "btree" ("workflow_stage_id", "sub_stage_order");



CREATE INDEX "idx_workflow_sub_stages_organization_id" ON "public"."workflow_sub_stages" USING "btree" ("organization_id");



CREATE INDEX "idx_workflow_sub_stages_workflow_stage_id" ON "public"."workflow_sub_stages" USING "btree" ("workflow_stage_id");



CREATE OR REPLACE TRIGGER "document_link_access_trigger" AFTER INSERT ON "public"."document_access_log" FOR EACH ROW WHEN ((("new"."action")::"text" = ANY (ARRAY[('view'::character varying)::"text", ('download'::character varying)::"text"]))) EXECUTE FUNCTION "public"."update_document_link_access"();



CREATE OR REPLACE TRIGGER "generate_project_id_trigger" BEFORE INSERT ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."generate_project_id"();



CREATE OR REPLACE TRIGGER "log_contacts_activity" AFTER INSERT OR DELETE OR UPDATE ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."log_activity"();



CREATE OR REPLACE TRIGGER "log_projects_activity" AFTER INSERT OR DELETE OR UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."log_activity"();



CREATE OR REPLACE TRIGGER "log_reviews_activity" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."log_activity"();



CREATE OR REPLACE TRIGGER "set_project_sub_stage_progress_updated_at" BEFORE UPDATE ON "public"."project_sub_stage_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_workflow_sub_stages_updated_at" BEFORE UPDATE ON "public"."workflow_sub_stages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_create_initial_document_version" AFTER INSERT ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."create_initial_document_version"();



CREATE OR REPLACE TRIGGER "trigger_create_project_sub_stage_progress" AFTER UPDATE OF "current_stage_id" ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."create_project_sub_stage_progress"();



CREATE OR REPLACE TRIGGER "trigger_set_approval_expires_at" BEFORE INSERT OR UPDATE ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."set_approval_expires_at"();



CREATE OR REPLACE TRIGGER "trigger_update_approval_updated_at" BEFORE UPDATE ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."update_approval_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_document_on_version_change" AFTER UPDATE ON "public"."document_versions" FOR EACH ROW EXECUTE FUNCTION "public"."update_document_on_version_change"();



CREATE OR REPLACE TRIGGER "trigger_update_workflow_stage_sub_stages_count" AFTER INSERT OR DELETE OR UPDATE ON "public"."workflow_sub_stages" FOR EACH ROW EXECUTE FUNCTION "public"."update_workflow_stage_sub_stages_count"();



CREATE OR REPLACE TRIGGER "update_approval_delegations_updated_at" BEFORE UPDATE ON "public"."approval_delegations" FOR EACH ROW EXECUTE FUNCTION "public"."update_approval_delegations_updated_at"();



CREATE OR REPLACE TRIGGER "update_contacts_updated_at" BEFORE UPDATE ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_documents_updated_at" BEFORE UPDATE ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_messages_updated_at" BEFORE UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notifications_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reviews_updated_at" BEFORE UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_supplier_quotes_updated_at" BEFORE UPDATE ON "public"."supplier_quotes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflow_stages_updated_at" BEFORE UPDATE ON "public"."workflow_stages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approval_attachments"
    ADD CONSTRAINT "approval_attachments_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_attachments"
    ADD CONSTRAINT "approval_attachments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_attachments"
    ADD CONSTRAINT "approval_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approval_chains"
    ADD CONSTRAINT "approval_chains_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approval_chains"
    ADD CONSTRAINT "approval_chains_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_delegation_mappings"
    ADD CONSTRAINT "approval_delegation_mappings_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_delegation_mappings"
    ADD CONSTRAINT "approval_delegation_mappings_delegation_id_fkey" FOREIGN KEY ("delegation_id") REFERENCES "public"."approval_delegations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_delegations"
    ADD CONSTRAINT "approval_delegations_delegate_id_fkey" FOREIGN KEY ("delegate_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_delegations"
    ADD CONSTRAINT "approval_delegations_delegator_id_fkey" FOREIGN KEY ("delegator_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_action_by_fkey" FOREIGN KEY ("action_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_notifications"
    ADD CONSTRAINT "approval_notifications_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_notifications"
    ADD CONSTRAINT "approval_notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_notifications"
    ADD CONSTRAINT "approval_notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_approval_chain_id_fkey" FOREIGN KEY ("approval_chain_id") REFERENCES "public"."approval_chains"("id") ON DELETE SET NULL;



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
    ADD CONSTRAINT "approvals_escalated_from_fkey" FOREIGN KEY ("escalated_from") REFERENCES "public"."approvals"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_escalated_to_fkey" FOREIGN KEY ("escalated_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."document_access_log"
    ADD CONSTRAINT "document_access_log_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "public"."messages"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."project_assignments"
    ADD CONSTRAINT "project_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."project_assignments"
    ADD CONSTRAINT "project_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_assignments"
    ADD CONSTRAINT "project_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_sub_stage_id_fkey" FOREIGN KEY ("sub_stage_id") REFERENCES "public"."workflow_sub_stages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_sub_stage_progress"
    ADD CONSTRAINT "project_sub_stage_progress_workflow_stage_id_fkey" FOREIGN KEY ("workflow_stage_id") REFERENCES "public"."workflow_stages"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."supplier_quotes"
    ADD CONSTRAINT "supplier_quotes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_quotes"
    ADD CONSTRAINT "supplier_quotes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_quotes"
    ADD CONSTRAINT "supplier_quotes_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."contacts"("id");



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_rfqs"
    ADD CONSTRAINT "supplier_rfqs_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."contacts"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_direct_manager_id_fkey" FOREIGN KEY ("direct_manager_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_stages"
    ADD CONSTRAINT "workflow_stages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_sub_stages"
    ADD CONSTRAINT "workflow_sub_stages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_sub_stages"
    ADD CONSTRAINT "workflow_sub_stages_workflow_stage_id_fkey" FOREIGN KEY ("workflow_stage_id") REFERENCES "public"."workflow_stages"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all operations for authenticated users" ON "public"."contacts" USING ((("auth"."role"() = 'authenticated'::"text") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Allow all operations for authenticated users" ON "public"."organizations" USING ((("auth"."role"() = 'authenticated'::"text") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Allow anonymous access" ON "public"."contacts" USING (("auth"."role"() = 'anon'::"text"));



CREATE POLICY "Allow anonymous access" ON "public"."organizations" USING (("auth"."role"() = 'anon'::"text"));



CREATE POLICY "Delegators can update their delegations" ON "public"."approval_delegations" FOR UPDATE USING (("auth"."uid"() = "delegator_id"));



CREATE POLICY "System can insert approval history" ON "public"."approval_history" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert notifications" ON "public"."approval_notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create activity logs" ON "public"."activity_log" FOR INSERT WITH CHECK ((("organization_id" = "public"."get_current_user_org_id"()) AND (("user_id" = "auth"."uid"()) OR ("user_id" IS NULL))));



CREATE POLICY "Users can create approval chains for their organization" ON "public"."approval_chains" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can create approvals for their organization" ON "public"."approvals" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can create delegation mappings" ON "public"."approval_delegation_mappings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."approval_delegations"
  WHERE (("approval_delegations"."id" = "approval_delegation_mappings"."delegation_id") AND ("auth"."uid"() = "approval_delegations"."delegator_id")))));



CREATE POLICY "Users can create document versions for their organization" ON "public"."document_versions" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can create profiles" ON "public"."users" FOR INSERT WITH CHECK (true);



COMMENT ON POLICY "Users can create profiles" ON "public"."users" IS 'Allows profile creation';



CREATE POLICY "Users can create supplier RFQs in their org" ON "public"."supplier_rfqs" FOR INSERT WITH CHECK (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."organization_id" = "public"."get_current_user_org_id"()))));



CREATE POLICY "Users can create their own delegations" ON "public"."approval_delegations" FOR INSERT WITH CHECK ((("auth"."uid"() = "delegator_id") AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."organization_id" = "approval_delegations"."organization_id"))))));



CREATE POLICY "Users can delete activity in their org" ON "public"."activity_log" FOR DELETE USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can delete approval chains they created" ON "public"."approval_chains" FOR DELETE USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("created_by" = "auth"."uid"())));



CREATE POLICY "Users can delete approvals they created" ON "public"."approvals" FOR DELETE USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("requested_by" = "auth"."uid"()) AND ("status" = 'pending'::"public"."approval_status")));



CREATE POLICY "Users can delete attachments they uploaded" ON "public"."approval_attachments" FOR DELETE USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("uploaded_by" = "auth"."uid"())));



CREATE POLICY "Users can delete document versions they uploaded" ON "public"."document_versions" FOR DELETE USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("uploaded_by" = "auth"."uid"())));



CREATE POLICY "Users can insert activity in their org" ON "public"."activity_log" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can insert document access logs" ON "public"."document_access_log" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert users" ON "public"."users" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can modify documents" ON "public"."documents" USING ((("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE "public"."can_access_project"("projects"."id"))) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"])) OR ("uploaded_by" = "auth"."uid"()) OR (("public"."get_current_user_role"() = ANY (ARRAY['sales'::"text", 'procurement'::"text", 'engineering'::"text", 'qa'::"text", 'production'::"text"])) AND (("access_level")::"text" <> 'restricted'::"text")))));



CREATE POLICY "Users can modify documents in their org" ON "public"."documents" USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can modify project assignments" ON "public"."project_assignments" USING ((("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE "public"."can_access_project"("projects"."id"))) AND ("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"]))));



CREATE POLICY "Users can modify projects" ON "public"."projects" USING (("public"."can_access_project"("id") AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"])) OR (("public"."get_current_user_role"() = 'sales'::"text") AND ("current_stage_id" IN ( SELECT "workflow_stages"."id"
   FROM "public"."workflow_stages"
  WHERE (("workflow_stages"."organization_id" = "public"."get_current_user_org_id"()) AND ('sales'::"public"."user_role" = ANY ("workflow_stages"."responsible_roles")))))) OR (("public"."get_current_user_role"() = 'procurement'::"text") AND ("current_stage_id" IN ( SELECT "workflow_stages"."id"
   FROM "public"."workflow_stages"
  WHERE (("workflow_stages"."organization_id" = "public"."get_current_user_org_id"()) AND ('procurement'::"public"."user_role" = ANY ("workflow_stages"."responsible_roles")))))) OR (("public"."get_current_user_role"() = 'engineering'::"text") AND ("current_stage_id" IN ( SELECT "workflow_stages"."id"
   FROM "public"."workflow_stages"
  WHERE (("workflow_stages"."organization_id" = "public"."get_current_user_org_id"()) AND ('engineering'::"public"."user_role" = ANY ("workflow_stages"."responsible_roles")))))) OR (("public"."get_current_user_role"() = 'qa'::"text") AND ("current_stage_id" IN ( SELECT "workflow_stages"."id"
   FROM "public"."workflow_stages"
  WHERE (("workflow_stages"."organization_id" = "public"."get_current_user_org_id"()) AND ('qa'::"public"."user_role" = ANY ("workflow_stages"."responsible_roles")))))) OR (("public"."get_current_user_role"() = 'production'::"text") AND ("current_stage_id" IN ( SELECT "workflow_stages"."id"
   FROM "public"."workflow_stages"
  WHERE (("workflow_stages"."organization_id" = "public"."get_current_user_org_id"()) AND ('production'::"public"."user_role" = ANY ("workflow_stages"."responsible_roles")))))))));



CREATE POLICY "Users can modify projects in their org" ON "public"."projects" USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can modify reviews" ON "public"."reviews" USING ((("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE "public"."can_access_project"("projects"."id"))) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"])) OR ("reviewer_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."workflow_stages"
  WHERE (("workflow_stages"."id" = ( SELECT "projects"."current_stage_id"
           FROM "public"."projects"
          WHERE ("projects"."id" = "reviews"."project_id"))) AND (("public"."get_current_user_role"())::"public"."user_role" = ANY ("workflow_stages"."responsible_roles"))))))));



CREATE POLICY "Users can modify reviews in their org" ON "public"."reviews" USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can modify supplier quotes" ON "public"."supplier_quotes" USING ((("organization_id" = "public"."get_current_user_org_id"()) AND ("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text", 'procurement'::"text"]))));



CREATE POLICY "Users can modify workflow stages" ON "public"."workflow_stages" USING ((("organization_id" = "public"."get_current_user_org_id"()) AND ("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"]))));



CREATE POLICY "Users can send messages" ON "public"."messages" FOR INSERT WITH CHECK ((("organization_id" = "public"."get_current_user_org_id"()) AND ("sender_id" = "auth"."uid"()) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"])) OR ("recipient_id" IS NOT NULL))));



CREATE POLICY "Users can send messages in their org" ON "public"."messages" FOR INSERT WITH CHECK ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("sender_id" = "auth"."uid"())));



CREATE POLICY "Users can update activity in their org" ON "public"."activity_log" FOR UPDATE USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can update approval chains they created" ON "public"."approval_chains" FOR UPDATE USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("created_by" = "auth"."uid"())));



CREATE POLICY "Users can update approvals they are involved with" ON "public"."approvals" FOR UPDATE USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND (("requested_by" = "auth"."uid"()) OR ("current_approver_id" = "auth"."uid"()) OR ("delegated_to" = "auth"."uid"()) OR ("escalated_to" = "auth"."uid"()))));



CREATE POLICY "Users can update document versions they uploaded" ON "public"."document_versions" FOR UPDATE USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("uploaded_by" = "auth"."uid"())));



CREATE POLICY "Users can update their notifications" ON "public"."approval_notifications" FOR UPDATE USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("recipient_id" = "auth"."uid"())));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE USING (("id" = "auth"."uid"()));



COMMENT ON POLICY "Users can update their own profile" ON "public"."users" IS 'Allows users to update their own profile';



CREATE POLICY "Users can update users" ON "public"."users" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can upload attachments for their organization" ON "public"."approval_attachments" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view activity in their org" ON "public"."activity_log" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view approval chains for their organization" ON "public"."approval_chains" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view approval history for their organization" ON "public"."approval_history" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view approvals for their organization" ON "public"."approvals" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view attachments for their organization" ON "public"."approval_attachments" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view document versions for their organization" ON "public"."document_versions" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view documents" ON "public"."documents" FOR SELECT USING ((("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE "public"."can_access_project"("projects"."id"))) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"])) OR (("access_level")::"text" = ANY (ARRAY[('public'::character varying)::"text", ('internal'::character varying)::"text"])) OR (("public"."get_current_user_role"() = 'customer'::"text") AND (("access_level")::"text" = ANY (ARRAY[('public'::character varying)::"text", ('customer'::character varying)::"text"]))) OR (("public"."get_current_user_role"() = 'supplier'::"text") AND (("access_level")::"text" = ANY (ARRAY[('public'::character varying)::"text", ('supplier'::character varying)::"text"]))))));



CREATE POLICY "Users can view documents in their org" ON "public"."documents" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view messages" ON "public"."messages" FOR SELECT USING ((("organization_id" = "public"."get_current_user_org_id"()) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"])) OR ("sender_id" = "auth"."uid"()) OR ("recipient_id" = "auth"."uid"()))));



CREATE POLICY "Users can view messages in their org" ON "public"."messages" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view other users in their org" ON "public"."users" FOR SELECT USING ((("organization_id" = '550e8400-e29b-41d4-a716-446655440001'::"uuid") OR (("auth"."uid"() IS NOT NULL) AND ("organization_id" = "public"."get_current_user_org_id"()))));



COMMENT ON POLICY "Users can view other users in their org" ON "public"."users" IS 'Allows viewing other users in organization and unauthenticated access for display purposes';



CREATE POLICY "Users can view project assignments" ON "public"."project_assignments" FOR SELECT USING ((("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE "public"."can_access_project"("projects"."id"))) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"])) OR ("user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view project assignments in their org" ON "public"."project_assignments" FOR SELECT USING (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."organization_id" IN ( SELECT "users"."organization_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"()))))));



CREATE POLICY "Users can view projects" ON "public"."projects" FOR SELECT USING ("public"."can_access_project"("id"));



CREATE POLICY "Users can view projects in their org" ON "public"."projects" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view reviews" ON "public"."reviews" FOR SELECT USING ((("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE "public"."can_access_project"("projects"."id"))) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"])) OR ("reviewer_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."workflow_stages"
  WHERE (("workflow_stages"."id" = ( SELECT "projects"."current_stage_id"
           FROM "public"."projects"
          WHERE ("projects"."id" = "reviews"."project_id"))) AND (("public"."get_current_user_role"())::"public"."user_role" = ANY ("workflow_stages"."responsible_roles"))))))));



CREATE POLICY "Users can view reviews in their org" ON "public"."reviews" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view sub-stage progress for their organization" ON "public"."project_sub_stage_progress" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view sub-stages for their organization" ON "public"."workflow_sub_stages" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view supplier RFQs in their org" ON "public"."supplier_rfqs" FOR SELECT USING (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."organization_id" = "public"."get_current_user_org_id"()))));



CREATE POLICY "Users can view supplier quotes" ON "public"."supplier_quotes" FOR SELECT USING ((("organization_id" = "public"."get_current_user_org_id"()) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text", 'procurement'::"text"])) OR (("public"."get_current_user_role"() = 'sales'::"text") AND ("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."current_stage_id" IN ( SELECT "workflow_stages"."id"
           FROM "public"."workflow_stages"
          WHERE (("workflow_stages"."organization_id" = "public"."get_current_user_org_id"()) AND ('sales'::"public"."user_role" = ANY ("workflow_stages"."responsible_roles")))))))))));



CREATE POLICY "Users can view supplier quotes in their org" ON "public"."supplier_quotes" USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view their notifications" ON "public"."approval_notifications" FOR SELECT USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND ("recipient_id" = "auth"."uid"())));



CREATE POLICY "Users can view their own document access logs" ON "public"."document_access_log" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("document_id" IN ( SELECT "documents"."id"
   FROM "public"."documents"
  WHERE ("documents"."organization_id" = ( SELECT "users"."organization_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))))));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));



COMMENT ON POLICY "Users can view their own profile" ON "public"."users" IS 'Allows users to view their own profile';



CREATE POLICY "Users can view users" ON "public"."users" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view workflow stages in their org" ON "public"."workflow_stages" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_chains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_delegation_mappings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_delegations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approvals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_access_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_sub_stage_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_rfqs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workflow_stages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workflow_sub_stages" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."approval_delegation_mappings";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."approval_delegations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."projects";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."reviews";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."supplier_quotes";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."add_contact_to_project"("project_uuid" "uuid", "contact_uuid" "uuid", "make_primary" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."add_contact_to_project"("project_uuid" "uuid", "contact_uuid" "uuid", "make_primary" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_contact_to_project"("project_uuid" "uuid", "contact_uuid" "uuid", "make_primary" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_expire_overdue_approvals"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_expire_overdue_approvals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_expire_overdue_approvals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_project"("project_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_project"("project_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_project"("project_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_document_versions"("p_document_id" "uuid", "p_keep_versions" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_document_versions"("p_document_id" "uuid", "p_keep_versions" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_document_versions"("p_document_id" "uuid", "p_keep_versions" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_approval"("p_organization_id" "uuid", "p_approval_type" "public"."approval_type", "p_title" character varying, "p_description" "text", "p_entity_type" character varying, "p_entity_id" "uuid", "p_requested_by" "uuid", "p_current_approver_id" "uuid", "p_current_approver_role" character varying, "p_priority" "public"."approval_priority", "p_due_date" timestamp with time zone, "p_request_reason" "text", "p_request_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_approval"("p_organization_id" "uuid", "p_approval_type" "public"."approval_type", "p_title" character varying, "p_description" "text", "p_entity_type" character varying, "p_entity_id" "uuid", "p_requested_by" "uuid", "p_current_approver_id" "uuid", "p_current_approver_role" character varying, "p_priority" "public"."approval_priority", "p_due_date" timestamp with time zone, "p_request_reason" "text", "p_request_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_approval"("p_organization_id" "uuid", "p_approval_type" "public"."approval_type", "p_title" character varying, "p_description" "text", "p_entity_type" character varying, "p_entity_id" "uuid", "p_requested_by" "uuid", "p_current_approver_id" "uuid", "p_current_approver_role" character varying, "p_priority" "public"."approval_priority", "p_due_date" timestamp with time zone, "p_request_reason" "text", "p_request_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_initial_document_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_initial_document_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_initial_document_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" "text", "p_priority" "public"."priority_level", "p_action_url" "text", "p_action_label" "text", "p_related_entity_type" "text", "p_related_entity_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" "text", "p_priority" "public"."priority_level", "p_action_url" "text", "p_action_label" "text", "p_related_entity_type" "text", "p_related_entity_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" "text", "p_priority" "public"."priority_level", "p_action_url" "text", "p_action_label" "text", "p_related_entity_type" "text", "p_related_entity_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_project_sub_stage_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_project_sub_stage_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_project_sub_stage_progress"() TO "service_role";



GRANT ALL ON FUNCTION "public"."expire_approval_delegations"() TO "anon";
GRANT ALL ON FUNCTION "public"."expire_approval_delegations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."expire_approval_delegations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_project_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_project_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_project_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_org_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_org_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_org_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_document_version_history"("p_document_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_document_version_history"("p_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_document_version_history"("p_document_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pending_approvals_for_user"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pending_approvals_for_user"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pending_approvals_for_user"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_project_contacts"("project_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_project_contacts"("project_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_project_contacts"("project_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_project_primary_contact"("project_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_project_primary_contact"("project_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_project_primary_contact"("project_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_organization"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_organization"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_organization"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_project_stage_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_project_stage_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_project_stage_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_approval_overdue"("p_approval_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_approval_overdue"("p_approval_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_approval_overdue"("p_approval_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_internal_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_internal_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_internal_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_portal_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_portal_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_portal_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_contact_from_project"("project_uuid" "uuid", "contact_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_contact_from_project"("project_uuid" "uuid", "contact_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_contact_from_project"("project_uuid" "uuid", "contact_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_approval_expires_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_approval_expires_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_approval_expires_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_approval_decision"("p_approval_id" "uuid", "p_decision" "public"."approval_status", "p_comments" "text", "p_reason" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_approval_decision"("p_approval_id" "uuid", "p_decision" "public"."approval_status", "p_comments" "text", "p_reason" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_approval_decision"("p_approval_id" "uuid", "p_decision" "public"."approval_status", "p_comments" "text", "p_reason" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_approval_delegations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_approval_delegations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_approval_delegations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_approval_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_approval_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_approval_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_document_link_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_document_link_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_document_link_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_document_on_version_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_document_on_version_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_document_on_version_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_workflow_stage_sub_stages_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_workflow_stage_sub_stages_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_workflow_stage_sub_stages_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_contact_migration"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_contact_migration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_contact_migration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_customer_organization_migration"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_customer_organization_migration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_customer_organization_migration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_migration_before_cleanup"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_migration_before_cleanup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_migration_before_cleanup"() TO "service_role";


















GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."approval_attachments" TO "anon";
GRANT ALL ON TABLE "public"."approval_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."approval_chains" TO "anon";
GRANT ALL ON TABLE "public"."approval_chains" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_chains" TO "service_role";



GRANT ALL ON TABLE "public"."approval_delegation_mappings" TO "anon";
GRANT ALL ON TABLE "public"."approval_delegation_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_delegation_mappings" TO "service_role";



GRANT ALL ON TABLE "public"."approval_delegations" TO "anon";
GRANT ALL ON TABLE "public"."approval_delegations" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_delegations" TO "service_role";



GRANT ALL ON TABLE "public"."approval_history" TO "anon";
GRANT ALL ON TABLE "public"."approval_history" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_history" TO "service_role";



GRANT ALL ON TABLE "public"."approval_notifications" TO "anon";
GRANT ALL ON TABLE "public"."approval_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."approvals" TO "anon";
GRANT ALL ON TABLE "public"."approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."approvals" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON TABLE "public"."document_access_log" TO "anon";
GRANT ALL ON TABLE "public"."document_access_log" TO "authenticated";
GRANT ALL ON TABLE "public"."document_access_log" TO "service_role";



GRANT ALL ON TABLE "public"."document_versions" TO "anon";
GRANT ALL ON TABLE "public"."document_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."document_versions" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."project_assignments" TO "anon";
GRANT ALL ON TABLE "public"."project_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."project_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."project_contact_points_backup" TO "anon";
GRANT ALL ON TABLE "public"."project_contact_points_backup" TO "authenticated";
GRANT ALL ON TABLE "public"."project_contact_points_backup" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."project_details_view" TO "anon";
GRANT ALL ON TABLE "public"."project_details_view" TO "authenticated";
GRANT ALL ON TABLE "public"."project_details_view" TO "service_role";



GRANT ALL ON TABLE "public"."project_sub_stage_progress" TO "anon";
GRANT ALL ON TABLE "public"."project_sub_stage_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."project_sub_stage_progress" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_quotes" TO "anon";
GRANT ALL ON TABLE "public"."supplier_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_quotes" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_rfqs" TO "anon";
GRANT ALL ON TABLE "public"."supplier_rfqs" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_rfqs" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_stages" TO "anon";
GRANT ALL ON TABLE "public"."workflow_stages" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_stages" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_sub_stages" TO "anon";
GRANT ALL ON TABLE "public"."workflow_sub_stages" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_sub_stages" TO "service_role";









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
