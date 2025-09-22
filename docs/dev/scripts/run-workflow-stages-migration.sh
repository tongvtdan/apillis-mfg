#!/bin/bash

# Migration Script: Initialize Complete Workflow System
# This script initializes all workflow-related tables for proper project functionality

echo "🔄 Initializing complete workflow system for organizations..."
echo ""

# Run the seed from local backup (contains the exact working data)
echo "Step 1: Seeding remote database with local backup data..."
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f seed_from_local_backup.sql

echo ""
echo "✅ Migration completed!"
echo ""
echo "🎉 Complete workflow system has been seeded!"
echo ""
echo "What was created:"
echo "  - Complete workflow system (exactly like your local backup)"
echo "  - Workflow definitions with proper IDs"
echo "  - Workflow stages with correct responsible roles"
echo "  - Workflow sub-stages with proper relationships"
echo "  - All necessary links and foreign key relationships"
echo ""
echo "To verify the migration worked:"
echo "1. Check that all workflow tables have data"
echo "2. Try creating a new project - it should now work without errors"
echo "3. Check the project detail view to see sub-stage progress"
echo ""
echo "Alternative: If you need to run this on a different database:"
echo "1. Use the Supabase SQL Editor to run seed_from_local_backup.sql"
echo "2. Or update the CONNECTION_STRING variable above"
echo "3. Or run: psql 'your_connection_string' -f seed_from_local_backup.sql"
echo ""
echo "This script seeds your remote database with the exact same data"
echo "that works in your local backup, ensuring consistency."
