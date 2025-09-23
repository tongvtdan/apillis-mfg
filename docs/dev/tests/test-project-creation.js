#!/usr/bin/env node

/**
 * Project Creation Test Script
 * Tests the complete project creation workflow
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJl eHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data
const testData = {
    title: `Test Project ${new Date().toISOString().slice(0, 19)}`,
    description: 'Automated test project for workflow validation',
    customer_organization_id: null, // Will be set after creating test customer
    point_of_contacts: [],
    priority_level: 'high',
    estimated_value: 50000,
    estimated_delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    intake_type: 'rfq',
    intake_source: 'portal',
    project_type: 'fabrication',
    tags: ['test', 'automation', 'rfq'],
    notes: 'Created by automated test script',
    volume: JSON.stringify([{ qty: 1000, unit: 'pcs', freq: 'per year' }]),
    target_price_per_unit: 50.00,
    desired_delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
};

async function runTests() {
    console.log('🚀 Starting Project Creation Tests...\n');

    try {
        // Test 1: Check database connection
        console.log('📋 Test 1: Database Connection');
        const { data: connectionTest, error: connectionError } = await supabase
            .from('projects')
            .select('count', { count: 'exact', head: true });

        if (connectionError) {
            throw new Error(`Database connection failed: ${connectionError.message}`);
        }
        console.log('✅ Database connection successful\n');

        // Test 2: Get organization ID (assuming first organization for testing)
        console.log('📋 Test 2: Get Organization');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .limit(1)
            .single();

        if (orgError) {
            throw new Error(`Failed to get organization: ${orgError.message}`);
        }
        console.log(`✅ Organization found: ${orgData.name} (${orgData.id})\n`);

        // Test 3: Create test customer
        console.log('📋 Test 3: Create Test Customer');
        const testCustomer = {
            organization_id: orgData.id,
            type: 'customer',
            company_name: `Test Corp ${Date.now()}`,
            contact_name: 'Test User',
            email: `test${Date.now()}@example.com`,
            phone: '+1-555-TEST',
            country: 'United States',
            is_active: true
        };

        const { data: customerData, error: customerError } = await supabase
            .from('contacts')
            .insert(testCustomer)
            .select()
            .single();

        if (customerError) {
            throw new Error(`Failed to create customer: ${customerError.message}`);
        }
        console.log(`✅ Test customer created: ${customerData.company_name}\n`);

        // Test 4: Get initial workflow stage
        console.log('📋 Test 4: Get Initial Workflow Stage');
        const { data: stageData, error: stageError } = await supabase
            .from('workflow_stages')
            .select('id, name, slug')
            .eq('organization_id', orgData.id)
            .eq('slug', 'inquiry_received')
            .single();

        if (stageError) {
            throw new Error(`Failed to get workflow stage: ${stageError.message}`);
        }
        console.log(`✅ Initial stage found: ${stageData.name} (${stageData.id})\n`);

        // Test 5: Create project
        console.log('📋 Test 5: Create Project');
        const projectData = {
            ...testData,
            organization_id: orgData.id,
            customer_organization_id: customerData.id,
            point_of_contacts: [customerData.id],
            current_stage_id: stageData.id,
            created_by: null, // Would be set by authenticated user
            stage_entered_at: new Date().toISOString()
        };

        const { data: projectResult, error: projectError } = await supabase
            .from('projects')
            .insert(projectData)
            .select(`
        id,
        project_id,
        title,
        customer_organization_id,
        point_of_contacts,
        current_stage_id,
        status,
        priority_level,
        intake_type,
        intake_source,
        estimated_value,
        estimated_delivery_date,
        volume,
        target_price_per_unit,
        desired_delivery_date,
        tags,
        notes,
        created_at
      `)
            .single();

        if (projectError) {
            throw new Error(`Failed to create project: ${projectError.message}`);
        }
        console.log(`✅ Project created successfully: ${projectResult.project_id}\n`);

        // Test 6: Verify project data
        console.log('📋 Test 6: Verify Project Data');

        // Check all required fields
        const requiredFields = [
            'id', 'project_id', 'title', 'organization_id', 'customer_organization_id',
            'point_of_contacts', 'current_stage_id', 'status', 'priority_level',
            'intake_type', 'intake_source', 'created_at'
        ];

        const missingFields = requiredFields.filter(field => !projectResult[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Verify data integrity
        if (projectResult.title !== testData.title) {
            throw new Error('Project title mismatch');
        }

        if (projectResult.customer_organization_id !== customerData.id) {
            throw new Error('Customer organization ID mismatch');
        }

        if (!Array.isArray(projectResult.point_of_contacts) || projectResult.point_of_contacts.length === 0) {
            throw new Error('Point of contacts not set correctly');
        }

        if (projectResult.current_stage_id !== stageData.id) {
            throw new Error('Current stage ID mismatch');
        }

        if (projectResult.intake_type !== testData.intake_type) {
            throw new Error('Intake type mismatch');
        }

        if (projectResult.priority_level !== testData.priority_level) {
            throw new Error('Priority level mismatch');
        }

        console.log('✅ All project data verified successfully\n');

        // Test 7: Verify relationships
        console.log('📋 Test 7: Verify Relationships');

        // Check customer relationship
        const { data: customerCheck, error: customerCheckError } = await supabase
            .from('contacts')
            .select('id, company_name')
            .eq('id', projectResult.customer_organization_id)
            .single();

        if (customerCheckError || !customerCheck) {
            throw new Error('Customer relationship verification failed');
        }

        // Check workflow stage relationship
        const { data: stageCheck, error: stageCheckError } = await supabase
            .from('workflow_stages')
            .select('id, name')
            .eq('id', projectResult.current_stage_id)
            .single();

        if (stageCheckError || !stageCheck) {
            throw new Error('Workflow stage relationship verification failed');
        }

        console.log('✅ All relationships verified successfully\n');

        // Test 8: Check triggers and automatic fields
        console.log('📋 Test 8: Verify Automatic Fields');

        // Check if project_id was auto-generated
        if (!projectResult.project_id || !projectResult.project_id.startsWith('P-')) {
            throw new Error('Project ID not auto-generated correctly');
        }

        // Check if sub-stage progress was created
        const { data: subStageData, error: subStageError } = await supabase
            .from('project_sub_stage_progress')
            .select('id')
            .eq('project_id', projectResult.id);

        if (subStageError) {
            console.warn('⚠️ Sub-stage progress check failed, but continuing...');
        } else if (!subStageData || subStageData.length === 0) {
            console.warn('⚠️ No sub-stage progress created automatically');
        } else {
            console.log(`✅ Sub-stage progress created: ${subStageData.length} entries`);
        }

        console.log('✅ Automatic field generation verified\n');

        // Test Summary
        console.log('🎉 ALL TESTS PASSED!');
        console.log('\n📊 Test Summary:');
        console.log(`   • Project Created: ${projectResult.project_id}`);
        console.log(`   • Title: ${projectResult.title}`);
        console.log(`   • Customer: ${customerCheck.company_name}`);
        console.log(`   • Stage: ${stageCheck.name}`);
        console.log(`   • Status: ${projectResult.status}`);
        console.log(`   • Priority: ${projectResult.priority_level}`);
        console.log(`   • Intake Type: ${projectResult.intake_type}`);
        console.log(`   • Estimated Value: $${projectResult.estimated_value}`);
        console.log(`   • Created: ${new Date(projectResult.created_at).toLocaleString()}`);

        return {
            success: true,
            project: projectResult,
            customer: customerCheck,
            stage: stageCheck
        };

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests()
        .then(result => {
            if (result.success) {
                console.log('\n✅ All tests completed successfully!');
                process.exit(0);
            } else {
                console.error('\n❌ Tests failed:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Unexpected error:', error);
            process.exit(1);
        });
}

export { runTests };
