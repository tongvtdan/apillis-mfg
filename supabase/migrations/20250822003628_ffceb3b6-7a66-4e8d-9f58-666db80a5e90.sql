-- Create storage bucket for RFQ attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'rfq-attachments',
    'rfq-attachments',
    false,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip', 'application/x-zip-compressed', 'model/step', 'model/iges', 'application/octet-stream']
);

-- Create RLS policies for RFQ attachments storage
CREATE POLICY "Allow authenticated users to upload RFQ attachments"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'rfq-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view RFQ attachments"
ON storage.objects FOR SELECT 
USING (bucket_id = 'rfq-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public uploads for RFQ submissions"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'rfq-attachments');

CREATE POLICY "Management can manage all RFQ attachments"
ON storage.objects FOR ALL 
USING (bucket_id = 'rfq-attachments' AND has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can manage RFQ attachments"
ON storage.objects FOR ALL 
USING (bucket_id = 'rfq-attachments' AND has_role(auth.uid(), 'Procurement'::user_role));