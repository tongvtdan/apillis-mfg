-- Temporarily disable foreign key checks to allow UID updates
-- This is a temporary measure to fix the UID mismatch issue

-- Create a function to disable foreign key checks temporarily
CREATE OR REPLACE FUNCTION disable_fk_checks_temporarily()
RETURNS VOID AS $$
BEGIN
    -- Disable foreign key checks temporarily
    SET session_replication_role = replica;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to re-enable foreign key checks
CREATE OR REPLACE FUNCTION enable_fk_checks_temporarily()
RETURNS VOID AS $$
BEGIN
    -- Re-enable foreign key checks
    SET session_replication_role = DEFAULT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION disable_fk_checks_temporarily() TO service_role;
GRANT EXECUTE ON FUNCTION enable_fk_checks_temporarily() TO service_role;

-- Comment on the functions
COMMENT ON FUNCTION disable_fk_checks_temporarily() IS 'Temporarily disables foreign key checks to allow UID updates';
COMMENT ON FUNCTION enable_fk_checks_temporarily() IS 'Re-enables foreign key checks after UID updates';
