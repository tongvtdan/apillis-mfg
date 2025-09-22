/**
 * Document Debug Utilities
 * 
 * TypeScript utility functions for debugging document saving issues
 * in the Factory Pulse application.
 */

import { supabase } from '@/integrations/supabase/client.ts';
import type { ProjectDocument } from '@/types/project';

export interface DocumentDebugInfo {
    id: string;
    title: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    organizationId: string;
    projectId?: string;
    uploadedBy: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

export interface DocumentValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}

export interface DocumentUploadDebugResult {
    success: boolean;
    step: string;
    data?: any;
    error?: string;
    timestamp: string;
}

export interface StorageBucketInfo {
    name: string;
    public: boolean;
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
}

/**
 * Debug logger for document operations
 */
export class DocumentDebugLogger {
    private logs: DocumentUploadDebugResult[] = [];
    private isEnabled: boolean;

    constructor(enabled: boolean = true) {
        this.isEnabled = enabled;
    }

    log(step: string, data?: any, error?: string): void {
        if (!this.isEnabled) return;

        const logEntry: DocumentUploadDebugResult = {
            success: !error,
            step,
            data,
            error,
            timestamp: new Date().toISOString()
        };

        this.logs.push(logEntry);

        // Also log to console for immediate feedback
        if (error) {
            console.error(`[Document Debug] ${step}:`, error, data);
        } else {
            console.log(`[Document Debug] ${step}:`, data);
        }
    }

    getLogs(): DocumentUploadDebugResult[] {
        return [...this.logs];
    }

    clearLogs(): void {
        this.logs = [];
    }

    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

/**
 * Validate document data before upload
 */
export async function validateDocumentData(
    file: File,
    organizationId?: string,
    projectId?: string,
    userId?: string
): Promise<DocumentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // File validation
    if (!file) {
        errors.push('No file provided');
    } else {
        // File size validation
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`);
        }

        // File type validation
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            warnings.push(`File type '${file.type}' may not be supported`);
            suggestions.push('Consider converting to a supported format (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT)');
        }

        // File name validation
        if (file.name.length > 255) {
            errors.push('File name is too long (maximum 255 characters)');
        }

        if (!file.name.match(/^[a-zA-Z0-9._-]+$/)) {
            warnings.push('File name contains special characters that may cause issues');
            suggestions.push('Use only alphanumeric characters, dots, underscores, and hyphens in file names');
        }
    }

    // Context validation
    if (!organizationId) {
        errors.push('Organization ID is required');
    }

    if (!userId) {
        errors.push('User ID is required');
    }

    if (!projectId) {
        warnings.push('No project ID provided - document will be saved without project association');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions
    };
}

/**
 * Check database connectivity and table structure
 */
export async function checkDatabaseConnectivity(): Promise<{
    connected: boolean;
    tablesExist: boolean;
    error?: string;
}> {
    try {
        // Test basic connection
        const { data, error } = await supabase
            .from('organizations')
            .select('count')
            .limit(1);

        if (error) {
            return {
                connected: false,
                tablesExist: false,
                error: error.message
            };
        }

        // Check if documents table exists
        const { data: docsData, error: docsError } = await supabase
            .from('documents')
            .select('id')
            .limit(1);

        return {
            connected: true,
            tablesExist: !docsError,
            error: docsError?.message
        };
    } catch (error) {
        return {
            connected: false,
            tablesExist: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Check storage bucket configuration
 */
export async function checkStorageBucket(): Promise<{
    exists: boolean;
    accessible: boolean;
    info?: StorageBucketInfo;
    error?: string;
}> {
    try {
        // Try to list files in the documents bucket
        const { data, error } = await supabase.storage
            .from('documents')
            .list('', { limit: 1 });

        if (error) {
            return {
                exists: false,
                accessible: false,
                error: error.message
            };
        }

        return {
            exists: true,
            accessible: true,
            info: {
                name: 'documents',
                public: false // This would need to be checked via API
            }
        };
    } catch (error) {
        return {
            exists: false,
            accessible: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Simulate document upload process with detailed logging
 */
export async function simulateDocumentUpload(
    file: File,
    organizationId: string,
    userId: string,
    projectId?: string,
    logger?: DocumentDebugLogger
): Promise<{
    success: boolean;
    documentId?: string;
    filePath?: string;
    error?: string;
    logs?: DocumentUploadDebugResult[];
}> {
    const debugLogger = logger || new DocumentDebugLogger();
    const logs: DocumentUploadDebugResult[] = [];

    try {
        // Step 1: Validate inputs
        debugLogger.log('Step 1: Validating inputs', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            organizationId,
            userId,
            projectId
        });

        const validation = await validateDocumentData(file, organizationId, projectId, userId);
        if (!validation.isValid) {
            const error = `Validation failed: ${validation.errors.join(', ')}`;
            debugLogger.log('Validation failed', validation, error);
            return { success: false, error, logs: debugLogger.getLogs() };
        }

        // Step 2: Prepare file data
        debugLogger.log('Step 2: Preparing file data', {
            originalName: file.name,
            preparedName: `${Date.now()}_${file.name}`,
            fileSize: file.size
        });

        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${organizationId}/${projectId || 'general'}/${fileName}`;

        // Step 3: Upload to storage
        debugLogger.log('Step 3: Uploading to storage', {
            filePath,
            fileSize: file.size
        });

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) {
            const error = `Storage upload failed: ${uploadError.message}`;
            debugLogger.log('Storage upload failed', uploadError, error);
            return { success: false, error, logs: debugLogger.getLogs() };
        }

        debugLogger.log('Storage upload successful', uploadData);

        // Step 4: Create database record
        debugLogger.log('Step 4: Creating database record', {
            filePath,
            fileName,
            organizationId,
            userId,
            projectId
        });

        const documentRecord = {
            organization_id: organizationId,
            project_id: projectId,
            title: file.name,
            description: `Uploaded document: ${file.name}`,
            file_name: fileName,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            category: 'other' as const,
            version_number: 1,
            is_current_version: true,
            storage_provider: 'supabase',
            access_level: 'organization',
            tags: ['uploaded'],
            uploaded_by: userId,
            metadata: {
                original_file_name: file.name,
                upload_source: 'debug_simulation',
                debug_timestamp: new Date().toISOString()
            }
        };

        const { data: documentData, error: docError } = await supabase
            .from('documents')
            .insert(documentRecord)
            .select()
            .single();

        if (docError) {
            // Clean up uploaded file
            debugLogger.log('Database insert failed, cleaning up uploaded file', docError);
            await supabase.storage.from('documents').remove([filePath]);

            const error = `Database insert failed: ${docError.message}`;
            debugLogger.log('Database insert failed', docError, error);
            return { success: false, error, logs: debugLogger.getLogs() };
        }

        debugLogger.log('Database record created successfully', documentData);

        // Step 5: Verify the record
        debugLogger.log('Step 5: Verifying document record', { documentId: documentData.id });

        const { data: verifyData, error: verifyError } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentData.id)
            .single();

        if (verifyError) {
            debugLogger.log('Verification failed', verifyError, verifyError.message);
        } else {
            debugLogger.log('Document record verified successfully', verifyData);
        }

        return {
            success: true,
            documentId: documentData.id,
            filePath,
            logs: debugLogger.getLogs()
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        debugLogger.log('Simulation failed', error, errorMessage);
        return {
            success: false,
            error: errorMessage,
            logs: debugLogger.getLogs()
        };
    }
}

/**
 * Get document debug information
 */
export async function getDocumentDebugInfo(documentId: string): Promise<DocumentDebugInfo | null> {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select(`
        id,
        title,
        file_name,
        file_path,
        file_size,
        mime_type,
        organization_id,
        project_id,
        uploaded_by,
        created_at,
        metadata
      `)
            .eq('id', documentId)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            title: data.title,
            fileName: data.file_name,
            filePath: data.file_path,
            fileSize: data.file_size,
            mimeType: data.mime_type,
            organizationId: data.organization_id,
            projectId: data.project_id,
            uploadedBy: data.uploaded_by,
            createdAt: data.created_at,
            metadata: data.metadata
        };
    } catch (error) {
        console.error('Error getting document debug info:', error);
        return null;
    }
}

/**
 * Check for common document issues
 */
export async function checkDocumentIssues(): Promise<{
    orphanedDocuments: number;
    missingFiles: number;
    invalidSizes: number;
    duplicatePaths: number;
}> {
    try {
        // Check for orphaned documents (no organization)
        const { count: orphanedCount } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .is('organization_id', null);

        // Check for documents with invalid file sizes
        const { count: invalidSizeCount } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .or('file_size.is.null,file_size.lte.0');

        // Check for duplicate file paths
        const { data: duplicatePaths } = await supabase
            .from('documents')
            .select('file_path')
            .not('file_path', 'is', null);

        const pathCounts = duplicatePaths?.reduce((acc, doc) => {
            acc[doc.file_path] = (acc[doc.file_path] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};

        const duplicatePathsCount = Object.values(pathCounts).filter(count => count > 1).length;

        return {
            orphanedDocuments: orphanedCount || 0,
            missingFiles: 0, // This would require checking actual file existence
            invalidSizes: invalidSizeCount || 0,
            duplicatePaths: duplicatePathsCount
        };
    } catch (error) {
        console.error('Error checking document issues:', error);
        return {
            orphanedDocuments: 0,
            missingFiles: 0,
            invalidSizes: 0,
            duplicatePaths: 0
        };
    }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate debug report
 */
export async function generateDebugReport(): Promise<{
    timestamp: string;
    databaseStatus: any;
    storageStatus: any;
    documentIssues: any;
    recommendations: string[];
}> {
    const timestamp = new Date().toISOString();

    const databaseStatus = await checkDatabaseConnectivity();
    const storageStatus = await checkStorageBucket();
    const documentIssues = await checkDocumentIssues();

    const recommendations: string[] = [];

    if (!databaseStatus.connected) {
        recommendations.push('Fix database connectivity issues');
    }

    if (!storageStatus.exists) {
        recommendations.push('Configure documents storage bucket');
    }

    if (documentIssues.orphanedDocuments > 0) {
        recommendations.push(`Clean up ${documentIssues.orphanedDocuments} orphaned documents`);
    }

    if (documentIssues.duplicatePaths > 0) {
        recommendations.push(`Fix ${documentIssues.duplicatePaths} duplicate file paths`);
    }

    return {
        timestamp,
        databaseStatus,
        storageStatus,
        documentIssues,
        recommendations
    };
}

/**
 * Clean up test documents created by debug operations
 */
export async function cleanupDebugDocuments(): Promise<{
    cleaned: number;
    errors: string[];
}> {
    const errors: string[] = [];
    let cleaned = 0;

    try {
        // Find debug documents
        const { data: debugDocs, error } = await supabase
            .from('documents')
            .select('id, file_path')
            .or('title.ilike.%test%,title.ilike.%debug%,metadata->>debug_script.eq.true');

        if (error) {
            errors.push(`Error finding debug documents: ${error.message}`);
            return { cleaned, errors };
        }

        if (!debugDocs || debugDocs.length === 0) {
            return { cleaned, errors };
        }

        // Remove files from storage
        const filePaths = debugDocs.map(doc => doc.file_path).filter(Boolean);
        if (filePaths.length > 0) {
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove(filePaths);

            if (storageError) {
                errors.push(`Error removing files from storage: ${storageError.message}`);
            }
        }

        // Remove database records
        const documentIds = debugDocs.map(doc => doc.id);
        const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .in('id', documentIds);

        if (deleteError) {
            errors.push(`Error removing database records: ${deleteError.message}`);
        } else {
            cleaned = documentIds.length;
        }

    } catch (error) {
        errors.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { cleaned, errors };
}