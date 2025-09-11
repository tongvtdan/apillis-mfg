// Test script to verify project creation functionality
const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testProjectCreation() {
    try {
        console.log('🔍 Testing project creation with authenticated user...');

        // Sign in with a test user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'nguyen.van.a@apillis.com',
            password: 'Password123!'
        });

        if (signInError) {
            console.error('❌ Sign in error:', signInError);
            return;
        }

        console.log('✅ Signed in successfully as:', signInData.user.email);

        // Get user's organization
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', signInData.user.id)
            .single();

        if (userError) {
            console.error('❌ Error fetching user data:', userError);
            return;
        }

        console.log('✅ User organization ID:', userData.organization_id);

        // Get a customer organization
        const { data: customerOrg, error: customerError } = await supabase
            .from('organizations')
            .select('id')
            .eq('organization_type', 'customer')
            .eq('is_active', true)
            .limit(1)
            .single();

        if (customerError) {
            console.error('❌ Error fetching customer organization:', customerError);
            return;
        }

        console.log('✅ Customer organization ID:', customerOrg.id);

        // Get workflow stage for RFQ (inquiry_received)
        const { data: stage, error: stageError } = await supabase
            .from('workflow_stages')
            .select('id')
            .eq('organization_id', userData.organization_id)
            .eq('slug', 'inquiry_received')
            .eq('is_active', true)
            .single();

        if (stageError) {
            console.error('❌ Error fetching workflow stage:', stageError);
            return;
        }

        console.log('✅ Workflow stage ID:', stage.id);

        // Generate project ID
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const baseId = `P-${year}${month}${day}`;

        // Find the next available sequence number
        const { data: existingProjects, error: projectError } = await supabase
            .from('projects')
            .select('project_id')
            .like('project_id', `${baseId}%`)
            .order('project_id', { ascending: false })
            .limit(1);

        let sequenceNumber = 1;
        if (existingProjects && existingProjects.length > 0) {
            const lastProjectId = existingProjects[0].project_id;
            const lastSequence = parseInt(lastProjectId.slice(-3));
            sequenceNumber = lastSequence + 1;
        }

        const projectId = `${baseId}${sequenceNumber.toString().padStart(3, '0')}`;
        console.log('✅ Generated project ID:', projectId);

        // Create project data
        const projectData = {
            organization_id: userData.organization_id,
            project_id: projectId,
            title: 'Test RFQ Project',
            description: 'Test project created via RFQ intake',
            customer_organization_id: customerOrg.id,
            point_of_contacts: [],
            current_stage_id: stage.id,
            status: 'draft',
            priority_level: 'normal',
            source: 'portal',
            created_by: signInData.user.id,
            tags: ['rfq', 'fabrication'],
            intake_type: 'rfq',
            intake_source: 'portal',
            project_type: 'fabrication',
            stage_entered_at: new Date().toISOString(),
            metadata: {
                contact_name: 'Test Customer',
                contact_email: 'test@customer.com',
                contact_phone: '+1234567890'
            }
        };

        console.log('📝 Inserting project data...');

        // Try to create the project
        const { data: project, error: insertError } = await supabase
            .from('projects')
            .insert(projectData)
            .select(`
                *,
                customer_organization:organizations!customer_organization_id(
                    id,
                    name
                ),
                current_stage:workflow_stages!current_stage_id(
                    id,
                    name
                )
            `)
            .single();

        if (insertError) {
            console.error('❌ Database error creating project:', insertError);
            console.error('❌ Error details:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            });
            return;
        }

        console.log('✅ Project created successfully:', project);

        // Clean up - delete the test project
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', project.id);

        if (deleteError) {
            console.error('❌ Error deleting test project:', deleteError);
        } else {
            console.log('✅ Test project cleaned up successfully');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    } finally {
        // Sign out
        await supabase.auth.signOut();
        console.log('👋 Signed out');
    }
}

// Run the test
testProjectCreation();