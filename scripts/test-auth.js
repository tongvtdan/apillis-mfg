import { createClient } from '@supabase/supabase-js';

// Test authentication with admin user
async function testAdminAuth() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        console.log('Testing admin authentication...');
        console.log('Email: admin@factorypulse.vn');
        console.log('Password: FactoryPulse@2025');

        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@factorypulse.vn',
            password: 'FactoryPulse@2025'
        });

        if (error) {
            console.error('❌ Authentication failed:', error.message);
            return false;
        }

        console.log('✅ Authentication successful!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        console.log('Session:', data.session ? 'Active' : 'None');
        return true;

    } catch (error) {
        console.error('❌ Authentication error:', error);
        return false;
    }
}

// Test authentication with another user
async function testOtherUserAuth() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        console.log('\nTesting other user authentication...');
        console.log('Email: ceo@factorypulse.vn');
        console.log('Password: FactoryPulse@2025');

        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'ceo@factorypulse.vn',
            password: 'FactoryPulse@2025'
        });

        if (error) {
            console.error('❌ Authentication failed:', error.message);
            return false;
        }

        console.log('✅ Authentication successful!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        console.log('Session:', data.session ? 'Active' : 'None');
        return true;

    } catch (error) {
        console.error('❌ Authentication error:', error);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Testing Authentication System\n');

    const adminResult = await testAdminAuth();
    const otherResult = await testOtherUserAuth();

    console.log('\n📊 Test Results:');
    console.log(`Admin User: ${adminResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Other User: ${otherResult ? '✅ PASS' : '❌ FAIL'}`);

    if (adminResult && otherResult) {
        console.log('\n🎉 All authentication tests passed!');
    } else {
        console.log('\n⚠️  Some authentication tests failed.');
    }
}

runTests();
