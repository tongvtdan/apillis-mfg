// Google Drive Utils
// Utility functions for Google Drive integration
// Moved to integrations/google-services for future implementation

import type { GoogleDriveFile, DocumentLinkData } from './types';

/**
 * Extract Google Drive file ID from various URL formats
 */
export function extractGoogleDriveFileId(url: string): string | null {
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9-_]+)/,
        /id=([a-zA-Z0-9-_]+)/,
        /\/d\/([a-zA-Z0-9-_]+)/,
        /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
        /\/presentation\/d\/([a-zA-Z0-9-_]+)/,
        /\/document\/d\/([a-zA-Z0-9-_]+)/
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
 * Validate if URL is a valid Google Drive URL
 */
export function isValidGoogleDriveUrl(url: string): boolean {
    const googleDrivePatterns = [
        /^https:\/\/drive\.google\.com\/file\/d\//,
        /^https:\/\/drive\.google\.com\/open\?id=/,
        /^https:\/\/docs\.google\.com\//,
        /^https:\/\/drive\.google\.com\/uc\?id=/
    ];

    return googleDrivePatterns.some(pattern => pattern.test(url));
}

/**
 * Convert Google Drive file to document link data
 */
export function googleDriveFileToDocumentLink(
    file: GoogleDriveFile,
    description?: string
): DocumentLinkData {
    return {
        title: file.name,
        description: description || `Google Drive file: ${file.name}`,
        external_url: file.webViewLink || generateGoogleDriveSharingUrl(file.id),
        external_id: file.id,
        storage_provider: 'google_drive',
        file_type: file.mimeType,
        file_size: file.size ? parseInt(file.size) : undefined,
        mime_type: file.mimeType,
        tags: ['google-drive'],
        metadata: {
            googleDriveId: file.id,
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime,
            lastModifyingUser: file.lastModifyingUser,
            owners: file.owners,
            capabilities: file.capabilities
        }
    };
}

/**
 * Validate document link data
 */
export function validateDocumentLink(data: DocumentLinkData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
        errors.push('Title is required');
    }

    if (!data.external_url || data.external_url.trim().length === 0) {
        errors.push('External URL is required');
    } else if (!isValidGoogleDriveUrl(data.external_url)) {
        errors.push('Invalid Google Drive URL format');
    }

    if (!data.storage_provider) {
        errors.push('Storage provider is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get file type from MIME type
 */
export function getFileTypeFromMimeType(mimeType: string): string {
    const mimeToType: Record<string, string> = {
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'text/plain': 'txt',
        'application/zip': 'zip',
        'application/x-zip-compressed': 'zip'
    };

    return mimeToType[mimeType] || 'unknown';
}
