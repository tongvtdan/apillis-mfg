#!/usr/bin/env node

/**
 * Debug projects table issue with service role
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
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
    console.log('🔍 Debugging projects table with service role...\n');

    try {
        console.log('1. Testing full record with service role...');
        const { data: fullRecord, error: fullError } = await supabase
            .from('projects')
            .select('*')
            .limit(1);

        if (fullError) {
            console.log(`❌ Full record: ${fullError.message}`);
        } else {
            console.log(`✅ Full record: OK`);
            if (fullRecord && fullRecord.length > 0) {
                console.log('Available columns:', Object.keys(fullRecord[0]));
                console.log('current_stage_id value:', fullRecord[0].current_stage_id);
            } else {
                console.log('No records found');
            }
        }

        console.log('\n2. Testing specific columns...');
        const { data: specificColumns, error: specificError } = await supabase
            .from('projects')
            .select('id, title, current_stage_id, status')
            .limit(1);

        if (specificError) {
            console.log(`❌ Specific columns: ${specificError.message}`);
        } else {
            console.log(`✅ Specific columns: OK`);
        }

        console.log('\n3. Testing other tables...');
        const { data: stages, error: stageError } = await supabase
            .from('workflow_stages')
            .select('*')
            .limit(1);

        if (stageError) {
            console.log(`❌ Workflow stages: ${stageError.message}`);
        } else {
            console.log(`✅ Workflow stages: OK, found ${stages?.length || 0} records`);
        }

        console.log('\n4. Testing raw SQL query...');
        const { data: rawData, error: rawError } = await supabase
            .rpc('exec_sql', { query: 'SELECT id, title, current_stage_id FROM projects LIMIT 1' });

        if (rawError) {
            console.log(`❌ Raw SQL: ${rawError.message}`);
        } else {
            console.log(`✅ Raw SQL: OK`);
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});