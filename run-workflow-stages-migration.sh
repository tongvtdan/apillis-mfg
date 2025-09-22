#!/bin/bash

# Migration Script: Initialize Complete Workflow System
# This script initializes all workflow-related tables for proper project functionality

echo "🔄 Initializing complete workflow system for organizations..."
echo ""

# Run the basic workflow stages first
echo "Step 1: Creating workflow stages..."
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f seed_workflow_stages.sql

echo ""
echo "Step 2: Creating complete workflow system (definitions, sub-stages, etc.)..."
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f seed_complete_workflow_system.sql

echo ""
echo "✅ Migration completed!"
echo ""
echo "🎉 Complete workflow system has been seeded!"
echo ""
echo "What was created:"
echo "  - Workflow definitions"
echo "  - Workflow stages (8 main stages)"
echo "  - Workflow sub-stages (multiple per stage)"
echo "  - Links between workflows, stages, and sub-stages"
echo ""
echo "To verify the migration worked:"
echo "1. Check that all workflow tables have data"
echo "2. Try creating a new project - it should now work without errors"
echo "3. Check the project detail view to see sub-stage progress"
echo ""
echo "If you need to run this on a remote database, update the connection string accordingly."
echo "Or use the Supabase SQL Editor to run the .sql files directly."
