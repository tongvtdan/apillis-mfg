// Google Drive Utility Functions
// Helper functions for Google Drive integration

import type { GoogleDriveFile, DocumentLinkData } from '@/types/googleDrive';

/**
 * Extract file ID from Google Drive URL
 */
export function extractGoogleDriveFileId(url: string): string | null {
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9-_]+)/, // Standard sharing URL
        /id=([a-zA-Z0-9-_]+)/, // URL with id parameter
        /\/d\/([a-zA-Z0-9-_]+)/, // Direct file URL
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
}

/**
 * Generate Google Drive sharing URL
 */
export function generateGoogleDriveSharingUrl(fileId: string, permission: 'view' | 'edit' = 'view'): string {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
}

/**
 * Validate Google Drive URL format
 */
export function isValidGoogleDriveUrl(url: string): boolean {
    const googleDrivePatterns = [
        /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9-_]+/,
        /^https:\/\/drive\.google\.com\/open\?id=[a-zA-Z0-9-_]+/,
        /^https:\/\/docs\.google\.com\/[a-zA-Z]+\/d\/[a-zA-Z0-9-_]+/,
    ];

    return googleDrivePatterns.some(pattern => pattern.test(url));
}

/**
 * Get file type from MIME type
 */
export function getFileTypeFromMimeType(mimeType: string): string {
    const typeMap: Record<string, string> = {
        'application/pdf': 'pdf',
        'application/vnd.google-apps.document': 'gdoc',
        'application/vnd.google-apps.spreadsheet': 'gsheet',
        'application/vnd.google-apps.presentation': 'gslides',
        'application/vnd.google-apps.folder': 'folder',
        'image/jpeg': 'image',
        'image/png': 'image',
        'image/gif': 'image',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'text/plain': 'text',
        'application/zip': 'archive',
    };

    return typeMap[mimeType] || 'unknown';
}

/**
 * Get file icon based on MIME type
 */
export function getFileIcon(mimeType: string): string {
    const iconMap: Record<string, string> = {
        'application/pdf': 'FileText',
        'application/vnd.google-apps.document': 'FileText',
        'application/vnd.google-apps.spreadsheet': 'Table',
        'application/vnd.google-apps.presentation': 'Presentation',
        'application/vnd.google-apps.folder': 'Folder',
        'image/jpeg': 'Image',
        'image/png': 'Image',
        'image/gif': 'Image',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'FileText',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Table',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Presentation',
        'text/plain': 'FileText',
        'application/zip': 'Archive',
    };

    return iconMap[mimeType] || 'File';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: string | number): string {
    const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;

    if (size === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));

    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Convert Google Drive file to DocumentLinkData
 */
export function googleDriveFileToDocumentLink(
    file: GoogleDriveFile,
    projectId: string,
    organizationId: string,
    uploadedBy: string
): DocumentLinkData {
    return {
        title: file.name,
        description: `Google Drive file: ${file.name}`,
        external_url: file.webViewLink || generateGoogleDriveSharingUrl(file.id),
        external_id: file.id,
        link_type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        link_permissions: {
            canDownload: file.capabilities?.canDownload || false,
            canEdit: file.capabilities?.canEdit || false,
            canShare: file.capabilities?.canShare || false,
            canView: file.capabilities?.canView || true,
        },
        document_type: getFileTypeFromMimeType(file.mimeType),
        access_level: 'internal',
        tags: ['google-drive'],
        storage_provider: 'google_drive',
    };
}

/**
 * Validate document link data
 */
export function validateDocumentLink(data: DocumentLinkData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title?.trim()) {
        errors.push('Title is required');
    }

    if (!data.external_url?.trim()) {
        errors.push('External URL is required');
    } else if (!isValidGoogleDriveUrl(data.external_url)) {
        errors.push('Invalid Google Drive URL format');
    }

    if (!data.storage_provider) {
        errors.push('Storage provider is required');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Generate preview URL for Google Drive file
 */
export function generatePreviewUrl(fileId: string, mimeType: string): string {
    if (mimeType.includes('image/')) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    if (mimeType.includes('application/pdf')) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Check if file is viewable in browser
 */
export function isViewableInBrowser(mimeType: string): boolean {
    const viewableTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'text/html',
        'application/vnd.google-apps.document',
        'application/vnd.google-apps.spreadsheet',
        'application/vnd.google-apps.presentation',
    ];

    return viewableTypes.includes(mimeType);
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
    const extensionMap: Record<string, string> = {
        'application/pdf': '.pdf',
        'application/vnd.google-apps.document': '.gdoc',
        'application/vnd.google-apps.spreadsheet': '.gsheet',
        'application/vnd.google-apps.presentation': '.gslides',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
        'text/plain': '.txt',
        'application/zip': '.zip',
    };

    return extensionMap[mimeType] || '';
}
