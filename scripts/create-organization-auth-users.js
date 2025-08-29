#!/usr/bin/env node

/**
 * Create Authentication Users for Each Organization
 * 
 * This script creates Supabase Auth users for each organization contact,
 * ensuring perfect ID matching between auth.users and public.users tables.
 * 
 * Process:
 * 1. Create authentication users with organization-specific emails
 * 2. Create user records in public.users with matching IDs
 * 3. Update contacts table to link with user records
 * 
 * Expected Outcome: 20 new portal users (8 customers + 12 suppliers)
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

// Default password for all organization users
const DEFAULT_PASSWORD = 'Password@123';

// Organization user credentials mapping
const organizationUsers = [];

/**
 * Generate organization user credentials from contacts
 */
async function generateOrganizationUsers() {
    console.log('🔍 Fetching contacts from database...');

    try {
        // Get all contacts (customers and suppliers)
        const { data: contacts, error: contactsError } = await supabase
            .from('contacts')
            .select(`
                id,
                organization_id,
                type,
                company_name,
                contact_name,
                email,
                phone,
                address,
                city,
                state,
                country,
                postal_code,
                website,
                tax_id,
                payment_terms,
                credit_limit,
                is_active,
                notes,
                created_at,
                updated_at
            `)
            .eq('is_active', true);

        if (contactsError) {
            throw new Error(`Failed to fetch contacts: ${contactsError.message}`);
        }

        if (!contacts || contacts.length === 0) {
            throw new Error('No contacts found in database');
        }

        console.log(`✅ Found ${contacts.length} active contacts`);

        // Get organization details for domain generation
        const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, slug, domain')
            .neq('slug', 'factory-pulse-vietnam'); // Exclude Factory Pulse

        if (orgError) {
            throw new Error(`Failed to fetch organizations: ${orgError.message}`);
        }

        // Create organization lookup map
        const orgMap = new Map(organizations.map(org => [org.id, org]));

        // Generate user credentials for each contact
        for (const contact of contacts) {
            const organization = orgMap.get(contact.organization_id);
            if (!organization) {
                console.warn(`⚠️  Organization not found for contact ${contact.id}`);
                continue;
            }

            // Generate email based on organization domain
            const email = generateEmail(contact.contact_name, organization.domain);

            // Generate display name
            const displayName = generateDisplayName(contact.contact_name, contact.company_name);

            organizationUsers.push({
                contact_id: contact.id,
                organization_id: contact.organization_id,
                type: contact.type,
                email: email,
                password: DEFAULT_PASSWORD,
                user_metadata: {
                    organization_id: contact.organization_id,
                    contact_id: contact.id,
                    company_name: contact.company_name,
                    contact_name: contact.contact_name,
                    role_type: contact.type,
                    is_portal_user: true,
                    organization_slug: organization.slug
                },
                display_name: displayName,
                contact_data: contact
            });
        }

        console.log(`✅ Generated ${organizationUsers.length} organization user credentials`);
        return organizationUsers;

    } catch (error) {
        console.error('❌ Error generating organization users:', error.message);
        throw error;
    }
}

/**
 * Generate email address for organization user
 */
function generateEmail(contactName, domain) {
    if (!domain) {
        // Fallback domain if organization doesn't have one
        return `${contactName.toLowerCase().replace(/\s+/g, '.')}@organization.vn`;
    }

    // Clean domain and generate email
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    const cleanName = contactName.toLowerCase()
        .replace(/[đĐ]/g, 'd')
        .replace(/[ăĂ]/g, 'a')
        .replace(/[âÂ]/g, 'a')
        .replace(/[êÊ]/g, 'e')
        .replace(/[ôÔ]/g, 'o')
        .replace(/[ơƠ]/g, 'o')
        .replace(/[ưƯ]/g, 'u')
        .replace(/[^a-z0-9]/g, '.')
        .replace(/\.+/g, '.')
        .replace(/^\.|\.$/g, '');

    return `${cleanName}@${cleanDomain}`;
}

/**
 * Generate display name for organization user
 */
function generateDisplayName(contactName, companyName) {
    return `${contactName} (${companyName})`;
}

/**
 * Create authentication users in Supabase Auth
 */
async function createAuthUsers() {
    console.log('\n🔐 Creating authentication users...');

    const createdUsers = [];
    const errors = [];

    for (const userData of organizationUsers) {
        try {
            console.log(`   Creating auth user: ${userData.email}`);

            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                user_metadata: userData.user_metadata
            });

            if (authError) {
                throw new Error(`Auth creation failed: ${authError.message}`);
            }

            // Store the created auth user with contact data
            createdUsers.push({
                auth_user: authUser.user,
                contact_data: userData.contact_data,
                organization_id: userData.organization_id,
                type: userData.type
            });

            console.log(`   ✅ Created auth user: ${authUser.user.id}`);

        } catch (error) {
            console.error(`   ❌ Failed to create auth user ${userData.email}:`, error.message);
            errors.push({ email: userData.email, error: error.message });
        }
    }

    console.log(`\n📊 Auth User Creation Summary:`);
    console.log(`   ✅ Successfully created: ${createdUsers.length}`);
    console.log(`   ❌ Failed: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n❌ Errors encountered:');
        errors.forEach(err => console.log(`   - ${err.email}: ${err.error}`));
    }

    return { createdUsers, errors };
}

/**
 * Create user records in public.users table
 */
async function createUserRecords(authUsers) {
    console.log('\n👥 Creating user records in public.users table...');

    const createdRecords = [];
    const errors = [];

    for (const userData of authUsers) {
        try {
            const { auth_user, contact_data, organization_id, type } = userData;

            console.log(`   Creating user record for: ${auth_user.email}`);

            // Create user record with matching ID from auth.users
            const { data: userRecord, error: userError } = await supabase
                .from('users')
                .insert({
                    id: auth_user.id, // Use auth.users.uid to ensure perfect match
                    organization_id: organization_id,
                    email: auth_user.email,
                    name: contact_data.contact_name,
                    role: type, // 'customer' or 'supplier'
                    department: `${type.charAt(0).toUpperCase() + type.slice(1)} Portal`,
                    phone: contact_data.phone,
                    status: 'active',
                    description: `Portal user for ${contact_data.company_name}`,
                    preferences: {
                        is_portal_user: true,
                        contact_id: contact_data.id,
                        company_name: contact_data.company_name,
                        organization_slug: contact_data.organization_id
                    }
                })
                .select()
                .single();

            if (userError) {
                throw new Error(`User record creation failed: ${userError.message}`);
            }

            createdRecords.push(userRecord);
            console.log(`   ✅ Created user record: ${userRecord.id}`);

        } catch (error) {
            console.error(`   ❌ Failed to create user record for ${userData.auth_user.email}:`, error.message);
            errors.push({ email: userData.auth_user.email, error: error.message });
        }
    }

    console.log(`\n📊 User Record Creation Summary:`);
    console.log(`   ✅ Successfully created: ${createdRecords.length}`);
    console.log(`   ❌ Failed: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n❌ Errors encountered:');
        errors.forEach(err => console.log(`   - ${err.email}: ${err.error}`));
    }

    return { createdRecords, errors };
}

/**
 * Update contacts table to link with user records
 */
async function updateContactsTable(authUsers) {
    console.log('\n🔗 Updating contacts table with user links...');

    const updatedContacts = [];
    const errors = [];

    for (const userData of authUsers) {
        try {
            const { auth_user, contact_data } = userData;

            console.log(`   Updating contact: ${contact_data.company_name}`);

            // Update contact with user_id reference
            const { data: updatedContact, error: updateError } = await supabase
                .from('contacts')
                .update({
                    user_id: auth_user.id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', contact_data.id)
                .select()
                .single();

            if (updateError) {
                throw new Error(`Contact update failed: ${updateError.message}`);
            }

            updatedContacts.push(updatedContact);
            console.log(`   ✅ Updated contact: ${updatedContact.id}`);

        } catch (error) {
            console.error(`   ❌ Failed to update contact ${userData.contact_data.company_name}:`, error.message);
            errors.push({ company: userData.contact_data.company_name, error: error.message });
        }
    }

    console.log(`\n📊 Contact Update Summary:`);
    console.log(`   ✅ Successfully updated: ${updatedContacts.length}`);
    console.log(`   ❌ Failed: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n❌ Errors encountered:');
        errors.forEach(err => console.log(`   - ${err.company}: ${err.error}`));
    }

    return { updatedContacts, errors };
}

/**
 * Generate summary report
 */
function generateSummaryReport(authUsers, userRecords, updatedContacts, errors) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 ORGANIZATION AUTHENTICATION USERS CREATION SUMMARY');
    console.log('='.repeat(80));

    console.log(`\n🎯 Total Organization Contacts: ${organizationUsers.length}`);
    console.log(`🔐 Authentication Users Created: ${authUsers.length}`);
    console.log(`👥 User Records Created: ${userRecords.length}`);
    console.log(`🔗 Contacts Updated: ${updatedContacts.length}`);

    // Count by type
    const customerCount = authUsers.filter(u => u.type === 'customer').length;
    const supplierCount = authUsers.filter(u => u.type === 'supplier').length;

    console.log(`\n📊 User Distribution:`);
    console.log(`   🏢 Customers: ${customerCount}`);
    console.log(`   🏭 Suppliers: ${supplierCount}`);

    if (errors.length > 0) {
        console.log(`\n❌ Total Errors: ${errors.length}`);
    }

    console.log(`\n🔑 Default Password: ${DEFAULT_PASSWORD}`);
    console.log(`📧 Email Format: {contact_name}@{organization_domain}`);

    console.log(`\n✅ All organization users are now ready for portal access!`);
    console.log('='.repeat(80));
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🚀 Starting Organization Authentication Users Creation...\n');

        // Step 1: Generate organization user credentials
        await generateOrganizationUsers();

        // Step 2: Create authentication users
        const { createdUsers: authUsers, errors: authErrors } = await createAuthUsers();

        if (authUsers.length === 0) {
            throw new Error('No authentication users were created. Cannot proceed.');
        }

        // Step 3: Create user records in public.users table
        const { createdRecords: userRecords, errors: userErrors } = await createUserRecords(authUsers);

        // Step 4: Update contacts table with user links
        const { updatedContacts, errors: contactErrors } = await updateContactsTable(authUsers);

        // Step 5: Generate summary report
        const allErrors = [...authErrors, ...userErrors, ...contactErrors];
        generateSummaryReport(authUsers, userRecords, updatedContacts, allErrors);

        console.log('\n🎉 Organization authentication users creation completed successfully!');

    } catch (error) {
        console.error('\n💥 Fatal error during execution:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
