// Document Link Modal
// Modal for adding document links from Google Drive or other sources

import React, { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Link,
    Cloud,
    Globe,
    FileText,
    Folder,
    ExternalLink,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Plus
} from 'lucide-react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useDocuments } from '@/hooks/useDocuments';
import { validateDocumentLink } from '@/lib/googleDriveUtils';
import { toast } from 'sonner';
import type { DocumentLinkData, GoogleDriveFile } from '@/types/googleDrive';

interface DocumentLinkModalProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface LinkFormData {
    title: string;
    description: string;
    external_url: string;
    document_type: string;
    access_level: string;
    tags: string[];
}

const DOCUMENT_TYPES = [
    { value: 'drawing', label: 'Drawing' },
    { value: 'specification', label: 'Specification' },
    { value: 'quote', label: 'Quote' },
    { value: 'po', label: 'Purchase Order' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'report', label: 'Report' },
    { value: 'bom', label: 'Bill of Materials' },
    { value: 'other', label: 'Other' },
];

const ACCESS_LEVELS = [
    { value: 'public', label: 'Public' },
    { value: 'internal', label: 'Internal Only' },
    { value: 'confidential', label: 'Confidential' },
    { value: 'restricted', label: 'Restricted' },
];

export const DocumentLinkModal: React.FC<DocumentLinkModalProps> = ({
    projectId,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { addDocumentLink } = useDocuments(projectId);
    const {
        isAuthenticated,
        listFiles,
        urlToDocumentLink,
        authenticate
    } = useGoogleDrive();

    const [activeTab, setActiveTab] = useState<'url' | 'browse'>('url');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean;
        errors: string[];
        linkData?: DocumentLinkData;
    } | null>(null);

    // Form data
    const [formData, setFormData] = useState<LinkFormData>({
        title: '',
        description: '',
        external_url: '',
        document_type: 'other',
        access_level: 'internal',
        tags: [],
    });

    // Google Drive browse state
    const [searchQuery, setSearchQuery] = useState('');
    const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setFormData({
                title: '',
                description: '',
                external_url: '',
                document_type: 'other',
                access_level: 'internal',
                tags: [],
            });
            setValidationResult(null);
            setSelectedFile(null);
            setDriveFiles([]);
            setSearchQuery('');
        }
    }, [isOpen]);

    // Validate URL and fetch metadata
    const validateUrl = useCallback(async (url: string) => {
        if (!url.trim()) {
            setValidationResult(null);
            return;
        }

        setIsValidating(true);
        setValidationResult(null);

        try {
            // Basic URL validation
            const validation = validateDocumentLink({
                title: formData.title || 'Untitled',
                external_url: url,
                storage_provider: 'google_drive',
            });

            if (!validation.isValid) {
                setValidationResult({
                    isValid: false,
                    errors: validation.errors,
                });
                return;
            }

            // Try to fetch metadata from Google Drive
            if (isAuthenticated) {
                try {
                    const linkData = await urlToDocumentLink(url);
                    if (linkData) {
                        setValidationResult({
                            isValid: true,
                            errors: [],
                            linkData,
                        });

                        // Auto-fill form with fetched data
                        setFormData(prev => ({
                            ...prev,
                            title: linkData.title,
                            description: linkData.description || '',
                            document_type: linkData.document_type || 'other',
                            access_level: linkData.access_level || 'internal',
                            tags: linkData.tags || [],
                        }));
                        return;
                    }
                } catch (error) {
                    console.error('Failed to fetch Google Drive metadata:', error);
                }
            }

            // Fallback to basic validation
            setValidationResult({
                isValid: true,
                errors: [],
                linkData: {
                    title: formData.title || 'Untitled',
                    description: formData.description,
                    external_url: url,
                    link_type: 'file',
                    document_type: formData.document_type,
                    access_level: formData.access_level,
                    tags: formData.tags,
                    storage_provider: 'google_drive',
                },
            });
        } catch (error) {
            console.error('URL validation error:', error);
            setValidationResult({
                isValid: false,
                errors: ['Failed to validate URL'],
            });
        } finally {
            setIsValidating(false);
        }
    }, [formData.title, formData.description, formData.document_type, formData.access_level, formData.tags, isAuthenticated, urlToDocumentLink]);

    // Search Google Drive files
    const searchDriveFiles = useCallback(async (query: string) => {
        if (!isAuthenticated) return;

        setIsLoadingFiles(true);
        try {
            const response = await listFiles(query, undefined, 20);
            setDriveFiles(response.files);
        } catch (error) {
            console.error('Failed to search Google Drive files:', error);
            toast.error('Failed to search Google Drive files');
        } finally {
            setIsLoadingFiles(false);
        }
    }, [isAuthenticated, listFiles]);

    // Handle URL input change
    const handleUrlChange = (url: string) => {
        setFormData(prev => ({ ...prev, external_url: url }));
        validateUrl(url);
    };

    // Handle file selection from Google Drive
    const handleFileSelect = (file: GoogleDriveFile) => {
        setSelectedFile(file);
        setFormData(prev => ({
            ...prev,
            title: file.name,
            external_url: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
            document_type: getFileTypeFromMimeType(file.mimeType),
        }));
    };

    // Get file type from MIME type
    const getFileTypeFromMimeType = (mimeType: string): string => {
        const typeMap: Record<string, string> = {
            'application/pdf': 'specification',
            'application/vnd.google-apps.document': 'specification',
            'application/vnd.google-apps.spreadsheet': 'bom',
            'application/vnd.google-apps.presentation': 'report',
            'image/jpeg': 'drawing',
            'image/png': 'drawing',
            'image/gif': 'drawing',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'specification',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'bom',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'report',
        };
        return typeMap[mimeType] || 'other';
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validationResult?.isValid) {
            toast.error('Please fix validation errors before submitting');
            return;
        }

        setIsLoading(true);
        try {
            const linkData: DocumentLinkData = {
                title: formData.title,
                description: formData.description,
                external_url: formData.external_url,
                external_id: validationResult.linkData?.external_id,
                link_type: validationResult.linkData?.link_type || 'file',
                link_permissions: validationResult.linkData?.link_permissions,
                document_type: formData.document_type,
                access_level: formData.access_level,
                tags: formData.tags,
                storage_provider: 'google_drive',
            };

            await addDocumentLink(linkData);
            toast.success('Document link added successfully');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to add document link:', error);
            toast.error('Failed to add document link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Document Link"
            description="Add a link to a document from Google Drive or other sources"
            size="lg"
        >
            <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'url' | 'browse')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Enter URL
                        </TabsTrigger>
                        <TabsTrigger value="browse" className="flex items-center gap-2">
                            <Cloud className="h-4 w-4" />
                            Browse Drive
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="url" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">Document URL</Label>
                            <Input
                                id="url"
                                placeholder="https://drive.google.com/file/d/..."
                                value={formData.external_url}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                className="font-mono text-sm"
                            />
                            {isValidating && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Validating URL...
                                </div>
                            )}
                        </div>

                        {validationResult && (
                            <div className={`rounded-md p-3 ${validationResult.isValid
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-red-50 border border-red-200'
                                }`}>
                                <div className="flex items-center gap-2">
                                    {validationResult.isValid ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {validationResult.isValid ? 'URL Valid' : 'Validation Errors'}
                                    </span>
                                </div>
                                {validationResult.errors.length > 0 && (
                                    <ul className="mt-2 text-sm text-red-600 space-y-1">
                                        {validationResult.errors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="browse" className="space-y-4">
                        {!isAuthenticated ? (
                            <div className="text-center py-8">
                                <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">Connect Google Drive</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Connect your Google Drive account to browse and select files
                                </p>
                                <Button onClick={authenticate}>
                                    <Cloud className="h-4 w-4 mr-2" />
                                    Connect Google Drive
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search Files</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="search"
                                            placeholder="Search for files..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => searchDriveFiles(searchQuery)}
                                            disabled={isLoadingFiles}
                                        >
                                            {isLoadingFiles ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Search className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {driveFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Select a file:</Label>
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {driveFiles.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedFile?.id === file.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/50'
                                                        }`}
                                                    onClick={() => handleFileSelect(file)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {file.mimeType} • {file.size ? `${(parseInt(file.size) / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                                                            </p>
                                                        </div>
                                                        {selectedFile?.id === file.id && (
                                                            <CheckCircle className="h-4 w-4 text-primary" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <Separator />

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Document title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="document_type">Document Type</Label>
                            <Select
                                value={formData.document_type}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Optional description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="access_level">Access Level</Label>
                            <Select
                                value={formData.access_level}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, access_level: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACCESS_LEVELS.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="gap-1">
                                        {tag}
                                        <button
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                tags: prev.tags.filter((_, i) => i !== index)
                                            }))}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const newTag = prompt('Enter tag name:');
                                        if (newTag && !formData.tags.includes(newTag)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                tags: [...prev.tags, newTag]
                                            }));
                                        }
                                    }}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !validationResult?.isValid}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Link className="h-4 w-4 mr-2" />
                        )}
                        Add Document Link
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
