-- Add tables to supabase_realtime publication for real-time updates
-- This migration ensures that project updates are properly published for real-time subscriptions

-- Add projects table to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Add other important tables for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE supplier_quotes;

-- Verify the configuration
DO $$
BEGIN
    -- Check if projects table is included in real-time publication
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'projects'
    ) THEN
        RAISE EXCEPTION 'Projects table is not included in supabase_realtime publication';
    END IF;
    
    RAISE NOTICE 'Real-time publication configured successfully for projects table';
END $$;
