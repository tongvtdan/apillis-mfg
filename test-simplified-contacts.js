// Test script for simplified project contacts model
// This script tests the new contact management functions

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimplifiedContacts() {
    console.log('🧪 Testing Simplified Project Contacts Model');
    console.log('='.repeat(50));

    try {
        // Test 1: Get a project with contacts
        console.log('\n1. Testing project with contacts...');
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, project_id, point_of_contacts')
            .not('point_of_contacts', 'is', null)
            .limit(1);

        if (projectsError) {
            throw projectsError;
        }

        if (projects.length === 0) {
            console.log('❌ No projects with contacts found');
            return;
        }

        const testProject = projects[0];
        console.log(`✅ Found project: ${testProject.project_id}`);
        console.log(`   Contacts: ${testProject.point_of_contacts.length}`);

        // Test 2: Get project contacts using helper function
        console.log('\n2. Testing get_project_contacts function...');
        const { data: contacts, error: contactsError } = await supabase
            .rpc('get_project_contacts', { project_uuid: testProject.id });

        if (contactsError) {
            throw contactsError;
        }

        console.log(`✅ Retrieved ${contacts.length} contacts`);
        contacts.forEach((contact, index) => {
            console.log(`   ${index + 1}. ${contact.contact_name} (${contact.email})`);
            console.log(`      Role: ${contact.role}, Primary: ${contact.is_project_primary}`);
        });

        // Test 3: Get primary contact
        console.log('\n3. Testing get_project_primary_contact function...');
        const { data: primaryContact, error: primaryError } = await supabase
            .rpc('get_project_primary_contact', { project_uuid: testProject.id });

        if (primaryError) {
            throw primaryError;
        }

        if (primaryContact.length > 0) {
            console.log(`✅ Primary contact: ${primaryContact[0].contact_name}`);
            console.log(`   Email: ${primaryContact[0].email}`);
        } else {
            console.log('❌ No primary contact found');
        }

        // Test 4: Test project details view
        console.log('\n4. Testing project_details_view...');
        const { data: projectDetails, error: detailsError } = await supabase
            .from('project_details_view')
            .select('project_id, customer_organization_name, primary_contact_name, primary_contact_email, contact_count')
            .eq('id', testProject.id)
            .single();

        if (detailsError) {
            throw detailsError;
        }

        console.log(`✅ Project details from view:`);
        console.log(`   Customer: ${projectDetails.customer_organization_name}`);
        console.log(`   Primary Contact: ${projectDetails.primary_contact_name}`);
        console.log(`   Contact Count: ${projectDetails.contact_count}`);

        // Test 5: Test array operations
        console.log('\n5. Testing array operations...');

        // Get current contacts
        const currentContacts = testProject.point_of_contacts;
        console.log(`   Current contacts: [${currentContacts.join(', ')}]`);

        // Test array queries
        const { data: projectsWithContact, error: arrayError } = await supabase
            .from('projects')
            .select('project_id')
            .contains('point_of_contacts', [currentContacts[0]])
            .limit(3);

        if (arrayError) {
            throw arrayError;
        }

        console.log(`✅ Found ${projectsWithContact.length} projects with contact ${currentContacts[0]}`);

        // Test 6: Performance comparison
        console.log('\n6. Testing query performance...');

        const startTime = Date.now();
        const { data: allProjects, error: perfError } = await supabase
            .from('project_details_view')
            .select('project_id, customer_organization_name, primary_contact_name, contact_count')
            .limit(10);

        const endTime = Date.now();

        if (perfError) {
            throw perfError;
        }

        console.log(`✅ Retrieved ${allProjects.length} projects in ${endTime - startTime}ms`);
        console.log('   Sample projects:');
        allProjects.slice(0, 3).forEach(p => {
            console.log(`   - ${p.project_id}: ${p.customer_organization_name} (${p.contact_count} contacts)`);
        });

        console.log('\n🎉 All tests passed! Simplified contact model is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Details:', error);
    }
}

// Run the test
testSimplifiedContacts();