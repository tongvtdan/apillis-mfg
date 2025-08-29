#!/usr/bin/env node

/**
 * Final script to fix UID mismatch by properly handling foreign key constraints
 * This script updates all foreign key references first, then updates the user IDs
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixUidMismatchFinal() {
    try {
        console.log('🔧 Starting final UID mismatch fix...\n');

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

        // Create a mapping of old user IDs to new user IDs
        const userMapping = new Map();

        for (const authUser of authUsers.users) {
            const email = authUser.email;
            const authUserId = authUser.id;
            const publicUserId = authUser.user_metadata?.public_user_id;

            if (publicUserId && publicUserId !== authUserId) {
                userMapping.set(publicUserId, authUserId);
                console.log(`📝 Mapping: ${publicUserId} → ${authUserId} (${email})`);
            }
        }

        if (userMapping.size === 0) {
            console.log('✅ No UID mismatches found!');
            return;
        }

        console.log(`\n🔄 Found ${userMapping.size} users with UID mismatches to fix`);

        // Step 1: Update all foreign key references
        console.log('\n🔧 Step 1: Updating foreign key references...');

        // Update projects table
        for (const [oldId, newId] of userMapping) {
            console.log(`   Updating projects.assigned_to: ${oldId} → ${newId}`);
            const { error } = await supabase
                .from('projects')
                .update({ assigned_to: newId })
                .eq('assigned_to', oldId);

            if (error) {
                console.log(`   ⚠️  Warning updating projects.assigned_to: ${error.message}`);
            }

            console.log(`   Updating projects.created_by: ${oldId} → ${newId}`);
            const { error: error2 } = await supabase
                .from('projects')
                .update({ created_by: newId })
                .eq('created_by', oldId);

            if (error2) {
                console.log(`   ⚠️  Warning updating projects.created_by: ${error2.message}`);
            }
        }

        // Update project_assignments table
        for (const [oldId, newId] of userMapping) {
            console.log(`   Updating project_assignments.user_id: ${oldId} → ${newId}`);
            const { error } = await supabase
                .from('project_assignments')
                .update({ user_id: newId })
                .eq('user_id', oldId);

            if (error) {
                console.log(`   ⚠️  Warning updating project_assignments.user_id: ${error.message}`);
            }
        }

        // Update other tables that reference users
        const tablesToUpdate = [
            { table: 'documents', column: 'uploaded_by' },
            { table: 'messages', column: 'sender_user_id' },
            { table: 'messages', column: 'recipient_user_id' },
            { table: 'reviews', column: 'reviewer_id' },
            { table: 'notifications', column: 'user_id' },
            { table: 'activity_log', column: 'user_id' }
        ];

        for (const { table, column } of tablesToUpdate) {
            for (const [oldId, newId] of userMapping) {
                console.log(`   Updating ${table}.${column}: ${oldId} → ${newId}`);
                const { error } = await supabase
                    .from(table)
                    .update({ [column]: newId })
                    .eq(column, oldId);

                if (error) {
                    console.log(`   ⚠️  Warning updating ${table}.${column}: ${error.message}`);
                }
            }
        }

        // Update users table references
        for (const [oldId, newId] of userMapping) {
            console.log(`   Updating users.direct_manager_id: ${oldId} → ${newId}`);
            const { error } = await supabase
                .from('users')
                .update({ direct_manager_id: newId })
                .eq('direct_manager_id', oldId);

            if (error) {
                console.log(`   ⚠️  Warning updating users.direct_manager_id: ${error.message}`);
            }
        }

        // Step 2: Update user IDs
        console.log('\n🔧 Step 2: Updating user IDs...');
        let updatedCount = 0;

        for (const [oldId, newId] of userMapping) {
            console.log(`   Updating user ID: ${oldId} → ${newId}`);

            const { error } = await supabase
                .from('users')
                .update({ id: newId })
                .eq('id', oldId);

            if (error) {
                console.log(`   ❌ Error updating user ID: ${error.message}`);
            } else {
                console.log(`   ✅ Successfully updated user ID`);
                updatedCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successfully updated: ${updatedCount} users`);
        console.log(`📝 Total users processed: ${userMapping.size}`);

        if (updatedCount > 0) {
            console.log('\n🎉 Final UID mismatch fix completed successfully!');
            console.log('🔄 You may need to restart the application for changes to take effect.');
        } else {
            console.log('\n⚠️  No users were updated. Check the error messages above.');
        }

    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the script
fixUidMismatchFinal();
