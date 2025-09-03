// Debug script to check user data
import { supabase } from './src/integrations/supabase/client';

async function debugUser(userId: string) {
    console.log(`🔍 Debugging user ID: ${userId}`);

    // Check if user exists in users table
    console.log('\n1. Checking users table...');
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, role, department, email')
        .eq('id', userId)
        .maybeSingle();

    if (userError) {
        console.error('❌ Error fetching user:', userError);
    } else if (user) {
        console.log('✅ User found in users table:', user);
    } else {
        console.log('❌ User not found in users table');
    }

    // Check if user exists in contacts table
    console.log('\n2. Checking contacts table...');
    const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('id, contact_name, company_name, type, email')
        .eq('id', userId)
        .maybeSingle();

    if (contactError) {
        console.error('❌ Error fetching contact:', contactError);
    } else if (contact) {
        console.log('✅ Contact found in contacts table:', contact);
    } else {
        console.log('❌ Contact not found in contacts table');
    }

    // Check if user exists in auth.users table
    console.log('\n3. Checking auth.users table...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError) {
        console.error('❌ Error fetching auth user:', authError);
    } else if (authUser) {
        console.log('✅ User found in auth.users table:', {
            id: authUser.user.id,
            email: authUser.user.email,
            user_metadata: authUser.user.user_metadata
        });
    } else {
        console.log('❌ User not found in auth.users table');
    }

    // Check projects that reference this user
    console.log('\n4. Checking projects that reference this user...');
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, project_id, title, created_by, assigned_to')
        .or(`created_by.eq.${userId},assigned_to.eq.${userId}`);

    if (projectsError) {
        console.error('❌ Error fetching projects:', projectsError);
    } else if (projects && projects.length > 0) {
        console.log('✅ Projects found that reference this user:', projects);
    } else {
        console.log('❌ No projects found that reference this user');
    }
}

// Run the debug function
debugUser('273fe034-4064-42e3-8c3b-47a93295f593');
