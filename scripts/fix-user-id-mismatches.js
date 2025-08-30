#!/usr/bin/env node

/**
 * Fix User ID Mismatches Script
 * 
 * This script fixes the ID mismatches between auth.users and public.users
 * by updating foreign key references first, then updating the user IDs
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

// Users with ID mismatches (from the test results)
const userMismatches = [
    {
        email: 'admin@factorypulse.vn',
        name: 'Nguyễn Văn Admin',
        oldId: '083f04db-458a-416b-88e9-94acf10382f8',
        newId: 'e562c228-5322-4ed3-8998-d06f060c367e'
    },
    {
        email: 'ceo@factorypulse.vn',
        name: 'Trần Thị CEO',
        oldId: '99845907-7255-4155-9dd0-c848ab9860cf',
        newId: '1ca3818e-878a-495f-a2a4-1657c82267d4'
    },
    {
        email: 'sales@factorypulse.vn',
        name: 'Lê Văn Sales',
        oldId: 'a1f24ed5-319e-4b66-8d21-fbc70d07ea09',
        newId: 'bd501374-d7ef-48ef-a166-48d066ec4b8a'
    },
    {
        email: 'procurement@factorypulse.vn',
        name: 'Phạm Thị Procurement',
        oldId: 'c91843ad-4327-429a-bf57-2b891df50e18',
        newId: 'b6793310-b9be-48be-8643-9e1ad1d9b496'
    },
    {
        email: 'engineering@factorypulse.vn',
        name: 'Hoàng Văn Engineering',
        oldId: '776edb76-953a-4482-9533-c793a633cc27',
        newId: '7c6e33b0-e4b7-4fca-9f8a-efe520266e41'
    }
];

async function updateForeignKeyReferences(oldId, newId, userName) {
    console.log(`\n🔄 Updating foreign key references for ${userName}...`);

    let updateCount = 0;
    let errorCount = 0;

    // Tables that might reference user IDs
    const tablesToUpdate = [
        { table: 'projects', column: 'assigned_to' },
        { table: 'projects', column: 'created_by' },
        { table: 'project_assignments', column: 'user_id' },
        { table: 'documents', column: 'uploaded_by' },
        { table: 'reviews', column: 'reviewer_id' },
        { table: 'reviews', column: 'created_by' },
        { table: 'messages', column: 'sender_id' },
        { table: 'notifications', column: 'user_id' },
        { table: 'activity_log', column: 'user_id' }
    ];

    for (const { table, column } of tablesToUpdate) {
        try {
            // Check if there are any records to update
            const { count, error: countError } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })
                .eq(column, oldId);

            if (countError) {
                console.error(`❌ Error checking ${table}.${column}:`, countError.message);
                errorCount++;
                continue;
            }

            if (count > 0) {
                // Update the references
                const { error: updateError } = await supabase
                    .from(table)
                    .update({ [column]: newId })
                    .eq(column, oldId);

                if (updateError) {
                    console.error(`❌ Error updating ${table}.${column}:`, updateError.message);
                    errorCount++;
                } else {
                    console.log(`✅ Updated ${count} records in ${table}.${column}`);
                    updateCount += count;
                }
            }
        } catch (error) {
            console.error(`❌ Unexpected error updating ${table}.${column}:`, error.message);
            errorCount++;
        }
    }

    console.log(`   📊 Total references updated: ${updateCount}`);
    return errorCount === 0;
}

async function updateUserIdInUsersTable(oldId, newId, userName) {
    console.log(`\n🔄 Updating user ID in users table for ${userName}...`);

    try {
        // Update the user ID in the users table
        const { error: updateError } = await supabase
            .from('users')
            .update({ id: newId })
            .eq('id', oldId);

        if (updateError) {
            console.error(`❌ Error updating users table ID:`, updateError.message);
            return false;
        }

        console.log(`✅ Successfully updated user ID: ${oldId} → ${newId}`);
        return true;

    } catch (error) {
        console.error(`❌ Unexpected error updating user ID:`, error.message);
        return false;
    }
}

async function fixUserIdMismatch(userMismatch) {
    console.log(`\n👤 Fixing ID mismatch for: ${userMismatch.name} (${userMismatch.email})`);
    console.log(`   🔗 Old ID: ${userMismatch.oldId}`);
    console.log(`   🔗 New ID: ${userMismatch.newId}`);

    // Step 1: Update all foreign key references
    const foreignKeySuccess = await updateForeignKeyReferences(
        userMismatch.oldId,
        userMismatch.newId,
        userMismatch.name
    );

    if (!foreignKeySuccess) {
        console.error(`❌ Failed to update foreign key references for ${userMismatch.name}`);
        return false;
    }

    // Step 2: Update the user ID in the users table
    const userIdSuccess = await updateUserIdInUsersTable(
        userMismatch.oldId,
        userMismatch.newId,
        userMismatch.name
    );

    if (!userIdSuccess) {
        console.error(`❌ Failed to update user ID for ${userMismatch.name}`);
        return false;
    }

    console.log(`✅ Successfully fixed ID mismatch for ${userMismatch.name}`);
    return true;
}

async function verifyFixes() {
    console.log('\n🔍 Verifying ID mismatch fixes...');

    let successCount = 0;
    let errorCount = 0;

    for (const userMismatch of userMismatches) {
        try {
            // Check if user exists with the new ID
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, name')
                .eq('id', userMismatch.newId)
                .single();

            if (error || !user) {
                console.error(`❌ User not found with new ID: ${userMismatch.email}`);
                errorCount++;
            } else {
                console.log(`✅ Verified: ${user.name} (${user.email}) - ID: ${user.id}`);
                successCount++;
            }
        } catch (error) {
            console.error(`❌ Error verifying ${userMismatch.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Verification Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${userMismatches.length}`);

    return errorCount === 0;
}

async function main() {
    console.log('🚀 Fixing User ID Mismatches...');
    console.log(`📋 Found ${userMismatches.length} users with ID mismatches to fix`);

    try {
        let overallSuccess = true;

        // Fix each user ID mismatch
        for (const userMismatch of userMismatches) {
            const success = await fixUserIdMismatch(userMismatch);
            if (!success) {
                overallSuccess = false;
            }
        }

        // Verify all fixes
        const verificationSuccess = await verifyFixes();

        if (overallSuccess && verificationSuccess) {
            console.log('\n🎉 All User ID Mismatches Fixed Successfully!');
            console.log('\n📝 Summary:');
            console.log('   ✅ All foreign key references updated');
            console.log('   ✅ All user IDs synchronized between auth.users and public.users');
            console.log('   ✅ Perfect ID matching restored');
            console.log('\n🔄 Next: Run the authentication test script to verify everything works');
            process.exit(0);
        } else {
            console.log('\n❌ Some ID mismatch fixes failed');
            console.log('   Please check the errors above and retry');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Fatal error during ID mismatch fixing:', error);
        process.exit(1);
    }
}

// Run the script
main();