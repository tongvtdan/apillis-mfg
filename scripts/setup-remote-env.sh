#!/bin/bash

# Setup script for remote Supabase CLI operations
# Run this script before using supabase db push

echo "🔧 Setting up environment for remote Supabase CLI..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.remote.example .env
    echo "⚠️  Please edit .env file and add your actual database password and service role key"
    echo "   - DB_PASSWORD: Get from https://supabase.com/dashboard/project/ynhgxwnkpbpzwbtzrzka/settings/database"
    echo "   - SUPABASE_SERVICE_ROLE_KEY: Get from https://supabase.com/dashboard/project/ynhgxwnkpbpzwbtzrzka/settings/api"
    exit 1
fi

# Load environment variables
echo "📖 Loading environment variables..."
source .env

# Check if required variables are set
if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "YOUR_DB_PASSWORD_HERE" ]; then
    echo "❌ DB_PASSWORD not set. Please edit .env file and add your database password."
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ "$SUPABASE_SERVICE_ROLE_KEY" = "YOUR_SERVICE_ROLE_KEY_HERE" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not set. Please edit .env file and add your service role key."
    exit 1
fi

# Set environment variables for Supabase CLI
export SUPABASE_DB_PASSWORD="$DB_PASSWORD"
export SUPABASE_ACCESS_TOKEN="$SUPABASE_SERVICE_ROLE_KEY"

echo "✅ Environment setup complete!"
echo "🚀 You can now run: supabase db push --linked"
echo ""
echo "📋 Available commands:"
echo "   supabase db push --linked          # Apply migrations to remote"
echo "   supabase db diff --linked          # Check differences"
echo "   supabase db reset --linked         # Reset remote database (DANGEROUS!)"
echo "   supabase status --linked           # Check remote status"
