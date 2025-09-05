import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log('Testing Supabase query...');

    try {
        // Test a simplified query first
        console.log('Testing simplified query...');
        const { data: simpleData, error: simpleError } = await supabase
            .from('projects')
            .select(`
        id,
        project_id,
        title,
        customer_id,
        customer_organization_id
      `)
            .limit(3);

        if (simpleError) {
            console.error('Simple query error:', simpleError);
            return;
        }

        console.log('Simple query successful!');
        console.log('Projects found:', simpleData?.length);

        // Now test with organization join
        console.log('\nTesting query with organization join...');
        const { data, error } = await supabase
            .from('projects')
            .select(`
        id,
        project_id,
        title,
        customer_id,
        customer_organization_id,
        customer_organization:organizations!customer_organization_id(
          id,
          name,
          slug
        )
      `)
            .limit(3);

        if (error) {
            console.error('Organization join query error:', error);
            return;
        }

        console.log('Organization join query successful!');
        console.log('Number of projects:', data?.length);

        data?.forEach((project, index) => {
            console.log(`\n--- Project ${index + 1}: ${project.project_id} ---`);
            console.log('Title:', project.title);
            console.log('Customer Org ID:', project.customer_organization_id);
            console.log('Customer Organization:', project.customer_organization ? {
                name: project.customer_organization.name,
                slug: project.customer_organization.slug
            } : 'null');
        });

        // Now test with contact points
        console.log('\nTesting query with contact points...');
        const { data: contactData, error: contactError } = await supabase
            .from('projects')
            .select(`
        id,
        project_id,
        title,
        customer_organization_id,
        customer_organization:organizations!customer_organization_id(
          id,
          name
        ),
        contact_points:project_contact_points(
          id,
          contact_id,
          is_primary,
          contact:contacts(
            id,
            contact_name,
            email
          )
        )
      `)
            .limit(3);

        if (contactError) {
            console.error('Contact points query error:', contactError);
            return;
        }

        console.log('Contact points query successful!');
        contactData?.forEach((project, index) => {
            console.log(`\n--- Project ${index + 1}: ${project.project_id} ---`);
            console.log('Customer Organization:', project.customer_organization?.name || 'null');
            console.log('Contact Points:', project.contact_points?.length || 0);
            if (project.contact_points?.length > 0) {
                project.contact_points.forEach((cp, i) => {
                    console.log(`  Contact ${i + 1}:`, {
                        name: cp.contact?.contact_name,
                        email: cp.contact?.email,
                        is_primary: cp.is_primary
                    });
                });
            }
        });

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testQuery();