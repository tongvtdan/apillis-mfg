-- Final fix for UID mismatch between auth.users and users table
-- This approach creates new user records with correct IDs and then updates references

-- Drop the old function
DROP FUNCTION IF EXISTS update_user_id_cascade(UUID, UUID);

-- Create a function that properly handles the UID mismatch
CREATE OR REPLACE FUNCTION fix_user_id_mismatch(
    old_user_id UUID,
    new_user_id UUID
) RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Get the user record from the old ID
    SELECT * INTO user_record FROM users WHERE id = old_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with ID % not found', old_user_id;
    END IF;
    
    -- Create a new user record with the new ID
    INSERT INTO users (
        id, organization_id, email, name, role, department, phone, 
        avatar_url, status, description, employee_id, direct_manager_id, 
        direct_reports, last_login_at, preferences, created_at, updated_at
    ) VALUES (
        new_user_id, user_record.organization_id, user_record.email, user_record.name, 
        user_record.role, user_record.department, user_record.phone, 
        user_record.avatar_url, user_record.status, user_record.description, 
        user_record.employee_id, user_record.direct_manager_id, 
        user_record.direct_reports, user_record.last_login_at, 
        user_record.preferences, user_record.created_at, NOW()
    );
    
    -- Update all foreign key references to point to the new user ID
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
    
    -- Finally, delete the old user record
    DELETE FROM users WHERE id = old_user_id;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION fix_user_id_mismatch(UUID, UUID) TO service_role;

-- Comment on the function
COMMENT ON FUNCTION fix_user_id_mismatch(UUID, UUID) IS 'Fixes UID mismatch by creating new user record with correct ID and updating all references, then deleting old record';
