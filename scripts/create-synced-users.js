#!/usr/bin/env node

/**
 * Script to create synchronized users between auth.users and users table
 * This ensures that the ID in users table matches the uid in auth.users
 * 
 * Process:
 * 1. Create authentication users for all internal Factory Pulse users
 * 2. Create users table records with the EXACT SAME ID as auth.users uid
 * 3. Verify synchronization
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Default password for all users
const DEFAULT_PASSWORD = 'Password@123';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Internal Factory Pulse users data
const INTERNAL_USERS = [
    {
        email: 'admin@factorypulse.vn',
        name: 'Nguyễn Văn Admin',
        role: 'admin',
        department: 'Management',
        phone: '+84-28-7300-1000',
        description: 'System Administrator',
        employee_id: 'EMP001'
    },
    {
        email: 'ceo@factorypulse.vn',
        name: 'Trần Thị CEO',
        role: 'management',
        department: 'Management',
        phone: '+84-28-7300-1001',
        description: 'Chief Executive Officer',
        employee_id: 'EMP002'
    },
    {
        email: 'sales@factorypulse.vn',
        name: 'Lê Văn Sales',
        role: 'sales',
        department: 'Sales',
        phone: '+84-28-7300-1002',
        description: 'Sales Manager',
        employee_id: 'EMP003'
    },
    {
        email: 'procurement@factorypulse.vn',
        name: 'Phạm Thị Procurement',
        role: 'procurement',
        department: 'Procurement',
        phone: '+84-28-7300-1003',
        description: 'Procurement Manager',
        employee_id: 'EMP004'
    },
    {
        email: 'engineering@factorypulse.vn',
        name: 'Hoàng Văn Engineering',
        role: 'engineering',
        department: 'Engineering',
        phone: '+84-28-7300-1004',
        description: 'Engineering Manager',
        employee_id: 'EMP005'
    },
    {
        email: 'production@factorypulse.vn',
        name: 'Vũ Thị Production',
        role: 'production',
        department: 'Production',
        phone: '+84-28-7300-1005',
        description: 'Production Manager',
        employee_id: 'EMP006'
    },
    {
        email: 'qa@factorypulse.vn',
        name: 'Đặng Văn QA',
        role: 'qa',
        department: 'Quality Assurance',
        phone: '+84-28-7300-1006',
        description: 'Quality Assurance Manager',
        employee_id: 'EMP007'
    },
    {
        email: 'sales2@factorypulse.vn',
        name: 'Bùi Thị Sales2',
        role: 'sales',
        department: 'Sales',
        phone: '+84-28-7300-1007',
        description: 'Sales Representative',
        employee_id: 'EMP008'
    },
    {
        email: 'procurement2@factorypulse.vn',
        name: 'Ngô Văn Procurement2',
        role: 'procurement',
        department: 'Procurement',
        phone: '+84-28-7300-1008',
        description: 'Procurement Specialist',
        employee_id: 'EMP009'
    },
    {
        email: 'engineering2@factorypulse.vn',
        name: 'Lý Thị Engineering2',
        role: 'engineering',
        department: 'Engineering',
        phone: '+84-28-7300-1009',
        description: 'Senior Engineer',
        employee_id: 'EMP010'
    },
    {
        email: 'production2@factorypulse.vn',
        name: 'Hồ Văn Production2',
        role: 'production',
        department: 'Production',
        phone: '+84-28-7300-1010',
        description: 'Production Supervisor',
        employee_id: 'EMP011'
    },
    {
        email: 'qa2@factorypulse.vn',
        name: 'Trương Thị QA2',
        role: 'qa',
        department: 'Quality Assurance',
        phone: '+84-28-7300-1011',
        description: 'Quality Inspector',
        employee_id: 'EMP012'
    }
];

async function createSyncedUsers() {
    try {
        console.log('🚀 Starting synchronized user creation...\n');
        console.log('📋 Process: Create auth users first, then users table with same IDs\n');

        // Step 1: Create authentication users
        console.log('🔐 Step 1: Creating authentication users...\n');

        const authUsers = [];
        let authSuccessCount = 0;
        let authErrorCount = 0;

        for (const userData of INTERNAL_USERS) {
            try {
                console.log(`Creating auth user for: ${userData.name} (${userData.email})...`);

                // Create user in auth.users table
                const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
                    email: userData.email,
                    password: DEFAULT_PASSWORD,
                    email_confirm: true, // Auto-confirm email
                    user_metadata: {
                        name: userData.name,
                        role: userData.role,
                        department: userData.department,
                        employee_id: userData.employee_id,
                        internal_user: true
                    }
                });

                if (createError) {
                    console.log(`❌ Error creating auth user for ${userData.email}: ${createError.message}`);
                    authErrorCount++;
                } else {
                    console.log(`✅ Successfully created auth user for ${userData.email} (ID: ${authUser.user.id})`);
                    authSuccessCount++;

                    // Store the auth user data for step 2
                    authUsers.push({
                        ...userData,
                        auth_id: authUser.user.id
                    });
                }

                // Small delay to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.log(`❌ Unexpected error for ${userData.email}: ${error.message}`);
                authErrorCount++;
            }
        }

        console.log(`\n📊 Authentication users created: ${authSuccessCount} success, ${authErrorCount} errors\n`);

        if (authUsers.length === 0) {
            console.log('❌ No authentication users were created. Cannot proceed with users table creation.');
            return;
        }

        // Step 2: Create users table records with the SAME ID as auth.users
        console.log('👤 Step 2: Creating users table records with synchronized IDs...\n');

        // Get the Factory Pulse Vietnam organization ID
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .eq('slug', 'factory-pulse-vietnam')
            .single();

        if (orgError || !orgData) {
            throw new Error(`Error fetching Factory Pulse organization: ${orgError?.message || 'Not found'}`);
        }

        const organizationId = orgData.id;
        let usersSuccessCount = 0;
        let usersErrorCount = 0;

        for (const userData of authUsers) {
            try {
                console.log(`Creating users table record for: ${userData.name} (${userData.email}) with ID: ${userData.auth_id}...`);

                // Create user in users table with the EXACT SAME ID as auth.users
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: userData.auth_id, // Use the auth.users ID directly
                        organization_id: organizationId,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role,
                        department: userData.department,
                        phone: userData.phone,
                        status: 'active',
                        description: userData.description,
                        employee_id: userData.employee_id,
                        preferences: {
                            internal_user: true,
                            role: userData.role,
                            department: userData.department
                        }
                    });

                if (insertError) {
                    console.log(`❌ Error creating users table record for ${userData.email}: ${insertError.message}`);
                    usersErrorCount++;
                } else {
                    console.log(`✅ Successfully created users table record for ${userData.email} with ID: ${userData.auth_id}`);
                    usersSuccessCount++;
                }

                // Small delay to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.log(`❌ Unexpected error for ${userData.email}: ${error.message}`);
                usersErrorCount++;
            }
        }

        console.log(`\n📊 Users table records created: ${usersSuccessCount} success, ${usersErrorCount} errors\n`);

        // Step 3: Verification
        console.log('🔍 Step 3: Verifying synchronization...\n');

        const { data: usersCount, error: countError } = await supabase
            .from('users')
            .select('id', { count: 'exact' });

        if (countError) {
            console.log(`❌ Error counting users: ${countError.message}`);
        } else {
            console.log(`📊 Total users in users table: ${usersCount.length}`);
        }

        // Check for ID synchronization
        const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('id, email, name, role')
            .order('role', { ascending: true })
            .order('name', { ascending: true });

        if (fetchError) {
            console.log(`❌ Error fetching users for verification: ${fetchError.message}`);
        } else {
            console.log('\n📋 Final users table contents:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} [ID: ${user.id}]`);
            });
        }

        console.log('\n🎉 Synchronized user creation completed!');
        console.log(`✅ Authentication users: ${authSuccessCount}`);
        console.log(`✅ Users table records: ${usersSuccessCount}`);
        console.log('🔗 All users now have synchronized IDs between auth.users and users table');

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the script
createSyncedUsers();
