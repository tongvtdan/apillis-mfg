import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import type { ProjectDocument, DocumentComment } from '@/types/project';
import { toast } from 'sonner';

export const useDocuments = (projectId: string) => {
  return useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => documentsApi.getByProjectId(projectId),
    enabled: !!projectId,
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: documentsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.project_id] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload document');
      console.error('Upload error:', error);
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProjectDocument> }) =>
      documentsApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['document', data.id] });
      toast.success('Document updated successfully');
    },
    onError: () => {
      toast.error('Failed to update document');
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete document');
    },
  });
};

export const useDocumentComments = (documentId: string) => {
  return useQuery({
    queryKey: ['document-comments', documentId],
    queryFn: () => documentsApi.getComments(documentId),
    enabled: !!documentId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: documentsApi.createComment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-comments', data.document_id] });
      toast.success('Comment added successfully');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });
};