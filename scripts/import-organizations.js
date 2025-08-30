#!/usr/bin/env node

/**
 * Factory Pulse - Organizations Import Script
 * 
 * This script imports organizations from the sample data into the database.
 * It must be run before creating auth users since users reference organizations.
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

// Load organizations data
function loadOrganizations() {
    try {
        const orgsPath = path.join(__dirname, '..', 'sample-data', '01-organizations.json');
        const orgsData = fs.readFileSync(orgsPath, 'utf8');
        return JSON.parse(orgsData);
    } catch (error) {
        console.error('❌ Error loading organizations data:', error.message);
        process.exit(1);
    }
}

// Import organization
async function importOrganization(orgData) {
    try {
        const { error } = await supabase
            .from('organizations')
            .insert({
                id: orgData.id,
                name: orgData.name,
                slug: orgData.slug,
                domain: orgData.domain,
                logo_url: orgData.logo_url,
                description: orgData.description,
                industry: orgData.industry,
                settings: orgData.settings,
                subscription_plan: orgData.subscription_plan,
                is_active: orgData.is_active,
                created_at: orgData.created_at,
                updated_at: orgData.updated_at
            });

        if (error) {
            console.error(`  ❌ Error importing organization ${orgData.name}:`, error.message);
            return { success: false, error: error.message };
        }

        console.log(`  ✅ Imported organization: ${orgData.name} (${orgData.id})`);
        return { success: true };
    } catch (error) {
        console.error(`  ❌ Unexpected error importing organization ${orgData.name}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Main execution function
async function main() {
    console.log('🚀 Factory Pulse - Organizations Import Script');
    console.log('='.repeat(60));

    console.log(`🌐 Supabase URL: ${supabaseUrl}`);
    console.log('');

    // Load organizations
    console.log('📋 Loading organizations data...');
    const organizations = loadOrganizations();
    console.log(`✅ Loaded ${organizations.length} organizations from sample data`);
    console.log('');

    // Track results
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each organization
    for (const orgData of organizations) {
        console.log(`🏢 Processing organization: ${orgData.name}`);

        const result = await importOrganization(orgData);

        if (result.success) {
            successCount++;
            results.push({
                organization: orgData.name,
                id: orgData.id,
                status: 'success'
            });
        } else {
            errorCount++;
            results.push({
                organization: orgData.name,
                id: orgData.id,
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
    console.log(`📝 Total: ${organizations.length}`);
    console.log('');

    if (errorCount > 0) {
        console.log('❌ Organizations with errors:');
        results
            .filter(r => r.status !== 'success')
            .forEach(r => {
                console.log(`  - ${r.organization}: ${r.error}`);
            });
        console.log('');
    }

    if (successCount > 0) {
        console.log('✅ Successfully imported organizations:');
        results
            .filter(r => r.status === 'success')
            .forEach(r => {
                console.log(`  - ${r.organization} (${r.id})`);
            });
        console.log('');
    }

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `organizations-import-${timestamp}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`📄 Detailed results saved to: ${resultsFile}`);

    console.log('');
    console.log('🎉 Organizations import completed!');
    console.log('Next step: Run the auth users creation script');
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
