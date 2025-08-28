import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables or replace with actual values
const supabaseUrl = 'https://ynhgxwnkpbpzwbtzrzka.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Replace with actual key

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUsersTable() {
    try {
        console.log('Testing users table structure...\n');

        // Test 1: Check if users table exists and has data
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(5);

        if (usersError) {
            console.error('Error fetching users:', usersError);
            return;
        }

        console.log(`Found ${users.length} users in the table:`);
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
        });

        // Test 2: Check specific CEO user
        const { data: ceoUser, error: ceoError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'ceo@factorypulse.vn')
            .maybeSingle();

        if (ceoError) {
            console.error('Error fetching CEO user:', ceoError);
            return;
        }

        console.log('\nCEO user details:');
        if (ceoUser) {
            console.log(JSON.stringify(ceoUser, null, 2));
        } else {
            console.log('CEO user not found!');
        }

        // Test 3: Check auth.users table
        console.log('\nChecking auth.users table...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('Error fetching auth users:', authError);
            return;
        }

        console.log(`Found ${authUsers.users.length} auth users:`);
        authUsers.users.forEach(user => {
            console.log(`- ID: ${user.id}, Email: ${user.email}`);
        });

        // Test 4: Check if there's a mismatch
        const ceoAuthUser = authUsers.users.find(u => u.email === 'ceo@factorypulse.vn');
        if (ceoAuthUser && ceoUser) {
            console.log('\nComparing IDs:');
            console.log(`Auth user ID: ${ceoAuthUser.id}`);
            console.log(`Users table ID: ${ceoUser.id}`);
            console.log(`Match: ${ceoAuthUser.id === ceoUser.id ? 'YES' : 'NO'}`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testUsersTable();
