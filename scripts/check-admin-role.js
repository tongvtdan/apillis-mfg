#!/usr/bin/env node

/**
 * Diagnostic script to check admin role status
 * This script helps diagnose why the Admin tab is not showing
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    console.error('\nPlease check your .env.local file');
    process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminRole() {
    console.log('🔍 Checking Admin Role Status...\n');

    try {
        // Check auth.users table
        console.log('📋 Checking auth.users table...');
        const { data: authUsers, error: authError } = await supabase
            .from('auth.users')
            .select('id, email, created_at, raw_user_meta_data')
            .eq('email', 'admin@factorypulse.vn');

        if (authError) {
            console.error('❌ Error querying auth.users:', authError.message);
        } else if (!authUsers || authUsers.length === 0) {
            console.log('❌ No admin user found in auth.users table');
        } else {
            console.log('✅ Admin user found in auth.users:');
            authUsers.forEach(user => {
                console.log(`   ID: ${user.id}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Created: ${user.created_at}`);
                console.log(`   Metadata: ${JSON.stringify(user.raw_user_meta_data)}`);
            });
        }

        console.log('\n📋 Checking custom users table...');
        const { data: customUsers, error: customError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'admin@factorypulse.vn');

        if (customError) {
            console.error('❌ Error querying users table:', customError.message);
        } else if (!customUsers || customUsers.length === 0) {
            console.log('❌ No admin user found in custom users table');
        } else {
            console.log('✅ Admin user found in custom users:');
            customUsers.forEach(user => {
                console.log(`   ID: ${user.id}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Status: ${user.status}`);
                console.log(`   User ID: ${user.user_id || 'NULL'}`);
                console.log(`   Organization ID: ${user.organization_id}`);
            });
        }

        // Check if there are any users with admin role
        console.log('\n🔍 Checking for any users with admin role...');
        const { data: adminUsers, error: adminError } = await supabase
            .from('users')
            .select('email, name, role, status')
            .eq('role', 'admin');

        if (adminError) {
            console.error('❌ Error querying for admin users:', adminError.message);
        } else if (!adminUsers || adminUsers.length === 0) {
            console.log('❌ No users found with admin role');
        } else {
            console.log(`✅ Found ${adminUsers.length} user(s) with admin role:`);
            adminUsers.forEach(user => {
                console.log(`   ${user.email} (${user.name}) - Status: ${user.status}`);
            });
        }

        // Check if there are any users with management role
        console.log('\n🔍 Checking for any users with management role...');
        const { data: managementUsers, error: managementError } = await supabase
            .from('users')
            .select('email, name, role, status')
            .eq('role', 'management');

        if (managementError) {
            console.error('❌ Error querying for management users:', managementError.message);
        } else if (!managementUsers || managementUsers.length === 0) {
            console.log('❌ No users found with management role');
        } else {
            console.log(`✅ Found ${managementUsers.length} user(s) with management role:`);
            managementUsers.forEach(user => {
                console.log(`   ${user.email} (${user.name}) - Status: ${user.status}`);
            });
        }

        console.log('\n📊 Summary:');
        console.log('   - The Admin tab should show for users with role "management" OR "admin"');
        console.log('   - Check the console logs in your browser for "🔍 AppSidebar Debug" messages');
        console.log('   - Make sure your user has the correct role in the database');
        console.log('   - If the role is wrong, you may need to run the fix-admin-role-issue.sql script');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// Run the diagnostic
checkAdminRole().catch(console.error);
