#!/usr/bin/env node

/**
 * Seed Workflow Stages for Factory Pulse Internal
 *
 * This script creates workflow stages ONLY for Factory Pulse Internal organization.
 * After the organization structure refactor, all users belong to Factory Pulse Internal,
 * so workflow stages should only exist there.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Internal Organization ID - will be determined dynamically
let INTERNAL_ORG_ID = null;
let INTERNAL_ORG_NAME = null;

async function findInternalOrganization() {
    console.log('🔍 Finding internal organization...');

    // First, look for Apillis specifically
    const { data: apillisOrg, error: apillisError } = await supabase
        .from('organizations')
        .select('*')
        .ilike('name', '%apillis%')
        .eq('is_active', true)
        .single();

    if (!apillisError && apillisOrg) {
        console.log(`✅ Found Apillis organization: ${apillisOrg.name}`);
        INTERNAL_ORG_ID = apillisOrg.id;
        INTERNAL_ORG_NAME = apillisOrg.name;
        return apillisOrg;
    }

    // Look for any internal organization
    const { data: internalOrgs, error: internalError } = await supabase
        .from('organizations')
        .select('*')
        .eq('organization_type', 'internal')
        .eq('is_active', true)
        .order('created_at');

    if (!internalError && internalOrgs && internalOrgs.length > 0) {
        const selectedOrg = internalOrgs[0];
        console.log(`✅ Found internal organization: ${selectedOrg.name}`);
        INTERNAL_ORG_ID = selectedOrg.id;
        INTERNAL_ORG_NAME = selectedOrg.name;
        return selectedOrg;
    }

    // If no internal org exists, create one
    console.log('⚠️ No internal organization found. Creating Apillis organization...');

    const { data: newOrg, error: createError } = await supabase
        .from('organizations')
        .insert({
            name: 'Apillis',
            slug: 'apillis',
            organization_type: 'internal',
            industry: 'Software',
            description: 'Apillis Internal Operations',
            is_active: true
        })
        .select()
        .single();

    if (createError) {
        throw new Error(`Failed to create Apillis organization: ${createError.message}`);
    }

    console.log(`✅ Created new internal organization: ${newOrg.name}`);
    INTERNAL_ORG_ID = newOrg.id;
    INTERNAL_ORG_NAME = newOrg.name;
    return newOrg;
}

// Workflow stages configuration
const WORKFLOW_STAGES = [
    {
        id: '880e8400-e29b-41d4-a716-446655440001',
        name: 'Inquiry Received',
        slug: 'inquiry_received',
        description: 'Customer RFQ submitted and initial review completed',
        color: '#3B82F6',
        stage_order: 1,
        responsible_roles: ['sales', 'procurement'],
        estimated_duration_days: 20
    },
    {
        id: '880e8400-e29b-41d4-a716-446655440002',
        name: 'Technical Review',
        slug: 'technical_review',
        description: 'Engineering, QA, and Production teams review technical requirements',
        color: '#F59E0B',
        stage_order: 2,
        responsible_roles: ['engineering', 'qa', 'production'],
        estimated_duration_days: 10
    },
    {
        id: '880e8400-e29b-41d4-a716-446655440003',
        name: 'Supplier RFQ Sent',
        slug: 'supplier_rfq_sent',
        description: 'RFQs sent to qualified suppliers for component pricing and lead times',
        color: '#F97316',
        stage_order: 3,
        responsible_roles: ['procurement'],
        estimated_duration_days: 5
    },
    {
        id: '880e8400-e29b-41d4-a716-446655440004',
        name: 'Quoted',
        slug: 'quoted',
        description: 'Customer quote generated and sent based on supplier responses',
        color: '#10B981',
        stage_order: 4,
        responsible_roles: ['sales', 'procurement'],
        estimated_duration_days: 5
    },
    {
        id: '880e8400-e29b-41d4-a716-446655440005',
        name: 'Order Confirmed',
        slug: 'order_confirmed',
        description: 'Customer accepted quote and order confirmed',
        color: '#6366F1',
        stage_order: 5,
        responsible_roles: ['sales', 'procurement', 'production'],
        estimated_duration_days: 5
    },
    {
        id: '880e8400-e29b-41d4-a716-446655440006',
        name: 'Procurement Planning',
        slug: 'procurement_planning',
        description: 'BOM finalized, purchase orders issued, material planning completed',
        color: '#8B5CF6',
        stage_order: 6,
        responsible_roles: ['procurement', 'production'],
        estimated_duration_days: 5
    },
    {
        id: '880e8400-e29b-41d4-a716-446655440007',
        name: 'Production',
        slug: 'production',
        description: 'Manufacturing process initiated and quality control implemented',
        color: '#84CC16',
        stage_order: 7,
        responsible_roles: ['production', 'qa'],
        estimated_duration_days: 4
    },
    {
        id: '880e8400-e29b-41d4-a716-446655440008',
        name: 'Completed',
        slug: 'completed',
        description: 'Order fulfilled and delivered to customer',
        color: '#6B7280',
        stage_order: 8,
        responsible_roles: ['sales', 'production'],
        estimated_duration_days: 3
    }
];

async function seedWorkflowStages() {
    try {
        console.log('🏗️ Starting Workflow Stages Seeding for Internal Organization');
        console.log('===========================================================');
        console.log(`Supabase URL: ${SUPABASE_URL}`);
        console.log('');

        // Step 1: Find the correct internal organization
        console.log('1. Finding internal organization...');
        await findInternalOrganization();
        console.log(`✅ Using internal organization: ${INTERNAL_ORG_NAME} (${INTERNAL_ORG_ID})`);

        // Step 2: Get a user to use as created_by
        console.log('\n2. Getting a user for created_by...');

        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('organization_id', INTERNAL_ORG_ID)
            .eq('is_active', true)
            .limit(1);

        if (userError || !users || users.length === 0) {
            throw new Error('No users found in Factory Pulse Internal. Run organization structure fix first.');
        }

        const createdByUserId = users[0].id;
        console.log(`✅ Using user ${createdByUserId} as created_by`);

        // Step 3: Check existing workflow stages
        console.log('\n3. Checking existing workflow stages...');

        const { data: existingStages, error: checkError } = await supabase
            .from('workflow_stages')
            .select('id, slug, name')
            .eq('organization_id', INTERNAL_ORG_ID)
            .eq('is_active', true);

        if (checkError) {
            console.log(`⚠️ Could not check existing stages: ${checkError.message}`);
        }

        const existingStageMap = new Map();
        if (existingStages) {
            existingStages.forEach(stage => {
                existingStageMap.set(stage.slug, stage);
            });
        }

        console.log(`📊 Found ${existingStages?.length || 0} existing workflow stages`);

        // Step 4: Seed workflow stages
        console.log('\n4. Seeding workflow stages...');

        let createdCount = 0;
        let skippedCount = 0;

        for (const stageTemplate of WORKFLOW_STAGES) {
            if (existingStageMap.has(stageTemplate.slug)) {
                console.log(`⏭️ Skipping existing: ${stageTemplate.name} (${stageTemplate.slug})`);
                skippedCount++;
                continue;
            }

            const stageData = {
                id: stageTemplate.id,
                organization_id: INTERNAL_ORG_ID,
                name: stageTemplate.name,
                slug: stageTemplate.slug,
                description: stageTemplate.description,
                color: stageTemplate.color,
                stage_order: stageTemplate.stage_order,
                responsible_roles: stageTemplate.responsible_roles,
                estimated_duration_days: stageTemplate.estimated_duration_days,
                is_active: true,
                created_by: createdByUserId
            };

            const { error: insertError } = await supabase
                .from('workflow_stages')
                .insert(stageData);

            if (insertError) {
                console.log(`❌ Failed to create ${stageTemplate.name}: ${insertError.message}`);
            } else {
                console.log(`✅ Created: ${stageTemplate.name} (${stageTemplate.slug})`);
                createdCount++;
            }
        }

        // Step 5: Verify critical stages exist
        console.log('\n5. Verifying critical stages for RFQ submission...');

        const criticalStages = ['inquiry_received', 'order_confirmed', 'technical_review'];
        const { data: finalStages, error: finalError } = await supabase
            .from('workflow_stages')
            .select('slug, name, stage_order')
            .eq('organization_id', INTERNAL_ORG_ID)
            .eq('is_active', true)
            .in('slug', criticalStages);

        console.log('🎯 Critical stages verification:');
        if (finalError) {
            console.log(`❌ Error checking critical stages: ${finalError.message}`);
        } else {
            criticalStages.forEach(slug => {
                const stage = finalStages?.find(s => s.slug === slug);
                const status = stage ? '✅' : '❌';
                console.log(`   ${status} ${slug}: ${stage ? `Stage ${stage.stage_order} - ${stage.name}` : 'MISSING'}`);
            });
        }

        // Step 6: Show complete stage list
        console.log('\n6. Complete workflow stages list...');

        const { data: allStages, error: allError } = await supabase
            .from('workflow_stages')
            .select('stage_order, name, slug')
            .eq('organization_id', INTERNAL_ORG_ID)
            .eq('is_active', true)
            .order('stage_order');

        if (!allError && allStages) {
            console.log('📋 All workflow stages:');
            allStages.forEach(stage => {
                console.log(`   ${stage.stage_order}. ${stage.name} (${stage.slug})`);
            });
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🏗️ WORKFLOW STAGES SEEDING COMPLETE');
        console.log('='.repeat(60));

        console.log('\n📊 SUMMARY:');
        console.log(`   📋 Total stages defined: ${WORKFLOW_STAGES.length}`);
        console.log(`   ✅ Stages created: ${createdCount}`);
        console.log(`   ⏭️ Stages skipped: ${skippedCount}`);
        console.log(`   🎯 Critical stages present: ${criticalStages.filter(s => finalStages?.some(fs => fs.slug === s)).length}/${criticalStages.length}`);

        console.log('\n🏢 ORGANIZATION:');
        console.log(`   ✅ Factory Pulse Internal: ${factoryPulseOrg.name}`);
        console.log(`   ✅ Users available: ${users.length > 0 ? 'Yes' : 'No'}`);

        console.log('\n🎯 RESULT:');
        const hasAllCritical = criticalStages.every(s => finalStages?.some(fs => fs.slug === s));
        if (hasAllCritical && createdCount + skippedCount >= WORKFLOW_STAGES.length) {
            console.log('   ✅ Workflow stages setup COMPLETE');
            console.log('   ✅ RFQ submission should work');
            console.log('   🚀 Ready for project creation!');
        } else {
            console.log('   ⚠️ Some stages missing - check errors above');
        }

        console.log('\n📝 NOTES:');
        console.log('   • All workflow stages are now in Factory Pulse Internal');
        console.log('   • All users should belong to Factory Pulse Internal');
        console.log('   • Customer organizations are just data references');
        console.log('   • This enables proper project creation workflow');

        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('❌ Workflow stages seeding failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the seeding
if (require.main === module) {
    seedWorkflowStages().catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { seedWorkflowStages };
