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

async function resetAdminPassword() {
    try {
        const adminEmail = 'admin@factorypulse.vn';
        const adminId = 'a3b8e7b3-f0d9-4edd-abd4-ec78f3816d11';
        const defaultPassword = 'FactoryPulse@2025';

        console.log(`Resetting password for admin user: ${adminEmail}`);
        console.log(`Admin ID: ${adminId}`);
        console.log(`New password: ${defaultPassword}`);

        // Update the admin user's password
        const { data, error } = await supabase.auth.admin.updateUserById(adminId, {
            password: defaultPassword
        });

        if (error) {
            console.error('Error resetting admin password:', error.message);
            process.exit(1);
        }

        console.log('✅ Admin password reset successfully!');
        console.log(`User: ${data.user.email}`);
        console.log(`Password: ${defaultPassword}`);
        console.log('\nYou can now sign in with:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${defaultPassword}`);

    } catch (error) {
        console.error('Error in resetAdminPassword:', error);
        process.exit(1);
    }
}

// Run the script
resetAdminPassword();
