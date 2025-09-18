-- =========================================
-- Add Supplier Document Categories to Enum
-- Migration: Add supplier-specific document categories to document_category enum
-- =========================================

-- Add supplier document categories to the document_category enum
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'supplier_nda';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'supplier_iso';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'supplier_insurance';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'supplier_financial';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'supplier_qc';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'supplier_profile';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'supplier_logo';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'supplier_qualified_image';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'supplier_external_link';

-- Update RLS policies for documents table to allow supplier document uploads
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "documents_insert_org" ON public.documents;
DROP POLICY IF EXISTS "documents_select_org" ON public.documents;
DROP POLICY IF EXISTS "documents_update_org" ON public.documents;
DROP POLICY IF EXISTS "documents_delete_org" ON public.documents;

-- Create new RLS policies for documents table
CREATE POLICY "documents_insert_org"
ON public.documents
FOR INSERT WITH CHECK (organization_id = public.get_current_user_org_id());

CREATE POLICY "documents_select_org"
ON public.documents
FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "documents_update_org"
ON public.documents
FOR UPDATE USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "documents_delete_org"
ON public.documents
FOR DELETE USING (organization_id = public.get_current_user_org_id());

-- Create RLS policies for document_versions table
DROP POLICY IF EXISTS "document_versions_insert_org" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions_select_org" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions_update_org" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions_delete_org" ON public.document_versions;

CREATE POLICY "document_versions_insert_org"
ON public.document_versions
FOR INSERT WITH CHECK (organization_id = public.get_current_user_org_id());

CREATE POLICY "document_versions_select_org"
ON public.document_versions
FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "document_versions_update_org"
ON public.document_versions
FOR UPDATE USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "document_versions_delete_org"
ON public.document_versions
FOR DELETE USING (organization_id = public.get_current_user_org_id());

-- Create RLS policies for document_access_log table
DROP POLICY IF EXISTS "document_access_log_insert_org" ON public.document_access_log;
DROP POLICY IF EXISTS "document_access_log_select_org" ON public.document_access_log;

CREATE POLICY "document_access_log_insert_org"
ON public.document_access_log
FOR INSERT WITH CHECK (organization_id = public.get_current_user_org_id());

CREATE POLICY "document_access_log_select_org"
ON public.document_access_log
FOR SELECT USING (organization_id = public.get_current_user_org_id());
