import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Document type definition
export interface ProjectDocument {
  id: string;
  project_id: string;
  filename: string;
  original_file_name: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  document_type: 'rfq' | 'drawing' | 'specification' | 'quote' | 'contract' | 'other';
  access_level: 'public' | 'internal' | 'confidential' | 'restricted';
  uploaded_at: string;
  uploaded_by: string;
  updated_at: string;
  metadata: {
    tags: string[];
    description?: string;
    version?: string;
    category?: string;
  };
  storage_path: string;
  download_url?: string;
  thumbnail_url?: string;
}

// Document metadata for uploads
export interface DocumentMetadata {
  document_type: ProjectDocument['document_type'];
  access_level: ProjectDocument['access_level'];
  tags: string[];
  description?: string;
  version?: string;
  category?: string;
}

// Hook return type
interface UseDocumentsReturn {
  data: ProjectDocument[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  uploadDocument: (file: File, metadata: DocumentMetadata) => Promise<ProjectDocument>;
  updateDocument: (id: string, updates: Partial<ProjectDocument>) => Promise<ProjectDocument>;
  deleteDocument: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
}

/**
 * Hook for managing project documents
 * Provides CRUD operations and real-time updates for project documents
 */
export function useDocuments(projectId: string): UseDocumentsReturn {
  const [data, setData] = useState<ProjectDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, profile } = useAuth();

  // Fetch documents for the project
  const fetchDocuments = async () => {
    if (!projectId || !user || !profile?.organization_id) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: documents, error: fetchError } = await supabase
        .from('project_documents')
        .select(`
          id,
          project_id,
          filename,
          original_file_name,
          file_size,
          file_type,
          mime_type,
          document_type,
          access_level,
          uploaded_at,
          uploaded_by,
          updated_at,
          metadata,
          storage_path
        `)
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch documents: ${fetchError.message}`);
      }

      setData(documents || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(new Error(errorMessage));
      toast.error('Failed to load documents', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Upload a new document
  const uploadDocument = async (file: File, metadata: DocumentMetadata): Promise<ProjectDocument> => {
    if (!user || !profile?.organization_id) {
      throw new Error('User not authenticated');
    }

    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const storagePath = `${profile.organization_id}/${projectId}/${uniqueFilename}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(storagePath, file);

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Create document record in database
      const { data: document, error: dbError } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          filename: uniqueFilename,
          original_file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          mime_type: file.type,
          document_type: metadata.document_type,
          access_level: metadata.access_level,
          storage_path: storagePath,
          uploaded_by: user.id,
          metadata: {
            tags: metadata.tags,
            description: metadata.description,
            version: metadata.version,
            category: metadata.category
          }
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('project-documents')
          .remove([storagePath]);

        throw new Error(`Failed to create document record: ${dbError.message}`);
      }

      // Add to local state
      setData(prev => [document, ...prev]);

      toast.success('Document uploaded successfully', {
        description: `${file.name} has been uploaded`
      });

      return document;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      toast.error('Upload failed', {
        description: errorMessage
      });
      throw new Error(errorMessage);
    }
  };

  // Update document metadata
  const updateDocument = async (id: string, updates: Partial<ProjectDocument>): Promise<ProjectDocument> => {
    try {
      const { data: document, error } = await supabase
        .from('project_documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update document: ${error.message}`);
      }

      // Update local state
      setData(prev => prev.map(doc => doc.id === id ? document : doc));

      toast.success('Document updated successfully');
      return document;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
      toast.error('Update failed', {
        description: errorMessage
      });
      throw new Error(errorMessage);
    }
  };

  // Delete a single document
  const deleteDocument = async (id: string): Promise<void> => {
    try {
      // Get document info for file cleanup
      const document = data.find(doc => doc.id === id);
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw new Error(`Failed to delete document: ${dbError.message}`);
      }

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('project-documents')
        .remove([document.storage_path]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
        // Don't throw error for storage cleanup failure
      }

      // Remove from local state
      setData(prev => prev.filter(doc => doc.id !== id));

      toast.success('Document deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      toast.error('Delete failed', {
        description: errorMessage
      });
      throw new Error(errorMessage);
    }
  };

  // Delete multiple documents
  const bulkDelete = async (ids: string[]): Promise<void> => {
    try {
      // Get documents for file cleanup
      const documentsToDelete = data.filter(doc => ids.includes(doc.id));
      const storagePaths = documentsToDelete.map(doc => doc.storage_path);

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_documents')
        .delete()
        .in('id', ids);

      if (dbError) {
        throw new Error(`Failed to delete documents: ${dbError.message}`);
      }

      // Delete files from storage
      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('project-documents')
          .remove(storagePaths);

        if (storageError) {
          console.warn('Failed to delete some files from storage:', storageError);
          // Don't throw error for storage cleanup failure
        }
      }

      // Remove from local state
      setData(prev => prev.filter(doc => !ids.includes(doc.id)));

      toast.success(`${ids.length} documents deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete documents';
      toast.error('Bulk delete failed', {
        description: errorMessage
      });
      throw new Error(errorMessage);
    }
  };

  // Refetch documents
  const refetch = async () => {
    await fetchDocuments();
  };

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchDocuments();

    // Set up real-time subscription for document changes
    const subscription = supabase
      .channel(`project-documents-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_documents',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              setData(prev => [payload.new as ProjectDocument, ...prev]);
              break;
            case 'UPDATE':
              setData(prev => prev.map(doc =>
                doc.id === payload.new.id ? payload.new as ProjectDocument : doc
              ));
              break;
            case 'DELETE':
              setData(prev => prev.filter(doc => doc.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId, user, profile?.organization_id]);

  return {
    data,
    isLoading,
    error,
    refetch,
    uploadDocument,
    updateDocument,
    deleteDocument,
    bulkDelete
  };
}