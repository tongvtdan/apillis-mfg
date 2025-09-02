#!/usr/bin/env node

// Script to add approvals to specific projects by project ID
// Usage: node add-approvals-to-specific-projects.js [project-id1,project-id2,...] [role]

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get command line arguments
const args = process.argv.slice(2);
const projectIds = args[0] ? args[0].split(',') : []; // Comma-separated project IDs
const role = args[1] || 'qa'; // Default to QA if no role specified

// Initialize Supabase client with service role key for more permissions
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addApprovalsToSpecificProjects(projectIds, role) {
    console.log(`Adding approvals for ${role} role to specific projects: ${projectIds.join(', ')}...`);

    try {
        // Get users by role
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('role', role)
            .limit(5);

        if (usersError) {
            console.error(`Error fetching ${role} users:`, usersError.message);
            return;
        }

        if (users.length === 0) {
            console.log(`No ${role} users found in the system`);
            return;
        }

        console.log(`Found ${users.length} ${role} users`);

        // Get specific projects by IDs
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, project_id, title, organization_id')
            .in('project_id', projectIds);

        if (projectsError) {
            console.error('Error fetching projects:', projectsError.message);
            return;
        }

        if (projects.length === 0) {
            console.log(`No projects found with IDs: ${projectIds.join(', ')}`);
            return;
        }

        console.log(`Found ${projects.length} matching projects`);

        // Create approval requests
        const approvalRequests = [];
        const now = new Date();

        // Create approvals for each project
        for (let i = 0; i < projects.length; i++) {
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
                due_date: new Date(now.getTime() + (3 + i) * 24 * 60 * 60 * 1000).toISOString(), // 3-5 days from now
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

            console.log(`Successfully created ${approvalRequests.length} approval requests:`);
            data.forEach((approval, index) => {
                const project = projects[index];
                const user = users[index % users.length];
                console.log(`${index + 1}. Project: ${project.project_id} (${project.title}) - Assigned to ${role}: ${user.email} - Status: ${approval.status}`);
            });
        } else {
            console.log('No approval requests to create');
        }

        console.log('Approval addition to specific projects complete!');

    } catch (error) {
        console.error('Error adding approvals to specific projects:', error.message);
    }
}

// Example usage if no arguments provided
if (projectIds.length === 0) {
    console.log('Usage: node add-approvals-to-specific-projects.js [project-id1,project-id2,...] [role]');
    console.log('Example: node add-approvals-to-specific-projects.js "P-25012703,P-25012704" qa');
    console.log('Defaulting to example project IDs and QA role for demonstration...');

    // For demonstration, let's use some example project IDs
    addApprovalsToSpecificProjects(['P-25012703', 'P-25012704'], 'qa');
} else {
    // Run with provided arguments
    addApprovalsToSpecificProjects(projectIds, role);
}