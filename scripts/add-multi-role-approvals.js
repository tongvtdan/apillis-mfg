#!/usr/bin/env node

// Script to add approvals to existing projects for multiple roles
// This script will create approval requests for engineering, production, and QA roles

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key for more permissions
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addMultiRoleApprovals() {
    console.log('Adding approvals for multiple roles to existing projects...');

    try {
        // Get users by different roles
        const roles = ['engineering', 'production', 'qa', 'management'];
        const usersByRole = {};

        for (const role of roles) {
            const { data: users, error } = await supabase
                .from('users')
                .select('id, email, role')
                .eq('role', role)
                .limit(3);

            if (error) {
                console.error(`Error fetching ${role} users:`, error.message);
                continue;
            }

            usersByRole[role] = users;
            console.log(`Found ${users.length} ${role} users`);
        }

        // Get current active projects
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, project_id, title, organization_id')
            .limit(10);

        if (projectsError) {
            console.error('Error fetching projects:', projectsError.message);
            return;
        }

        console.log(`Found ${projects.length} projects`);

        // Create approval requests for all roles
        const approvalRequests = [];
        const now = new Date();

        // Create approvals for each role
        for (const role of roles) {
            const users = usersByRole[role];
            if (!users || users.length === 0) continue;

            // Create approvals for this role
            for (let i = 0; i < Math.min(projects.length, users.length, 2); i++) {
                const project = projects[i];
                const user = users[i % users.length];

                approvalRequests.push({
                    project_id: project.id,
                    reviewer_id: user.id,
                    review_type: `stage_approval_${role}`,
                    status: 'pending',
                    priority: role === 'production' || role === 'management' ? 'high' : 'medium',
                    comments: `Please review and approve ${role} requirements for project ${project.project_id}: ${project.title}`,
                    organization_id: project.organization_id,
                    due_date: new Date(now.getTime() + (2 + i) * 24 * 60 * 60 * 1000).toISOString(), // 2-4 days from now
                    metadata: {
                        approval_role: role,
                        approval_type: 'stage_transition',
                        project_id: project.project_id,
                        project_title: project.title
                    },
                    created_at: new Date(now.getTime() - i * 3600 * 1000).toISOString(),
                    updated_at: new Date(now.getTime() - i * 3600 * 1000).toISOString()
                });
            }
        }

        // Insert the approval requests
        if (approvalRequests.length > 0) {
            const { data, error } = await supabase
                .from('reviews')
                .insert(approvalRequests)
                .select();

            if (error) {
                console.error('Error inserting approval requests:', error.message);
                return;
            }

            console.log(`Successfully created ${approvalRequests.length} approval requests for multiple roles:`);
            data.forEach((approval, index) => {
                const req = approvalRequests[index];
                const user = Object.values(usersByRole).flat().find(u => u.id === req.reviewer_id);
                const project = projects.find(p => p.id === req.project_id);
                console.log(`${index + 1}. Project: ${project.project_id} - Role: ${req.metadata.approval_role} - Assigned to: ${user?.email || 'Unknown'} - Status: ${approval.status}`);
            });
        } else {
            console.log('No approval requests to create');
        }

        console.log('Multi-role approval addition complete!');

    } catch (error) {
        console.error('Error adding multi-role approvals to projects:', error.message);
    }
}

// Run the script
addMultiRoleApprovals();