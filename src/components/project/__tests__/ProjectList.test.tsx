import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { EnhancedProjectList } from '../EnhancedProjectList';
import { Project, WorkflowStage } from '@/types/project';

// Mock the hooks
vi.mock('@/hooks/useUsers', () => ({
    useUsers: vi.fn(() => ({ users: [] }))
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: vi.fn(() => ({ toast: vi.fn() }))
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(() => vi.fn())
    };
});

// No need to mock AnimatedProjectCard since we use custom card implementation

// Test data
const mockProjects: Project[] = [
    {
        id: '1',
        organization_id: 'org-1',
        project_id: 'P-25090101',
        title: 'Test Project 1',
        description: 'Test description 1',
        status: 'active',
        priority_level: 'high',
        estimated_value: 10000,
        estimated_delivery_date: '2025-12-31',
        created_at: '2025-09-01T00:00:00Z',
        customer: {
            id: 'cust-1',
            organization_id: 'org-1',
            type: 'customer',
            contact_name: 'John Doe',
            email: 'john@test.com',
            is_active: true
        },
        current_stage_id: 'stage-1',
        current_stage: {
            id: 'stage-1',
            name: 'Inquiry Received',
            slug: 'inquiry-received',
            stage_order: 1,
            color: '#3B82F6',
            organization_id: 'org-1'
        }
    },
    {
        id: '2',
        organization_id: 'org-1',
        project_id: 'P-25090102',
        title: 'Test Project 2',
        description: 'Test description 2',
        status: 'active',
        priority_level: 'normal',
        estimated_value: 5000,
        estimated_delivery_date: '2025-11-30',
        created_at: '2025-09-02T00:00:00Z',
        customer: {
            id: 'cust-2',
            organization_id: 'org-1',
            type: 'customer',
            contact_name: 'Jane Smith',
            email: 'jane@test.com',
            is_active: true
        },
        current_stage_id: 'stage-2',
        current_stage: {
            id: 'stage-2',
            name: 'Technical Review',
            slug: 'technical-review',
            stage_order: 2,
            color: '#F59E0B',
            organization_id: 'org-1'
        }
    }
];

const mockWorkflowStages: WorkflowStage[] = [
    {
        id: 'stage-1',
        name: 'Inquiry Received',
        slug: 'inquiry-received',
        stage_order: 1,
        color: '#3B82F6',
        organization_id: 'org-1'
    },
    {
        id: 'stage-2',
        name: 'Technical Review',
        slug: 'technical-review',
        stage_order: 2,
        color: '#F59E0B',
        organization_id: 'org-1'
    }
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    });

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('EnhancedProjectList', () => {
    const mockOnProjectUpdate = vi.fn();
    const mockOnProjectCreate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders project list with projects', () => {
        render(
            <TestWrapper>
                <EnhancedProjectList
                    projects={mockProjects}
                    workflowStages={mockWorkflowStages}
                    onProjectUpdate={mockOnProjectUpdate}
                    onProjectCreate={mockOnProjectCreate}
                />
            </TestWrapper>
        );

        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('P-25090101 - Test Project 1')).toBeInTheDocument();
        expect(screen.getByText('P-25090102 - Test Project 2')).toBeInTheDocument();
    });

    it('filters projects by search text', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <EnhancedProjectList
                    projects={mockProjects}
                    workflowStages={mockWorkflowStages}
                    onProjectUpdate={mockOnProjectUpdate}
                    onProjectCreate={mockOnProjectCreate}
                />
            </TestWrapper>
        );

        const searchInput = screen.getByPlaceholderText(/search projects/i);
        await user.type(searchInput, 'Test Project 1');

        await waitFor(() => {
            expect(screen.getByText('P-25090101 - Test Project 1')).toBeInTheDocument();
            expect(screen.queryByText('P-25090102 - Test Project 2')).not.toBeInTheDocument();
        });
    });

    it('toggles between card and table view', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <EnhancedProjectList
                    projects={mockProjects}
                    workflowStages={mockWorkflowStages}
                    onProjectUpdate={mockOnProjectUpdate}
                    onProjectCreate={mockOnProjectCreate}
                />
            </TestWrapper>
        );

        // Should start in cards view
        expect(screen.getByText('P-25090101 - Test Project 1')).toBeInTheDocument();

        // Switch to table view
        const tableViewButton = screen.getByRole('button', { name: /table/i });
        await user.click(tableViewButton);

        // Should now show table headers
        await waitFor(() => {
            expect(screen.getByText('Project')).toBeInTheDocument();
            expect(screen.getByText('Customer')).toBeInTheDocument();
        });
    });

    it('shows filters when filter button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <EnhancedProjectList
                    projects={mockProjects}
                    workflowStages={mockWorkflowStages}
                    onProjectUpdate={mockOnProjectUpdate}
                    onProjectCreate={mockOnProjectCreate}
                />
            </TestWrapper>
        );

        const filterButton = screen.getByRole('button', { name: /filters/i });
        await user.click(filterButton);

        await waitFor(() => {
            expect(screen.getByText('Stage')).toBeInTheDocument();
            expect(screen.getByText('Priority')).toBeInTheDocument();
            expect(screen.getByText('Status')).toBeInTheDocument();
        });
    });

    it('sorts projects correctly', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <EnhancedProjectList
                    projects={mockProjects}
                    workflowStages={mockWorkflowStages}
                    onProjectUpdate={mockOnProjectUpdate}
                    onProjectCreate={mockOnProjectCreate}
                />
            </TestWrapper>
        );

        // Click on Priority sort button
        const prioritySortButton = screen.getByRole('button', { name: /priority/i });
        await user.click(prioritySortButton);

        // Projects should be sorted by priority (high priority first)
        const projectCards = screen.getAllByText(/P-25090101 - Test Project 1|P-25090102 - Test Project 2/);
        expect(projectCards[0]).toHaveTextContent('P-25090101 - Test Project 1'); // High priority project first
    });

    it('shows empty state when no projects match filters', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <EnhancedProjectList
                    projects={mockProjects}
                    workflowStages={mockWorkflowStages}
                    onProjectUpdate={mockOnProjectUpdate}
                    onProjectCreate={mockOnProjectCreate}
                />
            </TestWrapper>
        );

        const searchInput = screen.getByPlaceholderText(/search projects/i);
        await user.type(searchInput, 'nonexistent project');

        await waitFor(() => {
            expect(screen.getByText('No projects found')).toBeInTheDocument();
            expect(screen.getByText(/no projects match your current filters/i)).toBeInTheDocument();
        });
    });

    it('opens create project dialog when new project button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <EnhancedProjectList
                    projects={mockProjects}
                    workflowStages={mockWorkflowStages}
                    onProjectUpdate={mockOnProjectUpdate}
                    onProjectCreate={mockOnProjectCreate}
                />
            </TestWrapper>
        );

        const newProjectButton = screen.getByRole('button', { name: /new project/i });
        await user.click(newProjectButton);

        await waitFor(() => {
            expect(screen.getByText('Create New Project')).toBeInTheDocument();
        });
    });

    it('displays project count correctly', () => {
        render(
            <TestWrapper>
                <EnhancedProjectList
                    projects={mockProjects}
                    workflowStages={mockWorkflowStages}
                    onProjectUpdate={mockOnProjectUpdate}
                    onProjectCreate={mockOnProjectCreate}
                />
            </TestWrapper>
        );

        expect(screen.getByText(/showing 2 of 2 projects/i)).toBeInTheDocument();
    });

    it('handles loading state', () => {
        render(
            <TestWrapper>
                <EnhancedProjectList
                    projects={[]}
                    workflowStages={mockWorkflowStages}
                    loading={true}
                    onProjectUpdate={mockOnProjectUpdate}
                    onProjectCreate={mockOnProjectCreate}
                />
            </TestWrapper>
        );

        // Should show loading skeleton cards
        const skeletonCards = document.querySelectorAll('.animate-pulse');
        expect(skeletonCards.length).toBeGreaterThan(0);
    });
});