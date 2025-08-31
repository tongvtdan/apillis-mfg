import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkAuthUsers() {
    console.log('🔍 Checking Auth Users in Supabase...\n');

    try {
        // List all auth users
        const { data: users, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('❌ Error listing users:', error);
            return;
        }

        console.log(`📊 Total Auth Users: ${users.users.length}\n`);

        // Separate internal and contact users
        const internalUsers = users.users.filter(user =>
            user.email.includes('@factorypulse.vn')
        );
        const contactUsers = users.users.filter(user =>
            !user.email.includes('@factorypulse.vn')
        );

        console.log('👥 Internal Factory Pulse Users:');
        console.log('='.repeat(60));
        internalUsers.forEach(user => {
            console.log(`📧 Email: ${user.email}`);
            console.log(`🆔 ID: ${user.id}`);
            console.log(`📅 Created: ${user.created_at}`);
            console.log(`✅ Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
            console.log(`🔒 Last Sign In: ${user.last_sign_in_at || 'Never'}`);
            console.log(`📋 Metadata:`, user.user_metadata);
            console.log('-'.repeat(60));
        });

        console.log('\n👥 Contact Users (Customers & Suppliers):');
        console.log('='.repeat(60));
        contactUsers.forEach(user => {
            console.log(`📧 Email: ${user.email}`);
            console.log(`🆔 ID: ${user.id}`);
            console.log(`📅 Created: ${user.created_at}`);
            console.log(`✅ Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
            console.log(`🔒 Last Sign In: ${user.last_sign_in_at || 'Never'}`);
            console.log(`📋 Metadata:`, user.user_metadata);
            console.log('-'.repeat(60));
        });

        // Summary
        console.log('\n📈 Summary:');
        console.log(`Internal Users: ${internalUsers.length}`);
        console.log(`Contact Users: ${contactUsers.length}`);
        console.log(`Total Users: ${users.users.length}`);

        // Check for users without email confirmation
        const unconfirmedUsers = users.users.filter(user => !user.email_confirmed_at);
        if (unconfirmedUsers.length > 0) {
            console.log(`\n⚠️  Users without email confirmation: ${unconfirmedUsers.length}`);
            unconfirmedUsers.forEach(user => {
                console.log(`   - ${user.email}`);
            });
        }

        // Check for users that never signed in
        const neverSignedIn = users.users.filter(user => !user.last_sign_in_at);
        if (neverSignedIn.length > 0) {
            console.log(`\n🔒 Users that never signed in: ${neverSignedIn.length}`);
            neverSignedIn.forEach(user => {
                console.log(`   - ${user.email}`);
            });
        }

    } catch (error) {
        console.error('❌ Script error:', error);
    }
}

// Run the script
checkAuthUsers();
