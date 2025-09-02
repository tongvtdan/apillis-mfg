#!/usr/bin/env node

/**
 * Simple Database Schema Check
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🔍 Simple schema check...\n');

    try {
        // Test basic project query without joins
        console.log('Testing projects table...');
        const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('id, title, status, priority_level')
            .limit(1);

        if (projectError) {
            console.log(`❌ Projects table error: ${projectError.message}`);
        } else {
            console.log(`✅ Projects table accessible, found ${projects?.length || 0} records`);
        }

        // Test workflow_stages
        console.log('Testing workflow_stages table...');
        const { data: stages, error: stageError } = await supabase
            .from('workflow_stages')
            .select('id, name, stage_order')
            .limit(1);

        if (stageError) {
            console.log(`❌ Workflow stages error: ${stageError.message}`);
        } else {
            console.log(`✅ Workflow stages accessible, found ${stages?.length || 0} records`);
        }

        // Test workflow_sub_stages
        console.log('Testing workflow_sub_stages table...');
        const { data: subStages, error: subStageError } = await supabase
            .from('workflow_sub_stages')
            .select('id, name, sub_stage_order')
            .limit(1);

        if (subStageError) {
            console.log(`❌ Workflow sub-stages error: ${subStageError.message}`);
        } else {
            console.log(`✅ Workflow sub-stages accessible, found ${subStages?.length || 0} records`);
        }

        // Test project_sub_stage_progress
        console.log('Testing project_sub_stage_progress table...');
        const { data: progress, error: progressError } = await supabase
            .from('project_sub_stage_progress')
            .select('id, status')
            .limit(1);

        if (progressError) {
            console.log(`❌ Project sub-stage progress error: ${progressError.message}`);
        } else {
            console.log(`✅ Project sub-stage progress accessible, found ${progress?.length || 0} records`);
        }

        // Test contacts
        console.log('Testing contacts table...');
        const { data: contacts, error: contactError } = await supabase
            .from('contacts')
            .select('id, company_name, type')
            .limit(1);

        if (contactError) {
            console.log(`❌ Contacts error: ${contactError.message}`);
        } else {
            console.log(`✅ Contacts accessible, found ${contacts?.length || 0} records`);
        }

        console.log('\n✅ Basic schema check completed successfully!');

    } catch (error) {
        console.error('❌ Schema check failed:', error.message);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});