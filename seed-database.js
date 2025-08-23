import { supabase } from './src/integrations/supabase/client';

// Sample data for seeding the database
const sampleCustomers = [
    {
        id: '01234567-1234-1234-1234-123456789001',
        name: 'Sarah Johnson',
        company: 'TechCorp Industries',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0101',
        address: '123 Innovation Drive, Austin, TX 78701',
        country: 'USA'
    },
    {
        id: '01234567-1234-1234-1234-123456789002',
        name: 'Michael Chen',
        company: 'Quantum Systems Ltd',
        email: 'michael.chen@quantumsys.com',
        phone: '+1-555-0102',
        address: '456 Silicon Valley Blvd, San Jose, CA 95110',
        country: 'USA'
    },
    {
        id: '01234567-1234-1234-1234-123456789003',
        name: 'Emma Rodriguez',
        company: 'BioTech Solutions',
        email: 'emma.rodriguez@biotechsol.com',
        phone: '+1-555-0103',
        address: '789 Research Park Dr, Cambridge, MA 02139',
        country: 'USA'
    },
    {
        id: '01234567-1234-1234-1234-123456789004',
        name: 'James Wilson',
        company: 'Precision Manufacturing Co',
        email: 'james.wilson@precisionmfg.com',
        phone: '+1-555-0104',
        address: '321 Industrial Way, Detroit, MI 48201',
        country: 'USA'
    },
    {
        id: '01234567-1234-1234-1234-123456789005',
        name: 'Lisa Thompson',
        company: 'Global Assembly Corp',
        email: 'lisa.thompson@globalassembly.com',
        phone: '+1-555-0105',
        address: '654 Factory Lane, Cleveland, OH 44114',
        country: 'USA'
    },
    {
        id: '01234567-1234-1234-1234-123456789006',
        name: 'David Kim',
        company: 'Advanced Automation Inc',
        email: 'david.kim@advancedauto.com',
        phone: '+1-555-0106',
        address: '987 Automation Blvd, Pittsburgh, PA 15201',
        country: 'USA'
    },
    {
        id: '01234567-1234-1234-1234-123456789007',
        name: 'Dr. Maria Garcia',
        company: 'MedDevice Innovations',
        email: 'maria.garcia@meddevice.com',
        phone: '+1-555-0107',
        address: '159 Medical Center Dr, Houston, TX 77030',
        country: 'USA'
    },
    {
        id: '01234567-1234-1234-1234-123456789008',
        name: 'Robert Brown',
        company: 'Healthcare Systems LLC',
        email: 'robert.brown@healthsys.com',
        phone: '+1-555-0108',
        address: '753 Hospital Ave, Minneapolis, MN 55401',
        country: 'USA'
    },
    {
        id: '01234567-1234-1234-1234-123456789009',
        name: 'Hans Mueller',
        company: 'European Engineering GmbH',
        email: 'hans.mueller@euroeng.de',
        phone: '+49-30-12345678',
        address: 'Berliner Str. 123, 10115 Berlin',
        country: 'Germany'
    },
    {
        id: '01234567-1234-1234-1234-123456789010',
        name: 'Yuki Tanaka',
        company: 'Tokyo Precision Ltd',
        email: 'yuki.tanaka@tokyoprecision.co.jp',
        phone: '+81-3-1234-5678',
        address: '1-2-3 Shibuya, Tokyo 150-0002',
        country: 'Japan'
    },
    {
        id: '01234567-1234-1234-1234-123456789011',
        name: 'Alex Rivera',
        company: 'Innovation Startup',
        email: 'alex.rivera@innovationstartup.com',
        phone: '+1-555-0111',
        address: '246 Startup Alley, San Francisco, CA 94102',
        country: 'USA'
    },
    {
        id: '01234567-1234-1234-1234-123456789012',
        name: 'Sophie Martin',
        company: 'Green Energy Solutions',
        email: 'sophie.martin@greenenergy.com',
        phone: '+1-555-0112',
        address: '135 Renewable Way, Portland, OR 97201',
        country: 'USA'
    }
];

const sampleProjects = [
    {
        id: '11111111-1111-1111-1111-111111111001',
        project_id: 'P-25082301',
        title: 'Advanced IoT Sensor System',
        description: 'Complete IoT sensor system with wireless communication, data logging, and cloud integration for smart factory monitoring.',
        customer_id: '01234567-1234-1234-1234-123456789001',
        status: 'inquiry_received',
        priority: 'urgent',
        priority_score: 95,
        project_type: 'system_build',
        estimated_value: 750000,
        due_date: '2025-12-15T00:00:00Z',
        days_in_stage: 2,
        stage_entered_at: '2025-08-21T10:00:00Z',
        contact_name: 'Sarah Johnson',
        contact_email: 'sarah.johnson@techcorp.com',
        contact_phone: '+1-555-0101',
        tags: ['IoT', 'Sensors', 'Wireless', 'Cloud'],
        notes: 'Rush order for Q4 deployment'
    },
    {
        id: '11111111-1111-1111-1111-111111111002',
        project_id: 'P-25082302',
        title: 'Precision CNC Machined Parts',
        description: 'High-precision CNC machined components for aerospace application with tight tolerances ±0.001".',
        customer_id: '01234567-1234-1234-1234-123456789004',
        status: 'technical_review',
        priority: 'high',
        priority_score: 85,
        project_type: 'fabrication',
        estimated_value: 125000,
        due_date: '2025-10-30T00:00:00Z',
        days_in_stage: 5,
        stage_entered_at: '2025-08-18T14:30:00Z',
        contact_name: 'James Wilson',
        contact_email: 'james.wilson@precisionmfg.com',
        contact_phone: '+1-555-0104',
        tags: ['CNC', 'Aerospace', 'Precision'],
        notes: 'Critical components for aircraft assembly'
    },
    {
        id: '11111111-1111-1111-1111-111111111003',
        project_id: 'P-25082303',
        title: 'Medical Device Assembly Line',
        description: 'Automated assembly line for medical device manufacturing with FDA compliance requirements.',
        customer_id: '01234567-1234-1234-1234-123456789007',
        status: 'supplier_rfq_sent',
        priority: 'urgent',
        priority_score: 90,
        project_type: 'manufacturing',
        estimated_value: 2500000,
        due_date: '2025-11-20T00:00:00Z',
        days_in_stage: 8,
        stage_entered_at: '2025-08-15T09:15:00Z',
        contact_name: 'Dr. Maria Garcia',
        contact_email: 'maria.garcia@meddevice.com',
        contact_phone: '+1-555-0107',
        tags: ['Medical', 'Assembly', 'FDA', 'Automation'],
        notes: 'FDA validation required'
    },
    {
        id: '11111111-1111-1111-1111-111111111004',
        project_id: 'P-25082304',
        title: 'Quantum Computing Enclosure',
        description: 'Custom enclosure system for quantum computing hardware with thermal management and EMI shielding.',
        customer_id: '01234567-1234-1234-1234-123456789002',
        status: 'quoted',
        priority: 'high',
        priority_score: 80,
        project_type: 'system_build',
        estimated_value: 450000,
        due_date: '2025-12-01T00:00:00Z',
        days_in_stage: 12,
        stage_entered_at: '2025-08-11T16:45:00Z',
        contact_name: 'Michael Chen',
        contact_email: 'michael.chen@quantumsys.com',
        contact_phone: '+1-555-0102',
        tags: ['Quantum', 'Enclosure', 'Thermal', 'EMI'],
        notes: 'Specialized cooling requirements'
    },
    {
        id: '11111111-1111-1111-1111-111111111005',
        project_id: 'P-25082305',
        title: 'Laboratory Equipment Fabrication',
        description: 'Custom laboratory equipment fabrication including fume hoods, lab benches, and ventilation systems.',
        customer_id: '01234567-1234-1234-1234-123456789003',
        status: 'order_confirmed',
        priority: 'medium',
        priority_score: 65,
        project_type: 'fabrication',
        estimated_value: 185000,
        due_date: '2025-09-15T00:00:00Z',
        days_in_stage: 18,
        stage_entered_at: '2025-08-05T11:20:00Z',
        contact_name: 'Emma Rodriguez',
        contact_email: 'emma.rodriguez@biotechsol.com',
        contact_phone: '+1-555-0103',
        tags: ['Laboratory', 'Fume Hood', 'Ventilation'],
        notes: 'Chemical resistant materials required'
    },
    {
        id: '11111111-1111-1111-1111-111111111006',
        project_id: 'P-25082306',
        title: 'Automotive Parts Manufacturing',
        description: 'High-volume manufacturing of automotive components using injection molding and secondary operations.',
        customer_id: '01234567-1234-1234-1234-123456789005',
        status: 'procurement_planning',
        priority: 'medium',
        priority_score: 70,
        project_type: 'manufacturing',
        estimated_value: 850000,
        due_date: '2025-10-15T00:00:00Z',
        days_in_stage: 22,
        stage_entered_at: '2025-08-01T13:10:00Z',
        contact_name: 'Lisa Thompson',
        contact_email: 'lisa.thompson@globalassembly.com',
        contact_phone: '+1-555-0105',
        tags: ['Automotive', 'Injection Molding', 'High Volume'],
        notes: 'Annual contract potential'
    },
    {
        id: '11111111-1111-1111-1111-111111111007',
        project_id: 'P-25082307',
        title: 'Robotic Arm Integration System',
        description: 'Complete robotic arm integration with vision system and PLC controls for automated packaging.',
        customer_id: '01234567-1234-1234-1234-123456789006',
        status: 'in_production',
        priority: 'high',
        priority_score: 75,
        project_type: 'system_build',
        estimated_value: 320000,
        due_date: '2025-09-30T00:00:00Z',
        days_in_stage: 35,
        stage_entered_at: '2025-07-19T08:30:00Z',
        contact_name: 'David Kim',
        contact_email: 'david.kim@advancedauto.com',
        contact_phone: '+1-555-0106',
        tags: ['Robotics', 'Vision', 'PLC', 'Packaging'],
        notes: 'Integration testing in progress'
    },
    {
        id: '11111111-1111-1111-1111-111111111008',
        project_id: 'P-25082308',
        title: 'Healthcare Monitoring Device',
        description: 'Portable healthcare monitoring device with wireless connectivity and mobile app integration.',
        customer_id: '01234567-1234-1234-1234-123456789008',
        status: 'in_production',
        priority: 'medium',
        priority_score: 60,
        project_type: 'system_build',
        estimated_value: 95000,
        due_date: '2025-08-30T00:00:00Z',
        days_in_stage: 28,
        stage_entered_at: '2025-07-26T15:45:00Z',
        contact_name: 'Robert Brown',
        contact_email: 'robert.brown@healthsys.com',
        contact_phone: '+1-555-0108',
        tags: ['Healthcare', 'Monitoring', 'Wireless', 'Mobile'],
        notes: 'Final testing phase'
    },
    {
        id: '11111111-1111-1111-1111-111111111009',
        project_id: 'P-25082309',
        title: 'Industrial Automation System',
        description: 'Complete industrial automation system for European manufacturing facility with CE marking.',
        customer_id: '01234567-1234-1234-1234-123456789009',
        status: 'technical_review',
        priority: 'high',
        priority_score: 85,
        project_type: 'system_build',
        estimated_value: 1750000,
        due_date: '2025-11-30T00:00:00Z',
        days_in_stage: 15,
        stage_entered_at: '2025-08-08T12:00:00Z',
        contact_name: 'Hans Mueller',
        contact_email: 'hans.mueller@euroeng.de',
        contact_phone: '+49-30-12345678',
        tags: ['Automation', 'CE Mark', 'Industrial', 'European'],
        notes: 'CE compliance documentation needed'
    },
    {
        id: '11111111-1111-1111-1111-111111111010',
        project_id: 'P-25082310',
        title: 'Precision Optical Components',
        description: 'Ultra-precision optical components for laser systems with nanometer-level accuracy requirements.',
        customer_id: '01234567-1234-1234-1234-123456789010',
        status: 'supplier_rfq_sent',
        priority: 'urgent',
        priority_score: 92,
        project_type: 'fabrication',
        estimated_value: 680000,
        due_date: '2025-10-20T00:00:00Z',
        days_in_stage: 6,
        stage_entered_at: '2025-08-17T07:15:00Z',
        contact_name: 'Yuki Tanaka',
        contact_email: 'yuki.tanaka@tokyoprecision.co.jp',
        contact_phone: '+81-3-1234-5678',
        tags: ['Optical', 'Precision', 'Laser', 'Nanometer'],
        notes: 'Cleanroom fabrication required'
    },
    {
        id: '11111111-1111-1111-1111-111111111011',
        project_id: 'P-25082311',
        title: 'Solar Panel Testing Equipment',
        description: 'Automated testing equipment for solar panel quality control and performance validation.',
        customer_id: '01234567-1234-1234-1234-123456789012',
        status: 'shipped_closed',
        priority: 'medium',
        priority_score: 55,
        project_type: 'system_build',
        estimated_value: 145000,
        due_date: '2025-07-15T00:00:00Z',
        days_in_stage: 0,
        stage_entered_at: '2025-07-15T16:30:00Z',
        contact_name: 'Sophie Martin',
        contact_email: 'sophie.martin@greenenergy.com',
        contact_phone: '+1-555-0112',
        tags: ['Solar', 'Testing', 'Automation', 'QC'],
        notes: 'Successfully delivered and commissioned'
    },
    {
        id: '11111111-1111-1111-1111-111111111012',
        project_id: 'P-25082312',
        title: 'Prototype Development Platform',
        description: 'Rapid prototyping platform for hardware startups with modular design and quick-turn capabilities.',
        customer_id: '01234567-1234-1234-1234-123456789011',
        status: 'inquiry_received',
        priority: 'low',
        priority_score: 30,
        project_type: 'fabrication',
        estimated_value: 45000,
        due_date: '2025-09-30T00:00:00Z',
        days_in_stage: 1,
        stage_entered_at: '2025-08-22T14:20:00Z',
        contact_name: 'Alex Rivera',
        contact_email: 'alex.rivera@innovationstartup.com',
        contact_phone: '+1-555-0111',
        tags: ['Prototype', 'Startup', 'Modular', 'Quick-turn'],
        notes: 'Potential for larger orders'
    },
    {
        id: '11111111-1111-1111-1111-111111111013',
        project_id: 'P-25082313',
        title: 'Complex Multi-System Integration',
        description: 'Integration of multiple subsystems including mechanical, electrical, and software components.',
        customer_id: '01234567-1234-1234-1234-123456789001',
        status: 'technical_review',
        priority: 'medium',
        priority_score: 68,
        project_type: 'system_build',
        estimated_value: 980000,
        due_date: '2025-12-30T00:00:00Z',
        days_in_stage: 21,
        stage_entered_at: '2025-08-02T10:45:00Z',
        contact_name: 'Sarah Johnson',
        contact_email: 'sarah.johnson@techcorp.com',
        contact_phone: '+1-555-0101',
        tags: ['Integration', 'Multi-system', 'Complex'],
        notes: 'Waiting for customer clarifications'
    },
    {
        id: '11111111-1111-1111-1111-111111111014',
        project_id: 'P-25082314',
        title: 'Custom Tooling and Fixtures',
        description: 'Specialized tooling and fixtures for unique manufacturing process with custom geometries.',
        customer_id: '01234567-1234-1234-1234-123456789004',
        status: 'supplier_rfq_sent',
        priority: 'low',
        priority_score: 45,
        project_type: 'fabrication',
        estimated_value: 78000,
        due_date: '2025-09-20T00:00:00Z',
        days_in_stage: 16,
        stage_entered_at: '2025-08-07T09:30:00Z',
        contact_name: 'James Wilson',
        contact_email: 'james.wilson@precisionmfg.com',
        contact_phone: '+1-555-0104',
        tags: ['Tooling', 'Fixtures', 'Custom'],
        notes: 'Supplier capacity constraints'
    },
    {
        id: '11111111-1111-1111-1111-111111111015',
        project_id: 'P-25082315',
        title: 'Pharmaceutical Production Line',
        description: 'Complete pharmaceutical production line with clean room requirements and GMP compliance.',
        customer_id: '01234567-1234-1234-1234-123456789007',
        status: 'quoted',
        priority: 'urgent',
        priority_score: 88,
        project_type: 'manufacturing',
        estimated_value: 4200000,
        due_date: '2026-02-28T00:00:00Z',
        days_in_stage: 9,
        stage_entered_at: '2025-08-14T11:15:00Z',
        contact_name: 'Dr. Maria Garcia',
        contact_email: 'maria.garcia@meddevice.com',
        contact_phone: '+1-555-0107',
        tags: ['Pharmaceutical', 'GMP', 'Clean Room', 'Production'],
        notes: 'Major pharmaceutical client'
    }
];

const sampleActivities = [
    {
        project_id: '11111111-1111-1111-1111-111111111001',
        activity_type: 'status_change',
        description: 'Project created and moved to Inquiry Received',
        created_at: '2025-08-21T10:00:00Z'
    },
    {
        project_id: '11111111-1111-1111-1111-111111111002',
        activity_type: 'status_change',
        description: 'Moved to Technical Review stage',
        created_at: '2025-08-18T14:30:00Z'
    },
    {
        project_id: '11111111-1111-1111-1111-111111111003',
        activity_type: 'status_change',
        description: 'RFQ sent to suppliers',
        created_at: '2025-08-15T09:15:00Z'
    },
    {
        project_id: '11111111-1111-1111-1111-111111111004',
        activity_type: 'status_change',
        description: 'Quote submitted to customer',
        created_at: '2025-08-11T16:45:00Z'
    },
    {
        project_id: '11111111-1111-1111-1111-111111111005',
        activity_type: 'status_change',
        description: 'Order confirmed by customer',
        created_at: '2025-08-05T11:20:00Z'
    },
    {
        project_id: '11111111-1111-1111-1111-111111111007',
        activity_type: 'status_change',
        description: 'Production started',
        created_at: '2025-07-19T08:30:00Z'
    },
    {
        project_id: '11111111-1111-1111-1111-111111111011',
        activity_type: 'status_change',
        description: 'Project completed and shipped',
        created_at: '2025-07-15T16:30:00Z'
    }
];

async function seedDatabase() {
    console.log('🌱 Starting database seeding...');

    try {
        // Clear existing data (optional)
        console.log('🧹 Clearing existing sample data...');
        await supabase.from('project_activities').delete().in('project_id', sampleProjects.map(p => p.id));
        await supabase.from('projects').delete().in('id', sampleProjects.map(p => p.id));
        await supabase.from('customers').delete().in('id', sampleCustomers.map(c => c.id));

        // Insert customers
        console.log('👥 Inserting sample customers...');
        const { error: customersError } = await supabase
            .from('customers')
            .insert(sampleCustomers);

        if (customersError) {
            console.error('Error inserting customers:', customersError);
            return;
        }
        console.log(`✅ Inserted ${sampleCustomers.length} customers`);

        // Insert projects
        console.log('📋 Inserting sample projects...');
        const { error: projectsError } = await supabase
            .from('projects')
            .insert(sampleProjects);

        if (projectsError) {
            console.error('Error inserting projects:', projectsError);
            return;
        }
        console.log(`✅ Inserted ${sampleProjects.length} projects`);

        // Insert activities
        console.log('📝 Inserting sample activities...');
        const { error: activitiesError } = await supabase
            .from('project_activities')
            .insert(sampleActivities);

        if (activitiesError) {
            console.error('Error inserting activities:', activitiesError);
            return;
        }
        console.log(`✅ Inserted ${sampleActivities.length} activities`);

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Sample data summary:');
        console.log(`• ${sampleCustomers.length} customers from various industries`);
        console.log(`• ${sampleProjects.length} projects with different types and statuses`);
        console.log(`• ${sampleActivities.length} project activities`);
        console.log('\n🔍 Project breakdown:');

        const statusCounts = sampleProjects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {});

        const typeCounts = sampleProjects.reduce((acc, project) => {
            acc[project.project_type] = (acc[project.project_type] || 0) + 1;
            return acc;
        }, {});

        const priorityCounts = sampleProjects.reduce((acc, project) => {
            acc[project.priority] = (acc[project.priority] || 0) + 1;
            return acc;
        }, {});

        console.log('By Status:', statusCounts);
        console.log('By Type:', typeCounts);
        console.log('By Priority:', priorityCounts);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
}

// Export for use in development
export { seedDatabase, sampleCustomers, sampleProjects, sampleActivities };

// Run if called directly
if (typeof window !== 'undefined') {
    // Browser environment - attach to window for manual execution
    window.seedDatabase = seedDatabase;
    console.log('🔧 To seed the database, run: seedDatabase() in the browser console');
} else if (import.meta.url === `file://${process.argv[1]}`) {
    // Node.js environment - run directly
    seedDatabase();
}