import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { DocumentLinkData } from '@/types/googleDrive';

// Helper function to convert MIME types to shorter file type identifiers
const getFileTypeFromMimeType = (mimeType: string): string => {
  const mimeTypeMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/acad': 'dwg',
    'application/dxf': 'dxf',
    'application/step': 'step',
    'application/x-step': 'step',
    'model/step': 'step',
    'application/iges': 'iges',
    'model/iges': 'iges',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'text/plain': 'txt',
    'text/csv': 'csv',
  };

  return mimeTypeMap[mimeType] || 'unknown';
};

// Document type definition
export interface ProjectDocument {
  id: string;
  project_id: string;
  file_name: string;
  title: string;
  description?: string;
  file_size?: number;
  file_type?: string;
  mime_type?: string;
  category?: string;
  access_level: string;
  created_at: string;
  uploaded_by?: string;
  updated_at: string;
  metadata: {
    tags?: string[];
    description?: string;
    version?: string;
    category?: string;
  };
  file_path: string;
  download_url?: string;
  thumbnail_url?: string;
}

// Document metadata for uploads
export interface DocumentMetadata {
  document_type: string;
  access_level: string;
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
  addDocumentLink: (linkData: DocumentLinkData) => Promise<ProjectDocument>;
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
        .from('documents')
        .select(`
          id,
          project_id,
          file_name,
          title,
          description,
          file_size,
          file_type,
          mime_type,
          category,
          access_level,
          created_at,
          uploaded_by,
          updated_at,
          metadata,
          file_path
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

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

      // Upload file to Supabase Storage with timeout configuration
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Prepare document data with all required fields and proper defaults
      const documentData = {
        project_id: projectId,
        organization_id: profile.organization_id,
        file_name: uniqueFilename,
        title: file.name,
        description: metadata.description || '',
        file_size: file.size,
        file_type: getFileTypeFromMimeType(file.type), // Use shorter file type identifier
        mime_type: file.type,
        category: metadata.document_type || 'other',
        access_level: metadata.access_level || 'internal',
        file_path: storagePath,
        uploaded_by: user.id,
        metadata: {
          tags: metadata.tags || [],
          description: metadata.description || '',
          version: metadata.version || '1.0',
          category: metadata.category || metadata.document_type || 'other'
        }
      };

      // Create document record in database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('documents')
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

  // Add a document link (Google Drive, external URL, etc.)
  const addDocumentLink = async (linkData: DocumentLinkData): Promise<ProjectDocument> => {
    if (!user || !profile?.organization_id) {
      throw new Error('User not authenticated');
    }

    try {
      // Prepare document data for link
      const documentData = {
        project_id: projectId,
        organization_id: profile.organization_id,
        file_name: linkData.title,
        title: linkData.title,
        description: linkData.description || '',
        file_size: 0, // Links don't have file size
        file_type: linkData.document_type || 'other',
        mime_type: 'application/link',
        category: linkData.document_type || 'other',
        access_level: linkData.access_level || 'internal',
        file_path: '', // No local file path for links
        uploaded_by: user.id,
        // Link-specific fields
        storage_provider: linkData.storage_provider,
        external_id: linkData.external_id,
        external_url: linkData.external_url,
        link_type: linkData.link_type,
        link_permissions: linkData.link_permissions,
        link_expires_at: linkData.link_expires_at,
        metadata: {
          tags: linkData.tags || [],
          description: linkData.description || '',
          version: '1.0',
          category: linkData.document_type || 'other',
          link_type: linkData.link_type,
          storage_provider: linkData.storage_provider,
        }
      };

      // Create document record in database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (dbError) {
        throw new Error(`Failed to add document link: ${dbError.message}`);
      }

      // Log document access
      await supabase
        .from('document_access_log')
        .insert({
          document_id: document.id,
          user_id: user.id,
          action: 'upload',
        });

      toast.success('Document link added successfully');
      return document;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add document link';
      toast.error('Failed to add document link', {
        description: errorMessage
      });
      throw new Error(errorMessage);
    }
  };

  // Update document metadata
  const updateDocument = async (id: string, updates: Partial<ProjectDocument>): Promise<ProjectDocument> => {
    try {
      const { data: document, error } = await supabase
        .from('documents')
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
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw new Error(`Failed to delete document: ${dbError.message}`);
      }

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

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
      const storagePaths = documentsToDelete.map(doc => doc.file_path);

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .in('id', ids);

      if (dbError) {
        throw new Error(`Failed to delete documents: ${dbError.message}`);
      }

      // Delete files from storage
      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('documents')
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
          table: 'documents',
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
    addDocumentLink,
    updateDocument,
    deleteDocument,
    bulkDelete
  };
}