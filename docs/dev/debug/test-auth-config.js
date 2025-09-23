/**
 * Test Authentication Configuration
 *
 * This script tests the current Supabase client configuration and helps debug
 * authentication issues by checking if the environment variables are properly set.
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

// Test 1: Check environment variables
console.log('\n📋 Environment Variables:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || 'Not set');
console.log('SUPABASE_URL:', import.meta.env.SUPABASE_URL || 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (length: ' + import.meta.env.VITE_SUPABASE_ANON_KEY.length + ')' : 'Not set');
console.log('SUPABASE_ANON_KEY:', import.meta.env.SUPABASE_ANON_KEY ? 'Set (length: ' + import.meta.env.SUPABASE_ANON_KEY.length + ')' : 'Not set');

// Test 2: Check resolved configuration
console.log('\n🔗 Resolved Configuration:');
console.log('URL:', TEST_CONFIG.url);
console.log('Anon Key:', TEST_CONFIG.anonKey ? 'Set (starts with: ' + TEST_CONFIG.anonKey.substring(0, 20) + '...)' : 'Not set');
console.log('Service Role Key:', TEST_CONFIG.serviceRoleKey ? 'Set (starts with: ' + TEST_CONFIG.serviceRoleKey.substring(0, 20) + '...)' : 'Not set');

// Test 3: Create client and test connection
if (TEST_CONFIG.anonKey) {
    console.log('\n🧪 Testing Supabase Client...');

    try {
        const supabase = createClient(TEST_CONFIG.url, TEST_CONFIG.anonKey);

        // Test basic connection
        console.log('✅ Supabase client created successfully');

        // Test auth metadata
        console.log('🔐 Testing authentication endpoint...');
        console.log('Auth URL:', TEST_CONFIG.url + '/auth/v1/authorize');

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
            } else {
                console.log('❌ API endpoint returned error:', response.status);
            }
        })
        .catch(error => {
            console.log('❌ API Health Check failed:', error.message);
        });

    } catch (error) {
        console.log('❌ Failed to create Supabase client:', error.message);
    }
} else {
    console.log('\n❌ Cannot test client - API key not configured');
}

// Test 4: Check for common issues
console.log('\n🔍 Common Issues Check:');

if (!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.SUPABASE_URL) {
    console.log('❌ No Supabase URL configured');
    console.log('   → Set VITE_SUPABASE_URL environment variable');
}

if (!TEST_CONFIG.anonKey) {
    console.log('❌ No Supabase API key configured');
    console.log('   → Set VITE_SUPABASE_ANON_KEY environment variable');
    console.log('   → Get key from: https://supabase.com/dashboard → Settings → API');
}

if (TEST_CONFIG.url.includes('127.0.0.1') && typeof window !== 'undefined') {
    console.log('⚠️  Using localhost URL in browser');
    console.log('   → This should be your remote Supabase URL for production');
}

console.log('\n📝 Next Steps:');
console.log('1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment');
console.log('2. Get your API keys from Supabase Dashboard > Settings > API');
console.log('3. For Vercel: Set environment variables in Project Settings');
console.log('4. Redeploy your application');
console.log('5. Test authentication again');
