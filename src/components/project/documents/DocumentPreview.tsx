import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Download,
    Edit,
    Trash2,
    X,
    Eye,
    ExternalLink,
    Image as ImageIcon,
    FileSpreadsheet,
    FileCode,
    Archive,
    History,
    User,
    Clock,
    Tag,
    File
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { documentActionsService } from '@/services/documentActions';
import type { ProjectDocument } from '@/hooks/useDocuments';
import { useUserDisplayName } from '@/features/customer-management/hooks/useUsers';
import { toast } from 'sonner';

interface DocumentPreviewProps {
    document: ProjectDocument;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (document: ProjectDocument) => void;
    onDelete?: (document: ProjectDocument) => void;
    onVersionHistory?: (document: ProjectDocument) => void;
}

/**
 * Document preview component with support for common file types
 * Provides preview for PDFs, images, and metadata display for other files
 */
export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
    document,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onVersionHistory
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get user display name for uploaded_by field
    const uploaderName = useUserDisplayName(document.uploaded_by);

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

    // Get document type color
    const getDocumentTypeColor = (type?: string): string => {
        const colors = {
            rfq: 'bg-blue-100 text-blue-800',
            drawing: 'bg-green-100 text-green-800',
            specification: 'bg-purple-100 text-purple-800',
            quote: 'bg-orange-100 text-orange-800',
            contract: 'bg-red-100 text-red-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[type as keyof typeof colors] || colors.other;
    };

    // Check if file can be previewed
    const canPreview = (mimeType?: string): boolean => {
        if (!mimeType) return false;
        return documentActionsService.canPreview(mimeType);
    };

    // Check if document is a link
    const isLink = (): boolean => {
        return documentActionsService.isLink(document);
    };

    // Get link preview URL
    const getLinkPreviewUrl = (): string | null => {
        return documentActionsService.getLinkPreviewUrl(document);
    };

    // Load preview URL
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        // Handle links differently
        if (isLink()) {
            const linkPreviewUrl = getLinkPreviewUrl();
            if (linkPreviewUrl) {
                setPreviewUrl(linkPreviewUrl);
                setIsLoading(false);
            } else {
                setError('Unable to generate preview for this link');
                setIsLoading(false);
            }
            return;
        }

        // Handle regular files
        if (!document.file_path || !canPreview(document.mime_type)) {
            return;
        }

        const loadPreview = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Get signed URL for preview
                const { data, error: urlError } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(document.file_path, 3600); // 1 hour expiry

                if (urlError) {
                    throw new Error(`Failed to load preview: ${urlError.message}`);
                }

                setPreviewUrl(data.signedUrl);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load preview';
                setError(errorMessage);
                toast.error('Preview failed', { description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };

        loadPreview();
    }, [isOpen, document.file_path, document.mime_type, document.external_url, document.storage_provider, document.external_id]);

    // Download document
    const handleDownload = async () => {
        try {
            // For links, open in new tab instead of downloading
            if (isLink() && document.external_url) {
                window.open(document.external_url, '_blank');
                return;
            }

            await documentActionsService.downloadDocument(document);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    // Open in new tab
    const handleOpenExternal = async () => {
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
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">Preview not available</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            );
        }

        // Handle links
        if (isLink()) {
            if (!previewUrl) {
                return (
                    <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                        <div className="text-center">
                            <ExternalLink className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-2">Link preview not available</p>
                            <Button variant="outline" className="mt-4" onClick={() => window.open(document.external_url, '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Link
                            </Button>
                        </div>
                    </div>
                );
            }

            // For Google Drive links, we can embed them
            if (document.storage_provider === 'google_drive' && document.external_id) {
                if (document.mime_type?.startsWith('image/')) {
                    return (
                        <div className="bg-muted rounded-lg p-4">
                            <img
                                src={previewUrl}
                                alt={document.title}
                                className="max-w-full max-h-96 mx-auto rounded"
                                onError={() => setError('Failed to load image')}
                            />
                        </div>
                    );
                }

                if (document.mime_type === 'application/pdf') {
                    return (
                        <div className="bg-muted rounded-lg">
                            <iframe
                                src={previewUrl}
                                className="w-full h-96 rounded-lg"
                                title={document.title}
                                onError={() => setError('Failed to load PDF')}
                            />
                        </div>
                    );
                }
            }

            // For other links, show a link card
            return (
                <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                    <div className="text-center">
                        <ExternalLink className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">External Link</p>
                        <p className="text-sm text-muted-foreground mb-4 break-all">{document.external_url}</p>
                        <Button variant="outline" onClick={() => window.open(document.external_url, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Link
                        </Button>
                    </div>
                </div>
            );
        }

        if (!canPreview(document.mime_type)) {
            return (
                <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                    <div className="text-center">
                        {getFileIcon(document.mime_type || '', document.file_name)}
                        <p className="text-muted-foreground mt-4 mb-2">Preview not available for this file type</p>
                        <p className="text-sm text-muted-foreground">
                            {getReadableFileType(document.mime_type, document.file_name)}
                        </p>
                        <Button variant="outline" className="mt-4" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download to View
                        </Button>
                    </div>
                </div>
            );
        }

        if (!previewUrl) {
            return (
                <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                    <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No preview available</p>
                    </div>
                </div>
            );
        }

        // Image preview
        if (document.mime_type?.startsWith('image/')) {
            return (
                <div className="bg-muted rounded-lg p-4">
                    <img
                        src={previewUrl}
                        alt={document.title}
                        className="max-w-full max-h-96 mx-auto rounded"
                        onError={() => setError('Failed to load image')}
                    />
                </div>
            );
        }

        // PDF preview
        if (document.mime_type === 'application/pdf') {
            return (
                <div className="bg-muted rounded-lg">
                    <iframe
                        src={previewUrl}
                        className="w-full h-96 rounded-lg"
                        title={document.title}
                        onError={() => setError('Failed to load PDF')}
                    />
                </div>
            );
        }

        // Text preview
        if (document.mime_type === 'text/plain') {
            return (
                <div className="bg-muted rounded-lg p-4">
                    <iframe
                        src={previewUrl}
                        className="w-full h-96 border-0"
                        title={document.title}
                        onError={() => setError('Failed to load text file')}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    {getFileIcon(document.mime_type || '', document.file_name)}
                    <span className="truncate">{document.title}</span>
                </div>
            }
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6">
                {/* Document metadata */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left column - File details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${getDocumentTypeColor(document.category)}`}
                                >
                                    {document.category || 'other'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {document.access_level}
                                </Badge>
                                {document.version_number && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        v{document.version_number}
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">File name:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{document.file_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Size:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{formatFileSize(document.file_size)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Type:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{getReadableFileType(document.mime_type, document.file_name)}</span>
                                </div>
                                {isLink() && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">Storage:</span>
                                            <span className="text-slate-600 dark:text-slate-400">{document.storage_provider || 'External'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">Link Type:</span>
                                            <span className="text-slate-600 dark:text-slate-400">{document.link_type || 'file'}</span>
                                        </div>
                                        {document.link_access_count !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">Access Count:</span>
                                                <span className="text-slate-600 dark:text-slate-400">{document.link_access_count}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right column - Upload details */}
                        <div className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Uploaded:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{documentActionsService.formatDate(document.created_at, 'PPP')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Modified:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{documentActionsService.formatDate(document.updated_at, 'PPP')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 text-slate-500" />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Uploaded by:</span>
                                    <span className="text-slate-600 dark:text-slate-400">{uploaderName}</span>
                                </div>
                            </div>

                            {/* Version Information */}
                            {document.version_number && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <File className="w-3 h-3 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Current version:</span>
                                        <span className="text-slate-600 dark:text-slate-400">{document.version_number}</span>
                                    </div>
                                    {document.metadata?.version && (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1">
                                                <Tag className="w-3 h-3 text-slate-500" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Version change notes:</span>
                                            </div>
                                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs border border-slate-200 dark:border-slate-600">
                                                <span className="text-slate-600 dark:text-slate-400">{document.metadata.version}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tags */}
                            {document.metadata?.tags && document.metadata.tags.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-3 h-3 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tags:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {document.metadata.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {document.description && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{document.description}</p>
                    </div>
                )}

                {/* Preview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Preview</h4>
                        {previewUrl && canPreview(document.mime_type) && (
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
                            {isLink() ? (
                                <>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Link
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onVersionHistory && onVersionHistory(document)}
                        >
                            <History className="w-4 h-4 mr-2" />
                            Version History
                        </Button>
                        {onEdit && (
                            <Button variant="outline" onClick={() => onEdit(document)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {onDelete && (
                            <Button variant="outline" onClick={() => onDelete(document)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>

                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};