import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProjectDocument } from '@/types/project';
import { documentActionsService } from '@/services/documentActions';
import { documentVersionService } from '@/services/documentVersionService';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentFilter {
    search?: string;
    type?: string[];
    category?: string[];
    accessLevel?: string[];
    dateRange?: {
        from?: Date;
        to?: Date;
    };
    tags?: string[];
    uploadedBy?: string[];
    status?: string[];
}

export interface DocumentSort {
    field: 'name' | 'date' | 'size' | 'type' | 'category';
    order: 'asc' | 'desc';
}

export interface DocumentStats {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    totalSize: number;
    recentUploads: number;
}

export interface DocumentContextType {
    // State
    documents: ProjectDocument[];
    filteredDocuments: ProjectDocument[];
    selectedDocuments: string[];
    loading: boolean;
    error: string | null;
    stats: DocumentStats | null;

    // Current project/document
    projectId: string | null;
    currentDocument: ProjectDocument | null;

    // Filters and sorting
    filters: DocumentFilter;
    sort: DocumentSort;
    searchQuery: string;

    // Actions
    loadDocuments: (projectId: string, filter?: DocumentFilter) => Promise<void>;
    createDocument: (file: File, metadata?: any) => Promise<ProjectDocument | null>;
    updateDocument: (documentId: string, updates: Partial<ProjectDocument>) => Promise<boolean>;
    deleteDocument: (documentId: string) => Promise<boolean>;
    bulkDelete: (documentIds: string[]) => Promise<boolean>;

    // Version management
    createVersion: (documentId: string, file: File, changeSummary?: string) => Promise<boolean>;
    getVersions: (documentId: string) => Promise<any[]>;
    setCurrentVersion: (documentId: string, versionId: string) => Promise<boolean>;

    // File operations
    downloadDocument: (document: ProjectDocument) => Promise<void>;
    getPreviewUrl: (document: ProjectDocument) => Promise<string | null>;
    canPreview: (document: ProjectDocument) => boolean;

    // Selection management
    selectDocument: (documentId: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    toggleSelection: (documentId: string) => void;

    // Filtering and sorting
    setFilters: (filters: DocumentFilter) => void;
    setSort: (sort: DocumentSort) => void;
    setSearchQuery: (query: string) => void;
    clearFilters: () => void;

    // Utilities
    getDocumentById: (documentId: string) => ProjectDocument | null;
    getDocumentsByType: (type: string) => ProjectDocument[];
    getDocumentsByCategory: (category: string) => ProjectDocument[];
    refreshStats: () => Promise<void>;
}

export const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<ProjectDocument[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DocumentStats | null>(null);

    const [projectId, setProjectId] = useState<string | null>(null);
    const [currentDocument, setCurrentDocument] = useState<ProjectDocument | null>(null);

    const [filters, setFilters] = useState<DocumentFilter>({});
    const [sort, setSort] = useState<DocumentSort>({ field: 'date', order: 'desc' });
    const [searchQuery, setSearchQuery] = useState('');

    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Load documents for a project
    const loadDocuments = useCallback(async (projId: string, filter?: DocumentFilter) => {
        if (!profile?.organization_id) return;

        try {
            setLoading(true);
            setError(null);
            setProjectId(projId);

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
                .eq('project_id', projId)
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw new Error(`Failed to load documents: ${fetchError.message}`);
            }

            const docs = data || [];
            setDocuments(docs);
            setFilteredDocuments(applyFiltersAndSort(docs, filter || filters, sort, searchQuery));

            // Calculate stats
            await calculateStats(docs);

        } catch (err) {
            console.error('Error loading documents:', err);
            setError('Failed to load documents');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load documents"
            });
        } finally {
            setLoading(false);
        }
    }, [profile?.organization_id, filters, sort, searchQuery, toast]);

    // Create a new document
    const createDocument = useCallback(async (file: File, metadata?: any, contextProjectId?: string): Promise<ProjectDocument | null> => {
        // Use provided projectId or fall back to internal state
        const activeProjectId = contextProjectId || projectId;

        console.log('📄 [DocumentProvider] createDocument context check:', {
            providedProjectId: contextProjectId,
            internalProjectId: projectId,
            activeProjectId,
            organizationId: profile?.organization_id,
            userId: user?.id
        });

        if (!activeProjectId || !profile?.organization_id) {
            console.error('❌ [DocumentProvider] Missing context:', {
                activeProjectId,
                organizationId: profile?.organization_id,
                userId: user?.id
            });
            toast({
                variant: "destructive",
                title: "Error",
                description: "Project context not available"
            });
            return null;
        }

        try {
            setLoading(true);

            console.log('📄 [DocumentProvider] createDocument called:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                metadata,
                projectId: activeProjectId,
                organizationId: profile?.organization_id,
                userId: user?.id
            });

            // Upload file to storage
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = `${profile.organization_id}/${activeProjectId}/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(`Failed to upload file: ${uploadError.message}`);
            }

            // Create document record
            console.log('💾 Creating database record with data:', {
                organization_id: profile.organization_id,
                project_id: activeProjectId,
                title: file.name,
                file_name: fileName,
                file_path: filePath,
                file_size: file.size,
                mime_type: file.type,
                uploaded_by: user?.id,
                category: metadata?.category || 'general',
                access_level: metadata?.accessLevel || 'private'
            });
            const { data: doc, error: docError } = await supabase
                .from('documents')
                .insert({
                    organization_id: profile.organization_id,
                    project_id: activeProjectId,
                    title: file.name,
                    file_name: fileName,
                    file_path: filePath,
                    file_size: file.size,
                    mime_type: file.type,
                    uploaded_by: user?.id,
                    category: metadata?.category || 'general',
                    access_level: metadata?.accessLevel || 'private',
                    storage_provider: 'supabase', // Explicitly set storage provider
                    metadata: metadata || {}
                })
                .select()
                .single();

            if (docError) {
                console.error('❌ [DocumentProvider] Database insert failed:', {
                    error: docError.message,
                    filePath,
                    fileName,
                    insertData: {
                        organization_id: profile.organization_id,
                        project_id: projectId,
                        title: file.name,
                        file_name: fileName,
                        file_path: filePath,
                        file_size: file.size,
                        mime_type: file.type,
                        uploaded_by: user?.id,
                        category: metadata?.category || 'general',
                        access_level: metadata?.accessLevel || 'private'
                    }
                });
                // Clean up uploaded file if database insert fails
                await supabase.storage.from('documents').remove([filePath]);
                throw new Error(`Failed to create document record: ${docError.message}`);
            }

            // Refresh documents
            await loadDocuments(activeProjectId);

            toast({
                title: "Document Uploaded",
                description: `${file.name} has been uploaded successfully`
            });

            return doc as ProjectDocument;
        } catch (err) {
            console.error('Error creating document:', err);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: err instanceof Error ? err.message : "Failed to upload document"
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [projectId, profile, user, loadDocuments, toast]);

    // Update document metadata
    const updateDocument = useCallback(async (documentId: string, updates: Partial<ProjectDocument>): Promise<boolean> => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('documents')
                .update(updates)
                .eq('id', documentId);

            if (error) {
                throw new Error(`Failed to update document: ${error.message}`);
            }

            // Refresh documents
            if (projectId) {
                await loadDocuments(projectId);
            }

            toast({
                title: "Document Updated",
                description: "Document has been updated successfully"
            });

            return true;
        } catch (err) {
            console.error('Error updating document:', err);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Failed to update document"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [projectId, loadDocuments, toast]);

    // Delete document
    const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
        try {
            setLoading(true);

            const document = documents.find(d => d.id === documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', documentId);

            if (dbError) {
                throw new Error(`Failed to delete document: ${dbError.message}`);
            }

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([document.file_path]);

            if (storageError) {
                console.warn('Failed to delete file from storage:', storageError);
            }

            // Clear selection if deleted document was selected
            setSelectedDocuments(prev => prev.filter(id => id !== documentId));

            // Refresh documents
            if (projectId) {
                await loadDocuments(projectId);
            }

            toast({
                title: "Document Deleted",
                description: "Document has been deleted successfully"
            });

            return true;
        } catch (err) {
            console.error('Error deleting document:', err);
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: "Failed to delete document"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [documents, selectedDocuments, projectId, loadDocuments, toast]);

    // Bulk delete documents
    const bulkDelete = useCallback(async (documentIds: string[]): Promise<boolean> => {
        try {
            setLoading(true);

            const docsToDelete = documents.filter(d => documentIds.includes(d.id));
            if (docsToDelete.length === 0) return true;

            // Delete from database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .in('id', documentIds);

            if (dbError) {
                throw new Error(`Failed to delete documents: ${dbError.message}`);
            }

            // Delete from storage
            const filePaths = docsToDelete.map(d => d.file_path);
            if (filePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('documents')
                    .remove(filePaths);

                if (storageError) {
                    console.warn('Failed to delete some files from storage:', storageError);
                }
            }

            // Clear selection
            setSelectedDocuments([]);

            // Refresh documents
            if (projectId) {
                await loadDocuments(projectId);
            }

            toast({
                title: "Documents Deleted",
                description: `${docsToDelete.length} documents have been deleted successfully`
            });

            return true;
        } catch (err) {
            console.error('Error bulk deleting documents:', err);
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: "Failed to delete documents"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [documents, selectedDocuments, projectId, loadDocuments, toast]);

    // Version management
    const createVersion = useCallback(async (documentId: string, file: File, changeSummary?: string): Promise<boolean> => {
        try {
            setLoading(true);
            await documentVersionService.createDocumentVersion(documentId, file, changeSummary);

            // Refresh documents to get updated version info
            if (projectId) {
                await loadDocuments(projectId);
            }

            toast({
                title: "Version Created",
                description: "New document version has been created"
            });

            return true;
        } catch (err) {
            console.error('Error creating version:', err);
            toast({
                variant: "destructive",
                title: "Version Creation Failed",
                description: "Failed to create new document version"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [projectId, loadDocuments, toast]);

    const getVersions = useCallback(async (documentId: string) => {
        try {
            const history = await documentVersionService.getDocumentVersionHistory(documentId);
            return history?.versions || [];
        } catch (err) {
            console.error('Error getting versions:', err);
            return [];
        }
    }, []);

    const setCurrentVersion = useCallback(async (documentId: string, versionId: string): Promise<boolean> => {
        try {
            setLoading(true);
            const success = await documentVersionService.setCurrentVersion(versionId);

            if (success && projectId) {
                await loadDocuments(projectId);
                toast({
                    title: "Version Updated",
                    description: "Document version has been updated"
                });
            }

            return success;
        } catch (err) {
            console.error('Error setting current version:', err);
            toast({
                variant: "destructive",
                title: "Version Update Failed",
                description: "Failed to update document version"
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [projectId, loadDocuments, toast]);

    // File operations
    const downloadDocument = useCallback(async (document: ProjectDocument) => {
        await documentActionsService.downloadDocument(document);
    }, []);

    const getPreviewUrl = useCallback(async (document: ProjectDocument) => {
        return await documentActionsService.getPreviewUrl(document);
    }, []);

    const canPreview = useCallback((document: ProjectDocument) => {
        return documentActionsService.canPreview(document.file_type || '');
    }, []);

    // Selection management
    const selectDocument = useCallback((documentId: string) => {
        setSelectedDocuments([documentId]);
    }, []);

    const selectAll = useCallback(() => {
        setSelectedDocuments(filteredDocuments.map(d => d.id));
    }, [filteredDocuments]);

    const clearSelection = useCallback(() => {
        setSelectedDocuments([]);
    }, []);

    const toggleSelection = useCallback((documentId: string) => {
        setSelectedDocuments(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    }, []);

    // Filtering and sorting
    const handleSetFilters = useCallback((newFilters: DocumentFilter) => {
        setFilters(newFilters);
        setFilteredDocuments(applyFiltersAndSort(documents, newFilters, sort, searchQuery));
    }, [documents, sort, searchQuery]);

    const handleSetSort = useCallback((newSort: DocumentSort) => {
        setSort(newSort);
        setFilteredDocuments(applyFiltersAndSort(documents, filters, newSort, searchQuery));
    }, [documents, filters, searchQuery]);

    const handleSetSearchQuery = useCallback((query: string) => {
        setSearchQuery(query);
        setFilteredDocuments(applyFiltersAndSort(documents, filters, sort, query));
    }, [documents, filters, sort]);

    const clearFilters = useCallback(() => {
        const emptyFilters = {};
        setFilters(emptyFilters);
        setSearchQuery('');
        setFilteredDocuments(applyFiltersAndSort(documents, emptyFilters, sort, ''));
    }, [documents, sort]);

    // Utility functions
    const getDocumentById = useCallback((documentId: string) => {
        return documents.find(d => d.id === documentId) || null;
    }, [documents]);

    const getDocumentsByType = useCallback((type: string) => {
        return documents.filter(d => d.file_type === type);
    }, [documents]);

    const getDocumentsByCategory = useCallback((category: string) => {
        return documents.filter(d => d.category === category);
    }, [documents]);

    const refreshStats = useCallback(async () => {
        await calculateStats(documents);
    }, [documents]);

    // Helper functions
    const applyFiltersAndSort = useCallback((
        docs: ProjectDocument[],
        filter: DocumentFilter,
        sortConfig: DocumentSort,
        search: string
    ): ProjectDocument[] => {
        let filtered = docs.filter(doc => {
            // Search filter
            if (search) {
                const searchLower = search.toLowerCase();
                const matches = (
                    doc.title?.toLowerCase().includes(searchLower) ||
                    doc.file_name?.toLowerCase().includes(searchLower) ||
                    doc.metadata?.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
                );
                if (!matches) return false;
            }

            // Type filter
            if (filter.type?.length && !filter.type.includes(doc.file_type || '')) {
                return false;
            }

            // Category filter
            if (filter.category?.length && !filter.category.includes(doc.category || '')) {
                return false;
            }

            // Access level filter
            if (filter.accessLevel?.length && !filter.accessLevel.includes(doc.access_level || '')) {
                return false;
            }

            // Date range filter
            if (filter.dateRange?.from || filter.dateRange?.to) {
                const docDate = new Date(doc.created_at);
                if (filter.dateRange.from && docDate < filter.dateRange.from) return false;
                if (filter.dateRange.to && docDate > filter.dateRange.to) return false;
            }

            // Tags filter
            if (filter.tags?.length) {
                const docTags = doc.metadata?.tags || [];
                if (!filter.tags.some(tag => docTags.includes(tag))) return false;
            }

            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortConfig.field) {
                case 'name':
                    aValue = (a.title || a.file_name || '').toLowerCase();
                    bValue = (b.title || b.file_name || '').toLowerCase();
                    break;
                case 'date':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case 'size':
                    aValue = a.file_size || 0;
                    bValue = b.file_size || 0;
                    break;
                case 'type':
                    aValue = a.file_type || '';
                    bValue = b.file_type || '';
                    break;
                case 'category':
                    aValue = a.category || '';
                    bValue = b.category || '';
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, []);

    const calculateStats = useCallback(async (docs: ProjectDocument[]) => {
        const stats: DocumentStats = {
            total: docs.length,
            byType: {},
            byCategory: {},
            byStatus: {},
            totalSize: 0,
            recentUploads: 0
        };

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        docs.forEach(doc => {
            // Count by type
            const type = doc.file_type || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Count by category
            const category = doc.category || 'general';
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

            // Count by status
            const status = doc.status || 'active';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

            // Total size
            stats.totalSize += doc.file_size || 0;

            // Recent uploads (last 7 days)
            if (new Date(doc.created_at) > sevenDaysAgo) {
                stats.recentUploads++;
            }
        });

        setStats(stats);
    }, []);

    const value: DocumentContextType = {
        documents,
        filteredDocuments,
        selectedDocuments,
        loading,
        error,
        stats,
        projectId,
        currentDocument,
        filters,
        sort,
        searchQuery,
        loadDocuments,
        createDocument,
        updateDocument,
        deleteDocument,
        bulkDelete,
        createVersion,
        getVersions,
        setCurrentVersion,
        downloadDocument,
        getPreviewUrl,
        canPreview,
        selectDocument,
        selectAll,
        clearSelection,
        toggleSelection,
        setFilters: handleSetFilters,
        setSort: handleSetSort,
        setSearchQuery: handleSetSearchQuery,
        clearFilters,
        getDocumentById,
        getDocumentsByType,
        getDocumentsByCategory,
        refreshStats
    };

    return (
        <DocumentContext.Provider value={value}>
            {children}
        </DocumentContext.Provider>
    );
}

export function useDocument() {
    const context = useContext(DocumentContext);
    if (context === undefined) {
        throw new Error('useDocument must be used within a DocumentProvider');
    }
    return context;
}
