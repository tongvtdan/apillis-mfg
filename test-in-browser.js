// Test the organizations query directly in browser console
// Run this while logged into your app

console.log('🔍 Testing organizations query directly...');

// Test 1: Check authentication
const { data: { user }, error: authError } = await supabase.auth.getUser();
console.log('Auth status:', user ? 'Authenticated' : 'Not authenticated');
console.log('User ID:', user?.id);

// Test 2: Try the exact failing query
console.log('\n📋 Testing customer organizations query...');
const { data: customers, error: customersError } = await supabase
    .from('organizations')
    .select('id, organization_type, is_active, credit_limit')
    .eq('organization_type', 'customer');

if (customersError) {
    console.error('❌ Query failed:', customersError.message);
    console.error('Error code:', customersError.code);
    console.error('Error details:', customersError.details);
    console.error('Error hint:', customersError.hint);
} else {
    console.log('✅ Query successful!');
    console.log('Customers found:', customers?.length || 0);
    console.log('Sample customer:', customers?.[0]);
}

// Test 3: Try a simpler query
console.log('\n🔍 Testing simple organizations query...');
const { data: allOrgs, error: allOrgsError } = await supabase
    .from('organizations')
    .select('id, name, organization_type')
    .limit(5);

if (allOrgsError) {
    console.error('❌ Simple query failed:', allOrgsError.message);
} else {
    console.log('✅ Simple query successful!');
    console.log('Organizations found:', allOrgs?.length || 0);
    console.log('Sample org:', allOrgs?.[0]);
}

// Test 4: Check if we can access the table at all
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
