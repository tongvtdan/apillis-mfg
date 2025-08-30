#!/usr/bin/env node

/**
 * Factory Pulse - Auth Users Creation Script
 * 
 * This script creates Supabase auth users with matching UUIDs for the sample data.
 * It reads the users.json file and creates corresponding auth users and user profiles.
 * 
 * Usage:
 *   node scripts/create-auth-users.js [--password=PASSWORD] [--email-domain=DOMAIN]
 * 
 * Options:
 *   --password=PASSWORD    Default password for all users (default: "FactoryPulse2025!")
 *   --email-domain=DOMAIN  Email domain to use if emails don't have domains (default: "factorypulse.vn")
 *   --dry-run             Show what would be created without actually creating users
 *   --help                Show this help message
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configure dotenv
dotenv.config({ path: '.env.local' });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DEFAULT_PASSWORD = 'FactoryPulse2025!';
const DEFAULT_EMAIL_DOMAIN = 'factorypulse.vn';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    password: DEFAULT_PASSWORD,
    emailDomain: DEFAULT_EMAIL_DOMAIN,
    dryRun: false,
    help: false
};

args.forEach(arg => {
    if (arg.startsWith('--password=')) {
        options.password = arg.split('=')[1];
    } else if (arg.startsWith('--email-domain=')) {
        options.emailDomain = arg.split('=')[1];
    } else if (arg === '--dry-run') {
        options.dryRun = true;
    } else if (arg === '--help') {
        options.help = true;
    }
});

if (options.help) {
    console.log(`
Factory Pulse - Auth Users Creation Script

Usage:
  node scripts/create-auth-users.js [--password=PASSWORD] [--email-domain=DOMAIN] [--dry-run]

Options:
  --password=PASSWORD    Default password for all users (default: "${DEFAULT_PASSWORD}")
  --email-domain=DOMAIN  Email domain to use if emails don't have domains (default: "${DEFAULT_EMAIL_DOMAIN}")
  --dry-run             Show what would be created without actually creating users
  --help                Show this help message

Examples:
  node scripts/create-auth-users.js
  node scripts/create-auth-users.js --password=MySecurePass123
  node scripts/create-auth-users.js --email-domain=example.com --dry-run
`);
    process.exit(0);
}

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY not found in .env.local');
    console.error('Please ensure your .env.local file contains the necessary Supabase keys.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Load sample users data
function loadSampleUsers() {
    try {
        const usersPath = path.join(__dirname, '..', 'sample-data', '03-users.json');
        const usersData = fs.readFileSync(usersPath, 'utf8');
        return JSON.parse(usersData);
    } catch (error) {
        console.error('❌ Error loading sample users data:', error.message);
        process.exit(1);
    }
}

// Validate email format and add domain if needed
function normalizeEmail(email, domain) {
    if (email.includes('@')) {
        return email;
    }
    return `${email}@${domain}`;
}

// Create Supabase auth user
async function createAuthUser(userData, password) {
    try {
        const email = normalizeEmail(userData.email, options.emailDomain);

        if (options.dryRun) {
            console.log(`  🔍 Would create auth user: ${email} (${userData.id})`);
            return { success: true, user: { id: userData.id, email } };
        }

        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                name: userData.name,
                role: userData.role,
                department: userData.department
            }
        });

        if (error) {
            console.error(`  ❌ Error creating auth user for ${email}:`, error.message);
            return { success: false, error: error.message };
        }

        console.log(`  ✅ Created auth user: ${email} (${data.user.id})`);
        return { success: true, user: data.user };
    } catch (error) {
        console.error(`  ❌ Unexpected error creating auth user for ${userData.email}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Update user profile with auth user ID
async function updateUserProfile(userData, authUserId) {
    try {
        if (options.dryRun) {
            console.log(`  🔍 Would update user profile: ${userData.id} with auth user ID: ${authUserId}`);
            return { success: true };
        }

        const { error } = await supabase
            .from('users')
            .update({ user_id: authUserId })
            .eq('id', userData.id);

        if (error) {
            console.error(`  ❌ Error updating user profile ${userData.id}:`, error.message);
            return { success: false, error: error.message };
        }

        console.log(`  ✅ Updated user profile: ${userData.id} with auth user ID: ${authUserId}`);
        return { success: true };
    } catch (error) {
        console.error(`  ❌ Unexpected error updating user profile ${userData.id}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Main execution function
async function main() {
    console.log('🚀 Factory Pulse - Auth Users Creation Script');
    console.log('='.repeat(60));

    if (options.dryRun) {
        console.log('🔍 DRY RUN MODE - No actual changes will be made');
        console.log('');
    }

    console.log(`📧 Email Domain: ${options.emailDomain}`);
    console.log(`🔑 Default Password: ${options.password}`);
    console.log(`🌐 Supabase URL: ${supabaseUrl}`);
    console.log('');

    // Load sample users
    console.log('📋 Loading sample users data...');
    const users = loadSampleUsers();
    console.log(`✅ Loaded ${users.length} users from sample data`);
    console.log('');

    // Track results
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each user
    for (const userData of users) {
        console.log(`👤 Processing user: ${userData.name} (${userData.role})`);

        // Create auth user
        const authResult = await createAuthUser(userData, options.password);

        if (authResult.success) {
            // Update user profile with auth user ID
            const profileResult = await updateUserProfile(userData, authResult.user.id);

            if (profileResult.success) {
                successCount++;
                results.push({
                    user: userData.name,
                    email: normalizeEmail(userData.email, options.emailDomain),
                    role: userData.role,
                    status: 'success',
                    authUserId: authResult.user.id
                });
            } else {
                errorCount++;
                results.push({
                    user: userData.name,
                    email: normalizeEmail(userData.email, options.emailDomain),
                    role: userData.role,
                    status: 'profile_error',
                    error: profileResult.error
                });
            }
        } else {
            errorCount++;
            results.push({
                user: userData.name,
                email: normalizeEmail(userData.email, options.emailDomain),
                role: userData.role,
                status: 'auth_error',
                error: authResult.error
            });
        }

        console.log('');
    }

    // Summary
    console.log('📊 Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total: ${users.length}`);
    console.log('');

    if (errorCount > 0) {
        console.log('❌ Users with errors:');
        results
            .filter(r => r.status !== 'success')
            .forEach(r => {
                console.log(`  - ${r.user} (${r.email}): ${r.status} - ${r.error}`);
            });
        console.log('');
    }

    if (successCount > 0) {
        console.log('✅ Successfully created users:');
        results
            .filter(r => r.status === 'success')
            .forEach(r => {
                console.log(`  - ${r.user} (${r.email}) - ${r.role}`);
            });
        console.log('');
    }

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `auth-users-creation-${timestamp}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`📄 Detailed results saved to: ${resultsFile}`);

    if (options.dryRun) {
        console.log('');
        console.log('🔍 This was a dry run. To actually create users, run without --dry-run flag.');
    }

    console.log('');
    console.log('🎉 Script completed!');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Run the script
main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});

// Export for testing (if imported as module)
export { createAuthUser, updateUserProfile };
