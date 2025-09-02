#!/usr/bin/env node

// Script to generate sample approval requests based on existing sample data
// This creates approvals that match the sample data structure

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read existing sample data
const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../sample-data/03-users.json'), 'utf8'));
const projectsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../sample-data/05-projects.json'), 'utf8'));
const subStagesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../sample-data/02a-workflow-sub-stages.json'), 'utf8'));

function generateSampleApprovals() {
  console.log('Generating sample approval requests based on existing sample data...');
  
  // Find users by role
  const engineers = usersData.filter(user => user.role === 'engineering');
  const productionUsers = usersData.filter(user => user.role === 'production');
  const qaUsers = usersData.filter(user => user.role === 'qa');
  const managementUsers = usersData.filter(user => user.role === 'management');
  
  console.log(`Found ${engineers.length} engineers, ${productionUsers.length} production users, ${qaUsers.length} QA users`);
  
  // Get projects
  const projects = projectsData;
  console.log(`Found ${projects.length} projects`);
  
  // Get sub-stages that require approvals
  const approvalSubStages = subStagesData.filter(stage => stage.requires_approval);
  console.log(`Found ${approvalSubStages.length} sub-stages that require approvals`);
  
  // Create sample approval requests
  const approvalRequests = [];
  const now = new Date();
  
  // Create pending approvals for different roles
  // Engineering approvals
  for (let i = 0; i < Math.min(engineers.length, 3); i++) {
    const project = projects[i % projects.length];
    const subStage = approvalSubStages.find(s => s.approval_roles.includes('engineering')) || approvalSubStages[0];
    
    approvalRequests.push({
      id: `550e8400-e29b-41d4-a716-4466554406${String(i + 10).padStart(2, '0')}`,
      project_id: project.id,
      reviewer_id: engineers[i].id,
      reviewer_role: 'engineering',
      review_type: 'stage_approval_engineering',
      status: 'pending',
      priority: 'medium',
      comments: `Please review and approve the ${subStage.name} for project ${project.project_id}`,
      recommendations: 'Review technical specifications and design requirements',
      organization_id: project.organization_id,
      due_date: new Date(now.getTime() + (3 + i) * 24 * 60 * 60 * 1000).toISOString(), // 3-5 days from now
      metadata: {
        stage_id: subStage.workflow_stage_id,
        approval_role: 'engineering',
        approval_type: 'stage_transition',
        sub_stage_id: subStage.id,
        stage_name: subStage.name
      },
      created_at: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString()
    });
  }
  
  // Production approvals
  for (let i = 0; i < Math.min(productionUsers.length, 2); i++) {
    const project = projects[(i + 1) % projects.length];
    const subStage = approvalSubStages.find(s => s.approval_roles.includes('production')) || approvalSubStages[1];
    
    approvalRequests.push({
      id: `550e8400-e29b-41d4-a716-4466554406${String(i + 20).padStart(2, '0')}`,
      project_id: project.id,
      reviewer_id: productionUsers[i].id,
      reviewer_role: 'production',
      review_type: 'stage_approval_production',
      status: 'pending',
      priority: 'high',
      comments: `Please review and approve the ${subStage.name} for project ${project.project_id}`,
      recommendations: 'Review production capabilities and capacity',
      organization_id: project.organization_id,
      due_date: new Date(now.getTime() + (2 + i) * 24 * 60 * 60 * 1000).toISOString(), // 2-3 days from now
      metadata: {
        stage_id: subStage.workflow_stage_id,
        approval_role: 'production',
        approval_type: 'stage_transition',
        sub_stage_id: subStage.id,
        stage_name: subStage.name
      },
      created_at: new Date(now.getTime() - (i + 1) * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - (i + 1) * 60 * 60 * 1000).toISOString()
    });
  }
  
  // QA approvals
  for (let i = 0; i < Math.min(qaUsers.length, 2); i++) {
    const project = projects[(i + 2) % projects.length];
    const subStage = approvalSubStages.find(s => s.approval_roles.includes('qa')) || approvalSubStages[2];
    
    approvalRequests.push({
      id: `550e8400-e29b-41d4-a716-4466554406${String(i + 30).padStart(2, '0')}`,
      project_id: project.id,
      reviewer_id: qaUsers[i].id,
      reviewer_role: 'qa',
      review_type: 'stage_approval_qa',
      status: 'pending',
      priority: 'medium',
      comments: `Please review and approve the ${subStage.name} for project ${project.project_id}`,
      recommendations: 'Review quality requirements and testing specifications',
      organization_id: project.organization_id,
      due_date: new Date(now.getTime() + (1 + i) * 24 * 60 * 60 * 1000).toISOString(), // 1-2 days from now
      metadata: {
        stage_id: subStage.workflow_stage_id,
        approval_role: 'qa',
        approval_type: 'stage_transition',
        sub_stage_id: subStage.id,
        stage_name: subStage.name
      },
      created_at: new Date(now.getTime() - (i + 2) * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - (i + 2) * 60 * 60 * 1000).toISOString()
    });
  }
  
  // Management approvals
  for (let i = 0; i < Math.min(managementUsers.length, 2); i++) {
    const project = projects[(i + 3) % projects.length];
    const subStage = approvalSubStages.find(s => s.approval_roles.includes('management')) || approvalSubStages[0];
    
    approvalRequests.push({
      id: `550e8400-e29b-41d4-a716-4466554406${String(i + 40).padStart(2, '0')}`,
      project_id: project.id,
      reviewer_id: managementUsers[i].id,
      reviewer_role: 'management',
      review_type: 'stage_approval_management',
      status: 'pending',
      priority: 'high',
      comments: `Please review and approve the ${subStage.name} for project ${project.project_id}`,
      recommendations: 'Review overall project status and budget',
      organization_id: project.organization_id,
      due_date: new Date(now.getTime() + (4 + i) * 24 * 60 * 60 * 1000).toISOString(), // 4-5 days from now
      metadata: {
        stage_id: subStage.workflow_stage_id,
        approval_role: 'management',
        approval_type: 'stage_transition',
        sub_stage_id: subStage.id,
        stage_name: subStage.name
      },
      created_at: new Date(now.getTime() - (i + 3) * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - (i + 3) * 60 * 60 * 1000).toISOString()
    });
  }
  
  // Create some approved approvals for variety
  if (engineers.length > 0 && projects.length > 0) {
    const project = projects[0];
    const subStage = approvalSubStages.find(s => s.approval_roles.includes('engineering')) || approvalSubStages[0];
    
    approvalRequests.push({
      id: '550e8400-e29b-41d4-a716-446655440650',
      project_id: project.id,
      reviewer_id: engineers[0].id,
      reviewer_role: 'engineering',
      review_type: 'stage_approval_engineering',
      status: 'approved',
      priority: 'medium',
      comments: 'Technical design is sound and manufacturable.',
      decision_reason: 'All requirements met and design is feasible.',
      recommendations: 'Proceed with manufacturing',
      organization_id: project.organization_id,
      completed_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        stage_id: subStage.workflow_stage_id,
        approval_role: 'engineering',
        approval_type: 'stage_transition',
        sub_stage_id: subStage.id,
        stage_name: subStage.name
      },
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  // Create some rejected approvals for variety
  if (productionUsers.length > 0 && projects.length > 1) {
    const project = projects[1];
    const subStage = approvalSubStages.find(s => s.approval_roles.includes('production')) || approvalSubStages[1];
    
    approvalRequests.push({
      id: '550e8400-e29b-41d4-a716-446655440651',
      project_id: project.id,
      reviewer_id: productionUsers[0].id,
      reviewer_role: 'production',
      review_type: 'stage_approval_production',
      status: 'rejected',
      priority: 'high',
      comments: 'Production capacity is insufficient for this timeline.',
      decision_reason: 'Cannot meet required delivery date with current capacity.',
      recommendations: 'Consider extending timeline or adding resources',
      organization_id: project.organization_id,
      completed_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        stage_id: subStage.workflow_stage_id,
        approval_role: 'production',
        approval_type: 'stage_transition',
        sub_stage_id: subStage.id,
        stage_name: subStage.name
      },
      created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
    });
  }
  
  // Write to file
  const outputPath = path.join(__dirname, '../sample-data/14-approvals.json');
  fs.writeFileSync(outputPath, JSON.stringify(approvalRequests, null, 2));
  
  console.log(`Successfully generated ${approvalRequests.length} sample approval requests`);
  console.log(`Output written to: ${outputPath}`);
  console.log('');
  console.log('To use these approvals in your database:');
  console.log('1. Make sure your database is set up and running');
  console.log('2. Use the database seeder to import this data, or');
  console.log('3. Manually insert these records into your reviews table');
  
  // Show summary
  const pendingCount = approvalRequests.filter(a => a.status === 'pending').length;
  const approvedCount = approvalRequests.filter(a => a.status === 'approved').length;
  const rejectedCount = approvalRequests.filter(a => a.status === 'rejected').length;
  
  console.log('');
  console.log('Summary:');
  console.log(`- Pending approvals: ${pendingCount}`);
  console.log(`- Approved approvals: ${approvedCount}`);
  console.log(`- Rejected approvals: ${rejectedCount}`);
}

// Run the script
generateSampleApprovals();