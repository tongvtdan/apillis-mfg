import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function addUserProfiles() {
    try {
        console.log('🚀 Starting user profile creation...');

        // Read user data
        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../sample-data/03-users.json'), 'utf8'));

        console.log(`📋 Found ${usersData.length} users to process`);

        // First, clear existing data to avoid conflicts
        console.log('🧹 Cleaning existing data...');
        await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Delete auth users
        const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
        if (existingAuthUsers?.users?.length > 0) {
            for (const user of existingAuthUsers.users) {
                await supabase.auth.admin.deleteUser(user.id);
            }
        }

        // Ensure organization exists
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .eq('id', '550e8400-e29b-41d4-a716-446655440001')
            .single();

        if (orgError && orgError.code === 'PGRST116') {
            console.log('📦 Creating organization...');
            const { error: createOrgError } = await supabase
                .from('organizations')
                .insert({
                    id: '550e8400-e29b-41d4-a716-446655440001',
                    name: 'Factory Pulse Vietnam',
                    slug: 'factory-pulse-vn',
                    domain: 'factorypulse.vn',
                    description: 'Manufacturing Execution System for Factory Pulse Vietnam',
                    industry: 'Manufacturing',
                    subscription_plan: 'enterprise',
                    is_active: true
                });

            if (createOrgError) {
                console.error('❌ Error creating organization:', createOrgError);
                return;
            }
            console.log('✅ Organization created successfully');
        }

        // Create a mapping from old IDs to new IDs
        const idMapping = new Map();
        const createdUsers = [];

        // Phase 1: Create all auth users and collect ID mappings
        console.log('\n📝 Phase 1: Creating auth users...');
        for (const user of usersData) {
            try {
                console.log(`👤 Creating auth user: ${user.name} (${user.email})`);

                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    email: user.email,
                    password: 'TempPassword123!',
                    email_confirm: true,
                    user_metadata: {
                        name: user.name,
                        role: user.role
                    }
                });

                if (authError) {
                    console.error(`❌ Error creating auth user for ${user.email}:`, authError);
                    continue;
                }

                // Map old ID to new ID
                idMapping.set(user.id, authUser.user.id);
                createdUsers.push({ ...user, newId: authUser.user.id });
                console.log(`✅ Auth user created: ${user.name} -> ${authUser.user.id}`);

            } catch (error) {
                console.error(`❌ Unexpected error creating auth user for ${user.email}:`, error);
            }
        }

        // Phase 2: Create user profiles with correct manager references
        console.log('\n📝 Phase 2: Creating user profiles...');
        let successCount = 0;
        let errorCount = 0;

        for (const user of createdUsers) {
            try {
                console.log(`👤 Creating profile: ${user.name}`);

                // Map manager ID if it exists
                let mappedManagerId = null;
                if (user.direct_manager_id && idMapping.has(user.direct_manager_id)) {
                    mappedManagerId = idMapping.get(user.direct_manager_id);
                }

                // Map direct reports
                const mappedDirectReports = (user.direct_reports || [])
                    .map(reportId => idMapping.get(reportId))
                    .filter(Boolean);

                const userProfile = {
                    id: user.newId,
                    organization_id: user.organization_id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    department: user.department,
                    phone: user.phone,
                    avatar_url: user.avatar_url,
                    status: user.status,
                    description: user.description,
                    employee_id: user.employee_id,
                    direct_manager_id: mappedManagerId,
                    direct_reports: mappedDirectReports,
                    last_login_at: user.last_login_at,
                    preferences: user.preferences,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                };

                const { error: profileError } = await supabase
                    .from('users')
                    .insert(userProfile);

                if (profileError) {
                    console.error(`❌ Error creating user profile for ${user.email}:`, profileError);
                    errorCount++;
                } else {
                    console.log(`✅ User profile created for ${user.name}`);
                    successCount++;
                }

            } catch (error) {
                console.error(`❌ Unexpected error processing ${user.email}:`, error);
                errorCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Successfully created: ${successCount} users`);
        console.log(`❌ Errors: ${errorCount} users`);

        if (successCount > 0) {
            console.log('\n🔑 All users created with temporary password: TempPassword123!');
            console.log('📧 Users should reset their passwords on first login');

            console.log('\n🗂️  ID Mapping:');
            for (const [oldId, newId] of idMapping) {
                const user = usersData.find(u => u.id === oldId);
                console.log(`${user?.name}: ${oldId} -> ${newId}`);
            }
        }

    } catch (error) {
        console.error('❌ Script error:', error);
    }
}

// Run the script
addUserProfiles();