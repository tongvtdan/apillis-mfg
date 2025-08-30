#!/usr/bin/env node

/**
 * Test Authentication Restoration Script
 * 
 * This script tests the restored authentication users to ensure they can sign in
 * and identifies any remaining ID mismatch issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

// Create Supabase client for testing authentication
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_PASSWORD = 'FactoryPulse2024!';

// ID Mismatch Map (same as in AuthContext)
const ID_MISMATCH_MAP = {
    '1bbb8aef-fdfe-446b-b8cc-42bd7677aa7c': '083f04db-458a-416b-88e9-94acf10382f8', // admin
    '4bfa5ef8-2a21-46b8-bc99-2c8000b681bf': '99845907-7255-4155-9dd0-c848ab9860cf', // ceo
    '2171de5a-c007-4893-92f1-b15522c164d9': 'a1f24ed5-319e-4b66-8d21-fbc70d07ea09', // sales
    '2e828057-adde-44e7-8fa7-a2d1aea656ab': 'c91843ad-4327-429a-bf57-2b891df50e18', // procurement
    'f23c3fea-cd08-48c0-9107-df83a0059ec6': '776edb76-953a-4482-9533-c793a633cc27'  // engineering
};

async function testUserAuthentication(email, expectedName, userType) {
    try {
        // Sign in with the user
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: DEFAULT_PASSWORD
        });

        if (signInError) {
            console.error(`❌ Sign-in failed for ${email}:`, signInError.message);
            return false;
        }

        const authUser = authData.user;
        console.log(`✅ Sign-in successful: ${email}`);

        // Check if user exists in public.users table with matching ID (handle ID mismatch)
        const userIdToQuery = ID_MISMATCH_MAP[authUser.id] || authUser.id;
        const { data: publicUser, error: publicUserError } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', userIdToQuery)
            .maybeSingle();

        if (publicUserError || !publicUser) {
            console.error(`❌ Public user not found for ${email} (Auth ID: ${authUser.id}, Query ID: ${userIdToQuery}):`, publicUserError?.message || 'No data returned');

            // Check if user exists with different ID
            const { data: userByEmail, error: emailError } = await supabase
                .from('users')
                .select('id, name, email, role')
                .eq('email', email)
                .single();

            if (!emailError && userByEmail) {
                console.error(`⚠️  ID MISMATCH: Auth ID ${authUser.id} != Public ID ${userByEmail.id}`);
                return { success: false, mismatch: true, authId: authUser.id, publicId: userByEmail.id };
            }

            await supabase.auth.signOut();
            return false;
        }

        console.log(`   🔗 Auth ID: ${authUser.id}, Public ID: ${userIdToQuery}`);
        if (publicUser) {
            console.log(`   👤 Name: ${publicUser.name} (${publicUser.role})`);
        } else {
            console.log(`   ❌ No public user data returned`);
        }

        // Sign out
        await supabase.auth.signOut();
        return true;

    } catch (error) {
        console.error(`❌ Unexpected error testing ${email}:`, error.message);
        return false;
    }
}

async function testInternalUsers() {
    console.log('\n🔄 Testing Internal Users Authentication...');

    const internalUsers = [
        { email: 'admin@factorypulse.vn', name: 'Nguyễn Văn Admin' },
        { email: 'ceo@factorypulse.vn', name: 'Trần Thị CEO' },
        { email: 'sales@factorypulse.vn', name: 'Lê Văn Sales' },
        { email: 'sales2@factorypulse.vn', name: 'Bùi Thị Sales2' },
        { email: 'procurement@factorypulse.vn', name: 'Phạm Thị Procurement' },
        { email: 'procurement2@factorypulse.vn', name: 'Ngô Văn Procurement2' },
        { email: 'engineering@factorypulse.vn', name: 'Hoàng Văn Engineering' },
        { email: 'engineering2@factorypulse.vn', name: 'Lý Thị Engineering2' },
        { email: 'production@factorypulse.vn', name: 'Vũ Thị Production' },
        { email: 'production2@factorypulse.vn', name: 'Hồ Văn Production2' },
        { email: 'qa@factorypulse.vn', name: 'Đặng Văn QA' },
        { email: 'qa2@factorypulse.vn', name: 'Trương Thị QA2' }
    ];

    let successCount = 0;
    let errorCount = 0;
    const mismatches = [];

    for (const user of internalUsers) {
        console.log(`\n👤 Testing: ${user.name} (${user.email})`);
        const result = await testUserAuthentication(user.email, user.name, 'internal');

        if (result === true) {
            successCount++;
        } else if (result && result.mismatch) {
            mismatches.push({
                email: user.email,
                name: user.name,
                authId: result.authId,
                publicId: result.publicId
            });
            errorCount++;
        } else {
            errorCount++;
        }
    }

    console.log(`\n📊 Internal Users Test Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${internalUsers.length}`);

    if (mismatches.length > 0) {
        console.log(`\n⚠️  ID Mismatches Found:`);
        mismatches.forEach(mismatch => {
            console.log(`   ${mismatch.name}: Auth ${mismatch.authId} != Public ${mismatch.publicId}`);
        });
    }

    return { success: errorCount === 0, mismatches };
}

async function testPortalUsers() {
    console.log('\n🔄 Testing Portal Users Authentication (Sample)...');

    const samplePortalUsers = [
        { email: 'procurement@toyota.vn', name: 'Nguyễn Văn An', company: 'Toyota Vietnam' },
        { email: 'sales@precisionmachining.vn', name: 'Ngô Văn Tâm', company: 'Precision Machining Co.' },
        { email: 'procurement@samsung.vn', name: 'Phạm Thị Dung', company: 'Samsung Vietnam' },
        { email: 'sales@metalfab.vn', name: 'Lý Thị Lan', company: 'Metal Fabrication Ltd.' }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const user of samplePortalUsers) {
        console.log(`\n🏢 Testing: ${user.name} (${user.company})`);
        const result = await testUserAuthentication(user.email, user.name, 'portal');

        if (result === true) {
            successCount++;
        } else {
            errorCount++;
        }
    }

    console.log(`\n📊 Portal Users Test Summary (Sample):`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${samplePortalUsers.length}`);

    return errorCount === 0;
}

async function main() {
    console.log('🚀 Testing Authentication Users Restoration...');

    try {
        // Test internal users
        const { success: internalSuccess, mismatches } = await testInternalUsers();

        // Test portal users (sample)
        const portalSuccess = await testPortalUsers();

        console.log('\n📊 Overall Test Results:');

        if (internalSuccess && portalSuccess) {
            console.log('✅ All authentication tests passed successfully!');
            console.log('\n🎉 Authentication Users Restoration is Complete and Working!');
            console.log('\n📝 Next Steps:');
            console.log('   1. All users can now sign in with password: FactoryPulse2024!');
            console.log('   2. Users should change their passwords on first login');
            console.log('   3. Test the application with different user roles');
            process.exit(0);
        } else {
            console.log('❌ Some authentication tests failed');

            if (mismatches && mismatches.length > 0) {
                console.log('\n🔧 ID Mismatch Issues Found:');
                console.log('   These users have different IDs in auth.users vs public.users');
                console.log('   This may cause issues with project assignments and other references');
                console.log('\n   Affected users:');
                mismatches.forEach(mismatch => {
                    console.log(`   - ${mismatch.name} (${mismatch.email})`);
                });
            }

            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Fatal error during testing:', error);
        process.exit(1);
    }
}

// Run the script
main();