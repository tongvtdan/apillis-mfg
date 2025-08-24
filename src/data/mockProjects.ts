import { Project } from '@/types/project';

// Mock project data for development/fallback
export const MOCK_PROJECTS: Project[] = [
    {
        id: '11111111-1111-1111-1111-111111111003',
        project_id: 'P-25082301',
        title: 'Advanced IoT Sensor System',
        description: 'Complete IoT sensor system with wireless communication, data logging, and cloud integration for smart factory monitoring.',
        status: 'inquiry_received',
        priority: 'urgent',
        estimated_value: 750000,
        due_date: '2025-12-15',
        created_at: '2025-08-21T10:00:00Z',
        updated_at: '2025-08-21T10:00:00Z',
        contact_name: 'Sarah Johnson',
        contact_email: 'sarah.johnson@techcorp.com',
        contact_phone: '+1-555-0123',
        notes: 'Rush order for Q4 deployment. Customer requires high precision and reliability.',
        project_type: 'system_build',
        priority_score: 95,
        days_in_stage: 3,
        stage_entered_at: '2025-08-21T10:00:00Z',
        tags: ['IoT', 'Sensors', 'Wireless', 'Industrial'],
        customer_id: '1',
        customer: {
            id: '1',
            name: 'Sarah Johnson',
            company: 'TechCorp Industries',
            email: 'sarah.johnson@techcorp.com',
            phone: '+1-555-0123',
            address: '123 Tech Street, Silicon Valley, CA 94000',
            country: 'USA',
            created_at: '2025-08-01T00:00:00Z',
            updated_at: '2025-08-01T00:00:00Z'
        }
    },
    {
        id: '11111111-1111-1111-1111-111111111001',
        project_id: 'P-25082302',
        title: 'Precision CNC Machined Components',
        description: 'High-precision aluminum components for aerospace applications with tight tolerances.',
        status: 'technical_review',
        priority: 'high',
        estimated_value: 125000,
        due_date: '2025-11-30',
        created_at: '2025-08-20T14:30:00Z',
        updated_at: '2025-08-22T09:15:00Z',
        contact_name: 'Michael Chen',
        contact_email: 'michael.chen@aerospace.com',
        contact_phone: '+1-555-0124',
        notes: 'Aerospace grade materials required. AS9100 certification needed.',
        project_type: 'manufacturing',
        priority_score: 85,
        days_in_stage: 5,
        stage_entered_at: '2025-08-22T09:15:00Z',
        tags: ['CNC', 'Aerospace', 'Aluminum', 'Precision'],
        customer_id: '2',
        customer: {
            id: '2',
            name: 'Michael Chen',
            company: 'AeroSpace Solutions',
            email: 'michael.chen@aerospace.com',
            phone: '+1-555-0124',
            address: '456 Aviation Blvd, Seattle, WA 98101',
            country: 'USA',
            created_at: '2025-08-15T00:00:00Z',
            updated_at: '2025-08-15T00:00:00Z'
        }
    },
    {
        id: '11111111-1111-1111-1111-111111111002',
        project_id: 'P-25082303',
        title: 'Custom Steel Fabrication',
        description: 'Structural steel fabrication for industrial equipment housing.',
        status: 'supplier_rfq_sent',
        priority: 'medium',
        estimated_value: 85000,
        due_date: '2025-10-15',
        created_at: '2025-08-19T11:20:00Z',
        updated_at: '2025-08-23T16:45:00Z',
        contact_name: 'Lisa Rodriguez',
        contact_email: 'lisa.rodriguez@industrial.com',
        contact_phone: '+1-555-0125',
        notes: 'Standard structural steel. Powder coating finish required.',
        project_type: 'fabrication',
        priority_score: 65,
        days_in_stage: 2,
        stage_entered_at: '2025-08-23T16:45:00Z',
        tags: ['Steel', 'Fabrication', 'Industrial', 'Coating'],
        customer_id: '3',
        customer: {
            id: '3',
            name: 'Lisa Rodriguez',
            company: 'Industrial Equipment Corp',
            email: 'lisa.rodriguez@industrial.com',
            phone: '+1-555-0125',
            address: '789 Industrial Way, Detroit, MI 48201',
            country: 'USA',
            created_at: '2025-08-10T00:00:00Z',
            updated_at: '2025-08-10T00:00:00Z'
        }
    },
    {
        id: '11111111-1111-1111-1111-111111111004',
        project_id: 'P-25082304',
        title: 'Electronic Enclosure Assembly',
        description: 'Weather-resistant electronic enclosures for outdoor monitoring systems.',
        status: 'quoted',
        priority: 'high',
        estimated_value: 95000,
        due_date: '2025-09-30',
        created_at: '2025-08-18T08:45:00Z',
        updated_at: '2025-08-24T13:20:00Z',
        contact_name: 'David Kim',
        contact_email: 'david.kim@monitoring.com',
        contact_phone: '+1-555-0126',
        notes: 'IP67 rating required. UV-resistant materials.',
        project_type: 'system_build',
        priority_score: 80,
        days_in_stage: 1,
        stage_entered_at: '2025-08-24T13:20:00Z',
        tags: ['Electronics', 'Enclosure', 'Weather-resistant', 'IP67'],
        customer_id: '4',
        customer: {
            id: '4',
            name: 'David Kim',
            company: 'Environmental Monitoring Systems',
            email: 'david.kim@monitoring.com',
            phone: '+1-555-0126',
            address: '321 Green Tech Ave, Portland, OR 97201',
            country: 'USA',
            created_at: '2025-08-12T00:00:00Z',
            updated_at: '2025-08-12T00:00:00Z'
        }
    },
    {
        id: '11111111-1111-1111-1111-111111111005',
        project_id: 'P-25082305',
        title: 'Automotive Bracket Manufacturing',
        description: 'High-volume production of automotive mounting brackets.',
        status: 'in_production',
        priority: 'medium',
        estimated_value: 180000,
        due_date: '2025-08-30',
        created_at: '2025-07-15T12:00:00Z',
        updated_at: '2025-08-20T10:30:00Z',
        contact_name: 'Jennifer Walsh',
        contact_email: 'jennifer.walsh@automotive.com',
        contact_phone: '+1-555-0127',
        notes: 'TS16949 certification required. High volume production run.',
        project_type: 'manufacturing',
        priority_score: 70,
        days_in_stage: 7,
        stage_entered_at: '2025-08-20T10:30:00Z',
        tags: ['Automotive', 'High-volume', 'Brackets', 'TS16949'],
        customer_id: '5',
        customer: {
            id: '5',
            name: 'Jennifer Walsh',
            company: 'AutoParts Manufacturing',
            email: 'jennifer.walsh@automotive.com',
            phone: '+1-555-0127',
            address: '654 Motor City Blvd, Detroit, MI 48202',
            country: 'USA',
            created_at: '2025-07-01T00:00:00Z',
            updated_at: '2025-07-01T00:00:00Z'
        }
    }
];

// Helper function to get mock project by ID
export const getMockProjectById = (id: string): Project | null => {
    return MOCK_PROJECTS.find(project => project.id === id) || null;
};

// Helper function to get all mock projects
export const getAllMockProjects = (): Project[] => {
    return MOCK_PROJECTS;
};