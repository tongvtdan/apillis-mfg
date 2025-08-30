import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectIntakeForm } from '../ProjectIntakeForm'
import { mockProjectFormData } from '@/test/mocks/project-data'
import '@/test/mocks/supabase'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    })

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('ProjectIntakeForm', () => {
    const mockOnSubmit = vi.fn()
    const mockOnCancel = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render all form fields', () => {
        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        // Check required fields
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/contact email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/project title/i)).toBeInTheDocument()

        // Check optional fields
        expect(screen.getByLabelText(/contact phone/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/estimated value/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        // Try to submit without filling required fields
        const submitButton = screen.getByText('Submit Project')
        await user.click(submitButton)

        // Check for validation errors
        await waitFor(() => {
            expect(screen.getByText(/company name is required/i)).toBeInTheDocument()
            expect(screen.getByText(/contact name is required/i)).toBeInTheDocument()
            expect(screen.getByText(/project title is required/i)).toBeInTheDocument()
        })

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        const emailInput = screen.getByLabelText(/contact email/i)
        await user.type(emailInput, 'invalid-email')

        const submitButton = screen.getByText('Submit Project')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
        })
    })

    it('should validate field length limits', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        // Test title length limit (255 characters)
        const longTitle = 'x'.repeat(256)
        const titleInput = screen.getByLabelText(/project title/i)
        await user.type(titleInput, longTitle)

        const submitButton = screen.getByText('Submit Project')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/cannot exceed 255 characters/i)).toBeInTheDocument()
        })
    })

    it('should validate estimated value format', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        const valueInput = screen.getByLabelText(/estimated value/i)
        await user.type(valueInput, 'not-a-number')

        const submitButton = screen.getByText('Submit Project')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/valid number/i)).toBeInTheDocument()
        })
    })

    it('should validate future dates for due date', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        const dueDateInput = screen.getByLabelText(/due date/i)
        await user.type(dueDateInput, '2020-01-01')

        const submitButton = screen.getByText('Submit Project')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/must be in the future/i)).toBeInTheDocument()
        })
    })

    it('should submit valid form data', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        // Fill in all required fields
        await user.type(screen.getByLabelText(/company name/i), mockProjectFormData.companyName)
        await user.type(screen.getByLabelText(/contact name/i), mockProjectFormData.contactName)
        await user.type(screen.getByLabelText(/contact email/i), mockProjectFormData.contactEmail)
        await user.type(screen.getByLabelText(/project title/i), mockProjectFormData.projectTitle)

        // Fill optional fields
        await user.type(screen.getByLabelText(/contact phone/i), mockProjectFormData.contactPhone)
        await user.type(screen.getByLabelText(/description/i), mockProjectFormData.description)
        await user.type(screen.getByLabelText(/estimated value/i), mockProjectFormData.estimatedValue)
        await user.type(screen.getByLabelText(/due date/i), mockProjectFormData.dueDate)
        await user.type(screen.getByLabelText(/notes/i), mockProjectFormData.notes)

        // Select priority
        const prioritySelect = screen.getByLabelText(/priority/i)
        await user.selectOptions(prioritySelect, mockProjectFormData.priority)

        const submitButton = screen.getByText('Submit Project')
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
                companyName: mockProjectFormData.companyName,
                contactName: mockProjectFormData.contactName,
                contactEmail: mockProjectFormData.contactEmail,
                projectTitle: mockProjectFormData.projectTitle,
                priority: mockProjectFormData.priority
            }))
        })
    })

    it('should handle priority selection correctly', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        const prioritySelect = screen.getByLabelText(/priority/i)

        // Check all priority options are available
        expect(screen.getByRole('option', { name: /low/i })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /medium/i })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /high/i })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /urgent/i })).toBeInTheDocument()

        await user.selectOptions(prioritySelect, 'high')
        expect(prioritySelect).toHaveValue('high')
    })

    it('should handle cancel action', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        const cancelButton = screen.getByText('Cancel')
        await user.click(cancelButton)

        expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should handle file upload validation', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        const fileInput = screen.getByLabelText(/attach files/i)

        // Create a mock file that's too large
        const largeFile = new File(['x'.repeat(60 * 1024 * 1024)], 'large.pdf', {
            type: 'application/pdf'
        })

        await user.upload(fileInput, largeFile)

        await waitFor(() => {
            expect(screen.getByText(/cannot exceed 50MB/i)).toBeInTheDocument()
        })
    })

    it('should handle unsupported file types', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        const fileInput = screen.getByLabelText(/attach files/i)

        // Create a mock file with unsupported type
        const unsupportedFile = new File(['content'], 'virus.exe', {
            type: 'application/x-executable'
        })

        await user.upload(fileInput, unsupportedFile)

        await waitFor(() => {
            expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument()
        })
    })

    it('should show loading state during submission', async () => {
        const user = userEvent.setup()

        // Mock a slow submission
        const slowSubmit = vi.fn().mockImplementation(() =>
            new Promise(resolve => setTimeout(resolve, 1000))
        )

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={slowSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        // Fill required fields quickly
        await user.type(screen.getByLabelText(/company name/i), 'Test')
        await user.type(screen.getByLabelText(/contact name/i), 'Test')
        await user.type(screen.getByLabelText(/contact email/i), 'test@test.com')
        await user.type(screen.getByLabelText(/project title/i), 'Test')

        const submitButton = screen.getByText('Submit Project')
        await user.click(submitButton)

        // Check loading state
        expect(screen.getByText('Submitting...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
    })

    it('should reset form after successful submission', async () => {
        const user = userEvent.setup()

        render(
            <TestWrapper>
                <ProjectIntakeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
            </TestWrapper>
        )

        // Fill and submit form
        await user.type(screen.getByLabelText(/company name/i), 'Test Company')
        await user.type(screen.getByLabelText(/contact name/i), 'Test Contact')
        await user.type(screen.getByLabelText(/contact email/i), 'test@test.com')
        await user.type(screen.getByLabelText(/project title/i), 'Test Project')

        const submitButton = screen.getByText('Submit Project')
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled()
        })

        // Check if form is reset
        expect(screen.getByLabelText(/company name/i)).toHaveValue('')
        expect(screen.getByLabelText(/contact name/i)).toHaveValue('')
        expect(screen.getByLabelText(/contact email/i)).toHaveValue('')
        expect(screen.getByLabelText(/project title/i)).toHaveValue('')
    })
})