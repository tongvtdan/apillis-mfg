import { Project, ProjectStatus, ProjectPriority } from '@/types/project'

export const mockProject: Project = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    organization_id: '123e4567-e89b-12d3-a456-426614174001',
    project_id: 'P-25013001',
    title: 'Test Manufacturing Project',
    description: 'A test project for manufacturing components',
    customer_id: '123e4567-e89b-12d3-a456-426614174002',
    current_stage_id: '123e4567-e89b-12d3-a456-426614174003',
    status: 'active' as ProjectStatus,
    priority_level: 'medium' as ProjectPriority,
    source: 'portal',
    assigned_to: '123e4567-e89b-12d3-a456-426614174004',
    created_by: '123e4567-e89b-12d3-a456-426614174005',
    estimated_value: 15000.50,
    tags: ['manufacturing', 'urgent'],
    metadata: { department: 'engineering' },
    stage_entered_at: '2025-01-30T10:00:00Z',
    project_type: 'manufacturing',
    notes: 'Test project notes',
    created_at: '2025-01-30T09:00:00Z',
    updated_at: '2025-01-30T10:00:00Z',
    customer: {
        id: '123e4567-e89b-12d3-a456-426614174002',
        organization_id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '+1234567890',
        company: 'Test Company',
        position: 'Manager',
        created_at: '2025-01-30T08:00:00Z',
        updated_at: '2025-01-30T08:00:00Z'
    },
    current_stage: {
        id: '123e4567-e89b-12d3-a456-426614174003',
        organization_id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Engineering Review',
        description: 'Engineering review stage',
        color: '#3B82F6',
        order_index: 2,
        is_active: true,
        created_at: '2025-01-30T07:00:00Z',
        updated_at: '2025-01-30T07:00:00Z'
    }
}

export const mockProjects: Project[] = [
    mockProject,
    {
        ...mockProject,
        id: '123e4567-e89b-12d3-a456-426614174010',
        project_id: 'P-25013002',
        title: 'Second Test Project',
        status: 'completed' as ProjectStatus,
        priority_level: 'high' as ProjectPriority,
    },
    {
        ...mockProject,
        id: '123e4567-e89b-12d3-a456-426614174020',
        project_id: 'P-25013003',
        title: 'Third Test Project',
        status: 'on_hold' as ProjectStatus,
        priority_level: 'low' as ProjectPriority,
    }
]

export const mockProjectFormData = {
    companyName: 'Test Company',
    contactName: 'John Doe',
    contactEmail: 'john@test.com',
    contactPhone: '+1234567890',
    projectTitle: 'New Test Project',
    description: 'Description for new test project',
    priority: 'medium' as const,
    estimatedValue: '25000.00',
    dueDate: '2025-12-31',
    notes: 'Additional notes'
}

export const mockProjectEditData = {
    title: 'Updated Project Title',
    description: 'Updated project description',
    status: 'active' as ProjectStatus,
    priority_level: 'high' as ProjectPriority,
    estimated_value: 30000.75,
    project_type: 'manufacturing',
    notes: 'Updated notes',
    tags: ['updated', 'priority']
}