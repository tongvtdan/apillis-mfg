import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import type { ProjectDocument } from '@/hooks/useDocuments';
import type { SortField, SortOrder } from './DocumentManager';

interface DocumentListProps {
    documents: ProjectDocument[];
    selectedDocuments: string[];
    onSelectDocument: (documentId: string) => void;
    onSelectAll: () => void;
    sortField: SortField;
    sortOrder: SortOrder;
    onSort: (field: SortField) => void;
}

/**
 * List view component for displaying documents in a table format
 * TODO: Implement full document actions and sorting functionality
 */
export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    selectedDocuments,
    onSelectDocument,
    onSelectAll,
    sortField,
    sortOrder,
    onSort
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

    const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({
        field,
        children
    }) => (
        <Button
            variant="ghost"
            className="h-auto p-0 font-medium hover:bg-transparent"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown className="w-3 h-3" />
            </div>
        </Button>
    );

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedDocuments.length === documents.length && documents.length > 0}
                                onCheckedChange={onSelectAll}
                            />
                        </TableHead>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>
                            <SortableHeader field="name">Name</SortableHeader>
                        </TableHead>
                        <TableHead>
                            <SortableHeader field="type">Type</SortableHeader>
                        </TableHead>
                        <TableHead>Access Level</TableHead>
                        <TableHead>
                            <SortableHeader field="size">Size</SortableHeader>
                        </TableHead>
                        <TableHead>
                            <SortableHeader field="date">Uploaded</SortableHeader>
                        </TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((document) => (
                        <TableRow key={document.id} className="group">
                            <TableCell>
                                <Checkbox
                                    checked={selectedDocuments.includes(document.id)}
                                    onCheckedChange={() => onSelectDocument(document.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <FileText className="w-4 h-4 text-muted-foreground" />
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium text-sm" title={doc.title}>
                                        {doc.title}
                                    </div>
                                    {doc.description && (
                                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                                            {doc.description}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${getDocumentTypeColor(doc.category)}`}
                                >
                                    {doc.category}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="text-xs">
                                    {document.access_level}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                                {formatFileSize(document.file_size)}
                            </TableCell>
                            <TableCell className="text-sm">
                                <div className="space-y-1">
                                    <div>{format(new Date(document.uploaded_at), 'MMM d, yyyy')}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(new Date(document.uploaded_at), 'h:mm a')}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {document.metadata?.tags && document.metadata.tags.length > 0 ? (
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
                                ) : (
                                    <span className="text-xs text-muted-foreground">No tags</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" title="Preview">
                                        <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" title="Download">
                                        <Download className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" title="Edit">
                                        <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" title="Delete">
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};