import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SupplierQuoteModal } from '../SupplierQuoteModal';
import { Project } from '@/types/project';
import { Supplier } from '@/types/supplier';

// Mock hooks
const mockUseSuppliers = {
  suppliers: [],
  loading: false,
  error: null,
  searchSuppliers: jest.fn(),
};

const mockUseSupplierQuotes = {
  sendRFQToSuppliers: jest.fn(),
  loading: false,
  error: null,
};

jest.mock('@/hooks/useSuppliers', () => ({
  useSuppliers: () => mockUseSuppliers,
}));

jest.mock('@/hooks/useSupplierQuotes', () => ({
  useSupplierQuotes: () => mockUseSupplierQuotes,
}));

// Mock data
const mockProject: Project = {
  id: '1',
  project_id: 'P-20240101',
  title: 'Test Project',
  description: 'Test project description',
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
    id: '1',
    name: 'Supplier One',
    company: 'Company One',
    email: 'supplier1@test.com',
    specialties: ['machining', 'fabrication'],
    rating: 4.5,
    response_rate: 85.5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    total_quotes_sent: 10,
    total_quotes_received: 8,
    average_turnaround_days: 2.5,
    tags: ['reliable']
  },
  {
    id: '2',
    name: 'Supplier Two',
    company: 'Company Two',
    email: 'supplier2@test.com',
    specialties: ['injection_molding'],
    rating: 3.8,
    response_rate: 72.0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    total_quotes_sent: 15,
    total_quotes_received: 11,
    average_turnaround_days: 3.2,
    tags: ['cost-effective']
  },
  {
    id: '3',
    name: 'Inactive Supplier',
    company: 'Inactive Company',
    email: 'inactive@test.com',
    specialties: ['machining'],
    rating: 4.0,
    response_rate: 90.0,
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    total_quotes_sent: 5,
    total_quotes_received: 4,
    average_turnaround_days: 1.8,
    tags: []
  }
];

const defaultProps = {
  project: mockProject,
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
};

describe('SupplierQuoteModal', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSuppliers.suppliers = [...mockSuppliers];
    mockUseSuppliers.loading = false;
    mockUseSuppliers.error = null;
    mockUseSupplierQuotes.loading = false;
    mockUseSupplierQuotes.error = null;
    mockUseSupplierQuotes.sendRFQToSuppliers.mockResolvedValue(true);
  });

  describe('Rendering', () => {
    it('should render modal when open', () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      expect(screen.getByText('Send RFQ to Suppliers')).toBeInTheDocument();
      expect(screen.getByText('Test Project (P-20240101)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search suppliers...')).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(<SupplierQuoteModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Send RFQ to Suppliers')).not.toBeInTheDocument();
    });

    it('should display project information correctly', () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      expect(screen.getByText('Test Project (P-20240101)')).toBeInTheDocument();
      expect(screen.getByText('Test project description')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('fabrication')).toBeInTheDocument();
    });
  });

  describe('Supplier List', () => {
    it('should display all active suppliers initially', () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      expect(screen.getByText('Supplier One')).toBeInTheDocument();
      expect(screen.getByText('Supplier Two')).toBeInTheDocument();
      expect(screen.queryByText('Inactive Supplier')).not.toBeInTheDocument();
    });

    it('should display supplier information correctly', () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const supplierCard = screen.getByText('Supplier One').closest('.supplier-card');
      expect(within(supplierCard!).getByText('Company One')).toBeInTheDocument();
      expect(within(supplierCard!).getByText('4.5')).toBeInTheDocument();
      expect(within(supplierCard!).getByText('85.5%')).toBeInTheDocument();
      expect(within(supplierCard!).getByText('reliable')).toBeInTheDocument();
    });

    it('should show loading state when suppliers are loading', () => {
      mockUseSuppliers.loading = true;
      mockUseSuppliers.suppliers = [];
      
      render(<SupplierQuoteModal {...defaultProps} />);
      
      expect(screen.getByText('Loading suppliers...')).toBeInTheDocument();
    });

    it('should show error message when suppliers fail to load', () => {
      mockUseSuppliers.error = new Error('Failed to load suppliers');
      mockUseSuppliers.suppliers = [];
      
      render(<SupplierQuoteModal {...defaultProps} />);
      
      expect(screen.getByText(/Failed to load suppliers/)).toBeInTheDocument();
    });

    it('should show empty state when no suppliers match filters', () => {
      mockUseSuppliers.suppliers = [];
      
      render(<SupplierQuoteModal {...defaultProps} />);
      
      expect(screen.getByText('No suppliers found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria or add new suppliers')).toBeInTheDocument();
    });
  });

  describe('Supplier Selection', () => {
    it('should allow selecting suppliers', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const supplierCheckbox = screen.getByLabelText('Select Supplier One');
      await user.click(supplierCheckbox);
      
      expect(supplierCheckbox).toBeChecked();
      expect(screen.getByText('1 suppliers selected')).toBeInTheDocument();
    });

    it('should allow selecting multiple suppliers', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const supplier1Checkbox = screen.getByLabelText('Select Supplier One');
      const supplier2Checkbox = screen.getByLabelText('Select Supplier Two');
      
      await user.click(supplier1Checkbox);
      await user.click(supplier2Checkbox);
      
      expect(supplier1Checkbox).toBeChecked();
      expect(supplier2Checkbox).toBeChecked();
      expect(screen.getByText('2 suppliers selected')).toBeInTheDocument();
    });

    it('should allow deselecting suppliers', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const supplierCheckbox = screen.getByLabelText('Select Supplier One');
      
      await user.click(supplierCheckbox);
      expect(supplierCheckbox).toBeChecked();
      
      await user.click(supplierCheckbox);
      expect(supplierCheckbox).not.toBeChecked();
      expect(screen.getByText('No suppliers selected')).toBeInTheDocument();
    });

    it('should handle select all functionality', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const selectAllButton = screen.getByText('Select All');
      await user.click(selectAllButton);
      
      expect(screen.getByLabelText('Select Supplier One')).toBeChecked();
      expect(screen.getByLabelText('Select Supplier Two')).toBeChecked();
      expect(screen.getByText('2 suppliers selected')).toBeInTheDocument();
    });

    it('should handle clear selection functionality', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      // Select suppliers first
      await user.click(screen.getByLabelText('Select Supplier One'));
      await user.click(screen.getByLabelText('Select Supplier Two'));
      
      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);
      
      expect(screen.getByLabelText('Select Supplier One')).not.toBeChecked();
      expect(screen.getByLabelText('Select Supplier Two')).not.toBeChecked();
      expect(screen.getByText('No suppliers selected')).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    it('should search suppliers by name', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search suppliers...');
      await user.type(searchInput, 'Supplier One');
      
      await waitFor(() => {
        expect(mockUseSuppliers.searchSuppliers).toHaveBeenCalledWith({
          name: 'Supplier One',
          is_active: true
        });
      });
    });

    it('should filter by specialty', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const specialtyFilter = screen.getByRole('combobox', { name: /specialty/i });
      await user.click(specialtyFilter);
      
      const machiningOption = screen.getByText('CNC Machining');
      await user.click(machiningOption);
      
      await waitFor(() => {
        expect(mockUseSuppliers.searchSuppliers).toHaveBeenCalledWith({
          specialties: ['machining'],
          is_active: true
        });
      });
    });

    it('should filter by minimum rating', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const ratingFilter = screen.getByRole('combobox', { name: /rating/i });
      await user.click(ratingFilter);
      
      const fourStarOption = screen.getByText('4+ Stars');
      await user.click(fourStarOption);
      
      await waitFor(() => {
        expect(mockUseSuppliers.searchSuppliers).toHaveBeenCalledWith({
          min_rating: 4,
          is_active: true
        });
      });
    });

    it('should show inactive suppliers when toggled', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const inactiveToggle = screen.getByLabelText('Show inactive suppliers');
      await user.click(inactiveToggle);
      
      await waitFor(() => {
        expect(mockUseSuppliers.searchSuppliers).toHaveBeenCalledWith({
          is_active: undefined
        });
      });
    });
  });

  describe('RFQ Configuration', () => {
    it('should allow setting quote deadline', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const deadlineInput = screen.getByLabelText('Quote Deadline');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];
      
      await user.clear(deadlineInput);
      await user.type(deadlineInput, dateString);
      
      expect(deadlineInput).toHaveValue(dateString);
    });

    it('should allow customizing RFQ message', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const messageTextarea = screen.getByLabelText('RFQ Message');
      const customMessage = 'Custom RFQ message for this project';
      
      await user.clear(messageTextarea);
      await user.type(messageTextarea, customMessage);
      
      expect(messageTextarea).toHaveValue(customMessage);
    });

    it('should generate default RFQ message template', () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const messageTextarea = screen.getByLabelText('RFQ Message');
      expect(messageTextarea).toHaveValue(expect.stringContaining('Test Project'));
      expect(messageTextarea).toHaveValue(expect.stringContaining('P-20240101'));
    });
  });

  describe('Form Submission', () => {
    it('should send RFQ successfully', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      // Select suppliers
      await user.click(screen.getByLabelText('Select Supplier One'));
      await user.click(screen.getByLabelText('Select Supplier Two'));
      
      // Submit form
      const sendButton = screen.getByText('Send RFQ');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockUseSupplierQuotes.sendRFQToSuppliers).toHaveBeenCalledWith({
          project_id: '1',
          supplier_ids: ['1', '2'],
          quote_deadline: expect.any(String),
          rfq_message: expect.any(String)
        });
      });
      
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should show validation error when no suppliers selected', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const sendButton = screen.getByText('Send RFQ');
      await user.click(sendButton);
      
      expect(screen.getByText('Please select at least one supplier')).toBeInTheDocument();
      expect(mockUseSupplierQuotes.sendRFQToSuppliers).not.toHaveBeenCalled();
    });

    it('should show validation error for past deadline', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      // Select a supplier
      await user.click(screen.getByLabelText('Select Supplier One'));
      
      // Set past date
      const deadlineInput = screen.getByLabelText('Quote Deadline');
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const dateString = pastDate.toISOString().split('T')[0];
      
      await user.clear(deadlineInput);
      await user.type(deadlineInput, dateString);
      
      const sendButton = screen.getByText('Send RFQ');
      await user.click(sendButton);
      
      expect(screen.getByText('Quote deadline must be in the future')).toBeInTheDocument();
      expect(mockUseSupplierQuotes.sendRFQToSuppliers).not.toHaveBeenCalled();
    });

    it('should handle send RFQ failure', async () => {
      mockUseSupplierQuotes.sendRFQToSuppliers.mockResolvedValue(false);
      mockUseSupplierQuotes.error = new Error('Failed to send RFQ');
      
      render(<SupplierQuoteModal {...defaultProps} />);
      
      // Select suppliers and submit
      await user.click(screen.getByLabelText('Select Supplier One'));
      
      const sendButton = screen.getByText('Send RFQ');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to send RFQ/)).toBeInTheDocument();
      });
      
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      mockUseSupplierQuotes.loading = true;
      
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const sendButton = screen.getByText('Sending...');
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Modal Controls', () => {
    it('should close modal when cancel button is clicked', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close modal when close button is clicked', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close modal when escape key is pressed', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby');
      expect(screen.getByPlaceholderText('Search suppliers...')).toHaveAttribute('aria-label');
    });

    it('should focus first focusable element when opened', () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Search suppliers...')).toHaveFocus();
    });

    it('should trap focus within modal', async () => {
      render(<SupplierQuoteModal {...defaultProps} />);
      
      // Tab through focusable elements
      await user.tab();
      await user.tab();
      
      // Should not focus elements outside modal
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<SupplierQuoteModal {...defaultProps} />);
      
      // Modal should still be accessible on mobile
      expect(screen.getByText('Send RFQ to Suppliers')).toBeInTheDocument();
      expect(screen.getByText('Supplier One')).toBeInTheDocument();
    });
  });
});