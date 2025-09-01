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

async function seedWorkflowStages() {
    try {
        console.log('🌱 Starting workflow stages seeding...');

        // Load workflow stages data
        const workflowStagesPath = path.join(__dirname, '../sample-data/02-workflow-stages.json');
        const workflowStagesData = JSON.parse(fs.readFileSync(workflowStagesPath, 'utf8'));

        console.log(`📊 Found ${workflowStagesData.length} workflow stages to seed`);

        // Check if workflow stages already exist
        const { data: existingStages, error: checkError } = await supabase
            .from('workflow_stages')
            .select('id, name')
            .limit(1);

        if (checkError) {
            throw new Error(`Failed to check existing workflow stages: ${checkError.message}`);
        }

        if (existingStages && existingStages.length > 0) {
            console.log('⚠️  Workflow stages table already contains data');
            console.log('   Use --force flag to overwrite existing data');

            if (!process.argv.includes('--force')) {
                console.log('   Skipping seeding to prevent data loss');
                return;
            }

            console.log('🗑️  Clearing existing workflow stages and related data...');

            // Clear dependent tables first to avoid foreign key constraint violations
            const dependentTables = [
                'project_stage_history',
                'workflow_stage_transitions',
                'workflow_business_rules',
                'projects' // This has current_stage_id reference
            ];

            for (const table of dependentTables) {
                try {
                    if (table === 'projects') {
                        // For projects, just set current_stage_id to null
                        const { error } = await supabase
                            .from(table)
                            .update({ current_stage_id: null })
                            .not('id', 'is', null);

                        if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
                            console.log(`   ⚠️  Warning updating ${table}: ${error.message}`);
                        }
                    } else {
                        const { error } = await supabase
                            .from(table)
                            .delete()
                            .neq('id', '00000000-0000-0000-0000-000000000000');

                        if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
                            console.log(`   ⚠️  Warning clearing ${table}: ${error.message}`);
                        }
                    }
                } catch (err) {
                    // Ignore table not found errors
                    console.log(`   ⚠️  Skipping ${table} (table may not exist)`);
                }
            }

            // Now clear workflow stages
            const { error: deleteError } = await supabase
                .from('workflow_stages')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                throw new Error(`Failed to clear workflow stages: ${deleteError.message}`);
            }
        }

        // Verify organization exists
        const organizationId = workflowStagesData[0]?.organization_id;
        if (organizationId) {
            const { data: orgExists, error: orgError } = await supabase
                .from('organizations')
                .select('id, name')
                .eq('id', organizationId)
                .single();

            if (orgError || !orgExists) {
                console.log('⚠️  Referenced organization not found. Please seed organizations first:');
                console.log('   npm run seed:organizations');
                process.exit(1);
            }

            console.log(`✅ Organization found: ${orgExists.name}`);
        }

        // Insert workflow stages
        console.log('📝 Inserting workflow stages...');
        const { data, error } = await supabase
            .from('workflow_stages')
            .insert(workflowStagesData)
            .select();

        if (error) {
            throw new Error(`Failed to insert workflow stages: ${error.message}`);
        }

        console.log('✅ Successfully seeded workflow stages:');
        data.forEach((stage) => {
            console.log(`   ${stage.stage_order}. ${stage.name} (${stage.slug}) - ${stage.color} - ${stage.sub_stages_count || 0} sub-stages`);
        });

        console.log(`\n🎉 Seeding completed! ${data.length} workflow stages added to database`);
        console.log('\n📋 Sub-stages Summary:');
        console.log('   • Inquiry Received: 3 sub-stages');
        console.log('   • Technical Review: 4 sub-stages');
        console.log('   • Supplier RFQ Sent: 4 sub-stages');
        console.log('   • Quoted: 4 sub-stages');
        console.log('   • Order Confirmed: 3 sub-stages');
        console.log('   • Procurement Planning: 4 sub-stages');
        console.log('   • In Production: 4 sub-stages');
        console.log('   • Shipped & Closed: 4 sub-stages');
        console.log('\n💡 Next step: Run "npm run seed:workflow-sub-stages" to seed the sub-stages data');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedWorkflowStages();