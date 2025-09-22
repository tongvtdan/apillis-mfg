#!/bin/bash

# Quick Seed Script Runner
# Run this after starting your local Supabase or connecting to your database

echo "🔄 Running Workflow System Seed Scripts..."
echo ""

# Check if we're using local or remote database
if [ -n "$DB_URL" ]; then
    echo "Using DB_URL from environment: $DB_URL"
    CONNECTION_STRING="$DB_URL"
elif [ -n "$DATABASE_URL" ]; then
    echo "Using DATABASE_URL from environment"
    CONNECTION_STRING="$DATABASE_URL"
else
    echo "Using local database connection"
    CONNECTION_STRING="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
fi

echo "Connection string: $CONNECTION_STRING"
echo ""

# Run the seed scripts
echo "📝 Step 1: Creating basic workflow stages..."
psql "$CONNECTION_STRING" -f seed_workflow_stages.sql

echo ""
echo "📝 Step 2: Creating complete workflow system..."
psql "$CONNECTION_STRING" -f seed_complete_workflow_system.sql

echo ""
echo "✅ Seed completed!"
echo ""
echo "🎉 Your workflow system is now ready!"
echo ""
echo "You can now:"
echo "1. Create new projects without errors"
echo "2. See sub-stage progress in project details"
echo "3. Use workflow management features"
echo ""
echo "Try creating a test project to verify everything works!"
