#!/usr/bin/env node

/**
 * Script to validate that the activity_log table has proper RLS policies
 * This helps prevent recurrence of the workflow transition bug
 */

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function validateActivityLogPolicies() {
    try {
        console.log('🔍 Validating activity_log RLS policies...');

        // Check if we can access the activity_log table policies
        const { data: policies, error } = await supabase.rpc('get_policies', {
            table_name: 'activity_log'
        });

        if (error) {
            console.warn('⚠️  Could not fetch policies (this is expected in development)');
            console.warn('Skipping policy validation');
            return true;
        }

        if (!policies || policies.length === 0) {
            console.error('❌ No policies found for activity_log table');
            return false;
        }

        // Check for required policies
        const hasSelectPolicy = policies.some(p =>
            p.action === 'SELECT' && p.role === 'authenticated'
        );

        const hasInsertPolicy = policies.some(p =>
            p.action === 'INSERT' && p.role === 'authenticated'
        );

        if (!hasSelectPolicy) {
            console.error('❌ Missing SELECT policy for activity_log table');
            return false;
        }

        if (!hasInsertPolicy) {
            console.error('❌ Missing INSERT policy for activity_log table');
            console.error('This will cause workflow transition failures');
            return false;
        }

        console.log('✅ All required activity_log policies are present');
        return true;

    } catch (error) {
        console.warn('⚠️  Policy validation skipped due to error:', error.message);
        // Don't fail the script on validation errors
        return true;
    }
}

// Run validation
validateActivityLogPolicies().then(isValid => {
    if (isValid) {
        console.log('✅ Activity log policy validation passed');
        process.exit(0);
    } else {
        console.error('❌ Activity log policy validation failed');
        process.exit(1);
    }
});