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
    Archive
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { documentActionsService } from '@/services/documentActions';
import type { ProjectDocument } from '@/hooks/useDocuments';
import { toast } from 'sonner';

interface DocumentPreviewProps {
    document: ProjectDocument;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (document: ProjectDocument) => void;
    onDelete?: (document: ProjectDocument) => void;
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
    onDelete
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

    // Load preview URL
    useEffect(() => {
        if (!isOpen || !document.file_path || !canPreview(document.mime_type)) {
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
    }, [isOpen, document.file_path, document.mime_type]);

    // Download document
    const handleDownload = async () => {
        try {
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

        if (!canPreview(document.mime_type)) {
            return (
                <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                    <div className="text-center">
                        {getFileIcon(document.mime_type || '', document.file_name)}
                        <p className="text-muted-foreground mt-4 mb-2">Preview not available for this file type</p>
                        <p className="text-sm text-muted-foreground">
                            {document.mime_type || 'Unknown file type'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
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
                        </div>

                        <div className="text-sm space-y-1">
                            <div><strong>File name:</strong> {document.file_name}</div>
                            <div><strong>Size:</strong> {formatFileSize(document.file_size)}</div>
                            <div><strong>Type:</strong> {document.mime_type || 'Unknown'}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm space-y-1">
                            <div><strong>Uploaded:</strong> {format(new Date(document.created_at), 'PPP')}</div>
                            <div><strong>Modified:</strong> {format(new Date(document.updated_at), 'PPP')}</div>
                            {document.uploaded_by && (
                                <div><strong>Uploaded by:</strong> {document.uploaded_by}</div>
                            )}
                        </div>

                        {/* Tags */}
                        {document.metadata?.tags && document.metadata.tags.length > 0 && (
                            <div>
                                <div className="text-sm font-medium mb-1">Tags:</div>
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
                            <Download className="w-4 h-4 mr-2" />
                            Download
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