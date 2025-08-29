#!/usr/bin/env node

/**
 * Test Organization Authentication Users
 * 
 * This script tests that all newly created organization users can authenticate
 * successfully with their credentials.
 * 
 * Tests:
 * 1. Sign in with each user
 * 2. Verify user metadata and session
 * 3. Sign out successfully
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../env.local') });

// Initialize Supabase client with service role key for database access
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test credentials
const TEST_PASSWORD = 'Password@123';

/**
 * Test authentication for a single user
 */
async function testUserAuthentication(email, expectedType, companyName) {
    try {
        console.log(`   🔐 Testing: ${email}`);

        // Sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: TEST_PASSWORD
        });

        if (signInError) {
            throw new Error(`Sign in failed: ${signInError.message}`);
        }

        if (!signInData.user) {
            throw new Error('No user returned from sign in');
        }

        // Verify user metadata
        const user = signInData.user;
        const metadata = user.user_metadata;

        console.log(`      ✅ Signed in successfully: ${user.id}`);
        console.log(`      📧 Email: ${user.email}`);
        console.log(`      🏢 Company: ${metadata.company_name}`);
        console.log(`      👤 Contact: ${metadata.contact_name}`);
        console.log(`      🎭 Role: ${metadata.role_type}`);
        console.log(`      🏢 Organization: ${metadata.organization_slug}`);

        // Verify session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            throw new Error(`Session retrieval failed: ${sessionError.message}`);
        }

        if (!sessionData.session) {
            throw new Error('No active session found');
        }

        console.log(`      🔑 Session active: ${sessionData.session.access_token ? 'Yes' : 'No'}`);

        // Sign out
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
            throw new Error(`Sign out failed: ${signOutError.message}`);
        }

        console.log(`      ✅ Signed out successfully`);

        return { success: true, user_id: user.id };

    } catch (error) {
        console.error(`      ❌ Authentication test failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Get all organization users from the database
 */
async function getOrganizationUsers() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select(`
                id,
                email,
                name,
                role,
                organization_id,
                preferences
            `)
            .in('role', ['customer', 'supplier'])
            .order('role', { ascending: true });

        if (error) {
            throw new Error(`Failed to fetch organization users: ${error.message}`);
        }

        return users;
    } catch (error) {
        console.error('❌ Error fetching organization users:', error.message);
        throw error;
    }
}

/**
 * Main test execution
 */
async function main() {
    try {
        console.log('🧪 Starting Organization Authentication Users Test...\n');

        // Get all organization users
        const organizationUsers = await getOrganizationUsers();
        console.log(`📊 Found ${organizationUsers.length} organization users to test\n`);

        const testResults = [];
        let successCount = 0;
        let failureCount = 0;

        // Test each user
        for (const user of organizationUsers) {
            const result = await testUserAuthentication(
                user.email,
                user.role,
                user.preferences?.company_name || 'Unknown'
            );

            testResults.push({
                email: user.email,
                role: user.role,
                company: user.preferences?.company_name || 'Unknown',
                ...result
            });

            if (result.success) {
                successCount++;
            } else {
                failureCount++;
            }

            console.log(''); // Add spacing between users
        }

        // Generate test summary
        console.log('='.repeat(80));
        console.log('🧪 ORGANIZATION AUTHENTICATION TEST SUMMARY');
        console.log('='.repeat(80));

        console.log(`\n📊 Test Results:`);
        console.log(`   ✅ Successful authentications: ${successCount}`);
        console.log(`   ❌ Failed authentications: ${failureCount}`);
        console.log(`   📈 Success rate: ${((successCount / organizationUsers.length) * 100).toFixed(1)}%`);

        // Count by role
        const customerCount = testResults.filter(r => r.role === 'customer').length;
        const supplierCount = testResults.filter(r => r.role === 'supplier').length;
        const customerSuccess = testResults.filter(r => r.role === 'customer' && r.success).length;
        const supplierSuccess = testResults.filter(r => r.role === 'supplier' && r.success).length;

        console.log(`\n🏢 Customer Users:`);
        console.log(`   Total: ${customerCount}, Success: ${customerSuccess}, Failed: ${customerCount - customerSuccess}`);

        console.log(`\n🏭 Supplier Users:`);
        console.log(`   Total: ${supplierCount}, Success: ${supplierSuccess}, Failed: ${supplierCount - supplierSuccess}`);

        if (failureCount > 0) {
            console.log(`\n❌ Failed Authentications:`);
            testResults
                .filter(r => !r.success)
                .forEach(r => console.log(`   - ${r.email} (${r.role}): ${r.error}`));
        }

        console.log(`\n🔑 Test Password: ${TEST_PASSWORD}`);
        console.log(`📧 Tested ${organizationUsers.length} organization users`);

        if (successCount === organizationUsers.length) {
            console.log(`\n🎉 All organization users can authenticate successfully!`);
        } else {
            console.log(`\n⚠️  Some authentication tests failed. Please review the errors above.`);
        }

        console.log('='.repeat(80));

    } catch (error) {
        console.error('\n💥 Fatal error during testing:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
