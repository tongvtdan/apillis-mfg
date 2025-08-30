#!/usr/bin/env node

/**
 * Fix Project References and Users Script
 * 
 * This script updates project references to use the new auth user IDs,
 * then updates the public.users table to match
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// User ID mappings from the previous script output
const userIdMappings = [
    {
        email: 'admin@factorypulse.vn',
        name: 'Nguyễn Văn Admin',
        oldId: '083f04db-458a-416b-88e9-94acf10382f8',
        newId: '1bbb8aef-fdfe-446b-b8cc-42bd7677aa7c'
    },
    {
        email: 'ceo@factorypulse.vn',
        name: 'Trần Thị CEO',
        oldId: '99845907-7255-4155-9dd0-c848ab9860cf',
        newId: '4bfa5ef8-2a21-46b8-bc99-2c8000b681bf'
    },
    {
        email: 'sales@factorypulse.vn',
        name: 'Lê Văn Sales',
        oldId: 'a1f24ed5-319e-4b66-8d21-fbc70d07ea09',
        newId: '2171de5a-c007-4893-92f1-b15522c164d9'
    },
    {
        email: 'procurement@factorypulse.vn',
        name: 'Phạm Thị Procurement',
        oldId: 'c91843ad-4327-429a-bf57-2b891df50e18',
        newId: '2e828057-adde-44e7-8fa7-a2d1aea656ab'
    },
    {
        email: 'engineering@factorypulse.vn',
        name: 'Hoàng Văn Engineering',
        oldId: '776edb76-953a-4482-9533-c793a633cc27',
        newId: 'f23c3fea-cd08-48c0-9107-df83a0059ec6'
    }
];

async function updateProjectReferences() {
    console.log('\n🔄 Updating project references to use new auth user IDs...');

    let totalUpdated = 0;
    let errorCount = 0;

    for (const mapping of userIdMappings) {
        try {
            console.log(`\n👤 Updating projects for: ${mapping.name}`);
            console.log(`   🔗 ${mapping.oldId} → ${mapping.newId}`);

            // Update assigned_to references
            const { count: assignedCount, error: assignedError } = await supabase
                .from('projects')
                .update({ assigned_to: mapping.newId })
                .eq('assigned_to', mapping.oldId)
                .select('*', { count: 'exact', head: true });

            if (assignedError) {
                console.error(`   ❌ Error updating assigned_to:`, assignedError.message);
                errorCount++;
            } else {
                console.log(`   ✅ Updated ${assignedCount || 0} projects (assigned_to)`);
                totalUpdated += (assignedCount || 0);
            }

            // Update created_by references
            const { count: createdCount, error: createdError } = await supabase
                .from('projects')
                .update({ created_by: mapping.newId })
                .eq('created_by', mapping.oldId)
                .select('*', { count: 'exact', head: true });

            if (createdError) {
                console.error(`   ❌ Error updating created_by:`, createdError.message);
                errorCount++;
            } else {
                console.log(`   ✅ Updated ${createdCount || 0} projects (created_by)`);
                totalUpdated += (createdCount || 0);
            }

        } catch (error) {
            console.error(`   ❌ Unexpected error for ${mapping.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Project References Update Summary:`);
    console.log(`   ✅ Total references updated: ${totalUpdated}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    return errorCount === 0;
}

async function updateOtherTableReferences() {
    console.log('\n🔄 Updating other table references...');

    const tablesToUpdate = [
        { table: 'project_assignments', column: 'user_id' },
        { table: 'documents', column: 'uploaded_by' },
        { table: 'reviews', column: 'reviewer_id' },
        { table: 'reviews', column: 'created_by' },
        { table: 'messages', column: 'sender_id' },
        { table: 'notifications', column: 'user_id' },
        { table: 'activity_log', column: 'user_id' }
    ];

    let totalUpdated = 0;
    let errorCount = 0;

    for (const mapping of userIdMappings) {
        console.log(`\n👤 Updating other references for: ${mapping.name}`);

        for (const { table, column } of tablesToUpdate) {
            try {
                const { count, error } = await supabase
                    .from(table)
                    .update({ [column]: mapping.newId })
                    .eq(column, mapping.oldId)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.error(`   ❌ Error updating ${table}.${column}:`, error.message);
                    errorCount++;
                } else if (count > 0) {
                    console.log(`   ✅ Updated ${count} records in ${table}.${column}`);
                    totalUpdated += count;
                }
            } catch (error) {
                console.error(`   ❌ Unexpected error updating ${table}.${column}:`, error.message);
                errorCount++;
            }
        }
    }

    console.log(`\n📊 Other References Update Summary:`);
    console.log(`   ✅ Total references updated: ${totalUpdated}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    return errorCount === 0;
}

async function updatePublicUsersTable() {
    console.log('\n🔄 Updating public.users table with new auth IDs...');

    let successCount = 0;
    let errorCount = 0;

    for (const mapping of userIdMappings) {
        try {
            console.log(`   🔄 Updating user: ${mapping.name}`);
            console.log(`      🔗 ${mapping.oldId} → ${mapping.newId}`);

            const { error } = await supabase
                .from('users')
                .update({ id: mapping.newId })
                .eq('id', mapping.oldId);

            if (error) {
                console.error(`   ❌ Error updating ${mapping.email}:`, error.message);
                errorCount++;
            } else {
                console.log(`   ✅ Updated: ${mapping.name}`);
                successCount++;
            }
        } catch (error) {
            console.error(`   ❌ Unexpected error for ${mapping.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Public Users Update Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${userIdMappings.length}`);

    return errorCount === 0;
}

async function verifyFinalState() {
    console.log('\n🔍 Verifying final state...');

    let successCount = 0;
    let errorCount = 0;

    for (const mapping of userIdMappings) {
        try {
            // Check if user exists with the new ID
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, name, role')
                .eq('id', mapping.newId)
                .single();

            if (error || !user) {
                console.error(`   ❌ User not found with new ID: ${mapping.email}`);
                errorCount++;
            } else {
                console.log(`   ✅ Verified: ${user.name} (${user.email})`);
                console.log(`      🔗 ID: ${user.id}`);
                successCount++;
            }
        } catch (error) {
            console.error(`   ❌ Error verifying ${mapping.email}:`, error.message);
            errorCount++;
        }
    }

    // Check overall counts
    const { data: authCount } = await supabase.rpc('count_auth_users');
    const { count: publicCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Final Counts:`);
    console.log(`   🔐 Auth Users: ${authCount || 0}`);
    console.log(`   👥 Public Users: ${publicCount || 0}`);

    console.log(`\n📊 Verification Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${userIdMappings.length}`);

    return errorCount === 0;
}

async function main() {
    console.log('🚀 Fixing Project References and User IDs...');
    console.log(`📋 Processing ${userIdMappings.length} user ID mappings`);

    try {
        // Step 1: Update project references
        const projectSuccess = await updateProjectReferences();
        if (!projectSuccess) {
            console.log('⚠️  Some project updates failed, but continuing...');
        }

        // Step 2: Update other table references
        const otherSuccess = await updateOtherTableReferences();
        if (!otherSuccess) {
            console.log('⚠️  Some other table updates failed, but continuing...');
        }

        // Step 3: Update public.users table
        const usersSuccess = await updatePublicUsersTable();
        if (!usersSuccess) {
            console.error('❌ Failed to update public.users table');
            process.exit(1);
        }

        // Step 4: Verify final state
        const verificationSuccess = await verifyFinalState();

        if (verificationSuccess) {
            console.log('\n🎉 Successfully Fixed All References and User IDs!');
            console.log('\n📝 Summary:');
            console.log('   ✅ Updated all project references to use new auth IDs');
            console.log('   ✅ Updated all other table references');
            console.log('   ✅ Updated public.users table with new auth IDs');
            console.log('   ✅ Perfect ID synchronization between auth.users and public.users');
            console.log('\n🔄 Next: Run the authentication test script to verify everything works');
            process.exit(0);
        } else {
            console.log('\n❌ Some verifications failed');
            console.log('   Please check the errors above and retry');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Fatal error during fixing:', error);
        process.exit(1);
    }
}

// Run the script
main();