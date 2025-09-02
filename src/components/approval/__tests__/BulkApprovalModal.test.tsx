import React from 'react';
import { render, screen } from '@testing-library/react';
import { BulkApprovalModal } from '../BulkApprovalModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { vi } from 'vitest';

// Mock the hooks and services
vi.mock('@/hooks/useApprovals', () => ({
    useApprovals: () => ({
        submitApproval: vi.fn().mockResolvedValue(true)
    })
}));

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                in: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
        }))
    }
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
    }
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('BulkApprovalModal', () => {
    const mockProps = {
        approvalIds: ['approval-1', 'approval-2'],
        isOpen: true,
        onClose: vi.fn(),
        onComplete: vi.fn()
    };

    it('renders bulk approval modal when open', () => {
        render(
            <TestWrapper>
                <BulkApprovalModal {...mockProps} />
            </TestWrapper>
        );

        expect(screen.getByText('Bulk Approval Review')).toBeInTheDocument();
        expect(screen.getByText('2 approvals')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <TestWrapper>
                <BulkApprovalModal {...mockProps} isOpen={false} />
            </TestWrapper>
        );

        expect(screen.queryByText('Bulk Approval Review')).not.toBeInTheDocument();
    });
});