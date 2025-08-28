import { createClient } from '@supabase/supabase-js';

// Configuration - replace with your actual values
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || supabaseServiceKey === 'your-service-role-key') {
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseAuthIssue() {
    try {
        console.log('🔍 Diagnosing Authentication User Mapping Issue...\n');

        // Step 1: Check auth.users table
        console.log('📋 Step 1: Checking auth.users table...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('❌ Error fetching auth users:', authError);
            return;
        }

        console.log(`Found ${authUsers.users.length} auth users:`);
        authUsers.users.forEach(user => {
            console.log(`  - ID: ${user.id}, Email: ${user.email}, Created: ${user.created_at}`);
        });

        // Step 2: Check custom users table
        console.log('\n📋 Step 2: Checking custom users table...');
        const { data: customUsers, error: customError } = await supabase
            .from('users')
            .select('*')
            .order('email');

        if (customError) {
            console.error('❌ Error fetching custom users:', customError);
            return;
        }

        console.log(`Found ${customUsers.length} custom users:`);
        customUsers.forEach(user => {
            console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
        });

        // Step 3: Check for email mismatches
        console.log('\n📋 Step 3: Checking for email mismatches...');
        const authEmails = new Set(authUsers.users.map(u => u.email));
        const customEmails = new Set(customUsers.map(u => u.email));

        const missingInAuth = [...customEmails].filter(email => !authEmails.has(email));
        const missingInCustom = [...authEmails].filter(email => !customEmails.has(email));

        if (missingInAuth.length > 0) {
            console.log('❌ Emails missing in auth.users:');
            missingInAuth.forEach(email => console.log(`  - ${email}`));
        }

        if (missingInCustom.length > 0) {
            console.log('❌ Emails missing in custom users table:');
            missingInCustom.forEach(email => console.log(`  - ${email}`));
        }

        if (missingInAuth.length === 0 && missingInCustom.length === 0) {
            console.log('✅ All emails are present in both tables');
        }

        // Step 4: Check specific admin user
        console.log('\n📋 Step 4: Checking admin@factorypulse.vn specifically...');
        const adminAuthUser = authUsers.users.find(u => u.email === 'admin@factorypulse.vn');
        const adminCustomUser = customUsers.find(u => u.email === 'admin@factorypulse.vn');

        if (adminAuthUser) {
            console.log('✅ admin@factorypulse.vn found in auth.users:');
            console.log(`  - Auth ID: ${adminAuthUser.id}`);
            console.log(`  - Created: ${adminAuthUser.created_at}`);
        } else {
            console.log('❌ admin@factorypulse.vn NOT found in auth.users');
        }

        if (adminCustomUser) {
            console.log('✅ admin@factorypulse.vn found in custom users:');
            console.log(`  - Custom ID: ${adminCustomUser.id}`);
            console.log(`  - Role: ${adminCustomUser.role}`);
            console.log(`  - Name: ${adminCustomUser.name}`);
        } else {
            console.log('❌ admin@factorypulse.vn NOT found in custom users');
        }

        // Step 5: Generate solution
        console.log('\n📋 Step 5: Solution...');
        if (adminAuthUser && adminCustomUser) {
            console.log('✅ Both users exist - the issue is likely a UUID mismatch');
            console.log('🔧 To fix this, you need to:');
            console.log('   1. Run the migration: supabase/migrations/20250127000007_fix_auth_user_mapping.sql');
            console.log('   2. Or manually update the custom users table to link with auth users');
        } else if (!adminAuthUser) {
            console.log('❌ Auth user missing - create auth user first');
            console.log('🔧 Run: supabase db reset to recreate auth users');
        } else if (!adminCustomUser) {
            console.log('❌ Custom user missing - create custom user first');
            console.log('🔧 Run: supabase db reset to recreate custom users');
        }

        // Step 6: Show current login status
        console.log('\n📋 Step 6: Current login status...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            console.log('✅ User is currently logged in:');
            console.log(`  - Email: ${session.user.email}`);
            console.log(`  - Auth ID: ${session.user.id}`);
        } else {
            console.log('❌ No user currently logged in');
        }

    } catch (error) {
        console.error('❌ Error during diagnosis:', error);
    }
}

// Run the diagnosis
diagnoseAuthIssue().then(() => {
    console.log('\n🏁 Diagnosis complete');
    process.exit(0);
}).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
