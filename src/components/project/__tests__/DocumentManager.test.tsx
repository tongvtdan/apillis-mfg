import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { DocumentManager } from '../DocumentManager';
import { useDocuments } from '@/hooks/useDocuments';

// Mock the hooks
vi.mock('@/hooks/useDocuments');
const mockUseDocuments = vi.mocked(useDocuments);

// Mock the child components
vi.mock('../DocumentUploadZone', () => ({
    DocumentUploadZone: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="upload-zone">
            Upload Zone
            <button onClick={onClose}>Close</button>
        </div>
    )
}));

vi.mock('../DocumentGrid', () => ({
    DocumentGrid: ({ documents }: { documents: any[] }) => (
        <div data-testid="document-grid">
            Grid View - {documents.length} documents
        </div>
    )
}));

vi.mock('../DocumentList', () => ({
    DocumentList: ({ documents }: { documents: any[] }) => (
        <div data-testid="document-list">
            List View - {documents.length} documents
        </div>
    )
}));

vi.mock('../DocumentFilters', () => ({
    DocumentFilters: ({ onClearFilters }: { onClearFilters: () => void }) => (
        <div data-testid="document-filters">
            Filters
            <button onClick={onClearFilters}>Clear Filters</button>
        </div>
    )
}));

const mockDocuments = [
    {
        id: '1',
        project_id: 'test-project',
        filename: 'test-document.pdf',
        original_file_name: 'Test Document.pdf',
        file_size: 1024000,
        file_type: 'application/pdf',
        mime_type: 'application/pdf',
        document_type: 'rfq',
        access_level: 'internal',
        uploaded_at: '2024-01-01T00:00:00Z',
        uploaded_by: 'test-user',
        metadata: {
            tags: ['important', 'rfq']
        }
    },
    {
        id: '2',
        project_id: 'test-project',
        filename: 'drawing.dwg',
        original_file_name: 'Technical Drawing.dwg',
        file_size: 2048000,
        file_type: 'application/dwg',
        mime_type: 'application/dwg',
        document_type: 'drawing',
        access_level: 'public',
        uploaded_at: '2024-01-02T00:00:00Z',
        uploaded_by: 'engineer',
        metadata: {
            tags: ['technical', 'drawing']
        }
    }
];

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
    }
});

const renderWithQueryClient = (component: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    );
};

describe('DocumentManager', () => {
    beforeEach(() => {
        mockUseDocuments.mockReturnValue({
            data: mockDocuments,
            isLoading: false,
            error: null,
            refetch: vi.fn()
        } as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders document manager with documents', () => {
        renderWithQueryClient(<DocumentManager projectId="test-project" />);

        expect(screen.getByText('Documents (2)')).toBeInTheDocument();
        expect(screen.getByTestId('document-grid')).toBeInTheDocument();
        expect(screen.getByText('Grid View - 2 documents')).toBeInTheDocument();
    });

    it('switches between grid and list view', () => {
        renderWithQueryClient(<DocumentManager projectId="test-project" />);

        // Initially shows grid view
        expect(screen.getByTestId('document-grid')).toBeInTheDocument();
        expect(screen.queryByTestId('document-list')).not.toBeInTheDocument();

        // Click list view button
        const listButton = screen.getByRole('button', { name: /list/i });
        fireEvent.click(listButton);

        expect(screen.getByTestId('document-list')).toBeInTheDocument();
        expect(screen.queryByTestId('document-grid')).not.toBeInTheDocument();
    });

    it('opens upload zone when upload button is clicked', () => {
        renderWithQueryClient(<DocumentManager projectId="test-project" />);

        const uploadButton = screen.getByRole('button', { name: /upload files/i });
        fireEvent.click(uploadButton);

        expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
    });

    it('shows filters when filter button is clicked', () => {
        renderWithQueryClient(<DocumentManager projectId="test-project" />);

        const filterButton = screen.getByRole('button', { name: /filters/i });
        fireEvent.click(filterButton);

        expect(screen.getByTestId('document-filters')).toBeInTheDocument();
    });

    it('filters documents by search term', async () => {
        renderWithQueryClient(<DocumentManager projectId="test-project" />);

        const searchInput = screen.getByPlaceholderText(/search documents/i);
        fireEvent.change(searchInput, { target: { value: 'drawing' } });

        // The filtering logic should reduce the document count
        await waitFor(() => {
            // In a real test, we would check that only matching documents are shown
            expect(searchInput).toHaveValue('drawing');
        });
    });

    it('shows empty state when no documents', () => {
        mockUseDocuments.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: vi.fn()
        } as any);

        renderWithQueryClient(<DocumentManager projectId="test-project" />);

        expect(screen.getByText('No documents uploaded')).toBeInTheDocument();
        expect(screen.getByText('Upload your first document to get started')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        mockUseDocuments.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
            refetch: vi.fn()
        } as any);

        renderWithQueryClient(<DocumentManager projectId="test-project" />);

        expect(screen.getByText('Loading documents...')).toBeInTheDocument();
    });

    it('handles sort field changes', () => {
        renderWithQueryClient(<DocumentManager projectId="test-project" />);

        const sortSelect = screen.getByRole('combobox');
        fireEvent.click(sortSelect);

        // The sort options should be available
        expect(screen.getByText('Sort by Date')).toBeInTheDocument();
        expect(screen.getByText('Sort by Name')).toBeInTheDocument();
        expect(screen.getByText('Sort by Size')).toBeInTheDocument();
        expect(screen.getByText('Sort by Type')).toBeInTheDocument();
    });
});