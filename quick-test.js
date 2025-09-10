// Quick test to verify the fix worked
// Run this in browser console after applying the SQL fix

console.log('🔍 Testing if RLS fix worked...');

// Test the exact query that was failing
const { data, error } = await supabase
    .from('organizations')
    .select('id, organization_type, is_active, credit_limit')
    .eq('organization_type', 'customer');

if (error) {
    console.error('❌ Still failing:', error.message);
    console.log('💡 You need to apply the SQL fix first!');
} else {
    console.log('✅ SUCCESS! Query now works');
    console.log('📊 Customers found:', data?.length || 0);
    console.log('🎉 Dashboard should now show correct customer count!');

    if (data && data.length >= 3) {
        console.log('🎯 Perfect! Customer count is now:', data.length);
    }
}
