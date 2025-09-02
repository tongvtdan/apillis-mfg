#!/usr/bin/env node

// Script to add approvals to existing projects
// This script will create approval requests for QA engineers on current projects

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key for more permissions
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addApprovalsToProjects() {
    console.log('Adding approvals to existing projects...');

    try {
        // Get QA engineers
        const { data: qaEngineers, error: qaError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('role', 'qa')
            .limit(5);

        if (qaError) {
            console.error('Error fetching QA engineers:', qaError.message);
            return;
        }

        if (qaEngineers.length === 0) {
            console.log('No QA engineers found in the system');
            return;
        }

        console.log(`Found ${qaEngineers.length} QA engineers`);

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

        // Create approval requests for QA engineers
        const approvalRequests = [];
        const now = new Date();

        // Create approvals for each project
        for (let i = 0; i < Math.min(projects.length, qaEngineers.length); i++) {
            const project = projects[i];
            const qaEngineer = qaEngineers[i % qaEngineers.length];

            approvalRequests.push({
                project_id: project.id,
                reviewer_id: qaEngineer.id,
                review_type: 'stage_approval_qa',
                status: 'pending',
                priority: 'medium',
                comments: `Please review and approve QA requirements for project ${project.project_id}: ${project.title}`,
                organization_id: project.organization_id,
                due_date: new Date(now.getTime() + (2 + i) * 24 * 60 * 60 * 1000).toISOString(), // 2-4 days from now
                metadata: {
                    approval_role: 'qa',
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

            console.log(`Successfully created ${approvalRequests.length} approval requests for QA engineers:`);
            data.forEach((approval, index) => {
                const project = projects[index];
                const qaEngineer = qaEngineers[index % qaEngineers.length];
                console.log(`${index + 1}. Project: ${project.project_id} - Assigned to QA Engineer: ${qaEngineer.email} - Status: ${approval.status}`);
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
addApprovalsToProjects();