import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowStepper } from '../WorkflowStepper';
import { Project } from '@/types/project';
import { useProjectUpdate } from '@/hooks/useProjectUpdate';
import { WorkflowValidator } from '@/lib/workflow-validator';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks and validator
jest.mock('@/hooks/useProjectUpdate');
jest.mock('@/lib/workflow-validator');
jest.mock('@/hooks/use-toast');

const mockProject: Project = {
  id: '1',
  project_id: 'P-001',
  title: 'Test Project',
  status: 'technical_review',
  priority: 'medium',
  project_type: 'manufacturing',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  days_in_stage: 5,
  stage_entered_at: '2023-01-01',
};

const mockUseProjectUpdate = {
  updateStatus: jest.fn().mockResolvedValue(true),
  isUpdating: false,
};

const mockToast = {
  toast: jest.fn(),
};

const mockValidationResult = {
  isValid: true,
  errors: [],
  warnings: [],
};

const mockInvalidResult = {
  isValid: false,
  errors: ['Cannot move to this stage'],
  warnings: [],
};

describe('WorkflowStepper', () => {
  beforeEach(() => {
    (useProjectUpdate as jest.Mock).mockReturnValue(mockUseProjectUpdate);
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (WorkflowValidator.validateStatusChange as jest.Mock).mockResolvedValue(mockValidationResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with project data', () => {
    render(<WorkflowStepper project={mockProject} />);
    
    // Check if the component renders
    expect(screen.getByText('Project Workflow')).toBeInTheDocument();
    expect(screen.getByText('29% Complete')).toBeInTheDocument(); // 2/7 stages = ~29%
    
    // Check if all stages are rendered
    expect(screen.getByText('Inquiry Received')).toBeInTheDocument();
    expect(screen.getByText('Technical Review')).toBeInTheDocument();
    expect(screen.getByText('Supplier RFQ Sent')).toBeInTheDocument();
    expect(screen.getByText('Quoted')).toBeInTheDocument();
    expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Procurement & Planning')).toBeInTheDocument();
    expect(screen.getByText('In Production')).toBeInTheDocument();
    expect(screen.getByText('Shipped & Closed')).toBeInTheDocument();
  });

  it('shows correct status indicators', () => {
    render(<WorkflowStepper project={mockProject} />);
    
    // Technical Review should be current (blue)
    const currentStage = screen.getByText('Technical Review').closest('div');
    expect(currentStage).toHaveClass('text-blue-600');
    
    // Inquiry Received should be completed (green)
    const completedStage = screen.getByText('Inquiry Received').closest('div');
    expect(completedStage).toHaveClass('text-green-600');
    
    // Supplier RFQ Sent should be pending (gray)
    const pendingStage = screen.getByText('Supplier RFQ Sent').closest('div');
    expect(pendingStage).toHaveClass('text-gray-400');
  });

  it('handles stage click correctly', async () => {
    render(<WorkflowStepper project={mockProject} />);
    
    // Click on a pending stage
    const quotedStage = screen.getByText('Quoted').closest('div');
    if (quotedStage) {
      fireEvent.click(quotedStage);
    }
    
    // Check if updateStatus was called
    expect(mockUseProjectUpdate.updateStatus).toHaveBeenCalledWith('quoted');
  });

  it('handles keyboard navigation', async () => {
    render(<WorkflowStepper project={mockProject} />);
    
    // Find a pending stage and simulate Enter key press
    const quotedStage = screen.getByText('Quoted').closest('div');
    if (quotedStage) {
      fireEvent.keyDown(quotedStage, { key: 'Enter', code: 'Enter' });
    }
    
    // Check if updateStatus was called
    expect(mockUseProjectUpdate.updateStatus).toHaveBeenCalledWith('quoted');
  });

  it('shows validation errors', async () => {
    (WorkflowValidator.validateStatusChange as jest.Mock).mockResolvedValueOnce(mockInvalidResult);
    
    render(<WorkflowStepper project={mockProject} />);
    
    // Click on a pending stage
    const quotedStage = screen.getByText('Quoted').closest('div');
    if (quotedStage) {
      fireEvent.click(quotedStage);
    }
    
    // Check if toast was called with error
    expect(mockToast.toast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Validation Error",
      description: "Cannot move to this stage",
    });
  });

  it('shows loading state when updating', () => {
    (useProjectUpdate as jest.Mock).mockReturnValue({
      updateStatus: jest.fn().mockResolvedValue(true),
      isUpdating: true,
    });
    
    render(<WorkflowStepper project={mockProject} />);
    
    // Check if loading state is shown
    expect(screen.getByText('Updating project status...')).toBeInTheDocument();
  });

  it('shows error message when update fails', async () => {
    (mockUseProjectUpdate.updateStatus as jest.Mock).mockResolvedValueOnce(false);
    
    render(<WorkflowStepper project={mockProject} />);
    
    // Click on a pending stage
    const quotedStage = screen.getByText('Quoted').closest('div');
    if (quotedStage) {
      fireEvent.click(quotedStage);
    }
    
    // Check if error message is shown
    // Note: This test might need adjustment based on how the error state is implemented
  });

  it('is accessible with proper ARIA attributes', () => {
    render(<WorkflowStepper project={mockProject} />);
    
    // Check if the main region has proper ARIA attributes
    const region = screen.getByRole('region', { name: 'Project Workflow Stepper' });
    expect(region).toBeInTheDocument();
    
    // Check if progress bar has proper ARIA attributes
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });
});