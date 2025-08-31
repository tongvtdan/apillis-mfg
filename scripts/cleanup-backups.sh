#!/bin/bash

# Factory Pulse Backup Cleanup Script
# This script removes old backup files, keeping only the latest set

set -e

# Configuration
BACKUP_DIR="backups"
PROJECT_NAME="factory_pulse"

echo "🧹 Factory Pulse Backup Cleanup"
echo "📁 Backup directory: $BACKUP_DIR"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory does not exist: $BACKUP_DIR"
    exit 1
fi

# Find all backup files for this project
backup_files=($(find "$BACKUP_DIR" -name "${PROJECT_NAME}_*_*.sql" -type f))

if [ ${#backup_files[@]} -eq 0 ]; then
    echo "✅ No backup files found to clean up."
    exit 0
fi

echo "📋 Found ${#backup_files[@]} backup files:"
for file in "${backup_files[@]}"; do
    echo "   - $(basename "$file")"
done

# Extract timestamps and find the latest
latest_timestamp=""
for file in "${backup_files[@]}"; do
    timestamp=$(echo "$file" | grep -o '[0-9]\{8\}_[0-9]\{6\}' | head -1)
    if [[ "$timestamp" > "$latest_timestamp" ]]; then
        latest_timestamp="$timestamp"
    fi
done

echo ""
echo "🕐 Latest backup timestamp: $latest_timestamp"

# Remove all backup files except the latest timestamp
removed_count=0
kept_files=()

for file in "${backup_files[@]}"; do
    file_timestamp=$(echo "$file" | grep -o '[0-9]\{8\}_[0-9]\{6\}' | head -1)
    if [[ "$file_timestamp" != "$latest_timestamp" ]]; then
        echo "🗑️  Removing: $(basename "$file")"
        rm "$file"
        removed_count=$((removed_count + 1))
    else
        kept_files+=("$file")
    fi
done

echo ""
if [ $removed_count -gt 0 ]; then
    echo "✅ Cleanup completed!"
    echo "   - Removed $removed_count old backup files"
    echo "   - Kept ${#kept_files[@]} files from latest backup set"
    echo ""
    echo "📁 Remaining backup files:"
    for file in "${kept_files[@]}"; do
        ls -la "$file"
    done
else
    echo "✅ No old backup files to remove."
    echo "   All files are from the latest backup set."
fi
