// Core Documents Module Exports
// This module provides comprehensive document management, versioning, and access control functionality

export { DocumentProvider, useDocument } from './DocumentProvider';
export type {
    DocumentFilter,
    DocumentSort,
    DocumentStats,
    DocumentContextType
} from './DocumentProvider';

export {
    useDocument as useDocumentCore,
    useCurrentDocuments,
    useDocumentManagement,
    useDocumentVersions,
    useDocumentFiles,
    useDocumentSelection,
    useDocumentFilters,
    useDocumentStats,
    useDocumentById,
    useDocumentsByType,
    useDocumentsByCategory,
    useDocumentLoading,
    useDocumentBulkOperations,
    useDocumentPreview,
    useDocumentSearch
} from './useDocument';

export { DocumentUploader, DocumentUploaderCompact } from './DocumentUploader';
export { DocumentViewer, DocumentViewerCompact } from './DocumentViewer';
export { DocumentVersionViewer, DocumentVersionHistoryCompact } from './DocumentVersionViewer';
export { DocumentAccessLog, DocumentAccessLogSummary } from './DocumentAccessLog';
