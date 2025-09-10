-- =========================================
-- Fix Organizations RLS Policies
-- Migration: Correct RLS policies for organizations table
-- =========================================

-- Drop the incorrect policies
DROP POLICY IF EXISTS "org_select_policy" ON organizations;
DROP POLICY IF EXISTS "org_insert_policy" ON organizations;
DROP POLICY IF EXISTS "org_update_policy" ON organizations;
DROP POLICY IF EXISTS "org_delete_policy" ON organizations;

-- Create correct policies using proper Supabase authentication
CREATE POLICY "org_select_policy" ON organizations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_insert_policy" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "org_update_policy" ON organizations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_delete_policy" ON organizations FOR DELETE USING (auth.uid() IS NOT NULL);
