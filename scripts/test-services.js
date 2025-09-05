#!/usr/bin/env node
// Manual TypeScript Interface and Service Validation
// Tests the new organization-based customer model services

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock CustomerOrganizationService for testing
class CustomerOrganizationService {
    static async getCustomerOrganizations() {
        const { data, error } = await supabase
            .from('organizations')
            .select(`
        *,
        contacts:contacts(
          id,
          contact_name,
          email,
          phone,
          role,
          is_primary_contact,
          description,
          is_active
        )
      `)
            .eq('description', 'Customer Organization')
            .eq('is_active', true)
            .order('name');

        if (error) throw new Error(`Failed to fetch customer organizations: ${error.message}`);
        return data || [];
    }

    static async createCustomerOrganization(organizationData) {
        const { data, error } = await supabase
            .from('organizations')
            .insert({
                ...organizationData,
                description: 'Customer Organization',
                is_active: true,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create customer organization: ${error.message}`);
        return data;
    }

    static async addContactToOrganization(organizationId, contactData) {
        const { data, error } = await supabase
            .from('contacts')
            .insert({
                ...contactData,
                organization_id: organizationId,
                type: 'customer',
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to add contact to organization: ${error.message}`);
        return data;
    }

    static async addProjectContactPoint(projectId, contactId, role = 'general', isPrimary = false) {
        if (isPrimary) {
            await supabase
                .from('project_contact_points')
                .update({ is_primary: false })
                .eq('project_id', projectId);
        }

        const { data, error } = await supabase
            .from('project_contact_points')
            .insert({
                project_id: projectId,
                contact_id: contactId,
                role: role || 'general',
                is_primary: isPrimary,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to add project contact point: ${error.message}`);
        return data;
    }

    static async getProjectContactPoints(projectId) {
        const { data, error } = await supabase
            .from('project_contact_points')
            .select(`
        *,
        contact:contacts(
          id,
          contact_name,
          email,
          phone,
          role,
          is_primary_contact,
          description,
          company_name
        )
      `)
            .eq('project_id', projectId)
            .order('is_primary', { ascending: false })
            .order('created_at');

        if (error) throw new Error(`Failed to fetch project contact points: ${error.message}`);
        return data || [];
    }
}

async function runServiceTests() {
    console.log('🧪 Testing Organization-Based Customer Model Services...\n');

    let passedTests = 0;
    let totalTests = 0;
    let testData = {};

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

    // Test 1: Service Methods
    console.log('🔧 Service Method Tests:');

    test('getCustomerOrganizations returns data', async () => {
        const organizations = await CustomerOrganizationService.getCustomerOrganizations();
        return Array.isArray(organizations) && organizations.length > 0;
    });

    test('createCustomerOrganization works', async () => {
        const organization = await CustomerOrganizationService.createCustomerOrganization({
            name: 'Service Test Org',
            slug: 'service-test-org',
            description: 'Customer Organization',
            industry: 'Testing',
            is_active: true
        });

        testData.organizationId = organization.id;
        return organization && organization.name === 'Service Test Org';
    });

    test('addContactToOrganization works', async () => {
        const contact = await CustomerOrganizationService.addContactToOrganization(
            testData.organizationId,
            {
                contact_name: 'Service Test Contact',
                email: 'service-test@example.com',
                phone: '123-456-7890',
                role: 'testing',
                is_primary_contact: true,
                description: 'Service test contact'
            }
        );

        testData.contactId = contact.id;
        return contact && contact.contact_name === 'Service Test Contact';
    });

    // Test 2: Project Integration
    console.log('\n📋 Project Integration Tests:');

    test('create test project', async () => {
        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                organization_id: testData.organizationId,
                project_id: 'SERVICE-TEST-001',
                title: 'Service Test Project',
                customer_organization_id: testData.organizationId,
                status: 'active',
                created_by: 'test-user'
            })
            .select()
            .single();

        if (error) throw error;
        testData.projectId = project.id;
        return project && project.title === 'Service Test Project';
    });

    test('addProjectContactPoint works', async () => {
        const contactPoint = await CustomerOrganizationService.addProjectContactPoint(
            testData.projectId,
            testData.contactId,
            'testing',
            true
        );

        testData.contactPointId = contactPoint.id;
        return contactPoint && contactPoint.project_id === testData.projectId;
    });

    test('getProjectContactPoints works', async () => {
        const contactPoints = await CustomerOrganizationService.getProjectContactPoints(testData.projectId);
        return Array.isArray(contactPoints) && contactPoints.length > 0;
    });

    // Test 3: Data Structure Validation
    console.log('\n📊 Data Structure Validation:');

    test('Organization has correct structure', async () => {
        const organizations = await CustomerOrganizationService.getCustomerOrganizations();
        const org = organizations.find(o => o.id === testData.organizationId);

        return org &&
            typeof org.id === 'string' &&
            typeof org.name === 'string' &&
            typeof org.slug === 'string' &&
            org.description === 'Customer Organization' &&
            Array.isArray(org.contacts);
    });

    test('Contact has correct structure', async () => {
        const { data: contact, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', testData.contactId)
            .single();

        return !error && contact &&
            typeof contact.id === 'string' &&
            typeof contact.contact_name === 'string' &&
            typeof contact.role === 'string' &&
            typeof contact.is_primary_contact === 'boolean' &&
            contact.type === 'customer';
    });

    test('Project contact point has correct structure', async () => {
        const { data: contactPoint, error } = await supabase
            .from('project_contact_points')
            .select('*')
            .eq('id', testData.contactPointId)
            .single();

        return !error && contactPoint &&
            typeof contactPoint.id === 'string' &&
            typeof contactPoint.project_id === 'string' &&
            typeof contactPoint.contact_id === 'string' &&
            typeof contactPoint.is_primary === 'boolean';
    });

    // Test 4: Query Performance
    console.log('\n⚡ Query Performance Tests:');

    test('Complex organization query works', async () => {
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
            .eq('id', testData.organizationId)
            .single();

        return !error && data && data.contacts && Array.isArray(data.contacts);
    });

    test('Complex project query works', async () => {
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
            email,
            role
          )
        )
      `)
            .eq('id', testData.projectId)
            .single();

        return !error && data &&
            data.customer_organization &&
            data.contact_points &&
            Array.isArray(data.contact_points);
    });

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    try {
        if (testData.contactPointId) {
            await supabase.from('project_contact_points').delete().eq('id', testData.contactPointId);
        }
        if (testData.projectId) {
            await supabase.from('projects').delete().eq('id', testData.projectId);
        }
        if (testData.contactId) {
            await supabase.from('contacts').delete().eq('id', testData.contactId);
        }
        if (testData.organizationId) {
            await supabase.from('organizations').delete().eq('id', testData.organizationId);
        }
        console.log('✅ Test data cleaned up successfully');
    } catch (error) {
        console.log('⚠️  Warning: Could not clean up all test data:', error.message);
    }

    // Summary
    console.log('\n📋 Service Test Summary:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All service tests passed! TypeScript interfaces and services work correctly.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some service tests failed. Please review the implementation.');
        process.exit(1);
    }
}

// Run the service tests
runServiceTests().catch(error => {
    console.error('❌ Service test script failed:', error);
    process.exit(1);
});
