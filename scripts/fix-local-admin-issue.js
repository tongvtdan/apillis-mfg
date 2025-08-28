import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fixLocalAdminIssue() {
    try {
        console.log('🔧 Fixing Local Admin Role Issue...\n');

        // Step 1: Check current state
        console.log('📋 Step 1: Checking current state...');
        
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('email');

        if (usersError) {
            console.error('❌ Error fetching users:', usersError);
            return;
        }

        console.log(`Found ${users.length} users in custom table`);
        
        const adminUser = users.find(u => u.email === 'admin@factorypulse.vn');
        if (adminUser) {
            console.log(`✅ Admin user found: ${adminUser.name} (${adminUser.role})`);
        } else {
            console.log('❌ Admin user not found in custom users table');
        }

        // Step 2: Check auth users
        console.log('\n📋 Step 2: Checking auth users...');
        
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('❌ Error fetching auth users:', authError);
            return;
        }

        console.log(`Found ${authUsers.users.length} auth users`);
        
        const adminAuthUser = authUsers.users.find(u => u.email === 'admin@factorypulse.vn');
        if (adminAuthUser) {
            console.log(`✅ Admin auth user found: ${adminAuthUser.email} (${adminAuthUser.id})`);
        } else {
            console.log('❌ Admin auth user not found - creating...');
            
            // Create auth user for admin
            const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
                email: 'admin@factorypulse.vn',
                password: 'Password123!',
                email_confirm: true,
                user_metadata: {
                    name: 'Lê Văn Sơn'
                }
            });

            if (createError) {
                console.error('❌ Error creating auth user:', createError);
                return;
            } else {
                console.log('✅ Auth user created successfully');
            }
        }

        // Step 3: Add user_id column if it doesn't exist
        console.log('\n📋 Step 3: Adding user_id column...');
        
        const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id UUID;'
        });

        if (alterError) {
            console.log('Note: Could not add user_id column via RPC, trying direct SQL...');
            // We'll handle this in the next step
        } else {
            console.log('✅ user_id column added/verified');
        }

        // Step 4: Link users with auth users
        console.log('\n📋 Step 4: Linking users with auth users...');
        
        // Get fresh auth users list
        const { data: freshAuthUsers } = await supabase.auth.admin.listUsers();
        
        for (const user of users) {
            const matchingAuthUser = freshAuthUsers.users.find(au => au.email === user.email);
            
            if (matchingAuthUser) {
                // Try to update the user_id field
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ user_id: matchingAuthUser.id })
                    .eq('email', user.email);

                if (updateError) {
                    console.log(`⚠️  Could not update user_id for ${user.email}:`, updateError.message);
                } else {
                    console.log(`✅ Linked ${user.email} with auth user`);
                }
            } else {
                console.log(`⚠️  No auth user found for ${user.email}`);
            }
        }

        // Step 5: Verify the fix
        console.log('\n📋 Step 5: Verifying the fix...');
        
        const { data: updatedUsers, error: verifyError } = await supabase
            .from('users')
            .select('email, name, role, user_id')
            .eq('email', 'admin@factorypulse.vn');

        if (verifyError) {
            console.error('❌ Error verifying fix:', verifyError);
            return;
        }

        if (updatedUsers && updatedUsers.length > 0) {
            const admin = updatedUsers[0];
            console.log('\n🎉 Admin User Status:');
            console.log(`   Email: ${admin.email}`);
            console.log(`   Name: ${admin.name}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   Auth Link: ${admin.user_id ? '✅ LINKED' : '❌ NOT LINKED'}`);
            
            if (admin.role === 'admin') {
                console.log('\n✅ SUCCESS: Admin user has correct role!');
                console.log('\n📝 Next steps:');
                console.log('   1. Sign out of the application');
                console.log('   2. Sign back in with admin@factorypulse.vn / Password123!');
                console.log('   3. Verify the role displays correctly');
            } else {
                console.log('\n⚠️  Admin user role is not "admin", it is:', admin.role);
            }
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
}

// Create a simple SQL execution function
async function executeSQL(sql) {
    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql });
        if (error) throw error;
        return data;
    } catch (error) {
        console.log('Note: RPC method not available, using direct query...');
        return null;
    }
}

// Run the fix
fixLocalAdminIssue().then(() => {
    console.log('\n🏁 Fix script completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
