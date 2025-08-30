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

async function seedOrganizations() {
    try {
        console.log('🌱 Starting organizations seeding...');

        // Load organizations data
        const organizationsPath = path.join(__dirname, '../sample-data/01-organizations.json');
        const organizationsData = JSON.parse(fs.readFileSync(organizationsPath, 'utf8'));

        console.log(`📊 Found ${organizationsData.length} organizations to seed`);

        // Check if organizations already exist
        const { data: existingOrgs, error: checkError } = await supabase
            .from('organizations')
            .select('id, name')
            .limit(1);

        if (checkError) {
            throw new Error(`Failed to check existing organizations: ${checkError.message}`);
        }

        if (existingOrgs && existingOrgs.length > 0) {
            console.log('⚠️  Organizations table already contains data');
            console.log('   Use --force flag to overwrite existing data');

            if (!process.argv.includes('--force')) {
                console.log('   Skipping seeding to prevent data loss');
                return;
            }

            console.log('🗑️  Clearing existing organizations and related data...');

            // Clear dependent tables first to avoid foreign key constraint violations
            const dependentTables = [
                'activity_log',
                'system_events',
                'user_preferences',
                'organization_settings',
                'email_templates',
                'workflow_stage_transitions',
                'workflow_business_rules',
                'approval_chains',
                'supplier_qualifications',
                'supplier_performance_metrics',
                'ai_processing_queue',
                'project_assignments',
                'project_stage_history',
                'document_access_log',
                'document_comments',
                'document_versions',
                'documents',
                'review_checklist_items',
                'reviews',
                'supplier_quotes',
                'supplier_rfqs',
                'bom_items',
                'messages',
                'notifications',
                'approval_requests',
                'workflow_rule_executions',
                'projects',
                'contacts',
                'users',
                'workflow_stages'
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

            // Now clear organizations
            const { error: deleteError } = await supabase
                .from('organizations')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                throw new Error(`Failed to clear organizations: ${deleteError.message}`);
            }
        }

        // Insert organizations
        console.log('📝 Inserting organizations...');
        const { data, error } = await supabase
            .from('organizations')
            .insert(organizationsData)
            .select();

        if (error) {
            throw new Error(`Failed to insert organizations: ${error.message}`);
        }

        console.log('✅ Successfully seeded organizations:');
        data.forEach((org, index) => {
            console.log(`   ${index + 1}. ${org.name} (${org.slug})`);
        });

        console.log(`\n🎉 Seeding completed! ${data.length} organizations added to database`);

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedOrganizations();