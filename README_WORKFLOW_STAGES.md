# Workflow Stages Setup

## Problem
The project creation is failing because there are no workflow stages defined for your organization. The console shows the initialization being triggered repeatedly, but the stages aren't being created.

## Solution
You need to seed the workflow stages for your organization. There are two approaches:

### Option 1: Run the SQL Seed Script (Recommended)
When your database is available, run the seed script:

```bash
# If using local Supabase (when Docker is running)
supabase db push

# Or run the SQL file directly
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f seed_workflow_stages.sql

# Or if using remote Supabase, run in Supabase SQL Editor
# Copy and paste the contents of seed_workflow_stages.sql into the SQL Editor
```

### Option 2: Start Local Supabase
If you need to use the local database:

```bash
# Start Supabase (requires Docker)
supabase start

# Then run the migration
./run-workflow-stages-migration.sh
```

## What This Fixes
- Creates 8 default workflow stages for organization `550e8400-e29b-41d4-a716-446655440000`
- Stages include: inquiry_received, technical_review, supplier_rfq_sent, quoted, order_confirmed, procurement_planning, in_production, shipped_closed
- Each stage has appropriate duration and responsible roles
- Project creation should work after running this

## Alternative: Use Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `seed_workflow_stages.sql`
4. Run the SQL script
5. Try creating a project again

## Verification
After running the seed script, you should see:
- Console logs showing successful stage creation
- Project creation completing without errors
- No more infinite "Submitting" state

The workflow stages will be automatically created for new organizations going forward, but existing organizations need this manual seeding.
