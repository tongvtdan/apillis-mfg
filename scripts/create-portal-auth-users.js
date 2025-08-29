#!/usr/bin/env node

/**
 * Script to create authentication users for external portal customers and suppliers
 * Default password: Password@123
 * These users will be linked to contacts table, not users table (as per schema design)
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Default password for all users
const DEFAULT_PASSWORD = 'Password@123';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createPortalAuthUsers() {
    try {
        console.log('🚀 Starting portal authentication user creation...\n');

        // Get all contacts (customers and suppliers) from the database
        const { data: contacts, error: fetchError } = await supabase
            .from('contacts')
            .select(`
        id,
        email,
        contact_name,
        company_name,
        type,
        organization_id,
        organizations (
          name,
          slug
        )
      `)
            .not('email', 'is', null)
            .order('type', { ascending: true })
            .order('company_name', { ascending: true });

        if (fetchError) {
            throw new Error(`Error fetching contacts: ${fetchError.message}`);
        }

        if (!contacts || contacts.length === 0) {
            console.log('❌ No contacts found with email addresses');
            return;
        }

        console.log(`📋 Found ${contacts.length} contacts to create authentication accounts for:\n`);

        // Display contacts to be created
        contacts.forEach((contact, index) => {
            console.log(`${index + 1}. ${contact.contact_name} (${contact.email}) - ${contact.company_name} [${contact.type.toUpperCase()}]`);
        });

        console.log('\n🔐 Creating portal authentication users...\n');

        let successCount = 0;
        let errorCount = 0;

        // Create authentication users one by one
        for (const contact of contacts) {
            try {
                console.log(`Creating auth user for: ${contact.contact_name} (${contact.email})...`);

                // Create user in auth.users table
                const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
                    email: contact.email,
                    password: DEFAULT_PASSWORD,
                    email_confirm: true, // Auto-confirm email
                    user_metadata: {
                        name: contact.contact_name,
                        company: contact.company_name,
                        type: contact.type, // 'customer' or 'supplier'
                        contact_id: contact.id, // Link to contacts table
                        organization_id: contact.organization_id,
                        organization_name: contact.organizations?.name,
                        organization_slug: contact.organizations?.slug,
                        portal_user: true // Flag to identify portal users
                    }
                });

                if (createError) {
                    console.log(`❌ Error creating auth user for ${contact.email}: ${createError.message}`);
                    errorCount++;
                } else {
                    console.log(`✅ Successfully created auth user for ${contact.email} (ID: ${authUser.user.id})`);
                    successCount++;
                }

                // Small delay to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.log(`❌ Unexpected error for ${contact.email}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successfully created: ${successCount} portal users`);
        console.log(`❌ Errors: ${errorCount} portal users`);
        console.log(`📧 Default password for all portal users: ${DEFAULT_PASSWORD}`);
        console.log('\n🎉 Portal authentication user creation completed!');

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
createPortalAuthUsers();
