-- Final fix for UID mismatch between auth.users and users table
-- This approach directly updates the user ID without creating duplicates

-- Drop the old function
DROP FUNCTION IF EXISTS fix_user_id_mismatch(UUID, UUID);

-- Create a function that directly updates the user ID
CREATE OR REPLACE FUNCTION fix_user_id_mismatch(
    old_user_id UUID,
    new_user_id UUID
) RETURNS VOID AS $$
BEGIN
    -- First, update all foreign key references to point to the new user ID
    UPDATE project_assignments SET user_id = new_user_id WHERE user_id = old_user_id;
    UPDATE projects SET assigned_to = new_user_id WHERE assigned_to = old_user_id;
    UPDATE projects SET created_by = new_user_id WHERE created_by = old_user_id;
    UPDATE documents SET uploaded_by = new_user_id WHERE uploaded_by = old_user_id;
    UPDATE messages SET sender_user_id = new_user_id WHERE sender_user_id = old_user_id;
    UPDATE messages SET recipient_user_id = new_user_id WHERE recipient_user_id = old_user_id;
    UPDATE reviews SET reviewer_id = new_user_id WHERE reviewer_id = old_user_id;
    UPDATE notifications SET user_id = new_user_id WHERE user_id = old_user_id;
    UPDATE activity_log SET user_id = new_user_id WHERE user_id = old_user_id;
    UPDATE users SET direct_manager_id = new_user_id WHERE direct_manager_id = old_user_id;
    
    -- Update direct_reports arrays
    UPDATE users 
    SET direct_reports = array_replace(direct_reports, old_user_id, new_user_id)
    WHERE old_user_id = ANY(direct_reports);
    
    -- Finally, update the users table ID directly
    UPDATE users SET id = new_user_id WHERE id = old_user_id;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION fix_user_id_mismatch(UUID, UUID) TO service_role;

-- Comment on the function
COMMENT ON FUNCTION fix_user_id_mismatch(UUID, UUID) IS 'Fixes UID mismatch by updating all foreign key references first, then updating the user ID directly';
