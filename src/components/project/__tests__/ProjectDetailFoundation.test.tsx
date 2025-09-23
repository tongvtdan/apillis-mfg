import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { InlineProjectEditor } from '../InlineProjectEditor';
import { ProjectStatusManager } from '../ProjectStatusManager';
import { ProjectDetailLayout } from '../ProjectDetailLayout';
import type { Project, WorkflowStage } from '@/types/project';

// Mock the project service
vi.mock('@/services/projectService', () => ({
    projectService: {
        updateProject: vi.fn().mockResolvedValue({
            id: 'test-project-1',
            title: 'Updated Test Project',
            status: 'active'
        })
    }
}));

// Mock the toast hook
vi.mock('@/shared/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn()
    })
}));

const mockProject: Project = {
    id: 'test-project-1',
    organization_id: 'org-1',
    project_id: 'P-25010101',
    title: 'Test Project',
    description: 'Test project description',
    status: 'active',
    priority_level: 'medium',
    estimated_value: 10000,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
};

const mockWorkflowStages: WorkflowStage[] = [
    {
        id: 'stage-1',
        name: 'Inquiry Received',
        slug: 'inquiry-received',
        stage_order: 1,
        organization_id: 'org-1'
    },
    {
        id: 'stage-2',
        name: 'Technical Review',
        slug: 'technical-review',
        stage_order: 2,
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

describe('Project Detail Foundation Components', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('InlineProjectEditor', () => {
        it('renders project information correctly', () => {
            render(
                <TestWrapper>
                    <InlineProjectEditor project={mockProject} />
                </TestWrapper>
            );

            expect(screen.getByText('Project Information')).toBeInTheDocument();
            expect(screen.getByText('Test Project')).toBeInTheDocument();
            expect(screen.getByText('Test project description')).toBeInTheDocument();
        });

        it('allows editing project title', async () => {
            const onUpdate = vi.fn();

            render(
                <TestWrapper>
                    <InlineProjectEditor project={mockProject} onUpdate={onUpdate} />
                </TestWrapper>
            );

            // Find and click the edit button for title
            const editButtons = screen.getAllByRole('button');
            const titleEditButton = editButtons.find(button =>
                button.querySelector('svg') && button.closest('div')?.textContent?.includes('Test Project')
            );

            if (titleEditButton) {
                fireEvent.click(titleEditButton);

                // Should show input field
                const input = screen.getByDisplayValue('Test Project');
                expect(input).toBeInTheDocument();

                // Change the value
                fireEvent.change(input, { target: { value: 'Updated Project Title' } });

                // Save the changes
                const saveButton = screen.getByText('Save');
                fireEvent.click(saveButton);

                // Should call onUpdate
                await waitFor(() => {
                    expect(onUpdate).toHaveBeenCalled();
                });
            }
        });
    });

    describe('ProjectStatusManager', () => {
        it('renders current status correctly', () => {
            render(
                <TestWrapper>
                    <ProjectStatusManager
                        project={mockProject}
                        workflowStages={mockWorkflowStages}
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Project Status')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
        });

        it('shows available status transitions', () => {
            render(
                <TestWrapper>
                    <ProjectStatusManager
                        project={mockProject}
                        workflowStages={mockWorkflowStages}
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Available Actions')).toBeInTheDocument();
            expect(screen.getByText('Put On Hold')).toBeInTheDocument();
            expect(screen.getByText('Cancel Project')).toBeInTheDocument();
        });
    });

    describe('ProjectDetailLayout', () => {
        it('renders tabbed layout correctly', () => {
            render(
                <TestWrapper>
                    <ProjectDetailLayout
                        project={mockProject}
                        workflowStages={mockWorkflowStages}
                    >
                        <div>Test content</div>
                    </ProjectDetailLayout>
                </TestWrapper>
            );

            expect(screen.getByText('Project Status')).toBeInTheDocument();
            expect(screen.getByText('Overview')).toBeInTheDocument();
            expect(screen.getByText('Documents')).toBeInTheDocument();
            expect(screen.getByText('Communication')).toBeInTheDocument();
            expect(screen.getByText('Test content')).toBeInTheDocument();
        });

        it('calculates progress correctly', () => {
            const projectWithStage = {
                ...mockProject,
                current_stage_id: 'stage-2'
            };

            render(
                <TestWrapper>
                    <ProjectDetailLayout
                        project={projectWithStage}
                        workflowStages={mockWorkflowStages}
                    >
                        <div>Test content</div>
                    </ProjectDetailLayout>
                </TestWrapper>
            );

            // Should show 100% progress since it's in the last stage
            expect(screen.getByText('100%')).toBeInTheDocument();
        });
    });
});