-- =========================================
-- Fix Documents RLS Policies
-- Migration: Clean up and fix RLS policies for documents table
-- =========================================

-- Drop all existing policies on documents table
DROP POLICY IF EXISTS "documents_select_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_insert_org" ON public.documents;
DROP POLICY IF EXISTS "documents_select_org" ON public.documents;
DROP POLICY IF EXISTS "documents_update_org" ON public.documents;
DROP POLICY IF EXISTS "documents_delete_org" ON public.documents;

-- Create clean, proper RLS policies for documents table
CREATE POLICY "documents_select_policy"
ON public.documents
FOR SELECT 
USING (organization_id = get_current_user_org_id());

CREATE POLICY "documents_insert_policy"
ON public.documents
FOR INSERT 
WITH CHECK (organization_id = get_current_user_org_id());

CREATE POLICY "documents_update_policy"
ON public.documents
FOR UPDATE 
USING (organization_id = get_current_user_org_id())
WITH CHECK (organization_id = get_current_user_org_id());

CREATE POLICY "documents_delete_policy"
ON public.documents
FOR DELETE 
USING (organization_id = get_current_user_org_id());

-- Drop all existing policies on document_versions table
DROP POLICY IF EXISTS "document_versions_insert_org" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions_select_org" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions_update_org" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions_delete_org" ON public.document_versions;

-- Create clean, proper RLS policies for document_versions table
CREATE POLICY "document_versions_select_policy"
ON public.document_versions
FOR SELECT 
USING (organization_id = get_current_user_org_id());

CREATE POLICY "document_versions_insert_policy"
ON public.document_versions
FOR INSERT 
WITH CHECK (organization_id = get_current_user_org_id());

CREATE POLICY "document_versions_update_policy"
ON public.document_versions
FOR UPDATE 
USING (organization_id = get_current_user_org_id())
WITH CHECK (organization_id = get_current_user_org_id());

CREATE POLICY "document_versions_delete_policy"
ON public.document_versions
FOR DELETE 
USING (organization_id = get_current_user_org_id());

-- Drop all existing policies on document_access_log table
DROP POLICY IF EXISTS "document_access_log_insert_org" ON public.document_access_log;
DROP POLICY IF EXISTS "document_access_log_select_org" ON public.document_access_log;

-- Create clean, proper RLS policies for document_access_log table
CREATE POLICY "document_access_log_select_policy"
ON public.document_access_log
FOR SELECT 
USING (organization_id = get_current_user_org_id());

CREATE POLICY "document_access_log_insert_policy"
ON public.document_access_log
FOR INSERT 
WITH CHECK (organization_id = get_current_user_org_id());
