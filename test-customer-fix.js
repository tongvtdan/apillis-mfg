// Browser Console Test - Run this after applying the SQL fix
// Copy and paste this into your browser's developer console while logged in

async function testCustomerCountFix() {
    console.log('🔍 Testing customer count fix...\n');

    try {
        // Test 1: Check if we can query organizations
        console.log('1️⃣ Testing organizations query...');
        const { data: allOrgs, error: allError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .limit(10);

        if (allError) {
            console.error('❌ Organizations query failed:', allError.message);
            return false;
        }

        console.log('✅ Organizations query successful!');
        console.log('   Total organizations found:', allOrgs?.length || 0);
        console.log('   Sample data:', allOrgs?.[0]);

        // Test 2: Check customer count specifically
        console.log('\n2️⃣ Testing customer count...');
        const { data: customers, error: customersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .eq('organization_type', 'customer');

        if (customersError) {
            console.error('❌ Customer query failed:', customersError.message);
            return false;
        }

        console.log('✅ Customer query successful!');
        console.log('   Customers found:', customers?.length || 0);
        if (customers && customers.length > 0) {
            console.log('   Customer names:', customers.map(c => c.name));
        }

        // Test 3: Check supplier count
        console.log('\n3️⃣ Testing supplier count...');
        const { data: suppliers, error: suppliersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .eq('organization_type', 'supplier');

        if (suppliersError) {
            console.error('❌ Supplier query failed:', suppliersError.message);
            return false;
        }

        console.log('✅ Supplier query successful!');
        console.log('   Suppliers found:', suppliers?.length || 0);

        // Summary
        console.log('\n📊 SUMMARY:');
        console.log('============');
        console.log('✅ Total Organizations:', allOrgs?.length || 0);
        console.log('✅ Customers:', customers?.length || 0);
        console.log('✅ Suppliers:', suppliers?.length || 0);

        if (customers && customers.length >= 3) {
            console.log('\n🎉 SUCCESS: Customer count fix is working!');
            console.log('   Expected: 3 customers');
            console.log('   Actual:', customers.length, 'customers');
        } else {
            console.log('\n❌ ISSUE: Customer count is still wrong');
            console.log('   Expected: 3 customers');
            console.log('   Actual:', customers?.length || 0, 'customers');
        }

        return true;

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return false;
    }
}

// Run the test
testCustomerCountFix().catch(console.error);
