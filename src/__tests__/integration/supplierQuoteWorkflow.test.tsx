import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createClient } from '@supabase/supabase-js';
import { SupplierQuoteModal } from '@/components/supplier/SupplierQuoteModal';
import { SupplierQuoteTable } from '@/components/supplier/SupplierQuoteTable';
import { WorkflowKanban } from '@/components/dashboard/WorkflowKanban';
import { Project, ProjectStatus } from '@/types/project';
import { Supplier, SupplierQuote } from '@/types/supplier';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock Supabase for integration tests
const mockSupabaseClient = {
  from: jest.fn(),
  rpc: jest.fn(),
  channel: jest.fn(),
  auth: {
    getUser: jest.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user-id' } }, 
      error: null 
    })
  }
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient
}));

// Test data
const mockProject: Project = {
  id: 'project-1',
  project_id: 'P-20240101',
  title: 'Integration Test Project',
  description: 'Test project for integration testing',
  status: 'technical_review',
  priority: 'high',
  project_type: 'fabrication',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  days_in_stage: 2,
  stage_entered_at: '2024-01-01T00:00:00Z'
};

const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'Alpha Manufacturing',
    company: 'Alpha Corp',
    email: 'quotes@alpha.com',
    specialties: ['machining', 'fabrication'],
    rating: 4.5,
    response_rate: 90.0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    total_quotes_sent: 25,
    total_quotes_received: 22,
    average_turnaround_days: 2.1,
    tags: ['reliable', 'fast']
  },
  {
    id: 'supplier-2',
    name: 'Beta Fabrication',
    company: 'Beta Inc',
    email: 'rfq@beta.com',
    specialties: ['fabrication', 'welding'],
    rating: 4.2,
    response_rate: 85.5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    total_quotes_sent: 18,
    total_quotes_received: 15,
    average_turnaround_days: 2.8,
    tags: ['cost-effective']
  }
];

const mockSupplierQuotes: SupplierQuote[] = [
  {
    id: 'quote-1',
    project_id: 'project-1',
    supplier_id: 'supplier-1',
    supplier: mockSuppliers[0],
    quote_amount: 15000,
    lead_time_days: 14,
    currency: 'USD',
    status: 'received',
    rfq_sent_at: '2024-01-01T10:00:00Z',
    quote_received_at: '2024-01-02T14:30:00Z',
    response_time_hours: 28.5,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-02T14:30:00Z',
    attachments: [],
    is_competitive: true,
    quality_score: 4.5
  },
  {
    id: 'quote-2',
    project_id: 'project-1',
    supplier_id: 'supplier-2',
    supplier: mockSuppliers[1],
    quote_amount: 12500,
    lead_time_days: 18,
    currency: 'USD',
    status: 'received',
    rfq_sent_at: '2024-01-01T10:00:00Z',
    quote_received_at: '2024-01-03T09:15:00Z',
    response_time_hours: 47.25,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-03T09:15:00Z',
    attachments: [],
    is_competitive: true,
    quality_score: 4.0
  }
];

// Test wrapper with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}

describe('Supplier Quote Workflow Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    const mockFromChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockFromChain);
    mockSupabaseClient.rpc.mockResolvedValue({ data: [], error: null });
    mockSupabaseClient.channel.mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() })
    });
  });

  describe('End-to-End RFQ Process', () => {
    it('should complete full RFQ workflow from creation to quote acceptance', async () => {
      // Mock database responses for the workflow
      const mockFromChain = mockSupabaseClient.from() as any;
      
      // Mock suppliers load
      mockFromChain.select.mockImplementation((fields: string) => {
        if (fields === '*') {
          return Promise.resolve({ data: mockSuppliers, error: null });
        }
        return mockFromChain;
      });

      // Mock RFQ creation
      mockSupabaseClient.rpc.mockImplementation((functionName: string, params: any) => {
        if (functionName === 'send_rfq_to_suppliers') {
          // Simulate creating supplier quotes
          const newQuotes = params.p_supplier_ids.map((supplierId: string, index: number) => ({
            id: `quote-${index + 1}`,
            project_id: params.p_project_id,
            supplier_id: supplierId,
            status: 'sent',
            rfq_sent_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            currency: 'USD',
            attachments: []
          }));
          return Promise.resolve({ data: newQuotes, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      // Mock quote updates
      mockFromChain.update.mockImplementation((data: any) => {
        return Promise.resolve({ data: [{ ...mockSupplierQuotes[0], ...data }], error: null });
      });

      // Step 1: Open RFQ Modal and send RFQ
      render(
        <TestWrapper>
          <SupplierQuoteModal
            project={mockProject}
            isOpen={true}
            onClose={jest.fn()}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Wait for suppliers to load
      await waitFor(() => {
        expect(screen.getByText('Alpha Manufacturing')).toBeInTheDocument();
        expect(screen.getByText('Beta Fabrication')).toBeInTheDocument();
      });

      // Select suppliers
      const alphaCheckbox = screen.getByLabelText('Select Alpha Manufacturing');
      const betaCheckbox = screen.getByLabelText('Select Beta Fabrication');
      
      await user.click(alphaCheckbox);
      await user.click(betaCheckbox);

      // Set quote deadline
      const deadlineInput = screen.getByLabelText('Quote Deadline');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      await user.clear(deadlineInput);
      await user.type(deadlineInput, futureDate.toISOString().split('T')[0]);

      // Send RFQ
      const sendButton = screen.getByText('Send RFQ');
      await user.click(sendButton);

      // Verify RFQ was sent
      await waitFor(() => {
        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('send_rfq_to_suppliers', {
          p_project_id: 'project-1',
          p_supplier_ids: ['supplier-1', 'supplier-2'],
          p_quote_deadline: expect.any(String),
          p_rfq_message: expect.any(String)
        });
      });
    });

    it('should handle quote comparison and selection workflow', async () => {
      // Mock quote data for comparison
      const mockFromChain = mockSupabaseClient.from() as any;
      
      mockFromChain.select.mockImplementation(() => {
        return Promise.resolve({ data: mockSupplierQuotes, error: null });
      });

      mockFromChain.update.mockImplementation((data: any) => {
        return Promise.resolve({ 
          data: [{ ...mockSupplierQuotes[0], status: 'accepted', ...data }], 
          error: null 
        });
      });

      // Mock quote comparison creation
      mockSupabaseClient.rpc.mockImplementation((functionName: string) => {
        if (functionName === 'create_quote_comparison') {
          return Promise.resolve({
            data: [{
              id: 'comparison-1',
              project_id: 'project-1',
              comparison_date: new Date().toISOString(),
              quote_scores: {
                'quote-1': { price: 85, quality: 90, delivery: 95, service: 88 },
                'quote-2': { price: 95, quality: 80, delivery: 85, service: 85 }
              },
              total_scores: {
                'quote-1': 89.5,
                'quote-2': 86.25
              }
            }],
            error: null
          });
        }
        return Promise.resolve({ data: [], error: null });
      });

      render(
        <TestWrapper>
          <SupplierQuoteTable
            projectId="project-1"
            quotes={mockSupplierQuotes}
            onQuoteUpdate={jest.fn()}
            canEdit={true}
          />
        </TestWrapper>
      );

      // Wait for quotes to render
      await waitFor(() => {
        expect(screen.getByText('Alpha Manufacturing')).toBeInTheDocument();
        expect(screen.getByText('Beta Fabrication')).toBeInTheDocument();
      });

      // Open quote comparison
      const compareButton = screen.getByText('Compare Quotes');
      await user.click(compareButton);

      // Verify comparison modal opens
      await waitFor(() => {
        expect(screen.getByText('Quote Comparison')).toBeInTheDocument();
        expect(screen.getByText('$15,000')).toBeInTheDocument();
        expect(screen.getByText('$12,500')).toBeInTheDocument();
      });

      // Select winning quote
      const selectButtons = screen.getAllByText('Select Winner');
      await user.click(selectButtons[1]); // Select Beta's quote (lower price)

      // Verify quote acceptance
      await waitFor(() => {
        expect(mockFromChain.update).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'accepted'
          })
        );
      });
    });
  });

  describe('Real-time Updates Integration', () => {
    it('should handle real-time quote status updates', async () => {
      let realtimeCallback: Function = jest.fn();
      
      // Mock real-time subscription
      mockSupabaseClient.channel.mockReturnValue({
        on: jest.fn((event, config, callback) => {
          realtimeCallback = callback;
          return {
            on: jest.fn().mockReturnThis(),
            subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() })
          };
        }),
        subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() })
      });

      const mockFromChain = mockSupabaseClient.from() as any;
      mockFromChain.select.mockResolvedValue({ data: [mockSupplierQuotes[0]], error: null });

      const onQuoteUpdate = jest.fn();

      render(
        <TestWrapper>
          <SupplierQuoteTable
            projectId="project-1"
            quotes={[mockSupplierQuotes[0]]}
            onQuoteUpdate={onQuoteUpdate}
            canEdit={true}
          />
        </TestWrapper>
      );

      // Simulate real-time quote update
      const updatedQuote = {
        ...mockSupplierQuotes[0],
        status: 'received',
        quote_amount: 14500,
        quote_received_at: new Date().toISOString()
      };

      // Trigger real-time update
      realtimeCallback({
        eventType: 'UPDATE',
        new: updatedQuote,
        old: mockSupplierQuotes[0]
      });

      // Verify UI updates
      await waitFor(() => {
        expect(screen.getByText('$14,500')).toBeInTheDocument();
        expect(screen.getByText('QUOTE RECEIVED')).toBeInTheDocument();
      });
    });
  });

  describe('Workflow Integration with Kanban', () => {
    it('should integrate quote readiness with kanban board', async () => {
      // Mock project with quote readiness data
      const projectWithQuotes = {
        ...mockProject,
        status: 'supplier_rfq_sent' as ProjectStatus
      };

      const mockFromChain = mockSupabaseClient.from() as any;
      
      // Mock projects load
      mockFromChain.select.mockImplementation(() => {
        return Promise.resolve({ data: [projectWithQuotes], error: null });
      });

      // Mock quote readiness function
      mockSupabaseClient.rpc.mockImplementation((functionName: string) => {
        if (functionName === 'get_project_quote_readiness') {
          return Promise.resolve({
            data: {
              totalSuppliers: 2,
              receivedQuotes: 1,
              pendingQuotes: 1,
              overdueQuotes: 0,
              readinessPercentage: 50.0,
              statusText: '1/2 quotes received - 1 pending',
              colorCode: 'yellow'
            },
            error: null
          });
        }
        if (functionName === 'detect_project_bottlenecks') {
          return Promise.resolve({ data: [], error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      render(
        <TestWrapper>
          <WorkflowKanban projectTypeFilter="all" />
        </TestWrapper>
      );

      // Wait for kanban to load
      await waitFor(() => {
        expect(screen.getByText('Integration Test Project')).toBeInTheDocument();
      });

      // Verify quote readiness indicator
      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
        expect(screen.getByText('1/2 quotes received - 1 pending')).toBeInTheDocument();
      });

      // Test RFQ action button
      const projectCard = screen.getByText('Integration Test Project').closest('[data-testid="project-card"]');
      const actionButton = within(projectCard!).getByRole('button', { name: /more actions/i });
      
      await user.click(actionButton);
      
      const sendRFQOption = screen.getByText('Send RFQ');
      expect(sendRFQOption).toBeInTheDocument();
    });
  });

  describe('Analytics Integration', () => {
    it('should update supplier performance metrics after quote completion', async () => {
      // Mock performance update
      mockSupabaseClient.rpc.mockImplementation((functionName: string, params: any) => {
        if (functionName === 'update_supplier_performance') {
          return Promise.resolve({
            data: {
              supplier_id: params.p_supplier_id,
              response_rate: 91.0,
              average_turnaround_hours: 26.5,
              win_rate: 45.5
            },
            error: null
          });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const mockFromChain = mockSupabaseClient.from() as any;
      mockFromChain.select.mockResolvedValue({ data: mockSupplierQuotes, error: null });
      
      // Mock quote acceptance
      mockFromChain.update.mockImplementation((data: any) => {
        return Promise.resolve({ 
          data: [{ ...mockSupplierQuotes[0], status: 'accepted', ...data }], 
          error: null 
        });
      });

      const onQuoteUpdate = jest.fn();

      render(
        <TestWrapper>
          <SupplierQuoteTable
            projectId="project-1"
            quotes={mockSupplierQuotes}
            onQuoteUpdate={onQuoteUpdate}
            canEdit={true}
          />
        </TestWrapper>
      );

      // Accept a quote
      const acceptButtons = screen.getAllByText('Accept');
      await user.click(acceptButtons[0]);

      // Verify performance metrics update was triggered
      await waitFor(() => {
        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('update_supplier_performance', {
          p_supplier_id: 'supplier-1'
        });
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock network error
      const mockFromChain = mockSupabaseClient.from() as any;
      mockFromChain.select.mockRejectedValue(new Error('Network connection failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <SupplierQuoteModal
            project={mockProject}
            isOpen={true}
            onClose={jest.fn()}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/Failed to load suppliers/)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('should handle RPC function errors', async () => {
      const mockFromChain = mockSupabaseClient.from() as any;
      mockFromChain.select.mockResolvedValue({ data: mockSuppliers, error: null });

      // Mock RPC error
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: new Error('RPC function failed')
      });

      render(
        <TestWrapper>
          <SupplierQuoteModal
            project={mockProject}
            isOpen={true}
            onClose={jest.fn()}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Select suppliers and try to send RFQ
      await waitFor(() => {
        expect(screen.getByText('Alpha Manufacturing')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Select Alpha Manufacturing'));
      await user.click(screen.getByText('Send RFQ'));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to send RFQ/)).toBeInTheDocument();
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across components', async () => {
      const mockFromChain = mockSupabaseClient.from() as any;
      
      // Mock initial data load
      mockFromChain.select.mockResolvedValue({ data: mockSupplierQuotes, error: null });

      const sharedQuoteState = mockSupplierQuotes;
      const onQuoteUpdate = jest.fn((updatedQuote) => {
        const index = sharedQuoteState.findIndex(q => q.id === updatedQuote.id);
        if (index >= 0) {
          sharedQuoteState[index] = { ...sharedQuoteState[index], ...updatedQuote };
        }
      });

      const { rerender } = render(
        <TestWrapper>
          <SupplierQuoteTable
            projectId="project-1"
            quotes={sharedQuoteState}
            onQuoteUpdate={onQuoteUpdate}
            canEdit={true}
          />
        </TestWrapper>
      );

      // Simulate quote update
      const updatedQuote = { ...mockSupplierQuotes[0], quote_amount: 14000 };
      mockFromChain.update.mockResolvedValue({ data: [updatedQuote], error: null });

      // Update quote amount
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      const amountInput = screen.getByDisplayValue('15000');
      await user.clear(amountInput);
      await user.type(amountInput, '14000');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      // Update shared state
      onQuoteUpdate({ id: 'quote-1', quote_amount: 14000 });

      // Re-render with updated state
      rerender(
        <TestWrapper>
          <SupplierQuoteTable
            projectId="project-1"
            quotes={sharedQuoteState}
            onQuoteUpdate={onQuoteUpdate}
            canEdit={true}
          />
        </TestWrapper>
      );

      // Verify state consistency
      await waitFor(() => {
        expect(screen.getByText('$14,000')).toBeInTheDocument();
      });
    });
  });
});