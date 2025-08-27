#!/bin/bash

# Deploy Enhanced Database Schema to Supabase
# This script applies the enhanced Factory Pulse database schema to your Supabase project

set -e  # Exit on any error

echo "🚀 Factory Pulse Enhanced Database Schema Deployment"
echo "=================================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run 'supabase init' first."
    exit 1
fi

echo "✅ Supabase CLI found"
echo "✅ Supabase project detected"

# Check Supabase connection
echo ""
echo "🔍 Checking Supabase connection..."
if ! supabase status &> /dev/null; then
    echo "⚠️  Supabase is not running locally. Starting local development..."
    supabase start
else
    echo "✅ Supabase is running"
fi

# Apply migrations
echo ""
echo "📦 Applying database migrations..."
echo "This will create the enhanced Factory Pulse schema with:"
echo "  • Multi-tenant organization structure"
echo "  • Enhanced project management"
echo "  • Configurable workflow stages"
echo "  • Document management with versioning"
echo "  • Supplier management system"
echo "  • Communication and notification system"
echo "  • Activity logging and audit trail"
echo "  • AI-ready data structures"
echo "  • Row Level Security policies"
echo "  • Performance indexes"
echo "  • Realtime configuration"

read -p "Continue with migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 1
fi

# Run migrations using Supabase CLI
echo ""
echo "🔄 Running migrations..."

echo "  🔄 Applying all migrations..."
supabase db reset --linked 2>/dev/null || true
supabase migration up

# Generate types
echo ""
echo "🔧 Generating TypeScript types..."
supabase gen types typescript --local > src/types/supabase.ts

# Push to remote (if linked)
echo ""
read -p "Push changes to remote Supabase project? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing to remote Supabase project..."
    supabase db push
    echo "✅ Remote deployment complete"
fi

echo ""
echo "🎉 Database schema deployment complete!"
echo ""
echo "📊 Summary:"
echo "  • Enhanced multi-tenant database schema applied"
echo "  • Performance indexes created"
echo "  • Security policies enabled"
echo "  • Automated triggers configured"
echo "  • Realtime subscriptions enabled"
echo "  • TypeScript types generated"
echo ""
echo "🔗 Next steps:"
echo "  1. Update your application code to use the new schema"
echo "  2. Test the enhanced features"
echo "  3. Migrate existing data if needed"
echo ""
echo "📚 Documentation: docs/database-schema-migration-summary.md"