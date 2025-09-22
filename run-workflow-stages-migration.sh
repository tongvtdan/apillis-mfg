#!/bin/bash

# Migration Script: Initialize Default Workflow Stages
# This script initializes default workflow stages for organizations that don't have them

echo "🔄 Initializing default workflow stages for organizations..."

# Run the migration using the local database connection
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f init_default_workflow_stages.sql

echo "✅ Migration completed!"
echo ""
echo "To verify the migration worked:"
echo "1. Check that workflow stages were created for your organization"
echo "2. Try creating a new project - it should now work without errors"
echo ""
echo "If you need to run this on a remote database, update the connection string accordingly."
