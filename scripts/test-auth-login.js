#!/usr/bin/env node

/**
 * Test script to verify authentication users can sign in
 * Tests login for a few sample users with the default password
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Default password for all users
const DEFAULT_PASSWORD = 'Password@123';

// Test users to try logging in with
const TEST_USERS = [
    'admin@factorypulse.vn',
    'ceo@factorypulse.vn',
    'sales@factorypulse.vn',
    'engineering@factorypulse.vn'
];

// Create Supabase client with anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthLogin() {
    try {
        console.log('🧪 Testing authentication login for sample users...\n');

        let successCount = 0;
        let errorCount = 0;

        for (const email of TEST_USERS) {
            try {
                console.log(`Testing login for: ${email}...`);

                // Attempt to sign in
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: DEFAULT_PASSWORD
                });

                if (error) {
                    console.log(`❌ Login failed for ${email}: ${error.message}`);
                    errorCount++;
                } else {
                    console.log(`✅ Login successful for ${email}`);
                    console.log(`   User ID: ${data.user.id}`);
                    console.log(`   Role: ${data.user.user_metadata?.role || 'N/A'}`);
                    console.log(`   Name: ${data.user.user_metadata?.name || 'N/A'}`);

                    // Sign out after successful test
                    await supabase.auth.signOut();
                    successCount++;
                }

                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.log(`❌ Unexpected error for ${email}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Test Summary:');
        console.log(`✅ Successful logins: ${successCount}`);
        console.log(`❌ Failed logins: ${errorCount}`);
        console.log(`📧 Tested password: ${DEFAULT_PASSWORD}`);

        if (successCount === TEST_USERS.length) {
            console.log('\n🎉 All authentication tests passed! Users can successfully sign in.');
        } else {
            console.log('\n⚠️  Some authentication tests failed. Check the error messages above.');
            process.exit(1);
        }

    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the test
testAuthLogin();
