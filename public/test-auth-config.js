/**
 * Test Authentication Configuration
 *
 * This script tests the current Supabase client configuration and helps debug
 * authentication issues by checking if the environment variables are properly set.
 *
 * To run this test:
 * 1. Open your deployed application in the browser
 * 2. Open browser console (F12)
 * 3. Copy and paste: fetch('/test-auth-config.js').then(r => r.text()).then(eval)
 */

// Simple environment variable check - works in browser context
const checkEnvVar = (key) => {
    try {
        return window[key] || null;
    } catch (e) {
        return null;
    }
};

const TEST_CONFIG = {
    url: checkEnvVar('VITE_SUPABASE_URL') || "https://ynhgxwnkpbpzwbtzrzka.supabase.co",
    anonKey: checkEnvVar('VITE_SUPABASE_ANON_KEY'),
    serviceRoleKey: checkEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY')
};

console.log('🔧 Testing Supabase Configuration...');
console.log('=====================================');
console.log('🔄 Running configuration verification...');

// Test 1: Check environment variables
console.log('\n📋 Environment Variables:');
console.log('VITE_SUPABASE_URL:', checkEnvVar('VITE_SUPABASE_URL') || '❌ Not set');
console.log('VITE_SUPABASE_ANON_KEY:', checkEnvVar('VITE_SUPABASE_ANON_KEY') ? '✅ Set (length: ' + checkEnvVar('VITE_SUPABASE_ANON_KEY').length + ')' : '❌ Not set');
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', checkEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY') ? '✅ Set (length: ' + checkEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY').length + ')' : '❌ Not set');

// Test 2: Check resolved configuration
console.log('\n🔗 Resolved Configuration:');
console.log('URL:', TEST_CONFIG.url);
console.log('Anon Key:', TEST_CONFIG.anonKey ? '✅ Set (starts with: ' + TEST_CONFIG.anonKey.substring(0, 20) + '...)' : '❌ Not set');
console.log('Service Role Key:', TEST_CONFIG.serviceRoleKey ? '✅ Set (starts with: ' + TEST_CONFIG.serviceRoleKey.substring(0, 20) + '...)' : '❌ Not set');

// Test 3: Check for common issues
console.log('\n🔍 Common Issues Check:');

let issuesFound = false;

if (!checkEnvVar('VITE_SUPABASE_URL')) {
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

console.log('\n🧪 Simple API Test:');
if (TEST_CONFIG.anonKey) {
    console.log('✅ API key is configured');
    console.log('✅ Ready for authentication test');
} else {
    console.log('❌ API key not found - cannot authenticate');
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
    console.log('💡 Try signing in with admin@apillis.com');
} else {
    console.log('❌ Missing API key - cannot test further');
}
console.log('='.repeat(50));

console.log('\n📝 Next Steps:');
if (!checkEnvVar('VITE_SUPABASE_URL')) {
    console.log('1. Set VITE_SUPABASE_URL = https://ynhgxwnkpbpzwbtzrzka.supabase.co');
}
if (!TEST_CONFIG.anonKey) {
    console.log('2. Set VITE_SUPABASE_ANON_KEY with your actual anon key');
    console.log('   Get it from: https://supabase.com/dashboard → Settings → API');
}
if (!checkEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY')) {
    console.log('3. Set VITE_SUPABASE_SERVICE_ROLE_KEY (optional, for elevated permissions)');
}
console.log('4. Go to Vercel Dashboard → Project Settings → Environment Variables');
console.log('5. Add the variables above');
console.log('6. Redeploy your application');
console.log('7. Run this test again');
console.log('8. Try signing in with admin@apillis.com');
