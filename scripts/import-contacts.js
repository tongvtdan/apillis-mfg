#!/usr/bin/env node

/**
 * Factory Pulse - Contacts Import Script
 * 
 * This script imports contacts from the sample data into the database.
 * It must be run after creating auth users since contacts reference users.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configure dotenv
dotenv.config({ path: '.env.local' });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
    console.error('❌ Error: VITE_SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SERVICE_ROLE_KEY, or VITE_SUPABASE_ANON_KEY not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Load contacts data
function loadContacts() {
    try {
        const contactsPath = path.join(__dirname, '..', 'sample-data', '04-contacts.json');
        const contactsData = fs.readFileSync(contactsPath, 'utf8');
        return JSON.parse(contactsData);
    } catch (error) {
        console.error('❌ Error loading contacts data:', error.message);
        process.exit(1);
    }
}

// Import contact
async function importContact(contactData) {
    try {
        // For now, set created_by to null to avoid foreign key constraints
        // This can be updated later when we have a proper UUID mapping system
        let mappedCreatedBy = null;

        const { error } = await supabase
            .from('contacts')
            .insert({
                id: contactData.id,
                organization_id: contactData.organization_id,
                type: contactData.type,
                company_name: contactData.company_name,
                contact_name: contactData.contact_name,
                email: contactData.email,
                phone: contactData.phone,
                address: contactData.address,
                city: contactData.city,
                state: contactData.state,
                country: contactData.country,
                postal_code: contactData.postal_code,
                website: contactData.website,
                tax_id: contactData.tax_id,
                payment_terms: contactData.payment_terms,
                credit_limit: contactData.credit_limit,
                is_active: contactData.is_active,
                notes: contactData.notes,
                created_at: contactData.created_at,
                updated_at: contactData.updated_at
            });

        if (error) {
            console.error(`  ❌ Error importing contact ${contactData.company_name}:`, error.message);
            return { success: false, error: error.message };
        }

        console.log(`  ✅ Imported contact: ${contactData.company_name} (${contactData.id})`);
        return { success: true };
    } catch (error) {
        console.error(`  ❌ Unexpected error importing contact ${contactData.company_name}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Main execution function
async function main() {
    console.log('🚀 Factory Pulse - Contacts Import Script');
    console.log('='.repeat(60));

    console.log(`🌐 Supabase URL: ${supabaseUrl}`);
    console.log('');

    // Load contacts
    console.log('📋 Loading contacts data...');
    const contacts = loadContacts();
    console.log(`✅ Loaded ${contacts.length} contacts from sample data`);
    console.log('');



    // Track results
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each contact
    for (const contactData of contacts) {
        console.log(`👥 Processing contact: ${contactData.company_name} (${contactData.type})`);

        const result = await importContact(contactData);

        if (result.success) {
            successCount++;
            results.push({
                contact: contactData.company_name,
                type: contactData.type,
                id: contactData.id,
                status: 'success'
            });
        } else {
            errorCount++;
            results.push({
                contact: contactData.company_name,
                type: contactData.type,
                id: contactData.id,
                status: 'error',
                error: result.error
            });
        }

        console.log('');
    }

    // Summary
    console.log('📊 Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total: ${contacts.length}`);
    console.log('');

    if (errorCount > 0) {
        console.log('❌ Contacts with errors:');
        results
            .filter(r => r.status !== 'success')
            .forEach(r => {
                console.log(`  - ${r.contact} (${r.type}): ${r.error}`);
            });
        console.log('');
    }

    if (successCount > 0) {
        console.log('✅ Successfully imported contacts:');
        results
            .filter(r => r.status === 'success')
            .forEach(r => {
                console.log(`  - ${r.contact} (${r.type}) - ${r.id}`);
            });
        console.log('');
    }

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `contacts-import-${timestamp}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`📄 Detailed results saved to: ${resultsFile}`);

    console.log('');
    console.log('🎉 Contacts import completed!');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Run the script
main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
