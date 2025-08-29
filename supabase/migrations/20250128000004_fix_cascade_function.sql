-- Fix the cascade update function to handle foreign key constraints properly
-- The order of updates matters - we need to update foreign key references first

-- Drop the old function
DROP FUNCTION IF EXISTS update_user_id_cascade(UUID, UUID);

-- Create a corrected function that updates foreign key references first
CREATE OR REPLACE FUNCTION update_user_id_cascade(
    old_user_id UUID,
    new_user_id UUID
) RETURNS VOID AS $$
BEGIN
    -- First, update all foreign key references in other tables
    -- Update project_assignments table
    UPDATE project_assignments SET user_id = new_user_id WHERE user_id = old_user_id;
    
    -- Update projects table (assigned_to and created_by)
    UPDATE projects SET assigned_to = new_user_id WHERE assigned_to = old_user_id;
    UPDATE projects SET created_by = new_user_id WHERE created_by = old_user_id;
    
    -- Update documents table
    UPDATE documents SET uploaded_by = new_user_id WHERE uploaded_by = old_user_id;
    
    -- Update messages table
    UPDATE messages SET sender_user_id = new_user_id WHERE sender_user_id = old_user_id;
    UPDATE messages SET recipient_user_id = new_user_id WHERE recipient_user_id = old_user_id;
    
    -- Update reviews table
    UPDATE reviews SET reviewer_id = new_user_id WHERE reviewer_id = old_user_id;
    
    -- Update notifications table
    UPDATE notifications SET user_id = new_user_id WHERE user_id = old_user_id;
    
    -- Update activity_log table
    UPDATE activity_log SET user_id = new_user_id WHERE user_id = old_user_id;
    
    -- Update users table (direct_manager_id and direct_reports)
    UPDATE users SET direct_manager_id = new_user_id WHERE direct_manager_id = old_user_id;
    
    -- Update direct_reports array in users table
    UPDATE users 
    SET direct_reports = array_replace(direct_reports, old_user_id, new_user_id)
    WHERE old_user_id = ANY(direct_reports);
    
    -- Finally, update the users table itself
    UPDATE users SET id = new_user_id WHERE id = old_user_id;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_id_cascade(UUID, UUID) TO service_role;

-- Comment on the function
COMMENT ON FUNCTION update_user_id_cascade(UUID, UUID) IS 'Updates user ID across all related tables to fix UID mismatches between auth.users and users table. Updates foreign keys first, then the users table.';
