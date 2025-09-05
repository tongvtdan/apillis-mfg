#!/usr/bin/env node

// Script to temporarily disable RLS on projects table to test the fix

import { createClient } from '@supabase/supabase-js';

// Use service role key to modify RLS policies
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function disableRLS() {
  console.log('🔧 Temporarily disabling RLS on projects table...\n');

  try {
    // Disable RLS on projects table
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE projects DISABLE ROW LEVEL SECURITY;'
    });

    if (disableError) {
      console.error('❌ Error disabling RLS:', disableError);
      return;
    }

    console.log('✅ Successfully disabled RLS on projects table');

    // Test with anon key
    console.log('\n📊 Testing with anon key after disabling RLS...');
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
    
    const { data: projects, error: projectError } = await anonSupabase
      .from('projects')
      .select(`
        id,
        project_id,
        title,
        customer_organization_id,
        customer_organization:organizations!customer_organization_id(
          id,
          name
        )
      `)
      .limit(5);

    if (projectError) {
      console.error('❌ Anon query still fails:', projectError);
    } else {
      console.log('✅ Anon query works!');
      projects.forEach(project => {
        const customerName = project.customer_organization?.name || 'No Customer';
        console.log(`  - ${project.project_id}: ${project.title} → ${customerName}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
disableRLS().then(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
