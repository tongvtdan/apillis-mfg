import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Search,
    Filter,
    Grid3X3,
    List,
    Upload,
    Download,
    Edit,
    Trash2,
    Eye,
    Tag,
    Calendar,
    FileText,
    Image,
    File,
    Archive,
    Plus,
    X,
    SortAsc,
    SortDesc
} from 'lucide-react';
import { format } from 'date-fns';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentUploadZone } from './DocumentUploadZone';
import { DocumentGrid } from './DocumentGrid';
import { DocumentList } from './DocumentList';
import { DocumentFilters } from './DocumentFilters';
import { DocumentApproval } from '@/components/approval/DocumentApproval';
import type { ProjectDocument } from '@/hooks/useDocuments';

interface DocumentManagerProps {
    projectId: string;
}

export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface DocumentFiltersState {
    search: string;
    type: string[];
    accessLevel: string[];
    dateRange: {
        from?: Date;
        to?: Date;
    };
    tags: string[];
    uploadedBy: string[];
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ projectId }) => {
    const { data: documents = [], isLoading } = useDocuments(projectId);

    // View state
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [showUploadZone, setShowUploadZone] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
    const [showApprovalPanel, setShowApprovalPanel] = useState(false);

    // Sorting state
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Filter state
    const [filters, setFilters] = useState<DocumentFiltersState>({
        search: '',
        type: [],
        accessLevel: [],
        dateRange: {},
        tags: [],
        uploadedBy: []
    });

    // Filter and sort documents
    const filteredAndSortedDocuments = useMemo(() => {
        let filtered = documents.filter(doc => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesName = (doc.title || doc.file_name || '').toLowerCase().includes(searchLower);
                const matchesTags = doc.metadata?.tags?.some((tag: string) =>
                    tag.toLowerCase().includes(searchLower)
                );
                if (!matchesName && !matchesTags) return false;
            }

            // Type filter
            if (filters.type.length > 0 && !filters.type.includes(doc.category || 'other')) {
                return false;
            }

            // Access level filter
            if (filters.accessLevel.length > 0 && !filters.accessLevel.includes(doc.access_level || 'public')) {
                return false;
            }

            // Date range filter
            if (filters.dateRange.from || filters.dateRange.to) {
                const docDate = new Date(doc.created_at);
                if (filters.dateRange.from && docDate < filters.dateRange.from) return false;
                if (filters.dateRange.to && docDate > filters.dateRange.to) return false;
            }

            // Tags filter
            if (filters.tags.length > 0) {
                const docTags = doc.metadata?.tags || [];
                if (!filters.tags.some(tag => docTags.includes(tag))) return false;
            }

            // Uploaded by filter
            if (filters.uploadedBy.length > 0 && !filters.uploadedBy.includes(doc.uploaded_by || '')) {
                return false;
            }

            return true;
        });

        // Sort documents
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortField) {
                case 'name':
                    aValue = (a.original_file_name || a.filename || '').toLowerCase();
                    bValue = (b.original_file_name || b.filename || '').toLowerCase();
                    break;
                case 'date':
                    aValue = new Date(a.uploaded_at);
                    bValue = new Date(b.uploaded_at);
                    break;
                case 'size':
                    aValue = a.file_size || 0;
                    bValue = b.file_size || 0;
                    break;
                case 'type':
                    aValue = a.document_type || 'other';
                    bValue = b.document_type || 'other';
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [documents, filters, sortField, sortOrder]);

    // Selection handlers
    const handleSelectDocument = useCallback((documentId: string) => {
        setSelectedDocuments(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    }, []);

    const handleSelectAll = useCallback(() => {
        if (selectedDocuments.length === filteredAndSortedDocuments.length) {
            setSelectedDocuments([]);
        } else {
            setSelectedDocuments(filteredAndSortedDocuments.map(doc => doc.id));
        }
    }, [selectedDocuments.length, filteredAndSortedDocuments]);

    const handleClearSelection = useCallback(() => {
        setSelectedDocuments([]);
    }, []);

    // Sort handlers
    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    }, [sortField]);

    // Filter handlers
    const handleFilterChange = useCallback((newFilters: Partial<DocumentFiltersState>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({
            search: '',
            type: [],
            accessLevel: [],
            dateRange: {},
            tags: [],
            uploadedBy: []
        });
    }, []);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const types = [...new Set(documents.map(doc => doc.document_type || 'other'))];
        const accessLevels = [...new Set(documents.map(doc => doc.access_level || 'public'))];
        const uploadedBy = [...new Set(documents.map(doc => doc.uploaded_by).filter(Boolean))];
        const allTags = documents.flatMap(doc => doc.metadata?.tags || []);
        const tags = [...new Set(allTags)];

        return { types, accessLevels, uploadedBy, tags };
    }, [documents]);

    const hasActiveFilters = useMemo(() => {
        return filters.search ||
            filters.type.length > 0 ||
            filters.accessLevel.length > 0 ||
            filters.dateRange.from ||
            filters.dateRange.to ||
            filters.tags.length > 0 ||
            filters.uploadedBy.length > 0;
    }, [filters]);

    const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
    const [showApprovalPanel, setShowApprovalPanel] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header with actions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Documents ({filteredAndSortedDocuments.length})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className={hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                                        !
                                    </Badge>
                                )}
                            </Button>

                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-r-none"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-l-none"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>

                            <Button onClick={() => setShowUploadZone(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Files
                            </Button>
                        </div>
                    </div>

                    {/* Search and quick filters */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search documents by name or tags..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange({ search: e.target.value })}
                                className="pl-10"
                            />
                        </div>

                        <Select
                            value={sortField}
                            onValueChange={(value) => handleSort(value as SortField)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Sort by Date</SelectItem>
                                <SelectItem value="name">Sort by Name</SelectItem>
                                <SelectItem value="size">Sort by Size</SelectItem>
                                <SelectItem value="type">Sort by Type</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Selection info */}
                    {selectedDocuments.length > 0 && (
                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                            <span className="text-sm font-medium">
                                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Selected
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Tag className="w-4 h-4 mr-2" />
                                    Add Tags
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Selected
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    {/* Advanced Filters */}
                    {showFilters && (
                        <DocumentFilters
                            filters={filters}
                            onFiltersChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            filterOptions={filterOptions}
                        />
                    )}

                    {/* Document Display */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading documents...</p>
                            </div>
                        </div>
                    ) : filteredAndSortedDocuments.length > 0 ? (
                        viewMode === 'grid' ? (
                            <DocumentGrid
                                documents={filteredAndSortedDocuments}
                                selectedDocuments={selectedDocuments}
                                onSelectDocument={handleSelectDocument}
                                onSelectAll={handleSelectAll}
                                onDocumentClick={(document) => {
                                    setSelectedDocument(document);
                                    setShowApprovalPanel(true);
                                }}
                            />
                        ) : (
                            <DocumentList
                                documents={filteredAndSortedDocuments}
                                selectedDocuments={selectedDocuments}
                                onSelectDocument={handleSelectDocument}
                                onSelectAll={handleSelectAll}
                                sortField={sortField}
                                sortOrder={sortOrder}
                                onSort={handleSort}
                                onDocumentClick={(document) => {
                                    setSelectedDocument(document);
                                    setShowApprovalPanel(true);
                                }}
                            />
                        )
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                {hasActiveFilters ? 'No documents match your filters' : 'No documents uploaded'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {hasActiveFilters
                                    ? 'Try adjusting your search criteria or clearing filters'
                                    : 'Upload your first document to get started'
                                }
                            </p>
                            {hasActiveFilters ? (
                                <Button variant="outline" onClick={handleClearFilters}>
                                    Clear Filters
                                </Button>
                            ) : (
                                <Button onClick={() => setShowUploadZone(true)}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Files
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">

                    {showApprovalPanel && selectedDocument && (
                        <div className="lg:col-span-1">
                            <DocumentApproval
                                document={selectedDocument}
                                projectId={projectId}
                                organizationId="TEMP_ORG_ID" // This should be fetched from context
                                onApprovalUpdate={() => {
                                    // Refresh documents or update UI as needed
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Upload Zone Modal */}
                {showUploadZone && (
                    <DocumentUploadZone
                        projectId={projectId}
                        onClose={() => setShowUploadZone(false)}
                    />
                )}
            </div>
            );
};