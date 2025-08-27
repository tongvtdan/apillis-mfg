-- Make customers table unrestricted for all authenticated users
-- This migration disables RLS on customers table or creates permissive policies

-- First, check if customers table exists and enable RLS if not already enabled
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        -- Enable RLS on customers table
        ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
        
        -- Create unrestricted policy for all operations
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Unrestricted access to customers" ON customers;
        
        -- Create new unrestricted policy
        CREATE POLICY "Unrestricted access to customers" ON customers
            FOR ALL 
            TO authenticated
            USING (true)
            WITH CHECK (true);
            
        RAISE NOTICE 'Customers table RLS enabled with unrestricted access policy';
    ELSE
        RAISE NOTICE 'Customers table does not exist, skipping RLS configuration';
    END IF;
END $$;