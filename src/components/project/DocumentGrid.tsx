import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { documentActionsService } from '@/services/documentActions';
import type { ProjectDocument } from '@/hooks/useDocuments';

interface DocumentGridProps {
    documents: ProjectDocument[];
    selectedDocuments: string[];
    onSelectDocument: (documentId: string) => void;
    onSelectAll: () => void;
    onDocumentClick?: (document: ProjectDocument) => void;
    onDocumentEdit?: (document: ProjectDocument) => void;
    onDocumentDelete?: (document: ProjectDocument) => void;
}

/**
 * Grid view component for displaying documents with thumbnails and metadata
 * TODO: Implement thumbnail generation and full document actions
 */
export const DocumentGrid: React.FC<DocumentGridProps> = ({
    documents,
    selectedDocuments,
    onSelectDocument,
    onSelectAll,
    onDocumentClick,
    onDocumentEdit,
    onDocumentDelete
}) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getDocumentTypeColor = (type: string): string => {
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

    return (
        <div className="space-y-4">
            {/* Select all header */}
            <div className="flex items-center gap-2">
                <Checkbox
                    checked={selectedDocuments.length === documents.length && documents.length > 0}
                    onCheckedChange={onSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                    Select all documents
                </span>
            </div>

            {/* Document grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {documents.map((document) => (
                    <Card key={document.id} className="group hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            {/* Selection checkbox */}
                            <div className="flex items-start justify-between mb-3">
                                <Checkbox
                                    checked={selectedDocuments.includes(document.id)}
                                    onCheckedChange={() => onSelectDocument(document.id)}
                                />
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDocumentClick && onDocumentClick(document)}
                                        title="Preview"
                                    >
                                        <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Download"
                                        onClick={async () => {
                                            try {
                                                await documentActionsService.downloadDocument(document);
                                            } catch (error) {
                                                console.error('Download failed:', error);
                                            }
                                        }}
                                    >
                                        <Download className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Edit"
                                        onClick={() => onDocumentEdit && onDocumentEdit(document)}
                                    >
                                        <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Delete"
                                        onClick={() => onDocumentDelete && onDocumentDelete(document)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            {/* Document thumbnail/icon */}
                            <div className="flex items-center justify-center h-24 bg-muted rounded-lg mb-3">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>

                            {/* Document info */}
                            <div className="space-y-2">
                                <h4
                                    className="font-medium text-sm truncate cursor-pointer hover:text-primary"
                                    title={document.title}
                                    onClick={() => onDocumentClick && onDocumentClick(document)}
                                >
                                    {document.title}
                                </h4>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs ${getDocumentTypeColor(document.category)}`}
                                    >
                                        {document.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {document.access_level}
                                    </Badge>
                                </div>

                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>{formatFileSize(document.file_size)}</div>
                                    <div>{format(new Date(document.created_at), 'MMM d, yyyy')}</div>
                                </div>

                                {/* Tags */}
                                {document.metadata?.tags && document.metadata.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {document.metadata.tags.slice(0, 2).map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {document.metadata.tags.length > 2 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{document.metadata.tags.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};