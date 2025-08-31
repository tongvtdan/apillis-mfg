import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:');
    console.error('- VITE_SUPABASE_URL');
    console.error('- VITE_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAuthUsers() {
    try {
        // Load users data
        const usersDataPath = path.join(__dirname, '../sample-data/03-users.json');
        const usersData = JSON.parse(fs.readFileSync(usersDataPath, 'utf8'));

        console.log(`Creating auth accounts for ${usersData.length} users...`);

        for (const user of usersData) {
            try {
                // Use default password for all users
                const defaultPassword = 'FactoryPulse@2025';

                console.log(`Creating auth user for: ${user.name} (${user.email})`);

                // Create auth user with specific ID
                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    id: user.id, // Use the same ID from users.json
                    email: user.email,
                    password: defaultPassword,
                    email_confirm: true, // Auto-confirm email
                    user_metadata: {
                        name: user.name,
                        display_name: user.name,
                        full_name: user.name,
                        employee_id: user.employee_id,
                        department: user.department,
                        role: user.role,
                        phone: user.phone,
                        avatar_url: user.avatar_url
                    }
                });

                if (authError) {
                    console.error(`Error creating auth user for ${user.email}:`, authError.message);
                    continue;
                }

                console.log(`✓ Created auth user: ${user.name} (${user.email})`);
                console.log(`  - ID: ${authUser.user.id}`);
                console.log(`  - Password: ${defaultPassword}`);

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`Error processing user ${user.email}:`, error.message);
            }
        }

        console.log('\n✅ Auth users creation completed!');
        console.log('\n📝 Important Notes:');
        console.log('- All users have been created with default password: FactoryPulse@2025');
        console.log('- Display names have been set from the user data');
        console.log('- User metadata includes employee_id, department, role, etc.');

    } catch (error) {
        console.error('Error in createAuthUsers:', error);
        process.exit(1);
    }
}

// Run the script
createAuthUsers();