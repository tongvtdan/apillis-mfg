// Check current RLS policies status
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRLSPolicies() {
    console.log('🔍 Checking current RLS policies on organizations table...\n');

    try {
        // Test the organizations query first
        console.log('Testing organizations query...');
        const { data: customers, error: customersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .eq('organization_type', 'customer')
            .limit(1);

        if (customersError) {
            console.error('❌ Query failed with error:', customersError.message);
            console.error('Error code:', customersError.code);
            console.error('Error details:', customersError.details);
        } else {
            console.log('✅ Query successful! Found customers:', customers?.length || 0);
            console.log('Sample data:', customers?.[0]);
        }

        // Test suppliers query
        console.log('\nTesting suppliers query...');
        const { data: suppliers, error: suppliersError } = await supabase
            .from('organizations')
            .select('id, name, organization_type, is_active')
            .eq('organization_type', 'supplier')
            .limit(1);

        if (suppliersError) {
            console.error('❌ Suppliers query failed with error:', suppliersError.message);
        } else {
            console.log('✅ Suppliers query successful! Found suppliers:', suppliers?.length || 0);
            console.log('Sample data:', suppliers?.[0]);
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

checkRLSPolicies().catch(console.error);
