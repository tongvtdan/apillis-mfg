import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client.js'
import { ProjectTable } from '@/components/project/ProjectTable'
import { Project } from '@/types/project'

// Integration tests that use real database data
describe('Project Components Integration Tests', () => {
    let queryClient: QueryClient
    let realProjects: Project[]

    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    )

    beforeEach(async () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        })

        // Fetch real projects from database
        const { data: projects, error } = await supabase
            .from('projects')
            .select(`
        *,
        customer:contacts(*),
        current_stage:workflow_stages(*)
      `)
            .limit(5) // Limit for test performance

        if (error) {
            console.error('Failed to fetch projects for integration test:', error)
            realProjects = []
        } else {
            realProjects = projects || []
        }
    })

    it('should render ProjectTable with real database data', async () => {
        // Mock the useProjects hook to return real data
        vi.doMock('@/hooks/useProjects', () => ({
            useProjects: () => ({
                data: realProjects,
                isLoading: false,
                error: null,
                refetch: vi.fn()
            })
        }))

        vi.doMock('@/hooks/usePermissions', () => ({
            usePermissions: () => ({
                canEditProjects: true,
                canDeleteProjects: true,
                canViewProjects: true
            })
        }))

        const { ProjectTable: MockedProjectTable } = await import('@/components/project/ProjectTable')

        render(
            <TestWrapper>
                <MockedProjectTable />
            </TestWrapper>
        )

        if (realProjects.length > 0) {
            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByText('Project ID')).toBeInTheDocument()
            })

            // Verify real project data is displayed
            realProjects.forEach(project => {
                expect(screen.getByText(project.project_id)).toBeInTheDocument()
                expect(screen.getByText(project.title)).toBeInTheDocument()
                expect(screen.getByText(project.status)).toBeInTheDocument()
                expect(screen.getByText(project.priority_level)).toBeInTheDocument()
            })

            // Verify customer relationships are displayed
            realProjects.forEach(project => {
                if (project.customer) {
                    expect(screen.getByText(project.customer.company_name || project.customer.contact_name || 'Unknown')).toBeInTheDocument()
                }
            })

            // Verify stage relationships are displayed
            realProjects.forEach(project => {
                if (project.current_stage) {
                    expect(screen.getByText(project.current_stage.name)).toBeInTheDocument()
                }
            })
        } else {
            // If no projects, should show empty state
            await waitFor(() => {
                expect(screen.getByText('No projects found')).toBeInTheDocument()
            })
        }

        vi.doUnmock('@/hooks/useProjects')
        vi.doUnmock('@/hooks/usePermissions')
    })

    it('should validate project data integrity', async () => {
        // Fetch projects and validate data structure
        const { data: projects, error } = await supabase
            .from('projects')
            .select(`
        *,
        customer:contacts(*),
        current_stage:workflow_stages(*)
      `)

        expect(error).toBeNull()
        expect(projects).toBeDefined()

        if (projects && projects.length > 0) {
            projects.forEach((project: Project) => {
                // Validate required fields
                expect(project.id).toBeDefined()
                expect(typeof project.id).toBe('string')

                expect(project.organization_id).toBeDefined()
                expect(typeof project.organization_id).toBe('string')

                expect(project.project_id).toBeDefined()
                expect(typeof project.project_id).toBe('string')
                expect(project.project_id).toMatch(/^P-\d{8}\d{2}$/)

                expect(project.title).toBeDefined()
                expect(typeof project.title).toBe('string')
                expect(project.title.length).toBeGreaterThan(0)
                expect(project.title.length).toBeLessThanOrEqual(255)

                expect(project.status).toBeDefined()
                expect(['active', 'on_hold', 'delayed', 'cancelled', 'completed']).toContain(project.status)

                expect(project.priority_level).toBeDefined()
                expect(['low', 'medium', 'high', 'urgent']).toContain(project.priority_level)

                expect(project.created_at).toBeDefined()
                expect(typeof project.created_at).toBe('string')
                expect(new Date(project.created_at).toString()).not.toBe('Invalid Date')

                expect(project.updated_at).toBeDefined()
                expect(typeof project.updated_at).toBe('string')
                expect(new Date(project.updated_at).toString()).not.toBe('Invalid Date')

                // Validate optional fields when present
                if (project.description !== null && project.description !== undefined) {
                    expect(typeof project.description).toBe('string')
                }

                if (project.estimated_value !== null && project.estimated_value !== undefined) {
                    expect(typeof project.estimated_value).toBe('number')
                    expect(project.estimated_value).toBeGreaterThanOrEqual(0)
                }

                if (project.tags !== null && project.tags !== undefined) {
                    expect(Array.isArray(project.tags)).toBe(true)
                    project.tags.forEach(tag => {
                        expect(typeof tag).toBe('string')
                    })
                }

                if (project.metadata !== null && project.metadata !== undefined) {
                    expect(typeof project.metadata).toBe('object')
                }

                // Validate relationships
                if (project.customer_id) {
                    expect(project.customer).toBeDefined()
                    expect(project.customer.id).toBe(project.customer_id)
                    expect(project.customer.company_name || project.customer.contact_name).toBeDefined()
                }

                if (project.current_stage_id) {
                    expect(project.current_stage).toBeDefined()
                    expect(project.current_stage.id).toBe(project.current_stage_id)
                    expect(project.current_stage.name).toBeDefined()
                    expect(typeof project.current_stage.order_index).toBe('number')
                }
            })
        }
    })

    it('should validate database constraints are enforced', async () => {
        // Test that database constraints prevent invalid data
        const invalidProject = {
            organization_id: '02e227d3-7068-421e-ac68-631b2e7129cc',
            project_id: 'INVALID-FORMAT', // Should fail project_id format
            title: '', // Should fail if title is required
            status: 'invalid_status', // Should fail enum constraint
            priority_level: 'invalid_priority' // Should fail enum constraint
        }

        const { data, error } = await supabase
            .from('projects')
            .insert(invalidProject)
            .select()

        // Should fail due to constraint violations
        expect(error).toBeDefined()
        expect(data).toBeNull()
    })

    it('should validate project queries use correct field names', async () => {
        // Test that all expected fields can be queried
        const { data: projects, error } = await supabase
            .from('projects')
            .select(`
        id,
        organization_id,
        project_id,
        title,
        description,
        customer_id,
        current_stage_id,
        status,
        priority_level,
        source,
        assigned_to,
        created_by,
        estimated_value,
        tags,
        metadata,
        stage_entered_at,
        project_type,
        notes,
        created_at,
        updated_at
      `)
            .limit(1)

        expect(error).toBeNull()
        expect(projects).toBeDefined()

        if (projects && projects.length > 0) {
            const project = projects[0]

            // Verify all fields are accessible (no undefined due to field name mismatches)
            const expectedFields = [
                'id', 'organization_id', 'project_id', 'title', 'status',
                'priority_level', 'source', 'created_at', 'updated_at'
            ]

            expectedFields.forEach(field => {
                expect(project).toHaveProperty(field)
                expect(project[field]).toBeDefined()
            })
        }
    })

    it('should validate project updates work with correct field names', async () => {
        // Get a test project
        const { data: projects, error: fetchError } = await supabase
            .from('projects')
            .select('id, title, status, priority_level, updated_at')
            .limit(1)

        expect(fetchError).toBeNull()

        if (projects && projects.length > 0) {
            const project = projects[0]
            const originalTitle = project.title

            // Test update with correct field names
            const { data: updatedProject, error: updateError } = await supabase
                .from('projects')
                .update({
                    title: `${originalTitle} - Updated`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', project.id)
                .select()
                .single()

            expect(updateError).toBeNull()
            expect(updatedProject).toBeDefined()
            expect(updatedProject.title).toBe(`${originalTitle} - Updated`)

            // Restore original title
            await supabase
                .from('projects')
                .update({
                    title: originalTitle,
                    updated_at: new Date().toISOString()
                })
                .eq('id', project.id)
        }
    })

    it('should validate stage transitions work correctly', async () => {
        // Get a project and available stages
        const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('id, current_stage_id')
            .limit(1)

        const { data: stages, error: stageError } = await supabase
            .from('workflow_stages')
            .select('id, name')
            .eq('is_active', true)
            .limit(2)

        expect(projectError).toBeNull()
        expect(stageError).toBeNull()

        if (projects && projects.length > 0 && stages && stages.length >= 2) {
            const project = projects[0]
            const originalStageId = project.current_stage_id
            const newStageId = stages.find(s => s.id !== originalStageId)?.id

            if (newStageId) {
                // Test stage transition
                const { data: updatedProject, error: updateError } = await supabase
                    .from('projects')
                    .update({
                        current_stage_id: newStageId,
                        stage_entered_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', project.id)
                    .select('id, current_stage_id, stage_entered_at')
                    .single()

                expect(updateError).toBeNull()
                expect(updatedProject.current_stage_id).toBe(newStageId)
                expect(updatedProject.stage_entered_at).toBeDefined()

                // Restore original stage
                if (originalStageId) {
                    await supabase
                        .from('projects')
                        .update({
                            current_stage_id: originalStageId,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', project.id)
                }
            }
        }
    })
})