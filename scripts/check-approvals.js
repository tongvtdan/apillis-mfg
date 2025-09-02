#!/usr/bin/env node

// Script to check all approvals and their stage names

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key for more permissions
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkApprovals() {
    console.log('Checking all approvals in the database...');

    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('id, metadata, created_at, status')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching approvals:', error.message);
            return;
        }

        console.log(`Found ${data.length} approvals:`);
        console.log('----------------------------------------');

        data.forEach((approval, index) => {
            const hasStageName = !!approval.metadata?.stage_name;
            const stageName = approval.metadata?.stage_name || 'MISSING';
            const status = approval.status;

            console.log(`${index + 1}. ID: ${approval.id}`);
            console.log(`   Created: ${approval.created_at}`);
            console.log(`   Status: ${status}`);
            console.log(`   Stage name: ${stageName}`);
            console.log(`   Valid: ${hasStageName}`);
            console.log('----------------------------------------');
        });

        // Count valid vs invalid approvals
        const validCount = data.filter(approval => !!approval.metadata?.stage_name).length;
        const invalidCount = data.length - validCount;

        console.log(`\nSummary:`);
        console.log(`- Valid approvals (with stage_name): ${validCount}`);
        console.log(`- Invalid approvals (missing stage_name): ${invalidCount}`);
        console.log(`- Total approvals: ${data.length}`);

    } catch (error) {
        console.error('Error checking approvals:', error.message);
    }
}

// Run the script
checkApprovals();