import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:');
    console.error('- VITE_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetAllUserPasswords() {
    try {
        const defaultPassword = 'FactoryPulse@2025';

        console.log('🔐 Resetting passwords for all users...');
        console.log(`Default password: ${defaultPassword}\n`);

        // Get all users from auth.users
        const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();

        if (fetchError) {
            console.error('Error fetching users:', fetchError.message);
            process.exit(1);
        }

        console.log(`Found ${users.users.length} users to process...\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const user of users.users) {
            try {
                console.log(`Processing: ${user.email} (${user.id})`);

                // Update user password
                const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
                    password: defaultPassword
                });

                if (error) {
                    console.error(`❌ Failed to reset password for ${user.email}:`, error.message);
                    errorCount++;
                } else {
                    console.log(`✅ Successfully reset password for ${user.email}`);
                    successCount++;
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`❌ Error processing ${user.email}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Password Reset Summary:');
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        console.log(`📝 Total: ${users.users.length}`);

        console.log('\n🔑 All users now have the default password: FactoryPulse@2025');
        console.log('\n📋 Demo Accounts:');
        console.log('- admin@factorypulse.vn (System Administrator)');
        console.log('- ceo@factorypulse.vn (Chief Executive Officer)');
        console.log('- operations@factorypulse.vn (Operations Manager)');
        console.log('- senior.engineer@factorypulse.vn (Senior Engineer)');
        console.log('- quality@factorypulse.vn (Quality Manager)');
        console.log('- sales.manager@factorypulse.vn (Sales Manager)');
        console.log('- procurement@factorypulse.vn (Procurement Manager)');
        console.log('- customer.service@factorypulse.vn (Customer Service)');

    } catch (error) {
        console.error('Error in resetAllUserPasswords:', error);
        process.exit(1);
    }
}

// Run the script
resetAllUserPasswords();
