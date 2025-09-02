#!/usr/bin/env node

/**
 * Debug projects table issue
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
    console.log('🔍 Debugging projects table issue...\n');

    try {
        // Try selecting specific columns one by one
        console.log('1. Testing individual columns...');

        const columns = [
            'id', 'organization_id', 'project_id', 'title', 'description',
            'customer_id', 'status', 'priority_level', 'priority_score',
            'estimated_value', 'source', 'assigned_to', 'created_by',
            'created_at', 'updated_at'
        ];

        for (const column of columns) {
            const { data, error } = await supabase
                .from('projects')
                .select(column)
                .limit(1);

            if (error) {
                console.log(`❌ ${column}: ${error.message}`);
            } else {
                console.log(`✅ ${column}: OK`);
            }
        }

        console.log('\n2. Testing current_stage_id specifically...');
        const { data, error } = await supabase
            .from('projects')
            .select('current_stage_id')
            .limit(1);

        if (error) {
            console.log(`❌ current_stage_id: ${error.message}`);
        } else {
            console.log(`✅ current_stage_id: OK`);
        }

        console.log('\n3. Testing with explicit table prefix...');
        const { data: data2, error: error2 } = await supabase
            .from('projects')
            .select('projects.current_stage_id')
            .limit(1);

        if (error2) {
            console.log(`❌ projects.current_stage_id: ${error2.message}`);
        } else {
            console.log(`✅ projects.current_stage_id: OK`);
        }

        console.log('\n4. Testing full record...');
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
            }
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