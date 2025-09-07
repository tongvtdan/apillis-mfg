# Dashboard Summary RPC Function Fix - 2025-01-17

## Issue
The dashboard was showing a 404 error when calling `get_dashboard_summary` RPC function:
```
POST http://127.0.0.1:54321/rest/v1/rpc/get_dashboard_summary 404 (Not Found)
```

## Root Cause
The `get_dashboard_summary` RPC function was missing from the database entirely. The frontend was calling this function but it didn't exist.

## Solution
Created the missing RPC function in migration `20250117000006_add_dashboard_summary_function.sql` with the correct enum values:

### Project Status Values
- `inquiry` - Initial project inquiry
- `reviewing` - Under technical review
- `quoted` - Quote provided to customer
- `confirmed` - Order confirmed
- `procurement` - Procurement phase
- `production` - In production
- `completed` - Project completed
- `cancelled` - Project cancelled

### Priority Level Values
- `low` - Low priority
- `normal` - Normal priority
- `high` - High priority
- `urgent` - Urgent priority

### Project Type Values
- `system_build` - System integration projects
- `fabrication` - Fabrication projects
- `manufacturing` - Manufacturing projects

## Function Features
- Returns JSON with project statistics grouped by status, type, priority, and stage
- Includes recent projects (last 10) with full details
- Uses organization-based filtering for security
- Includes debug information for troubleshooting
- Handles cases where user has no organization

## Testing Results
Function successfully returns data:
- 4 total projects found
- 3 inquiry, 1 reviewing status
- 1 system_build, 2 manufacturing types
- 2 normal, 1 high, 1 urgent priorities
- Recent projects with customer names and delivery dates

## Files Modified
- `supabase/migrations/20250117000006_add_dashboard_summary_function.sql` - New migration file
- Function grants execute permission to authenticated users
- Includes proper security definer and documentation
