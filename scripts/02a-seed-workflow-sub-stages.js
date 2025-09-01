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

async function seedWorkflowSubStages() {
    try {
        console.log('🌱 Starting workflow sub-stages seeding...');

        // Load workflow sub-stages data
        const workflowSubStagesPath = path.join(__dirname, '../sample-data/02a-workflow-sub-stages.json');
        const workflowSubStagesData = JSON.parse(fs.readFileSync(workflowSubStagesPath, 'utf8'));

        console.log(`📊 Found ${workflowSubStagesData.length} workflow sub-stages to seed`);

        // Check if workflow sub-stages already exist
        const { data: existingSubStages, error: checkError } = await supabase
            .from('workflow_sub_stages')
            .select('id, name')
            .limit(1);

        if (checkError) {
            throw new Error(`Failed to check existing workflow sub-stages: ${checkError.message}`);
        }

        if (existingSubStages && existingSubStages.length > 0) {
            console.log('⚠️  Workflow sub-stages table already contains data');
            console.log('   Use --force flag to overwrite existing data');

            if (!process.argv.includes('--force')) {
                console.log('   Skipping seeding to prevent data loss');
                return;
            }

            console.log('🗑️  Clearing existing workflow sub-stages and related data...');

            // Clear dependent tables first to avoid foreign key constraint violations
            const dependentTables = [
                'project_sub_stage_progress'
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

            // Now clear workflow sub-stages
            const { error: deleteError } = await supabase
                .from('workflow_sub_stages')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                throw new Error(`Failed to clear workflow sub-stages: ${deleteError.message}`);
            }
        }

        // Verify organization exists
        const organizationId = workflowSubStagesData[0]?.organization_id;
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

        // Verify workflow stages exist
        const workflowStageIds = [...new Set(workflowSubStagesData.map(subStage => subStage.workflow_stage_id))];
        const { data: existingStages, error: stagesError } = await supabase
            .from('workflow_stages')
            .select('id, name')
            .in('id', workflowStageIds);

        if (stagesError) {
            throw new Error(`Failed to check workflow stages: ${stagesError.message}`);
        }

        if (!existingStages || existingStages.length !== workflowStageIds.length) {
            console.log('⚠️  Some workflow stages not found. Please seed workflow stages first:');
            console.log('   npm run seed:workflow-stages');
            process.exit(1);
        }

        console.log(`✅ All ${existingStages.length} workflow stages found`);

        // Insert workflow sub-stages
        console.log('📝 Inserting workflow sub-stages...');
        const { data, error } = await supabase
            .from('workflow_sub_stages')
            .insert(workflowSubStagesData)
            .select();

        if (error) {
            throw new Error(`Failed to insert workflow sub-stages: ${error.message}`);
        }

        console.log('✅ Successfully seeded workflow sub-stages:');

        // Group by workflow stage for better display
        const subStagesByStage = data.reduce((acc, subStage) => {
            const stageName = existingStages.find(stage => stage.id === subStage.workflow_stage_id)?.name || 'Unknown Stage';
            if (!acc[stageName]) {
                acc[stageName] = [];
            }
            acc[stageName].push(subStage);
            return acc;
        }, {});

        Object.entries(subStagesByStage).forEach(([stageName, subStages]) => {
            console.log(`\n   📋 ${stageName}:`);
            subStages.forEach((subStage) => {
                console.log(`      ${subStage.sub_stage_order}. ${subStage.name} (${subStage.slug}) - ${subStage.color}`);
            });
        });

        console.log(`\n🎉 Seeding completed! ${data.length} workflow sub-stages added to database`);

        // Update sub_stages_count on workflow_stages table
        console.log('🔄 Updating workflow stages sub-stages count...');
        const { error: updateError } = await supabase.rpc('update_workflow_stage_sub_stages_count');

        if (updateError) {
            console.log('⚠️  Warning: Could not update sub-stages count automatically');
        } else {
            console.log('✅ Workflow stages sub-stages count updated');
        }

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedWorkflowSubStages();
