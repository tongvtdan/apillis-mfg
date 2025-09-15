import { describe, it, expect } from 'vitest'
import {
    ProjectStatus,
    ProjectPriority,
    Project,
    isValidProjectStatus,
    isValidProjectPriority
} from '../project'

describe('Project Types', () => {
    describe('ProjectStatus', () => {
        it('should include all valid status values', () => {
            const validStatuses: ProjectStatus[] = [
                'draft',
                'inquiry',
                'reviewing',
                'quoted',
                'confirmed',
                'procurement',
                'production',
                'completed',
                'cancelled'
            ]

            validStatuses.forEach(status => {
                expect(isValidProjectStatus(status)).toBe(true)
            })
        })

        it('should reject invalid status values', () => {
            const invalidStatuses = [
                'archived', // This was removed from the enum
                'pending',
                'draft',
                'invalid'
            ]

            invalidStatuses.forEach(status => {
                expect(isValidProjectStatus(status)).toBe(false)
            })
        })
    })

    describe('ProjectPriority', () => {
        it('should include all valid priority values', () => {
            const validPriorities: ProjectPriority[] = [
                'low',
                'medium',
                'high',
                'urgent'
            ]

            validPriorities.forEach(priority => {
                expect(isValidProjectPriority(priority)).toBe(true)
            })
        })

        it('should reject invalid priority values', () => {
            const invalidPriorities = [
                'critical',
                'normal',
                'highest',
                'invalid'
            ]

            invalidPriorities.forEach(priority => {
                expect(isValidProjectPriority(priority)).toBe(false)
            })
        })
    })

    describe('Project Interface', () => {
        it('should have all required database fields', () => {
            const requiredFields = [
                'id',
                'organization_id',
                'project_id',
                'title',
                'status',
                'priority_level',
                'source',
                'created_at',
                'updated_at'
            ]

            // This test ensures our Project interface has all required fields
            // by checking the TypeScript compiler doesn't complain about missing properties
            const mockProject: Pick<Project, typeof requiredFields[number]> = {
                id: 'test-id',
                organization_id: 'test-org-id',
                project_id: 'P-25013001',
                title: 'Test Project',
                status: 'active',
                priority_level: 'medium',
                source: 'portal',
                created_at: '2025-01-30T10:00:00Z',
                updated_at: '2025-01-30T10:00:00Z'
            }

            expect(mockProject).toBeDefined()
            requiredFields.forEach(field => {
                expect(mockProject[field as keyof typeof mockProject]).toBeDefined()
            })
        })

        it('should have optional fields as optional', () => {
            const optionalFields = [
                'description',
                'customer_id',
                'current_stage_id',
                'assigned_to',
                'created_by',
                'estimated_value',
                'tags',
                'metadata',
                'stage_entered_at',
                'project_type',
                'notes'
            ]

            // This test ensures optional fields can be undefined
            const minimalProject: Project = {
                id: 'test-id',
                organization_id: 'test-org-id',
                project_id: 'P-25013001',
                title: 'Test Project',
                status: 'active',
                priority_level: 'medium',
                source: 'portal',
                created_at: '2025-01-30T10:00:00Z',
                updated_at: '2025-01-30T10:00:00Z'
            }

            expect(minimalProject).toBeDefined()
            optionalFields.forEach(field => {
                expect(minimalProject[field as keyof Project]).toBeUndefined()
            })
        })

        it('should support joined relationship fields', () => {
            const projectWithRelations: Project = {
                id: 'test-id',
                organization_id: 'test-org-id',
                project_id: 'P-25013001',
                title: 'Test Project',
                status: 'active',
                priority_level: 'medium',
                source: 'portal',
                created_at: '2025-01-30T10:00:00Z',
                updated_at: '2025-01-30T10:00:00Z',
                customer: {
                    id: 'customer-id',
                    organization_id: 'test-org-id',
                    name: 'Test Customer',
                    email: 'test@example.com',
                    created_at: '2025-01-30T10:00:00Z',
                    updated_at: '2025-01-30T10:00:00Z'
                },
                current_stage: {
                    id: 'stage-id',
                    organization_id: 'test-org-id',
                    name: 'Test Stage',
                    description: 'Test stage description',
                    color: '#3B82F6',
                    order_index: 1,
                    is_active: true,
                    created_at: '2025-01-30T10:00:00Z',
                    updated_at: '2025-01-30T10:00:00Z'
                }
            }

            expect(projectWithRelations.customer).toBeDefined()
            expect(projectWithRelations.current_stage).toBeDefined()
            expect(projectWithRelations.customer?.name).toBe('Test Customer')
            expect(projectWithRelations.current_stage?.name).toBe('Test Stage')
        })
    })
})