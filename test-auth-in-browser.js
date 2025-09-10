// Test authentication in browser console
// Run this while logged into your app

console.log('🔍 Testing authentication context...');

// Test 1: Check Supabase auth
const { data: { user }, error: authError } = await supabase.auth.getUser();
console.log('Supabase auth user:', user ? 'Authenticated' : 'Not authenticated');
console.log('User ID:', user?.id);

// Test 2: Check session
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
console.log('Session exists:', !!session);
console.log('Session user ID:', session?.user?.id);

// Test 3: Test a simple query that should work
console.log('\n📋 Testing simple projects query...');
const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title')
    .limit(3);

if (projectsError) {
    console.error('❌ Projects query failed:', projectsError.message);
} else {
    console.log('✅ Projects query successful:', projects?.length || 0, 'projects');
}

// Test 4: Test organizations query with different approach
console.log('\n🏢 Testing organizations query...');
const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('id, name, organization_type')
    .limit(5);

if (orgsError) {
    console.error('❌ Organizations query failed:', orgsError.message);
    console.error('Error code:', orgsError.code);
    console.error('Error details:', orgsError.details);
} else {
    console.log('✅ Organizations query successful:', orgs?.length || 0, 'organizations');
    console.log('Sample org:', orgs?.[0]);
}

// Test 5: Check if we can access the table at all
console.log('\n🔍 Testing table access...');
const { data: count, error: countError } = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true });

if (countError) {
    console.error('❌ Count query failed:', countError.message);
} else {
    console.log('✅ Count query successful!');
    console.log('Total organizations:', count);
}
