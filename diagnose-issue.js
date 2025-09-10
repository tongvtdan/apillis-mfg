// Diagnostic script to check RLS policies and test queries
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnoseIssue() {
    console.log('🔍 Running comprehensive diagnostics...\n');

    try {
        // Step 1: Test authentication
        console.log('1️⃣ Testing authentication...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('❌ Auth error:', authError.message);
            return;
        }

        if (!user) {
            console.error('❌ No authenticated user found');
            return;
        }

        console.log('✅ User authenticated:', user.email);
        console.log('   User ID:', user.id);

        // Step 2: Test basic organizations query (no filters)
        console.log('\n2️⃣ Testing basic organizations query...');
        const { data: allOrgs, error: allOrgsError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .limit(5);

        if (allOrgsError) {
            console.error('❌ Basic query failed:', allOrgsError.message);
            console.error('   Error code:', allOrgsError.code);
            console.error('   Error hint:', allOrgsError.hint);
        } else {
            console.log('✅ Basic query successful! Found organizations:', allOrgs?.length || 0);
            console.log('   Sample:', allOrgs?.[0]);
        }

        // Step 3: Test customers query (the failing one)
        console.log('\n3️⃣ Testing customers query (the problematic one)...');
        const { data: customers, error: customersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active, credit_limit')
            .eq('organization_type', 'customer');

        if (customersError) {
            console.error('❌ Customers query failed:', customersError.message);
            console.error('   Error code:', customersError.code);
            console.error('   Error hint:', customersError.hint);
            console.error('   Error details:', customersError.details);
        } else {
            console.log('✅ Customers query successful! Found customers:', customers?.length || 0);
            if (customers && customers.length > 0) {
                console.log('   Sample customer:', customers[0]);
            }
        }

        // Step 4: Test suppliers query (the working one)
        console.log('\n4️⃣ Testing suppliers query (known to work)...');
        const { data: suppliers, error: suppliersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .eq('organization_type', 'supplier');

        if (suppliersError) {
            console.error('❌ Suppliers query failed:', suppliersError.message);
        } else {
            console.log('✅ Suppliers query successful! Found suppliers:', suppliers?.length || 0);
            if (suppliers && suppliers.length > 0) {
                console.log('   Sample supplier:', suppliers[0]);
            }
        }

        // Step 5: Summary
        console.log('\n📊 DIAGNOSTIC SUMMARY:');
        console.log('====================');
        console.log('Authentication: ✅ Working');
        console.log('Basic query: ' + (allOrgsError ? '❌ Failed' : '✅ Working'));
        console.log('Customers query: ' + (customersError ? '❌ Failed' : '✅ Working'));
        console.log('Suppliers query: ' + (suppliersError ? '❌ Failed' : '✅ Working'));

        if (customersError && !suppliersError) {
            console.log('\n🔍 ANALYSIS: RLS policy issue confirmed!');
            console.log('   - Suppliers query works (policy allows it)');
            console.log('   - Customers query fails (policy blocks it)');
            console.log('   - This confirms RLS policy needs fixing');
        } else if (!customersError && !suppliersError) {
            console.log('\n🎉 SUCCESS: All queries working! RLS policies are correct.');
        } else {
            console.log('\n❓ UNEXPECTED: Both queries have same result - might be different issue');
        }

    } catch (error) {
        console.error('❌ Unexpected error during diagnostics:', error);
    }
}

diagnoseIssue().catch(console.error);
