# Workflow System Setup

## Problem
The project creation is failing because there are no workflow-related tables populated for your organization. The console shows the initialization being triggered repeatedly, but the stages aren't being created.

## What Tables Need Seeding

Based on your database schema, these tables need data for projects to work properly:

1. **`workflow_stages`** - Main workflow stages (inquiry_received, technical_review, etc.)
2. **`workflow_definitions`** - Workflow definitions that group stages together
3. **`workflow_sub_stages`** - Sub-stages within each main stage
4. **`workflow_definition_stages`** - Links workflows to stages
5. **`workflow_definition_sub_stages`** - Links workflows to sub-stages

## Solution
You need to seed all workflow-related tables for your organization. There are two approaches:

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
- Creates **complete workflow system** including:
  - 1 workflow definition ("Default Manufacturing Workflow")
  - 8 main workflow stages for organization `550e8400-e29b-41d4-a716-446655440000`
  - 20+ sub-stages across all main stages
  - All necessary links between workflows, stages, and sub-stages
- Stages include: inquiry_received, technical_review, supplier_rfq_sent, quoted, order_confirmed, procurement_planning, in_production, shipped_closed
- Each stage/sub-stage has appropriate duration, responsible roles, and metadata
- **Project creation, sub-stage progress tracking, and workflow management** should all work after running this

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
