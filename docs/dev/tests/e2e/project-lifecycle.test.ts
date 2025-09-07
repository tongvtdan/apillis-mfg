import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { supabase } from '@/integrations/supabase/client'
import { Project, ProjectStatus, ProjectPriority } from '@/types/project'

// This test suite validates the complete project lifecycle with real database operations
describe('Project Lifecycle E2E Tests', () => {
    let testProjectId: string
    let testCustomerId: string
    let testStageId: string

    beforeAll(async () => {
        // Set up test data - create a test customer and workflow stage
        const { data: customer, error: customerError } = await supabase
            .from('contacts')
            .insert({
                organization_id: '02e227d3-7068-421e-ac68-631b2e7129cc',
                type: 'customer',
                company_name: 'E2E Test Company',
                contact_name: 'Test Contact',
                email: 'test@e2e.com',
                phone: '+1234567890',
                is_active: true
            })
            .select()
            .single()

        if (customerError) {
            console.error('Failed to create test customer:', customerError)
            throw customerError
        }

        testCustomerId = customer.id

        // Get an existing workflow stage
        const { data: stage, error: stageError } = await supabase
            .from('workflow_stages')
            .select('id')
            .eq('is_active', true)
            .limit(1)
            .single()

        if (stageError) {
            console.error('Failed to get workflow stage:', stageError)
            throw stageError
        }

        testStageId = stage.id
    })

    afterAll(async () => {
        // Clean up test data
        if (testProjectId) {
            await supabase.from('projects').delete().eq('id', testProjectId)
        }
        if (testCustomerId) {
            await supabase.from('contacts').delete().eq('id', testCustomerId)
        }
    })

    it('should complete full project lifecycle', async () => {
        // 1. Create a new project
        const projectData = {
            organization_id: '02e227d3-7068-421e-ac68-631b2e7129cc',
            project_id: `P-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}99`,
            title: 'E2E Test Project',
            description: 'End-to-end test project for validation',
            customer_id: testCustomerId,
            current_stage_id: testStageId,
            status: 'active' as ProjectStatus,
            priority_level: 'medium' as ProjectPriority,
            source: 'portal',
            estimated_value: 25000.50,
            tags: ['e2e', 'test'],
            metadata: { test: true },
            project_type: 'manufacturing',
            notes: 'Test project notes'
        }

        const { data: createdProject, error: createError } = await supabase
            .from('projects')
            .insert(projectData)
            .select(`
        *,
        customer:contacts(*),
        current_stage:workflow_stages(*)
      `)
            .single()

        expect(createError).toBeNull()
        expect(createdProject).toBeDefined()
        expect(createdProject.title).toBe(projectData.title)
        expect(createdProject.status).toBe(projectData.status)
        expect(createdProject.priority_level).toBe(projectData.priority_level)
        expect(createdProject.customer_id).toBe(testCustomerId)
        expect(createdProject.current_stage_id).toBe(testStageId)

        testProjectId = createdProject.id

        // 2. Verify project can be retrieved with relationships
        const { data: retrievedProject, error: retrieveError } = await supabase
            .from('projects')
            .select(`
        *,
        customer:contacts(*),
        current_stage:workflow_stages(*)
      `)
            .eq('id', testProjectId)
            .single()

        expect(retrieveError).toBeNull()
        expect(retrievedProject).toBeDefined()
        expect(retrievedProject.customer).toBeDefined()
        expect(retrievedProject.customer.company_name).toBe('E2E Test Company')
        expect(retrievedProject.current_stage).toBeDefined()

        // 3. Update project status
        const { data: updatedProject, error: updateError } = await supabase
            .from('projects')
            .update({
                status: 'on_hold' as ProjectStatus,
                priority_level: 'high' as ProjectPriority,
                updated_at: new Date().toISOString()
            })
            .eq('id', testProjectId)
            .select()
            .single()

        expect(updateError).toBeNull()
        expect(updatedProject.status).toBe('on_hold')
        expect(updatedProject.priority_level).toBe('high')

        // 4. Test stage transition
        const { data: stages, error: stagesError } = await supabase
            .from('workflow_stages')
            .select('id')
            .eq('is_active', true)
            .neq('id', testStageId)
            .limit(1)

        if (!stagesError && stages.length > 0) {
            const newStageId = stages[0].id

            const { data: stageUpdatedProject, error: stageUpdateError } = await supabase
                .from('projects')
                .update({
                    current_stage_id: newStageId,
                    stage_entered_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', testProjectId)
                .select()
                .single()

            expect(stageUpdateError).toBeNull()
            expect(stageUpdatedProject.current_stage_id).toBe(newStageId)
            expect(stageUpdatedProject.stage_entered_at).toBeDefined()
        }

        // 5. Test project completion
        const { data: completedProject, error: completeError } = await supabase
            .from('projects')
            .update({
                status: 'completed' as ProjectStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', testProjectId)
            .select()
            .single()

        expect(completeError).toBeNull()
        expect(completedProject.status).toBe('completed')
    })

    it('should validate all 17 sample projects load correctly', async () => {
        const { data: projects, error } = await supabase
            .from('projects')
            .select(`
        *,
        customer:contacts(*),
        current_stage:workflow_stages(*)
      `)
            .order('created_at', { ascending: true })

        expect(error).toBeNull()
        expect(projects).toBeDefined()
        expect(Array.isArray(projects)).toBe(true)

        // Verify we have the expected number of sample projects (at least 17)
        expect(projects.length).toBeGreaterThanOrEqual(17)

        // Validate each project has required fields
        projects.forEach((project: Project, index: number) => {
            expect(project.id).toBeDefined()
            expect(project.organization_id).toBeDefined()
            expect(project.project_id).toBeDefined()
            expect(project.title).toBeDefined()
            expect(project.status).toBeDefined()
            expect(project.priority_level).toBeDefined()
            expect(project.created_at).toBeDefined()
            expect(project.updated_at).toBeDefined()

            // Validate enum values
            expect(['active', 'on_hold', 'delayed', 'cancelled', 'completed']).toContain(project.status)
            expect(['low', 'medium', 'high', 'urgent']).toContain(project.priority_level)

            // Validate project_id format (P-YYYYMMDDXX)
            expect(project.project_id).toMatch(/^P-\d{8}\d{2}$/)

            // If customer_id exists, customer relationship should be loaded
            if (project.customer_id) {
                expect(project.customer).toBeDefined()
                expect(project.customer.id).toBe(project.customer_id)
            }

            // If current_stage_id exists, stage relationship should be loaded
            if (project.current_stage_id) {
                expect(project.current_stage).toBeDefined()
                expect(project.current_stage.id).toBe(project.current_stage_id)
            }
        })
    })

    it('should validate project creation with all field types', async () => {
        const comprehensiveProjectData = {
            organization_id: '02e227d3-7068-421e-ac68-631b2e7129cc',
            project_id: `P-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}98`,
            title: 'Comprehensive Field Test Project',
            description: 'Testing all field types and constraints',
            customer_id: testCustomerId,
            current_stage_id: testStageId,
            status: 'active' as ProjectStatus,
            priority_level: 'urgent' as ProjectPriority,
            source: 'api',
            estimated_value: 999999.99, // Test decimal precision
            tags: ['comprehensive', 'field-test', 'validation'],
            metadata: {
                complex_object: {
                    nested: true,
                    array: [1, 2, 3],
                    string: 'test'
                }
            },
            project_type: 'system_build',
            notes: 'Comprehensive test notes with special characters: àáâãäåæçèéêë',
            assigned_to: '253d6f3d-d962-43a4-ad25-b85348b58902',
            created_by: '253d6f3d-d962-43a4-ad25-b85348b58902'
        }

        const { data: project, error } = await supabase
            .from('projects')
            .insert(comprehensiveProjectData)
            .select()
            .single()

        expect(error).toBeNull()
        expect(project).toBeDefined()

        // Validate all fields were stored correctly
        expect(project.title).toBe(comprehensiveProjectData.title)
        expect(project.description).toBe(comprehensiveProjectData.description)
        expect(project.status).toBe(comprehensiveProjectData.status)
        expect(project.priority_level).toBe(comprehensiveProjectData.priority_level)
        expect(project.estimated_value).toBe(comprehensiveProjectData.estimated_value)
        expect(project.tags).toEqual(comprehensiveProjectData.tags)
        expect(project.metadata).toEqual(comprehensiveProjectData.metadata)
        expect(project.project_type).toBe(comprehensiveProjectData.project_type)
        expect(project.notes).toBe(comprehensiveProjectData.notes)

        // Clean up
        await supabase.from('projects').delete().eq('id', project.id)
    })

    it('should validate constraint violations are handled properly', async () => {
        // Test invalid status
        const invalidStatusData = {
            organization_id: '02e227d3-7068-421e-ac68-631b2e7129cc',
            project_id: `P-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}97`,
            title: 'Invalid Status Test',
            status: 'invalid_status', // This should fail
            priority_level: 'medium'
        }

        const { data, error: statusError } = await supabase
            .from('projects')
            .insert(invalidStatusData)
            .select()

        expect(statusError).toBeDefined()
        expect(statusError.code).toBe('23514') // Check constraint violation
        expect(data).toBeNull()

        // Test invalid priority
        const invalidPriorityData = {
            organization_id: '02e227d3-7068-421e-ac68-631b2e7129cc',
            project_id: `P-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}96`,
            title: 'Invalid Priority Test',
            status: 'active',
            priority_level: 'invalid_priority' // This should fail
        }

        const { data: data2, error: priorityError } = await supabase
            .from('projects')
            .insert(invalidPriorityData)
            .select()

        expect(priorityError).toBeDefined()
        expect(priorityError.code).toBe('23514') // Check constraint violation
        expect(data2).toBeNull()

        // Test foreign key constraint (invalid customer_id)
        const invalidCustomerData = {
            organization_id: '02e227d3-7068-421e-ac68-631b2e7129cc',
            project_id: `P-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}95`,
            title: 'Invalid Customer Test',
            status: 'active',
            priority_level: 'medium',
            customer_id: '00000000-0000-0000-0000-000000000000' // Non-existent customer
        }

        const { data: data3, error: customerError } = await supabase
            .from('projects')
            .insert(invalidCustomerData)
            .select()

        expect(customerError).toBeDefined()
        expect(customerError.code).toBe('23503') // Foreign key constraint violation
        expect(data3).toBeNull()
    })

    it('should validate workflow progression works with actual data', async () => {
        // Get all active workflow stages in order
        const { data: stages, error: stagesError } = await supabase
            .from('workflow_stages')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true })

        expect(stagesError).toBeNull()
        expect(stages).toBeDefined()
        expect(stages.length).toBeGreaterThan(0)

        // Create a test project
        const workflowTestData = {
            organization_id: '02e227d3-7068-421e-ac68-631b2e7129cc',
            project_id: `P-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}94`,
            title: 'Workflow Progression Test',
            status: 'active' as ProjectStatus,
            priority_level: 'medium' as ProjectPriority,
            current_stage_id: stages[0].id // Start with first stage
        }

        const { data: project, error: createError } = await supabase
            .from('projects')
            .insert(workflowTestData)
            .select()
            .single()

        expect(createError).toBeNull()
        expect(project.current_stage_id).toBe(stages[0].id)

        // Test progression through stages
        for (let i = 1; i < Math.min(stages.length, 3); i++) {
            const { data: updatedProject, error: updateError } = await supabase
                .from('projects')
                .update({
                    current_stage_id: stages[i].id,
                    stage_entered_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', project.id)
                .select(`
          *,
          current_stage:workflow_stages(*)
        `)
                .single()

            expect(updateError).toBeNull()
            expect(updatedProject.current_stage_id).toBe(stages[i].id)
            expect(updatedProject.current_stage.name).toBe(stages[i].name)
            expect(updatedProject.stage_entered_at).toBeDefined()
        }

        // Clean up
        await supabase.from('projects').delete().eq('id', project.id)
    })
})