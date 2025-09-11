# Project Submission Error Fix - 2025-09-09

## Issue Description
The project submission was failing silently when users tried to submit a new RFQ through the UI, even though the test script worked correctly. The logs showed that the process was getting to the project insertion step but then failing without showing an error message to the user.

## Root Cause Analysis
1. The project creation process was failing due to a foreign key constraint violation in the database
2. The error was being logged to the console but not properly propagated to the UI
3. The specific error was related to the `customer_organization_id` field in the projects table, which has a foreign key constraint that references the organizations table

## Technical Details
Looking at the database schema:
```sql
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    customer_organization_id UUID NOT NULL REFERENCES organizations(id),  -- This field caused the constraint violation
    -- ... other fields
);
```

The error handling in the `useProjects.ts` hook was catching the database errors but not properly propagating them to the UI.

## Fix Implementation
1. Enhanced error handling in `useProjects.ts` to provide more specific error messages for foreign key constraint violations
2. Improved error propagation in `projectIntakeService.ts` to ensure errors are properly passed up the call stack

## Changes Made
1. **src/hooks/useProjects.ts**: Enhanced error handling to provide more specific error messages for foreign key constraint violations
2. **src/services/projectIntakeService.ts**: Improved error propagation to ensure errors are properly passed up the call stack

## Verification
After implementing these changes, the error messages should now be properly displayed to users when project submission fails, allowing them to understand what went wrong and how to fix it.