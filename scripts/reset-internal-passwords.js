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

const NEW_PASSWORD = 'FactoryPulse@2025';

async function resetInternalPasswords() {
    console.log('🔐 Resetting Internal User Passwords...\n');

    try {
        // List all auth users
        const { data: users, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('❌ Error listing users:', error);
            return;
        }

        // Filter internal users
        const internalUsers = users.users.filter(user =>
            user.email.includes('@factorypulse.vn')
        );

        console.log(`📋 Found ${internalUsers.length} internal users to reset\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const user of internalUsers) {
            try {
                console.log(`🔄 Resetting password for: ${user.email}`);

                // Update user password
                const { data, error: updateError } = await supabase.auth.admin.updateUserById(
                    user.id,
                    {
                        password: NEW_PASSWORD
                    }
                );

                if (updateError) {
                    console.error(`❌ Error resetting password for ${user.email}:`, updateError.message);
                    errorCount++;
                } else {
                    console.log(`✅ Password reset successful for: ${user.email}`);
                    successCount++;
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`❌ Unexpected error for ${user.email}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Password Reset Summary:');
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`🔑 New Password: ${NEW_PASSWORD}`);

        if (successCount > 0) {
            console.log('\n🎉 Internal users can now authenticate with the new password!');
            console.log('💡 Run the test script again to verify: npm run test:auth');
        }

    } catch (error) {
        console.error('❌ Script error:', error);
    }
}

// Run the script
resetInternalPasswords();
