#!/usr/bin/env node

// Script to clean up old approvals that don't have stage_name in metadata

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key for more permissions
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupOldApprovals() {
    console.log('Cleaning up old approvals without stage_name...');

    try {
        // Find approvals without stage_name in metadata
        const { data: invalidApprovals, error: fetchError } = await supabase
            .from('reviews')
            .select('id, created_at')
            .or('metadata.is.null,metadata->>stage_name.is.null');

        if (fetchError) {
            console.error('Error fetching invalid approvals:', fetchError.message);
            return;
        }

        if (invalidApprovals.length === 0) {
            console.log('No invalid approvals found. All approvals have stage_name.');
            return;
        }

        console.log(`Found ${invalidApprovals.length} approvals without stage_name:`);
        invalidApprovals.forEach((approval, index) => {
            console.log(`${index + 1}. ID: ${approval.id} | Created: ${approval.created_at}`);
        });

        // Delete the invalid approvals
        const approvalIds = invalidApprovals.map(approval => approval.id);

        const { error: deleteError } = await supabase
            .from('reviews')
            .delete()
            .in('id', approvalIds);

        if (deleteError) {
            console.error('Error deleting approvals:', deleteError.message);
            return;
        }

        console.log(`\nSuccessfully deleted ${approvalIds.length} approvals without stage_name.`);
        console.log('The dashboard should now show proper stage names for all approvals.');

    } catch (error) {
        console.error('Error cleaning up approvals:', error.message);
    }
}

// Run the script
cleanupOldApprovals();