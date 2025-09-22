import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, ArrowLeft, Image, File, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client.js';
import { useSupplierDocuments } from '@/hooks/useSupplierDocuments';

export default function DocumentPreviewPage() {
    const { supplierId, documentId } = useParams<{ supplierId: string; documentId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { documents, downloadDocument } = useSupplierDocuments(supplierId || '');

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'text' | 'unsupported'>('unsupported');

    // Find the document
    const document = documents.find(doc => doc.id === documentId);

    // Determine preview type based on file extension and mime type
    const getPreviewType = (fileName: string, mimeType?: string): 'pdf' | 'image' | 'text' | 'unsupported' => {
        const extension = fileName.split('.').pop()?.toLowerCase();

        if (extension === 'pdf' || mimeType === 'application/pdf') {
            return 'pdf';
        }

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '') ||
            mimeType?.startsWith('image/')) {
            return 'image';
        }

        if (['txt', 'md', 'csv'].includes(extension || '') ||
            mimeType?.startsWith('text/')) {
            return 'text';
        }

        return 'unsupported';
    };

    // Load document preview
    useEffect(() => {
        if (!document) return;

        const loadPreview = async () => {
            setLoading(true);
            setError(null);

            try {
                const type = getPreviewType(document.file_name, document.mime_type);
                setPreviewType(type);

                if (type === 'unsupported') {
                    setError('This file type cannot be previewed');
                    return;
                }

                // Get signed URL for the file
                const { data, error: urlError } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(document.file_path, 3600); // 1 hour expiry

                if (urlError) {
                    throw new Error(`Failed to generate preview URL: ${urlError.message}`);
                }

                setPreviewUrl(data.signedUrl);
            } catch (err) {
                console.error('Error loading document preview:', err);
                setError(err instanceof Error ? err.message : 'Failed to load document preview');
                toast({
                    variant: "destructive",
                    title: "Preview Error",
                    description: "Failed to load document preview"
                });
            } finally {
                setLoading(false);
            }
        };

        loadPreview();
    }, [document, toast]);

    const handleDownload = () => {
        if (document) {
            downloadDocument(document);
        }
    };

    const handleBack = () => {
        navigate(`/suppliers/${supplierId}`);
    };

    const getFileIcon = () => {
        switch (previewType) {
            case 'pdf':
                return <FileText className="w-6 h-6 text-red-600" />;
            case 'image':
                return <Image className="w-6 h-6 text-blue-600" />;
            case 'text':
                return <File className="w-6 h-6 text-green-600" />;
            default:
                return <File className="w-6 h-6 text-gray-600" />;
        }
    };

    const renderPreview = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" />
                        <p className="text-lg">Loading preview...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <p className="text-lg text-red-600 mb-2">Preview Error</p>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download to view
                        </Button>
                    </div>
                </div>
            );
        }

        if (!previewUrl) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <File className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-lg text-muted-foreground">No preview available</p>
                    </div>
                </div>
            );
        }

        switch (previewType) {
            case 'pdf':
                return (
                    <iframe
                        src={previewUrl}
                        className="w-full h-[calc(100vh-200px)] border rounded-lg"
                        title={`Preview of ${document?.title}`}
                    />
                );
            case 'image':
                return (
                    <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                        <img
                            src={previewUrl}
                            alt={document?.title}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                    </div>
                );
            case 'text':
                return (
                    <div className="h-[calc(100vh-200px)] overflow-auto border rounded-lg p-6 bg-gray-50">
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-0"
                            title={`Preview of ${document?.title}`}
                        />
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <File className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-lg text-muted-foreground mb-4">Preview not supported for this file type</p>
                            <Button onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download to view
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    if (!document) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
                    <p className="text-muted-foreground mb-4">The requested document could not be found.</p>
                    <Button onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Supplier
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Supplier
                            </Button>
                            <div className="flex items-center gap-3">
                                {getFileIcon()}
                                <div>
                                    <h1 className="text-xl font-semibold">{document.title}</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {document.category} • {new Date(document.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline">
                                Supplier Document
                            </Badge>
                            <Button onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Content */}
            <div className="container mx-auto py-6">
                <Card>
                    <CardContent className="p-0">
                        {renderPreview()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
