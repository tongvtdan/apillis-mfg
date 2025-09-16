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

// Supplier-specific document types
const SUPPLIER_DOCUMENT_TYPES = [
    { value: 'certificate', label: 'Certificate/Compliance' },
    { value: 'qualification', label: 'Qualification Document' },
    { value: 'contract', label: 'Contract/Agreement' },
    { value: 'insurance', label: 'Insurance Document' },
    { value: 'compliance', label: 'Compliance Document' },
    { value: 'financial', label: 'Financial Document' },
    { value: 'technical', label: 'Technical Specification' },
    { value: 'quality', label: 'Quality Manual' },
    { value: 'safety', label: 'Safety Document' },
    { value: 'environmental', label: 'Environmental Document' },
    { value: 'audit', label: 'Audit Report' },
    { value: 'license', label: 'License/Permit' },
    { value: 'warranty', label: 'Warranty Document' },
    { value: 'supplier_nda', label: 'Non-Disclosure Agreement' },
    { value: 'supplier_profile', label: 'Company Profile' },
    { value: 'product_catalog', label: 'Product Catalog' },
    { value: 'sustainability_report', label: 'Sustainability Report' },
    { value: 'other', label: 'Other Document' }
];

const ACCESS_LEVELS = [
    { value: 'public', label: 'Public' },
    { value: 'internal', label: 'Internal Only' },
    { value: 'confidential', label: 'Confidential' }
];

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
    metadata: {
        document_type: string;
        access_level: string;
        tags: string[];
        description?: string;
    };
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

    // Default metadata for new files
    const [defaultMetadata, setDefaultMetadata] = useState({
        document_type: 'certificate',
        access_level: 'internal',
        tags: []
    });

    const getFileIcon = (file: File) => {
        const type = file.type?.toLowerCase() || '';

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
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file: File): string | null => {
        console.log('🔍 Validating file:', { 
            name: file.name, 
            size: file.size, 
            type: file.type,
            lastModified: file.lastModified 
        });

        // Check if file is valid
        if (!file || !file.name) {
            console.log('❌ Invalid file: missing name');
            return 'Invalid file';
        }

        // Check if file size is valid
        if (file.size === 0) {
            console.log('❌ Invalid file: zero size');
            return 'File appears to be empty (0 bytes)';
        }

        // Check file size limit
        const maxSizeBytes = maxFileSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            console.log('❌ File too large:', file.size, 'bytes');
            return `File size exceeds ${maxFileSize}MB limit`;
        }

        // Check file type (only if file.type exists and allowedTypes is not wildcard)
        if (file.type && allowedTypes[0] !== '*' && !allowedTypes.includes(file.type)) {
            console.log('❌ File type not allowed:', file.type);
            return `File type ${file.type} is not allowed`;
        }

        console.log('✅ File validation passed');
        return null;
    };

    const addFiles = useCallback((newFiles: File[]) => {
        const validFiles: UploadFile[] = [];

        console.log('📁 Adding files:', newFiles.length);

        newFiles.forEach(file => {
            console.log('📄 Processing file:', { name: file.name, type: file.type, size: file.size });

            const error = validateFile(file);
            if (error) {
                console.log('❌ File validation error:', error);
                // Add file with error status
                validFiles.push({
                    ...file,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'error',
                    progress: 0,
                    error,
                    metadata: {
                        document_type: defaultMetadata.document_type,
                        access_level: defaultMetadata.access_level,
                        tags: defaultMetadata.tags,
                        description: ''
                    }
                });
            } else {
                console.log('✅ File validation passed');
                validFiles.push({
                    ...file,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'pending',
                    progress: 0,
                    metadata: {
                        document_type: defaultMetadata.document_type,
                        access_level: defaultMetadata.access_level,
                        tags: defaultMetadata.tags,
                        description: ''
                    }
                });
            }
        });

        setFiles(prev => [...prev, ...validFiles]);
    }, [maxFileSize, allowedTypes, defaultMetadata]);

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
        console.log('📁 File input changed:', selectedFiles.length, 'files');
        selectedFiles.forEach((file, index) => {
            console.log(`📄 File ${index + 1}:`, {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });
        });
        addFiles(selectedFiles);
    };

    const updateFileMetadata = useCallback((fileId: string, updates: Partial<UploadFile['metadata']>) => {
        setFiles(prev => prev.map(file =>
            file.id === fileId
                ? { ...file, metadata: { ...file.metadata, ...updates } }
                : file
        ));
    }, []);

    const uploadFile = useCallback(async (uploadFile: UploadFile) => {
        console.log('📤 Starting upload for file:', {
            id: uploadFile.id,
            name: uploadFile.name,
            size: uploadFile.size,
            type: uploadFile.type,
            metadata: uploadFile.metadata
        });

        // Update status to uploading
        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id
                ? { ...f, status: 'uploading', progress: 0 }
                : f
        ));

        try {
            // Validate file before upload
            if (!uploadFile.name || uploadFile.size === 0) {
                throw new Error('Invalid file: missing name or empty file');
            }

            const success = await uploadDocument(
                uploadFile,
                uploadFile.metadata.document_type,
                uploadFile.name,
                uploadFile.metadata.description
            );

            if (success) {
                console.log('✅ Upload successful for:', uploadFile.name);
                // Update status to success
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'success', progress: 100 }
                        : f
                ));

                onUploadSuccess?.(uploadFile);
            } else {
                throw new Error('Upload function returned false');
            }
        } catch (error) {
            console.error('❌ Upload error for file:', uploadFile.name, error);
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';

            // Update status to error
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                    ? { ...f, status: 'error', error: errorMessage, progress: 0 }
                    : f
            ));

            onUploadError?.(errorMessage);
        }
    }, [uploadDocument, onUploadSuccess, onUploadError]);

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

    const pendingFiles = files.filter(f => f.status === 'pending');
    const completedFiles = files.filter(f => f.status === 'success');
    const errorFiles = files.filter(f => f.status === 'error');

    return (
        <div className={cn("space-y-6", className)}>
            {/* Default metadata settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Default Document Type</Label>
                    <Select
                        value={defaultMetadata.document_type}
                        onValueChange={(value) => setDefaultMetadata(prev => ({ ...prev, document_type: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SUPPLIER_DOCUMENT_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Default Access Level</Label>
                    <Select
                        value={defaultMetadata.access_level}
                        onValueChange={(value) => setDefaultMetadata(prev => ({ ...prev, access_level: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ACCESS_LEVELS.map(level => (
                                <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Default Tags (comma-separated)</Label>
                    <Input
                        placeholder="e.g. ISO 9001, Quality"
                        value={defaultMetadata.tags?.join(', ') || ''}
                        onChange={(e) => {
                            const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                            setDefaultMetadata(prev => ({ ...prev, tags }));
                        }}
                    />
                </div>
            </div>

            {/* Drag and drop zone */}
            <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
                <p className="text-muted-foreground mb-4">
                    Support for PDF, DOC, DOCX, XLS, XLSX, DWG, CAD files, and images
                    <br />
                    Maximum file size: {maxFileSize}MB per file
                </p>
                <div className="flex gap-2 justify-center">
                    <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Select Files
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            // Create a test file to debug
                            const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
                            console.log('🧪 Test file created:', {
                                name: testFile.name,
                                size: testFile.size,
                                type: testFile.type
                            });
                            addFiles([testFile]);
                        }}
                    >
                        Test Upload
                    </Button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.step,.stp,.iges,.igs,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.txt,.csv"
                />
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                            Files to Upload ({files.length})
                        </h4>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                            {completedFiles.length > 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {completedFiles.length} completed
                                </Badge>
                            )}
                            {errorFiles.length > 0 && (
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    {errorFiles.length} failed
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-3">
                        {files.map((fileItem) => (
                            <div key={fileItem.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-medium truncate">{fileItem.name}</h5>
                                                {fileItem.status === 'success' && (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                )}
                                                {fileItem.status === 'error' && (
                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {formatFileSize(fileItem.size)} • {fileItem.type || 'Unknown type'}
                                            </p>
                                            {fileItem.error && (
                                                <p className="text-sm text-red-600 mt-1">{fileItem.error}</p>
                                            )}
                                        </div>
                                    </div>

                                    {fileItem.status === 'pending' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(fileItem.id)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Progress bar */}
                                {(fileItem.status === 'uploading' || fileItem.status === 'success') && (
                                    <Progress value={fileItem.progress} className="h-2" />
                                )}

                                {/* File metadata */}
                                {fileItem.status === 'pending' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Select
                                            value={fileItem.metadata.document_type}
                                            onValueChange={(value) => updateFileMetadata(fileItem.id, { document_type: value })}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SUPPLIER_DOCUMENT_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={fileItem.metadata.access_level}
                                            onValueChange={(value) => updateFileMetadata(fileItem.id, { access_level: value })}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ACCESS_LEVELS.map(level => (
                                                    <SelectItem key={level.value} value={level.value}>
                                                        {level.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            placeholder="Tags (comma-separated)"
                                            value={fileItem.metadata.tags?.join(', ') || ''}
                                            onChange={(e) => {
                                                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                                                updateFileMetadata(fileItem.id, { tags });
                                            }}
                                            className="h-8"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                    {files.length > 0 && (
                        <>
                            Total size: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                        </>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={uploadAllFiles}
                        disabled={files.length === 0 || loading || pendingFiles.length === 0}
                    >
                        {loading ? (
                            <>
                                <Upload className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload All ({pendingFiles.length})
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
