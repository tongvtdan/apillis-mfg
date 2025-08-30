import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { mockProject } from '@/test/mocks/project-data'
import '@/test/mocks/supabase'

// Mock the hooks
vi.mock('@/hooks/useProjects', () => ({
    useProjects: () => ({
        getProjectById: vi.fn().mockResolvedValue(mockProject),
        updateProject: vi.fn().mockResolvedValue(mockProject),
        updateProjectStage: vi.fn().mockResolvedValue(mockProject)
    })
}))

vi.mock('@/hooks/usePermissions', () => ({
    usePermissions: () => ({
        canEditProjects: true,
        canDeleteProjects: true,
        canViewProjects: true,
        canManageWorkflow: true
    })
}))

vi.mock('@/hooks/useProjectReviews', () => ({
    useProjectReviews: () => ({
        data: [],
        isLoading: false,
        error: null
    })
}))

vi.mock('@/hooks/useDocuments', () => ({
    useDocuments: () => ({
        data: [],
        isLoading: false,
        error: null
    })
}))

const TestWrapper = ({ children, initialEntries = ['/projects/123'] }: {
    children: React.ReactNode
    initialEntries?: string[]
}) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    })

    return (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={initialEntries}>
                {children}
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('ProjectDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render project details correctly', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            expect(screen.getByText('Test Manufacturing Project')).toBeInTheDocument()
        })

        // Check project ID
        expect(screen.getByText('P-25013001')).toBeInTheDocument()

        // Check status
        expect(screen.getByText('active')).toBeInTheDocument()

        // Check priority
        expect(screen.getByText('medium')).toBeInTheDocument()

        // Check description
        expect(screen.getByText('A test project for manufacturing components')).toBeInTheDocument()
    })

    it('should display customer information', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            expect(screen.getByText('Test Customer')).toBeInTheDocument()
        })

        expect(screen.getByText('customer@test.com')).toBeInTheDocument()
        expect(screen.getByText('+1234567890')).toBeInTheDocument()
        expect(screen.getByText('Test Company')).toBeInTheDocument()
    })

    it('should display workflow stage information', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            expect(screen.getByText('Engineering Review')).toBeInTheDocument()
        })

        expect(screen.getByText('Engineering review stage')).toBeInTheDocument()
    })

    it('should display estimated value correctly', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            expect(screen.getByText('$15,000.50')).toBeInTheDocument()
        })
    })

    it('should display project tags', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            expect(screen.getByText('manufacturing')).toBeInTheDocument()
            expect(screen.getByText('urgent')).toBeInTheDocument()
        })
    })

    it('should display project metadata', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            // Check if metadata is displayed (department: engineering)
            expect(screen.getByText(/engineering/i)).toBeInTheDocument()
        })
    })

    it('should handle edit project functionality', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            const editButton = screen.getByText('Edit Project')
            expect(editButton).toBeInTheDocument()
        })

        const editButton = screen.getByText('Edit Project')
        fireEvent.click(editButton)

        // Check if edit modal opens
        await waitFor(() => {
            expect(screen.getByText('Edit Project')).toBeInTheDocument()
        })
    })

    it('should handle stage transition', async () => {
        const mockUpdateStage = vi.fn()
        vi.mocked(vi.importActual('@/hooks/useProjects')).useProjects = () => ({
            updateProjectStage: mockUpdateStage
        })

        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            const stageButton = screen.getByText('Change Stage')
            expect(stageButton).toBeInTheDocument()
        })

        const stageButton = screen.getByText('Change Stage')
        fireEvent.click(stageButton)

        // Verify stage change functionality is triggered
        await waitFor(() => {
            expect(screen.getByText('Select New Stage')).toBeInTheDocument()
        })
    })

    it('should display project notes', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            expect(screen.getByText('Test project notes')).toBeInTheDocument()
        })
    })

    it('should display creation and update timestamps', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            // Check for formatted dates
            expect(screen.getByText(/Created:/)).toBeInTheDocument()
            expect(screen.getByText(/Updated:/)).toBeInTheDocument()
        })
    })

    it('should handle loading state', () => {
        vi.mocked(vi.importActual('@/hooks/useProjects')).useProjects = () => ({
            getProjectById: vi.fn().mockReturnValue({ isLoading: true })
        })

        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        expect(screen.getByText('Loading project...')).toBeInTheDocument()
    })

    it('should handle error state', () => {
        vi.mocked(vi.importActual('@/hooks/useProjects')).useProjects = () => ({
            getProjectById: vi.fn().mockReturnValue({
                isLoading: false,
                error: new Error('Project not found')
            })
        })

        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        expect(screen.getByText('Error loading project')).toBeInTheDocument()
    })

    it('should handle project not found', () => {
        vi.mocked(vi.importActual('@/hooks/useProjects')).useProjects = () => ({
            getProjectById: vi.fn().mockReturnValue({
                isLoading: false,
                data: null,
                error: null
            })
        })

        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        expect(screen.getByText('Project not found')).toBeInTheDocument()
    })

    it('should display project type correctly', async () => {
        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            expect(screen.getByText('manufacturing')).toBeInTheDocument()
        })
    })

    it('should handle permissions correctly', async () => {
        // Mock user without edit permissions
        vi.mocked(vi.importActual('@/hooks/usePermissions')).usePermissions = () => ({
            canEditProjects: false,
            canDeleteProjects: false,
            canViewProjects: true,
            canManageWorkflow: false
        })

        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            expect(screen.queryByText('Edit Project')).not.toBeInTheDocument()
            expect(screen.queryByText('Change Stage')).not.toBeInTheDocument()
        })
    })

    it('should display assignee information when available', async () => {
        const projectWithAssignee = {
            ...mockProject,
            assignee: {
                id: 'user-123',
                name: 'John Assignee',
                email: 'john@company.com'
            }
        }

        vi.mocked(vi.importActual('@/hooks/useProjects')).useProjects = () => ({
            getProjectById: vi.fn().mockResolvedValue(projectWithAssignee)
        })

        render(
            <TestWrapper>
                <ProjectDetail />
            </TestWrapper>
        )

        await waitFor(() => {
            expect(screen.getByText('John Assignee')).toBeInTheDocument()
        })
    })
})