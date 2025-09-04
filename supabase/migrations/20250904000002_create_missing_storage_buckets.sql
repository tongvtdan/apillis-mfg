-- =====================================================
-- Create Missing Storage Buckets
-- Date: September 4, 2025
-- =====================================================

-- Create rfq-attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('rfq-attachments', 'rfq-attachments', false, 10485760, ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/dwg', 'application/step', 'text/plain'])
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/dwg', 'application/step', 'text/plain'];

-- Create approval-attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('approval-attachments', 'approval-attachments', false, 10485760, ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/dwg', 'application/step', 'text/plain'])
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/dwg', 'application/step', 'text/plain'];

-- Create RLS policies for rfq-attachments bucket
DROP POLICY IF EXISTS "Users can upload RFQ attachments to their organization's folder" ON storage.objects;
CREATE POLICY "Users can upload RFQ attachments to their organization's folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'rfq-attachments' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view RFQ attachments from their organization" ON storage.objects;
CREATE POLICY "Users can view RFQ attachments from their organization" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'rfq-attachments' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete RFQ attachments from their organization" ON storage.objects;
CREATE POLICY "Users can delete RFQ attachments from their organization" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'rfq-attachments' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Create RLS policies for approval-attachments bucket
DROP POLICY IF EXISTS "Users can upload approval attachments to their organization's folder" ON storage.objects;
CREATE POLICY "Users can upload approval attachments to their organization's folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'approval-attachments' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view approval attachments from their organization" ON storage.objects;
CREATE POLICY "Users can view approval attachments from their organization" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'approval-attachments' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete approval attachments from their organization" ON storage.objects;
CREATE POLICY "Users can delete approval attachments from their organization" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'approval-attachments' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM users 
      WHERE id = auth.uid()
    )
  );
