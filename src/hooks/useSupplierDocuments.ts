import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

export interface SupplierDocument {
    id: string;
    organization_id: string;
    title: string;
    description?: string;
    file_name: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
    category: string;
    version_number: number;
    is_current_version: boolean;
    storage_provider: string;
    checksum?: string;
    access_level: string;
    tags: string[];
    metadata: Record<string, any>;
    uploaded_by?: string;
    approved_by?: string;
    approved_at?: string;
    created_at: string;
    updated_at: string;
    uploaded_by_user?: {
        id: string;
        name: string;
        email: string;
    };
}

export function useSupplierDocuments(supplierId: string) {
    const [documents, setDocuments] = useState<SupplierDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth();
    const { toast } = useToast();

    const fetchDocuments = useCallback(async () => {
        if (!supplierId || !profile?.organization_id) {
            setDocuments([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Fetching documents for supplier:', supplierId);

            const { data, error: fetchError } = await supabase
                .from('documents')
                .select(`
                    *,
                    uploaded_by_user:uploaded_by (
                        id,
                        name,
                        email
                    )
                `)
                .eq('organization_id', profile.organization_id as any)
                .contains('metadata', { supplierId: supplierId })
                .eq('is_current_version', true as any)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('❌ Error fetching supplier documents:', fetchError);
                throw new Error(`Failed to load documents: ${fetchError.message}`);
            }

            console.log('✅ Supplier documents fetched:', data);
            setDocuments((data as any) || []);

        } catch (err) {
            console.error('Error loading supplier documents:', err);
            setError(err instanceof Error ? err.message : 'Failed to load documents');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load supplier documents"
            });
        } finally {
            setLoading(false);
        }
    }, [supplierId, profile?.organization_id, toast]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const uploadDocument = useCallback(async (
        file: File,
        documentType: string,
        title?: string,
        description?: string
    ): Promise<boolean> => {
        if (!supplierId || !user?.id || !profile?.organization_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Missing required information for document upload"
            });
            return false;
        }

        try {
            setLoading(true);

            // Generate unique file name with sanitized characters
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${timestamp}_${sanitizedName}`;
            const filePath = `suppliers/${supplierId}/${fileName}`;

            console.log('📤 Uploading document:', {
                fileName,
                filePath,
                documentType,
                supplierId
            });

            // Upload file to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('❌ File upload failed:', uploadError);
                throw new Error(`Failed to upload file: ${uploadError.message}`);
            }

            console.log('✅ File uploaded successfully:', uploadData);

            // Create document record in database
            const { error: docError } = await supabase
                .from('documents')
                .insert({
                    organization_id: profile.organization_id as any,
                    title: title || file.name,
                    description: description || `Supplier document: ${documentType}`,
                    file_name: fileName,
                    file_path: filePath,
                    file_size: file.size,
                    mime_type: file.type,
                    category: documentType as any,
                    uploaded_by: user.id as any,
                    metadata: {
                        supplierId: supplierId,
                        documentType: documentType,
                        originalFileName: file.name
                    }
                } as any);

            if (docError) {
                console.error('❌ Database insert failed:', docError);
                throw new Error(`Failed to save document record: ${docError.message}`);
            }

            console.log('✅ Document record created successfully');

            // Refresh documents list
            await fetchDocuments();

            toast({
                title: "Success",
                description: "Document uploaded successfully"
            });

            return true;

        } catch (err) {
            console.error('Error uploading document:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to upload document"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [supplierId, user?.id, profile?.organization_id, fetchDocuments, toast]);

    const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
        try {
            setLoading(true);

            // Get document info first
            const document = documents.find(doc => doc.id === documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([document.file_path]);

            if (storageError) {
                console.warn('Storage deletion failed:', storageError);
                // Continue with database deletion even if storage fails
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', documentId as any);

            if (dbError) {
                throw new Error(`Failed to delete document: ${dbError.message}`);
            }

            // Refresh documents list
            await fetchDocuments();

            toast({
                title: "Success",
                description: "Document deleted successfully"
            });

            return true;

        } catch (err) {
            console.error('Error deleting document:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to delete document"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [documents, fetchDocuments, toast]);

    const downloadDocument = useCallback(async (document: SupplierDocument): Promise<void> => {
        try {
            const { data, error } = await supabase.storage
                .from('documents')
                .download(document.file_path);

            if (error) {
                throw new Error(`Failed to download document: ${error.message}`);
            }

            // Create download link
            const url = URL.createObjectURL(data);
            const link = globalThis.document.createElement('a');
            link.href = url;
            link.download = document.file_name;
            globalThis.document.body.appendChild(link);
            link.click();
            globalThis.document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Error downloading document:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to download document"
            });
        }
    }, [toast]);

    return {
        documents,
        loading,
        error,
        uploadDocument,
        deleteDocument,
        downloadDocument,
        refetch: fetchDocuments
    };
}
