#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
    console.error('\nPlease check your .env.local file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedContacts() {
    try {
        console.log('🌱 Starting contacts seeding...');

        // Load contacts data
        const contactsPath = path.join(__dirname, '../sample-data/04-contacts.json');
        const contactsData = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));

        console.log(`📊 Found ${contactsData.length} contacts to seed`);

        // Check if contacts already exist
        const { data: existingContacts, error: checkError } = await supabase
            .from('contacts')
            .select('id, company_name')
            .limit(1);

        if (checkError) {
            throw new Error(`Failed to check existing contacts: ${checkError.message}`);
        }

        if (existingContacts && existingContacts.length > 0) {
            console.log('⚠️  Contacts table already contains data');
            console.log('   Use --force flag to overwrite existing data');

            if (!process.argv.includes('--force')) {
                console.log('   Skipping seeding to prevent data loss');
                return;
            }

            console.log('🗑️  Clearing existing contacts and related data...');

            // Clear dependent tables first to avoid foreign key constraint violations
            const dependentTables = [
                'supplier_quotes',
                'supplier_rfqs',
                'projects',
                'messages',
                'notifications'
            ];

            for (const table of dependentTables) {
                try {
                    const { error } = await supabase
                        .from(table)
                        .delete()
                        .neq('id', '00000000-0000-0000-0000-000000000000');

                    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
                        console.log(`   ⚠️  Warning clearing ${table}: ${error.message}`);
                    }
                } catch (err) {
                    // Ignore table not found errors
                    console.log(`   ⚠️  Skipping ${table} (table may not exist)`);
                }
            }

            // Now clear contacts
            const { error: deleteError } = await supabase
                .from('contacts')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                throw new Error(`Failed to clear contacts: ${deleteError.message}`);
            }
        }

        // Verify organizations exist
        console.log('🔍 Verifying organizations exist...');
        const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('id');

        if (orgError) {
            throw new Error(`Failed to fetch organizations: ${orgError.message}`);
        }

        if (!organizations || organizations.length === 0) {
            throw new Error('No organizations found. Please run 01-seed-organizations.js first');
        }

        const orgIds = new Set(organizations.map(org => org.id));

        // Validate contact data and fix created_by references
        const validContacts = contactsData.filter(contact => {
            if (!orgIds.has(contact.organization_id)) {
                console.log(`⚠️  Skipping contact ${contact.company_name}: Invalid organization_id ${contact.organization_id}`);
                return false;
            }
            return true;
        }).map(contact => {
            // Set created_by to null since users don't exist yet
            return {
                ...contact,
                created_by: null
            };
        });

        if (validContacts.length === 0) {
            throw new Error('No valid contacts found. All contacts have invalid organization_id references');
        }

        // Insert contacts
        console.log('📝 Inserting contacts...');
        const { data, error } = await supabase
            .from('contacts')
            .insert(validContacts)
            .select();

        if (error) {
            throw new Error(`Failed to insert contacts: ${error.message}`);
        }

        console.log('✅ Successfully seeded contacts:');

        // Group by type for better display
        const customers = data.filter(contact => contact.type === 'customer');
        const suppliers = data.filter(contact => contact.type === 'supplier');

        if (customers.length > 0) {
            console.log(`\n👥 Customers (${customers.length}):`);
            customers.forEach((contact, index) => {
                console.log(`   ${index + 1}. ${contact.company_name} - ${contact.contact_name}`);
            });
        }

        if (suppliers.length > 0) {
            console.log(`\n🏭 Suppliers (${suppliers.length}):`);
            suppliers.forEach((contact, index) => {
                console.log(`   ${index + 1}. ${contact.company_name} - ${contact.contact_name}`);
            });
        }

        console.log(`\n🎉 Seeding completed! ${data.length} contacts added to database`);
        console.log(`📊 Summary: ${customers.length} customers, ${suppliers.length} suppliers`);

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedContacts();
