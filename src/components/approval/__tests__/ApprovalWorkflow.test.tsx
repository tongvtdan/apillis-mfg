import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/core/auth';
import { ApprovalDashboard } from '../ApprovalDashboard';
import { ApprovalStatusWidget } from '../ApprovalStatusWidget';

// Mock the hooks and services
vi.mock('@/hooks/useApprovals', () => ({
    useApprovals: () => ({
        pendingApprovals: [
            {
                id: 'approval1',
                project_id: 'project1',
                stage_id: 'stage1',
                approver_id: 'user1',
                approver_role: 'engineering',
                status: 'pending',
                comments: 'Please review the technical specifications',
                due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ],
        approvalHistory: [
            {
                id: 'approval2',
                project_id: 'project1',
                stage_id: 'stage0',
                approver_id: 'user2',
                approver_name: 'John Doe',
                approver_role: 'qa',
                status: 'approved',
                comments: 'Quality requirements look good',
                created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                completed_at: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
            }
        ],
        loading: false,
        submitApproval: vi.fn(),
        getApprovalStatus: vi.fn(),
        autoAssignApprovers: vi.fn(),
        refetchPendingApprovals: vi.fn(),
        refetchApprovalHistory: vi.fn()
    }),
    useProjectApprovalStatus: () => ({
        approvalStatus: {
            required: ['engineering', 'qa'],
            pending: [
                {
                    id: 'approval1',
                    project_id: 'project1',
                    stage_id: 'stage1',
                    approver_id: 'user1',
                    approver_role: 'engineering',
                    status: 'pending'
                }
            ],
            approved: [
                {
                    id: 'approval2',
                    project_id: 'project1',
                    stage_id: 'stage1',
                    approver_id: 'user2',
                    approver_role: 'qa',
                    status: 'approved'
                }
            ],
            rejected: [],
            isComplete: false
        },
        loading: false,
        refetch: vi.fn()
    })
}));

vi.mock('@/contexts/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAuth: () => ({
        user: {
            id: 'user1',
            email: 'test@example.com',
            role: 'engineering'
        },
        loading: false
    })
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn()
    })
}));

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Approval Workflow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ApprovalDashboard', () => {
        it('should display pending approvals correctly', async () => {
            renderWithProviders(<ApprovalDashboard />);

            // Check summary cards
            expect(screen.getByText('1')).toBeInTheDocument(); // Pending approvals count
            expect(screen.getByText('Pending Approvals')).toBeInTheDocument();

            // Check pending approval item
            expect(screen.getByText('Stage Approval Required')).toBeInTheDocument();
            expect(screen.getByText('Project: project1')).toBeInTheDocument();
            expect(screen.getByText('Role: engineering')).toBeInTheDocument();
            expect(screen.getByText('Please review the technical specifications')).toBeInTheDocument();

            // Check review button
            const reviewButton = screen.getByText('Review');
            expect(reviewButton).toBeInTheDocument();
        });

        it('should display approval history correctly', async () => {
            renderWithProviders(<ApprovalDashboard />);

            // Switch to history tab
            const historyTab = screen.getByText('Approval History');
            fireEvent.click(historyTab);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('Quality requirements look good')).toBeInTheDocument();
            });
        });

        it('should show empty state when no pending approvals', async () => {
            // Mock empty approvals
            vi.mocked(require('@/hooks/useApprovals').useApprovals).mockReturnValue({
                pendingApprovals: [],
                approvalHistory: [],
                loading: false,
                submitApproval: vi.fn(),
                getApprovalStatus: vi.fn(),
                autoAssignApprovers: vi.fn(),
                refetchPendingApprovals: vi.fn(),
                refetchApprovalHistory: vi.fn()
            });

            renderWithProviders(<ApprovalDashboard />);

            expect(screen.getByText('All caught up!')).toBeInTheDocument();
            expect(screen.getByText('You have no pending approvals at the moment.')).toBeInTheDocument();
        });
    });

    describe('ApprovalStatusWidget', () => {
        it('should display approval status correctly', async () => {
            renderWithProviders(
                <ApprovalStatusWidget
                    projectId="project1"
                    stageId="stage1"
                    showRequestButton={true}
                />
            );

            // Check overall status
            expect(screen.getByText('Approval Status')).toBeInTheDocument();
            expect(screen.getByText('Pending')).toBeInTheDocument();
            expect(screen.getByText('1/2 approved')).toBeInTheDocument();

            // Check individual role statuses
            expect(screen.getByText('engineering')).toBeInTheDocument();
            expect(screen.getByText('qa')).toBeInTheDocument();

            // Check progress indication
            expect(screen.getByText('1 approved')).toBeInTheDocument();
            expect(screen.getByText('1 pending')).toBeInTheDocument();
        });

        it('should show complete status when all approvals are done', async () => {
            // Mock complete approval status
            vi.mocked(require('@/hooks/useApprovals').useProjectApprovalStatus).mockReturnValue({
                approvalStatus: {
                    required: ['engineering', 'qa'],
                    pending: [],
                    approved: [
                        { id: 'approval1', approver_role: 'engineering', status: 'approved' },
                        { id: 'approval2', approver_role: 'qa', status: 'approved' }
                    ],
                    rejected: [],
                    isComplete: true
                },
                loading: false,
                refetch: vi.fn()
            });

            renderWithProviders(
                <ApprovalStatusWidget
                    projectId="project1"
                    stageId="stage1"
                />
            );

            expect(screen.getByText('Approved')).toBeInTheDocument();
            expect(screen.getByText('All approvals complete')).toBeInTheDocument();
            expect(screen.getByText('Stage transition can proceed.')).toBeInTheDocument();
        });

        it('should show no approvals required message', async () => {
            // Mock no approvals required
            vi.mocked(require('@/hooks/useApprovals').useProjectApprovalStatus).mockReturnValue({
                approvalStatus: {
                    required: [],
                    pending: [],
                    approved: [],
                    rejected: [],
                    isComplete: true
                },
                loading: false,
                refetch: vi.fn()
            });

            renderWithProviders(
                <ApprovalStatusWidget
                    projectId="project1"
                    stageId="stage1"
                />
            );

            expect(screen.getByText('No approvals required')).toBeInTheDocument();
        });

        it('should handle request approvals action', async () => {
            const mockAutoAssignApprovers = vi.fn();

            vi.mocked(require('@/hooks/useApprovals').useApprovals).mockReturnValue({
                autoAssignApprovers: mockAutoAssignApprovers,
                pendingApprovals: [],
                approvalHistory: [],
                loading: false,
                submitApproval: vi.fn(),
                getApprovalStatus: vi.fn(),
                refetchPendingApprovals: vi.fn(),
                refetchApprovalHistory: vi.fn()
            });

            renderWithProviders(
                <ApprovalStatusWidget
                    projectId="project1"
                    stageId="stage1"
                    showRequestButton={true}
                    onRequestApprovals={async () => {
                        await mockAutoAssignApprovers('project1', 'stage1', 'org1');
                    }}
                />
            );

            const requestButton = screen.getByText('Request Approvals');
            fireEvent.click(requestButton);

            await waitFor(() => {
                expect(mockAutoAssignApprovers).toHaveBeenCalledWith('project1', 'stage1', 'org1');
            });
        });
    });

    describe('Approval Workflow States', () => {
        it('should handle rejected approvals correctly', async () => {
            // Mock rejected approval status
            vi.mocked(require('@/hooks/useApprovals').useProjectApprovalStatus).mockReturnValue({
                approvalStatus: {
                    required: ['engineering', 'qa'],
                    pending: [],
                    approved: [
                        { id: 'approval2', approver_role: 'qa', status: 'approved' }
                    ],
                    rejected: [
                        { id: 'approval1', approver_role: 'engineering', status: 'rejected' }
                    ],
                    isComplete: false
                },
                loading: false,
                refetch: vi.fn()
            });

            renderWithProviders(
                <ApprovalStatusWidget
                    projectId="project1"
                    stageId="stage1"
                />
            );

            expect(screen.getByText('Rejected')).toBeInTheDocument();
            expect(screen.getByText('1 approval rejected')).toBeInTheDocument();
            expect(screen.getByText('Address the rejected approvals before proceeding.')).toBeInTheDocument();
        });

        it('should show loading state correctly', async () => {
            // Mock loading state
            vi.mocked(require('@/hooks/useApprovals').useProjectApprovalStatus).mockReturnValue({
                approvalStatus: null,
                loading: true,
                refetch: vi.fn()
            });

            renderWithProviders(
                <ApprovalStatusWidget
                    projectId="project1"
                    stageId="stage1"
                />
            );

            expect(screen.getByText('Loading approval status...')).toBeInTheDocument();
        });
    });
});