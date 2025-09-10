// Browser Console Verification Script
// Copy and paste this into your browser's developer console while logged into the app

// Test 1: Check organizations query directly
async function testOrganizationsQuery() {
    console.log('🔍 Testing organizations query...');

    try {
        const { data: customers, error: customersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active, credit_limit')
            .eq('organization_type', 'customer');

        if (customersError) {
            console.error('❌ Customer query failed:', customersError);
            return false;
        }

        console.log('✅ Customer query successful:', customers?.length || 0, 'customers found');
        if (customers && customers.length > 0) {
            console.log('📋 Sample customer:', customers[0]);
        }

        const { data: suppliers, error: suppliersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .eq('organization_type', 'supplier');

        if (suppliersError) {
            console.error('❌ Supplier query failed:', suppliersError);
            return false;
        }

        console.log('✅ Supplier query successful:', suppliers?.length || 0, 'suppliers found');
        if (suppliers && suppliers.length > 0) {
            console.log('🏭 Sample supplier:', suppliers[0]);
        }

        return true;
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return false;
    }
}

// Test 2: Check dashboard metrics
async function testDashboardMetrics() {
    console.log('📊 Testing dashboard metrics...');

    try {
        // This mimics what the dashboard service does
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id')
            .limit(1000);

        if (projectsError) {
            console.error('❌ Projects query failed:', projectsError);
            return false;
        }

        const totalProjects = projects?.length || 0;
        console.log('✅ Projects query successful:', totalProjects, 'projects found');

        const { data: customers, error: customersError } = await supabase
            .from('organizations')
            .select('id, is_active')
            .eq('organization_type', 'customer');

        if (customersError) {
            console.error('❌ Customers metrics failed:', customersError);
            return false;
        }

        const totalCustomers = customers?.length || 0;
        const activeCustomers = customers?.filter(c => c.is_active === true).length || 0;

        const { data: suppliers, error: suppliersError } = await supabase
            .from('organizations')
            .select('id, is_active')
            .eq('organization_type', 'supplier');

        if (suppliersError) {
            console.error('❌ Suppliers metrics failed:', suppliersError);
            return false;
        }

        const totalSuppliers = suppliers?.length || 0;
        const activeSuppliers = suppliers?.filter(s => s.is_active === true).length || 0;

        console.log('✅ Metrics calculation successful:');
        console.log('   📊 Total Projects:', totalProjects);
        console.log('   👥 Total Customers:', totalCustomers, '(Active:', activeCustomers + ')');
        console.log('   🏭 Total Suppliers:', totalSuppliers, '(Active:', activeSuppliers + ')');

        return { totalProjects, totalCustomers, activeCustomers, totalSuppliers, activeSuppliers };
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return false;
    }
}

// Run both tests
async function runVerification() {
    console.log('🚀 Starting verification of RLS policy fix...\n');

    const queryTest = await testOrganizationsQuery();
    console.log('\n' + '='.repeat(50) + '\n');

    const metricsTest = await testDashboardMetrics();

    console.log('\n' + '='.repeat(50));
    if (queryTest && metricsTest) {
        console.log('🎉 SUCCESS: All tests passed! The RLS policy fix is working.');
        console.log('📈 Expected dashboard metrics:', JSON.stringify(metricsTest, null, 2));
    } else {
        console.log('❌ FAILURE: Some tests failed. The RLS policy may not be fixed yet.');
    }
}

// Auto-run when pasted into console
runVerification().catch(console.error);

// Instructions:
// 1. Make sure you're logged into the app in your browser
// 2. Open browser developer console (F12)
// 3. Copy and paste this entire script
// 4. Press Enter to run
// 5. Check the results in the console
