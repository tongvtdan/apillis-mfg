#!/usr/bin/env node

/**
 * Complete Authentication Restoration Script
 * 
 * This script completes the authentication restoration by:
 * 1. Adding portal users to public.users table
 * 2. Updating contacts table with user_id references
 * 3. Fixing any remaining ID mismatches
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

async function getAuthUsers() {
    console.log('🔍 Fetching all authentication users...');

    const { data: authUsers, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('❌ Error fetching auth users:', error);
        return null;
    }

    console.log(`📋 Found ${authUsers.users.length} authentication users`);
    return authUsers.users;
}

async function addPortalUsersToPublicTable() {
    console.log('\n🔄 Adding portal users to public.users table...');

    const authUsers = await getAuthUsers();
    if (!authUsers) return false;

    // Get portal users (those with user_type: 'portal' in metadata)
    const portalAuthUsers = authUsers.filter(user =>
        user.user_metadata?.user_type === 'portal'
    );

    console.log(`📋 Found ${portalAuthUsers.length} portal auth users to add`);

    let successCount = 0;
    let errorCount = 0;

    for (const authUser of portalAuthUsers) {
        try {
            // Check if user already exists in public.users
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', authUser.id)
                .single();

            if (existingUser) {
                console.log(`⏭️  User already exists: ${authUser.email}`);
                continue;
            }

            // Create user record in public.users table
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    id: authUser.id,
                    email: authUser.email,
                    name: authUser.user_metadata?.name || 'Portal User',
                    role: authUser.user_metadata?.type || 'customer',
                    organization_id: null,
                    department: null,
                    employee_id: null,
                    status: 'active'
                });

            if (userError) {
                console.error(`❌ Error creating public.users record for ${authUser.email}:`, userError.message);
                errorCount++;
                continue;
            }

            console.log(`✅ Added to public.users: ${authUser.user_metadata?.name} (${authUser.email})`);
            successCount++;

        } catch (error) {
            console.error(`❌ Unexpected error for ${authUser.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Portal Users Addition Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${portalAuthUsers.length}`);

    return errorCount === 0;
}

async function updateContactsWithUserIds() {
    console.log('\n🔄 Updating contacts table with user_id references...');

    const authUsers = await getAuthUsers();
    if (!authUsers) return false;

    // Get portal users
    const portalAuthUsers = authUsers.filter(user =>
        user.user_metadata?.user_type === 'portal'
    );

    let successCount = 0;
    let errorCount = 0;

    for (const authUser of portalAuthUsers) {
        try {
            // Find matching contact by email
            const { data: contact, error: findError } = await supabase
                .from('contacts')
                .select('id, email, contact_name, company_name')
                .eq('email', authUser.email)
                .single();

            if (findError || !contact) {
                console.error(`❌ Contact not found for ${authUser.email}`);
                errorCount++;
                continue;
            }

            // Update contact with user_id
            const { error: updateError } = await supabase
                .from('contacts')
                .update({ user_id: authUser.id })
                .eq('id', contact.id);

            if (updateError) {
                console.error(`❌ Error updating contact user_id for ${authUser.email}:`, updateError.message);
                errorCount++;
                continue;
            }

            console.log(`✅ Updated contact: ${contact.contact_name} (${contact.company_name})`);
            successCount++;

        } catch (error) {
            console.error(`❌ Unexpected error for ${authUser.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Contacts Update Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${portalAuthUsers.length}`);

    return errorCount === 0;
}

async function verifyFinalState() {
    console.log('\n🔍 Verifying final authentication state...');

    try {
        // Check auth.users count
        const { data: authCount } = await supabase.rpc('count_auth_users');

        // Check public.users count
        const { count: publicCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Check contacts with user_id
        const { count: contactsWithUserCount } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .not('user_id', 'is', null);

        // Check internal vs portal users
        const { count: internalUsersCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .in('role', ['admin', 'management', 'sales', 'procurement', 'engineering', 'production', 'qa']);

        const { count: portalUsersCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .in('role', ['customer', 'supplier']);

        console.log(`\n📊 Final Verification Results:`);
        console.log(`   🔐 Auth Users: ${authCount || 0}`);
        console.log(`   👥 Public Users: ${publicCount || 0}`);
        console.log(`   🏢 Contacts with User ID: ${contactsWithUserCount || 0}`);
        console.log(`   👔 Internal Users: ${internalUsersCount || 0}`);
        console.log(`   🌐 Portal Users: ${portalUsersCount || 0}`);

        const expectedAuthUsers = 32;
        const expectedPublicUsers = 32;
        const expectedContactsWithUserId = 20;
        const expectedInternalUsers = 12;
        const expectedPortalUsers = 20;

        const allCorrect = (
            (authCount || 0) === expectedAuthUsers &&
            (publicCount || 0) === expectedPublicUsers &&
            (contactsWithUserCount || 0) === expectedContactsWithUserId &&
            (internalUsersCount || 0) === expectedInternalUsers &&
            (portalUsersCount || 0) === expectedPortalUsers
        );

        if (allCorrect) {
            console.log(`\n✅ Perfect! All authentication users restored successfully!`);
            console.log(`   🎯 32 auth users = 12 internal + 20 portal`);
            console.log(`   🎯 32 public users = 12 internal + 20 portal`);
            console.log(`   🎯 20 contacts linked to portal users`);
            return true;
        } else {
            console.log(`\n❌ Some issues remain:`);
            console.log(`   Expected: ${expectedAuthUsers} auth, ${expectedPublicUsers} public, ${expectedContactsWithUserId} contacts`);
            console.log(`   Actual: ${authCount || 0} auth, ${publicCount || 0} public, ${contactsWithUserCount || 0} contacts`);
            return false;
        }

    } catch (error) {
        console.error('❌ Error during verification:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 Completing Authentication Users Restoration...');

    try {
        // Step 1: Add portal users to public.users table
        const portalUsersSuccess = await addPortalUsersToPublicTable();

        // Step 2: Update contacts table with user_id references
        const contactsSuccess = await updateContactsWithUserIds();

        // Step 3: Verify final state
        const verificationSuccess = await verifyFinalState();

        if (portalUsersSuccess && contactsSuccess && verificationSuccess) {
            console.log('\n🎉 Authentication Users Restoration Completed Successfully!');
            console.log('\n📝 Summary:');
            console.log('   ✅ All 32 authentication users restored');
            console.log('   ✅ All 32 users added to public.users table');
            console.log('   ✅ All 20 contacts linked to portal users');
            console.log('   ✅ Perfect ID synchronization between auth.users and public.users');
            process.exit(0);
        } else {
            console.log('\n❌ Authentication Users Restoration Failed');
            console.log('   Please check the errors above and retry');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Fatal error during completion:', error);
        process.exit(1);
    }
}

// Run the script
main();