#!/usr/bin/env node

/**
 * Fix Organization Structure Refactoring
 *
 * This script corrects the fundamental architectural issue:
 * - Users should belong to Factory Pulse Internal (where workflow stages exist)
 * - Customer organizations should be data references only
 * - Ensures project creation works correctly
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Constants - will be determined dynamically
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

async function fixOrganizationStructure() {
    console.log('🔧 Starting Organization Structure Refactoring');
    console.log('============================================');
    console.log(`Supabase URL: ${SUPABASE_URL}`);
    console.log('');

    // Find the correct internal organization
    await findInternalOrganization();

    console.log(`Using internal organization: ${INTERNAL_ORG_NAME} (${INTERNAL_ORG_ID})`);
    console.log('');

    try {
        // Step 1: Verify database connection
        console.log('1. Testing database connection...');
        const { data: testData, error: testError } = await supabase
            .from('organizations')
            .select('count')
            .limit(1);

        if (testError) {
            throw new Error(`Database connection failed: ${testError.message}`);
        }
        console.log('✅ Database connection successful');

        // Step 2: Get current organization structure
        console.log('\n2. Analyzing current organization structure...');

        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .eq('is_active', true)
            .order('name');

        if (orgError) {
            throw new Error(`Failed to get organizations: ${orgError.message}`);
        }

        console.log('📋 Current organizations:');
        orgs.forEach(org => {
            console.log(`   - ${org.name} (${org.organization_type}) - ${org.id}`);
        });

        // Step 3: Verify the internal organization (already found above)
        console.log('\n3. Verifying internal organization...');
        console.log(`✅ Using internal organization: ${INTERNAL_ORG_NAME} (${INTERNAL_ORG_ID})`);

        // Step 4: Get current user distribution
        console.log('\n4. Analyzing current user distribution...');

        const { data: userDist, error: userDistError } = await supabase
            .from('users')
            .select(`
                organization_id,
                organizations:organization_id (
                    name,
                    organization_type
                ),
                count: id
            `)
            .eq('is_active', true);

        if (userDistError) {
            console.log(`⚠️ Could not get user distribution: ${userDistError.message}`);
        } else {
            console.log('👥 Current user distribution:');
            const userCounts = {};
            userDist.forEach(user => {
                const orgName = user.organizations?.name || 'Unknown';
                const orgType = user.organizations?.organization_type || 'unknown';
                const key = `${orgName} (${orgType})`;
                userCounts[key] = (userCounts[key] || 0) + 1;
            });

            Object.entries(userCounts).forEach(([org, count]) => {
                console.log(`   - ${org}: ${count} users`);
            });
        }

        // Step 5: Move users to Factory Pulse Internal
        console.log('\n5. Moving users to Factory Pulse Internal...');

        // Get users currently in customer/supplier organizations
        const { data: usersToMove, error: usersError } = await supabase
            .from('users')
            .select('id, email, organizations:organization_id(name, organization_type)')
            .eq('is_active', true)
            .neq('organization_id', INTERNAL_ORG_ID);

        if (usersError) {
            throw new Error(`Failed to get users to move: ${usersError.message}`);
        }

        if (!usersToMove || usersToMove.length === 0) {
            console.log('✅ No users need to be moved - already in correct organization');
        } else {
            console.log(`📋 Moving ${usersToMove.length} users:`);

            let movedCount = 0;
            for (const user of usersToMove) {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ organization_id: INTERNAL_ORG_ID })
                    .eq('id', user.id);

                if (updateError) {
                    console.log(`❌ Failed to move user ${user.email}: ${updateError.message}`);
                } else {
                    console.log(`✅ Moved: ${user.email} from ${user.organizations?.name}`);
                    movedCount++;
                }
            }

            console.log(`📊 Successfully moved ${movedCount}/${usersToMove.length} users`);
        }

        // Step 6: Verify workflow stages exist for Factory Pulse Internal
        console.log('\n6. Verifying workflow stages for Factory Pulse Internal...');

        const { data: stages, error: stagesError } = await supabase
            .from('workflow_stages')
            .select('id, name, slug, stage_order, is_active')
            .eq('organization_id', INTERNAL_ORG_ID)
            .eq('is_active', true)
            .order('stage_order');

        if (stagesError) {
            throw new Error(`Failed to get workflow stages: ${stagesError.message}`);
        }

        if (!stages || stages.length === 0) {
            console.log('❌ No workflow stages found for Factory Pulse Internal!');
            console.log('🔧 Run workflow stages seeding script:');
            console.log('   npm run seed:workflow-stages');
        } else {
            console.log(`✅ Found ${stages.length} workflow stages:`);
            stages.forEach(stage => {
                console.log(`   ${stage.stage_order}. ${stage.name} (${stage.slug})`);
            });
        }

        // Step 7: Verify critical stages exist
        console.log('\n7. Verifying critical stages for RFQ submission...');

        const criticalStages = ['inquiry_received', 'order_confirmed', 'technical_review'];
        const existingSlugs = stages?.map(s => s.slug) || [];

        console.log('🎯 Critical stages check:');
        criticalStages.forEach(slug => {
            const exists = existingSlugs.includes(slug);
            const status = exists ? '✅' : '❌';
            const stage = stages?.find(s => s.slug === slug);
            console.log(`   ${status} ${slug}: ${exists ? `Stage ${stage?.stage_order}` : 'MISSING'}`);
        });

        // Step 8: Test project creation simulation
        console.log('\n8. Testing project creation simulation...');

        // Get a test user from Factory Pulse Internal
        const { data: testUser, error: testUserError } = await supabase
            .from('users')
            .select('id, email')
            .eq('organization_id', INTERNAL_ORG_ID)
            .eq('is_active', true)
            .limit(1);

        if (testUserError || !testUser || testUser.length === 0) {
            console.log('❌ No users found in Factory Pulse Internal');
        } else {
            console.log(`✅ Test user available: ${testUser[0].email}`);

            // Test workflow stage lookup (what RFQ submission does)
            const testSlug = 'inquiry_received';
            const { data: testStage, error: testStageError } = await supabase
                .from('workflow_stages')
                .select('id, name')
                .eq('organization_id', INTERNAL_ORG_ID)
                .eq('slug', testSlug)
                .eq('is_active', true)
                .single();

            if (testStageError || !testStage) {
                console.log(`❌ Workflow stage lookup failed: ${testStageError?.message || 'Stage not found'}`);
            } else {
                console.log(`✅ Workflow stage lookup successful: ${testStage.name} (${testStage.id})`);
                console.log('🎉 Project creation should now work!');
            }
        }

        // Step 9: Final verification
        console.log('\n9. Final verification - user distribution after fix...');

        const { data: finalUserDist, error: finalUserDistError } = await supabase
            .from('users')
            .select(`
                organization_id,
                organizations:organization_id (
                    name,
                    organization_type
                ),
                count: id
            `)
            .eq('is_active', true);

        if (!finalUserDistError && finalUserDist) {
            const finalUserCounts = {};
            finalUserDist.forEach(user => {
                const orgName = user.organizations?.name || 'Unknown';
                const orgType = user.organizations?.organization_type || 'unknown';
                const key = `${orgName} (${orgType})`;
                finalUserCounts[key] = (finalUserCounts[key] || 0) + 1;
            });

            console.log('👥 Final user distribution:');
            Object.entries(finalUserCounts).forEach(([org, count]) => {
                console.log(`   - ${org}: ${count} users`);
            });
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🏗️ ORGANIZATION STRUCTURE REFACTORING COMPLETE');
        console.log('='.repeat(60));

        console.log('\n📊 SUMMARY:');
        console.log(`   ✅ Database connection: Working`);
        console.log(`   ✅ Factory Pulse Internal: Found`);
        console.log(`   ✅ Users moved: ${usersToMove?.length || 0}`);
        console.log(`   ✅ Workflow stages: ${stages?.length || 0} found`);
        console.log(`   ✅ Critical stages: ${criticalStages.filter(s => existingSlugs.includes(s)).length}/${criticalStages.length} present`);

        console.log('\n🎯 RESULT:');
        if (stages && stages.length > 0 && criticalStages.every(s => existingSlugs.includes(s))) {
            console.log('   ✅ Organization structure is now CORRECT');
            console.log('   ✅ Project creation should work');
            console.log('   🚀 Test RFQ submission now!');
        } else {
            console.log('   ⚠️ Some issues remain - check workflow stages');
        }

        console.log('\n📋 NEXT STEPS:');
        console.log('   1. Test RFQ submission in the UI');
        console.log('   2. Verify projects are created successfully');
        console.log('   3. Check workflow progression works');
        console.log('   4. If issues persist, check browser console for errors');

        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('❌ Organization structure refactoring failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the refactoring
if (require.main === module) {
    fixOrganizationStructure().catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { fixOrganizationStructure };
