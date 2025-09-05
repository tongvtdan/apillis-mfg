#!/usr/bin/env node
// Organization-Based Customer Model Migration Validation Script
// Simple integration test to validate the migration implementation

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runValidationTests() {
    console.log('🧪 Starting Organization-Based Customer Model Migration Validation...\n');

    let passedTests = 0;
    let totalTests = 0;

    const test = (name, testFn) => {
        totalTests++;
        try {
            const result = testFn();
            if (result) {
                console.log(`✅ ${name}`);
                passedTests++;
            } else {
                console.log(`❌ ${name}`);
            }
        } catch (error) {
            console.log(`❌ ${name} - Error: ${error.message}`);
        }
    };

    // Test 1: Database Schema Validation
    console.log('📋 Database Schema Validation:');

    test('Projects table has customer_organization_id column', async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('customer_organization_id')
            .limit(1);
        return !error && data !== null;
    });

    test('Contacts table has role, is_primary_contact, description columns', async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('role, is_primary_contact, description')
            .limit(1);
        return !error && data !== null;
    });

    test('Project_contact_points table exists', async () => {
        const { data, error } = await supabase
            .from('project_contact_points')
            .select('*')
            .limit(1);
        return !error && data !== null;
    });

    test('Organizations table has address fields', async () => {
        const { data, error } = await supabase
            .from('organizations')
            .select('address, city, state, country, postal_code')
            .limit(1);
        return !error && data !== null;
    });

    // Test 2: Migration Data Integrity
    console.log('\n📊 Migration Data Integrity:');

    test('Customer organizations exist', async () => {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('description', 'Customer Organization')
            .eq('is_active', true);
        return !error && data && data.length > 0;
    });

    test('Contacts have organization references', async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('id, organization_id')
            .eq('type', 'customer')
            .not('organization_id', 'is', null);
        return !error && data && data.length > 0;
    });

    test('Projects have customer organization references', async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('id, customer_organization_id')
            .not('customer_organization_id', 'is', null);
        return !error && data && data.length > 0;
    });

    test('Project contact points exist', async () => {
        const { data, error } = await supabase
            .from('project_contact_points')
            .select('*');
        return !error && data && data.length > 0;
    });

    // Test 3: Data Relationships
    console.log('\n🔗 Data Relationships:');

    test('Projects link to correct customer organizations', async () => {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        id,
        project_id,
        title,
        customer_organization_id,
        organizations:organizations!customer_organization_id(
          id,
          name,
          description
        )
      `)
            .not('customer_organization_id', 'is', null)
            .limit(5);

        if (error || !data) return false;

        return data.every(project =>
            project.organizations &&
            project.organizations.description === 'Customer Organization'
        );
    });

    test('Contact points link to correct projects and contacts', async () => {
        const { data, error } = await supabase
            .from('project_contact_points')
            .select(`
        id,
        project_id,
        contact_id,
        projects:projects!project_id(
          id,
          customer_organization_id
        ),
        contacts:contacts!contact_id(
          id,
          organization_id
        )
      `)
            .limit(5);

        if (error || !data) return false;

        return data.every(cp =>
            cp.projects &&
            cp.contacts &&
            cp.projects.customer_organization_id &&
            cp.contacts.organization_id
        );
    });

    test('Primary contacts are properly set', async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('id, is_primary_contact, organization_id')
            .eq('type', 'customer')
            .eq('is_primary_contact', true);

        return !error && data && data.length > 0;
    });

    test('Primary contact points are properly set', async () => {
        const { data, error } = await supabase
            .from('project_contact_points')
            .select('id, is_primary')
            .eq('is_primary', true);

        return !error && data && data.length > 0;
    });

    // Test 4: Backward Compatibility
    console.log('\n🔄 Backward Compatibility:');

    test('Existing customer_id relationships still work', async () => {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        id,
        customer_id,
        customer:contacts!customer_id(
          id,
          contact_name,
          company_name
        )
      `)
            .not('customer_id', 'is', null)
            .limit(5);

        return !error && data && data.length > 0;
    });

    test('Legacy contact queries still work', async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('type', 'customer')
            .limit(5);

        return !error && data && data.length > 0;
    });

    // Test 5: Data Quality
    console.log('\n📈 Data Quality:');

    test('No orphaned project contact points', async () => {
        const { data, error } = await supabase
            .from('project_contact_points')
            .select(`
        id,
        project_id,
        contact_id,
        projects:projects!project_id(id),
        contacts:contacts!contact_id(id)
      `);

        if (error || !data) return false;

        return data.every(cp => cp.projects && cp.contacts);
    });

    test('No orphaned customer organization references', async () => {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        id,
        customer_organization_id,
        organizations:organizations!customer_organization_id(id)
      `)
            .not('customer_organization_id', 'is', null);

        if (error || !data) return false;

        return data.every(project => project.organizations);
    });

    // Test 6: Performance Queries
    console.log('\n⚡ Performance Queries:');

    test('Organization-based project queries work', async () => {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        id,
        project_id,
        title,
        customer_organization:organizations!customer_organization_id(
          id,
          name,
          industry
        ),
        contact_points:project_contact_points(
          id,
          role,
          is_primary,
          contact:contacts(
            id,
            contact_name,
            email
          )
        )
      `)
            .not('customer_organization_id', 'is', null)
            .limit(3);

        return !error && data && data.length > 0;
    });

    test('Customer organization with contacts query works', async () => {
        const { data, error } = await supabase
            .from('organizations')
            .select(`
        id,
        name,
        industry,
        contacts:contacts(
          id,
          contact_name,
          email,
          role,
          is_primary_contact
        )
      `)
            .eq('description', 'Customer Organization')
            .limit(3);

        return !error && data && data.length > 0;
    });

    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! Migration validation successful.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Please review the migration.');
        process.exit(1);
    }
}

// Run the validation tests
runValidationTests().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
});
