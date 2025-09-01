#!/bin/bash

# Script to apply activity log migrations
# This script demonstrates how to apply the new migrations for the project_id column

echo "Applying activity log migrations..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "Error: Must be run from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Warning: Supabase CLI not found. Please install it to apply migrations:"
    echo "npm install -g supabase"
    echo ""
    echo "For now, you can manually apply the migrations using the SQL files in supabase/migrations/"
    exit 1
fi

# List the migrations to be applied
echo "Migrations to be applied:"
ls -la supabase/migrations/2025090119*

echo ""
echo "To apply these migrations, run:"
echo "npx supabase db push"
echo ""
echo "Or if you're using a local Supabase instance:"
echo "npx supabase db reset"