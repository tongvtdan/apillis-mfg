import { useContext } from 'react';
import { DocumentContext, DocumentContextType } from './DocumentProvider';

/**
 * Custom hook to access document context
 * Provides type-safe access to document state and methods
 */
export function useDocument(): DocumentContextType {
    const context = useContext(DocumentContext);

    if (context === undefined) {
        throw new Error('useDocument must be used within a DocumentProvider');
    }

    return context;
}

/**
 * Hook to get current document state
 * Returns documents, loading, and error status
 */
export function useCurrentDocuments() {
    const {
        documents,
        filteredDocuments,
        selectedDocuments,
        loading,
        error,
        stats,
        projectId
    } = useDocument();

    return {
        documents,
        filteredDocuments,
        selectedDocuments,
        loading,
        error,
        stats,
        projectId,
        hasDocuments: documents.length > 0,
        hasSelectedDocuments: selectedDocuments.length > 0,
        selectedCount: selectedDocuments.length,
        totalCount: documents.length,
        filteredCount: filteredDocuments.length
    };
}

/**
 * Hook to manage document creation and updates
 * Provides methods for creating, updating, and deleting documents
 */
export function useDocumentManagement() {
    const {
        createDocument,
        updateDocument,
        deleteDocument,
        bulkDelete,
        loading
    } = useDocument();

    return {
        createDocument,
        updateDocument,
        deleteDocument,
        bulkDelete,
        loading
    };
}

/**
 * Hook to manage document versions
 * Provides methods for version management
 */
export function useDocumentVersions() {
    const {
        createVersion,
        getVersions,
        setCurrentVersion,
        loading
    } = useDocument();

    return {
        createVersion,
        getVersions,
        setCurrentVersion,
        loading
    };
}

/**
 * Hook to manage document file operations
 * Provides methods for downloading and previewing documents
 */
export function useDocumentFiles() {
    const {
        downloadDocument,
        getPreviewUrl,
        canPreview
    } = useDocument();

    return {
        downloadDocument,
        getPreviewUrl,
        canPreview
    };
}

/**
 * Hook to manage document selection
 * Provides methods for selecting and deselecting documents
 */
export function useDocumentSelection() {
    const {
        selectedDocuments,
        selectDocument,
        selectAll,
        clearSelection,
        toggleSelection,
        filteredDocuments
    } = useDocument();

    const isAllSelected = filteredDocuments.length > 0 && selectedDocuments.length === filteredDocuments.length;
    const isIndeterminate = selectedDocuments.length > 0 && selectedDocuments.length < filteredDocuments.length;

    return {
        selectedDocuments,
        selectDocument,
        selectAll,
        clearSelection,
        toggleSelection,
        isAllSelected,
        isIndeterminate,
        hasSelection: selectedDocuments.length > 0
    };
}

/**
 * Hook to manage document filtering and sorting
 * Provides methods for filtering and sorting documents
 */
export function useDocumentFilters() {
    const {
        filters,
        sort,
        searchQuery,
        setFilters,
        setSort,
        setSearchQuery,
        clearFilters
    } = useDocument();

    return {
        filters,
        sort,
        searchQuery,
        setFilters,
        setSort,
        setSearchQuery,
        clearFilters,
        hasActiveFilters: Object.keys(filters).length > 0 || searchQuery.length > 0
    };
}

/**
 * Hook to get document statistics
 * Returns various document statistics
 */
export function useDocumentStats() {
    const { stats, refreshStats } = useDocument();

    return {
        stats,
        refreshStats,
        totalDocuments: stats?.total || 0,
        totalSize: stats?.totalSize || 0,
        recentUploads: stats?.recentUploads || 0,
        documentsByType: stats?.byType || {},
        documentsByCategory: stats?.byCategory || {},
        documentsByStatus: stats?.byStatus || {}
    };
}

/**
 * Hook to get a specific document by ID
 * Returns document data and utility functions
 */
export function useDocumentById(documentId: string) {
    const {
        getDocumentById,
        downloadDocument,
        getPreviewUrl,
        canPreview,
        updateDocument,
        deleteDocument
    } = useDocument();

    const document = getDocumentById(documentId);

    return {
        document,
        downloadDocument: document ? () => downloadDocument(document) : undefined,
        getPreviewUrl: document ? () => getPreviewUrl(document) : undefined,
        canPreview: document ? canPreview(document) : false,
        updateDocument: (updates: any) => updateDocument(documentId, updates),
        deleteDocument: () => deleteDocument(documentId),
        exists: !!document
    };
}

/**
 * Hook to get documents by type
 * Returns filtered documents by file type
 */
export function useDocumentsByType(type: string) {
    const { getDocumentsByType } = useDocument();

    return {
        documents: getDocumentsByType(type),
        type
    };
}

/**
 * Hook to get documents by category
 * Returns filtered documents by category
 */
export function useDocumentsByCategory(category: string) {
    const { getDocumentsByCategory } = useDocument();

    return {
        documents: getDocumentsByCategory(category),
        category
    };
}

/**
 * Hook to manage document loading and refreshing
 * Provides methods for loading and refreshing documents
 */
export function useDocumentLoading() {
    const {
        loadDocuments,
        refreshStats,
        loading,
        error
    } = useDocument();

    return {
        loadDocuments,
        refreshStats,
        loading,
        error,
        hasError: !!error
    };
}

/**
 * Hook to manage bulk document operations
 * Provides methods for bulk operations on selected documents
 */
export function useDocumentBulkOperations() {
    const {
        selectedDocuments,
        bulkDelete,
        clearSelection,
        loading
    } = useDocument();

    const deleteSelected = async () => {
        if (selectedDocuments.length === 0) return false;

        const success = await bulkDelete(selectedDocuments);
        if (success) {
            clearSelection();
        }
        return success;
    };

    return {
        selectedDocuments,
        deleteSelected,
        clearSelection,
        loading,
        hasSelection: selectedDocuments.length > 0,
        selectedCount: selectedDocuments.length
    };
}

/**
 * Hook to get document preview capabilities
 * Returns preview-related utilities
 */
export function useDocumentPreview(documentId?: string) {
    const { getPreviewUrl, canPreview, getDocumentById } = useDocument();

    const document = documentId ? getDocumentById(documentId) : null;

    const getPreview = async () => {
        if (!document) return null;
        return await getPreviewUrl(document);
    };

    const canPreviewDoc = document ? canPreview(document) : false;

    return {
        getPreview,
        canPreview: canPreviewDoc,
        document,
        hasDocument: !!document
    };
}

/**
 * Hook to manage document search
 * Provides search functionality
 */
export function useDocumentSearch() {
    const { searchQuery, setSearchQuery, filteredDocuments } = useDocument();

    return {
        searchQuery,
        setSearchQuery,
        filteredDocuments,
        hasResults: filteredDocuments.length > 0,
        resultCount: filteredDocuments.length
    };
}
