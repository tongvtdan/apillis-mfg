#!/usr/bin/env node

/**
 * Script to create authentication users in Supabase for all users in public.users table
 * Default password: Password@123
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Default password for all users
const DEFAULT_PASSWORD = 'Password@123';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAuthUsers() {
    try {
        console.log('🚀 Starting authentication user creation...\n');

        // Get all users from public.users table
        const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('id, email, name, role')
            .order('role', { ascending: true });

        if (fetchError) {
            throw new Error(`Error fetching users: ${fetchError.message}`);
        }

        if (!users || users.length === 0) {
            console.log('❌ No users found in public.users table');
            return;
        }

        console.log(`📋 Found ${users.length} users to create authentication accounts for:\n`);

        // Display users to be created
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
        });

        console.log('\n🔐 Creating authentication users...\n');

        let successCount = 0;
        let errorCount = 0;

        // Create authentication users one by one
        for (const user of users) {
            try {
                console.log(`Creating auth user for: ${user.name} (${user.email})...`);

                // Create user in auth.users table
                const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
                    email: user.email,
                    password: DEFAULT_PASSWORD,
                    email_confirm: true, // Auto-confirm email
                    user_metadata: {
                        name: user.name,
                        role: user.role,
                        public_user_id: user.id // Link to public.users.id
                    }
                });

                if (createError) {
                    console.log(`❌ Error creating auth user for ${user.email}: ${createError.message}`);
                    errorCount++;
                } else {
                    console.log(`✅ Successfully created auth user for ${user.email} (ID: ${authUser.user.id})`);
                    successCount++;
                }

                // Small delay to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.log(`❌ Unexpected error for ${user.email}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successfully created: ${successCount} users`);
        console.log(`❌ Errors: ${errorCount} users`);
        console.log(`📧 Default password for all users: ${DEFAULT_PASSWORD}`);
        console.log('\n🎉 Authentication user creation completed!');

        if (errorCount > 0) {
            console.log('\n⚠️  Some users failed to create. Check the error messages above.');
            process.exit(1);
        }

    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the script
createAuthUsers();
