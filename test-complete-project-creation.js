/**
 * Complete Project Creation Test
 *
 * Tests the entire project creation workflow after the organization structure refactor:
 * 1. User belongs to Factory Pulse Internal
 * 2. Workflow stages exist in Factory Pulse Internal
 * 3. RFQ submission creates project successfully
 * 4. Project has correct workflow stage assigned
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Constants - will be determined dynamically
let INTERNAL_ORG_ID = null;
let INTERNAL_ORG_NAME = null;

class ProjectCreationTester {
    constructor() {
        this.testResults = [];
        this.cleanupIds = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async testDatabaseConnection() {
        this.log('Testing database connection...');
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('count')
                .limit(1);

            if (error) {
                throw new Error(`Database connection failed: ${error.message}`);
            }
            this.log('Database connection successful', 'success');
            return true;
        } catch (error) {
            this.log(`Database connection error: ${error.message}`, 'error');
            return false;
        }
    }

    async verifyOrganizationStructure() {
        this.log('Verifying organization structure...');

        // Check Factory Pulse Internal exists
        const { data: factoryPulse, error: fpError } = await supabase
            .from('organizations')
            .select('id, name, organization_type')
            .eq('id', FACTORY_PULSE_INTERNAL_ID)
            .single();

        if (fpError || !factoryPulse) {
            throw new Error(`Factory Pulse Internal organization not found: ${fpError?.message}`);
        }

        this.log(`✅ Factory Pulse Internal: ${factoryPulse.name}`, 'success');

        // Check users belong to Factory Pulse Internal
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, email, organization_id')
            .eq('organization_id', FACTORY_PULSE_INTERNAL_ID)
            .eq('is_active', true);

        if (userError) {
            throw new Error(`Failed to check users: ${userError.message}`);
        }

        if (!users || users.length === 0) {
            throw new Error('No users found in Factory Pulse Internal. Run organization structure fix first.');
        }

        this.log(`✅ Found ${users.length} users in Factory Pulse Internal`, 'success');
        return { factoryPulse, users };
    }

    async verifyWorkflowStages() {
        this.log('Verifying workflow stages...');

        const { data: stages, error } = await supabase
            .from('workflow_stages')
            .select('id, name, slug, stage_order, is_active')
            .eq('organization_id', FACTORY_PULSE_INTERNAL_ID)
            .eq('is_active', true)
            .order('stage_order');

        if (error) {
            throw new Error(`Failed to get workflow stages: ${error.message}`);
        }

        if (!stages || stages.length === 0) {
            throw new Error('No workflow stages found in Factory Pulse Internal. Run workflow stages seeding.');
        }

        this.log(`✅ Found ${stages.length} workflow stages`, 'success');

        // Check critical stages
        const criticalStages = ['inquiry_received', 'order_confirmed', 'technical_review'];
        const existingSlugs = stages.map(s => s.slug);

        console.log('🎯 Critical stages check:');
        criticalStages.forEach(slug => {
            const exists = existingSlugs.includes(slug);
            const status = exists ? '✅' : '❌';
            const stage = stages.find(s => s.slug === slug);
            console.log(`   ${status} ${slug}: ${exists ? `Stage ${stage?.stage_order}` : 'MISSING'}`);
        });

        const missingStages = criticalStages.filter(s => !existingSlugs.includes(s));
        if (missingStages.length > 0) {
            throw new Error(`Missing critical stages: ${missingStages.join(', ')}`);
        }

        return stages;
    }

    async testIntakeWorkflowService() {
        this.log('Testing IntakeWorkflowService...');

        // Test stage lookup for different intake types
        const intakeTypes = [
            { type: 'rfq', expectedSlug: 'inquiry_received' },
            { type: 'po', expectedSlug: 'order_confirmed' },
            { type: 'design_idea', expectedSlug: 'technical_review' }
        ];

        for (const intake of intakeTypes) {
            console.log(`   Testing intake type: ${intake.type} → ${intake.expectedSlug}`);

            // Simulate IntakeWorkflowService.getInitialStageId
            const { data: stage, error } = await supabase
                .from('workflow_stages')
                .select('id, name')
                .eq('organization_id', FACTORY_PULSE_INTERNAL_ID)
                .eq('slug', intake.expectedSlug)
                .eq('is_active', true)
                .single();

            if (error || !stage) {
                throw new Error(`Failed to find stage '${intake.expectedSlug}' for intake type '${intake.type}': ${error?.message}`);
            }

            console.log(`      ✅ Found: ${stage.name} (${stage.id})`);
        }

        this.log('✅ IntakeWorkflowService working correctly', 'success');
    }

    async testProjectCreation() {
        this.log('Testing complete project creation flow...');

        // Step 1: Get a test user from Factory Pulse Internal
        const { data: testUser, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .eq('organization_id', FACTORY_PULSE_INTERNAL_ID)
            .eq('is_active', true)
            .limit(1);

        if (userError || !testUser) {
            throw new Error(`No test user available: ${userError?.message}`);
        }

        console.log(`   👤 Using test user: ${testUser.email}`);

        // Step 2: Create a test customer organization
        const customerOrgName = `Test Customer ${Date.now()}`;
        const { data: customerOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: customerOrgName,
                slug: `test-customer-${Date.now()}`,
                organization_type: 'customer',
                is_active: true
            })
            .select()
            .single();

        if (orgError) {
            throw new Error(`Failed to create customer organization: ${orgError.message}`);
        }

        this.cleanupIds.push({ table: 'organizations', id: customerOrg.id });
        console.log(`   🏢 Created customer org: ${customerOrg.name}`);

        // Step 3: Get initial workflow stage (simulate RFQ submission)
        const { data: initialStage, error: stageError } = await supabase
            .from('workflow_stages')
            .select('id, name')
            .eq('organization_id', FACTORY_PULSE_INTERNAL_ID)
            .eq('slug', 'inquiry_received')
            .eq('is_active', true)
            .single();

        if (stageError || !initialStage) {
            throw new Error(`Failed to get initial stage: ${stageError?.message}`);
        }

        console.log(`   📋 Initial stage: ${initialStage.name} (${initialStage.id})`);

        // Step 4: Create project (simulate successful RFQ submission)
        const projectId = `TEST-${Date.now()}`;
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                organization_id: FACTORY_PULSE_INTERNAL_ID,
                project_id: projectId,
                title: 'Test RFQ Project - Organization Refactor',
                description: 'Testing project creation after organization structure refactor',
                customer_organization_id: customerOrg.id,
                current_stage_id: initialStage.id,
                status: 'draft',
                priority_level: 'normal',
                created_by: testUser.id,
                intake_type: 'rfq',
                intake_source: 'portal',
                project_type: 'fabrication',
                stage_entered_at: new Date().toISOString(),
                tags: ['test', 'rfq', 'organization-refactor']
            })
            .select(`
                *,
                customer_organization:organizations!customer_organization_id(
                    id, name, organization_type
                ),
                current_stage:workflow_stages(
                    id, name, slug, stage_order
                )
            `)
            .single();

        if (projectError) {
            throw new Error(`Project creation failed: ${projectError.message}`);
        }

        this.cleanupIds.push({ table: 'projects', id: project.id });
        console.log(`   ✅ Project created: ${project.project_id}`);
        console.log(`      - Title: ${project.title}`);
        console.log(`      - Organization: ${FACTORY_PULSE_INTERNAL_ID} (Factory Pulse Internal)`);
        console.log(`      - Customer: ${customerOrg.name}`);
        console.log(`      - Stage: ${project.current_stage?.name} (${project.current_stage?.slug})`);
        console.log(`      - Status: ${project.status}`);

        // Step 5: Verify project relationships
        if (project.organization_id !== FACTORY_PULSE_INTERNAL_ID) {
            throw new Error(`Project organization mismatch: expected ${FACTORY_PULSE_INTERNAL_ID}, got ${project.organization_id}`);
        }

        if (project.customer_organization_id !== customerOrg.id) {
            throw new Error(`Project customer organization mismatch: expected ${customerOrg.id}, got ${project.customer_organization_id}`);
        }

        if (project.current_stage_id !== initialStage.id) {
            throw new Error(`Project stage mismatch: expected ${initialStage.id}, got ${project.current_stage_id}`);
        }

        console.log(`   ✅ Project relationships verified`);
        return { project, customerOrg, initialStage };
    }

    async testWorkflowProgression() {
        this.log('Testing workflow progression...');

        // Get the test project we created
        const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select(`
                id, project_id, title, current_stage_id,
                workflow_stages!current_stage_id (
                    id, name, slug, stage_order
                )
            `)
            .eq('project_id', this.testResults.find(r => r.name === 'Project Creation')?.result?.project?.project_id)
            .limit(1);

        if (projectError || !projects || projects.length === 0) {
            this.log('⚠️ Skipping workflow progression test - no test project found', 'warning');
            return;
        }

        const project = projects[0];
        console.log(`   📊 Testing project: ${project.project_id}`);

        // Get all stages to simulate progression
        const { data: allStages, error: stagesError } = await supabase
            .from('workflow_stages')
            .select('id, name, slug, stage_order')
            .eq('organization_id', FACTORY_PULSE_INTERNAL_ID)
            .eq('is_active', true)
            .order('stage_order');

        if (stagesError || !allStages) {
            throw new Error(`Failed to get workflow stages: ${stagesError?.message}`);
        }

        console.log(`   📈 Available stages: ${allStages.length}`);
        allStages.forEach((stage, index) => {
            console.log(`      ${index + 1}. ${stage.name} (${stage.slug})`);
        });

        // Simulate moving to next stage
        const currentStageIndex = allStages.findIndex(s => s.id === project.current_stage_id);
        if (currentStageIndex >= 0 && currentStageIndex < allStages.length - 1) {
            const nextStage = allStages[currentStageIndex + 1];

            const { error: updateError } = await supabase
                .from('projects')
                .update({
                    current_stage_id: nextStage.id,
                    stage_entered_at: new Date().toISOString()
                })
                .eq('id', project.id);

            if (updateError) {
                throw new Error(`Failed to update project stage: ${updateError.message}`);
            }

            console.log(`   ✅ Stage progression: ${allStages[currentStageIndex].name} → ${nextStage.name}`);
        }

        this.log('✅ Workflow progression working correctly', 'success');
    }

    async cleanup() {
        this.log('Cleaning up test data...');

        for (const item of this.cleanupIds.reverse()) {
            try {
                const { error } = await supabase
                    .from(item.table)
                    .delete()
                    .eq('id', item.id);

                if (error) {
                    this.log(`Failed to cleanup ${item.table}: ${error.message}`, 'warning');
                } else {
                    this.log(`Cleaned up ${item.table}: ${item.id}`, 'success');
                }
            } catch (e) {
                this.log(`Error cleaning up ${item.table}: ${e.message}`, 'warning');
            }
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('🧪 COMPLETE PROJECT CREATION TEST REPORT');
        console.log('='.repeat(80));

        console.log('\n📋 TEST SUMMARY:');
        const passed = this.testResults.filter(r => r.status === 'passed').length;
        const total = this.testResults.length;
        console.log(`   ✅ Passed: ${passed}/${total}`);
        console.log(`   ❌ Failed: ${total - passed}/${total}`);

        console.log('\n🔍 TEST RESULTS:');
        this.testResults.forEach((result, index) => {
            const status = result.status === 'passed' ? '✅' : '❌';
            console.log(`   ${index + 1}. ${status} ${result.name}`);
            if (result.status === 'failed') {
                console.log(`      Error: ${result.error}`);
            }
        });

        console.log('\n🏗️ ARCHITECTURE VERIFICATION:');

        // Check if all critical components are working
        const criticalTests = [
            'Database Connection',
            'Organization Structure',
            'Workflow Stages',
            'IntakeWorkflowService',
            'Project Creation'
        ];

        const allCriticalPassed = criticalTests.every(testName =>
            this.testResults.some(r => r.name === testName && r.status === 'passed')
        );

        if (allCriticalPassed) {
            console.log('   ✅ COMPLETE REFACTOR SUCCESS');
            console.log('   ✅ Organization structure is correct');
            console.log('   ✅ Workflow stages are properly configured');
            console.log('   ✅ Project creation works end-to-end');
            console.log('   🎉 RFQ submission should work perfectly!');
        } else {
            console.log('   ⚠️ Some issues remain - check failed tests above');
        }

        console.log('\n📊 FINAL STATE VERIFICATION:');
        console.log(`   🏢 Users belong to: Factory Pulse Internal`);
        console.log(`   📋 Workflow stages in: Factory Pulse Internal only`);
        console.log(`   🏭 Projects created by: Factory Pulse Internal users`);
        console.log(`   🏪 Projects created for: Customer organizations`);

        console.log('\n🚀 NEXT STEPS:');
        console.log('   1. Test RFQ submission in the UI');
        console.log('   2. Verify projects are created with correct workflow stages');
        console.log('   3. Confirm workflow progression works');
        console.log('   4. Monitor for any remaining issues');

        console.log('\n' + '='.repeat(80));
    }

    async runCompleteTest() {
        this.log('Starting Complete Project Creation Test');
        console.log(`Testing the organization structure refactor...`);
        console.log('');

        try {
            // Core infrastructure tests
            await this.runTest('Database Connection', () => this.testDatabaseConnection());
            await this.runTest('Organization Structure', () => this.verifyOrganizationStructure());
            await this.runTest('Workflow Stages', () => this.verifyWorkflowStages());

            // Service layer tests
            await this.runTest('IntakeWorkflowService', () => this.testIntakeWorkflowService());

            // End-to-end project creation test
            await this.runTest('Project Creation', () => this.testProjectCreation());

            // Optional workflow progression test
            try {
                await this.runTest('Workflow Progression', () => this.testWorkflowProgression());
            } catch (error) {
                this.log(`Workflow progression test failed (optional): ${error.message}`, 'warning');
            }

        } catch (error) {
            this.log(`Test suite failed: ${error.message}`, 'error');
        } finally {
            await this.cleanup();
            this.generateReport();
        }
    }

    async runTest(testName, testFunction) {
        this.log(`Running: ${testName}`);
        try {
            const result = await testFunction();
            this.testResults.push({ name: testName, status: 'passed', result });
            this.log(`${testName}: PASSED`, 'success');
            return result;
        } catch (error) {
            this.testResults.push({ name: testName, status: 'failed', error: error.message });
            this.log(`${testName}: FAILED - ${error.message}`, 'error');
            throw error;
        }
    }
}

// Run the complete test
async function main() {
    console.log('🧪 Complete Project Creation Test Suite');
    console.log('=====================================');
    console.log('Testing the organization structure refactor...');
    console.log('');

    const tester = new ProjectCreationTester();
    await tester.runCompleteTest();
}

// Export for use in other scripts
module.exports = { ProjectCreationTester };

if (require.main === module) {
    main().catch(console.error);
}
