#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyOrganizations() {
    try {
        console.log('🔍 Verifying seeded organizations...\n');

        const { data: organizations, error } = await supabase
            .from('organizations')
            .select('name, slug, industry, settings')
            .order('created_at');

        if (error) {
            throw new Error(`Failed to fetch organizations: ${error.message}`);
        }

        console.log(`📊 Found ${organizations.length} organizations in database:\n`);

        organizations.forEach((org, index) => {
            const timezone = org.settings?.timezone || 'Not set';
            const currency = org.settings?.default_currency || 'Not set';
            const language = org.settings?.default_language || 'Not set';

            console.log(`${index + 1}. ${org.name}`);
            console.log(`   Slug: ${org.slug}`);
            console.log(`   Industry: ${org.industry}`);
            console.log(`   Timezone: ${timezone}`);
            console.log(`   Currency: ${currency}`);
            console.log(`   Language: ${language}\n`);
        });

        console.log('✅ Verification completed successfully!');

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }
}

verifyOrganizations();