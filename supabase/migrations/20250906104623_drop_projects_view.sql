-- Migration: Drop projects_view table
-- Date: 2025-09-06
-- Description: Remove the denormalized projects_view since we've migrated to relational approach

/*
CLEANUP SUMMARY:
===============

Since we've migrated from the denormalized projects_view approach to using
the projects table with proper relational lookups, the projects_view is no
longer needed and should be dropped to:

1. Eliminate data redundancy
2. Improve database performance
3. Reduce maintenance overhead
4. Clean up the schema

The projects_view was created to flatten related data (organizations, workflow_stages)
but we've moved to a cleaner approach using the projects table with proper joins.

NEW APPROACH:
- Use projects.customer_organization_id → organizations table
- Use projects.point_of_contacts[] → contacts table
- Use projects.current_stage_id → workflow_stages table
- Proper relational database design
*/

-- Drop the projects_view since it's no longer needed
DROP VIEW IF EXISTS "public"."projects_view";

-- Note: This migration is safe to run as the application has been updated
-- to use the projects table with proper relational joins instead of the view.
