#!/usr/bin/env node

/**
 * Check for column ambiguity issues
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
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('🔍 Checking for column ambiguity issues...\n');

    try {
        // Try different approaches to query projects
        console.log('1. Testing basic projects query...');
        const { data: projects1, error: error1 } = await supabase
            .from('projects')
            .select('*')
            .limit(1);

        if (error1) {
            console.log(`❌ Basic query failed: ${error1.message}`);
        } else {
            console.log(`✅ Basic query works, found ${projects1?.length || 0} records`);
            if (projects1 && projects1.length > 0) {
                console.log('Sample record keys:', Object.keys(projects1[0]));
            }
        }

        console.log('\n2. Testing specific column selection...');
        const { data: projects2, error: error2 } = await supabase
            .from('projects')
            .select('projects.id, projects.title, projects.current_stage_id')
            .limit(1);

        if (error2) {
            console.log(`❌ Specific column query failed: ${error2.message}`);
        } else {
            console.log(`✅ Specific column query works, found ${projects2?.length || 0} records`);
        }

        console.log('\n3. Testing without current_stage_id...');
        const { data: projects3, error: error3 } = await supabase
            .from('projects')
            .select('id, title, status, priority_level, organization_id')
            .limit(1);

        if (error3) {
            console.log(`❌ Query without current_stage_id failed: ${error3.message}`);
        } else {
            console.log(`✅ Query without current_stage_id works, found ${projects3?.length || 0} records`);
        }

        console.log('\n4. Testing RPC call to get table info...');
        const { data: tableInfo, error: tableError } = await supabase
            .rpc('get_table_columns', { table_name: 'projects' })
            .limit(1);

        if (tableError) {
            console.log(`❌ Table info RPC failed: ${tableError.message}`);
        } else {
            console.log(`✅ Table info available`);
        }

    } catch (error) {
        console.error('❌ Check failed:', error.message);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});