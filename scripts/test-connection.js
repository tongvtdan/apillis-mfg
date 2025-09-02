#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Simple query to test connection
    const { data, error } = await supabase
      .from('projects')
      .select('p:id')
      .limit(1);
      
    if (error) {
      console.error('Connection test failed:', error);
      return;
    }
    
    console.log(`Connection successful! Found ${data.length} projects in the database.`);
    
    // Test users query
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (usersError) {
      console.error('Users query failed:', usersError);
      return;
    }
    
    console.log(`Found ${users.length} users in the database.`);
    
    // Test the specific query that was failing with table alias
    const { data: projects, error: projectsError } = await supabase
      .from('projects as p')
      .select('p.id, p.project_id, p.title, p.organization_id, p.current_stage_id')
      .limit(1);
      
    if (projectsError) {
      console.error('Projects query failed:', projectsError);
      return;
    }
    
    console.log(`Projects query successful! Sample project:`, projects[0]);
    
  } catch (error) {
    console.error('Error testing connection:', error);
  }
}

testConnection();