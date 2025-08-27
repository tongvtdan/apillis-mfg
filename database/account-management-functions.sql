-- Factory Pulse Account Management Functions
-- Additional helper functions for managing user accounts

-- Function to reset user password
CREATE OR REPLACE FUNCTION reset_user_password(
    user_email TEXT,
    new_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_auth_id UUID;
BEGIN
    -- Get the auth user ID
    SELECT auth_user_id INTO user_auth_id 
    FROM public.users 
    WHERE email = user_email;
    
    IF user_auth_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    -- Update password in auth.users
    UPDATE auth.users 
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = user_auth_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deactivate user account
CREATE OR REPLACE FUNCTION deactivate_user_account(user_email TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    user_auth_id UUID;
BEGIN
    -- Get the auth user ID
    SELECT auth_user_id INTO user_auth_id 
    FROM public.users 
    WHERE email = user_email;
    
    IF user_auth_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    -- Deactivate in users table
    UPDATE public.users 
    SET is_active = false, updated_at = NOW()
    WHERE email = user_email;
    
    -- Disable in auth.users (optional - comment out if you want to keep auth active)
    -- UPDATE auth.users 
    -- SET banned_until = '2099-12-31'::timestamp
    -- WHERE id = user_auth_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reactivate user account
CREATE OR REPLACE FUNCTION reactivate_user_account(user_email TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    user_auth_id UUID;
BEGIN
    -- Get the auth user ID
    SELECT auth_user_id INTO user_auth_id 
    FROM public.users 
    WHERE email = user_email;
    
    IF user_auth_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    -- Reactivate in users table
    UPDATE public.users 
    SET is_active = true, updated_at = NOW()
    WHERE email = user_email;
    
    -- Remove ban from auth.users (if previously banned)
    UPDATE auth.users 
    SET banned_until = NULL
    WHERE id = user_auth_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user permissions
CREATE OR REPLACE FUNCTION update_user_permissions(
    user_email TEXT,
    new_permissions TEXT[]
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.users 
    SET permissions = new_permissions, updated_at = NOW()
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user login history (requires auth audit log)
CREATE OR REPLACE FUNCTION get_user_login_history(
    user_email TEXT,
    days_back INTEGER DEFAULT 30
) RETURNS TABLE (
    login_time TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    user_agent TEXT
) AS $$
DECLARE
    user_auth_id UUID;
BEGIN
    -- Get the auth user ID
    SELECT auth_user_id INTO user_auth_id 
    FROM public.users 
    WHERE email = user_email;
    
    IF user_auth_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    -- This would require audit logging to be enabled
    -- Return placeholder for now
    RETURN QUERY
    SELECT 
        NOW() as login_time,
        '127.0.0.1'::TEXT as ip_address,
        'Browser'::TEXT as user_agent
    WHERE FALSE; -- No results until audit logging is implemented
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk update user department
CREATE OR REPLACE FUNCTION bulk_update_department(
    old_department TEXT,
    new_department TEXT
) RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.users 
    SET department = new_department, updated_at = NOW()
    WHERE department = old_department AND account_type = 'internal';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get department summary
CREATE OR REPLACE FUNCTION get_department_summary()
RETURNS TABLE (
    department TEXT,
    total_users BIGINT,
    active_users BIGINT,
    managers BIGINT,
    staff BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.department,
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE u.is_active = true) as active_users,
        COUNT(*) FILTER (WHERE u.system_access_level IN ('Manager', 'Director', 'Executive')) as managers,
        COUNT(*) FILTER (WHERE u.system_access_level = 'Standard User') as staff
    FROM public.users u
    WHERE u.account_type = 'internal' AND u.department IS NOT NULL
    GROUP BY u.department
    ORDER BY u.department;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate user permissions
CREATE OR REPLACE FUNCTION user_has_permission(
    user_email TEXT,
    required_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_permissions TEXT[];
BEGIN
    SELECT permissions INTO user_permissions
    FROM public.users 
    WHERE email = user_email AND is_active = true;
    
    IF user_permissions IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN required_permission = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's direct reports
CREATE OR REPLACE FUNCTION get_user_direct_reports(user_email TEXT)
RETURNS TABLE (
    report_name TEXT,
    report_email TEXT,
    report_position TEXT,
    report_department TEXT
) AS $$
DECLARE
    manager_name TEXT;
BEGIN
    -- Get manager's full name
    SELECT full_name INTO manager_name
    FROM public.users 
    WHERE email = user_email;
    
    IF manager_name IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    -- Find direct reports
    RETURN QUERY
    SELECT 
        u.full_name,
        u.email,
        u.position,
        u.department
    FROM public.users u
    WHERE u.direct_manager LIKE '%' || manager_name || '%'
    AND u.is_active = true
    ORDER BY u.department, u.position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION reset_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_user_account(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_user_account(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_permissions(TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_login_history(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_department(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_department_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_permission(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_direct_reports(TEXT) TO authenticated;

-- Create additional RLS policies for admin functions
CREATE POLICY "Managers can view their direct reports" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users manager
            WHERE manager.auth_user_id = auth.uid()
            AND (
                users.direct_manager LIKE '%' || manager.full_name || '%'
                OR manager.system_access_level IN ('Director', 'Executive')
            )
        )
    );

-- Example usage queries (commented out)
/*
-- Reset password example
SELECT reset_user_password('nguyen.huong@factoryplus.com', 'NewPassword2024!');

-- Deactivate user example
SELECT deactivate_user_account('old.employee@factoryplus.com');

-- Update permissions example
SELECT update_user_permissions(
    'hoang.tuan@factoryplus.com', 
    ARRAY['Review technical designs', 'Access CAD systems', 'New permission']
);

-- Get department summary
SELECT * FROM get_department_summary();

-- Check user permission
SELECT user_has_permission('vo.mai@factoryplus.com', 'Approve design changes');

-- Get direct reports
SELECT * FROM get_user_direct_reports('tran.minh@factoryplus.com');
*/