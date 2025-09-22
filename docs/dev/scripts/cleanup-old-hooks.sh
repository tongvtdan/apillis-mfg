#!/bin/bash

# Script to clean up old hooks directory after refactoring
# This should be run only after confirming all imports have been updated

echo "🧹 Starting cleanup of old hooks directory..."

# Check if any files still import from the old hooks directory
echo "🔍 Checking for remaining imports from old hooks directory..."
remaining_imports=$(grep -r "from \"@/hooks/" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | wc -l)

if [ $remaining_imports -gt 0 ]; then
    echo "⚠️  Warning: Found $remaining_imports files still importing from old hooks directory"
    echo "📋 List of files with remaining imports:"
    grep -r "from \"@/hooks/" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"
    echo ""
    echo "❌ Cleanup aborted. Please update all imports before running this script."
    exit 1
fi

echo "✅ No remaining imports from old hooks directory found."

# List files that will be removed
echo "📋 Files that will be removed:"
find src/hooks -name "*.ts" -o -name "*.tsx" | head -20

# Ask for confirmation
read -p "🤔 Are you sure you want to remove all files from src/hooks/? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled."
    exit 0
fi

# Remove old hooks directory
echo "🗑️  Removing old hooks directory..."
rm -rf src/hooks

echo "✅ Cleanup completed successfully!"
echo "📝 Note: The src/hooks directory has been removed."
echo "🔄 If you need to restore any hooks, they can be found in their new locations:"
echo "   - Project hooks: src/features/project-management/hooks/"
echo "   - Customer hooks: src/features/customer-management/hooks/"
echo "   - Supplier hooks: src/features/supplier-management/hooks/"
echo "   - Auth hooks: src/core/auth/hooks/"
echo "   - Shared hooks: src/shared/hooks/"
