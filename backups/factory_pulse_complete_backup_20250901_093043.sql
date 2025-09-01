

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






CREATE TYPE "public"."contact_type" AS ENUM (
    'customer',
    'supplier',
    'partner',
    'internal'
);


ALTER TYPE "public"."contact_type" OWNER TO "postgres";


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
    result JSONB;
    project_counts JSONB;
    recent_projects JSONB;
    status_counts JSONB;
    type_counts JSONB;
    project_record RECORD;
BEGIN
    -- Get user's organization ID
    SELECT organization_id INTO user_org_id 
    FROM users 
    WHERE id = auth.uid();

    -- If no organization found, return empty result
    IF user_org_id IS NULL THEN
        RETURN jsonb_build_object(
            'projects', jsonb_build_object('total', 0, 'by_status', '{}', 'by_type', '{}'),
            'recent_projects', '[]',
            'generated_at', extract(epoch from now())
        );
    END IF;

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
        type_counts := type_counts || jsonb_build_object(COALESCE(project_record.project_type, 'unspecified'), project_record.count);
    END LOOP;

    -- Build project counts object
    project_counts := jsonb_build_object(
        'total', (SELECT COUNT(*) FROM projects WHERE organization_id = user_org_id),
        'by_status', status_counts,
        'by_type', type_counts
    );

    -- Get recent projects with customer information
    recent_projects := (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'project_id', p.project_id,
                'title', p.title,
                'status', p.status,
                'priority', p.priority_level,
                'project_type', p.project_type,
                'created_at', p.created_at,
                'customer_name', c.company_name
            )
        )
        FROM (
            SELECT *
            FROM projects 
            WHERE organization_id = user_org_id
            ORDER BY created_at DESC
            LIMIT 10
        ) p
        LEFT JOIN contacts c ON p.customer_id = c.id
    );

    -- If no recent projects, set to empty array
    IF recent_projects IS NULL THEN
        recent_projects := '[]';
    END IF;

    -- Build final result
    result := jsonb_build_object(
        'projects', project_counts,
        'recent_projects', recent_projects,
        'generated_at', extract(epoch from now())
    );

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_dashboard_summary"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_dashboard_summary"() IS 'Returns enhanced dashboard summary data including project counts by status and type, and recent projects with customer information. 
Requires user to be authenticated and have an organization_id.';



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
BEGIN
    -- Get user's organization ID
    SELECT organization_id INTO user_org_id 
    FROM users 
    WHERE id = auth.uid();

    -- Get entity's organization ID (fallback to user's org if not found)
    entity_org_id := COALESCE(NEW.organization_id, OLD.organization_id, user_org_id);

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
            new_values
        ) VALUES (
            entity_org_id,
            auth.uid(),
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Created ' || TG_TABLE_NAME
                WHEN TG_OP = 'UPDATE' THEN 'Updated ' || TG_TABLE_NAME
                WHEN TG_OP = 'DELETE' THEN 'Deleted ' || TG_TABLE_NAME
            END,
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."log_activity"() OWNER TO "postgres";


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
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "type" "public"."contact_type" NOT NULL,
    "company_name" character varying(255) NOT NULL,
    "contact_name" character varying(255),
    "email" character varying(255),
    "phone" character varying(50),
    "address" "text",
    "city" character varying(100),
    "state" character varying(100),
    "country" character varying(100),
    "postal_code" character varying(20),
    "website" character varying(255),
    "tax_id" character varying(50),
    "payment_terms" character varying(100),
    "credit_limit" numeric(15,2),
    "is_active" boolean DEFAULT true,
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_category" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_capabilities" "text"[] DEFAULT '{}'::"text"[],
    "ai_risk_score" numeric(5,2),
    "ai_last_analyzed" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text",
    "file_name" character varying(255) NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" bigint,
    "file_type" character varying(50),
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
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


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
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "domain" character varying(255),
    "logo_url" "text",
    "description" "text",
    "industry" character varying(100),
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "subscription_plan" "public"."subscription_plan" DEFAULT 'starter'::"public"."subscription_plan",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


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


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "project_id" character varying(50) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "customer_id" "uuid",
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
    "assigned_to" "uuid"
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


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


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "department" character varying(100),
    "phone" character varying(50),
    "avatar_url" "text",
    "status" "public"."user_status" DEFAULT 'active'::"public"."user_status",
    "description" "text",
    "employee_id" character varying(50),
    "direct_manager_id" "uuid",
    "direct_reports" "uuid"[] DEFAULT '{}'::"uuid"[],
    "last_login_at" timestamp with time zone,
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
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



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



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



CREATE INDEX "idx_activity_log_created_at" ON "public"."activity_log" USING "btree" ("created_at");



CREATE INDEX "idx_activity_log_entity" ON "public"."activity_log" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_activity_log_org_id" ON "public"."activity_log" USING "btree" ("organization_id");



CREATE INDEX "idx_activity_log_user_id" ON "public"."activity_log" USING "btree" ("user_id");



CREATE INDEX "idx_contacts_active" ON "public"."contacts" USING "btree" ("is_active");



CREATE INDEX "idx_contacts_company" ON "public"."contacts" USING "btree" ("company_name");



CREATE INDEX "idx_contacts_org_id" ON "public"."contacts" USING "btree" ("organization_id");



CREATE INDEX "idx_contacts_type" ON "public"."contacts" USING "btree" ("type");



CREATE INDEX "idx_documents_category" ON "public"."documents" USING "btree" ("category");



CREATE INDEX "idx_documents_org_id" ON "public"."documents" USING "btree" ("organization_id");



CREATE INDEX "idx_documents_project_id" ON "public"."documents" USING "btree" ("project_id");



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



CREATE INDEX "idx_organizations_domain" ON "public"."organizations" USING "btree" ("domain");



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



CREATE INDEX "idx_projects_customer" ON "public"."projects" USING "btree" ("customer_id");



CREATE INDEX "idx_projects_org_id" ON "public"."projects" USING "btree" ("organization_id");



CREATE INDEX "idx_projects_priority" ON "public"."projects" USING "btree" ("priority_level");



CREATE INDEX "idx_projects_project_id" ON "public"."projects" USING "btree" ("project_id");



CREATE INDEX "idx_projects_stage" ON "public"."projects" USING "btree" ("current_stage_id");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_reviews_org_id" ON "public"."reviews" USING "btree" ("organization_id");



CREATE INDEX "idx_reviews_project_id" ON "public"."reviews" USING "btree" ("project_id");



CREATE INDEX "idx_reviews_reviewer" ON "public"."reviews" USING "btree" ("reviewer_id");



CREATE INDEX "idx_reviews_status" ON "public"."reviews" USING "btree" ("status");



CREATE INDEX "idx_reviews_type" ON "public"."reviews" USING "btree" ("review_type");



CREATE INDEX "idx_supplier_quotes_org_id" ON "public"."supplier_quotes" USING "btree" ("organization_id");



CREATE INDEX "idx_supplier_quotes_project" ON "public"."supplier_quotes" USING "btree" ("project_id");



CREATE INDEX "idx_supplier_quotes_supplier" ON "public"."supplier_quotes" USING "btree" ("supplier_id");



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



CREATE OR REPLACE TRIGGER "generate_project_id_trigger" BEFORE INSERT ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."generate_project_id"();



CREATE OR REPLACE TRIGGER "log_contacts_activity" AFTER INSERT OR DELETE OR UPDATE ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."log_activity"();



CREATE OR REPLACE TRIGGER "log_projects_activity" AFTER INSERT OR DELETE OR UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."log_activity"();



CREATE OR REPLACE TRIGGER "log_reviews_activity" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."log_activity"();



CREATE OR REPLACE TRIGGER "set_project_sub_stage_progress_updated_at" BEFORE UPDATE ON "public"."project_sub_stage_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_workflow_sub_stages_updated_at" BEFORE UPDATE ON "public"."workflow_sub_stages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_create_project_sub_stage_progress" AFTER UPDATE OF "current_stage_id" ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."create_project_sub_stage_progress"();



CREATE OR REPLACE TRIGGER "trigger_update_workflow_stage_sub_stages_count" AFTER INSERT OR DELETE OR UPDATE ON "public"."workflow_sub_stages" FOR EACH ROW EXECUTE FUNCTION "public"."update_workflow_stage_sub_stages_count"();



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
    ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "projects_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id");



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



CREATE POLICY "Admin and management can manage sub-stage progress" ON "public"."project_sub_stage_progress" USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'management'::"public"."user_role"]))))));



CREATE POLICY "Admin and management can manage sub-stages" ON "public"."workflow_sub_stages" USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'management'::"public"."user_role"]))))));



CREATE POLICY "Users can create profiles" ON "public"."users" FOR INSERT WITH CHECK ((("organization_id" = "public"."get_current_user_org_id"()) AND ("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"]))));



CREATE POLICY "Users can modify contacts" ON "public"."contacts" USING ((("organization_id" = "public"."get_current_user_org_id"()) AND ("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text", 'sales'::"text", 'procurement'::"text"]))));



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



CREATE POLICY "Users can update assigned sub-stage progress" ON "public"."project_sub_stage_progress" FOR UPDATE USING ((("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND (("assigned_to" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'management'::"public"."user_role"]))))))));



CREATE POLICY "Users can update their organization" ON "public"."organizations" FOR UPDATE USING (("id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'management'::"public"."user_role"]))))));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view activity in their org" ON "public"."activity_log" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view contacts in their org" ON "public"."contacts" USING (("organization_id" IN ( SELECT "users"."organization_id"
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



CREATE POLICY "Users can view other users in their org" ON "public"."users" FOR SELECT USING ((("organization_id" = "public"."get_current_user_org_id"()) AND ("id" <> "auth"."uid"()) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text"])) OR (("public"."get_current_user_role"() = 'sales'::"text") AND ("role" = ANY (ARRAY['sales'::"public"."user_role", 'procurement'::"public"."user_role", 'engineering'::"public"."user_role", 'qa'::"public"."user_role", 'production'::"public"."user_role"]))) OR (("public"."get_current_user_role"() = 'procurement'::"text") AND ("role" = ANY (ARRAY['procurement'::"public"."user_role", 'engineering'::"public"."user_role", 'qa'::"public"."user_role", 'production'::"public"."user_role"]))) OR (("public"."get_current_user_role"() = 'engineering'::"text") AND ("role" = ANY (ARRAY['engineering'::"public"."user_role", 'qa'::"public"."user_role", 'production'::"public"."user_role"]))) OR (("public"."get_current_user_role"() = 'qa'::"text") AND ("role" = ANY (ARRAY['qa'::"public"."user_role", 'production'::"public"."user_role"]))) OR (("public"."get_current_user_role"() = 'production'::"text") AND ("role" = 'production'::"public"."user_role")))));



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



CREATE POLICY "Users can view supplier quotes" ON "public"."supplier_quotes" FOR SELECT USING ((("organization_id" = "public"."get_current_user_org_id"()) AND (("public"."get_current_user_role"() = ANY (ARRAY['admin'::"text", 'management'::"text", 'procurement'::"text"])) OR (("public"."get_current_user_role"() = 'sales'::"text") AND ("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."current_stage_id" IN ( SELECT "workflow_stages"."id"
           FROM "public"."workflow_stages"
          WHERE (("workflow_stages"."organization_id" = "public"."get_current_user_org_id"()) AND ('sales'::"public"."user_role" = ANY ("workflow_stages"."responsible_roles")))))))))));



CREATE POLICY "Users can view supplier quotes in their org" ON "public"."supplier_quotes" USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view their organization" ON "public"."organizations" FOR SELECT USING (("id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view workflow stages in their org" ON "public"."workflow_stages" FOR SELECT USING (("organization_id" IN ( SELECT "users"."organization_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_sub_stage_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workflow_stages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workflow_sub_stages" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."can_access_project"("project_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_project"("project_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_project"("project_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" "text", "p_priority" "public"."priority_level", "p_action_url" "text", "p_action_label" "text", "p_related_entity_type" "text", "p_related_entity_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" "text", "p_priority" "public"."priority_level", "p_action_url" "text", "p_action_label" "text", "p_related_entity_type" "text", "p_related_entity_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" "text", "p_priority" "public"."priority_level", "p_action_url" "text", "p_action_label" "text", "p_related_entity_type" "text", "p_related_entity_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_project_sub_stage_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_project_sub_stage_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_project_sub_stage_progress"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."get_user_organization"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_organization"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_organization"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_project_stage_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_project_stage_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_project_stage_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_internal_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_internal_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_internal_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_portal_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_portal_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_portal_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_workflow_stage_sub_stages_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_workflow_stage_sub_stages_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_workflow_stage_sub_stages_count"() TO "service_role";


















GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



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



GRANT ALL ON TABLE "public"."project_sub_stage_progress" TO "anon";
GRANT ALL ON TABLE "public"."project_sub_stage_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."project_sub_stage_progress" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_quotes" TO "anon";
GRANT ALL ON TABLE "public"."supplier_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_quotes" TO "service_role";



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
