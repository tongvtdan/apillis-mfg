-- Check if real-time is properly configured
-- Run this script in your Supabase database to verify real-time setup

-- Check if realtime extension is enabled
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname = 'realtime';

-- Check if supabase_realtime publication exists
SELECT 
    pubname as publication_name,
    puballtables as all_tables,
    pubinsert as insert_enabled,
    pubupdate as update_enabled,
    pubdelete as delete_enabled
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- Check which tables are included in the realtime publication
SELECT 
    p.pubname as publication_name,
    c.relname as table_name,
    c.relnamespace::regnamespace as schema_name
FROM pg_publication p
JOIN pg_publication_tables pt ON p.oid = pt.pubpubid
JOIN pg_class c ON pt.pubtable = c.oid
WHERE p.pubname = 'supabase_realtime'
ORDER BY c.relname;

-- Check if projects table is specifically included
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_publication p
            JOIN pg_publication_tables pt ON p.oid = pt.pubpubid
            JOIN pg_class c ON pt.pubtable = c.oid
            WHERE p.pubname = 'supabase_realtime' 
            AND c.relname = 'projects'
        ) 
        THEN 'projects table IS included in realtime publication'
        ELSE 'projects table is NOT included in realtime publication'
    END as realtime_status;

-- Check recent activity on projects table
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE tablename = 'projects';

-- Check if there are any active realtime subscriptions
SELECT 
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE application_name LIKE '%realtime%' 
   OR query LIKE '%realtime%'
   OR query LIKE '%supabase%'
ORDER BY query_start DESC;
