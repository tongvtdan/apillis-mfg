// Google Drive Integration
// Main export file for Google Drive integration
// Moved to integrations/google-services for future implementation

export * from './googleDriveService';
export * from './types';
export * from './utils';

// Re-export commonly used types
export type {
  GoogleDriveFile,
  GoogleDriveConfig,
  GoogleDriveToken,
  DocumentLinkData,
  GoogleDriveAuthState
} from './types';

// Re-export commonly used functions
export {
  googleDriveService,
  extractGoogleDriveFileId,
  generateGoogleDriveSharingUrl,
  isValidGoogleDriveUrl,
  validateDocumentLink,
  googleDriveFileToDocumentLink
} from './utils';
