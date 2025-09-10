// Simple test to verify organization queries work
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test authentication first
async function testAuth() {
    console.log('🔐 Testing authentication...');
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error('❌ Auth error:', error);
        return false;
    }

    if (user) {
        console.log('✅ User authenticated:', user.email);
        return true;
    } else {
        console.log('❌ No authenticated user');
        return false;
    }
}

async function testOrganizationQueries() {
    console.log('🔍 Testing organization queries...');

    // Test authentication first
    const isAuthenticated = await testAuth();
    if (!isAuthenticated) {
        console.log('❌ Cannot test queries without authentication');
        return;
    }

    try {
        // Test 1: Fetch all organizations
        console.log('\n📋 Test 1: Fetching all organizations...');
        const { data: allOrgs, error: allError } = await supabase
            .from('organizations')
            .select('*')
            .limit(5);

        if (allError) {
            console.error('❌ Error fetching all organizations:', allError);
        } else {
            console.log('✅ Successfully fetched organizations:', allOrgs?.length || 0);
            console.log('Sample organization:', allOrgs?.[0]);
        }

        // Test 2: Fetch customer organizations specifically
        console.log('\n👥 Test 2: Fetching customer organizations...');
        const { data: customers, error: customersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active, credit_limit')
            .eq('organization_type', 'customer');

        if (customersError) {
            console.error('❌ Error fetching customer organizations:', customersError);
        } else {
            console.log('✅ Successfully fetched customer organizations:', customers?.length || 0);
            if (customers && customers.length > 0) {
                console.log('Sample customer:', customers[0]);
            }
        }

        // Test 3: Fetch supplier organizations
        console.log('\n🏭 Test 3: Fetching supplier organizations...');
        const { data: suppliers, error: suppliersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .eq('organization_type', 'supplier');

        if (suppliersError) {
            console.error('❌ Error fetching supplier organizations:', suppliersError);
        } else {
            console.log('✅ Successfully fetched supplier organizations:', suppliers?.length || 0);
            if (suppliers && suppliers.length > 0) {
                console.log('Sample supplier:', suppliers[0]);
            }
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// Run the tests
testOrganizationQueries().catch(console.error);
