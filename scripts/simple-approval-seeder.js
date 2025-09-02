#!/usr/bin/env node

// Simple script to insert sample approval requests into the database
// This avoids complex queries that might trigger the column ambiguity issue

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key for more permissions
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Using service role key instead of anon key
);

async function seedSimpleApprovals() {
    console.log('Seeding simple approval requests to database...');

    try {
        // First, let's get some basic data we need
        // Get users by role
        const { data: engineers, error: engineersError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'engineering')
            .limit(3);

        if (engineersError) {
            console.error('Error fetching engineers:', engineersError.message);
            return;
        }

        const { data: productionUsers, error: productionError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'production')
            .limit(3);

        if (productionError) {
            console.error('Error fetching production users:', productionError.message);
            return;
        }

        const { data: qaUsers, error: qaError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'qa')
            .limit(3);

        if (qaError) {
            console.error('Error fetching QA users:', qaError.message);
            return;
        }

        const { data: managementUsers, error: managementError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'management')
            .limit(3);

        if (managementError) {
            console.error('Error fetching management users:', managementError.message);
            return;
        }

        // Get some projects (using a very simple query)
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, organization_id')
            .limit(10);

        if (projectsError) {
            console.error('Error fetching projects:', projectsError.message);
            return;
        }

        console.log(`Found ${engineers.length} engineers, ${productionUsers.length} production users, ${qaUsers.length} QA users, ${managementUsers.length} management users`);
        console.log(`Found ${projects.length} projects`);

        // Create simple approval requests
        const approvalRequests = [];
        const now = new Date();

        // Create approvals for different roles
        // Engineering approvals
        for (let i = 0; i < Math.min(engineers.length, projects.length, 3); i++) {
            approvalRequests.push({
                project_id: projects[i].id,
                reviewer_id: engineers[i].id,
                review_type: 'stage_approval_engineering',
                status: 'pending',
                priority: 'medium',
                comments: `Please review and approve the technical design for project ${i + 1}`,
                organization_id: projects[i].organization_id,
                due_date: new Date(now.getTime() + (3 + i) * 24 * 60 * 60 * 1000).toISOString(), // 3-5 days from now
                metadata: {
                    approval_role: 'engineering',
                    approval_type: 'stage_transition',
                    stage_name: 'Design Review' // Adding stage_name to fix the "Unknown Stage" issue
                },
                created_at: new Date(now.getTime() - i * 3600 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - i * 3600 * 1000).toISOString()
            });
        }

        // Production approvals
        for (let i = 0; i < Math.min(productionUsers.length, projects.length, 3); i++) {
            approvalRequests.push({
                project_id: projects[(i + 3) % projects.length].id,
                reviewer_id: productionUsers[i].id,
                review_type: 'stage_approval_production',
                status: 'pending',
                priority: 'high',
                comments: `Please review and approve the production plan for project ${i + 4}`,
                organization_id: projects[(i + 3) % projects.length].organization_id,
                due_date: new Date(now.getTime() + (2 + i) * 24 * 60 * 60 * 1000).toISOString(), // 2-4 days from now
                metadata: {
                    approval_role: 'production',
                    approval_type: 'stage_transition',
                    stage_name: 'Production Planning' // Adding stage_name to fix the "Unknown Stage" issue
                },
                created_at: new Date(now.getTime() - (i + 1) * 3600 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - (i + 1) * 3600 * 1000).toISOString()
            });
        }

        // QA approvals
        for (let i = 0; i < Math.min(qaUsers.length, projects.length, 3); i++) {
            approvalRequests.push({
                project_id: projects[(i + 6) % projects.length].id,
                reviewer_id: qaUsers[i].id,
                review_type: 'stage_approval_qa',
                status: 'pending',
                priority: 'medium',
                comments: `Please review and approve the quality requirements for project ${i + 7}`,
                organization_id: projects[(i + 6) % projects.length].organization_id,
                due_date: new Date(now.getTime() + (1 + i) * 24 * 60 * 60 * 1000).toISOString(), // 1-3 days from now
                metadata: {
                    approval_role: 'qa',
                    approval_type: 'stage_transition',
                    stage_name: 'Quality Assurance' // Adding stage_name to fix the "Unknown Stage" issue
                },
                created_at: new Date(now.getTime() - (i + 2) * 3600 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - (i + 2) * 3600 * 1000).toISOString()
            });
        }

        // Management approvals
        for (let i = 0; i < Math.min(managementUsers.length, projects.length, 2); i++) {
            approvalRequests.push({
                project_id: projects[(i + 9) % projects.length].id,
                reviewer_id: managementUsers[i].id,
                review_type: 'stage_approval_management',
                status: 'pending',
                priority: 'high',
                comments: `Please review and approve the project budget and timeline for project ${i + 10}`,
                organization_id: projects[(i + 9) % projects.length].organization_id,
                due_date: new Date(now.getTime() + (4 + i) * 24 * 60 * 60 * 1000).toISOString(), // 4-5 days from now
                metadata: {
                    approval_role: 'management',
                    approval_type: 'stage_transition',
                    stage_name: 'Project Approval' // Adding stage_name to fix the "Unknown Stage" issue
                },
                created_at: new Date(now.getTime() - (i + 3) * 3600 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - (i + 3) * 3600 * 1000).toISOString()
            });
        }

        // Add some approved and rejected approvals for variety
        if (engineers.length > 0 && projects.length > 0) {
            approvalRequests.push({
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
                    approval_role: 'engineering',
                    approval_type: 'stage_transition',
                    stage_name: 'Design Review' // Adding stage_name to fix the "Unknown Stage" issue
                },
                created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
            });

            approvalRequests.push({
                project_id: projects[1].id,
                reviewer_id: productionUsers[0].id,
                review_type: 'stage_approval_production',
                status: 'rejected',
                priority: 'high',
                comments: 'Production capacity is insufficient for this timeline.',
                decision_reason: 'Cannot meet required delivery date with current capacity.',
                organization_id: projects[1].organization_id,
                completed_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
                metadata: {
                    approval_role: 'production',
                    approval_type: 'stage_transition',
                    stage_name: 'Production Planning' // Adding stage_name to fix the "Unknown Stage" issue
                },
                created_at: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
                updated_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString()
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
                console.log(`${index + 1}. Approval ID: ${approval.id} for ${approvalRequests[index].review_type} - Status: ${approval.status}`);
            });
        } else {
            console.log('No approval requests to create');
        }

        console.log('Simple approval seeding complete!');

    } catch (error) {
        console.error('Error seeding simple approvals:', error.message);
    }
}

// Run the script
seedSimpleApprovals();