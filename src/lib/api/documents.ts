import { supabase } from '@/integrations/supabase/client';
import type { ProjectDocument, DocumentComment, DocumentAccessLog } from '@/types/project';

export const documentsApi = {
  async getByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data as ProjectDocument[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as ProjectDocument;
  },

  async create(document: Omit<ProjectDocument, 'id' | 'uploaded_at'>) {
    const { data, error } = await supabase
      .from('project_documents')
      .insert(document)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProjectDocument;
  },

  async update(id: string, updates: Partial<ProjectDocument>) {
    const { data, error } = await supabase
      .from('project_documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProjectDocument;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('project_documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getComments(documentId: string) {
    const { data, error } = await supabase
      .from('document_comments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as DocumentComment[];
  },

  async createComment(comment: Omit<DocumentComment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('document_comments')
      .insert(comment)
      .select()
      .single();
    
    if (error) throw error;
    return data as DocumentComment;
  },

  async logAccess(log: Omit<DocumentAccessLog, 'id' | 'accessed_at'>) {
    const { data, error } = await supabase
      .from('document_access_log')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data as DocumentAccessLog;
  }
};