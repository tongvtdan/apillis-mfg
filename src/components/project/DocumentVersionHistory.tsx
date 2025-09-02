import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    History,
    Download,
    Upload,
    Eye,
    RotateCcw,
    Trash2,
    FileText,
    Clock,
    User,
    AlertTriangle,
    CheckCircle,
    ArrowUpDown,
    Plus,
    Info
} from 'lucide-react';
import { format } from 'date-fns';
import { ProjectDocument } from '@/types/project';
import {
    documentVersionService,
    DocumentVersion,
    DocumentVersionHistory as VersionHistory,
    VersionComparisonResult
} from '@/services/documentVersionService';
import { toast } from 'sonner';

interface DocumentVersionHistoryProps {
    document: ProjectDocument;
    isOpen: boolean;
    onClose: () => void;
    onVersionChange?: (newVersion: DocumentVersion) => void;
}

export const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
    document,
    isOpen,
    onClose,
    onVersionChange
}) => {
    const [versionHistory, setVersionHistory] = useState<VersionHistory | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
    const [comparisonResult, setComparisonResult] = useState<VersionComparisonResult | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [changeSummary, setChangeSummary] = useState('');

    useEffect(() => {
        if (isOpen && document.id) {
            loadVersionHistory();
        }
    }, [isOpen, document.id]);

    const loadVersionHistory = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const history = await documentVersionService.getDocumentVersionHistory(document.id);
            setVersionHistory(history);
        } catch (err) {
            console.error('Error loading version history:', err);
            setError('Failed to load version history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadNewVersion = async () => {
        if (!uploadFile || !document.id) return;

        try {
            setIsLoading(true);

            const newVersion = await documentVersionService.createDocumentVersion(
                document.id,
                uploadFile,
                changeSummary || undefined
            );

            toast.success('New version uploaded successfully');

            // Refresh version history
            await loadVersionHistory();

            // Notify parent component
            if (onVersionChange) {
                onVersionChange(newVersion);
            }

            // Reset form
            setUploadFile(null);
            setChangeSummary('');
            setShowUploadModal(false);
        } catch (err) {
            console.error('Error uploading new version:', err);
            toast.error('Failed to upload new version');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetCurrentVersion = async (versionId: string) => {
        try {
            setIsLoading(true);

            const success = await documentVersionService.setCurrentVersion(versionId);

            if (success) {
                toast.success('Version set as current');
                await loadVersionHistory();

                // Find the new current version and notify parent
                const version = versionHistory?.versions.find(v => v.id === versionId);
                if (version && onVersionChange) {
                    onVersionChange(version);
                }
            } else {
                toast.error('Failed to set version as current');
            }
        } catch (err) {
            console.error('Error setting current version:', err);
            toast.error('Failed to set version as current');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteVersion = async (versionId: string) => {
        if (!confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
            return;
        }

        try {
            setIsLoading(true);

            const success = await documentVersionService.deleteDocumentVersion(versionId);

            if (success) {
                toast.success('Version deleted successfully');
                await loadVersionHistory();
            } else {
                toast.error('Failed to delete version');
            }
        } catch (err) {
            console.error('Error deleting version:', err);
            toast.error('Failed to delete version');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadVersion = async (versionId: string) => {
        try {
            const downloadUrl = await documentVersionService.getVersionDownloadUrl(versionId);

            if (downloadUrl) {
                window.open(downloadUrl, '_blank');
            } else {
                toast.error('Failed to generate download link');
            }
        } catch (err) {
            console.error('Error downloading version:', err);
            toast.error('Failed to download version');
        }
    };

    const handleCompareVersions = async () => {
        if (selectedVersions.length !== 2) {
            toast.error('Please select exactly 2 versions to compare');
            return;
        }

        try {
            setIsLoading(true);

            const result = await documentVersionService.compareVersions(
                selectedVersions[0],
                selectedVersions[1]
            );

            if (result) {
                setComparisonResult(result);
                setShowCompareModal(true);
            } else {
                toast.error('Failed to compare versions');
            }
        } catch (err) {
            console.error('Error comparing versions:', err);
            toast.error('Failed to compare versions');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVersionSelection = (versionId: string) => {
        setSelectedVersions(prev => {
            if (prev.includes(versionId)) {
                return prev.filter(id => id !== versionId);
            } else if (prev.length < 2) {
                return [...prev, versionId];
            } else {
                // Replace the first selected version
                return [prev[1], versionId];
            }
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        <span>Version History</span>
                    </div>
                }
                description={`Version history for ${document.title}`}
                maxWidth="max-w-4xl"
            >
                <div className="space-y-4">
                    {/* Header Actions */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{document.title}</span>
                            {versionHistory && (
                                <Badge variant="secondary" className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                    {versionHistory.total_versions} version{versionHistory.total_versions !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {selectedVersions.length === 2 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCompareVersions}
                                    disabled={isLoading}
                                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    <ArrowUpDown className="w-4 h-4 mr-2" />
                                    Compare
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowUploadModal(true)}
                                disabled={isLoading}
                                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Version
                            </Button>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Loading State */}
                    {isLoading && !versionHistory && (
                        <div className="flex items-center justify-center py-8 text-slate-600 dark:text-slate-400">
                            <Clock className="w-6 h-6 animate-spin mr-2" />
                            <span>Loading version history...</span>
                        </div>
                    )}

                    {/* Version List */}
                    {versionHistory && (
                        <div className="space-y-3">
                            {versionHistory.versions.map((version, index) => (
                                <Card
                                    key={version.id}
                                    className={`transition-all border-2 ${version.is_current
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                        } ${selectedVersions.includes(version.id)
                                            ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg'
                                            : ''
                                        } hover:shadow-md dark:hover:shadow-slate-900/50`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                {/* Selection Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedVersions.includes(version.id)}
                                                    onChange={() => toggleVersionSelection(version.id)}
                                                    className="mt-1 w-4 h-4 text-blue-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                                                />

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className={`font-medium ${version.is_current
                                                                ? 'text-emerald-800 dark:text-emerald-200'
                                                                : 'text-slate-900 dark:text-slate-100'
                                                            }`}>
                                                            Version {version.version_number}
                                                        </h4>
                                                        {version.is_current && (
                                                            <Badge className="text-xs bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700">
                                                                Current
                                                            </Badge>
                                                        )}
                                                        {index === 0 && !version.is_current && (
                                                            <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                                                                Latest
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                <span>{version.uploader_name || 'Unknown'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{format(new Date(version.uploaded_at), 'MMM d, yyyy h:mm a')}</span>
                                                            </div>
                                                            <div>
                                                                Size: {formatFileSize(version.file_size)}
                                                            </div>
                                                        </div>

                                                        {version.change_summary && (
                                                            <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs border border-slate-200 dark:border-slate-600">
                                                                <strong className="text-slate-700 dark:text-slate-300">Changes:</strong>
                                                                <span className="text-slate-600 dark:text-slate-400 ml-1">{version.change_summary}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownloadVersion(version.id)}
                                                    title="Download"
                                                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>

                                                {!version.is_current && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSetCurrentVersion(version.id)}
                                                        title="Set as current"
                                                        disabled={isLoading}
                                                        className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </Button>
                                                )}

                                                {versionHistory.total_versions > 1 && !version.is_current && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteVersion(version.id)}
                                                        title="Delete version"
                                                        disabled={isLoading}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {versionHistory && versionHistory.versions.length === 0 && (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No version history available</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Upload New Version Modal */}
            <Modal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                title="Upload New Version"
                description="Upload a new version of this document"
            >
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="version-file" className="text-slate-700 dark:text-slate-300">Select File</Label>
                        <input
                            id="version-file"
                            type="file"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="mt-1 block w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-600 file:text-white hover:file:bg-slate-700 dark:file:bg-slate-500 dark:hover:file:bg-slate-600"
                        />
                    </div>

                    <div>
                        <Label htmlFor="change-summary" className="text-slate-700 dark:text-slate-300">Change Summary (Optional)</Label>
                        <Textarea
                            id="change-summary"
                            placeholder="Describe what changed in this version..."
                            value={changeSummary}
                            onChange={(e) => setChangeSummary(e.target.value)}
                            rows={3}
                            className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowUploadModal(false)}
                            disabled={isLoading}
                            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUploadNewVersion}
                            disabled={!uploadFile || isLoading}
                            className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Version
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Version Comparison Modal */}
            <Modal
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                title="Version Comparison"
                description="Compare two document versions"
                maxWidth="max-w-3xl"
            >
                {comparisonResult && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-900 dark:text-slate-100">Version {comparisonResult.version_a.version_number}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                                    <div>Size: {formatFileSize(comparisonResult.version_a.file_size)}</div>
                                    <div>Date: {format(new Date(comparisonResult.version_a.uploaded_at), 'MMM d, yyyy')}</div>
                                    <div>By: {comparisonResult.version_a.uploader_name}</div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-900 dark:text-slate-100">Version {comparisonResult.version_b.version_number}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                                    <div>Size: {formatFileSize(comparisonResult.version_b.file_size)}</div>
                                    <div>Date: {format(new Date(comparisonResult.version_b.uploaded_at), 'MMM d, yyyy')}</div>
                                    <div>By: {comparisonResult.version_b.uploader_name}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <CardHeader>
                                <CardTitle className="text-sm text-slate-900 dark:text-slate-100">Differences</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                    <strong>File Size Change:</strong> {
                                        comparisonResult.differences.file_size_change > 0 ? '+' : ''
                                    }{formatFileSize(Math.abs(comparisonResult.differences.file_size_change))}
                                    ({comparisonResult.differences.file_size_change_percent > 0 ? '+' : ''}{comparisonResult.differences.file_size_change_percent}%)
                                </div>

                                {comparisonResult.differences.title_changed && (
                                    <div className="text-sm text-amber-600 dark:text-amber-400">
                                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                                        Title was changed
                                    </div>
                                )}

                                {comparisonResult.differences.description_changed && (
                                    <div className="text-sm text-amber-600 dark:text-amber-400">
                                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                                        Description was changed
                                    </div>
                                )}

                                {comparisonResult.differences.metadata_changes.length > 0 && (
                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                        <strong>Metadata Changes:</strong>
                                        <ul className="list-disc list-inside mt-1 text-xs text-slate-600 dark:text-slate-400">
                                            {comparisonResult.differences.metadata_changes.map((change, index) => (
                                                <li key={index}>{change}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {!comparisonResult.can_compare_content && (
                                    <Alert className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                        <Info className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        <AlertDescription className="text-xs text-slate-600 dark:text-slate-400">
                                            Content comparison is not available for these file types.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </Modal>
        </>
    );
};