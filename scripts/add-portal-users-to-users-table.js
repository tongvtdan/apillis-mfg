#!/usr/bin/env node

/**
 * Script to add portal users (customers and suppliers) to the users table
 * for profile management while keeping them in contacts table for business logic
 * This creates a dual approach: auth users + contacts table + users table entries
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function addPortalUsersToUsersTable() {
    try {
        console.log('🚀 Starting portal users table addition...\n');

        // Get all contacts (customers and suppliers) that have auth users
        const { data: contacts, error: fetchError } = await supabase
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
        country,
        website,
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

        console.log(`📋 Found ${contacts.length} contacts to add to users table:\n`);

        // Display contacts to be added
        contacts.forEach((contact, index) => {
            console.log(`${index + 1}. ${contact.contact_name} (${contact.email}) - ${contact.company_name} [${contact.type.toUpperCase()}]`);
        });

        console.log('\n👤 Adding portal users to users table...\n');

        let successCount = 0;
        let errorCount = 0;

        // Add each contact to the users table
        for (const contact of contacts) {
            try {
                console.log(`Adding to users table: ${contact.contact_name} (${contact.email})...`);

                // Check if user already exists in users table
                const { data: existingUser, error: checkError } = await supabase
                    .from('users')
                    .select('id, email')
                    .eq('email', contact.email)
                    .single();

                if (existingUser) {
                    console.log(`⚠️  User already exists in users table: ${contact.email}`);
                    continue;
                }

                // Add user to users table with portal-specific data
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert({
                        organization_id: contact.organization_id,
                        email: contact.email,
                        name: contact.contact_name,
                        role: contact.type, // 'customer' or 'supplier'
                        department: contact.type === 'customer' ? 'Customer Portal' : 'Supplier Portal',
                        phone: contact.phone,
                        status: 'active',
                        description: `${contact.type === 'customer' ? 'Customer' : 'Supplier'} portal user for ${contact.company_name}`,
                        preferences: {
                            portal_type: contact.type,
                            company_name: contact.company_name,
                            organization_name: contact.organizations?.name,
                            is_portal_user: true,
                            contact_id: contact.id // Link back to contacts table
                        }
                    })
                    .select()
                    .single();

                if (insertError) {
                    // If role constraint error, try with 'external' role
                    if (insertError.message.includes('violates check constraint')) {
                        console.log(`⚠️  Role constraint issue, trying with 'external' role...`);

                        const { data: retryUser, error: retryError } = await supabase
                            .from('users')
                            .insert({
                                organization_id: contact.organization_id,
                                email: contact.email,
                                name: contact.contact_name,
                                role: 'external', // Use 'external' role for portal users
                                department: contact.type === 'customer' ? 'Customer Portal' : 'Supplier Portal',
                                phone: contact.phone,
                                status: 'active',
                                description: `${contact.type === 'customer' ? 'Customer' : 'Supplier'} portal user for ${contact.company_name}`,
                                preferences: {
                                    portal_type: contact.type,
                                    company_name: contact.company_name,
                                    organization_name: contact.organizations?.name,
                                    is_portal_user: true,
                                    contact_id: contact.id
                                }
                            })
                            .select()
                            .single();

                        if (retryError) {
                            console.log(`❌ Error adding user with 'external' role: ${retryError.message}`);
                            errorCount++;
                        } else {
                            console.log(`✅ Successfully added user with 'external' role: ${contact.email} (ID: ${retryUser.id})`);
                            successCount++;
                        }
                    } else {
                        console.log(`❌ Error adding user: ${insertError.message}`);
                        errorCount++;
                    }
                } else {
                    console.log(`✅ Successfully added user: ${contact.email} (ID: ${newUser.id})`);
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
        console.log(`✅ Successfully added to users table: ${successCount} portal users`);
        console.log(`❌ Errors: ${errorCount} portal users`);
        console.log(`📧 Portal users now have entries in both contacts and users tables`);
        console.log('\n🎉 Portal users table addition completed!');

        if (errorCount > 0) {
            console.log('\n⚠️  Some users failed to be added. Check the error messages above.');
            console.log('💡 You may need to update the users table schema to support portal user roles.');
            process.exit(1);
        }

    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the script
addPortalUsersToUsersTable();
