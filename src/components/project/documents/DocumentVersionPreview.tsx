import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Download,
    X,
    Eye,
    ExternalLink,
    Image as ImageIcon,
    FileSpreadsheet,
    FileCode,
    Archive,
    Clock,
    User,
    AlertTriangle,
    Tag,
    File
} from 'lucide-react';
import { format } from 'date-fns';
import { DocumentVersion } from '@/services/documentVersionService';
import { documentVersionService } from '@/services/documentVersionService';
import { toast } from 'sonner';

interface DocumentVersionPreviewProps {
    version: DocumentVersion;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Document version preview component
 * Provides preview for PDFs, images, and metadata display for other files
 */
export const DocumentVersionPreview: React.FC<DocumentVersionPreviewProps> = ({
    version,
    isOpen,
    onClose
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get file icon based on type
    const getFileIcon = (mimeType: string, fileName: string) => {
        if (mimeType?.startsWith('image/')) {
            return <ImageIcon className="w-5 h-5" />;
        }
        if (mimeType?.includes('pdf')) {
            return <FileText className="w-5 h-5" />;
        }
        if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) {
            return <FileSpreadsheet className="w-5 h-5" />;
        }
        if (fileName?.match(/\.(dwg|dxf|step|stp|iges|igs)$/i)) {
            return <FileCode className="w-5 h-5" />;
        }
        if (mimeType?.includes('zip') || mimeType?.includes('archive')) {
            return <Archive className="w-5 h-5" />;
        }
        return <FileText className="w-5 h-5" />;
    };

    // Format file size
    const formatFileSize = (bytes?: number): string => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Get readable file type
    const getReadableFileType = (mimeType?: string, fileName?: string): string => {
        if (!mimeType && !fileName) return 'Unknown';

        // Common MIME type mappings
        const mimeTypeMap: Record<string, string> = {
            'application/pdf': 'PDF',
            'image/jpeg': 'JPEG',
            'image/jpg': 'JPG',
            'image/png': 'PNG',
            'image/gif': 'GIF',
            'image/webp': 'WebP',
            'image/svg+xml': 'SVG',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
            'application/vnd.ms-excel': 'Excel',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
            'application/msword': 'Word',
            'text/plain': 'Text',
            'text/csv': 'CSV'
        };

        // Try MIME type first
        if (mimeType && mimeTypeMap[mimeType]) {
            return mimeTypeMap[mimeType];
        }

        // Fallback to file extension
        if (fileName) {
            const extension = fileName.split('.').pop()?.toUpperCase();
            if (extension) {
                return extension;
            }
        }

        // Final fallback
        return mimeType || 'Unknown';
    };

    // Check if file can be previewed
    const canPreview = (mimeType: string): boolean => {
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
    };

    // Load preview URL
    useEffect(() => {
        if (isOpen && version && canPreview(version.mime_type)) {
            loadPreviewUrl();
        }
    }, [isOpen, version]);

    const loadPreviewUrl = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const url = await documentVersionService.getVersionPreviewUrl(version.id);
            setPreviewUrl(url);
        } catch (err) {
            console.error('Error loading preview:', err);
            setError('Failed to load preview');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const downloadUrl = await documentVersionService.getVersionDownloadUrl(version.id);
            if (downloadUrl) {
                window.open(downloadUrl, '_blank');
            } else {
                toast.error('Failed to generate download link');
            }
        } catch (err) {
            console.error('Error downloading version:', err);
            toast.error('Failed to download version');
        }
    };

    const handleOpenExternal = () => {
        if (previewUrl) {
            window.open(previewUrl, '_blank');
        }
    };

    const renderPreview = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading preview...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">Preview not available</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            );
        }

        if (!canPreview(version.mime_type)) {
            return (
                <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                    <div className="text-center">
                        {getFileIcon(version.mime_type, version.file_name)}
                        <p className="text-muted-foreground mt-4 mb-2">Preview not available for this file type</p>
                        <p className="text-sm text-muted-foreground">
                            {getReadableFileType(version.mime_type, version.file_name)}
                        </p>
                        <Button variant="outline" className="mt-4" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download to View
                        </Button>
                    </div>
                </div>
            );
        }

        if (version.mime_type?.startsWith('image/')) {
            return (
                <div className="bg-muted rounded-lg p-4">
                    <img
                        src={previewUrl || ''}
                        alt={version.title}
                        className="max-w-full max-h-96 mx-auto rounded"
                        onError={() => setError('Failed to load image')}
                    />
                </div>
            );
        }

        if (version.mime_type?.includes('pdf')) {
            return (
                <div className="bg-muted rounded-lg">
                    <iframe
                        src={previewUrl || ''}
                        className="w-full h-96 rounded-lg"
                        title={version.title}
                        onError={() => setError('Failed to load PDF')}
                    />
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No preview available</p>
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    {getFileIcon(version.mime_type, version.file_name)}
                    <span className="truncate">{version.title}</span>
                    <Badge variant="secondary" className="text-xs">
                        v{version.version_number}
                    </Badge>
                </div>
            }
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6">
                {/* Version Info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left column - File details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Version {version.version_number}
                                </Badge>
                                {version.is_current && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        Current
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">File name:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{version.file_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Size:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{formatFileSize(version.file_size)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Type:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{getReadableFileType(version.mime_type, version.file_name)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Upload details */}
                        <div className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Uploaded:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{format(new Date(version.uploaded_at), 'MMM d, yyyy h:mm a')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 text-slate-500" />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Uploaded by:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{version.uploader_name || 'Unknown'}</span>
                                </div>
                            </div>

                            {/* Version Information */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <File className="w-3 h-3 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Version:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{version.version_number}</span>
                                </div>
                                {version.change_summary && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                            <Tag className="w-3 h-3 text-slate-500" />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Version change notes:</span>
                                        </div>
                                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs border border-slate-200 dark:border-slate-600">
                                            <span className="text-slate-600 dark:text-slate-400">{version.change_summary}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Preview</h4>
                        {previewUrl && canPreview(version.mime_type) && (
                            <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open in New Tab
                            </Button>
                        )}
                    </div>

                    {renderPreview()}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </div>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
