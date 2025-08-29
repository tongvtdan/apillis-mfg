#!/usr/bin/env node

/**
 * Script to fix UID mismatch between auth.users and users table
 * Updates users table to use the correct auth user IDs
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixUidMismatch() {
    try {
        console.log('🔧 Starting UID mismatch fix...\n');

        // Get all auth users
        console.log('📋 Getting all auth users...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            throw new Error(`Error fetching auth users: ${authError.message}`);
        }

        if (!authUsers || authUsers.users.length === 0) {
            console.log('❌ No auth users found');
            return;
        }

        console.log(`📊 Found ${authUsers.users.length} auth users`);

        // Process each auth user
        let updatedCount = 0;
        let errorCount = 0;

        for (const authUser of authUsers.users) {
            try {
                const email = authUser.email;
                const authUserId = authUser.id;
                const publicUserId = authUser.user_metadata?.public_user_id;

                console.log(`\n🔍 Processing: ${email}`);
                console.log(`   Auth User ID: ${authUserId}`);
                console.log(`   Public User ID: ${publicUserId || 'Not found'}`);

                if (!publicUserId) {
                    console.log(`   ⚠️  No public_user_id in metadata, skipping...`);
                    continue;
                }

                // Check if user exists in public.users table
                const { data: existingUser, error: userError } = await supabase
                    .from('users')
                    .select('id, email, name')
                    .eq('id', publicUserId)
                    .single();

                if (userError && userError.code !== 'PGRST116') { // PGRST116 = not found
                    console.log(`   ❌ Error checking user: ${userError.message}`);
                    errorCount++;
                    continue;
                }

                if (!existingUser) {
                    console.log(`   ⚠️  User not found in public.users table, skipping...`);
                    continue;
                }

                // Update the user record to use the auth user ID
                const { error: updateError } = await supabase
                    .from('users')
                    .update({
                        id: authUserId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', publicUserId);

                if (updateError) {
                    console.log(`   ❌ Error updating user: ${updateError.message}`);
                    errorCount++;
                } else {
                    console.log(`   ✅ Successfully updated user ID from ${publicUserId} to ${authUserId}`);
                    updatedCount++;
                }

            } catch (error) {
                console.log(`   ❌ Unexpected error: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successfully updated: ${updatedCount} users`);
        console.log(`❌ Errors: ${errorCount} users`);

        if (updatedCount > 0) {
            console.log('\n🎉 UID mismatch fix completed successfully!');
            console.log('🔄 You may need to restart the application for changes to take effect.');
        } else {
            console.log('\n⚠️  No users were updated. The issue might be elsewhere.');
        }

    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the script
fixUidMismatch();
