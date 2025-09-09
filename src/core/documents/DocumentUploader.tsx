import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Upload,
    X,
    File,
    Image,
    FileText,
    Archive,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useDocumentManagement } from './useDocument';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
    projectId: string;
    onUploadSuccess?: (document: any) => void;
    onUploadError?: (error: string) => void;
    onClose?: () => void;
    className?: string;
    maxFileSize?: number; // in MB
    allowedTypes?: string[];
    showMetadata?: boolean;
}

interface UploadFile extends File {
    id: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
    preview?: string;
}

export function DocumentUploader({
    projectId,
    onUploadSuccess,
    onUploadError,
    onClose,
    className,
    maxFileSize = 50, // 50MB default
    allowedTypes = ['*'],
    showMetadata = true
}: DocumentUploaderProps) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [metadata, setMetadata] = useState({
        category: 'general',
        accessLevel: 'private',
        tags: '',
        description: ''
    });
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { createDocument, loading } = useDocumentManagement();

    const getFileIcon = (file: File) => {
        const type = file.type.toLowerCase();

        if (type.startsWith('image/')) {
            return <Image className="h-8 w-8 text-blue-500" />;
        } else if (type.includes('pdf') || type.includes('document')) {
            return <FileText className="h-8 w-8 text-red-500" />;
        } else if (type.includes('zip') || type.includes('rar') || type.includes('archive')) {
            return <Archive className="h-8 w-8 text-yellow-500" />;
        } else {
            return <File className="h-8 w-8 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file: File): string | null => {
        // Check file size
        const maxSizeBytes = maxFileSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File size exceeds ${maxFileSize}MB limit`;
        }

        // Check file type
        if (allowedTypes[0] !== '*' && !allowedTypes.includes(file.type)) {
            return `File type ${file.type} is not allowed`;
        }

        return null;
    };

    const addFiles = useCallback((fileList: FileList | null) => {
        if (!fileList) return;

        const newFiles: UploadFile[] = [];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const validationError = validateFile(file);

            const uploadFile: UploadFile = Object.assign(file, {
                id: `${Date.now()}-${i}`,
                status: validationError ? 'error' : 'pending',
                progress: 0,
                error: validationError || undefined
            });

            newFiles.push(uploadFile);
        }

        setFiles(prev => [...prev, ...newFiles]);
    }, [maxFileSize, allowedTypes]);

    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(e.target.files);
        // Reset input value to allow re-selecting the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [addFiles]);

    const uploadFile = useCallback(async (uploadFile: UploadFile) => {
        // Update status to uploading
        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id
                ? { ...f, status: 'uploading', progress: 0 }
                : f
        ));

        try {
            // Prepare metadata
            const fileMetadata = showMetadata ? {
                category: metadata.category,
                accessLevel: metadata.accessLevel,
                tags: metadata.tags ? metadata.tags.split(',').map(tag => tag.trim()) : [],
                description: metadata.description
            } : undefined;

            const document = await createDocument(uploadFile, fileMetadata);

            if (document) {
                // Update status to success
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'success', progress: 100 }
                        : f
                ));

                onUploadSuccess?.(document);
            } else {
                throw new Error('Failed to create document');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';

            // Update status to error
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                    ? { ...f, status: 'error', error: errorMessage, progress: 0 }
                    : f
            ));

            onUploadError?.(errorMessage);
        }
    }, [createDocument, metadata, showMetadata, onUploadSuccess, onUploadError]);

    const uploadAllFiles = useCallback(async () => {
        const pendingFiles = files.filter(f => f.status === 'pending');

        for (const file of pendingFiles) {
            await uploadFile(file);
        }
    }, [files, uploadFile]);

    const clearCompleted = useCallback(() => {
        setFiles(prev => prev.filter(f => f.status !== 'success'));
    }, []);

    const clearAll = useCallback(() => {
        setFiles([]);
    }, []);

    const hasPendingFiles = files.some(f => f.status === 'pending');
    const hasCompletedFiles = files.some(f => f.status === 'success');
    const hasErrorFiles = files.some(f => f.status === 'error');

    return (
        <div className={cn("space-y-6", className)}>
            {/* Upload Zone */}
            <Card>
                <CardContent className="p-6">
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                            isDragOver
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <div className="space-y-2">
                            <p className="text-lg font-medium">
                                Drop files here or{' '}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    browse
                                </button>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Maximum file size: {maxFileSize}MB
                                {allowedTypes[0] !== '*' && (
                                    <span> • Allowed types: {allowedTypes.join(', ')}</span>
                                )}
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileSelect}
                            accept={allowedTypes[0] === '*' ? undefined : allowedTypes.join(',')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Metadata Form */}
            {showMetadata && files.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">Document Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={metadata.category}
                                    onValueChange={(value) => setMetadata(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="legal">Legal</SelectItem>
                                        <SelectItem value="financial">Financial</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="rfq">RFQ</SelectItem>
                                        <SelectItem value="quotation">Quotation</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accessLevel">Access Level</Label>
                                <Select
                                    value={metadata.accessLevel}
                                    onValueChange={(value) => setMetadata(prev => ({ ...prev, accessLevel: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="internal">Internal</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="restricted">Restricted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    placeholder="Enter tags separated by commas"
                                    value={metadata.tags}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter a description for the documents"
                                    value={metadata.description}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* File List */}
            {files.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">
                                Files ({files.length})
                            </h3>
                            <div className="flex items-center space-x-2">
                                {hasCompletedFiles && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearCompleted}
                                    >
                                        Clear Completed
                                    </Button>
                                )}
                                {files.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAll}
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className={cn(
                                        "flex items-center space-x-3 p-3 rounded-lg border",
                                        file.status === 'success' && "bg-green-50 border-green-200",
                                        file.status === 'error' && "bg-red-50 border-red-200",
                                        file.status === 'uploading' && "bg-blue-50 border-blue-200"
                                    )}
                                >
                                    {getFileIcon(file)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium truncate">
                                                {file.name}
                                            </p>
                                            <Badge variant="outline" className="text-xs">
                                                {formatFileSize(file.size)}
                                            </Badge>
                                            {file.status === 'success' && (
                                                <Badge className="bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Uploaded
                                                </Badge>
                                            )}
                                            {file.status === 'error' && (
                                                <Badge variant="destructive">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Error
                                                </Badge>
                                            )}
                                            {file.status === 'uploading' && (
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                    Uploading
                                                </Badge>
                                            )}
                                        </div>

                                        {file.status === 'uploading' && (
                                            <Progress value={file.progress} className="mt-2" />
                                        )}

                                        {file.error && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {file.error}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(file.id)}
                                        disabled={file.status === 'uploading'}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-3 mt-6">
                            {onClose && (
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                            )}

                            {hasPendingFiles && (
                                <Button
                                    onClick={uploadAllFiles}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload {files.filter(f => f.status === 'pending').length} Files
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/**
 * Compact version of DocumentUploader for inline use
 */
export function DocumentUploaderCompact({
    projectId,
    onUploadSuccess,
    className
}: Omit<DocumentUploaderProps, 'showMetadata' | 'onClose'>) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isExpanded) {
        return (
            <Button
                variant="outline"
                className={className}
                onClick={() => setIsExpanded(true)}
            >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
            </Button>
        );
    }

    return (
        <div className={className}>
            <DocumentUploader
                projectId={projectId}
                onUploadSuccess={(document) => {
                    onUploadSuccess?.(document);
                    setIsExpanded(false);
                }}
                onClose={() => setIsExpanded(false)}
                showMetadata={false}
            />
        </div>
    );
}
