#!/usr/bin/env node

/**
 * Restore Authentication Users Script
 * 
 * This script recreates all authentication users that were deleted from auth.users
 * and updates the public.users and public.contacts tables to reference the new auth user IDs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   VITE_SUPABASE_URL:', !!supabaseUrl);
    console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Default password for all users (should be changed on first login)
const DEFAULT_PASSWORD = 'FactoryPulse2024!';

async function restoreInternalUsers() {
    console.log('\n� Restoring gInternal Users (Factory Pulse Employees)...');

    // Get all internal users from public.users table
    const { data: internalUsers, error: fetchError } = await supabase
        .from('users')
        .select('id, email, name, role, organization_id, department, employee_id, status')
        .order('role', { ascending: true });

    if (fetchError) {
        console.error('❌ Error fetching internal users:', fetchError);
        return false;
    }

    console.log(`📋 Found ${internalUsers.length} internal users to restore`);

    let successCount = 0;
    let errorCount = 0;
    const userMappings = [];

    for (const user of internalUsers) {
        try {
            console.log(`\n👤 Creating auth user: ${user.name} (${user.email})`);

            // Create authentication user
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
                console.error(`❌ Error creating auth user for ${user.email}:`, authError.message);
                errorCount++;
                continue;
            }

            // Store mapping for batch update
            userMappings.push({
                oldId: user.id,
                newId: authUser.user.id,
                email: user.email,
                name: user.name
            });

            console.log(`✅ Successfully created: ${user.name} (${user.role})`);
            console.log(`   🔗 New Auth ID: ${authUser.user.id}`);
            successCount++;

        } catch (error) {
            console.error(`❌ Unexpected error for ${user.email}:`, error.message);
            errorCount++;
        }
    }

    // Update all user IDs in batch
    if (userMappings.length > 0) {
        console.log(`\n🔄 Updating ${userMappings.length} user ID references...`);

        for (const mapping of userMappings) {
            try {
                // Update the public.users table to use the new auth user ID
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ id: mapping.newId })
                    .eq('id', mapping.oldId);

                if (updateError) {
                    console.error(`❌ Error updating public.users ID for ${mapping.email}:`, updateError.message);
                    errorCount++;
                } else {
                    console.log(`✅ Updated ID mapping: ${mapping.name}`);
                }
            } catch (error) {
                console.error(`❌ Error updating mapping for ${mapping.email}:`, error.message);
                errorCount++;
            }
        }
    }

    console.log(`\n� Inter nal Users Restoration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${internalUsers.length}`);

    return errorCount === 0;
}

async function restorePortalUsers() {
    console.log('\n🔄 Restoring Portal Users (Customers & Suppliers)...');

    // Get all portal users from public.contacts table
    const { data: portalUsers, error: fetchError } = await supabase
        .from('contacts')
        .select('id, email, contact_name, company_name, type, organization_id')
        .order('type', { ascending: true });

    if (fetchError) {
        console.error('❌ Error fetching portal users:', fetchError);
        return false;
    }

    console.log(`📋 Found ${portalUsers.length} portal users to restore`);

    let successCount = 0;
    let errorCount = 0;

    for (const contact of portalUsers) {
        try {
            console.log(`\n🏢 Creating auth user: ${contact.contact_name} (${contact.company_name})`);

            // Create authentication user
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: contact.email,
                password: DEFAULT_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    name: contact.contact_name,
                    company: contact.company_name,
                    type: contact.type,
                    user_type: 'portal'
                }
            });

            if (authError) {
                console.error(`❌ Error creating auth user for ${contact.email}:`, authError.message);
                errorCount++;
                continue;
            }

            // Create corresponding user record in public.users table
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    id: authUser.user.id, // Use the auth user's UUID
                    email: contact.email,
                    name: contact.contact_name,
                    role: contact.type, // 'customer' or 'supplier'
                    organization_id: contact.organization_id,
                    department: null,
                    employee_id: null,
                    status: 'active'
                });

            if (userError) {
                console.error(`❌ Error creating public.users record for ${contact.email}:`, userError.message);
                errorCount++;
                continue;
            }

            // Update contacts table with user_id reference
            const { error: contactUpdateError } = await supabase
                .from('contacts')
                .update({ user_id: authUser.user.id })
                .eq('id', contact.id);

            if (contactUpdateError) {
                console.error(`❌ Error updating contact user_id for ${contact.email}:`, contactUpdateError.message);
                errorCount++;
                continue;
            }

            console.log(`✅ Successfully restored: ${contact.contact_name} (${contact.type})`);
            console.log(`   🔗 Auth ID: ${authUser.user.id}`);
            successCount++;

        } catch (error) {
            console.error(`❌ Unexpected error for ${contact.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Portal Users Restoration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${portalUsers.length}`);

    return errorCount === 0;
}

async function verifyRestoration() {
    console.log('\n🔍 Verifying Authentication Users Restoration...');

    try {
        // Check auth.users count using the function we created
        const { data: authCount, error: authErr } = await supabase
            .rpc('count_auth_users');

        if (authErr) {
            console.error('❌ Error counting auth users:', authErr);
            return false;
        }

        // Check public.users count
        const { count: publicCount, error: publicErr } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (publicErr) {
            console.error('❌ Error counting public users:', publicErr);
            return false;
        }

        // Check contacts with user_id
        const { count: contactsWithUserCount, error: contactsErr } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .not('user_id', 'is', null);

        if (contactsErr) {
            console.error('❌ Error counting contacts with user_id:', contactsErr);
            return false;
        }

        console.log(`\n📊 Verification Results:`);
        console.log(`   🔐 Auth Users: ${authCount || 0}`);
        console.log(`   👥 Public Users: ${publicCount || 0}`);
        console.log(`   🏢 Contacts with User ID: ${contactsWithUserCount || 0}`);

        const expectedTotal = 32; // 12 internal + 20 portal users
        const actualTotal = (publicCount || 0);

        if (actualTotal === expectedTotal && (authCount || 0) === expectedTotal) {
            console.log(`✅ All ${expectedTotal} users successfully restored!`);
            return true;
        } else {
            console.log(`❌ Expected ${expectedTotal} users, but found ${actualTotal} public users and ${authCount || 0} auth users`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error during verification:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Authentication Users Restoration...');
    console.log('📋 This script will restore all deleted auth.users and update references');

    try {
        // Step 1: Restore internal users (Factory Pulse employees)
        const internalSuccess = await restoreInternalUsers();

        // Step 2: Restore portal users (customers & suppliers)
        const portalSuccess = await restorePortalUsers();

        // Step 3: Verify restoration
        const verificationSuccess = await verifyRestoration();

        if (internalSuccess && portalSuccess && verificationSuccess) {
            console.log('\n🎉 Authentication Users Restoration Completed Successfully!');
            console.log('\n📝 Next Steps:');
            console.log('   1. Test user authentication with the restored accounts');
            console.log('   2. Users should change their passwords on first login');
            console.log(`   3. Default password for all users: ${DEFAULT_PASSWORD}`);
            process.exit(0);
        } else {
            console.log('\n❌ Authentication Users Restoration Failed');
            console.log('   Please check the errors above and retry');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Fatal error during restoration:', error);
        process.exit(1);
    }
}

// Run the script
main();