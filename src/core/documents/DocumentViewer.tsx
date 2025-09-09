import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Download,
    Eye,
    FileText,
    Image,
    File,
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize,
    Minimize,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useDocumentFiles, useDocumentPreview } from './useDocument';
import { cn } from '@/lib/utils';
import type { ProjectDocument } from '@/types/project';

interface DocumentViewerProps {
    document: ProjectDocument;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export function DocumentViewer({
    document,
    isOpen,
    onClose,
    className
}: DocumentViewerProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { downloadDocument, canPreview } = useDocumentFiles();
    const { getPreview } = useDocumentPreview(document.id);

    const loadPreview = useCallback(async () => {
        if (!canPreview(document)) {
            setError('Preview not available for this file type');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const url = await getPreview();
            setPreviewUrl(url);
        } catch (err) {
            setError('Failed to load preview');
            console.error('Preview error:', err);
        } finally {
            setLoading(false);
        }
    }, [document, canPreview, getPreview]);

    useEffect(() => {
        if (isOpen && document) {
            loadPreview();
        } else {
            setPreviewUrl(null);
            setError(null);
            setZoom(100);
        }
    }, [isOpen, document, loadPreview]);

    const handleDownload = useCallback(async () => {
        try {
            await downloadDocument(document);
        } catch (err) {
            console.error('Download error:', err);
        }
    }, [document, downloadDocument]);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 25, 300));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 25, 25));
    }, []);

    const handleRotate = useCallback(() => {
        // For future implementation - would require more complex image manipulation
        console.log('Rotate functionality would be implemented here');
    }, []);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);

    const getFileIcon = () => {
        const type = document.file_type?.toLowerCase() || '';

        if (type.startsWith('image/')) {
            return <Image className="h-12 w-12 text-blue-500" />;
        } else if (type.includes('pdf')) {
            return <FileText className="h-12 w-12 text-red-500" />;
        } else {
            return <File className="h-12 w-12 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return 'Unknown size';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    const canShowPreview = canPreview(document) && previewUrl && !error;

    return (
        <div className={cn(
            "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
            isFullscreen && "p-0"
        )}>
            <Card className={cn(
                "w-full max-w-4xl max-h-[90vh] flex flex-col",
                isFullscreen && "max-w-none max-h-none h-full rounded-none",
                className
            )}>
                {/* Header */}
                <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {getFileIcon()}
                            <div>
                                <CardTitle className="text-lg truncate max-w-md">
                                    {document.title || document.file_name}
                                </CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline">
                                        {formatFileSize(document.file_size || 0)}
                                    </Badge>
                                    {document.category && (
                                        <Badge variant="secondary">
                                            {document.category}
                                        </Badge>
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(document.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Preview Controls */}
                            {canShowPreview && (
                                <div className="flex items-center space-x-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleZoomOut}
                                        disabled={zoom <= 25}
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm px-2">{zoom}%</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleZoomIn}
                                        disabled={zoom >= 300}
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRotate}
                                    >
                                        <RotateCw className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleFullscreen}
                                    >
                                        {isFullscreen ? (
                                            <Minimize className="h-4 w-4" />
                                        ) : (
                                            <Maximize className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Document Info */}
                    {document.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                            {document.description}
                        </p>
                    )}
                </CardHeader>

                <Separator />

                {/* Content */}
                <CardContent className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground">Loading preview...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Preview Unavailable</h3>
                                <p className="text-muted-foreground mb-4">{error}</p>
                                <Button onClick={handleDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Instead
                                </Button>
                            </div>
                        </div>
                    ) : canShowPreview ? (
                        <div className="h-full overflow-auto">
                            {document.file_type?.startsWith('image/') ? (
                                <div className="flex items-center justify-center h-full">
                                    <img
                                        src={previewUrl!}
                                        alt={document.title || document.file_name}
                                        className="max-w-full max-h-full object-contain"
                                        style={{
                                            transform: `scale(${zoom / 100})`,
                                            transition: 'transform 0.2s ease-in-out'
                                        }}
                                        onError={() => setError('Failed to load image')}
                                    />
                                </div>
                            ) : document.file_type === 'application/pdf' ? (
                                <iframe
                                    src={previewUrl!}
                                    className="w-full h-full border-0"
                                    title={document.title || document.file_name}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">
                                            {document.title || document.file_name}
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            This file type cannot be previewed in the browser.
                                        </p>
                                        <Button onClick={handleDownload}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download File
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                {getFileIcon()}
                                <h3 className="text-lg font-medium mt-4 mb-2">
                                    {document.title || document.file_name}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Preview not available for this file type.
                                </p>
                                <div className="flex items-center justify-center space-x-3">
                                    <Button onClick={handleDownload}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button variant="outline" onClick={onClose}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * Compact document viewer for inline use
 */
export function DocumentViewerCompact({
    document,
    onView,
    className
}: {
    document: ProjectDocument;
    onView?: () => void;
    className?: string;
}) {
    const { canPreview } = useDocumentFiles();

    const getFileIcon = () => {
        const type = document.file_type?.toLowerCase() || '';

        if (type.startsWith('image/')) {
            return <Image className="h-6 w-6 text-blue-500" />;
        } else if (type.includes('pdf')) {
            return <FileText className="h-6 w-6 text-red-500" />;
        } else {
            return <File className="h-6 w-6 text-gray-500" />;
        }
    };

    const canShowPreview = canPreview(document);

    return (
        <div className={cn("flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50", className)}>
            {getFileIcon()}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                    {document.title || document.file_name}
                </p>
                <p className="text-xs text-muted-foreground">
                    {document.file_size ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                </p>
            </div>

            {canShowPreview && onView && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onView}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
