#!/usr/bin/env node

/**
 * Google Drive Integration Setup Script
 * 
 * This script helps set up Google Drive integration by:
 * 1. Creating the necessary database tables
 * 2. Inserting configuration from environment variables
 * 3. Validating the setup
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
}

if (!googleClientId || !googleClientSecret) {
    console.error('❌ Missing Google Drive configuration');
    console.error('Please ensure VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET are set');
    console.error('You can get these from the Google Cloud Console:');
    console.error('1. Go to https://console.cloud.google.com/');
    console.error('2. Create or select a project');
    console.error('3. Enable the Google Drive API');
    console.error('4. Create OAuth 2.0 credentials');
    console.error('5. Add your redirect URI: http://localhost:8080/auth/google/callback');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupGoogleDriveIntegration() {
    console.log('🚀 Setting up Google Drive integration...');

    try {
        // Check if tables exist
        console.log('📋 Checking database tables...');

        const { data: configTable, error: configError } = await supabase
            .from('google_drive_config')
            .select('count')
            .limit(1);

        if (configError && configError.code === '42P01') {
            console.log('⚠️ Google Drive tables not found. Please run the migration first:');
            console.log('   supabase db reset');
            console.log('   or apply the migration: 20250903080000_google_drive_integration.sql');
            return;
        }

        // Get default organization
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .limit(1);

        if (orgError || !orgs || orgs.length === 0) {
            console.error('❌ No organizations found in database');
            return;
        }

        const defaultOrg = orgs[0];
        console.log(`📍 Using organization: ${defaultOrg.name} (${defaultOrg.id})`);

        // Check if configuration already exists
        const { data: existingConfig } = await supabase
            .from('google_drive_config')
            .select('*')
            .eq('organization_id', defaultOrg.id)
            .eq('is_active', true)
            .single();

        if (existingConfig) {
            console.log('✅ Google Drive configuration already exists');
            console.log('   Client ID:', existingConfig.client_id);
            console.log('   Redirect URI:', existingConfig.redirect_uri);

            // Update with current environment variables
            const { error: updateError } = await supabase
                .from('google_drive_config')
                .update({
                    client_id: googleClientId,
                    client_secret: googleClientSecret,
                    redirect_uri: 'http://localhost:8080/auth/google/callback',
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingConfig.id);

            if (updateError) {
                console.error('❌ Failed to update configuration:', updateError);
                return;
            }

            console.log('✅ Configuration updated with current environment variables');
        } else {
            // Create new configuration
            const { data: newConfig, error: insertError } = await supabase
                .from('google_drive_config')
                .insert({
                    organization_id: defaultOrg.id,
                    client_id: googleClientId,
                    client_secret: googleClientSecret,
                    redirect_uri: 'http://localhost:8080/auth/google/callback',
                    is_active: true
                })
                .select()
                .single();

            if (insertError) {
                console.error('❌ Failed to create configuration:', insertError);
                return;
            }

            console.log('✅ Google Drive configuration created successfully');
            console.log('   ID:', newConfig.id);
            console.log('   Client ID:', newConfig.client_id);
            console.log('   Redirect URI:', newConfig.redirect_uri);
        }

        // Validate configuration
        console.log('🔍 Validating configuration...');

        const { data: finalConfig, error: validateError } = await supabase
            .from('google_drive_config')
            .select('*')
            .eq('organization_id', defaultOrg.id)
            .eq('is_active', true)
            .single();

        if (validateError || !finalConfig) {
            console.error('❌ Configuration validation failed:', validateError);
            return;
        }

        console.log('✅ Google Drive integration setup completed successfully!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Make sure your Google Cloud Console OAuth settings include:');
        console.log('   - Authorized redirect URI: http://localhost:8080/auth/google/callback');
        console.log('   - Authorized JavaScript origins: http://localhost:8080');
        console.log('2. Restart your development server: npm run dev');
        console.log('3. Test the integration from the document management page');

    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

// Run the setup
setupGoogleDriveIntegration();