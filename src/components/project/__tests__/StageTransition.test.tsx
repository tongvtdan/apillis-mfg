import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StageTransitionValidator } from '../StageTransitionValidator';
import { Project, WorkflowStage } from '@/types/project';
import { AuthContext } from '@/core/auth';

// Mock the services
vi.mock('@/services/workflowStageService', () => ({
    workflowStageService: {
        validateStageTransition: vi.fn().mockResolvedValue({
            isValid: true,
            message: 'Valid transition'
        }),
        getWorkflowStageById: vi.fn().mockResolvedValue({
            id: 'stage-1',
            name: 'Current Stage'
        })
    }
}));

vi.mock('@/services/prerequisiteChecker', () => ({
    prerequisiteChecker: {
        checkPrerequisites: vi.fn().mockResolvedValue({
            allPassed: true,
            requiredPassed: true,
            checks: [
                {
                    id: 'test-check',
                    name: 'Test Check',
                    description: 'Test prerequisite check',
                    status: 'passed',
                    required: true,
                    category: 'project_data'
                }
            ],
            errors: [],
            warnings: [],
            blockers: []
        })
    }
}));

vi.mock('@/services/stageHistoryService', () => ({
    stageHistoryService: {
        recordStageTransition: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('@/hooks/usePermissions', () => ({
    usePermissions: () => ({
        checkPermission: vi.fn().mockReturnValue({ allowed: true })
    })
}));

vi.mock('@/shared/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn()
    })
}));

const mockProject: Project = {
    id: 'project-1',
    project_id: 'P-250101001',
    title: 'Test Project',
    description: 'Test project description',
    customer_id: 'customer-1',
    current_stage_id: 'stage-1',
    status: 'active',
    priority_level: 'normal',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    organization_id: 'org-1'
};

const mockTargetStage: WorkflowStage = {
    id: 'stage-2',
    name: 'Target Stage',
    description: 'Target stage description',
    stage_order: 2,
    color: '#blue',
    is_active: true,
    requires_approval: false,
    approval_roles: [],
    responsible_roles: [],
    estimated_duration_days: 5,
    exit_criteria: 'Complete all tasks',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    organization_id: 'org-1'
};

const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    user_metadata: {
        first_name: 'Test',
        last_name: 'User'
    }
};

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const mockAuthValue = {
        user: mockUser,
        profile: null,
        loading: false,
        signOut: vi.fn(),
        refreshSession: vi.fn()
    };

    return (
        <AuthContext.Provider value={mockAuthValue}>
            {children}
        </AuthContext.Provider>
    );
};

describe('StageTransitionValidator', () => {
    const mockOnClose = vi.fn();
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render stage transition validator dialog', async () => {
        render(
            <MockAuthProvider>
                <StageTransitionValidator
                    project={mockProject}
                    targetStage={mockTargetStage}
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            </MockAuthProvider>
        );

        expect(screen.getByText('Stage Transition Validation')).toBeInTheDocument();
        expect(screen.getByText(/Validating transition from current stage to Target Stage/)).toBeInTheDocument();
    });

    it('should show validation results when loaded', async () => {
        render(
            <MockAuthProvider>
                <StageTransitionValidator
                    project={mockProject}
                    targetStage={mockTargetStage}
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            </MockAuthProvider>
        );

        // Wait for validation to complete
        await waitFor(() => {
            expect(screen.getByText('Valid Transition')).toBeInTheDocument();
        });

        expect(screen.getByText('Can Proceed')).toBeInTheDocument();
        expect(screen.getByText('Test Check')).toBeInTheDocument();
    });

    it('should call onConfirm when proceed button is clicked', async () => {
        render(
            <MockAuthProvider>
                <StageTransitionValidator
                    project={mockProject}
                    targetStage={mockTargetStage}
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            </MockAuthProvider>
        );

        // Wait for validation to complete
        await waitFor(() => {
            expect(screen.getByText('Proceed')).toBeInTheDocument();
        });

        const proceedButton = screen.getByText('Proceed');
        fireEvent.click(proceedButton);

        expect(mockOnConfirm).toHaveBeenCalledWith(false);
    });

    it('should call onClose when cancel button is clicked', async () => {
        render(
            <MockAuthProvider>
                <StageTransitionValidator
                    project={mockProject}
                    targetStage={mockTargetStage}
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            </MockAuthProvider>
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});