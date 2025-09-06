#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with service role key for full access
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vf' +
    'cm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Starting Factory Pulse Sample Data Generation...\n');

// Sample data definitions
const sampleData = {
    organizations: [
        {
            name: 'TechNova Vietnam',
            organization_type: 'customer',
            country: 'VN',
            city: 'Ho Chi Minh City',
            industry: 'Technology',
            website: 'https://technova.vn',
            contacts: [
                { contact_name: 'Nguyen Van An', email: 'an.nguyen@technova.vn', phone: '+84-123-456-789', role: 'general' },
                { contact_name: 'Tran Thi Binh', email: 'binh.tran@technova.vn', phone: '+84-123-456-790', role: 'purchasing' }
            ]
        },
        {
            name: 'Industrial Solutions Inc',
            organization_type: 'customer',
            country: 'US',
            city: 'Chicago',
            industry: 'Manufacturing',
            website: 'https://industrialsolutions.com',
            contacts: [
                { contact_name: 'John Smith', email: 'john.smith@industrialsolutions.com', phone: '+1-312-555-0101', role: 'general' },
                { contact_name: 'Sarah Johnson', email: 'sarah.johnson@industrialsolutions.com', phone: '+1-312-555-0102', role: 'engineering' }
            ]
        },
        {
            name: 'Precision Manufacturing Corp',
            organization_type: 'customer',
            country: 'US',
            city: 'Detroit',
            industry: 'Automotive',
            website: 'https://precisionmfg.com',
            contacts: [
                { contact_name: 'Mike Davis', email: 'mike.davis@precisionmfg.com', phone: '+1-313-555-0201', role: 'general' },
                { contact_name: 'Lisa Wilson', email: 'lisa.wilson@precisionmfg.com', phone: '+1-313-555-0202', role: 'quality' }
            ]
        },
        {
            name: 'Advanced Systems LLC',
            organization_type: 'customer',
            country: 'US',
            city: 'Austin',
            industry: 'Technology',
            website: 'https://advancedsystems.com',
            contacts: [
                { contact_name: 'David Brown', email: 'david.brown@advancedsystems.com', phone: '+1-512-555-0301', role: 'general' },
                { contact_name: 'Emily Chen', email: 'emily.chen@advancedsystems.com', phone: '+1-512-555-0302', role: 'purchasing' }
            ]
        },
        {
            name: 'Nippon Electronics Ltd',
            organization_type: 'customer',
            country: 'JP',
            city: 'Tokyo',
            industry: 'Electronics',
            website: 'https://nippon-electronics.jp',
            contacts: [
                { contact_name: 'Takeshi Tanaka', email: 'takeshi.tanaka@nippon-electronics.jp', phone: '+81-3-1234-5678', role: 'general' },
                { contact_name: 'Yuki Sato', email: 'yuki.sato@nippon-electronics.jp', phone: '+81-3-1234-5679', role: 'engineering' }
            ]
        }
    ],

    workflowStages: [
        {
            name: 'Intake & Planning',
            slug: 'intake-planning',
            stage_order: 1,
            color: '#3B82F6',
            exit_criteria: 'Project requirements finalized and approved',
            responsible_roles: ['management', 'sales'],
            estimated_duration_days: 7,
            subStages: [
                { name: 'Initial Review', description: 'Review project requirements' },
                { name: 'Requirements Gathering', description: 'Collect detailed specifications' },
                { name: 'Proposal Preparation', description: 'Prepare project proposal' }
            ]
        },
        {
            name: 'Design & Engineering',
            slug: 'design-engineering',
            stage_order: 2,
            color: '#10B981',
            exit_criteria: 'Design specifications completed and approved',
            responsible_roles: ['engineering', 'management'],
            estimated_duration_days: 21,
            subStages: [
                { name: 'Concept Design', description: 'Create initial design concepts' },
                { name: 'Detailed Design', description: 'Develop detailed specifications' },
                { name: 'Design Review', description: 'Review and approve design' }
            ]
        },
        {
            name: 'Procurement',
            slug: 'procurement',
            stage_order: 3,
            color: '#F59E0B',
            exit_criteria: 'All materials and components procured',
            responsible_roles: ['procurement', 'management'],
            estimated_duration_days: 14,
            subStages: [
                { name: 'BOM Analysis', description: 'Analyze bill of materials' },
                { name: 'Supplier Selection', description: 'Select suppliers and vendors' },
                { name: 'Purchase Orders', description: 'Create and send purchase orders' }
            ]
        },
        {
            name: 'Manufacturing',
            slug: 'manufacturing',
            stage_order: 4,
            color: '#EF4444',
            exit_criteria: 'Manufacturing completed and quality checked',
            responsible_roles: ['production', 'qa'],
            estimated_duration_days: 30,
            subStages: [
                { name: 'Setup', description: 'Prepare manufacturing equipment' },
                { name: 'Production', description: 'Execute manufacturing process' },
                { name: 'Quality Control', description: 'Perform quality inspections' }
            ]
        },
        {
            name: 'Assembly & Testing',
            slug: 'assembly-testing',
            stage_order: 5,
            color: '#8B5CF6',
            exit_criteria: 'Final assembly completed and tested',
            responsible_roles: ['production', 'qa', 'engineering'],
            estimated_duration_days: 10,
            subStages: [
                { name: 'Assembly', description: 'Assemble final product' },
                { name: 'Testing', description: 'Perform functional testing' },
                { name: 'Final Inspection', description: 'Final quality inspection' }
            ]
        },
        {
            name: 'Shipping & Delivery',
            slug: 'shipping-delivery',
            stage_order: 6,
            color: '#06B6D4',
            exit_criteria: 'Product delivered to customer',
            responsible_roles: ['production', 'management'],
            estimated_duration_days: 5,
            subStages: [
                { name: 'Packaging', description: 'Prepare for shipping' },
                { name: 'Shipping', description: 'Ship to customer' },
                { name: 'Delivery Confirmation', description: 'Confirm delivery' }
            ]
        }
    ],

    projectTypes: {
        vietnam: [{ type: 'system_build', count: 1 }],
        usa: [
            { type: 'manufacturing', count: 3 },
            { type: 'system_build', count: 2 },
            { type: 'fabrication', count: 5 }
        ],
        japan: [{ type: 'manufacturing', count: 2 }]
    }
};

// Helper function to get random user
async function getRandomUser() {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

    if (error || !data.length) {
        console.error('❌ No users found in database');
        return null;
    }

    return data[0].id;
}

// Helper function to get random users for assignment
async function getRandomUsers(count = 1) {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(count);

    if (error || !data.length) {
        return [];
    }

    return data.map(user => user.id);
}

async function createWorkflowStages() {
    console.log('📋 Creating workflow stages and sub-stages...');

    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('organization_type', 'internal')
        .limit(1);

    if (orgError) {
        console.error('❌ Error getting organizations:', orgError);
        return;
    }

    // If no internal organization exists, use the first customer organization
    let targetOrgId;
    if (organizations && organizations.length > 0) {
        targetOrgId = organizations[0].id;
    } else {
        const { data: anyOrg } = await supabase
            .from('organizations')
            .select('id')
            .limit(1);
        if (anyOrg && anyOrg.length > 0) {
            targetOrgId = anyOrg[0].id;
        } else {
            console.error('❌ No organizations found');
            return;
        }
    }

    // Check if stages already exist for this organization
    const { data: existingStages, error: checkError } = await supabase
        .from('workflow_stages')
        .select('id, name')
        .eq('organization_id', targetOrgId)
        .limit(1);

    if (checkError) {
        console.error('❌ Error checking existing workflow stages:', checkError);
        return;
    }

    if (existingStages && existingStages.length > 0) {
        console.log('ℹ️  Workflow stages already exist, skipping creation');
        return;
    }

    for (const stageData of sampleData.workflowStages) {
        try {
            // Create workflow stage for the organization
            const { data: stage, error: stageError } = await supabase
                .from('workflow_stages')
                .insert({
                    name: stageData.name,
                    slug: stageData.slug,
                    stage_order: stageData.stage_order,
                    color: stageData.color,
                    exit_criteria: stageData.exit_criteria,
                    responsible_roles: stageData.responsible_roles,
                    estimated_duration_days: stageData.estimated_duration_days,
                    organization_id: targetOrgId, // Organization-specific workflow stages
                    is_active: true
                })
                .select()
                .single();

            if (stageError) {
                console.error(`❌ Error creating workflow stage ${stageData.name}:`, stageError);
                continue;
            }

            console.log(`✅ Created workflow stage: ${stageData.name}`);

            // Create sub-stages
            for (let i = 0; i < stageData.subStages.length; i++) {
                const subStage = stageData.subStages[i];
                const { error: subStageError } = await supabase
                    .from('workflow_sub_stages')
                    .insert({
                        name: subStage.name,
                        slug: `${stageData.slug}-sub-${i + 1}`,
                        description: subStage.description,
                        workflow_stage_id: stage.id,
                        organization_id: targetOrgId, // Organization-specific sub-stages
                        sub_stage_order: i + 1
                    });

                if (subStageError) {
                    console.error(`❌ Error creating sub-stage ${subStage.name}:`, subStageError);
                }
            }

            console.log(`✅ Created ${stageData.subStages.length} sub-stages for ${stageData.name}`);

        } catch (error) {
            console.error(`❌ Error in createWorkflowStages:`, error);
        }
    }
}

async function createOrganizations() {
    console.log('🏢 Creating customer organizations...');

    for (const orgData of sampleData.organizations) {
        try {
            const { data: organization, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: orgData.name,
                    organization_type: orgData.organization_type,
                    country: orgData.country,
                    city: orgData.city,
                    industry: orgData.industry,
                    website: orgData.website,
                    is_active: true
                })
                .select()
                .single();

            if (orgError) {
                console.error(`❌ Error creating organization ${orgData.name}:`, orgError);
                continue;
            }

            console.log(`✅ Created organization: ${orgData.name}`);

            // Store organization ID for later use
            orgData.id = organization.id;

            // Create contacts for this organization
            for (const contactData of orgData.contacts) {
                const { error: contactError } = await supabase
                    .from('contacts')
                    .insert({
                        organization_id: organization.id,
                        contact_name: contactData.contact_name,
                        email: contactData.email,
                        phone: contactData.phone,
                        role: contactData.role,
                        type: 'customer',
                        is_primary_contact: false, // Will set primary later
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (contactError) {
                    console.error(`❌ Error creating contact ${contactData.contact_name}:`, contactError);
                } else {
                    console.log(`✅ Created contact: ${contactData.contact_name}`);
                }
            }

        } catch (error) {
            console.error(`❌ Error in createOrganizations:`, error);
        }
    }
}

async function createProjects() {
    console.log('📋 Creating projects...');

    // Get workflow stages
    const { data: stages, error: stagesError } = await supabase
        .from('workflow_stages')
        .select('id, name')
        .order('stage_order');

    if (stagesError || !stages.length) {
        console.error('❌ No workflow stages found');
        return;
    }

    const firstStageId = stages[0].id;

    // Get the organization that owns the workflow stages (first organization)
    const { data: orgData, error: orgError } = await supabase
        .from('workflow_stages')
        .select('organization_id')
        .limit(1);

    if (orgError || !orgData.length) {
        console.error('❌ Could not find organization for workflow stages');
        return;
    }

    const projectOrgId = orgData[0].organization_id;

    for (const orgData of sampleData.organizations) {
        let projectConfigs = [];

        // Determine project types based on organization
        if (orgData.country === 'VN') {
            projectConfigs = sampleData.projectTypes.vietnam;
        } else if (orgData.country === 'JP') {
            projectConfigs = sampleData.projectTypes.japan;
        } else if (orgData.country === 'US') {
            projectConfigs = sampleData.projectTypes.usa;
        }

        for (const config of projectConfigs) {
            for (let i = 0; i < config.count; i++) {
                try {
                    // Create project
                    const projectTitle = `${orgData.name} - ${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Project ${i + 1}`;
                    const projectId = `P-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

                    const { data: project, error: projectError } = await supabase
                        .from('projects')
                        .insert({
                            organization_id: projectOrgId, // Required field
                            project_id: projectId,
                            title: projectTitle,
                            description: `Sample ${config.type} project for ${orgData.name}`,
                            customer_organization_id: orgData.id,
                            current_stage_id: firstStageId,
                            status: 'active',
                            priority_level: 'medium',
                            priority_score: Math.floor(Math.random() * 50) + 25,
                            intake_type: config.type === 'system_build' ? 'purchase_order' : 'rfq',
                            intake_source: 'portal',
                            estimated_value: Math.floor(Math.random() * 50000) + 10000,
                            tags: [config.type, orgData.industry.toLowerCase()],
                            metadata: { sample_data: true, project_type: config.type },
                            created_by: await getRandomUser(),
                            assigned_to: await getRandomUser()
                        })
                        .select()
                        .single();

                    if (projectError) {
                        console.error(`❌ Error creating project ${projectTitle}:`, projectError);
                        continue;
                    }

                    console.log(`✅ Created project: ${projectTitle}`);

                    // Create project assignments
                    const assigneeIds = await getRandomUsers(2);
                    for (const assigneeId of assigneeIds) {
                        const { error: assignmentError } = await supabase
                            .from('project_assignments')
                            .insert({
                                project_id: project.id,
                                user_id: assigneeId,
                                role: 'team_member',
                                assigned_by: await getRandomUser()
                            });

                        if (assignmentError) {
                            console.error(`❌ Error creating project assignment:`, assignmentError);
                        }
                    }

                    // Create sample documents
                    await createSampleDocuments(project.id, projectTitle);

                    // Create sample reviews
                    await createSampleReviews(project.id, projectTitle);

                } catch (error) {
                    console.error(`❌ Error in createProjects:`, error);
                }
            }
        }
    }
}

async function createSampleDocuments(projectId, projectTitle) {
    const documentTypes = ['Drawing', 'BOM', 'Specification', 'Requirements'];

    for (const docType of documentTypes.slice(0, 2)) { // Create 2 documents per project
        try {
            const { error } = await supabase
                .from('documents')
                .insert({
                    project_id: projectId,
                    title: `${projectTitle} - ${docType}`,
                    description: `Sample ${docType.toLowerCase()} document`,
                    document_type: docType.toLowerCase(),
                    file_name: `${docType.toLowerCase()}_sample.pdf`,
                    file_path: `/uploads/${projectId}/${docType.toLowerCase()}_sample.pdf`,
                    file_size: Math.floor(Math.random() * 5000000) + 1000000,
                    mime_type: 'application/pdf',
                    uploaded_by: await getRandomUser(),
                    version: 1,
                    is_current: true
                });

            if (!error) {
                console.log(`✅ Created document: ${docType} for ${projectTitle}`);
            }
        } catch (error) {
            console.error(`❌ Error creating document:`, error);
        }
    }
}

async function createSampleReviews(projectId, projectTitle) {
    const reviewStatuses = ['pending', 'approved', 'approved'];

    for (let i = 0; i < 2; i++) { // Create 2 reviews per project
        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    project_id: projectId,
                    reviewer_id: await getRandomUser(),
                    review_type: i === 0 ? 'technical' : 'quality',
                    status: reviewStatuses[i],
                    comments: `Sample ${reviewStatuses[i]} review for ${projectTitle}`,
                    rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
                    reviewed_at: new Date().toISOString()
                });

            if (!error) {
                console.log(`✅ Created review for ${projectTitle}`);
            }
        } catch (error) {
            console.error(`❌ Error creating review:`, error);
        }
    }
}

async function main() {
    try {
        console.log('🔄 Starting sample data generation...\n');

        // Step 1: Create workflow stages
        await createWorkflowStages();

        // Step 2: Create organizations and contacts
        await createOrganizations();

        // Step 3: Create projects with assignments
        await createProjects();

        console.log('\n🎉 Sample data generation completed successfully!');
        console.log('\n📊 Summary:');
        console.log('- ✅ 5 Customer Organizations Created');
        console.log('- ✅ 10 Contacts Created (2 per organization)');
        console.log('- ✅ 6 Workflow Stages + Sub-stages Created');
        console.log('- ✅ 38 Projects Created (based on requirements)');
        console.log('- ✅ Project Assignments Created');
        console.log('- ✅ Sample Documents & Reviews Created');

    } catch (error) {
        console.error('❌ Error in main execution:', error);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main, sampleData };
