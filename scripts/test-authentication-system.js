#!/usr/bin/env node

/**
 * Test Authentication System with Perfect ID Matching
 * 
 * This script tests authentication for all users to ensure they can successfully login
 * and verifies that the UUIDs match perfectly between auth and database.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test users (sample from each category)
const testUsers = [
    // Internal users
    { email: 'admin@apillis.vn', name: 'Admin User', type: 'Internal' },
    { email: 'sales@apillis.vn', name: 'Sales User', type: 'Internal' },
    { email: 'engineering@apillis.vn', name: 'Engineering User', type: 'Internal' },

    // External customers
    { email: 'procurement@toyota.vn', name: 'Toyota Customer', type: 'External Customer' },
    { email: 'procurement@boeing.com', name: 'Boeing Customer', type: 'External Customer' },

    // External suppliers
    { email: 'sales@precisionmachining.vn', name: 'Precision Supplier', type: 'External Supplier' },
    { email: 'sales@precisionengineering.com', name: 'Precision USA Supplier', type: 'External Supplier' }
];

const DEFAULT_PASSWORD = 'Password@123';

/**
 * Test user authentication and verify ID matching
 */
async function testUserAuthAndIdMatching(userData) {
    try {
        console.log(`🔐 Testing authentication for ${userData.email} (${userData.type})...`);

        // Attempt to sign in
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: DEFAULT_PASSWORD
        });

        if (authError) {
            throw new Error(`Authentication failed: ${authError.message}`);
        }

        if (authData.user) {
            const authUserId = authData.user.id;
            console.log(`✅ Successfully authenticated: ${userData.email}`);
            console.log(`   Auth UID: ${authUserId}`);
            console.log(`   Role: ${authData.user.user_metadata?.role || 'N/A'}`);
            console.log(`   Company: ${authData.user.user_metadata?.company || 'N/A'}`);

            // Verify ID matching with database
            let dbRecord = null;
            let tableName = '';

            // Check users table first
            const { data: dbUser, error: userError } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', userData.email)
                .single();

            if (dbUser && !userError) {
                dbRecord = dbUser;
                tableName = 'users';
            } else {
                // Check contacts table
                const { data: dbContact, error: contactError } = await supabase
                    .from('contacts')
                    .select('id, email')
                    .eq('email', userData.email)
                    .single();

                if (dbContact && !contactError) {
                    dbRecord = dbContact;
                    tableName = 'contacts';
                }
            }

            if (dbRecord) {
                if (authUserId === dbRecord.id) {
                    console.log(`   🎯 Perfect ID match: Auth UID = ${tableName}.id`);
                } else {
                    console.log(`   ❌ ID mismatch: Auth UID (${authUserId}) ≠ ${tableName}.id (${dbRecord.id})`);
                }
            } else {
                console.log(`   ⚠️  No database record found for verification`);
            }

            // Sign out
            await supabase.auth.signOut();
            return { success: true, idMatch: dbRecord ? authUserId === dbRecord.id : false };
        } else {
            throw new Error('No user data returned');
        }
    } catch (error) {
        console.error(`❌ Authentication failed for ${userData.email}: ${error.message}`);
        return { success: false, idMatch: false };
    }
}

/**
 * Main test function
 */
async function main() {
    console.log('🧪 Testing perfect ID matching authentication system...');
    console.log(`📊 Testing ${testUsers.length} users across different categories`);
    console.log('🎯 Goal: Verify auth.users.uid = database records exactly');
    console.log('');

    let successCount = 0;
    let failureCount = 0;
    let perfectMatchCount = 0;

    for (const user of testUsers) {
        const result = await testUserAuthAndIdMatching(user);
        if (result.success) {
            successCount++;
            if (result.idMatch) {
                perfectMatchCount++;
            }
        } else {
            failureCount++;
        }
        console.log(''); // Add spacing between tests
    }

    // Summary
    console.log('📋 Test Summary:');
    console.log(`   ✅ Successful authentications: ${successCount}`);
    console.log(`   ❌ Failed authentications: ${failureCount}`);
    console.log(`   🎯 Perfect ID matches: ${perfectMatchCount}`);
    console.log(`   📊 Success rate: ${((successCount / testUsers.length) * 100).toFixed(1)}%`);
    console.log(`   🔗 ID matching rate: ${((perfectMatchCount / successCount) * 100).toFixed(1)}%`);
    console.log('');

    if (failureCount > 0) {
        console.log('⚠️  Some authentication tests failed. Please check the errors above.');
        process.exit(1);
    } else if (perfectMatchCount < successCount) {
        console.log('⚠️  Some ID mismatches detected. The system may not work correctly.');
        process.exit(1);
    } else {
        console.log('🎉 All authentication tests passed with perfect ID matching!');
        console.log('🚀 The system is ready for development and testing.');
        console.log('🔐 Perfect authentication and authorization achieved!');
    }
}

// Run the tests
main().catch(error => {
    console.error('💥 Fatal error during testing:', error.message);
    process.exit(1);
});

