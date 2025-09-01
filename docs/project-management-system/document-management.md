# Document Management System

## Overview

The Document Management System provides comprehensive file handling capabilities for Factory Pulse projects. It enables users to upload, organize, search, and manage project-related documents with advanced filtering and collaboration features.

## Core Components

### DocumentManager

**Location**: `src/components/project/DocumentManager.tsx`

The main document management interface that provides a complete document handling experience.

#### Features

- **Dual View Modes**: Grid and list views for different user preferences
- **Advanced Search**: Full-text search across document names and tags
- **Multi-Criteria Filtering**: Filter by type, access level, date range, tags, and uploader
- **Smart Sorting**: Sort by name, date, size, or type with order control
- **Bulk Operations**: Select multiple documents for batch operations
- **Upload Integration**: Seamless file upload with progress tracking
- **Empty States**: Contextual guidance when no documents are present

#### Component Architecture

```typescript
interface DocumentManagerProps {
  projectId: string;
}

interface DocumentFiltersState {
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
```

#### State Management

The component uses React hooks for efficient state management:

- **Filter State**: Complex filtering with multiple criteria
- **Selection State**: Multi-document selection tracking
- **View State**: Grid/list view toggle
- **Sort State**: Dynamic sorting configuration
- **UI State**: Modal and panel visibility

#### Performance Optimizations

- **Memoized Operations**: Filtering and sorting operations are memoized
- **Callback Optimization**: Event handlers use useCallback to prevent re-renders
- **Computed Values**: Derived state for filter options and active filters
- **Efficient Updates**: Minimal re-renders through proper dependency arrays

### Supporting Components (To Be Implemented)

#### DocumentUploadZone

**Purpose**: Modal-based file upload interface with drag-and-drop support

**Features**:
- Drag-and-drop file upload
- Progress indicators for upload status
- File type validation and size limits
- Bulk upload capabilities
- Upload queue management

#### DocumentGrid

**Purpose**: Grid view display for documents with thumbnails and metadata

**Features**:
- Thumbnail generation for supported file types
- Document metadata display
- Selection checkboxes for bulk operations
- Hover actions for quick operations
- Responsive grid layout

#### DocumentList

**Purpose**: List view display for documents with detailed information

**Features**:
- Tabular layout with sortable columns
- Detailed metadata display
- Inline actions for document operations
- Selection checkboxes for bulk operations
- Compact view for large document sets

#### DocumentFilters

**Purpose**: Advanced filtering interface with multiple criteria

**Features**:
- Date range picker for upload dates
- Multi-select dropdowns for types and access levels
- Tag selection with autocomplete
- User selection for uploaded by filter
- Filter reset and clear functionality

## Data Layer

### useDocuments Hook (To Be Implemented)

**Purpose**: Data fetching and management for project documents

```typescript
interface UseDocumentsReturn {
  data: ProjectDocument[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  uploadDocument: (file: File, metadata: DocumentMetadata) => Promise<ProjectDocument>;
  updateDocument: (id: string, updates: Partial<ProjectDocument>) => Promise<ProjectDocument>;
  deleteDocument: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
}
```

### ProjectDocument Type (To Be Implemented)

```typescript
interface ProjectDocument {
  id: string;
  project_id: string;
  filename: string;
  original_file_name: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  document_type: 'rfq' | 'drawing' | 'specification' | 'quote' | 'contract' | 'other';
  access_level: 'public' | 'internal' | 'confidential' | 'restricted';
  uploaded_at: string;
  uploaded_by: string;
  updated_at: string;
  metadata: {
    tags: string[];
    description?: string;
    version?: string;
    category?: string;
  };
  storage_path: string;
  download_url?: string;
  thumbnail_url?: string;
}
```

## Integration Points

### Project Detail Page

The DocumentManager integrates as a tab in the project detail page:

```typescript
// In ProjectDetail.tsx
<TabsContent value="documents">
  <DocumentManager projectId={project.id} />
</TabsContent>
```

### File Storage

Documents are stored using Supabase Storage:

- **Bucket**: `project-documents`
- **Path Structure**: `{organization_id}/{project_id}/{document_id}/{filename}`
- **Access Control**: Row-level security based on user permissions

### Database Schema

```sql
-- Documents table
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'other',
  access_level TEXT NOT NULL DEFAULT 'internal',
  storage_path TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_type ON project_documents(document_type);
CREATE INDEX idx_project_documents_access_level ON project_documents(access_level);
CREATE INDEX idx_project_documents_uploaded_by ON project_documents(uploaded_by);
CREATE INDEX idx_project_documents_created_at ON project_documents(created_at);
```

## Security Considerations

### Access Control

- **Row-Level Security**: Documents are filtered by organization and project access
- **Access Levels**: Different permission levels (public, internal, confidential, restricted)
- **User Permissions**: Upload, view, edit, and delete permissions based on user roles

### File Validation

- **File Type Restrictions**: Configurable allowed file types
- **Size Limits**: Maximum file size enforcement
- **Virus Scanning**: Integration with file scanning services
- **Content Validation**: Validation of file contents for security

## Performance Considerations

### Optimization Strategies

- **Lazy Loading**: Documents loaded on-demand with pagination
- **Thumbnail Generation**: Async thumbnail generation for supported file types
- **Caching**: Client-side caching of document metadata
- **CDN Integration**: File delivery through content delivery network

### Scalability

- **Pagination**: Large document sets handled with pagination
- **Search Indexing**: Full-text search capabilities for document content
- **Bulk Operations**: Efficient handling of bulk document operations
- **Storage Optimization**: Automatic file compression and optimization

## Testing Strategy

### Unit Tests

- Component rendering and interaction tests
- Filter and sort functionality tests
- State management tests
- Error handling tests

### Integration Tests

- File upload and download tests
- Database integration tests
- Permission and security tests
- Performance tests

### End-to-End Tests

- Complete document management workflows
- Multi-user collaboration scenarios
- File sharing and permission tests
- Cross-browser compatibility tests

## Future Enhancements

### Collaboration Features (Task 6)

- Document preview with inline commenting
- Version control with diff visualization
- Document approval workflows
- Real-time collaboration features

### Advanced Features

- Document templates and automation
- OCR and content extraction
- Integration with external document systems
- Advanced analytics and reporting

## Implementation Status

- ✅ **Core Interface**: DocumentManager component implemented
- 🔄 **Supporting Components**: DocumentUploadZone, DocumentGrid, DocumentList, DocumentFilters (pending)
- 🔄 **Data Layer**: useDocuments hook and ProjectDocument type (pending)
- 🔄 **Database Schema**: Document storage and metadata tables (pending)
- 🔄 **File Storage**: Supabase storage integration (pending)
- 📋 **Testing**: Test suite structure created, dependencies required

## Next Steps

1. Implement missing supporting components
2. Create useDocuments hook for data management
3. Set up database schema and storage integration
4. Resolve test dependencies and ensure coverage
5. Integrate with project detail page tabs
6. Begin Task 6 collaboration features implementation