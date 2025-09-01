-- Fix Users RLS Circular Dependency Issue
-- This migration removes the problematic circular dependency policy

-- Drop the problematic policy that creates circular dependency
DROP POLICY IF EXISTS "Users can view users in their org" ON users;

-- The remaining policies should be sufficient:
-- 1. "Users can view their own profile" - allows users to fetch their own profile
-- 2. "Users can view other users in their org" - allows role-based access to other users
-- 3. "Users can update their own profile" - allows users to update their own profile
-- 4. "Users can create profiles" - allows admin/management to create profiles
