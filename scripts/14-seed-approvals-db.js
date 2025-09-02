#!/usr/bin/env node

// Script to insert sample approval requests into the database
// This script reads from the approvals sample data and inserts into the reviews table

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function seedApprovalsToDatabase() {
    console.log('Seeding approval requests to database...');

    try {
        // Check if we're connected to Supabase
        const { data: healthCheck, error: healthError } = await supabase
            .from('organizations')
            .select('id')
            .limit(1);

        if (healthError) {
            console.error('Error connecting to Supabase:', healthError.message);
            console.error('Please check your .env.local file and ensure Supabase is running');
            return;
        }

        // Read the approvals sample data
        const approvalsPath = path.join(__dirname, '../sample-data/14-approvals.json');

        if (!fs.existsSync(approvalsPath)) {
            console.error('Approvals sample data not found. Please run "npm run seed:approvals" first to generate the data.');
            return;
        }

        const approvalsData = JSON.parse(fs.readFileSync(approvalsPath, 'utf8'));
        console.log(`Found ${approvalsData.length} approval requests to insert`);

        // Check if approvals already exist
        const { data: existingApprovals, error: checkError } = await supabase
            .from('reviews')
            .select('id')
            .ilike('review_type', 'stage_approval_%')
            .limit(5);

        if (checkError) {
            console.error('Error checking existing approvals:', checkError.message);
            return;
        }

        if (existingApprovals && existingApprovals.length > 0) {
            console.log('Existing approval requests found in database.');
            const answer = await askQuestion('Do you want to continue and potentially create duplicates? (y/N): ');
            if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                console.log('Operation cancelled.');
                return;
            }
        }

        // Insert approvals one by one to handle any errors
        let successCount = 0;
        let errorCount = 0;

        for (const approval of approvalsData) {
            try {
                // Remove fields that shouldn't be inserted directly
                const { id, reviewer_role, ...approvalToInsert } = approval;

                // Convert reviewer_role to metadata if needed
                if (reviewer_role && approvalToInsert.metadata) {
                    approvalToInsert.metadata.reviewer_role = reviewer_role;
                }

                const { data, error } = await supabase
                    .from('reviews')
                    .insert([approvalToInsert])
                    .select();

                if (error) {
                    console.error(`Error inserting approval ${approval.id}:`, error.message);
                    errorCount++;
                } else {
                    console.log(`Successfully inserted approval ${approval.id}`);
                    successCount++;
                }
            } catch (error) {
                console.error(`Error processing approval ${approval.id}:`, error.message);
                errorCount++;
            }
        }

        console.log('');
        console.log('Seeding complete!');
        console.log(`Successfully inserted: ${successCount} approvals`);
        console.log(`Errors: ${errorCount} approvals`);

        if (successCount > 0) {
            console.log('');
            console.log('To view these approvals:');
            console.log('1. Log in as a user with an engineering, production, qa, or management role');
            console.log('2. Navigate to the Approvals page (/approvals)');
            console.log('3. You should now see pending approvals assigned to your role');
        }

    } catch (error) {
        console.error('Error seeding approvals to database:', error.message);
    }
}

// Helper function to ask for user input
function askQuestion(query) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

// Run the script
seedApprovalsToDatabase();