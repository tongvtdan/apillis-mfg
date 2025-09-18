-- Fix missing RLS policies for tables showing as "Unrestricted"
-- This migration adds RLS policies for tables that are missing them

-- Enable RLS for document_categories table
ALTER TABLE "public"."document_categories" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_categories (global lookup table)
-- This table is a global lookup table without organization_id, so we allow authenticated users to read
CREATE POLICY "document_categories_select_policy" ON "public"."document_categories" 
FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));

-- Only allow admins to modify document categories
CREATE POLICY "document_categories_insert_policy" ON "public"."document_categories" 
FOR INSERT WITH CHECK ((EXISTS ( SELECT 1 FROM "public"."users" WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::text)))));

CREATE POLICY "document_categories_update_policy" ON "public"."document_categories" 
FOR UPDATE USING ((EXISTS ( SELECT 1 FROM "public"."users" WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::text))))) 
WITH CHECK ((EXISTS ( SELECT 1 FROM "public"."users" WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::text)))));

CREATE POLICY "document_categories_delete_policy" ON "public"."document_categories" 
FOR DELETE USING ((EXISTS ( SELECT 1 FROM "public"."users" WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::text)))));

-- Note: Views and materialized views cannot have RLS policies
-- The following are views and will always show as "Unrestricted":
-- - review_checklist_items (VIEW)
-- - reviews (VIEW) 
-- - secure_documents (VIEW)
-- - supplier_details_view (VIEW)
-- - v_approval_queue (VIEW)
-- - v_current_stage_progress (VIEW)
-- - mv_user_workload (MATERIALIZED VIEW)
--
-- These views inherit security from their underlying tables
-- and should be accessed through application-level security controls
