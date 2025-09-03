import { supabase } from '@/integrations/supabase/client';
import { ProjectDocument } from '@/types/project';

export interface DocumentVersion {
    id: string;
    organization_id: string;
    document_id: string;
    version_number: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    title: string;
    description?: string;
    change_summary?: string;
    uploaded_by: string;
    uploaded_at: string;
    is_current: boolean;
    metadata?: Record<string, any>;
    // Joined fields
    uploader_name?: string;
    uploader_email?: string;
}

export interface DocumentVersionHistory {
    document: ProjectDocument;
    versions: DocumentVersion[];
    current_version: DocumentVersion;
    total_versions: number;
}

export interface VersionComparisonResult {
    version_a: DocumentVersion;
    version_b: DocumentVersion;
    differences: {
        file_size_change: number;
        file_size_change_percent: number;
        title_changed: boolean;
        description_changed: boolean;
        metadata_changes: string[];
    };
    can_compare_content: boolean;
}

class DocumentVersionService {
    /**
     * Create a new version of a document
     */
    async createDocumentVersion(
        documentId: string,
        file: File,
        changeSummary?: string,
        metadata?: Record<string, any>
    ): Promise<DocumentVersion> {
        try {
            // Get the current document to determine next version number
            const { data: currentDoc, error: docError } = await supabase
                .from('documents')
                .select('*')
                .eq('id', documentId)
                .single();

            if (docError || !currentDoc) {
                throw new Error('Document not found');
            }

            // Get the latest version number
            const { data: latestVersion, error: versionError } = await supabase
                .from('document_versions')
                .select('version_number')
                .eq('document_id', documentId)
                .order('version_number', { ascending: false })
                .limit(1)
                .single();

            const nextVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

            // Upload the new file to storage
            const fileExtension = file.name.split('.').pop();
            const versionFileName = `${currentDoc.file_name.split('.')[0]}_v${nextVersionNumber}.${fileExtension}`;
            const storagePath = `${currentDoc.organization_id}/${currentDoc.project_id}/versions/${versionFileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(storagePath, file);

            if (uploadError) {
                throw new Error(`Failed to upload file: ${uploadError.message}`);
            }

            // Create version record
            const { data: version, error: insertError } = await supabase
                .from('document_versions')
                .insert({
                    organization_id: currentDoc.organization_id,
                    document_id: documentId,
                    version_number: nextVersionNumber,
                    file_name: versionFileName,
                    file_path: storagePath,
                    file_size: file.size,
                    mime_type: file.type,
                    title: currentDoc.title,
                    description: currentDoc.description,
                    change_summary: changeSummary,
                    uploaded_by: (await supabase.auth.getUser()).data.user?.id,
                    metadata: metadata || {},
                    is_current: true
                })
                .select()
                .single();

            if (insertError) {
                // Clean up uploaded file if database insert fails
                await supabase.storage.from('documents').remove([storagePath]);
                throw new Error(`Failed to create version record: ${insertError.message}`);
            }

            // Update previous versions to not be current
            await supabase
                .from('document_versions')
                .update({ is_current: false })
                .eq('document_id', documentId)
                .neq('id', version.id);

            // Update the main document record with new version info
            await supabase
                .from('documents')
                .update({
                    file_name: versionFileName,
                    file_path: storagePath,
                    file_size: file.size,
                    file_type: file.type,
                    version: nextVersionNumber,
                    updated_at: new Date().toISOString()
                })
                .eq('id', documentId);

            return version;
        } catch (error) {
            console.error('Error creating document version:', error);
            throw error;
        }
    }

    /**
     * Get version history for a document
     */
    async getDocumentVersionHistory(documentId: string): Promise<DocumentVersionHistory | null> {
        try {
            // Get the document
            const { data: document, error: docError } = await supabase
                .from('documents')
                .select('*')
                .eq('id', documentId)
                .single();

            if (docError || !document) {
                return null;
            }

            // Get all versions with uploader info
            const { data: versions, error: versionsError } = await supabase
                .from('document_versions')
                .select(`
                    *,
                    uploader:uploaded_by (
                        name,
                        email
                    )
                `)
                .eq('document_id', documentId)
                .order('version_number', { ascending: false });

            if (versionsError) {
                throw new Error(`Failed to fetch versions: ${versionsError.message}`);
            }

            const versionsWithUploaderInfo = (versions || []).map(version => ({
                ...version,
                uploader_name: version.uploader?.name,
                uploader_email: version.uploader?.email
            }));

            const currentVersion = versionsWithUploaderInfo.find(v => v.is_current) || versionsWithUploaderInfo[0];

            return {
                document,
                versions: versionsWithUploaderInfo,
                current_version: currentVersion,
                total_versions: versionsWithUploaderInfo.length
            };
        } catch (error) {
            console.error('Error getting document version history:', error);
            return null;
        }
    }

    /**
     * Get a specific version of a document
     */
    async getDocumentVersion(versionId: string): Promise<DocumentVersion | null> {
        try {
            const { data: version, error } = await supabase
                .from('document_versions')
                .select(`
                    *,
                    uploader:uploaded_by (
                        name,
                        email
                    )
                `)
                .eq('id', versionId)
                .single();

            if (error || !version) {
                return null;
            }

            return {
                ...version,
                uploader_name: version.uploader?.name,
                uploader_email: version.uploader?.email
            };
        } catch (error) {
            console.error('Error getting document version:', error);
            return null;
        }
    }

    /**
     * Set a specific version as current
     */
    async setCurrentVersion(versionId: string): Promise<boolean> {
        try {
            console.log('🔄 DocumentVersionService: Setting current version:', versionId);

            // Get the version to make current
            const { data: targetVersion, error: versionError } = await supabase
                .from('document_versions')
                .select('*')
                .eq('id', versionId)
                .single();

            if (versionError || !targetVersion) {
                throw new Error('Version not found');
            }

            console.log('🔄 DocumentVersionService: Target version found:', {
                documentId: targetVersion.document_id,
                versionNumber: targetVersion.version_number,
                fileName: targetVersion.file_name
            });

            // Update all versions for this document to not be current
            const { error: resetError } = await supabase
                .from('document_versions')
                .update({ is_current: false })
                .eq('document_id', targetVersion.document_id);

            if (resetError) {
                console.error('Error resetting current versions:', resetError);
            }

            // Set the target version as current
            const { error: updateError } = await supabase
                .from('document_versions')
                .update({ is_current: true })
                .eq('id', versionId);

            if (updateError) {
                throw new Error(`Failed to set current version: ${updateError.message}`);
            }

            console.log('🔄 DocumentVersionService: Version set as current, updating main document');

            // Update the main document record with explicit fields
            const { error: docUpdateError } = await supabase
                .from('documents')
                .update({
                    file_name: targetVersion.file_name,
                    file_path: targetVersion.file_path,
                    file_size: targetVersion.file_size,
                    file_type: targetVersion.mime_type,
                    version: targetVersion.version_number,
                    is_current_version: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', targetVersion.document_id);

            if (docUpdateError) {
                console.error('Error updating main document:', docUpdateError);
                throw new Error(`Failed to update main document: ${docUpdateError.message}`);
            }

            console.log('✅ DocumentVersionService: Current version set successfully');
            return true;
        } catch (error) {
            console.error('❌ DocumentVersionService: Error setting current version:', error);
            return false;
        }
    }

    /**
     * Delete a document version
     */
    async deleteDocumentVersion(versionId: string): Promise<boolean> {
        try {
            // Get the version to delete
            const { data: version, error: versionError } = await supabase
                .from('document_versions')
                .select('*')
                .eq('id', versionId)
                .single();

            if (versionError || !version) {
                throw new Error('Version not found');
            }

            // Don't allow deleting the current version if it's the only version
            if (version.is_current) {
                const { data: otherVersions, error: countError } = await supabase
                    .from('document_versions')
                    .select('id')
                    .eq('document_id', version.document_id)
                    .neq('id', versionId);

                if (countError) {
                    throw new Error('Failed to check other versions');
                }

                if (!otherVersions || otherVersions.length === 0) {
                    throw new Error('Cannot delete the only version of a document');
                }

                // If deleting current version, set the previous version as current
                const { data: previousVersion, error: prevError } = await supabase
                    .from('document_versions')
                    .select('*')
                    .eq('document_id', version.document_id)
                    .neq('id', versionId)
                    .order('version_number', { ascending: false })
                    .limit(1)
                    .single();

                if (prevError || !previousVersion) {
                    throw new Error('Failed to find previous version');
                }

                await this.setCurrentVersion(previousVersion.id);
            }

            // Delete the file from storage
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([version.file_path]);

            if (storageError) {
                console.warn('Failed to delete file from storage:', storageError);
                // Continue with database deletion even if storage cleanup fails
            }

            // Delete the version record
            const { error: deleteError } = await supabase
                .from('document_versions')
                .delete()
                .eq('id', versionId);

            if (deleteError) {
                throw new Error(`Failed to delete version: ${deleteError.message}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting document version:', error);
            return false;
        }
    }

    /**
     * Compare two document versions
     */
    async compareVersions(versionAId: string, versionBId: string): Promise<VersionComparisonResult | null> {
        try {
            const [versionA, versionB] = await Promise.all([
                this.getDocumentVersion(versionAId),
                this.getDocumentVersion(versionBId)
            ]);

            if (!versionA || !versionB) {
                return null;
            }

            const fileSizeChange = versionB.file_size - versionA.file_size;
            const fileSizeChangePercent = versionA.file_size > 0
                ? Math.round((fileSizeChange / versionA.file_size) * 100)
                : 0;

            const metadataChanges: string[] = [];

            // Compare metadata
            const metadataA = versionA.metadata || {};
            const metadataB = versionB.metadata || {};

            const allKeys = new Set([...Object.keys(metadataA), ...Object.keys(metadataB)]);

            allKeys.forEach(key => {
                const valueA = metadataA[key];
                const valueB = metadataB[key];

                if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
                    metadataChanges.push(`${key}: ${JSON.stringify(valueA)} → ${JSON.stringify(valueB)}`);
                }
            });

            // Determine if content comparison is possible
            const canCompareContent = this.canCompareFileContent(versionA.mime_type, versionB.mime_type);

            return {
                version_a: versionA,
                version_b: versionB,
                differences: {
                    file_size_change: fileSizeChange,
                    file_size_change_percent: fileSizeChangePercent,
                    title_changed: versionA.title !== versionB.title,
                    description_changed: (versionA.description || '') !== (versionB.description || ''),
                    metadata_changes: metadataChanges
                },
                can_compare_content: canCompareContent
            };
        } catch (error) {
            console.error('Error comparing versions:', error);
            return null;
        }
    }

    /**
     * Get download URL for a specific version
     */
    async getVersionDownloadUrl(versionId: string): Promise<string | null> {
        try {
            const version = await this.getDocumentVersion(versionId);
            if (!version) {
                return null;
            }

            const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(version.file_path, 3600); // 1 hour expiry

            if (error) {
                console.error('Error creating signed URL:', error);
                return null;
            }

            return data.signedUrl;
        } catch (error) {
            console.error('Error getting download URL:', error);
            return null;
        }
    }

    /**
     * Get preview URL for a specific version
     */
    async getVersionPreviewUrl(versionId: string): Promise<string | null> {
        try {
            const version = await this.getDocumentVersion(versionId);
            if (!version) {
                return null;
            }

            // For images and PDFs, we can create a preview URL
            if (this.canPreviewFile(version.mime_type)) {
                const { data, error } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(version.file_path, 3600); // 1 hour expiry

                if (error) {
                    console.error('Error creating preview URL:', error);
                    return null;
                }

                return data.signedUrl;
            }

            return null;
        } catch (error) {
            console.error('Error getting preview URL:', error);
            return null;
        }
    }

    /**
     * Check if a file type can be previewed
     */
    private canPreviewFile(mimeType: string): boolean {
        const previewableTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ];
        return previewableTypes.includes(mimeType);
    }

    /**
     * Get all versions for multiple documents
     */
    async getBulkVersionHistory(documentIds: string[]): Promise<Record<string, DocumentVersionHistory>> {
        try {
            const histories: Record<string, DocumentVersionHistory> = {};

            const historyPromises = documentIds.map(async (docId) => {
                const history = await this.getDocumentVersionHistory(docId);
                if (history) {
                    histories[docId] = history;
                }
            });

            await Promise.all(historyPromises);
            return histories;
        } catch (error) {
            console.error('Error getting bulk version history:', error);
            return {};
        }
    }

    /**
     * Check if file content can be compared
     */
    private canCompareFileContent(mimeTypeA: string, mimeTypeB: string): boolean {
        const comparableTypes = [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        return mimeTypeA === mimeTypeB && comparableTypes.includes(mimeTypeA);
    }

    /**
     * Clean up old versions (keep only the last N versions)
     */
    async cleanupOldVersions(documentId: string, keepVersions: number = 10): Promise<number> {
        try {
            // Get all versions ordered by version number (newest first)
            const { data: versions, error } = await supabase
                .from('document_versions')
                .select('id, version_number, file_path, is_current')
                .eq('document_id', documentId)
                .order('version_number', { ascending: false });

            if (error || !versions) {
                return 0;
            }

            // Keep the current version and the specified number of recent versions
            const versionsToKeep = versions.slice(0, keepVersions);
            const versionsToDelete = versions.slice(keepVersions);

            // Don't delete the current version
            const safeToDelete = versionsToDelete.filter(v => !v.is_current);

            if (safeToDelete.length === 0) {
                return 0;
            }

            // Delete files from storage
            const filePaths = safeToDelete.map(v => v.file_path);
            if (filePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('documents')
                    .remove(filePaths);

                if (storageError) {
                    console.warn('Some files could not be deleted from storage:', storageError);
                }
            }

            // Delete version records
            const versionIds = safeToDelete.map(v => v.id);
            const { error: deleteError } = await supabase
                .from('document_versions')
                .delete()
                .in('id', versionIds);

            if (deleteError) {
                throw new Error(`Failed to delete old versions: ${deleteError.message}`);
            }

            return safeToDelete.length;
        } catch (error) {
            console.error('Error cleaning up old versions:', error);
            return 0;
        }
    }
}

// Export singleton instance
export const documentVersionService = new DocumentVersionService();