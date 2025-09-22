import { supabase } from '@/integrations/supabase/client.ts';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { ProjectDocument } from '@/hooks/useDocuments';

// Service role client.ts for storage operations (bypasses RLS)
const supabaseServiceRole = createClient(
    import.meta.env.VITE_SUPABASE_URL || 'https://ynhgxwnkpbpzwbtzrzka.supabase.co',
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaGd4d25rcGJwendidHpyemthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc4NjE1OSwiZXhwIjoyMDcxMzYyMTU5fQ.4hohg8ZybIOX_frV6EHm2LwTRPYi07xEy6lRIkQZSUo'
);

export interface DocumentEditData {
    title?: string;
    description?: string;
    category?: string;
    access_level?: string;
    tags?: string[];
}

class DocumentActionsService {
    /**
     * Download a document
     */
    async downloadDocument(document: ProjectDocument): Promise<void> {
        try {
            // Create a signed URL for download
            const { data, error } = await supabaseServiceRole.storage
                .from('documents')
                .createSignedUrl(document.file_path, 3600); // 1 hour expiry

            if (error) {
                throw new Error(`Failed to generate download link: ${error.message}`);
            }

            if (!data?.signedUrl) {
                throw new Error('Failed to generate download link');
            }

            // Create a temporary link element and trigger download
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = document.title || document.file_name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Download started');
        } catch (error) {
            console.error('Error downloading document:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to download document';
            toast.error('Download failed', {
                description: errorMessage
            });
            throw error;
        }
    }

    /**
     * Edit document metadata
     */
    async editDocument(documentId: string, editData: DocumentEditData): Promise<ProjectDocument> {
        try {
            const updateData: any = {};

            // Update basic fields
            if (editData.title !== undefined) updateData.title = editData.title;
            if (editData.description !== undefined) updateData.description = editData.description;
            if (editData.category !== undefined) updateData.category = editData.category;
            if (editData.access_level !== undefined) updateData.access_level = editData.access_level;

            // Update metadata if tags are provided
            if (editData.tags !== undefined) {
                updateData.metadata = {
                    tags: editData.tags
                };
            }

            const { data, error } = await supabase
                .from('documents')
                .update(updateData)
                .eq('id', documentId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update document: ${error.message}`);
            }

            toast.success('Document updated successfully');
            return data as ProjectDocument;
        } catch (error) {
            console.error('Error updating document:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update document';
            toast.error('Update failed', {
                description: errorMessage
            });
            throw error;
        }
    }

    /**
     * Delete a document
     */
    async deleteDocument(document: ProjectDocument): Promise<void> {
        try {
            // Delete from database first
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', document.id);

            if (dbError) {
                throw new Error(`Failed to delete document: ${dbError.message}`);
            }

            // Delete file from storage
            const { error: storageError } = await supabaseServiceRole.storage
                .from('documents')
                .remove([document.file_path]);

            if (storageError) {
                console.warn('Failed to delete file from storage:', storageError);
                // Don't throw error for storage cleanup failure, but log it
            }

            toast.success('Document deleted successfully');
        } catch (error) {
            console.error('Error deleting document:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete document';
            toast.error('Delete failed', {
                description: errorMessage
            });
            throw error;
        }
    }

    /**
     * Bulk delete multiple documents
     */
    async bulkDeleteDocuments(documents: ProjectDocument[]): Promise<void> {
        try {
            const documentIds = documents.map(doc => doc.id);
            const storagePaths = documents.map(doc => doc.file_path);

            // Delete from database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .in('id', documentIds);

            if (dbError) {
                throw new Error(`Failed to delete documents: ${dbError.message}`);
            }

            // Delete files from storage
            if (storagePaths.length > 0) {
                const { error: storageError } = await supabaseServiceRole.storage
                    .from('documents')
                    .remove(storagePaths);

                if (storageError) {
                    console.warn('Failed to delete some files from storage:', storageError);
                    // Don't throw error for storage cleanup failure
                }
            }

            toast.success(`${documents.length} documents deleted successfully`);
        } catch (error) {
            console.error('Error bulk deleting documents:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete documents';
            toast.error('Bulk delete failed', {
                description: errorMessage
            });
            throw error;
        }
    }

    /**
     * Get document preview URL
     */
    async getPreviewUrl(document: ProjectDocument): Promise<string | null> {
        try {
            // For images and PDFs, we can create a signed URL for preview
            const { data, error } = await supabaseServiceRole.storage
                .from('documents')
                .createSignedUrl(document.file_path, 3600); // 1 hour expiry

            if (error) {
                console.error('Error creating preview URL:', error);
                return null;
            }

            return data?.signedUrl || null;
        } catch (error) {
            console.error('Error getting preview URL:', error);
            return null;
        }
    }

    /**
 * Check if file type can be previewed
 */
    canPreview(mimeType: string): boolean {
        const previewableTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp',
            'application/pdf',
            'text/plain',
            'text/csv'
        ];
        return previewableTypes.includes(mimeType);
    }

    /**
     * Check if document is a link
     */
    isLink(document: any): boolean {
        // A document is a link if it has an external_url OR if it's stored externally
        // Regular uploaded files should have file_path and be stored locally/supabase
        return !!(document.external_url || (document.storage_provider && document.storage_provider !== 'supabase' && document.storage_provider !== 'local'));
    }

    /**
     * Get link preview URL for external documents
     */
    getLinkPreviewUrl(document: any): string | null {
        if (!document.external_url) return null;

        // For Google Drive links, we can generate preview URLs
        if (document.storage_provider === 'google_drive' && document.external_id) {
            if (document.mime_type?.startsWith('image/')) {
                return `https://drive.google.com/uc?export=view&id=${document.external_id}`;
            }
            if (document.mime_type === 'application/pdf') {
                return `https://drive.google.com/file/d/${document.external_id}/preview`;
            }
            return `https://drive.google.com/file/d/${document.external_id}/view`;
        }

        // For other links, return the external URL
        return document.external_url;
    }

    /**
     * Safely format a date string
     */
    formatDate(dateString: string | null | undefined, formatString: string): string {
        if (!dateString) {
            return 'Unknown date';
        }

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            return format(date, formatString);
        } catch (error) {
            console.warn('Error formatting date:', error);
            return 'Invalid date';
        }
    }
}

export const documentActionsService = new DocumentActionsService();
