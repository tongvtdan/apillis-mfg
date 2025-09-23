import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DocumentVersionHistory } from '../DocumentVersionHistory';
import { documentVersionService } from '@/services/documentVersionService';
import type { ProjectDocument } from '@/types/project';

// Mock the document version service
vi.mock('@/services/documentVersionService');
const mockDocumentVersionService = documentVersionService as any;

// Mock document data
const mockDocument: ProjectDocument = {
    id: 'doc-123',
    organization_id: 'org-123',
    project_id: 'project-123',
    file_name: 'test-document.pdf',
    title: 'Test Document',
    description: 'A test document',
    file_size: 1024,
    file_type: 'pdf',
    file_path: 'org-123/project-123/test-document.pdf',
    mime_type: 'application/pdf',
    version_number: 1,
    is_current_version: true,
    category: 'other',
    access_level: 'internal',
    tags: ['test'],
    metadata: { tags: ['test'] },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    uploaded_by: 'user-123'
};

const mockVersionHistory = {
    document: mockDocument,
    versions: [
        {
            id: 'version-1',
            document_id: 'doc-123',
            version_number: 1,
            file_name: 'test-document_v1.pdf',
            file_path: 'org-123/project-123/versions/test-document_v1.pdf',
            file_size: 1024,
            mime_type: 'application/pdf',
            title: 'Test Document',
            description: 'A test document',
            change_summary: 'Initial version',
            uploaded_by: 'user-123',
            uploaded_at: '2025-01-01T00:00:00Z',
            is_current: true,
            metadata: {},
            uploader_name: 'Test User',
            uploader_email: 'test@example.com'
        }
    ],
    current_version: {
        id: 'version-1',
        document_id: 'doc-123',
        version_number: 1,
        file_name: 'test-document_v1.pdf',
        file_path: 'org-123/project-123/versions/test-document_v1.pdf',
        file_size: 1024,
        mime_type: 'application/pdf',
        title: 'Test Document',
        description: 'A test document',
        change_summary: 'Initial version',
        uploaded_by: 'user-123',
        uploaded_at: '2025-01-01T00:00:00Z',
        is_current: true,
        metadata: {},
        uploader_name: 'Test User',
        uploader_email: 'test@example.com'
    },
    total_versions: 1
};

describe('DocumentVersionHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDocumentVersionService.getDocumentVersionHistory = vi.fn().mockResolvedValue(mockVersionHistory);
    });

    it('renders version history modal when open', async () => {
        render(
            <DocumentVersionHistory
                document={mockDocument}
                isOpen={true}
                onClose={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Version History')).toBeInTheDocument();
            expect(screen.getByText('Test Document')).toBeInTheDocument();
        });
    });

    it('shows version information', async () => {
        render(
            <DocumentVersionHistory
                document={mockDocument}
                isOpen={true}
                onClose={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Version 1')).toBeInTheDocument();
            expect(screen.getByText('Current')).toBeInTheDocument();
            expect(screen.getByText('Initial version')).toBeInTheDocument();
        });
    });

    it('has new version upload button', async () => {
        render(
            <DocumentVersionHistory
                document={mockDocument}
                isOpen={true}
                onClose={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('New Version')).toBeInTheDocument();
        });
    });

    it('calls onClose when close button is clicked', async () => {
        const onClose = vi.fn();
        render(
            <DocumentVersionHistory
                document={mockDocument}
                isOpen={true}
                onClose={onClose}
            />
        );

        await waitFor(() => {
            // Find all buttons and click the first one (which should be the close button)
            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);
            expect(onClose).toHaveBeenCalled();
        });
    });
});
