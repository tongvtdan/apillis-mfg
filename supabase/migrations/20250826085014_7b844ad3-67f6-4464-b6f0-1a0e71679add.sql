-- Fix RLS policies to allow proper UPDATE and INSERT operations

-- Allow users to mark their own messages as read
CREATE POLICY "Users can mark messages as read" ON public.messages
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = messages.project_id 
    AND (
      has_role(auth.uid(), 'Management'::user_role) OR 
      has_role(auth.uid(), 'Procurement'::user_role) OR 
      has_role(auth.uid(), 'Engineering'::user_role) OR 
      p.assignee_id = auth.uid() OR
      messages.recipient_id = auth.uid()
    )
  )
);

-- Allow users to mark their own notifications as read
CREATE POLICY "Users can mark notifications as read" ON public.notifications
FOR UPDATE 
USING (user_id = auth.uid());

-- Allow logging document access
CREATE POLICY "Users can log document access" ON public.document_access_log
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view document access logs" ON public.document_access_log
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM project_documents pd
    JOIN projects p ON pd.project_id = p.id
    WHERE pd.id = document_access_log.document_id
    AND (
      has_role(auth.uid(), 'Management'::user_role) OR 
      has_role(auth.uid(), 'Procurement'::user_role) OR 
      has_role(auth.uid(), 'Engineering'::user_role) OR 
      p.assignee_id = auth.uid()
    )
  )
);

-- Update messages policy to allow editing content/subject
DROP POLICY IF EXISTS "Users can create messages for accessible projects" ON public.messages;
CREATE POLICY "Users can create messages for accessible projects" ON public.messages
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = messages.project_id 
    AND (
      has_role(auth.uid(), 'Management'::user_role) OR 
      has_role(auth.uid(), 'Procurement'::user_role) OR 
      has_role(auth.uid(), 'Engineering'::user_role) OR 
      p.assignee_id = auth.uid()
    )
  )
);