import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    History,
    Download,
    Eye,
    FileText,
    Image,
    File,
    Star,
    StarOff,
    GitCompare,
    ArrowRight,
    Calendar,
    User,
    Tag,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useDocumentVersions, useDocumentFiles } from './useDocument';
import { useDocumentPreview } from './useDocument';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ProjectDocument } from '@/types/project';

interface DocumentVersionViewerProps {
    document: ProjectDocument;
    isOpen: boolean;
    onClose: () => void;
    onVersionChange?: (newVersion: any) => void;
    className?: string;
}

interface VersionComparison {
    version_a: any;
    version_b: any;
    differences: {
        file_size_change: number;
        file_size_change_percent: number;
        title_changed: boolean;
        description_changed: boolean;
        metadata_changes: string[];
    };
    can_compare_content: boolean;
}

export function DocumentVersionViewer({
    document,
    isOpen,
    onClose,
    onVersionChange,
    className
}: DocumentVersionViewerProps) {
    const [versions, setVersions] = useState<any[]>([]);
    const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
    const [comparison, setComparison] = useState<VersionComparison | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('versions');

    const { getVersions, setCurrentVersion } = useDocumentVersions();
    const { downloadDocument, canPreview } = useDocumentFiles();

    const loadVersions = useCallback(async () => {
        if (!document?.id) return;

        try {
            setLoading(true);
            const versionData = await getVersions(document.id);
            setVersions(versionData || []);
        } catch (error) {
            console.error('Error loading versions:', error);
        } finally {
            setLoading(false);
        }
    }, [document?.id, getVersions]);

    useEffect(() => {
        if (isOpen && document) {
            loadVersions();
        }
    }, [isOpen, document, loadVersions]);

    const handleSetCurrentVersion = useCallback(async (versionId: string) => {
        try {
            setLoading(true);
            const success = await setCurrentVersion(document.id, versionId);

            if (success) {
                await loadVersions(); // Refresh the versions list
                onVersionChange?.(versions.find(v => v.id === versionId));
            }
        } catch (error) {
            console.error('Error setting current version:', error);
        } finally {
            setLoading(false);
        }
    }, [document.id, setCurrentVersion, loadVersions, onVersionChange, versions]);

    const handleDownloadVersion = useCallback(async (version: any) => {
        try {
            // Create a temporary signed URL for the specific version
            // This would need to be implemented in the version service
            console.log('Downloading version:', version.id);
        } catch (error) {
            console.error('Error downloading version:', error);
        }
    }, []);

    const handleCompareVersions = useCallback(async () => {
        if (selectedVersions.length !== 2) return;

        try {
            setLoading(true);
            // This would need to be implemented in the version service
            const comparisonResult: VersionComparison = {
                version_a: versions.find(v => v.id === selectedVersions[0]),
                version_b: versions.find(v => v.id === selectedVersions[1]),
                differences: {
                    file_size_change: 0,
                    file_size_change_percent: 0,
                    title_changed: false,
                    description_changed: false,
                    metadata_changes: []
                },
                can_compare_content: false
            };

            setComparison(comparisonResult);
            setActiveTab('comparison');
        } catch (error) {
            console.error('Error comparing versions:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedVersions, versions]);

    const toggleVersionSelection = useCallback((versionId: string) => {
        setSelectedVersions(prev => {
            if (prev.includes(versionId)) {
                return prev.filter(id => id !== versionId);
            } else if (prev.length < 2) {
                return [...prev, versionId];
            }
            return prev;
        });
    }, []);

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2) || '??';
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return 'Unknown';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType?: string) => {
        const type = fileType?.toLowerCase() || '';

        if (type.startsWith('image/')) {
            return <Image className="h-5 w-5 text-blue-500" />;
        } else if (type.includes('pdf')) {
            return <FileText className="h-5 w-5 text-red-500" />;
        } else {
            return <File className="h-5 w-5 text-gray-500" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className={cn("w-full max-w-6xl max-h-[90vh] flex flex-col", className)}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <History className="h-6 w-6" />
                            <div>
                                <CardTitle className="text-xl">
                                    Version History
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {document.title || document.file_name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {selectedVersions.length === 2 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCompareVersions}
                                    disabled={loading}
                                >
                                    <GitCompare className="h-4 w-4 mr-2" />
                                    Compare
                                </Button>
                            )}

                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
                            <TabsTrigger value="comparison" disabled={!comparison}>
                                Comparison
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="versions" className="space-y-4 mt-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                    <span>Loading versions...</span>
                                </div>
                            ) : versions.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Versions Found</h3>
                                    <p className="text-muted-foreground">
                                        This document doesn't have any version history.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {versions.map((version, index) => (
                                        <Card key={version.id} className={cn(
                                            "p-4",
                                            version.is_current && "border-primary bg-primary/5"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    {/* Version Selection */}
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedVersions.includes(version.id)}
                                                        onChange={() => toggleVersionSelection(version.id)}
                                                        className="rounded"
                                                        disabled={selectedVersions.length >= 2 && !selectedVersions.includes(version.id)}
                                                    />

                                                    {/* Version Info */}
                                                    <div className="flex items-center space-x-3">
                                                        {getFileIcon(version.mime_type)}

                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-medium">
                                                                    Version {version.version_number}
                                                                </span>
                                                                {version.is_current && (
                                                                    <Badge className="bg-green-100 text-green-800">
                                                                        <Star className="h-3 w-3 mr-1" />
                                                                        Current
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>
                                                                    {format(new Date(version.uploaded_at), 'MMM d, yyyy HH:mm')}
                                                                </span>
                                                                <User className="h-3 w-3" />
                                                                <span>
                                                                    {version.uploader_name || 'Unknown'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadVersion(version)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>

                                                    {!version.is_current && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleSetCurrentVersion(version.id)}
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <StarOff className="h-4 w-4 mr-2" />
                                                            )}
                                                            Set as Current
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Version Details */}
                                            <div className="mt-3 pt-3 border-t">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">File Size:</span>
                                                        <p className="font-medium">{formatFileSize(version.file_size)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Type:</span>
                                                        <p className="font-medium">{version.mime_type || 'Unknown'}</p>
                                                    </div>
                                                    {version.change_summary && (
                                                        <div className="md:col-span-2">
                                                            <span className="text-muted-foreground">Changes:</span>
                                                            <p className="font-medium">{version.change_summary}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="comparison" className="space-y-4 mt-4">
                            {comparison ? (
                                <div className="space-y-4">
                                    {/* Comparison Header */}
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">Version Comparison</h3>
                                        <Badge variant="outline">
                                            {selectedVersions.length} versions selected
                                        </Badge>
                                    </div>

                                    {/* Comparison Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Version A */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">
                                                    Version {comparison.version_a.version_number}
                                                    {comparison.version_a.is_current && (
                                                        <Badge className="ml-2">Current</Badge>
                                                    )}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    {getFileIcon(comparison.version_a.mime_type)}
                                                    <span className="text-sm">
                                                        {formatFileSize(comparison.version_a.file_size)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(comparison.version_a.uploaded_at), 'MMM d, yyyy HH:mm')}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Version B */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">
                                                    Version {comparison.version_b.version_number}
                                                    {comparison.version_b.is_current && (
                                                        <Badge className="ml-2">Current</Badge>
                                                    )}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    {getFileIcon(comparison.version_b.mime_type)}
                                                    <span className="text-sm">
                                                        {formatFileSize(comparison.version_b.file_size)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(comparison.version_b.uploaded_at), 'MMM d, yyyy HH:mm')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Differences */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Changes</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {/* File Size Change */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">File Size:</span>
                                                    <Badge variant={
                                                        comparison.differences.file_size_change > 0 ? "default" :
                                                            comparison.differences.file_size_change < 0 ? "destructive" : "secondary"
                                                    }>
                                                        {comparison.differences.file_size_change > 0 ? '+' : ''}
                                                        {formatFileSize(Math.abs(comparison.differences.file_size_change))}
                                                        ({comparison.differences.file_size_change_percent > 0 ? '+' : ''}
                                                        {comparison.differences.file_size_change_percent.toFixed(1)}%)
                                                    </Badge>
                                                </div>

                                                {/* Title Changed */}
                                                {comparison.differences.title_changed && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Title:</span>
                                                        <Badge variant="outline">Changed</Badge>
                                                    </div>
                                                )}

                                                {/* Description Changed */}
                                                {comparison.differences.description_changed && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Description:</span>
                                                        <Badge variant="outline">Changed</Badge>
                                                    </div>
                                                )}

                                                {/* Metadata Changes */}
                                                {comparison.differences.metadata_changes.length > 0 && (
                                                    <div>
                                                        <span className="text-sm font-medium">Metadata Changes:</span>
                                                        <div className="mt-2 space-y-1">
                                                            {comparison.differences.metadata_changes.map((change, index) => (
                                                                <div key={index} className="text-sm bg-muted p-2 rounded">
                                                                    {change}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Content Comparison */}
                                                {!comparison.can_compare_content && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Content Comparison:</span>
                                                        <Badge variant="secondary">Not Available</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Select Versions to Compare</h3>
                                    <p className="text-muted-foreground">
                                        Select exactly 2 versions from the Versions tab to compare them.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * Compact version history component for inline use
 */
export function DocumentVersionHistoryCompact({
    documentId,
    className
}: {
    documentId: string;
    className?: string;
}) {
    const [versions, setVersions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const { getVersions } = useDocumentVersions();

    useEffect(() => {
        const loadVersions = async () => {
            if (!documentId) return;

            try {
                setLoading(true);
                const versionData = await getVersions(documentId);
                setVersions(versionData?.slice(0, 3) || []); // Show only first 3 versions
            } catch (error) {
                console.error('Error loading versions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadVersions();
    }, [documentId, getVersions]);

    if (loading) {
        return (
            <div className={cn("flex items-center space-x-2", className)}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading versions...</span>
            </div>
        );
    }

    if (versions.length === 0) {
        return (
            <div className={cn("text-center py-4", className)}>
                <History className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No versions</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            {versions.map((version) => (
                <div key={version.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                            v{version.version_number}
                        </Badge>
                        {version.is_current && (
                            <Star className="h-3 w-3 text-yellow-500" />
                        )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                        {format(new Date(version.uploaded_at), 'MMM d')}
                    </span>
                </div>
            ))}
        </div>
    );
}
