import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApprovalDelegationModal } from '../ApprovalDelegationModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { vi } from 'vitest';

// Mock the auth context
vi.mock('@/core/auth', () => ({
    useAuth: () => ({
        user: {
            id: 'user-1',
            user_metadata: {
                organization_id: 'org-1',
                display_name: 'Test User'
            }
        }
    })
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn()
    })
}));

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    neq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            in: vi.fn(() => Promise.resolve({ data: [], error: null }))
                        }))
                    }))
                }))
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { id: 'delegation-1' }, error: null }))
                }))
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

describe('ApprovalDelegationModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onComplete: vi.fn()
    };

    it('renders delegation modal when open', async () => {
        render(
            <TestWrapper>
                <ApprovalDelegationModal {...mockProps} />
            </TestWrapper>
        );

        expect(screen.getByText('Delegate Approval Responsibilities')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <TestWrapper>
                <ApprovalDelegationModal {...mockProps} isOpen={false} />
            </TestWrapper>
        );

        expect(screen.queryByText('Delegate Approval Responsibilities')).not.toBeInTheDocument();
    });
});