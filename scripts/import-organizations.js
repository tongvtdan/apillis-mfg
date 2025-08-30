#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY not found in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importOrganizations() {
    console.log('🚀 Factory Pulse - Organizations Import Script');
    console.log('============================================================');
    console.log(`🌐 Supabase URL: ${supabaseUrl}\n`);

    try {
        // Load organizations data
        console.log('📋 Loading organizations data...');
        const organizationsPath = join(__dirname, '..', 'sample-data', '01-organizations.json');
        const organizationsData = JSON.parse(fs.readFileSync(organizationsPath, 'utf8'));
        console.log(`✅ Loaded ${organizationsData.length} organizations from sample data\n`);

        const results = {
            success: [],
            errors: []
        };

        // Import each organization
        for (const org of organizationsData) {
            try {
                console.log(`🏢 Processing organization: ${org.name}`);

                const { data, error } = await supabase
                    .from('organizations')
                    .insert([org])
                    .select();

                if (error) {
                    console.error(`❌ Error importing ${org.name}:`, error.message);
                    results.errors.push({
                        name: org.name,
                        error: error.message
                    });
                } else {
                    console.log(`  ✅ Imported organization: ${org.name} (${org.id})`);
                    results.success.push({
                        name: org.name,
                        id: org.id
                    });
                }
            } catch (err) {
                console.error(`❌ Unexpected error importing ${org.name}:`, err.message);
                results.errors.push({
                    name: org.name,
                    error: err.message
                });
            }
        }

        // Summary
        console.log('\n📊 Summary');
        console.log('============================================================');
        console.log(`✅ Successful: ${results.success.length}`);
        console.log(`❌ Errors: ${results.errors.length}`);
        console.log(`📝 Total: ${organizationsData.length}\n`);

        if (results.success.length > 0) {
            console.log('✅ Successfully imported organizations:');
            results.success.forEach(org => {
                console.log(`  - ${org.name} (${org.id})`);
            });
        }

        if (results.errors.length > 0) {
            console.log('\n❌ Failed organizations:');
            results.errors.forEach(error => {
                console.log(`  - ${error.name}: ${error.error}`);
            });
        }

        // Save results to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsFile = join(__dirname, `organizations-import-${timestamp}.json`);
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        console.log(`\n📄 Detailed results saved to: ${resultsFile}`);

        console.log('\n🎉 Organizations import completed!');
        console.log('Next step: Run the auth users creation script');

        return results;

    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    importOrganizations()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Fatal error:', error);
            process.exit(1);
        });
}

export { importOrganizations };
