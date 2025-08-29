#!/usr/bin/env node

/**
 * Script to test authentication for synchronized users
 * This verifies that users can sign in and that their IDs match between auth and table
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Default password for all users
const DEFAULT_PASSWORD = 'Password@123';

// Test users (sample of different roles)
const TEST_USERS = [
    {
        email: 'admin@factorypulse.vn',
        name: 'Nguyễn Văn Admin',
        role: 'admin'
    },
    {
        email: 'sales@factorypulse.vn',
        name: 'Lê Văn Sales',
        role: 'sales'
    },
    {
        email: 'engineering@factorypulse.vn',
        name: 'Hoàng Văn Engineering',
        role: 'engineering'
    },
    {
        email: 'qa@factorypulse.vn',
        name: 'Đặng Văn QA',
        role: 'qa'
    }
];

async function testSyncedAuthentication() {
    try {
        console.log('🧪 Testing synchronized user authentication...\n');
        console.log('📋 Testing login for 4 sample users to verify ID synchronization\n');

        let successCount = 0;
        let errorCount = 0;

        for (const testUser of TEST_USERS) {
            try {
                console.log(`🔐 Testing authentication for: ${testUser.name} (${testUser.email})...`);

                // Create a new client for each test to avoid session conflicts
                const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

                // Attempt to sign in
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: testUser.email,
                    password: DEFAULT_PASSWORD
                });

                if (signInError) {
                    console.log(`❌ Sign in failed for ${testUser.email}: ${signInError.message}`);
                    errorCount++;
                    continue;
                }

                if (!signInData.user) {
                    console.log(`❌ No user data returned for ${testUser.email}`);
                    errorCount++;
                    continue;
                }

                const authUserId = signInData.user.id;
                console.log(`✅ Sign in successful for ${testUser.email}`);
                console.log(`   Auth User ID: ${authUserId}`);

                // Now fetch the user from the users table to verify synchronization
                const { data: tableUser, error: fetchError } = await supabase
                    .from('users')
                    .select('id, email, name, role, department, employee_id')
                    .eq('email', testUser.email)
                    .single();

                if (fetchError) {
                    console.log(`❌ Error fetching table user for ${testUser.email}: ${fetchError.message}`);
                    errorCount++;
                    continue;
                }

                if (!tableUser) {
                    console.log(`❌ No table user found for ${testUser.email}`);
                    errorCount++;
                    continue;
                }

                console.log(`   Table User ID: ${tableUser.id}`);
                console.log(`   Role: ${tableUser.role}`);
                console.log(`   Department: ${tableUser.department}`);

                // Verify ID synchronization
                if (authUserId === tableUser.id) {
                    console.log(`✅ ID SYNCHRONIZATION VERIFIED: ${authUserId} === ${tableUser.id}`);
                    successCount++;
                } else {
                    console.log(`❌ ID MISMATCH: ${authUserId} !== ${tableUser.id}`);
                    errorCount++;
                }

                // Sign out to clean up
                await supabase.auth.signOut();

                console.log(''); // Empty line for readability

            } catch (error) {
                console.log(`❌ Unexpected error for ${testUser.email}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('📊 Authentication Test Summary:');
        console.log(`✅ Successful tests: ${successCount}`);
        console.log(`❌ Failed tests: ${errorCount}`);

        if (successCount === TEST_USERS.length) {
            console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!');
            console.log('✅ Users can successfully sign in');
            console.log('✅ User IDs are perfectly synchronized between auth.users and users table');
            console.log('✅ Authentication system is working correctly');
        } else {
            console.log('\n⚠️  SOME TESTS FAILED');
            console.log('Please review the errors above');
        }

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the authentication test
testSyncedAuthentication();
