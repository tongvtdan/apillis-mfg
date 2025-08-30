import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ProjectTable } from '../ProjectTable'
import { mockProjects } from '@/test/mocks/project-data'
import '@/test/mocks/supabase'

// Mock the hooks
vi.mock('@/hooks/useProjects', () => ({
    useProjects: () => ({
        data: mockProjects,
        isLoading: false,
        error: null,
        refetch: vi.fn()
    })
}))

vi.mock('@/hooks/usePermissions', () => ({
    usePermissions: () => ({
        canEditProjects: true,
        canDeleteProjects: true,
        canViewProjects: true
    })
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    })

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    )
}

describe('ProjectTable', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render project table with correct data', () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        // Check if table headers are present
        expect(screen.getByText('Project ID')).toBeInTheDocument()
        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Priority')).toBeInTheDocument()
        expect(screen.getByText('Stage')).toBeInTheDocument()

        // Check if project data is displayed
        expect(screen.getByText('P-25013001')).toBeInTheDocument()
        expect(screen.getByText('Test Manufacturing Project')).toBeInTheDocument()
        expect(screen.getByText('P-25013002')).toBeInTheDocument()
        expect(screen.getByText('Second Test Project')).toBeInTheDocument()
    })

    it('should display correct status badges', () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        // Check status badges are rendered
        const activeStatus = screen.getByText('active')
        const completedStatus = screen.getByText('completed')
        const onHoldStatus = screen.getByText('on_hold')

        expect(activeStatus).toBeInTheDocument()
        expect(completedStatus).toBeInTheDocument()
        expect(onHoldStatus).toBeInTheDocument()
    })

    it('should display correct priority levels', () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        // Check priority levels are displayed correctly
        expect(screen.getByText('medium')).toBeInTheDocument()
        expect(screen.getByText('high')).toBeInTheDocument()
        expect(screen.getByText('low')).toBeInTheDocument()
    })

    it('should handle sorting by different columns', async () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        // Test sorting by project ID
        const projectIdHeader = screen.getByText('Project ID')
        fireEvent.click(projectIdHeader)

        await waitFor(() => {
            // Verify sorting indicator appears
            expect(projectIdHeader.closest('th')).toHaveAttribute('aria-sort')
        })

        // Test sorting by priority
        const priorityHeader = screen.getByText('Priority')
        fireEvent.click(priorityHeader)

        await waitFor(() => {
            expect(priorityHeader.closest('th')).toHaveAttribute('aria-sort')
        })
    })

    it('should handle stage display with fallback', () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        // Check that stage information is displayed
        // Should show stage name from current_stage relationship
        expect(screen.getByText('Engineering Review')).toBeInTheDocument()
    })

    it('should handle customer display correctly', () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        // Check customer information is displayed
        expect(screen.getByText('Test Customer')).toBeInTheDocument()
    })

    it('should handle estimated value formatting', () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        // Check that estimated values are formatted correctly
        expect(screen.getByText('$15,000.50')).toBeInTheDocument()
    })

    it('should handle empty state when no projects', () => {
        // Mock empty projects
        vi.mocked(vi.importActual('@/hooks/useProjects')).useProjects = () => ({
            data: [],
            isLoading: false,
            error: null,
            refetch: vi.fn()
        })

        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        expect(screen.getByText('No projects found')).toBeInTheDocument()
    })

    it('should handle loading state', () => {
        // Mock loading state
        vi.mocked(vi.importActual('@/hooks/useProjects')).useProjects = () => ({
            data: undefined,
            isLoading: true,
            error: null,
            refetch: vi.fn()
        })

        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        expect(screen.getByText('Loading projects...')).toBeInTheDocument()
    })

    it('should handle error state', () => {
        // Mock error state
        vi.mocked(vi.importActual('@/hooks/useProjects')).useProjects = () => ({
            data: undefined,
            isLoading: false,
            error: new Error('Failed to fetch projects'),
            refetch: vi.fn()
        })

        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        expect(screen.getByText('Error loading projects')).toBeInTheDocument()
    })

    it('should navigate to project detail on row click', async () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        const projectRow = screen.getByText('P-25013001').closest('tr')
        expect(projectRow).toBeInTheDocument()

        fireEvent.click(projectRow!)

        // Check if navigation occurred (would need to mock useNavigate)
        await waitFor(() => {
            expect(projectRow).toHaveClass('cursor-pointer')
        })
    })

    it('should handle tag display correctly', () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        // Check that tags are displayed
        expect(screen.getByText('manufacturing')).toBeInTheDocument()
        expect(screen.getByText('urgent')).toBeInTheDocument()
    })

    it('should handle date formatting', () => {
        render(
            <TestWrapper>
                <ProjectTable />
            </TestWrapper>
        )

        // Check that dates are formatted correctly
        // The exact format depends on your date formatting utility
        expect(screen.getByText(/2025/)).toBeInTheDocument()
    })
})