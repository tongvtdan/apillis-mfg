import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabaseClient } from '@/test/mocks/supabase'
import { mockProject, mockProjects } from '@/test/mocks/project-data'
import { ProjectService } from '../projectService'

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
    supabase: mockSupabaseClient,
}))

describe('ProjectService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getProjects', () => {
        it('should fetch projects with correct query structure', async () => {
            const mockResponse = { data: mockProjects, error: null }
            mockSupabaseClient.from().select().returns = vi.fn().mockResolvedValue(mockResponse)

            const result = await ProjectService.getProjects()

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects')
            expect(result).toEqual(mockProjects)
        })

        it('should handle database errors gracefully', async () => {
            const mockError = { message: 'Database connection failed', code: 'PGRST301' }
            const mockResponse = { data: null, error: mockError }
            mockSupabaseClient.from().select().returns = vi.fn().mockResolvedValue(mockResponse)

            await expect(ProjectService.getProjects()).rejects.toThrow('Database connection failed')
        })

        it('should use correct field selection for performance', async () => {
            const mockResponse = { data: mockProjects, error: null }
            const selectSpy = vi.fn().mockReturnThis()
            mockSupabaseClient.from.mockReturnValue({
                select: selectSpy,
                returns: vi.fn().mockResolvedValue(mockResponse)
            })

            await ProjectService.getProjects()

            expect(selectSpy).toHaveBeenCalledWith(expect.stringContaining('id'))
            expect(selectSpy).toHaveBeenCalledWith(expect.stringContaining('project_id'))
            expect(selectSpy).toHaveBeenCalledWith(expect.stringContaining('title'))
            expect(selectSpy).toHaveBeenCalledWith(expect.stringContaining('status'))
            expect(selectSpy).toHaveBeenCalledWith(expect.stringContaining('priority_level'))
        })
    })

    describe('getProjectById', () => {
        it('should fetch single project with relationships', async () => {
            const mockResponse = { data: mockProject, error: null }
            mockSupabaseClient.from().select().eq().single = vi.fn().mockResolvedValue(mockResponse)

            const result = await ProjectService.getProjectById(mockProject.id)

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects')
            expect(result).toEqual(mockProject)
        })

        it('should include customer and stage relationships', async () => {
            const mockResponse = { data: mockProject, error: null }
            const selectSpy = vi.fn().mockReturnThis()
            const eqSpy = vi.fn().mockReturnThis()

            mockSupabaseClient.from.mockReturnValue({
                select: selectSpy,
                eq: eqSpy,
                single: vi.fn().mockResolvedValue(mockResponse)
            })

            await ProjectService.getProjectById(mockProject.id)

            expect(selectSpy).toHaveBeenCalledWith(expect.stringContaining('customer:contacts'))
            expect(selectSpy).toHaveBeenCalledWith(expect.stringContaining('current_stage:workflow_stages'))
            expect(eqSpy).toHaveBeenCalledWith('id', mockProject.id)
        })

        it('should handle project not found', async () => {
            const mockResponse = { data: null, error: { code: 'PGRST116', message: 'No rows found' } }
            mockSupabaseClient.from().select().eq().single = vi.fn().mockResolvedValue(mockResponse)

            await expect(ProjectService.getProjectById('non-existent-id')).rejects.toThrow('No rows found')
        })
    })

    describe('createProject', () => {
        const newProjectData = {
            title: 'New Test Project',
            description: 'A new project for testing',
            customer_id: 'customer-123',
            status: 'active' as const,
            priority_level: 'medium' as const,
            estimated_value: 15000
        }

        it('should create project with correct data structure', async () => {
            const createdProject = { ...mockProject, ...newProjectData }
            const mockResponse = { data: [createdProject], error: null }

            mockSupabaseClient.from().insert().select = vi.fn().mockResolvedValue(mockResponse)

            const result = await ProjectService.createProject(newProjectData)

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects')
            expect(result).toEqual(createdProject)
        })

        it('should generate project_id automatically', async () => {
            const insertSpy = vi.fn().mockReturnThis()
            const selectSpy = vi.fn().mockResolvedValue({ data: [mockProject], error: null })

            mockSupabaseClient.from.mockReturnValue({
                insert: insertSpy,
                select: selectSpy
            })

            await ProjectService.createProject(newProjectData)

            expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
                project_id: expect.stringMatching(/^P-\d{8}\d{2}$/)
            }))
        })

        it('should handle validation errors', async () => {
            const mockError = {
                code: '23514',
                message: 'Check constraint violation',
                details: 'Invalid status value'
            }
            const mockResponse = { data: null, error: mockError }

            mockSupabaseClient.from().insert().select = vi.fn().mockResolvedValue(mockResponse)

            await expect(ProjectService.createProject({
                ...newProjectData,
                status: 'invalid-status' as any
            })).rejects.toThrow('Check constraint violation')
        })
    })

    describe('updateProject', () => {
        const updateData = {
            title: 'Updated Project Title',
            status: 'completed' as const,
            priority_level: 'high' as const
        }

        it('should update project with correct data', async () => {
            const updatedProject = { ...mockProject, ...updateData }
            const mockResponse = { data: [updatedProject], error: null }

            mockSupabaseClient.from().update().eq().select = vi.fn().mockResolvedValue(mockResponse)

            const result = await ProjectService.updateProject(mockProject.id, updateData)

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects')
            expect(result).toEqual(updatedProject)
        })

        it('should update timestamp automatically', async () => {
            const updateSpy = vi.fn().mockReturnThis()
            const eqSpy = vi.fn().mockReturnThis()
            const selectSpy = vi.fn().mockResolvedValue({ data: [mockProject], error: null })

            mockSupabaseClient.from.mockReturnValue({
                update: updateSpy,
                eq: eqSpy,
                select: selectSpy
            })

            await ProjectService.updateProject(mockProject.id, updateData)

            expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
                ...updateData,
                updated_at: expect.any(String)
            }))
            expect(eqSpy).toHaveBeenCalledWith('id', mockProject.id)
        })

        it('should handle foreign key constraint violations', async () => {
            const mockError = {
                code: '23503',
                message: 'Foreign key violation',
                details: 'Referenced customer does not exist'
            }
            const mockResponse = { data: null, error: mockError }

            mockSupabaseClient.from().update().eq().select = vi.fn().mockResolvedValue(mockResponse)

            await expect(ProjectService.updateProject(mockProject.id, {
                customer_id: 'non-existent-customer'
            })).rejects.toThrow('Foreign key violation')
        })
    })

    describe('deleteProject', () => {
        it('should delete project by id', async () => {
            const mockResponse = { data: null, error: null }
            mockSupabaseClient.from().delete().eq = vi.fn().mockResolvedValue(mockResponse)

            await ProjectService.deleteProject(mockProject.id)

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects')
        })

        it('should handle cascade deletion properly', async () => {
            const deleteSpy = vi.fn().mockReturnThis()
            const eqSpy = vi.fn().mockResolvedValue({ data: null, error: null })

            mockSupabaseClient.from.mockReturnValue({
                delete: deleteSpy,
                eq: eqSpy
            })

            await ProjectService.deleteProject(mockProject.id)

            expect(deleteSpy).toHaveBeenCalled()
            expect(eqSpy).toHaveBeenCalledWith('id', mockProject.id)
        })

        it('should handle deletion of non-existent project', async () => {
            const mockResponse = { data: null, error: { code: 'PGRST116', message: 'No rows found' } }
            mockSupabaseClient.from().delete().eq = vi.fn().mockResolvedValue(mockResponse)

            await expect(ProjectService.deleteProject('non-existent-id')).rejects.toThrow('No rows found')
        })
    })

    describe('updateProjectStage', () => {
        const newStageId = 'new-stage-id'

        it('should update project stage correctly', async () => {
            const updatedProject = {
                ...mockProject,
                current_stage_id: newStageId,
                stage_entered_at: expect.any(String)
            }
            const mockResponse = { data: [updatedProject], error: null }

            mockSupabaseClient.from().update().eq().select = vi.fn().mockResolvedValue(mockResponse)

            const result = await ProjectService.updateProjectStage(mockProject.id, newStageId)

            expect(result.current_stage_id).toBe(newStageId)
            expect(result.stage_entered_at).toBeDefined()
        })

        it('should use correct database field names', async () => {
            const updateSpy = vi.fn().mockReturnThis()
            const eqSpy = vi.fn().mockReturnThis()
            const selectSpy = vi.fn().mockResolvedValue({ data: [mockProject], error: null })

            mockSupabaseClient.from.mockReturnValue({
                update: updateSpy,
                eq: eqSpy,
                select: selectSpy
            })

            await ProjectService.updateProjectStage(mockProject.id, newStageId)

            expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
                current_stage_id: newStageId,
                stage_entered_at: expect.any(String),
                updated_at: expect.any(String)
            }))
        })

        it('should validate stage exists', async () => {
            const mockError = {
                code: '23503',
                message: 'Foreign key violation',
                details: 'Referenced workflow stage does not exist'
            }
            const mockResponse = { data: null, error: mockError }

            mockSupabaseClient.from().update().eq().select = vi.fn().mockResolvedValue(mockResponse)

            await expect(ProjectService.updateProjectStage(mockProject.id, 'invalid-stage-id'))
                .rejects.toThrow('Foreign key violation')
        })
    })
})