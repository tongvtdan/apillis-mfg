#!/bin/bash

# Factory Pulse Sample Data Import Script
# This script helps import sample data to Supabase

set -e

echo "🚀 Factory Pulse Sample Data Import Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "sample-data/sql-inserts.sql" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Available import methods:${NC}"
echo "1. SQL Script Import (Core tables)"
echo "2. JSON Data Import (Large datasets)"
echo "3. Combined Import (Recommended)"
echo "4. Check Database Schema"
echo "5. Reset Database (DANGEROUS!)"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo -e "${YELLOW}📥 Importing core tables via SQL script...${NC}"
        import_sql_data
        ;;
    2)
        echo -e "${YELLOW}📥 Importing JSON data...${NC}"
        import_json_data
        ;;
    3)
        echo -e "${YELLOW}📥 Running combined import...${NC}"
        import_sql_data
        import_json_data
        ;;
    4)
        echo -e "${YELLOW}🔍 Checking database schema...${NC}"
        check_schema
        ;;
    5)
        echo -e "${RED}⚠️  WARNING: This will reset your database!${NC}"
        read -p "Are you sure? Type 'YES' to confirm: " confirm
        if [ "$confirm" = "YES" ]; then
            reset_database
        else
            echo "Reset cancelled."
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Import process completed!${NC}"

# Function to import SQL data
import_sql_data() {
    echo -e "${BLUE}📊 Importing core tables...${NC}"
    
    # Get database connection details
    DB_URL=$(supabase db remote commit --dry-run 2>&1 | grep "postgresql://" | head -1 | sed 's/.*postgresql:\/\///')
    
    if [ -z "$DB_URL" ]; then
        echo -e "${RED}❌ Could not get database URL. Please check your Supabase link.${NC}"
        return 1
    fi
    
    echo "Database URL: $DB_URL"
    
    # Import the SQL script
    if [ -f "sample-data/sql-inserts.sql" ]; then
        echo -e "${YELLOW}📥 Importing organizations, users, contacts, projects...${NC}"
        # Note: You'll need to manually run this with your database client
        echo -e "${GREEN}✅ SQL script ready for import${NC}"
        echo -e "${BLUE}💡 To import, use:${NC}"
        echo "   psql \"$DB_URL\" -f sample-data/sql-inserts.sql"
        echo "   Or use your preferred database client (pgAdmin, DBeaver, etc.)"
    else
        echo -e "${RED}❌ SQL script not found${NC}"
    fi
}

# Function to import JSON data
import_json_data() {
    echo -e "${BLUE}📊 Importing JSON datasets...${NC}"
    
    # Check if we have the required tools
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  jq not found. Installing...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install jq
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get install jq
        else
            echo -e "${RED}❌ Please install jq manually${NC}"
            return 1
        fi
    fi
    
    # Create a temporary SQL file for JSON data
    TEMP_SQL="sample-data/temp_json_import.sql"
    echo "-- Temporary JSON Import SQL" > "$TEMP_SQL"
    
    # Process each JSON file
    for json_file in sample-data/*.json; do
        if [ -f "$json_file" ]; then
            filename=$(basename "$json_file" .json)
            echo -e "${YELLOW}📥 Processing $filename.json...${NC}"
            
            case $filename in
                "organizations"|"workflow-stages"|"users"|"contacts"|"projects")
                    echo -e "${GREEN}✅ $filename already covered in SQL script${NC}"
                    ;;
                "documents"|"reviews"|"messages"|"notifications"|"activity-log")
                    echo -e "${BLUE}📝 Converting $filename to SQL...${NC}"
                    convert_json_to_sql "$json_file" "$filename" >> "$TEMP_SQL"
                    ;;
            esac
        fi
    done
    
    echo -e "${GREEN}✅ JSON conversion completed${NC}"
    echo -e "${BLUE}💡 To import JSON data, use:${NC}"
    echo "   psql \"$DB_URL\" -f $TEMP_SQL"
}

# Function to convert JSON to SQL
convert_json_to_sql() {
    local json_file=$1
    local table_name=$2
    
    echo ""
    echo "-- Import data for $table_name table"
    echo "INSERT INTO $table_name (id, organization_id, project_id, title, description, status, created_at, updated_at) VALUES"
    
    # Use jq to process the JSON and create SQL
    jq -r --arg table "$table_name" '
        .[] | 
        "('\''" + .id + "'\'', '\''" + .organization_id + "'\'', " + 
        (if .project_id then "'\''" + .project_id + "'\''" else "NULL" end) + ", " +
        "'\''" + (.title // .name // "") + "'\'', " +
        "'\''" + (.description // "") + "'\'', " +
        "'\''" + (.status // "active") + "'\'', " +
        "'\''" + (.created_at // "2025-01-27T08:00:00.000Z") + "'\'', " +
        "'\''" + (.updated_at // "2025-01-27T08:00:00.000Z") + "'\'')"
    ' "$json_file" | sed 's/^/  /' | sed '$s/,$/;/'
}

# Function to check database schema
check_schema() {
    echo -e "${BLUE}🔍 Checking database schema...${NC}"
    
    # List tables
    echo -e "${YELLOW}📋 Available tables:${NC}"
    supabase db remote commit --dry-run 2>&1 | grep -E "CREATE TABLE|CREATE TABLE IF NOT EXISTS" || echo "No schema information available"
    
    echo -e "${BLUE}💡 To see full schema, use:${NC}"
    echo "   supabase db remote commit --dry-run"
}

# Function to reset database (DANGEROUS!)
reset_database() {
    echo -e "${RED}🚨 RESETTING DATABASE - ALL DATA WILL BE LOST!${NC}"
    
    read -p "This will delete ALL data. Type 'CONFIRM' to proceed: " final_confirm
    if [ "$final_confirm" = "CONFIRM" ]; then
        echo -e "${YELLOW}🗑️  Resetting database...${NC}"
        supabase db reset
        echo -e "${GREEN}✅ Database reset completed${NC}"
    else
        echo "Reset cancelled."
    fi
}

echo ""
echo -e "${GREEN}🎉 Import script completed!${NC}"
echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo "1. Review the generated SQL files"
echo "2. Import core tables using sql-inserts.sql"
echo "3. Import JSON data using the temporary SQL file"
echo "4. Verify data integrity in your Supabase dashboard"
echo ""
echo -e "${BLUE}🔗 Useful commands:${NC}"
echo "   supabase status                    # Check project status"
echo "   supabase db remote commit --dry-run  # View schema"
echo "   supabase db reset                  # Reset database (DANGEROUS!)"
