#!/usr/bin/env node

// Script to generate sample approval requests for testing
// This script creates approval requests in the reviews table for different user roles

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generateSampleApprovals() {
  console.log('Generating sample approval requests...');
  
  try {
    // First, let's get some sample users by role
    const { data: engineers, error: engineersError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'engineering')
      .limit(2);
      
    if (engineersError) {
      console.error('Error fetching engineers:', engineersError);
      return;
    }
    
    const { data: productionUsers, error: productionError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'production')
      .limit(2);
      
    if (productionError) {
      console.error('Error fetching production users:', productionError);
      return;
    }
    
    const { data: qaUsers, error: qaError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'qa')
      .limit(2);
      
    if (qaError) {
      console.error('Error fetching QA users:', qaError);
      return;
    }
    
    // Get sample projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, project_id, title, organization_id, current_stage_id')
      .limit(5);
      
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return;
    }
    
    // Get workflow sub-stages that require approvals
    const { data: subStages, error: subStagesError } = await supabase
      .from('workflow_sub_stages')
      .select('id, name, approval_roles, workflow_stage_id')
      .eq('requires_approval', true)
      .limit(5);
      
    if (subStagesError) {
      console.error('Error fetching workflow sub-stages:', subStagesError);
      return;
    }
    
    console.log(`Found ${engineers.length} engineers, ${productionUsers.length} production users, ${qaUsers.length} QA users`);
    console.log(`Found ${projects.length} projects and ${subStages.length} approval-required sub-stages`);
    
    // Create sample approval requests
    const approvalRequests = [];
    const now = new Date();
    
    // Create approvals for engineers
    for (let i = 0; i < Math.min(engineers.length, projects.length); i++) {
      approvalRequests.push({
        project_id: projects[i].id,
        reviewer_id: engineers[i].id,
        review_type: `stage_approval_engineering`,
        status: 'pending',
        priority: 'medium',
        comments: `Please review and approve the ${subStages[i]?.name || 'technical review'} for project ${projects[i].project_id}`,
        organization_id: projects[i].organization_id,
        due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        metadata: {
          stage_id: subStages[i]?.workflow_stage_id || projects[i].current_stage_id,
          approval_role: 'engineering',
          approval_type: 'stage_transition'
        },
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });
    }
    
    // Create approvals for production users
    for (let i = 0; i < Math.min(productionUsers.length, projects.length); i++) {
      approvalRequests.push({
        project_id: projects[Math.min(i + 1, projects.length - 1)].id,
        reviewer_id: productionUsers[i].id,
        review_type: `stage_approval_production`,
        status: 'pending',
        priority: 'medium',
        comments: `Please review and approve the ${subStages[Math.min(i + 1, subStages.length - 1)]?.name || 'production review'} for project ${projects[Math.min(i + 1, projects.length - 1)].project_id}`,
        organization_id: projects[Math.min(i + 1, projects.length - 1)].organization_id,
        due_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        metadata: {
          stage_id: subStages[Math.min(i + 1, subStages.length - 1)]?.workflow_stage_id || projects[Math.min(i + 1, projects.length - 1)].current_stage_id,
          approval_role: 'production',
          approval_type: 'stage_transition'
        },
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });
    }
    
    // Create approvals for QA users
    for (let i = 0; i < Math.min(qaUsers.length, projects.length); i++) {
      approvalRequests.push({
        project_id: projects[Math.min(i + 2, projects.length - 1)].id,
        reviewer_id: qaUsers[i].id,
        review_type: `stage_approval_qa`,
        status: 'pending',
        priority: 'high',
        comments: `Please review and approve the ${subStages[Math.min(i + 2, subStages.length - 1)]?.name || 'QA review'} for project ${projects[Math.min(i + 2, projects.length - 1)].project_id}`,
        organization_id: projects[Math.min(i + 2, projects.length - 1)].organization_id,
        due_date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        metadata: {
          stage_id: subStages[Math.min(i + 2, subStages.length - 1)]?.workflow_stage_id || projects[Math.min(i + 2, projects.length - 1)].current_stage_id,
          approval_role: 'qa',
          approval_type: 'stage_transition'
        },
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });
    }
    
    // Insert the approval requests
    if (approvalRequests.length > 0) {
      const { data, error } = await supabase
        .from('reviews')
        .insert(approvalRequests)
        .select();
        
      if (error) {
        console.error('Error inserting approval requests:', error);
        return;
      }
      
      console.log(`Successfully created ${approvalRequests.length} approval requests:`);
      data.forEach((approval, index) => {
        console.log(`${index + 1}. Approval ID: ${approval.id} for ${approvalRequests[index].review_type} - Status: ${approval.status}`);
      });
    } else {
      console.log('No approval requests to create');
    }
    
    // Also create some approved and rejected approvals for variety
    if (engineers.length > 0 && projects.length > 0) {
      const completedApprovals = [
        {
          project_id: projects[0].id,
          reviewer_id: engineers[0].id,
          review_type: 'stage_approval_engineering',
          status: 'approved',
          priority: 'medium',
          comments: 'Technical design is sound and manufacturable.',
          decision_reason: 'All requirements met and design is feasible.',
          organization_id: projects[0].organization_id,
          completed_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            stage_id: subStages[0]?.workflow_stage_id || projects[0].current_stage_id,
            approval_role: 'engineering',
            approval_type: 'stage_transition'
          },
          created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          project_id: projects[Math.min(1, projects.length - 1)].id,
          reviewer_id: productionUsers[Math.min(0, productionUsers.length - 1)]?.id || engineers[0].id,
          review_type: 'stage_approval_production',
          status: 'rejected',
          priority: 'high',
          comments: 'Production capacity is insufficient for this timeline.',
          decision_reason: 'Cannot meet required delivery date with current capacity.',
          organization_id: projects[Math.min(1, projects.length - 1)].organization_id,
          completed_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          metadata: {
            stage_id: subStages[Math.min(1, subStages.length - 1)]?.workflow_stage_id || projects[Math.min(1, projects.length - 1)].current_stage_id,
            approval_role: 'production',
            approval_type: 'stage_transition'
          },
          created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      const { data: completedData, error: completedError } = await supabase
        .from('reviews')
        .insert(completedApprovals)
        .select();
        
      if (completedError) {
        console.error('Error inserting completed approvals:', completedError);
      } else {
        console.log(`Successfully created ${completedApprovals.length} completed approvals (approved/rejected)`);
      }
    }
    
    console.log('Sample approval generation complete!');
    
  } catch (error) {
    console.error('Error generating sample approvals:', error);
  }
}

// Run the script
generateSampleApprovals();