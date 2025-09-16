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
import { useSupplierDocuments } from '@/hooks/useSupplierDocuments';
import { cn } from '@/lib/utils';

interface SupplierDocumentUploaderProps {
    supplierId: string;
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
}

export function SupplierDocumentUploader({
    supplierId,
    onUploadSuccess,
    onUploadError,
    onClose,
    className,
    maxFileSize = 50, // 50MB default
    allowedTypes = ['*'],
    showMetadata = true
}: SupplierDocumentUploaderProps) {
    
    const [metadata, setMetadata] = useState({
        category: 'certificate',
        accessLevel: 'internal',
        tags: '',
        description: ''
    });
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { uploadDocument, loading } = useSupplierDocuments(supplierId);

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

    const addFiles = useCallback((newFiles: File[]) => {
        const validFiles: UploadFile[] = [];
        
        newFiles.forEach(file => {
            const error = validateFile(file);
            if (error) {
                // Add file with error status
                validFiles.push({
                    ...file,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'error',
                    progress: 0,
                    error
                });
            } else {
                validFiles.push({
                    ...file,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'pending',
                    progress: 0
                });
            }
        });

        setFiles(prev => [...prev, ...validFiles]);
    }, [maxFileSize, allowedTypes]);

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
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, [addFiles]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);
    };

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

            const success = await uploadDocument(
                uploadFile,
                metadata.category,
                metadata.description || uploadFile.name,
                metadata.description
            );

            if (success) {
                // Update status to success
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'success', progress: 100 }
                        : f
                ));

                onUploadSuccess?.(uploadFile);
            } else {
                throw new Error('Failed to upload document');
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
    }, [uploadDocument, metadata, showMetadata, onUploadSuccess, onUploadError]);

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

    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
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
                                        <SelectItem value="certificate">Certificate</SelectItem>
                                        <SelectItem value="qualification">Qualification</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="insurance">Insurance</SelectItem>
                                        <SelectItem value="compliance">Compliance</SelectItem>
                                        <SelectItem value="financial">Financial</SelectItem>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="quality">Quality</SelectItem>
                                        <SelectItem value="safety">Safety</SelectItem>
                                        <SelectItem value="environmental">Environmental</SelectItem>
                                        <SelectItem value="audit">Audit</SelectItem>
                                        <SelectItem value="license">License</SelectItem>
                                        <SelectItem value="warranty">Warranty</SelectItem>
                                        <SelectItem value="supplier_nda">Non-Disclosure Agreement</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
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
                                        <SelectItem value="confidential">Confidential</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    value={metadata.tags}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                                    placeholder="e.g., ISO 9001, Quality, Manufacturing"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={metadata.description}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter document description..."
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
                            <h3 className="text-lg font-medium">Files to Upload</h3>
                            <div className="flex gap-2">
                                {hasCompletedFiles && (
                                    <Button variant="outline" size="sm" onClick={clearCompleted}>
                                        Clear Completed
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={clearAll}>
                                    Clear All
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {files.map((file) => (
                                <div key={file.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                                    <div className="flex-shrink-0">
                                        {getFileIcon(file)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                        
                                        {file.status === 'uploading' && (
                                            <Progress value={file.progress} className="mt-2" />
                                        )}
                                        
                                        {file.status === 'error' && file.error && (
                                            <p className="text-xs text-red-500 mt-1">{file.error}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {file.status === 'pending' && (
                                            <Badge variant="secondary">Pending</Badge>
                                        )}
                                        {file.status === 'uploading' && (
                                            <Badge variant="default">
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                Uploading
                                            </Badge>
                                        )}
                                        {file.status === 'success' && (
                                            <Badge variant="default" className="bg-green-500">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Success
                                            </Badge>
                                        )}
                                        {file.status === 'error' && (
                                            <Badge variant="destructive">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Error
                                            </Badge>
                                        )}
                                        
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(file.id)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Upload Actions */}
                        <div className="flex justify-end space-x-2 mt-6">
                            {onClose && (
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                            )}
                            <Button
                                onClick={uploadAllFiles}
                                disabled={!hasPendingFiles || loading}
                                className="min-w-[120px]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload All
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
