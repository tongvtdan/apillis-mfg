import React, { useState, useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useDocuments, type DocumentMetadata } from '@/hooks/useDocuments';
import { useWorkflowStages } from '@/hooks/useWorkflowStages';
import { validateFileUploads } from '@/lib/validation/project-schemas';
import { toast } from 'sonner';

interface DocumentUploadZoneProps {
    projectId: string;
    currentStageId?: string;
    onClose: () => void;
}

interface FileWithMetadata {
    file: File;
    id: string;
    metadata: DocumentMetadata;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

const DOCUMENT_TYPES = [
    { value: 'rfq', label: 'RFQ Document', stages: ['rfq-intake', 'initial-review'] },
    { value: 'drawing', label: 'Technical Drawing', stages: ['engineering-review', 'design-development'] },
    { value: 'specification', label: 'Specification', stages: ['engineering-review', 'design-development'] },
    { value: 'quote', label: 'Quote/Proposal', stages: ['quotation', 'proposal-preparation'] },
    { value: 'contract', label: 'Contract', stages: ['contract-negotiation', 'order-confirmation'] },
    { value: 'bom', label: 'Bill of Materials', stages: ['engineering-review', 'procurement'] },
    { value: 'inspection', label: 'Inspection Report', stages: ['quality-control', 'final-inspection'] },
    { value: 'certificate', label: 'Certificate/Compliance', stages: ['quality-control', 'delivery'] },
    { value: 'other', label: 'Other', stages: [] }
];

const ACCESS_LEVELS = [
    { value: 'public', label: 'Public' },
    { value: 'internal', label: 'Internal Only' },
    { value: 'confidential', label: 'Confidential' }
];

/**
 * Document upload zone component with drag-and-drop support and progress tracking
 */
export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
    projectId,
    currentStageId,
    onClose
}) => {
    const { uploadDocument } = useDocuments(projectId);
    const { data: workflowStages } = useWorkflowStages();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [files, setFiles] = useState<FileWithMetadata[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [defaultMetadata, setDefaultMetadata] = useState<Partial<DocumentMetadata>>({
        document_type: 'other',
        access_level: 'internal',
        tags: []
    });

    // Generate unique ID for files
    const generateFileId = () => Math.random().toString(36).substr(2, 9);

    // Get suggested document types based on current stage
    const getSuggestedDocumentTypes = () => {
        if (!currentStageId || !workflowStages) return DOCUMENT_TYPES;

        const currentStage = workflowStages.find(stage => stage.id === currentStageId);
        if (!currentStage) return DOCUMENT_TYPES;

        // Get document types that are relevant for the current stage
        const suggested = DOCUMENT_TYPES.filter(docType =>
            docType.stages.length === 0 || // 'other' type
            docType.stages.some(stageName =>
                currentStage.name.toLowerCase().includes(stageName) ||
                stageName.includes(currentStage.name.toLowerCase())
            )
        );

        // If no specific suggestions, return all types
        return suggested.length > 0 ? suggested : DOCUMENT_TYPES;
    };

    const suggestedDocumentTypes = getSuggestedDocumentTypes();

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Handle file selection
    const handleFileSelection = useCallback((selectedFiles: FileList | File[]) => {
        const fileArray = Array.from(selectedFiles);

        // Validate files
        const validation = validateFileUploads(fileArray);
        if (!validation.isValid) {
            validation.errors.forEach(error => {
                toast.error('File validation failed', { description: error });
            });
            return;
        }

        // Add files to state
        const newFiles: FileWithMetadata[] = fileArray.map(file => ({
            file,
            id: generateFileId(),
            metadata: {
                document_type: defaultMetadata.document_type || 'other',
                access_level: defaultMetadata.access_level || 'internal',
                tags: [...(defaultMetadata.tags || [])],
                description: ''
            },
            progress: 0,
            status: 'pending'
        }));

        setFiles(prev => [...prev, ...newFiles]);
    }, [defaultMetadata]);

    // Drag and drop handlers
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

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFileSelection(droppedFiles);
        }
    }, [handleFileSelection]);

    // File input handler
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            handleFileSelection(selectedFiles);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleFileSelection]);

    // Remove file from list
    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    // Update file metadata
    const updateFileMetadata = useCallback((fileId: string, updates: Partial<DocumentMetadata>) => {
        setFiles(prev => prev.map(f =>
            f.id === fileId
                ? { ...f, metadata: { ...f.metadata, ...updates } }
                : f
        ));
    }, []);

    // Upload all files
    const handleUploadAll = useCallback(async () => {
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            // Upload files sequentially to avoid overwhelming the server
            for (const fileItem of files) {
                if (fileItem.status === 'completed') continue;

                // Update status to uploading
                setFiles(prev => prev.map(f =>
                    f.id === fileItem.id
                        ? { ...f, status: 'uploading', progress: 0 }
                        : f
                ));

                try {
                    // Simulate progress updates (since Supabase doesn't provide upload progress)
                    const progressInterval = setInterval(() => {
                        setFiles(prev => prev.map(f =>
                            f.id === fileItem.id && f.progress < 90
                                ? { ...f, progress: f.progress + 10 }
                                : f
                        ));
                    }, 200);

                    // Upload with timeout handling
                    const uploadPromise = uploadDocument(fileItem.file, fileItem.metadata);

                    // Add timeout to the upload promise
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Upload timeout - please try again')), 60000);
                    });

                    await Promise.race([uploadPromise, timeoutPromise]);

                    clearInterval(progressInterval);

                    // Mark as completed
                    setFiles(prev => prev.map(f =>
                        f.id === fileItem.id
                            ? { ...f, status: 'completed', progress: 100 }
                            : f
                    ));

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Upload failed';

                    setFiles(prev => prev.map(f =>
                        f.id === fileItem.id
                            ? { ...f, status: 'error', error: errorMessage }
                            : f
                    ));

                    // Show specific error message for timeouts
                    if (errorMessage.includes('timeout')) {
                        toast.error('Upload timeout', {
                            description: 'The upload is taking too long. Please try with a smaller file or check your connection.'
                        });
                    }
                }
            }

            // Check if all uploads completed successfully
            const completedCount = files.filter(f => f.status === 'completed').length;
            if (completedCount === files.length) {
                toast.success('All files uploaded successfully');
                setTimeout(() => onClose(), 1500);
            }

        } catch (error) {
            toast.error('Upload failed', {
                description: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        } finally {
            setIsUploading(false);
        }
    }, [files, uploadDocument, onClose]);

    const pendingFiles = files.filter(f => f.status === 'pending');
    const completedFiles = files.filter(f => f.status === 'completed');
    const errorFiles = files.filter(f => f.status === 'error');

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Documents
                </div>
            }
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6">
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
                                {suggestedDocumentTypes.length < DOCUMENT_TYPES.length && (
                                    <>
                                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                            Suggested for current stage
                                        </div>
                                        {suggestedDocumentTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                                            All document types
                                        </div>
                                        {DOCUMENT_TYPES.filter(type =>
                                            !suggestedDocumentTypes.some(suggested => suggested.value === type.value)
                                        ).map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                                {suggestedDocumentTypes.length === DOCUMENT_TYPES.length && (
                                    DOCUMENT_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))
                                )}
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
                            placeholder="e.g. urgent, revision-1"
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
                        Maximum file size: 50MB per file, 100MB total
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Select Files
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileInputChange}
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
                                                    <h5 className="font-medium truncate">{fileItem.file.name}</h5>
                                                    {fileItem.status === 'completed' && (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    )}
                                                    {fileItem.status === 'error' && (
                                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatFileSize(fileItem.file.size)} • {fileItem.file.type}
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
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    {(fileItem.status === 'uploading' || fileItem.status === 'completed') && (
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
                                                    {suggestedDocumentTypes.length < DOCUMENT_TYPES.length && (
                                                        <>
                                                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                                                Suggested for current stage
                                                            </div>
                                                            {suggestedDocumentTypes.map(type => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </SelectItem>
                                                            ))}
                                                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                                                                All document types
                                                            </div>
                                                            {DOCUMENT_TYPES.filter(type =>
                                                                !suggestedDocumentTypes.some(suggested => suggested.value === type.value)
                                                            ).map(type => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </SelectItem>
                                                            ))}
                                                        </>
                                                    )}
                                                    {suggestedDocumentTypes.length === DOCUMENT_TYPES.length && (
                                                        DOCUMENT_TYPES.map(type => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))
                                                    )}
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
                                Total size: {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                            </>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUploadAll}
                            disabled={files.length === 0 || isUploading || pendingFiles.length === 0}
                        >
                            {isUploading ? (
                                <>
                                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload {pendingFiles.length} Files
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};