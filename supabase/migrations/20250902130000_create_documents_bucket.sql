-- Create documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 52428800, ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/dwg', 'application/step', 'text/plain']);

-- Create RLS policies for documents bucket
CREATE POLICY "Users can upload documents to their organization's folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view documents from their organization" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents from their organization" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents from their organization" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );
