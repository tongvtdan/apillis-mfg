-- Fix Reviews View to Include User Information
-- This script updates the reviews view to include user information directly
-- instead of relying on foreign key relationships that don't work with views

-- Drop the existing view
DROP VIEW IF EXISTS "public"."reviews";

-- Recreate the view with user information joined directly
CREATE OR REPLACE VIEW "public"."reviews" AS
 SELECT
    a.id,
    a.organization_id,
    a.entity_id AS "project_id",
    a.current_approver_id AS "reviewer_id",
    u.name AS "reviewer_name",
    u.email AS "reviewer_email",
    u.role AS "reviewer_role",
    a.approval_type AS "review_type",
    a.status,
    a.priority,
    a.decision_comments AS "comments",
    a.request_metadata AS "risks",
    a.decision_reason AS "recommendations",
        CASE
            WHEN (a.approval_type = 'technical_review'::"public"."approval_type") THEN true
            WHEN (a.approval_type = 'quality_review'::"public"."approval_type") THEN true
            WHEN (a.approval_type = 'engineering_change'::"public"."approval_type") THEN true
            ELSE false
        END AS "tooling_required",
    NULL::numeric AS "estimated_cost",
    NULL::numeric AS "estimated_lead_time",
    a.due_date,
    a.decided_at AS "reviewed_at",
    a.created_at,
    a.updated_at,
    a.created_by
   FROM "public"."approvals" a
   LEFT JOIN "public"."users" u ON a.current_approver_id = u.id
  WHERE (a.entity_type = 'project'::"text");

-- Grant permissions
GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";

-- Add comment
COMMENT ON VIEW "public"."reviews" IS 'View that maps reviews table to approvals table for backward compatibility with user information joined directly';
