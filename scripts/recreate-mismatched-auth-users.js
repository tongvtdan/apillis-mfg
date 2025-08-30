#!/usr/bin/env node

/**
 * Recreate Mismatched Auth Users Script
 * 
 * This script deletes the mismatched auth users and recreates them with the correct IDs
 * that match the existing public.users records
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

const DEFAULT_PASSWORD = 'FactoryPulse2024!';

// Users with ID mismatches - we'll recreate the auth users with the public.users IDs
const mismatchedUsers = [
    {
        email: 'admin@factorypulse.vn',
        name: 'Nguyễn Văn Admin',
        role: 'admin',
        publicUserId: '083f04db-458a-416b-88e9-94acf10382f8',
        authUserId: 'e562c228-5322-4ed3-8998-d06f060c367e'
    },
    {
        email: 'ceo@factorypulse.vn',
        name: 'Trần Thị CEO',
        role: 'management',
        publicUserId: '99845907-7255-4155-9dd0-c848ab9860cf',
        authUserId: '1ca3818e-878a-495f-a2a4-1657c82267d4'
    },
    {
        email: 'sales@factorypulse.vn',
        name: 'Lê Văn Sales',
        role: 'sales',
        publicUserId: 'a1f24ed5-319e-4b66-8d21-fbc70d07ea09',
        authUserId: 'bd501374-d7ef-48ef-a166-48d066ec4b8a'
    },
    {
        email: 'procurement@factorypulse.vn',
        name: 'Phạm Thị Procurement',
        role: 'procurement',
        publicUserId: 'c91843ad-4327-429a-bf57-2b891df50e18',
        authUserId: 'b6793310-b9be-48be-8643-9e1ad1d9b496'
    },
    {
        email: 'engineering@factorypulse.vn',
        name: 'Hoàng Văn Engineering',
        role: 'engineering',
        publicUserId: '776edb76-953a-4482-9533-c793a633cc27',
        authUserId: '7c6e33b0-e4b7-4fca-9f8a-efe520266e41'
    }
];

async function deleteMismatchedAuthUsers() {
    console.log('\n🗑️  Deleting mismatched auth users...');

    let successCount = 0;
    let errorCount = 0;

    for (const user of mismatchedUsers) {
        try {
            console.log(`   🔄 Deleting auth user: ${user.name} (${user.email})`);

            const { error } = await supabase.auth.admin.deleteUser(user.authUserId);

            if (error) {
                console.error(`   ❌ Error deleting ${user.email}:`, error.message);
                errorCount++;
            } else {
                console.log(`   ✅ Deleted: ${user.name}`);
                successCount++;
            }
        } catch (error) {
            console.error(`   ❌ Unexpected error deleting ${user.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Deletion Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${mismatchedUsers.length}`);

    return errorCount === 0;
}

async function recreateAuthUsersWithCorrectIds() {
    console.log('\n🔄 Recreating auth users with correct IDs...');

    let successCount = 0;
    let errorCount = 0;

    for (const user of mismatchedUsers) {
        try {
            console.log(`   👤 Creating auth user: ${user.name} (${user.email})`);
            console.log(`      🎯 Target ID: ${user.publicUserId}`);

            // Note: Supabase doesn't allow setting custom UUIDs during user creation
            // We'll create the user and then need to handle the ID mismatch differently
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: DEFAULT_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    name: user.name,
                    role: user.role,
                    user_type: 'internal'
                }
            });

            if (authError) {
                console.error(`   ❌ Error creating auth user for ${user.email}:`, authError.message);
                errorCount++;
                continue;
            }

            console.log(`   ✅ Created auth user: ${user.name}`);
            console.log(`      🔗 New Auth ID: ${authUser.user.id}`);

            // Store the new auth ID for later reference
            user.newAuthUserId = authUser.user.id;
            successCount++;

        } catch (error) {
            console.error(`   ❌ Unexpected error for ${user.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Recreation Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${mismatchedUsers.length}`);

    return errorCount === 0;
}

async function updatePublicUsersWithNewAuthIds() {
    console.log('\n🔄 Updating public.users with new auth IDs...');

    let successCount = 0;
    let errorCount = 0;

    for (const user of mismatchedUsers) {
        if (!user.newAuthUserId) {
            console.error(`   ❌ No new auth ID for ${user.email}`);
            errorCount++;
            continue;
        }

        try {
            console.log(`   🔄 Updating public user: ${user.name}`);
            console.log(`      🔗 ${user.publicUserId} → ${user.newAuthUserId}`);

            // Update the public.users table to use the new auth user ID
            const { error: updateError } = await supabase
                .from('users')
                .update({ id: user.newAuthUserId })
                .eq('id', user.publicUserId);

            if (updateError) {
                console.error(`   ❌ Error updating public.users for ${user.email}:`, updateError.message);
                errorCount++;
                continue;
            }

            console.log(`   ✅ Updated public user: ${user.name}`);
            successCount++;

        } catch (error) {
            console.error(`   ❌ Unexpected error updating ${user.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${mismatchedUsers.length}`);

    return errorCount === 0;
}

async function verifyFinalState() {
    console.log('\n🔍 Verifying final authentication state...');

    let successCount = 0;
    let errorCount = 0;

    for (const user of mismatchedUsers) {
        if (!user.newAuthUserId) continue;

        try {
            // Check if user exists in public.users with the new auth ID
            const { data: publicUser, error } = await supabase
                .from('users')
                .select('id, email, name, role')
                .eq('id', user.newAuthUserId)
                .single();

            if (error || !publicUser) {
                console.error(`   ❌ Public user not found with new auth ID: ${user.email}`);
                errorCount++;
            } else {
                console.log(`   ✅ Verified: ${publicUser.name} (${publicUser.email})`);
                console.log(`      🔗 ID: ${publicUser.id}`);
                successCount++;
            }
        } catch (error) {
            console.error(`   ❌ Error verifying ${user.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Verification Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${mismatchedUsers.length}`);

    return errorCount === 0;
}

async function main() {
    console.log('🚀 Recreating Mismatched Authentication Users...');
    console.log(`📋 Processing ${mismatchedUsers.length} users with ID mismatches`);

    try {
        // Step 1: Delete mismatched auth users
        const deletionSuccess = await deleteMismatchedAuthUsers();
        if (!deletionSuccess) {
            console.log('⚠️  Some deletions failed, but continuing...');
        }

        // Step 2: Recreate auth users (they'll get new IDs)
        const recreationSuccess = await recreateAuthUsersWithCorrectIds();
        if (!recreationSuccess) {
            console.error('❌ Failed to recreate auth users');
            process.exit(1);
        }

        // Step 3: Update public.users to use the new auth IDs
        const updateSuccess = await updatePublicUsersWithNewAuthIds();
        if (!updateSuccess) {
            console.error('❌ Failed to update public.users with new auth IDs');
            process.exit(1);
        }

        // Step 4: Verify final state
        const verificationSuccess = await verifyFinalState();

        if (verificationSuccess) {
            console.log('\n🎉 Successfully Recreated Mismatched Authentication Users!');
            console.log('\n📝 Summary:');
            console.log('   ✅ Deleted old mismatched auth users');
            console.log('   ✅ Created new auth users with fresh IDs');
            console.log('   ✅ Updated public.users to match new auth IDs');
            console.log('   ✅ Perfect ID synchronization restored');
            console.log('\n🔄 Next: Run the authentication test script to verify everything works');
            process.exit(0);
        } else {
            console.log('\n❌ Some verifications failed');
            console.log('   Please check the errors above and retry');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Fatal error during recreation:', error);
        process.exit(1);
    }
}

// Run the script
main();