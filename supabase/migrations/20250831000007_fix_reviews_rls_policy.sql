-- Fix Reviews RLS Policy Type Casting Issue
-- This migration fixes the type casting error in the reviews policy

-- Drop the problematic reviews policies
DROP POLICY IF EXISTS "Users can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can modify reviews" ON reviews;

-- Recreate the reviews policies with correct type casting
CREATE POLICY "Users can view reviews" ON reviews
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            reviewer_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM workflow_stages 
                WHERE id = (
                    SELECT current_stage_id FROM projects WHERE id = reviews.project_id
                )
                AND get_current_user_role()::user_role = ANY(responsible_roles)
            )
        )
    );

CREATE POLICY "Users can modify reviews" ON reviews
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            reviewer_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM workflow_stages 
                WHERE id = (
                    SELECT current_stage_id FROM projects WHERE id = reviews.project_id
                )
                AND get_current_user_role()::user_role = ANY(responsible_roles)
            )
        )
    );
