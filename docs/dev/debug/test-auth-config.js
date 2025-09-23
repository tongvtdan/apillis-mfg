/**
 * Test Authentication Configuration
 *
 * This script tests the current Supabase client configuration and helps debug
 * authentication issues by checking if the environment variables are properly set.
 *
 * To run this test:
 * 1. Open your deployed application in the browser
 * 2. Open browser console (F12)
 * 3. Copy and paste: import('./docs/dev/debug/test-auth-config.js').then(m => console.log('Test completed'))
 */

import { createClient } from '@supabase/supabase-js';

// Test configuration
const TEST_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || "https://ynhgxwnkpbpzwbtzrzka.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY,
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY
};

console.log('🔧 Testing Supabase Configuration...');
console.log('=====================================');
console.log('🔄 Running configuration verification...');

// Test 1: Check environment variables
console.log('\n📋 Environment Variables:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || 'Not set');
console.log('SUPABASE_URL:', import.meta.env.SUPABASE_URL || 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set (length: ' + import.meta.env.VITE_SUPABASE_ANON_KEY.length + ')' : '❌ Not set');
console.log('SUPABASE_ANON_KEY:', import.meta.env.SUPABASE_ANON_KEY ? '✅ Set (length: ' + import.meta.env.SUPABASE_ANON_KEY.length + ')' : '❌ Not set');
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✅ Set (length: ' + import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY.length + ')' : '❌ Not set');

// Test 2: Check resolved configuration
console.log('\n🔗 Resolved Configuration:');
console.log('URL:', TEST_CONFIG.url);
console.log('Anon Key:', TEST_CONFIG.anonKey ? '✅ Set (starts with: ' + TEST_CONFIG.anonKey.substring(0, 20) + '...)' : '❌ Not set');
console.log('Service Role Key:', TEST_CONFIG.serviceRoleKey ? '✅ Set (starts with: ' + TEST_CONFIG.serviceRoleKey.substring(0, 20) + '...)' : '❌ Not set');

// Test 3: Create client and test connection
if (TEST_CONFIG.anonKey) {
    console.log('\n🧪 Testing Supabase Client...');

    try {
        const supabase = createClient(TEST_CONFIG.url, TEST_CONFIG.anonKey);

        // Test basic connection
        console.log('✅ Supabase client created successfully');
        console.log('🔐 Testing authentication endpoint...');

        // Test health check
        fetch(TEST_CONFIG.url + '/rest/v1/', {
            method: 'GET',
            headers: {
                'apikey': TEST_CONFIG.anonKey,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('🌐 API Health Check:', response.status, response.statusText);
                if (response.ok) {
                    console.log('✅ API endpoint is accessible');
                    console.log('✅ Supabase configuration looks good!');
                } else {
                    console.log('❌ API endpoint returned error:', response.status);
                    console.log('   → Check if your API key is correct');
                }
            })
            .catch(error => {
                console.log('❌ API Health Check failed:', error.message);
                console.log('   → Check your Supabase URL and API key');
            });

    } catch (error) {
        console.log('❌ Failed to create Supabase client:', error.message);
    }
} else {
    console.log('\n❌ Cannot test client - API key not configured');
}

// Test 4: Check for common issues
console.log('\n🔍 Common Issues Check:');

let issuesFound = false;

if (!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.SUPABASE_URL) {
    console.log('❌ No Supabase URL configured');
    console.log('   → Set VITE_SUPABASE_URL = https://ynhgxwnkpbpzwbtzrzka.supabase.co');
    issuesFound = true;
}

if (!TEST_CONFIG.anonKey) {
    console.log('❌ No Supabase API key configured');
    console.log('   → Set VITE_SUPABASE_ANON_KEY with your actual anon key');
    console.log('   → Get key from: https://supabase.com/dashboard → Settings → API');
    issuesFound = true;
}

if (TEST_CONFIG.url.includes('127.0.0.1') && typeof window !== 'undefined') {
    console.log('⚠️  Using localhost URL in browser');
    console.log('   → This should be your remote Supabase URL for production');
    issuesFound = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (issuesFound) {
    console.log('❌ Configuration Issues Found!');
    console.log('🔧 Please fix the issues above and redeploy');
} else if (TEST_CONFIG.anonKey) {
    console.log('✅ Configuration looks good!');
    console.log('🎉 Authentication should work now');
} else {
    console.log('❌ Missing API key - cannot test further');
}
console.log('='.repeat(50));
