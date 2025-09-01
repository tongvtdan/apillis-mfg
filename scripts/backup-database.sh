#!/bin/bash

# Factory Pulse Database Backup Script
# This script creates comprehensive backups of the local Supabase database

set -e

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_NAME="factory_pulse"

# Function to clean up old backups (keep only the latest set)
cleanup_old_backups() {
    echo "🧹 Cleaning up old backup files..."
    
    # Find all backup files for this project
    local backup_files=($(find "$BACKUP_DIR" -name "${PROJECT_NAME}_*_*.sql" -type f))
    
    if [ ${#backup_files[@]} -eq 0 ]; then
        echo "   No existing backup files found."
        return
    fi
    
    # Extract timestamps and find the latest
    local latest_timestamp=""
    for file in "${backup_files[@]}"; do
        local timestamp=$(echo "$file" | grep -o '[0-9]\{8\}_[0-9]\{6\}' | head -1)
        if [[ "$timestamp" > "$latest_timestamp" ]]; then
            latest_timestamp="$timestamp"
        fi
    done
    
    # Remove all backup files except the latest timestamp
    local removed_count=0
    for file in "${backup_files[@]}"; do
        local file_timestamp=$(echo "$file" | grep -o '[0-9]\{8\}_[0-9]\{6\}' | head -1)
        if [[ "$file_timestamp" != "$latest_timestamp" ]]; then
            rm "$file"
            removed_count=$((removed_count + 1))
        fi
    done
    
    if [ $removed_count -gt 0 ]; then
        echo "   Removed $removed_count old backup files."
        echo "   Kept latest backup set: ${latest_timestamp}"
    else
        echo "   No old backup files to remove."
    fi
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting Factory Pulse database backup..."
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Backup directory: $BACKUP_DIR"

# Check if Supabase is running locally
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Error: Supabase is not running locally"
    echo "   Please start Supabase with: supabase start"
    exit 1
fi

echo "✅ Supabase is running locally"

# Create schema-only backup
echo "📋 Creating schema backup..."
supabase db dump --local --file "$BACKUP_DIR/${PROJECT_NAME}_schema_backup_${TIMESTAMP}.sql"

# Create data-only backup
echo "📊 Creating data backup..."
supabase db dump --local --data-only --file "$BACKUP_DIR/${PROJECT_NAME}_data_backup_${TIMESTAMP}.sql"

# Create complete backup (schema + data)
echo "💾 Creating complete backup..."
supabase db dump --local --file "$BACKUP_DIR/${PROJECT_NAME}_complete_backup_${TIMESTAMP}.sql"

# Clean up old backup files (keep only the latest set)
cleanup_old_backups

# List created backup files
echo ""
echo "✅ Backup completed successfully!"
echo "📁 Current backup files:"
find "$BACKUP_DIR" -name "${PROJECT_NAME}_*_*.sql" -exec ls -la {} \;

echo ""
echo "📊 Backup summary:"
echo "   - Schema backup: $BACKUP_DIR/${PROJECT_NAME}_schema_backup_${TIMESTAMP}.sql"
echo "   - Data backup: $BACKUP_DIR/${PROJECT_NAME}_data_backup_${TIMESTAMP}.sql"
echo "   - Complete backup: $BACKUP_DIR/${PROJECT_NAME}_complete_backup_${TIMESTAMP}.sql"
echo "   - Cleanup: Old backup files removed, keeping only latest set"

echo ""
echo "💡 To restore from backup:"
echo "   - Schema only: supabase db reset --local && psql -h 127.0.0.1 -p 54322 -U postgres -d postgres < $BACKUP_DIR/${PROJECT_NAME}_schema_backup_${TIMESTAMP}.sql"
echo "   - Complete restore: supabase db reset --local && psql -h 127.0.0.1 -p 54322 -U postgres -d postgres < $BACKUP_DIR/${PROJECT_NAME}_complete_backup_${TIMESTAMP}.sql"
