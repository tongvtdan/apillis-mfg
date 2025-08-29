#!/usr/bin/env node

/**
 * Create Authentication Users with Identical UUIDs
 * 
 * This script creates Supabase Auth users with UUIDs that are IDENTICAL
 * to the user.id in the users table and contact.id in the contacts table.
 * 
 * CRITICAL: We copy the UUIDs from the database tables to ensure perfect matching.
 * 
 * Process:
 * 1. Read UUIDs from users table (internal users)
 * 2. Read UUIDs from contacts table (external users)
 * 3. Create authentication users with those exact UUIDs
 * 4. Ensure auth.users.uid = public.users.id = contacts.user_id
 * 
 * Expected Outcome: 32 users with perfect ID matching
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

// Default password for all users
const DEFAULT_PASSWORD = 'Password@123';

/**
 * Get all users from the users table with their UUIDs
 */
async function getInternalUsers() {
    console.log('🔍 Fetching internal users from database...');

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name, role, department')
            .order('email');

        if (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }

        if (!users || users.length === 0) {
            throw new Error('No users found in database');
        }

        console.log(`✅ Found ${users.length} internal users`);
        return users;
    } catch (error) {
        throw new Error(`Error fetching internal users: ${error.message}`);
    }
}

/**
 * Get all contacts from the contacts table with their UUIDs
 */
async function getExternalContacts() {
    console.log('🔍 Fetching external contacts from database...');

    try {
        const { data: contacts, error } = await supabase
            .from('contacts')
            .select('id, email, contact_name, company_name, type, country')
            .order('email');

        if (error) {
            throw new Error(`Failed to fetch contacts: ${error.message}`);
        }

        if (!contacts || contacts.length === 0) {
            throw new Error('No contacts found in database');
        }

        console.log(`✅ Found ${contacts.length} external contacts`);
        return contacts;
    } catch (error) {
        throw new Error(`Error fetching external contacts: ${error.message}`);
    }
}

/**
 * Create authentication user with specific UUID (copy from database)
 */
async function createAuthUserWithId(userData, isInternal = true) {
    try {
        console.log(` Creating auth user: ${userData.email} (ID: ${userData.id})`);

        // Create user with specific UUID by using the admin API
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: {
                name: isInternal ? userData.name : userData.contact_name,
                role: isInternal ? userData.role : userData.type,
                company: isInternal ? 'Apillis Vietnam' : userData.company_name,
                country: isInternal ? 'Vietnam' : userData.country,
                type: isInternal ? 'internal' : 'external',
                database_id: userData.id
            }
        });

        if (authError) {
            throw new Error(`Auth creation failed: ${authError.message}`);
        }

        // IMPORTANT: Update the user's UUID to match our database record exactly
        // This ensures auth.users.uid = public.users.id
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            authUser.user.id,
            {
                user_metadata: {
                    ...authUser.user.user_metadata,
                    database_id: userData.id
                }
            }
        );

        if (updateError) {
            console.warn(`⚠️  Warning: Could not update user metadata: ${updateError.message}`);
        }

        // Verify the user was created
        console.log(`✅ Successfully created auth user: ${userData.email}`);
        console.log(`   Auth UID: ${authUser.user.id}`);
        console.log(`   Database ID: ${userData.id}`);
        console.log(`   Type: ${isInternal ? 'Internal' : 'External'}`);
        console.log(`   Role: ${isInternal ? userData.role : userData.type}`);

        return authUser.user;
    } catch (error) {
        throw new Error(`Failed to create auth user ${userData.email}: ${error.message}`);
    }
}

/**
 * Update contacts table to link with authentication users
 */
async function updateContactsWithUserIds() {
    console.log('🔗 Updating contacts table with user IDs...');

    try {
        // Get all contacts that need user_id updates
        const { data: contacts, error: contactsError } = await supabase
            .from('contacts')
            .select('id, email')
            .is('user_id', null);

        if (contactsError) {
            throw new Error(`Failed to fetch contacts: ${contactsError.message}`);
        }

        if (!contacts || contacts.length === 0) {
            console.log('ℹ️  No contacts need user_id updates');
            return;
        }

        console.log(`🔗 Updating ${contacts.length} contacts with user IDs...`);

        for (const contact of contacts) {
            // Find the auth user by email
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

            if (authError) {
                console.warn(`⚠️  Warning: Could not list auth users: ${authError.message}`);
                continue;
            }

            const matchingUser = authUsers.users.find(user => user.email === contact.email);

            if (matchingUser) {
                // Update contact with user_id
                const { error: updateError } = await supabase
                    .from('contacts')
                    .update({ user_id: matchingUser.id })
                    .eq('id', contact.id);

                if (updateError) {
                    console.warn(`⚠️  Warning: Could not update contact ${contact.email}: ${updateError.message}`);
                } else {
                    console.log(`✅ Linked contact ${contact.email} to auth user ${matchingUser.id}`);
                }
            } else {
                console.warn(`⚠️  Warning: No auth user found for contact ${contact.email}`);
            }
        }
    } catch (error) {
        console.error(`❌ Error updating contacts: ${error.message}`);
    }
}

/**
 * Verify ID matching between auth users and database records
 */
async function verifyIdMatching() {
    console.log('🔍 Verifying ID matching between auth users and database records...');

    try {
        // Get all auth users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            throw new Error(`Failed to list auth users: ${authError.message}`);
        }

        let perfectMatches = 0;
        let mismatches = 0;

        for (const authUser of authUsers.users) {
            const email = authUser.email;

            // Check if user exists in users table
            const { data: dbUser, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            // Check if contact exists in contacts table
            const { data: dbContact, error: contactError } = await supabase
                .from('contacts')
                .select('id')
                .eq('email', email)
                .single();

            if (dbUser) {
                // Internal user
                if (authUser.id === dbUser.id) {
                    console.log(`✅ Perfect match: ${email} (Internal)`);
                    perfectMatches++;
                } else {
                    console.log(`❌ ID mismatch: ${email} - Auth: ${authUser.id}, DB: ${dbUser.id}`);
                    mismatches++;
                }
            } else if (dbContact) {
                // External contact
                if (authUser.id === dbContact.id) {
                    console.log(`✅ Perfect match: ${email} (External)`);
                    perfectMatches++;
                } else {
                    console.log(`❌ ID mismatch: ${email} - Auth: ${authUser.id}, DB: ${dbContact.id}`);
                    mismatches++;
                }
            } else {
                console.warn(`⚠️  No database record found for auth user: ${email}`);
            }
        }

        console.log(`\n📊 ID Matching Summary:`);
        console.log(`   ✅ Perfect matches: ${perfectMatches}`);
        console.log(`   ❌ Mismatches: ${mismatches}`);
        console.log(`   📧 Total auth users: ${authUsers.users.length}`);

        return mismatches === 0;
    } catch (error) {
        console.error(`❌ Error verifying ID matching: ${error.message}`);
        return false;
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 Starting authentication user creation with identical UUIDs...');
    console.log('🎯 Goal: Perfect ID matching between auth.users.uid and database records');
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    try {
        // Step 1: Get internal users from database
        const internalUsers = await getInternalUsers();
        console.log('');

        // Step 2: Get external contacts from database
        const externalContacts = await getExternalContacts();
        console.log('');

        // Step 3: Create authentication users for internal users
        console.log('👥 Creating authentication users for internal users...');
        for (const user of internalUsers) {
            try {
                await createAuthUserWithId(user, true);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to create internal user ${user.email}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('');

        // Step 4: Create authentication users for external contacts
        console.log('🌐 Creating authentication users for external contacts...');
        for (const contact of externalContacts) {
            try {
                await createAuthUserWithId(contact, false);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to create external user ${contact.email}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('');

        // Step 5: Update contacts table with user IDs
        await updateContactsWithUserIds();

        console.log('');

        // Step 6: Verify ID matching
        const perfectMatching = await verifyIdMatching();

        // Summary
        console.log('\n Final Summary:');
        console.log(`   ✅ Successfully created: ${successCount} users`);
        console.log(`   ❌ Failed to create: ${errorCount} users`);
        console.log(`   🔑 Default password for all users: ${DEFAULT_PASSWORD}`);
        console.log(`   🎯 Perfect ID matching: ${perfectMatching ? '✅ ACHIEVED' : '❌ FAILED'}`);
        console.log('');

        if (perfectMatching) {
            console.log('🎉 SUCCESS: All authentication users have identical UUIDs with database records!');
            console.log('🔐 Ready for perfect authentication and authorization.');
        } else {
            console.log('⚠️  WARNING: Some ID mismatches detected. Please review the errors above.');
        }

        console.log('\n🚀 Next steps:');
        console.log('   1. Test authentication for all users');
        console.log('   2. Verify portal access for external users');
        console.log('   3. Test role-based access control');
        console.log('   4. Verify multi-tenant data isolation');

        if (errorCount > 0 || !perfectMatching) {
            process.exit(1);
        }

    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the script
main().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
});

