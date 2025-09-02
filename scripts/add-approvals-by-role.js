#!/usr/bin/env node

// Script to add approvals to existing projects by role
// Usage: node add-approvals-by-role.js [role] [count]

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get command line arguments
const args = process.argv.slice(2);
const role = args[0] || 'qa'; // Default to QA if no role specified
const count = parseInt(args[1]) || 5; // Default to 5 approvals if no count specified

// Initialize Supabase client with service role key for more permissions
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addApprovalsByRole(role, count) {
    console.log(`Adding ${count} approvals for ${role} role to existing projects...`);

    try {
        // Get users by role
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('role', role)
            .limit(count);

        if (usersError) {
            console.error(`Error fetching ${role} users:`, usersError.message);
            return;
        }

        if (users.length === 0) {
            console.log(`No ${role} users found in the system`);
            return;
        }

        console.log(`Found ${users.length} ${role} users`);

        // Get current active projects
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, project_id, title, organization_id')
            .limit(count);

        if (projectsError) {
            console.error('Error fetching projects:', projectsError.message);
            return;
        }

        console.log(`Found ${projects.length} projects`);

        // Create approval requests
        const approvalRequests = [];
        const now = new Date();

        // Create approvals for each project
        for (let i = 0; i < Math.min(projects.length, users.length, count); i++) {
            const project = projects[i];
            const user = users[i % users.length];

            approvalRequests.push({
                project_id: project.id,
                reviewer_id: user.id,
                review_type: `stage_approval_${role}`,
                status: 'pending',
                priority: 'medium',
                comments: `Please review and approve ${role} requirements for project ${project.project_id}: ${project.title}`,
                organization_id: project.organization_id,
                due_date: new Date(now.getTime() + (2 + i) * 24 * 60 * 60 * 1000).toISOString(), // 2-4 days from now
                metadata: {
                    approval_role: role,
                    approval_type: 'stage_transition',
                    project_id: project.project_id,
                    project_title: project.title
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
                console.error('Error inserting approval requests:', error.message);
                return;
            }

            console.log(`Successfully created ${approvalRequests.length} approval requests for ${role} users:`);
            data.forEach((approval, index) => {
                const project = projects[index];
                const user = users[index % users.length];
                console.log(`${index + 1}. Project: ${project.project_id} - Assigned to ${role}: ${user.email} - Status: ${approval.status}`);
            });
        } else {
            console.log('No approval requests to create');
        }

        console.log('Approval addition complete!');

    } catch (error) {
        console.error('Error adding approvals to projects:', error.message);
    }
}

// Run the script
addApprovalsByRole(role, count);